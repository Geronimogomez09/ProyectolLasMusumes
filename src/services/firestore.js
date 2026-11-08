import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
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
import {
  normalizarCategoriaProducto,
  normalizarTallesRopa,
  totalStockPorTalle
} from "../data/productos";

// ======================================================
// COLECCIONES PRINCIPALES DE WIKICRAFT
// ======================================================

export const COLECCIONES = {
  usuarios: "usuarios",
  versiones: "versiones",
  productos: "productos",
  productosPredeterminados: "productosPredeterminados",
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

// ======================================================
// TIENDA: PRODUCTOS
// ======================================================

function prepararProductoTienda(datos, id) {
  const categoria = normalizarCategoriaProducto(
    typeof datos.categoria === "string" ? datos.categoria.trim() : ""
  );
  const talles = categoria === "Ropa"
    ? normalizarTallesRopa(datos.talles, datos.stock)
    : null;
  const producto = {
    id: String(id),
    nombre: typeof datos.nombre === "string" ? datos.nombre.trim() : "",
    descripcion: typeof datos.descripcion === "string" ? datos.descripcion.trim() : "",
    precio: Number(datos.precio),
    stock: talles ? totalStockPorTalle(talles) : Number(datos.stock),
    categoria,
    ...(talles ? { talles } : {}),
    estado: datos.estado || "activo",
    imagen: typeof datos.imagen === "string" ? datos.imagen.trim() : "",
    imagenes: Array.isArray(datos.imagenes)
      ? datos.imagenes.filter((imagen) => typeof imagen === "string")
      : [],
  };

  if (!producto.nombre || producto.nombre.length > 100) {
    throw new Error("El nombre del producto es obligatorio y debe tener hasta 100 caracteres.");
  }
  if (producto.descripcion.length > 2000) {
    throw new Error("La descripción no puede superar los 2000 caracteres.");
  }
  if (!Number.isFinite(producto.precio) || producto.precio <= 0) {
    throw new Error("El precio debe ser un número mayor a cero.");
  }
  if (!Number.isInteger(producto.stock) || producto.stock < 0) {
    throw new Error("El stock debe ser un número entero igual o mayor a cero.");
  }
  if (
    talles &&
    Object.values(talles).some((cantidad) => !Number.isInteger(cantidad) || cantidad < 0)
  ) {
    throw new Error("El stock de cada talle debe ser un número entero igual o mayor a cero.");
  }
  if (!producto.categoria || producto.categoria.length > 100) {
    throw new Error("La categoría es obligatoria y debe tener hasta 100 caracteres.");
  }
  if (!["activo", "inactivo"].includes(producto.estado)) {
    throw new Error("El estado debe ser activo o inactivo.");
  }

  return producto;
}

// Crea un producto usando el ID generado por Firestore.
export async function crearProducto(datos) {
  const referencia = doc(collection(db, COLECCIONES.productos));
  const producto = prepararProductoTienda(datos, referencia.id);
  await setDoc(referencia, producto);
  return referencia.id;
}

// Actualiza un producto sin permitir cambiar su ID.
export async function actualizarProducto(id, cambios) {
  const referencia = doc(db, COLECCIONES.productos, String(id));
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    throw new Error("El producto no existe.");
  }

  const producto = prepararProductoTienda(
    { ...resultado.data(), ...cambios },
    resultado.id
  );

  await updateDoc(referencia, {
    ...producto,
    ...(producto.categoria === "Ropa" ? {} : { talles: deleteField() })
  });
}

export async function eliminarProducto(id) {
  const referencia = doc(db, COLECCIONES.productos, String(id));
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    throw new Error("El producto no existe.");
  }

  await deleteDoc(referencia);
}

export function escucharProductos(callback, alError = console.error) {
  return escucharDocumentos(COLECCIONES.productos, callback, {}, alError);
}

// ======================================================
// TIENDA: HERO / BANNERS
// ======================================================

export async function crearHero(datos) {
  return crearDocumento(COLECCIONES.banners, datos);
}

export async function actualizarHero(id, cambios) {
  return actualizarDocumento(COLECCIONES.banners, id, cambios);
}

export async function eliminarHero(id) {
  return eliminarDocumento(COLECCIONES.banners, id);
}

export function escucharHeroes(callback, alError = console.error) {
  return escucharDocumentos(
    COLECCIONES.banners,
    callback,
    { campoOrden: "fechaCreacion", direccion: "asc" },
    alError
  );
}

// Migra los datos locales o iniciales una sola vez, únicamente si las
// colecciones están vacías. No sobrescribe información existente.
export async function inicializarTiendaSiVacia(productosIniciales = [], heroesIniciales = []) {
  const [productosSnapshot, heroesSnapshot] = await Promise.all([
    getDocs(collection(db, COLECCIONES.productos)),
    getDocs(collection(db, COLECCIONES.banners)),
  ]);

  const lote = writeBatch(db);
  let operaciones = 0;

  if (productosSnapshot.empty && productosIniciales.length > 0) {
    productosIniciales.forEach((item) => {
      const id = String(item.id ?? doc(collection(db, COLECCIONES.productos)).id);
      const referencia = doc(db, COLECCIONES.productos, id);
      const producto = prepararProductoTienda(item, id);
      lote.set(referencia, producto);
      operaciones += 1;
    });
  }

  if (heroesSnapshot.empty && heroesIniciales.length > 0) {
    heroesIniciales.forEach((item) => {
      const referencia = doc(collection(db, COLECCIONES.banners));
      lote.set(referencia, {
        subtitulo: item.subtitulo || "",
        titulo: item.titulo || "",
        descripcion: item.descripcion || "",
        boton: item.boton || "Ver productos",
        imagen: item.imagen || "",
        productoId: item.productoId ? String(item.productoId) : "",
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      });
      operaciones += 1;
    });
  }

  if (operaciones > 0) {
    await lote.commit();
  }

  // Migra ropa antigua sin alterar su stock total: las unidades existentes quedan en talle M.
  const productosActuales = await getDocs(collection(db, COLECCIONES.productos));
  const ropaSinTalles = productosActuales.docs.filter((documento) => {
    const producto = documento.data();
    return normalizarCategoriaProducto(producto.categoria) === "Ropa"
      && (!producto.talles || typeof producto.talles !== "object" || Array.isArray(producto.talles));
  });

  for (let inicio = 0; inicio < ropaSinTalles.length; inicio += 500) {
    const loteMigracion = writeBatch(db);
    ropaSinTalles.slice(inicio, inicio + 500).forEach((documento) => {
      const stock = Number(documento.data().stock) || 0;
      loteMigracion.update(documento.ref, {
        talles: normalizarTallesRopa(null, stock)
      });
    });
    await loteMigracion.commit();
  }
}

const ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS = "catalogo-predeterminado";

export async function guardarProductosPredeterminadosActuales() {
  const referenciaPredeterminados = collection(db, COLECCIONES.productosPredeterminados);
  const predeterminadosSnapshot = await getDocs(referenciaPredeterminados);
  const productosSnapshot = await getDocs(collection(db, COLECCIONES.productos));
  if (productosSnapshot.docs.some(
    (documento) => documento.id === ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
  )) {
    throw new Error("Hay un producto con un identificador reservado que impide guardar el catálogo.");
  }

  const productosActuales = new Map(
    productosSnapshot.docs.map((documento) => [
      documento.id,
      prepararProductoTienda(documento.data(), documento.id),
    ])
  );
  await setDoc(
    doc(db, COLECCIONES.productosPredeterminados, ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS),
    { completo: false, cantidad: productosActuales.size }
  );

  const idsObsoletos = predeterminadosSnapshot.docs
    .filter((documento) =>
      documento.id !== ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
      && !productosActuales.has(documento.id)
    )
    .map((documento) => documento.ref);

  for (let inicio = 0; inicio < idsObsoletos.length; inicio += 500) {
    const lote = writeBatch(db);
    idsObsoletos.slice(inicio, inicio + 500).forEach((referencia) => lote.delete(referencia));
    await lote.commit();
  }

  const productos = [...productosActuales.entries()];
  for (let inicio = 0; inicio < productos.length; inicio += 500) {
    const lote = writeBatch(db);
    productos.slice(inicio, inicio + 500).forEach(([id, producto]) => {
      lote.set(doc(db, COLECCIONES.productosPredeterminados, id), producto);
    });
    await lote.commit();
  }

  await setDoc(
    doc(db, COLECCIONES.productosPredeterminados, ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS),
    { completo: true, cantidad: productos.length, fechaCaptura: serverTimestamp() }
  );

  return productos.length;
}

export async function restaurarProductosPredeterminados() {
  const predeterminadosSnapshot = await getDocs(
    collection(db, COLECCIONES.productosPredeterminados)
  );
  const manifiesto = predeterminadosSnapshot.docs.find(
    (documento) => documento.id === ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
  )?.data();

  if (manifiesto?.completo !== true) {
    throw new Error("Primero guardá los productos actuales como copia predeterminada.");
  }
  const productosPredeterminados = predeterminadosSnapshot.docs.filter(
    (documento) => documento.id !== ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
  );
  if (productosPredeterminados.length !== manifiesto.cantidad) {
    throw new Error("La copia guardada está incompleta. No se modificó el catálogo.");
  }

  const productosActualesSnapshot = await getDocs(
    collection(db, COLECCIONES.productos)
  );
  const idsPredeterminados = new Set(
    productosPredeterminados.map((documento) => documento.id)
  );
  const operaciones = [
    ...productosActualesSnapshot.docs
      .filter((documento) => !idsPredeterminados.has(documento.id))
      .map((documento) => ({ tipo: "eliminar", referencia: documento.ref })),
    ...productosPredeterminados.map((documento) => ({
      tipo: "guardar",
      referencia: doc(db, COLECCIONES.productos, documento.id),
      producto: prepararProductoTienda(documento.data(), documento.id),
    })),
  ];

  for (let inicio = 0; inicio < operaciones.length; inicio += 500) {
    const lote = writeBatch(db);
    operaciones.slice(inicio, inicio + 500).forEach((operacion) => {
      if (operacion.tipo === "eliminar") {
        lote.delete(operacion.referencia);
      } else {
        lote.set(operacion.referencia, operacion.producto);
      }
    });
    await lote.commit();
  }

  return productosPredeterminados.length;
}
