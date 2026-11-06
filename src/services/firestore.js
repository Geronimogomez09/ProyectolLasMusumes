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

import { db } from "./firebase";

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
    if (datosAdicionales.nombreUsuario && datosAdicionales.nombreUsuario !== existente.data().nombreUsuario) {
      await updateDoc(referencia, { nombreUsuario: datosAdicionales.nombreUsuario });
      const actualizado = await getDoc(referencia);
      return { uid: actualizado.id, ...actualizado.data() };
    }
    return { uid: existente.id, ...existente.data() };
  }

  const perfil = {
    ...datosAdicionales,
    uid: usuario.uid,
    email: usuario.email || "",
    nombreUsuario:
      datosAdicionales.nombreUsuario ||
      usuario.displayName ||
      usuario.email?.split("@")[0] ||
      "Usuario",
    fotoPerfil: usuario.photoURL || "",
    biografia: datosAdicionales.biografia || "",
    rol: "usuario",
    estado: "activo",
    fechaRegistro: serverTimestamp(),
  };

  await setDoc(referencia, perfil);

  return perfil;
}

// ======================================================
// IMÁGENES EXTERNAS (SIN FIREBASE STORAGE)
// ======================================================
// Las imágenes se guardan como URL en Firestore. El proyecto no sube
// archivos ni necesita habilitar Firebase Storage.

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

// ======================================================
// COMUNIDAD: publicaciones y denuncias persistentes
// ======================================================
export async function crearPublicacion(datos, usuario, perfil = {}) {
  if (!usuario?.uid) throw new Error("Tenés que iniciar sesión para publicar.");
  const nombre = perfil.nombreUsuario || usuario.displayName || usuario.email?.split("@")[0] || "Usuario";
  const imagenUrl = typeof datos.imagen === "string" ? datos.imagen.trim() : "";
  return crearDocumento(COLECCIONES.publicaciones, {
    autorId: usuario.uid,
    autorNombre: nombre,
    autorFoto: perfil.fotoPerfil || usuario.photoURL || "",
    categoria: datos.categoria,
    contenido: datos.contenido,
    imagen: imagenUrl,
    comentarios: [],
    likes: 0,
    editado: false,
  });
}

export function escucharPublicaciones(callback, alError = console.error) {
  return escucharDocumentos(COLECCIONES.publicaciones, callback, { campoOrden: "fechaCreacion", direccion: "desc" }, alError);
}

export async function actualizarPublicacion(id, cambios) {
  const permitidos = { contenido: cambios.contenido, categoria: cambios.categoria };
  if (Object.prototype.hasOwnProperty.call(cambios, "imagen")) permitidos.imagen = cambios.imagen || "";
  Object.keys(permitidos).forEach((k) => permitidos[k] === undefined && delete permitidos[k]);
  await actualizarDocumento(COLECCIONES.publicaciones, id, { ...permitidos, editado: true });
}

export async function eliminarPublicacion(id) {
  await eliminarDocumento(COLECCIONES.publicaciones, id);
  
}

// ======================================================
// COMUNIDAD: comentarios de publicaciones
// ======================================================

export async function crearComentario(publicacionId, datos, usuario, perfil = {}) {
  if (!usuario?.uid) {
    throw new Error("Tenés que iniciar sesión para comentar.");
  }

  const texto = datos.texto?.trim();

  if (!texto) {
    throw new Error("El comentario no puede estar vacío.");
  }

  const nombre =
    perfil.nombreUsuario ||
    usuario.displayName ||
    usuario.email?.split("@")[0] ||
    "Usuario";

  const comentario = {
    id: crypto.randomUUID(),
    autorId: usuario.uid,
    autorNombre: nombre,
    usuario: nombre,
    inicial: nombre.slice(0, 1).toUpperCase(),
    colorAvatar: "#16813b",
    texto,
    fechaCreacion: new Date().toISOString(),
  };

  await updateDoc(
    doc(db, COLECCIONES.publicaciones, String(publicacionId)),
    {
      comentarios: arrayUnion(comentario),
      fechaActualizacion: serverTimestamp(),
    }
  );

  return comentario;
}

export async function actualizarComentario(publicacionId, comentarioId, nuevoTexto) {
  const texto = nuevoTexto?.trim();

  if (!texto) {
    throw new Error("El comentario no puede quedar vacío.");
  }

  const referencia = doc(
    db,
    COLECCIONES.publicaciones,
    String(publicacionId)
  );

  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    throw new Error("La publicación ya no existe.");
  }

  const comentarios = resultado.data().comentarios || [];

  const actualizados = comentarios.map((comentario) =>
    comentario.id === comentarioId
      ? {
          ...comentario,
          texto,
          editado: true,
          fechaEdicion: new Date().toISOString(),
        }
      : comentario
  );

  await updateDoc(referencia, {
    comentarios: actualizados,
    fechaActualizacion: serverTimestamp(),
  });
}

export async function eliminarComentario(publicacionId, comentarioId) {
  const referencia = doc(
    db,
    COLECCIONES.publicaciones,
    String(publicacionId)
  );

  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    throw new Error("La publicación ya no existe.");
  }

  const comentarios = resultado.data().comentarios || [];

  const actualizados = comentarios.filter(
    (comentario) => comentario.id !== comentarioId
  );

  await updateDoc(referencia, {
    comentarios: actualizados,
    fechaActualizacion: serverTimestamp(),
  });
}
export async function crearDenuncia(datos, usuario, perfil = {}) {
  if (!usuario?.uid) throw new Error("Tenés que iniciar sesión para denunciar.");
  return crearDocumento(COLECCIONES.denuncias, {
    ...datos,
    denuncianteId: usuario.uid,
    denuncianteNombre: perfil.nombreUsuario || usuario.email?.split("@")[0] || "Usuario",
    estado: "Pendiente",
  });
}

export async function actualizarEstadoDenuncia(id, estado) {
  await actualizarDocumento(COLECCIONES.denuncias, id, { estado });
}

export function escucharDenuncias(callback, alError = console.error) {
  return escucharDocumentos(COLECCIONES.denuncias, callback, { campoOrden: "fechaCreacion", direccion: "desc" }, alError);
}

export async function suspenderCuenta(uid, suspendida = true) {
  await actualizarDocumento(COLECCIONES.usuarios, uid, { estado: suspendida ? "suspendido" : "activo" });
}

// ======================================================
// VERSIONES: Firestore (operaciones protegidas por reglas)
// ======================================================
export function escucharVersiones(callback, alError = console.error) {
  return escucharDocumentos(COLECCIONES.versiones, callback, { campoOrden: "fecha", direccion: "desc" }, alError);
}
export async function guardarVersion(datos, id = null) {
  if (id) return actualizarDocumento(COLECCIONES.versiones, id, datos);
  return crearDocumento(COLECCIONES.versiones, datos);
}
export async function borrarVersion(id) {
  return eliminarDocumento(COLECCIONES.versiones, id);
}

// 1. IMPORTACIONES

// Funciones de Firebase Storage para obtener el almacenamiento,
// crear referencias a archivos, subir imágenes y recuperar sus URLs.
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// 2. CONFIGURACIÓN DE STORAGE

// Obtiene la instancia de Firebase Storage correspondiente
// a la aplicación de Firebase inicializada en el proyecto.
const storage = getStorage();

// 3. ACTUALIZAR DATOS DEL PERFIL

// ACTUALIZAR PERFIL: modifica los datos personales de un usuario
// dentro de la colección "usuarios" de Firestore.
// Recibe el UID del usuario y un objeto con los cambios que se quieren guardar.
export async function actualizarPerfilUsuario(uid, cambios) {

  // Comprueba que se haya proporcionado el identificador del usuario.
  // Si no existe, detiene la función y genera un error.
  if (!uid) throw new Error("No hay un usuario autenticado.");

  // CAMPOS PERMITIDOS: define qué propiedades pueden modificarse mediante esta función.
  // Evita que se envíen otros campos, como el rol o el estado de la cuenta.
  const permitidos = [
    "nombreUsuario", "nombre", "apellido", "biografia",
    "ubicacion", "sitioWeb", "fechaNacimiento", "fotoPerfil",
  ];

  // FILTRAR CAMBIOS: obtiene las propiedades del objeto recibido y conserva
  // únicamente aquellas cuyo nombre aparece en el arreglo permitidos.
  const datos = Object.fromEntries(
    Object.entries(cambios).filter(([campo]) => permitidos.includes(campo))
  );

  // ACTUALIZACIÓN EN FIRESTORE:
  // identifica el documento del usuario mediante su UID y actualiza sus datos.
  await updateDoc(doc(db, "usuarios", uid), {

    // Copia dentro del documento únicamente los campos que pasaron la validación.
    ...datos,

    // Guarda automáticamente la fecha y hora de la última actualización.
    // serverTimestamp() utiliza la hora del servidor de Firebase.
    fechaActualizacion: serverTimestamp(),
  });
}

// 4. SUBIR FOTO DE PERFIL

// SUBIR FOTO: permite cargar una imagen del usuario a Firebase Storage.
// Recibe el UID del usuario y el archivo de imagen seleccionado.
export async function subirFotoPerfil(uid, archivo) {

  // COMPROBACIÓN DE DATOS: verifica que existan el UID y el archivo.
  if (!uid || !archivo) throw new Error("Faltan datos para subir la imagen.");

  // VALIDACIÓN DEL TIPO: comprueba que el archivo seleccionado sea una imagen.
  // archivo.type contiene el tipo MIME del archivo, por ejemplo image/png o image/jpeg.
  if (!archivo.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen.");

  // VALIDACIÓN DEL TAMAÑO: impide subir imágenes que superen los 5 MB.
  // 1024 * 1024 representa un megabyte expresado en bytes.
  if (archivo.size > 5 * 1024 * 1024) throw new Error("La imagen supera los 5 MB.");

  // EXTENSIÓN: obtiene la parte final del nombre del archivo después del punto.
  // toLowerCase() convierte la extensión a minúsculas.
  // Si no se encuentra una extensión, utiliza jpg como alternativa.
  const extension = archivo.name.split(".").pop()?.toLowerCase() || "jpg";

  // REFERENCIA: establece la ubicación donde se almacenará la fotografía.
  // Cada usuario tiene una carpeta propia identificada mediante su UID.
  // El nombre del archivo será foto-perfil seguido de su extensión.
  const referencia = ref(storage, `usuarios/${uid}/foto-perfil.${extension}`);

  // SUBIR IMAGEN: envía el archivo a Firebase Storage.
  // contentType permite conservar el tipo de imagen correspondiente.
  await uploadBytes(referencia, archivo, { contentType: archivo.type });

  // URL DE DESCARGA: obtiene la dirección desde la que se puede acceder
  // a la imagen almacenada y la devuelve como resultado de la función.
  return getDownloadURL(referencia);
}