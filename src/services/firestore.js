import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { db, storage } from "./firebase";

// ======================================================
// COLECCIONES PRINCIPALES DE WIKICRAFT
// ======================================================

export const COLECCIONES = {
  usuarios: "usuarios",
  versiones: "versiones",
  productos: "productos",
  banners: "banners",
  pedidos: "pedidos",
  publicaciones: "publicaciones",
  denuncias: "denuncias",
  canciones: "canciones",
  albumes: "albumes",
  compositores: "compositores",
  playlists: "playlists",
};

// ======================================================
// OPERACIONES GENERALES DE FIRESTORE
// ======================================================

// Obtiene un documento por su colección e ID.
export async function obtenerDocumento(nombreColeccion, id) {
  const referencia = doc(db, nombreColeccion, String(id));
  const resultado = await getDoc(referencia);

  return resultado.exists()
    ? { id: resultado.id, ...resultado.data() }
    : null;
}

// Obtiene documentos y permite combinar filtro y ordenamiento.
export async function obtenerDocumentos(nombreColeccion, opciones = {}) {
  const referencia = collection(db, nombreColeccion);
  const condiciones = [];

  if (opciones.filtro) {
    const { campo, operador = "==", valor } = opciones.filtro;
    condiciones.push(where(campo, operador, valor));
  }

  if (opciones.campoOrden) {
    condiciones.push(
      orderBy(opciones.campoOrden, opciones.direccion || "asc")
    );
  }

  const consulta = condiciones.length
    ? query(referencia, ...condiciones)
    : referencia;

  const resultado = await getDocs(consulta);

  return resultado.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

// Crea un documento.
// Si recibe un ID, lo utiliza; de lo contrario, Firestore genera uno.
export async function crearDocumento(nombreColeccion, datos, id = null) {
  const datosGuardados = {
    ...datos,
    fechaCreacion: datos.fechaCreacion || serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  };

  if (id !== null) {
    await setDoc(doc(db, nombreColeccion, String(id)), datosGuardados);
    return String(id);
  }

  const resultado = await addDoc(
    collection(db, nombreColeccion),
    datosGuardados
  );

  return resultado.id;
}

// Actualiza un documento existente.
export async function actualizarDocumento(nombreColeccion, id, cambios) {
  await updateDoc(doc(db, nombreColeccion, String(id)), {
    ...cambios,
    fechaActualizacion: serverTimestamp(),
  });
}

// Elimina un documento.
export async function eliminarDocumento(nombreColeccion, id) {
  await deleteDoc(doc(db, nombreColeccion, String(id)));
}

// Escucha una colección y permite aplicar filtros y ordenamiento.
export function escucharDocumentos(
  nombreColeccion,
  callback,
  opciones = {},
  alError = console.error
) {
  const referencia = collection(db, nombreColeccion);
  const condiciones = [];

  if (opciones.filtro) {
    const { campo, operador = "==", valor } = opciones.filtro;
    condiciones.push(where(campo, operador, valor));
  }

  if (opciones.campoOrden) {
    condiciones.push(
      orderBy(opciones.campoOrden, opciones.direccion || "asc")
    );
  }

  const consulta = condiciones.length
    ? query(referencia, ...condiciones)
    : referencia;

  return onSnapshot(
    consulta,
    (resultado) => {
      callback(
        resultado.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
      );
    },
    alError
  );
}

// ======================================================
// PERFIL DE USUARIO
// ======================================================

// Crea el perfil si no existe.
// El rol inicial siempre será "usuario".
export async function crearPerfilUsuario(usuario, datosAdicionales = {}) {
  if (!usuario?.uid) {
    throw new Error("No hay un usuario autenticado.");
  }

  const referencia = doc(db, COLECCIONES.usuarios, usuario.uid);
  const existente = await getDoc(referencia);

  if (existente.exists()) {
    return {
      uid: existente.id,
      ...existente.data(),
    };
  }

  const perfil = {
    ...datosAdicionales,
    uid: usuario.uid,
    email: usuario.email || "",
    nombreUsuario:
      datosAdicionales.nombreUsuario ||
      usuario.email?.split("@")[0] ||
      "Usuario",
    fotoPerfil: usuario.photoURL || "",
    biografia: datosAdicionales.biografia || "",
    rol: "usuario",
    fechaRegistro: serverTimestamp(),
  };

  await setDoc(referencia, perfil);

  return perfil;
}

// ======================================================
// ARCHIVOS: FIREBASE STORAGE
// ======================================================

// Sube un archivo y devuelve su URL de descarga.
export async function subirArchivo(ruta, archivo) {
  if (!archivo) return "";

  const referencia = ref(
    storage,
    `${ruta}/${Date.now()}-${archivo.name}`
  );

  const resultado = await uploadBytes(referencia, archivo);

  return getDownloadURL(resultado.ref);
}

// Elimina un archivo de Storage a partir de su URL.
export async function eliminarArchivo(url) {
  if (!url) return;

  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    if (error.code !== "storage/object-not-found") {
      throw error;
    }
  }
}

// ======================================================
// ESCUCHAS EN TIEMPO REAL
// ======================================================

// Escucha un único documento.
// Devuelve null si el documento no existe.
export function escucharDocumento(
  nombreColeccion,
  id,
  callback,
  alError = console.error
) {
  return onSnapshot(
    doc(db, nombreColeccion, String(id)),
    (resultado) => {
      callback(
        resultado.exists()
          ? { id: resultado.id, ...resultado.data() }
          : null
      );
    },
    alError
  );
}

// Escucha documentos cuyo campo coincida con un valor.
export function escucharPorCampo(
  nombreColeccion,
  campo,
  valor,
  callback,
  alError = console.error
) {
  const consulta = query(
    collection(db, nombreColeccion),
    where(campo, "==", valor)
  );

  return onSnapshot(
    consulta,
    (resultado) => {
      callback(
        resultado.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }))
      );
    },
    alError
  );
}

// ======================================================
// IMPORTACIÓN DE DOCUMENTOS
// ======================================================

// Importa varios documentos en una sola operación.
// Cada elemento debe incluir un ID.
export async function importarDocumentos(nombreColeccion, items) {
  const lote = writeBatch(db);

  items.forEach(({ id, ...datos }) => {
    lote.set(doc(db, nombreColeccion, String(id)), {
      ...datos,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });
  });

  await lote.commit();
}

// ======================================================
// OPERACIONES CON ARRAYS
// ======================================================

// Agrega o quita un valor de un array.
// Útil para favoritos y otras listas simples.
export async function alternarEnArray(
  nombreColeccion,
  id,
  campo,
  valor,
  agregar
) {
  await updateDoc(doc(db, nombreColeccion, String(id)), {
    [campo]: agregar ? arrayUnion(valor) : arrayRemove(valor),
    fechaActualizacion: serverTimestamp(),
  });
}