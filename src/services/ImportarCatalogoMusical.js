// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. ESTRUCTURA DE DATOS: CATÁLOGO LOCAL DE ORIGEN
// 3. FUNCIÓN INTERNA: IMPORTAR UNA COLECCIÓN ESPECÍFICA
// 4. PREVENCIÓN DE DUPLICADOS (FILTRADO PREVIO)
// 5. PROCESAMIENTO Y SUBIDA EN LOTES (BATCHES)
// 6. FUNCIÓN PRINCIPAL: IMPORTACIÓN COMPLETA DEL CATÁLOGO

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos las funciones necesarias de Firebase Firestore para la base de datos:
// - collection: Selecciona una "carpeta" completa de la base de datos.
// - doc: Permite apuntar a un archivo específico y asignarle un ID antes de guardarlo.
// - getDocs: Descarga todos los documentos de una colección (lectura).
// - writeBatch: Abre un "lote de escritura". Permite empaquetar múltiples guardados juntos.
// - serverTimestamp: Genera una marca de tiempo oficial del servidor de Google.
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

// Importamos la conexión oficial a nuestra base de datos (db).
import { db } from "./firebase";

// Importamos los archivos locales de nuestra computadora que contienen los datos por defecto.
// Estos archivos contienen arrays (listas) de objetos (canciones, álbumes, compositores y playlists)
// que queremos subir a internet la primera vez que configuramos el sitio.
import {
  songs,
  albums,
  composers,
  playlists,
} from "../data/musicData";

// 2. ESTRUCTURA DE DATOS: CATÁLOGO LOCAL DE ORIGEN

// Propósito: Crear un array centralizado llamado "catalogo" que agrupa las listas locales.
// Estructura: Es un array de objetos. Cada objeto tiene dos propiedades:
// - nombre: Un texto (String) con el nombre exacto de la carpeta de Firestore donde debe ir (ej: "canciones").
// - datos: El array importado desde arriba que contiene toda la información de ese grupo.
// 
// ¿Por qué usar esto? Para no tener que escribir 4 veces seguidas el mismo código de subida.
// En su lugar, luego haremos un ciclo que recorra este array y suba cada sección automáticamente.
const catalogo = [
  { nombre: "canciones", datos: songs },
  { nombre: "albumes", datos: albums },
  { nombre: "compositores", datos: composers },
  { nombre: "playlists", datos: playlists },
];

// 3. FUNCIÓN INTERNA: IMPORTAR UNA COLECCIÓN ESPECÍFICA

// Propósito: Toma una lista de elementos (ej: 100 canciones) y las sube a Firebase
// cuidando de NO sobrescribir (pisar) las canciones que ya existan en la base de datos.
// Parámetros:
// - nombre: El nombre en texto de la colección destino ("canciones", "albumes", etc.).
// - datos: El array completo con los elementos a subir.
// Retorno: Devuelve un objeto informando qué pasó (cuántos subió y cuántos ignoró).
async function importarColeccion(nombre, datos) {
  
  // 4. PREVENCIÓN DE DUPLICADOS (FILTRADO PREVIO)
  
  // Paso 1: Crea la referencia a la carpeta entera en Firebase.
  const referencia = collection(db, nombre);
  
  // Paso 2: Descarga TODO lo que ya esté guardado en esa carpeta.
  // Usamos "await" porque tiene que ir a internet y volver, lo cual demora tiempo.
  const existentes = await getDocs(referencia);

  // Paso 3: Extrae solamente los "id" (identificadores) de los documentos que ya existen en internet
  // y los guarda adentro de un "Set".
  // Un "Set" (Conjunto) es una estructura de datos nativa de JavaScript hiperveloz 
  // para verificar si un elemento existe o no. A diferencia de un array común, no acepta duplicados.
  const idsExistentes = new Set(
    existentes.docs.map((documento) => documento.id)
  );

  // Paso 4: Filtra el array local original ("datos").
  // El método .filter() devuelve una lista nueva conteniendo SOLAMENTE los elementos
  // que pasen la prueba matemática que le indiquemos.
  // 
  // La prueba es: !idsExistentes.has(String(item.id))
  // - String(item.id): Convierte el ID local a texto por las dudas.
  // - .has(): Le pregunta al Set si ese ID ya está en la lista de los que descargamos.
  // - "!": Invierte la respuesta. Si el Set dice "Sí, lo tengo" (true), el "!" lo vuelve "falso"
  //   y el método .filter() DESCARTA ese elemento, evitando subirlo y pisar el archivo de Firebase.
  const pendientes = datos.filter(
    (item) => !idsExistentes.has(String(item.id))
  );

  // Paso 5: Si después de filtrar comprobamos que la longitud del array "pendientes" es cero
  // (es decir, todos los elementos ya estaban en la base de datos), interrumpimos el proceso.
  if (pendientes.length === 0) {
    // Retorna de inmediato el reporte informando que no subió nada (0) y omitió todos (datos.length).
    return {
      coleccion: nombre,
      importados: 0,
      omitidos: datos.length,
    };
  }

  // Si llegamos acá, significa que hay por lo menos un elemento nuevo listo para subir.
  // Creamos una variable acumuladora que contará los éxitos.
  let importados = 0;

  // 5. PROCESAMIENTO Y SUBIDA EN LOTES (BATCHES)

  // IMPORTANTE SOBRE BATCHES (Lotes de escritura):
  // Firebase prohíbe técnicamente enviar un lote de más de 500 operaciones al mismo tiempo.
  // Si nuestro array "pendientes" tuviese 600 canciones, la operación explotaría.
  // Por eso utilizamos un "Ciclo for" con saltos matemáticos para cortar la lista en pedazos.
  
  // Condición de inicio: Arrancamos en el índice cero (i = 0).
  // Condición límite: Mientras "i" sea menor a la cantidad de pendientes.
  // Incremento: Terminada la vuelta, sumale 450 a "i" (i += 450).
  // 
  // EJEMPLO PRÁCTICO: Si hay 600 pendientes.
  // - Vuelta 1: i = 0.
  // - Vuelta 2: i = 450.
  // - Vuelta 3: Termina el ciclo porque 450 + 450 = 900, y 900 no es menor que 600.
  for (let i = 0; i < pendientes.length; i += 450) {
    
    // Abre una nueva "caja vacía" de envíos hacia Firebase (Lote).
    const lote = writeBatch(db);
    
    // Extrae un grupo (rebanada) del array de pendientes usando .slice().
    // - Inicio: El valor actual de "i".
    // - Fin: "i + 450".
    // En la Vuelta 1: Extrae de la posición 0 a la 450.
    // En la Vuelta 2: Extrae de la posición 450 a la 900 (o hasta donde llegue si hay menos).
    const grupo = pendientes.slice(i, i + 450);

    // Recorre todos los elementos adentro de esta rebanada usando forEach.
    // Durante el recorrido, desestructura el objeto actual: le saca el "id", 
    // y mete el resto de sus propiedades dentro de la constante "datosDocumento".
    grupo.forEach(({ id, ...datosDocumento }) => {
      
      // Crea una referencia apuntando a la base de datos, en la carpeta que nos pasaron, 
      // usando el ID específico como texto puro (String).
      const documento = doc(db, nombre, String(id));

      // Empaqueta las instrucciones adentro del Lote.
      // Le dice al lote: "Configurá (set) en esta referencia todos estos datos".
      // También le inyecta las marcas de tiempo oficiales del servidor (fechaCreacion y fechaActualizacion).
      lote.set(documento, {
        ...datosDocumento,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      });
    });

    // Envía el paquete completo (caja cerrada) de 450 instrucciones a Firebase de un solo golpe.
    // Es asíncrono (await) para esperar a que internet nos confirme que todo llegó bien 
    // antes de arrancar a armar la caja número 2.
    await lote.commit();
    
    // Le suma la cantidad de la rebanada que acabamos de enviar (ej: 450) al contador global de éxitos.
    importados += grupo.length;
  }

  // Una vez terminado todo el ciclo de particiones (todo se subió),
  // devuelve el objeto con el reporte final informando colección, cuántos subió y cuántos ignoró.
  return {
    coleccion: nombre,
    importados,
    omitidos: datos.length - importados,
  };
}

// 6. FUNCIÓN PRINCIPAL: IMPORTACIÓN COMPLETA DEL CATÁLOGO

// Propósito: Es la función que llamará la página de Administrador cuando alguien presione el botón de "Importar".
// Se encargará de recorrer nuestro diccionario maestro "catalogo" procesando categoría por categoría.
export async function importarCatalogoMusical() {
  
  // Creamos un array vacío donde iremos guardando los reportes (objetos de resultado) de cada colección.
  const resultados = [];

  // Iniciamos un bucle "for...of".
  // Este bucle recorre el array global "catalogo". En cada vuelta, "grupo" representará temporalmente 
  // al objeto actual (ej: {nombre: "canciones", datos: songs}).
  // 
  // ¿Por qué "for...of" en lugar del clásico ".forEach"?
  // Porque adentro ejecutamos funciones asíncronas con "await".
  // .forEach NO sabe esperar; si lo usáramos, dispararía todas las subidas juntas descontrolando todo.
  // "for...of" es un bucle pausado: ejecuta, ESPERA que termine, y recién ahí avanza al segundo elemento.
  for (const grupo of catalogo) {
    
    // Llama a la función interna que programamos antes, pasándole el nombre de la carpeta y sus datos masivos.
    const resultado = await importarColeccion(
      grupo.nombre,
      grupo.datos
    );

    // Cuando terminó y Firebase confirmó, toma el reporte ("resultado") 
    // y lo empuja adentro de nuestro array de reportes acumulados.
    resultados.push(resultado);
  }

  // Devuelve la lista completa de reportes hacia la pantalla, 
  // para que React pueda mostrar un mensaje como: 
  // "Canciones: 5 subidas, 2 omitidas. Álbumes: 0 subidos, 3 omitidos".
  return resultados;
}