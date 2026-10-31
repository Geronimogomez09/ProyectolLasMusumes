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

// Colecciones principales de WikiCraft.
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

// ------------------------- OPERACIONES GENERALES -------------------------

export async function obtenerDocumento(nombreColeccion, id) {
  const referencia = doc(db, nombreColeccion, String(id));
  const resultado = await getDoc(referencia);
  return resultado.exists() ? { id: resultado.id, ...resultado.data() } : null;
}

export async function obtenerDocumentos(nombreColeccion, opciones = {}) {
  const referencia = collection(db, nombreColeccion);
  let consulta = referencia;

  if (opciones.campoOrden) {
    consulta = query(referencia, orderBy(opciones.campoOrden, opciones.direccion || "asc"));
  }

  if (opciones.filtro) {
    const { campo, operador = "==", valor } = opciones.filtro;
    consulta = query(referencia, where(campo, operador, valor));
  }

  const resultado = await getDocs(consulta);
  return resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}

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

  const resultado = await addDoc(collection(db, nombreColeccion), datosGuardados);
  return resultado.id;
}

export async function actualizarDocumento(nombreColeccion, id, cambios) {
  await updateDoc(doc(db, nombreColeccion, String(id)), {
    ...cambios,
    fechaActualizacion: serverTimestamp(),
  });
}

export async function eliminarDocumento(nombreColeccion, id) {
  await deleteDoc(doc(db, nombreColeccion, String(id)));
}

export function escucharDocumentos(nombreColeccion, callback, opciones = {}, alError = console.error) {
  const referencia = collection(db, nombreColeccion);
  const consulta = opciones.campoOrden
    ? query(referencia, orderBy(opciones.campoOrden, opciones.direccion || "asc"))
    : referencia;

  return onSnapshot(
    consulta,
    (resultado) => callback(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }))),
    alError
  );
}

// ------------------------- PERFIL DE USUARIO -------------------------

export async function crearPerfilUsuario(usuario, datosAdicionales = {}) {
  if (!usuario?.uid) throw new Error("No hay un usuario autenticado.");

  const referencia = doc(db, COLECCIONES.usuarios, usuario.uid);
  const existente = await getDoc(referencia);

  if (existente.exists()) return existente.data();

  const perfil = {
    uid: usuario.uid,
    email: usuario.email || "",
    nombreUsuario:
      datosAdicionales.nombreUsuario || usuario.email?.split("@")[0] || "Usuario",
    fotoPerfil: usuario.photoURL || "",
    biografia: "",
    rol: "usuario",
    fechaRegistro: serverTimestamp(),
    ...datosAdicionales,
  };

  // El rol inicial siempre es usuario; no se permite elegir admin desde el registro.
  perfil.rol = "usuario";
  await setDoc(referencia, perfil);
  return perfil;
}

// ------------------------- ARCHIVOS: FIREBASE STORAGE -------------------------

export async function subirArchivo(ruta, archivo) {
  if (!archivo) return "";
  const referencia = ref(storage, `${ruta}/${Date.now()}-${archivo.name}`);
  const resultado = await uploadBytes(referencia, archivo);
  return getDownloadURL(resultado.ref);
}

export async function eliminarArchivo(url) {
  if (!url) return;
  try {
    await deleteObject(ref(storage, url));
  } catch (error) {
    // Si el archivo ya no existe, no impedimos eliminar/actualizar el documento.
    if (error.code !== "storage/object-not-found") throw error;
  }
}

// ------------------------- ESCUCHA EN TIEMPO REAL (EXTRA) -------------------------

// Escucha un único documento. Llama al callback con null si no existe.
export function escucharDocumento(nombreColeccion, id, callback, alError = console.error) {
  return onSnapshot(
    doc(db, nombreColeccion, String(id)),
    (resultado) => callback(resultado.exists() ? { id: resultado.id, ...resultado.data() } : null),
    alError
  );
}

// Escucha los documentos de una colección donde `campo` sea igual a `valor`
// (por ejemplo, las publicaciones de un autor).
export function escucharPorCampo(nombreColeccion, campo, valor, callback, alError = console.error) {
  return onSnapshot(
    query(collection(db, nombreColeccion), where(campo, "==", valor)),
    (resultado) => callback(resultado.docs.map((documento) => ({ id: documento.id, ...documento.data() }))),
    alError
  );
}

// Carga varios documentos de una sola vez (datos de ejemplo iniciales).
// Cada item debe traer su `id`; se usa como ID del documento.
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

// Agrega o quita un valor de un array del documento (favoritos, etc.).
export async function alternarEnArray(nombreColeccion, id, campo, valor, agregar) {
  await updateDoc(doc(db, nombreColeccion, String(id)), {
    [campo]: agregar ? arrayUnion(valor) : arrayRemove(valor),
  });
}
