// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. CONFIGURACIÓN: SUBCOLECCIONES POR TIPO
// 3. FUNCIÓN AUXILIAR: RESOLUCIÓN DE SUBCOLECCIÓN
// 4. FUNCIÓN PRINCIPAL: ESCUCHA DE GUARDADOS EN TIEMPO REAL
// 5. FUNCIÓN PRINCIPAL: ALTERNAR ESTADO DE GUARDADO

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos las herramientas de Firebase Firestore necesarias para leer y escribir datos.
// - collection: Permite referenciar una "carpeta" (colección) entera en la base de datos.
// - deleteDoc: Permite eliminar un documento específico.
// - doc: Permite referenciar un archivo (documento) exacto dentro de una colección.
// - onSnapshot: Mantiene abierta una conexión en tiempo real que avisa cuando los datos cambian.
// - serverTimestamp: Permite registrar la hora exacta oficial de los servidores de Google.
// - setDoc: Permite crear o sobreescribir un documento en una ruta específica.
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// Importamos la instancia de la base de datos (db) configurada previamente en el proyecto.
import { db } from "./firebase";

// 2. CONFIGURACIÓN: SUBCOLECCIONES POR TIPO

// Se crea un objeto constante (un diccionario de clave-valor) que relaciona los nombres 
// lógicos que usamos en el código ("cancion", "publicacion", "producto") con los nombres 
// físicos reales de las subcolecciones que existen dentro de la cuenta del usuario en Firestore.
// 
// ¿Por qué usar un diccionario? 
// Porque centraliza la configuración. Si en el futuro decidimos cambiar el nombre de una carpeta 
// en la base de datos (por ejemplo, de "favoritos" a "cancionesFavoritas"), solo cambiamos el valor 
// en este objeto y todo el sistema se adapta automáticamente sin necesidad de reescribir funciones.
const SUBCOLECCION_POR_TIPO = {
  cancion: "favoritos",
  publicacion: "publicacionesGuardadas",
  producto: "productosFavoritos",
};

// 3. FUNCIÓN AUXILIAR: RESOLUCIÓN DE SUBCOLECCIÓN

// Propósito: Recibe un tipo de elemento lógico y devuelve el nombre real de su carpeta en Firestore.
// Parámetros: "tipo" (cadena de texto, por ejemplo: "producto").
// Proceso:
// - Busca en el diccionario SUBCOLECCION_POR_TIPO el valor asociado a la clave recibida.
// - Si el programador envió un tipo que no existe en el diccionario (ejemplo: "video"),
//   la variable "nombre" quedará como "undefined".
// - Si es indefinida, la función lanza un error (throw new Error) y detiene todo el programa. 
//   Esta validación estricta evita el peligro de crear "colecciones huérfanas" no deseadas 
//   en la base de datos por un error de tipeo.
// Retorno: El nombre validado de la subcolección como cadena de texto.
function nombreSubcoleccion(tipo) {
  const nombre = SUBCOLECCION_POR_TIPO[tipo];

  if (!nombre) {
    throw new Error(`Tipo de guardado desconocido: ${tipo}`);
  }

  return nombre;
}

// 4. FUNCIÓN PRINCIPAL: ESCUCHA DE GUARDADOS EN TIEMPO REAL

// Propósito: Conectar un componente de React (como un botón de corazón) a la lista 
// personal de guardados de un usuario para que se actualice en vivo sin recargar la página.
// Parámetros:
// - uid: Identificador único del usuario que inició sesión.
// - tipo: Qué categoría estamos buscando ("cancion", "publicacion", "producto").
// - callback: Función que ejecutaremos para enviarle a React los datos recibidos.
// - alError: Función opcional para manejar problemas (por defecto, muestra en consola).
export function escucharGuardados(uid, tipo, callback, alError = console.error) {
  
  // Barrera de seguridad inicial (Retorno Temprano):
  // Si no hay un usuario autenticado (!uid), no hay ninguna carpeta personal que escuchar.
  if (!uid) {
    // Le envía a la pantalla un array vacío [] porque un visitante anónimo no tiene favoritos.
    callback([]);
    // onSnapshot siempre debe devolver una función para "apagar" la escucha (desuscribirse).
    // Como acá no abrimos ninguna conexión, retornamos una función vacía de cortesía () => {}
    // para que React no produzca un error al intentar desuscribirse.
    return () => {};
  }

  // Si hay usuario, construimos la ruta anidada hacia su subcolección privada.
  // En Firestore esto equivale a la ruta: usuarios / [ID-Usuario] / [Nombre-Subcoleccion]
  const referencia = collection(db, "usuarios", uid, nombreSubcoleccion(tipo));

  // onSnapshot abre la conexión en esa ruta específica.
  return onSnapshot(
    referencia,
    (resultado) => {
      // Cada vez que un dato cambie en el servidor, Firebase ejecutará este bloque interno.
      // Recorremos la lista de documentos descargados (resultado.docs) utilizando .map().
      // No nos interesan los campos internos (ej. fecha), solo nos importa el nombre del archivo (ID),
      // que es el que coincide con el ID de la canción o producto guardado.
      // Extraemos ese ID, lo forzamos a texto con String() y ejecutamos el callback enviando el array final.
      callback(resultado.docs.map((documento) => String(documento.id)));
    },
    alError
  );
}

// 5. FUNCIÓN PRINCIPAL: ALTERNAR ESTADO DE GUARDADO

// Propósito: Toma la decisión lógica de guardar un elemento si no estaba guardado, 
// o eliminarlo de la lista si el usuario ya lo tenía guardado (como un interruptor on/off).
// Parámetros:
// - uid: Identificador único del usuario.
// - tipo: Categoría del elemento (ejemplo: "cancion").
// - id: El identificador único de ese elemento específico (ejemplo: "cancion-123").
// - yaGuardado: Booleano (true/false) que indica el estado actual visual del botón en pantalla.
export async function alternarGuardado(uid, tipo, id, yaGuardado) {
  
  // Barrera de seguridad: si un visitante anónimo modificó el código HTML de su navegador 
  // para hacer clic en el botón de guardar, la función lo intercepta y lanza un error.
  if (!uid) throw new Error("Tenés que iniciar sesión para guardar.");

  // Prepara la referencia exacta apuntando al documento específico del guardado.
  // Ruta final: usuarios / [ID-Usuario] / [Carpeta-Tipo] / [ID-Elemento]
  const referencia = doc(
    db,
    "usuarios",
    uid,
    nombreSubcoleccion(tipo),
    String(id)
  );

  // Evalúa la condición enviada por la interfaz:
  if (yaGuardado) {
    // Si la interfaz dice que ya estaba guardado (true), significa que el usuario 
    // hizo clic para desmarcarlo. 
    // Ejecuta deleteDoc enviando la referencia para borrar el archivo de Firestore.
    await deleteDoc(referencia);
  } else {
    // Si el elemento no estaba guardado (false), el usuario quiere agregarlo.
    // Ejecuta setDoc para crear un documento nuevo exactamente en esa referencia.
    // En el contenido del documento, anota la propiedad "creadoEn" pidiéndole 
    // a Firebase que le asigne la hora oficial del servidor.
    await setDoc(referencia, { creadoEn: serverTimestamp() });
  }
}