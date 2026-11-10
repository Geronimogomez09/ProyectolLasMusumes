// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. CONSTANTES DE CONFIGURACIÓN Y DATOS INICIALES
// 3. FUNCIÓN AUXILIAR: ORDENAMIENTO DE ELEMENTOS
// 4. OPERACIONES DE BASE DE DATOS: ESCUCHA EN TIEMPO REAL
// 5. OPERACIONES DE BASE DE DATOS: GUARDAR O ACTUALIZAR
// 6. OPERACIONES DE BASE DE DATOS: ELIMINACIÓN
// 7. IMPORTACIÓN EN LOTE: CARGA DE CONTENIDO INICIAL
// 8. FUNCIONES AUXILIARES PARA NOVEDADES (FECHAS, TEXTOS E IMÁGENES)
// 9. CONSULTAS ESPECÍFICAS DE NOVEDADES (COMUNIDAD Y VERSIONES)
// 10. CONSULTAS ESPECÍFICAS DE NOVEDADES (TIENDA Y MÚSICA)
// 11. FUNCIÓN PRINCIPAL: CARGAR TODAS LAS NOVEDADES SIMULTÁNEAMENTE

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos todas las herramientas necesarias de Firebase Firestore para interactuar con la base de datos.
// - addDoc: Agrega un documento nuevo con un ID aleatorio.
// - collection: Apunta a un grupo completo de documentos (carpeta).
// - deleteDoc: Elimina un documento.
// - doc: Apunta a un documento específico.
// - getDoc / getDocs: Descargan datos una sola vez.
// - limit: Restringe la cantidad de resultados que nos trae Firebase.
// - onSnapshot: Mantiene una conexión abierta para escuchar cambios en tiempo real.
// - orderBy: Ordena los resultados directamente en el servidor.
// - query: Permite armar una consulta con condiciones específicas.
// - serverTimestamp: Pide la hora oficial de los servidores de Google.
// - updateDoc: Modifica propiedades específicas de un documento existente.
// - where: Aplica filtros (ejemplo: traer solo los que estén "activos").
// - writeBatch: Permite ejecutar múltiples operaciones de guardado al mismo tiempo como un solo bloque.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

// Importamos la conexión oficial a nuestra base de datos (db).
import { db } from "./firebase";

// 2. CONSTANTES DE CONFIGURACIÓN Y DATOS INICIALES

// Se define en qué colección (carpeta de Firestore) se van a guardar los elementos de la página de Inicio.
export const COLECCION_INICIO = "inicio";

// Array que define estrictamente qué tipos de elementos permite este sistema.
// Evita que por error se guarde información basura o con tipos inexistentes en la base de datos.
const TIPOS_VALIDOS = ["seccion", "construccion"];

// Se declara un objeto congelado que contiene los datos por defecto (secciones y construcciones).
// Esto se utiliza únicamente si la base de datos está vacía y el administrador pulsa 
// el botón de "Cargar contenido inicial". No se lee directamente para mostrar en pantalla,
// la pantalla siempre lee desde Firestore.
export const CONTENIDO_INICIAL = {
  // Array de objetos que representan las tarjetas principales de navegación del inicio.
  secciones: [
    {
      id: "seccion-comunidad",
      titulo: "Comunidad",
      descripcion: "Conocé a otros jugadores, compartí tus ideas, mostrá tus construcciones y participá en eventos.",
      imagen: "comunidad.png",
      enlace: "/comunidad",
      icono: "dirt.png",
    },
    {
      id: "seccion-versiones",
      titulo: "Versiones",
      descripcion: "Reviví la historia de Minecraft, explorá cada versión y descubrí todo lo que cambió con el tiempo.",
      imagen: "versiones.png",
      enlace: "/versiones",
      icono: "brush.png",
    },
    {
      id: "seccion-musica",
      titulo: "Música",
      descripcion: "Disfrutá de las mejores bandas sonoras, listas y música creada por la comunidad.",
      imagen: "musica-2.jpg",
      enlace: "/musica",
      icono: "note_block.png",
    },
  ],

  // Array de objetos que representan la galería de construcciones destacadas.
  construcciones: [
    { id: "construccion-castillo", nombre: "Castillo medieval", imagen: "castillo.png" },
    { id: "construccion-casa", nombre: "Casa moderna", imagen: "casamoderna.jpg" },
    { id: "construccion-portal", nombre: "Portal del Nether", imagen: "portal.jpg" },
  ],
};

// 3. FUNCIÓN AUXILIAR: ORDENAMIENTO DE ELEMENTOS

// 1. Propósito: Función matemática que le enseña al método .sort() cómo ordenar una lista de elementos.
// 2. Parámetros: Recibe "a" y "b", que son dos documentos cualquiera de la lista que se están comparando.
// 3. Proceso:
//    - Intenta convertir la propiedad "orden" de ambos elementos a un número real usando Number().
//    - Si la propiedad no existe o no es un número válido, el operador "|| 0" la convierte en cero.
//    - Resta el valor de "a" menos el valor de "b".
// 4. Retorno:
//    - Si da un número negativo (ej: a tiene 1, b tiene 2 -> 1 - 2 = -1), significa que "a" va antes.
//    - Si da un número positivo, "b" va antes.
//    - Si da 0, mantienen su posición relativa.
function porOrden(a, b) {
  return (Number(a.orden) || 0) - (Number(b.orden) || 0);
}

// 4. OPERACIONES DE BASE DE DATOS: ESCUCHA EN TIEMPO REAL

// Mantiene la pantalla principal conectada y actualizada si alguien edita el contenido del inicio.
// El componente de React enviará su función "callback" para recibir los datos transformados.
export function escucharContenidoInicio(callback, alError = console.error) {
  return onSnapshot(
    collection(db, COLECCION_INICIO),
    (resultado) => {
      // 1. Mapeo: Recorre los documentos crudos de Firebase, extrae la información (.data())
      // y le pega adentro el ID del documento, todo en un objeto nuevo.
      // 2. Ordenamiento: Usa la función porOrden que explicamos arriba para acomodar la lista.
      const items = resultado.docs
        .map((documento) => ({ ...documento.data(), id: documento.id }))
        .sort(porOrden);

      // En lugar de devolver una lista gigante y mezclada, devuelve un objeto empaquetado.
      // Usa .filter() para separar la lista general en dos listas chicas:
      // una exclusivamente para las secciones y otra exclusivamente para las construcciones.
      // Así, React las dibuja fácilmente en partes distintas de la pantalla sin volver a procesarlas.
      callback({
        secciones: items.filter((item) => item.tipo === "seccion"),
        construcciones: items.filter((item) => item.tipo === "construccion"),
      });
    },
    alError
  );
}

// 5. OPERACIONES DE BASE DE DATOS: GUARDAR O ACTUALIZAR

// 1. Propósito: Función multipropósito del administrador para crear un elemento nuevo o editar uno viejo.
// 2. Parámetros:
//    - tipo: "seccion" o "construccion".
//    - id: El identificador. Si se envía null, se creará uno nuevo.
//    - datos: La información del formulario (título, descripción, imagen).
export async function guardarContenidoInicio(tipo, id, datos) {
  
  // Validación de seguridad: Comprueba si el tipo enviado está dentro de nuestra lista permitida.
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new Error(`Tipo de contenido desconocido: ${tipo}`);
  }

  // Clona los datos para manipularlos libremente en la variable "limpio" sin alterar el original.
  const limpio = { ...datos };
  
  // El comando "delete" destruye estas propiedades si es que existían en el objeto.
  // ¿Por qué? Porque estas propiedades no las debe decidir el usuario desde un formulario, 
  // las debe manejar estrictamente el sistema para que no haya hackeos o errores de fechas.
  delete limpio.id;
  delete limpio.fechaCreacion;
  delete limpio.fechaActualizacion;

  // CASO A: Es una creación (No hay ID previo).
  if (id === null || id === undefined) {
    // addDoc pide a Firebase que invente un ID y guarde los datos.
    await addDoc(collection(db, COLECCION_INICIO), {
      ...limpio, // Desparrama las propiedades limpias.
      tipo,      // Inserta el tipo verificado.
      
      // Usa Date.now() (milisegundos actuales) como su número de "orden".
      // Al ser un número gigantesco y siempre creciente, asegura que el nuevo elemento 
      // aparezca automáticamente al FINAL de la lista.
      orden: Date.now(), 
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });
    return;
  }

  // CASO B: Es una edición (El ID existe).
  // updateDoc ubica el documento específico y le sobreescribe únicamente 
  // la información nueva. Mantiene intacto el "orden" original y la "fechaCreacion".
  await updateDoc(doc(db, COLECCION_INICIO, String(id)), {
    ...limpio,
    tipo,
    fechaActualizacion: serverTimestamp(),
  });
}

// 6. OPERACIONES DE BASE DE DATOS: ELIMINACIÓN

// Borra definitivamente un elemento de la página de inicio en la base de datos.
export async function eliminarContenidoInicio(id) {
  await deleteDoc(doc(db, COLECCION_INICIO, String(id)));
}

// 7. IMPORTACIÓN EN LOTE: CARGA DE CONTENIDO INICIAL

// 1. Propósito: Poblar la base de datos en blanco usando la constante CONTENIDO_INICIAL.
// No sobreescribe; si detecta que un elemento ya existía, se lo saltea (lo omite).
export async function cargarContenidoInicialInicio() {
  
  // Consulta a Firebase para ver qué hay actualmente guardado en la carpeta "inicio".
  const existentes = await getDocs(collection(db, COLECCION_INICIO));
  
  // Crea un objeto tipo "Set". Un Set es una lista ultra rápida en JavaScript
  // que solo admite valores únicos. Aquí guardamos todos los IDs que ya existen en internet
  // para verificar velozmente luego si un elemento es viejo o nuevo.
  const idsExistentes = new Set(existentes.docs.map((documento) => documento.id));

  // Crea una matriz nueva (items) juntando todas las secciones y las construcciones 
  // que teníamos definidas estáticamente al principio de este archivo.
  // Además de juntarlas, utiliza .map() para inyectarles por la fuerza 
  // el campo "tipo" y calcularles un "orden" secuencial basado en su índice (0+1, 1+1, etc.).
  const items = [
    ...CONTENIDO_INICIAL.secciones.map((item, indice) => ({
      ...item,
      tipo: "seccion",
      orden: indice + 1,
    })),
    ...CONTENIDO_INICIAL.construcciones.map((item, indice) => ({
      ...item,
      tipo: "construccion",
      orden: indice + 1,
    })),
  ];

  // Inicia un Lote (Batch) de escritura segura en Firestore.
  const lote = writeBatch(db);
  let importados = 0;
  let omitidos = 0;

  // Recorre toda la matriz de items armados.
  items.forEach(({ id, ...datos }) => {
    
    // Evalúa nuestra lista rápida "Set". Si el ID del elemento local ya figura allá,
    // suma 1 al contador de omitidos e interrumpe esta vuelta del ciclo con "return"
    // para pasar directamente a evaluar el siguiente elemento.
    if (idsExistentes.has(String(id))) {
      omitidos += 1;
      return;
    }

    // Si es nuevo, lo programa en el lote de escritura con sus marcas de tiempo.
    lote.set(doc(db, COLECCION_INICIO, String(id)), {
      ...datos,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });
    importados += 1; // Suma 1 a los éxitos.
  });

  // Si después del recorrido por lo menos un elemento era nuevo y se programó,
  // envía el lote de escritura oficial a internet.
  if (importados > 0) {
    await lote.commit();
  }

  // Devuelve el reporte de lo que sucedió para que la pantalla pueda mostrar un resumen.
  return { importados, omitidos };
}

// 8. FUNCIONES AUXILIARES PARA NOVEDADES (FECHAS, TEXTOS E IMÁGENES)

// Propósito: Recibe una fecha de Firebase (Timestamp), un texto ("2026-06-16") 
// o un objeto Date, y devuelve un texto hermoso y estándar como "16 jun 2026".
function fechaLegible(valor) {
  if (!valor) return "";

  let fecha;

  // Condición A: ¿Es un Timestamp de Firestore? (Tiene el método interno .toDate).
  if (valor.toDate) {
    fecha = valor.toDate();
  } 
  // Condición B: ¿Es un texto literal escrito a mano en formato "YYYY-MM-DD"?
  // Utiliza una expresión regular (Regex) /^\d{4}-\d{2}-\d{2}$/ para verificar el patrón exacto.
  else if (typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    // Lo parte por los guiones convirtiendo los pedazos en números.
    const [anio, mes, dia] = valor.split("-").map(Number);
    // En JavaScript, los meses arrancan desde el 0 (Enero = 0). 
    // Por eso resta 1 al mes escrito (Ej: Jun = 6 -> pasa a 5).
    fecha = new Date(anio, mes - 1, dia);
  } 
  // Condición C: Es un número milisegundo o un texto Date estándar de JS.
  else {
    fecha = new Date(valor);
  }

  // Seguridad: Comprueba si el objeto Fecha resultó ser inválido matemáticamente.
  if (Number.isNaN(fecha.getTime())) return "";

  // Convierte el objeto fecha a texto utilizando las reglas de localización de Argentina ("es-AR").
  // .replace(/\./g, "") borra posibles puntos generados por el idioma en abreviaturas (ej: "jun." a "jun").
  return fecha
    .toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
    .replace(/\./g, "");
}

// Propósito: Toma un texto gigante (como la descripción de una versión)
// y lo corta limpiamente para que no rompa el diseño visual de la tarjeta de novedad.
// Si lo corta, le pega un símbolo de puntos suspensivos "…".
function recortar(texto, maximo) {
  const limpio = typeof texto === "string" ? texto.trim() : "";
  // .slice(0, maximo) se queda desde la posición 0 hasta el límite pedido.
  return limpio.length > maximo ? `${limpio.slice(0, maximo).trim()}…` : limpio;
}

// Propósito: Adaptar rutas de imágenes que fueron guardadas con rutas relativas de desarrollo
// para que funcionen bien en el sitio real (quitando el "../public/").
function imagenLista(valor) {
  const texto = typeof valor === "string" ? valor.trim() : "";
  // Si la ruta inicia con "../public/", usa .slice para borrar esa cantidad de letras 
  // y reemplaza el inicio por una simple barra "/" que representa la raíz del sitio final.
  return texto.startsWith("../public/") ? `/${texto.slice("../public/".length)}` : texto;
}

// 9. CONSULTAS ESPECÍFICAS DE NOVEDADES (COMUNIDAD Y VERSIONES)

// Propósito: Encuentra y formatea automáticamente la ultimísima publicación de la comunidad.
// Es asíncrono porque tiene que conectarse con la base de datos.
async function novedadComunidad() {
  
  // Utiliza limit(1) junto con orderBy "desc" (descendente) para traer SOLAMENTE 
  // la primera publicación más reciente, ahorrando datos de internet.
  const resultado = await getDocs(
    query(collection(db, "publicaciones"), orderBy("fechaCreacion", "desc"), limit(1))
  );

  // Si la carpeta de publicaciones estaba vacía, aborta la operación silenciosamente.
  if (resultado.empty) return null;

  // Extrae el único documento que llegó (posición 0 del array docs).
  const documento = resultado.docs[0];
  const publicacion = documento.data();

  // Construye y retorna el objeto con la estructura estandarizada que 
  // espera la pantalla de Novedades.
  return {
    id: `comunidad-${documento.id}`, // Crea un ID compuesto falso para React.
    tipo: "Comunidad",
    titulo: recortar(publicacion.contenido, 60) || "Nueva publicación",
    descripcion: publicacion.categoria ? `Categoría: ${publicacion.categoria}` : "",
    fecha: fechaLegible(publicacion.fechaCreacion), // Llama a nuestra función auxiliar matemática.
    autor: publicacion.autorNombre || "",
    imagen: imagenLista(publicacion.imagen),
    enlace: `/publicacion/${documento.id}`, // Genera el enlace directo a ese post.
  };
}

// Igual que la novedad anterior, pero consulta la tabla de la Historia/Versiones del juego,
// trayendo también solamente la última versión (limit 1).
async function novedadVersiones() {
  const resultado = await getDocs(
    query(collection(db, "versiones"), orderBy("fecha", "desc"), limit(1))
  );

  if (resultado.empty) return null;

  const documento = resultado.docs[0];
  const version = documento.data();

  return {
    id: `versiones-${documento.id}`,
    tipo: "Versiones",
    titulo: `${version.numero || ""} · ${version.nombre || "Nueva versión"}`.trim(),
    descripcion: recortar(version.descripcion, 110),
    fecha: fechaLegible(version.fecha),
    autor: "",
    imagen: imagenLista(version.imagen),
    enlace: "/versiones",
  };
}

// 10. CONSULTAS ESPECÍFICAS DE NOVEDADES (TIENDA Y MÚSICA)

// Trae un producto de la tienda para mostrarlo en las novedades.
// Aclaración importante: A diferencia de las otras tablas, los productos no tienen 
// una propiedad de fecha de creación. Por ende, no podemos usar "orderBy fecha".
// Simplemente filtra buscando uno que esté "activo" al azar usando limit(1).
async function novedadTienda() {
  const resultado = await getDocs(
    query(collection(db, "productos"), where("estado", "==", "activo"), limit(1))
  );

  if (resultado.empty) return null;

  const documento = resultado.docs[0];
  const producto = documento.data();

  return {
    id: `tienda-${documento.id}`,
    tipo: "Tienda",
    titulo: producto.nombre || "Producto de la tienda",
    descripcion: recortar(producto.descripcion, 110),
    fecha: "", // Como explicamos arriba, queda vacía de forma deliberada.
    autor: "",
    imagen: imagenLista(producto.imagen),
    // En la Tienda, el producto específico se abre usando un "hash" en la URL web (#producto=ID).
    enlace: `/tienda#producto=${documento.id}`,
  };
}

// Busca la última canción agregada al sistema musical.
async function novedadMusica() {
  
  // Pide a Firestore las 10 últimas canciones.
  // ¿Por qué no limit(1) como los demás? Porque necesitamos descartar las canciones 
  // que estén marcadas como "borradores" (draft) o que estén desactivadas.
  // Si pedimos 1 sola y resultaba ser borrador, nos quedábamos sin novedad.
  const resultado = await getDocs(
    query(collection(db, "canciones"), orderBy("fechaCreacion", "desc"), limit(10))
  );

  // Recorre esas 10 canciones buscando la primera que cumpla con los requisitos.
  const documento = resultado.docs.find((item) => {
    const cancion = item.data();
    // Revisa ambos sistemas de estatus (el antiguo y el nuevo).
    const status = cancion.status ?? (cancion.published === false ? "draft" : "published");
    return status === "published" && cancion.activo !== false;
  });

  // Si ninguna de las 10 estaba activa o publicada, cancela.
  if (!documento) return null;

  const cancion = documento.data();

  // Ahora, como las canciones en Firebase solo guardan el "composerId" (un número) 
  // pero en pantalla necesitamos el nombre real del compositor (ej: "C418"), 
  // realizamos una segunda consulta rápida para ir a buscar su nombre.
  let nombreCompositor = "";

  try {
    if (cancion.composerId) {
      const compositor = await getDoc(doc(db, "compositores", String(cancion.composerId)));
      // Si el compositor existe en la base de datos, guardamos su nombre.
      nombreCompositor = compositor.exists() ? compositor.data().name || "" : "";
    }
  } catch (error) {
    // Si la lectura del compositor falla, lo informamos pero NO interrumpimos la novedad entera.
    // Simplemente saldrá sin el nombre.
    console.error("No se pudo leer el compositor de la novedad:", error);
  }

  return {
    id: `musica-${documento.id}`,
    tipo: "Música",
    titulo: cancion.title || "Nueva canción",
    descripcion: nombreCompositor ? `Compositor: ${nombreCompositor}` : "",
    fecha: fechaLegible(cancion.fechaCreacion),
    autor: "",
    imagen: imagenLista(cancion.cover),
    enlace: `/musica/cancion/${documento.id}`,
  };
}

// 11. FUNCIÓN PRINCIPAL: CARGAR TODAS LAS NOVEDADES SIMULTÁNEAMENTE

// Esta función es la que finalmente ejecutará React al cargar la página de Inicio.
export async function cargarNovedadesInicio() {
  
  // Promise.allSettled dispara las 4 peticiones a internet (Comunidad, Versiones, Tienda, Música) 
  // exactamente AL MISMO TIEMPO (en paralelo).
  // La ventaja de allSettled sobre el Promise.all común, es que si una de las 4 consultas falla 
  // (por un error del servidor), allSettled no cancela a las demás. Las tres exitosas sobrevivirán.
  const resultados = await Promise.allSettled([
    novedadComunidad(),
    novedadVersiones(),
    novedadTienda(),
    novedadMusica(),
  ]);

  return resultados
    // Mapea la respuesta compleja de allSettled para dejar solo la información útil.
    .map((resultado) => {
      // Si el estado es "rejected" (rechazado, es decir, un error catastrófico de red):
      if (resultado.status === "rejected") {
        console.error("No se pudo cargar una novedad del inicio:", resultado.reason);
        // Devuelve "null" para indicar que este lugar de la novedad quedó vacío.
        return null; 
      }
      // Si fue "fulfilled" (exitoso), extrae el valor real contenido adentro del paquete.
      return resultado.value;
    })
    // El .filter(Boolean) es un truco maestro de JavaScript. 
    // Repasa todo el array y ELIMINA por completo a todos los que hayan devuelto "null", "undefined", 
    // "false" o vacío. De esa manera, si una novedad falló, simplemente desaparece de la lista 
    // y el sitio sigue funcionando con las otras tres que sí llegaron.
    .filter(Boolean);
}