// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. NOMBRES DE LAS COLECCIONES (CONSTANTES)
// 3. OPERACIONES GENERALES: LECTURA DE DOCUMENTOS
// 4. OPERACIONES GENERALES: ESCRITURA Y ELIMINACIÓN
// 5. OPERACIONES GENERALES: ESCUCHA EN TIEMPO REAL
// 6. UTILIDADES DE VALIDACIÓN PARA PERFILES
// 7. CREACIÓN Y ACTUALIZACIÓN DEL PERFIL DE USUARIO
// 8. ESCUCHAS ESPECÍFICAS EN TIEMPO REAL
// 9. IMPORTACIÓN MASIVA Y OPERACIONES CON ARRAYS
// 10. COMUNIDAD: PUBLICACIONES
// 11. COMUNIDAD: COMENTARIOS
// 12. COMUNIDAD: DENUNCIAS Y SUSPENSIÓN
// 13. SISTEMA DE HISTORIAL DE VERSIONES
// 14. TIENDA: VALIDACIÓN Y PREPARACIÓN DE PRODUCTOS
// 15. TIENDA: GESTIÓN DE PRODUCTOS
// 16. TIENDA: BANNERS PRINCIPALES (HÉROES)
// 17. INICIALIZACIÓN DE DATOS POR DEFECTO
// 18. RESPALDO Y RESTAURACIÓN DEL CATÁLOGO DE PRODUCTOS

// 1. IMPORTACIONES Y DEPENDENCIAS

// Se importan las herramientas específicas de Firebase Firestore (la base de datos).
// - addDoc, setDoc, updateDoc, deleteDoc: Funciones para crear, modificar y borrar datos.
// - collection, doc: Funciones para apuntar a un grupo de datos (colección) o a un elemento específico (documento).
// - getDoc, getDocs: Funciones para pedir información una sola vez (leer).
// - onSnapshot: Función para quedarse escuchando cambios en vivo.
// - query, where, orderBy, limit: Herramientas para armar consultas complejas (buscar, filtrar, ordenar).
// - arrayUnion, arrayRemove, deleteField: Operaciones especiales para modificar datos internos sin sobreescribir todo.
// - runTransaction, writeBatch: Funciones para hacer muchas operaciones juntas de forma segura.
// - serverTimestamp: Función para pedirle a Firebase que anote la hora oficial del servidor.
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
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

// Importa la conexión oficial a nuestra base de datos (db) previamente inicializada en firebase.js.
import { db } from "./firebase";

// Importa funciones auxiliares propias desde el archivo de datos de productos.
// Sirven para corregir y unificar cómo se escriben las categorías y los talles antes de guardarlos.
import {
  normalizarCategoriaProducto,
  normalizarTallesRopa,
  totalStockPorTalle
} from "../data/productos";

// 2. NOMBRES DE LAS COLECCIONES (CONSTANTES)

// Se crea un objeto congelado en constante que centraliza los nombres de las "carpetas" (colecciones)
// de la base de datos. En una base NoSQL como Firestore, los datos se guardan en Colecciones que 
// contienen Documentos. Guardarlos acá evita errores de tipeo en el resto del archivo.
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

// 3. OPERACIONES GENERALES: LECTURA DE DOCUMENTOS

// Propósito: Busca y devuelve un único documento de la base de datos a partir de su ID.
// Parámetros:
// - nombreColeccion: (String) El nombre de la carpeta en Firestore (ej: "productos").
// - id: (String o Número) El identificador único del elemento que buscamos.
// Proceso:
// - Construye una "referencia" exacta usando doc(db, colección, id).
// - getDoc() viaja a internet a buscar esa referencia. Como toma tiempo, usa "await".
// - resultado.exists() comprueba si Firebase encontró algo. Si lo encontró, arma un
//   objeto nuevo combinando el id y todos sus campos de datos (resultado.data()).
// - Si no lo encuentra, devuelve null para que el programa sepa que está vacío.
export async function obtenerDocumento(nombreColeccion, id) {
  const referencia = doc(db, nombreColeccion, String(id));
  const resultado = await getDoc(referencia);

  return resultado.exists()
    ? { id: resultado.id, ...resultado.data() }
    : null;
}

// Propósito: Descarga todos los documentos de una colección entera, pudiendo filtrarlos y ordenarlos.
// Parámetros:
// - nombreColeccion: (String) La colección a leer.
// - opciones: (Objeto, por defecto {}) Puede contener un "filtro" y un "campoOrden".
// Proceso:
// - Crea la referencia general a la colección entera.
// - Si el usuario mandó un filtro (ej: { campo: "categoria", operador: "==", valor: "Ropa" }), 
//   lo transforma a una instrucción where() de Firestore y la guarda en la lista de condiciones.
// - Si mandó un campo de orden (ej: "precio"), agrega una instrucción orderBy() a la lista.
// - Si hay condiciones acumuladas, arma una "query" (consulta especializada). Si no, usa la colección entera.
// - getDocs() trae la lista completa desde internet.
// Retorno: Mapea (recorre) la lista recibida para devolver un array de objetos listos para usar en React.
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

// 4. OPERACIONES GENERALES: ESCRITURA Y ELIMINACIÓN

// Propósito: Guarda un nuevo elemento en Firestore y le anota automáticamente cuándo fue creado.
// Parámetros:
// - nombreColeccion: Dónde se va a guardar.
// - datos: (Objeto) La información a guardar (ej: { nombre: "Teclado", precio: 50000 }).
// - id: (Opcional) Si se envía, fuerza a Firestore a usar ese nombre específico para el documento.
// Proceso:
// - Clona los datos recibidos y les inyecta "fechaCreacion" y "fechaActualizacion".
// - serverTimestamp() asegura que la hora sea exacta desde los servidores de Google, no la del reloj de la compu del usuario.
// - Si hay un ID definido, usa setDoc() que crea o sobreescribe en esa posición exacta.
// - Si NO hay ID, usa addDoc() que le pide a Firestore que invente un ID al azar de letras y números.
// Retorno: Devuelve el ID final con el que quedó guardado el documento.
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

// Propósito: Modifica campos específicos de un documento que ya existe.
// - updateDoc no borra los datos anteriores. Si el documento tenía {nombre: "A", precio: 10},
//   y en "cambios" mandamos {precio: 20}, el nombre seguirá siendo "A".
// - Siempre aprovecha para renovar la "fechaActualizacion" automáticamente.
export async function actualizarDocumento(nombreColeccion, id, cambios) {
  await updateDoc(doc(db, nombreColeccion, String(id)), {
    ...cambios,
    fechaActualizacion: serverTimestamp(),
  });
}

// Propósito: Borra permanentemente un documento entero de la base de datos.
// Proceso: Ubica el archivo mediante su ID y colección, y ejecuta deleteDoc().
export async function eliminarDocumento(nombreColeccion, id) {
  await deleteDoc(doc(db, nombreColeccion, String(id)));
}

// 5. OPERACIONES GENERALES: ESCUCHA EN TIEMPO REAL

// Propósito: En vez de descargar los datos una sola vez, deja un "micrófono" abierto con Firestore.
// Cada vez que un dato de esta consulta cambie (alguien lo edite o agregue uno nuevo desde otra computadora),
// Firestore empuja los datos nuevos automáticamente ejecutando la función "callback".
// Parámetros:
// - callback: Es una función que nosotros le mandamos para que ejecute cuando lleguen los datos.
// - alError: Función de escape por si ocurre un fallo (ej: se cae internet o faltan permisos).
// Retorno: La función "onSnapshot" devuelve automáticamente otra función oculta que sirve para "apagar" el micrófono.
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
      // Recorre los documentos recibidos y se los envía al callback (generalmente a un estado de React)
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

// 6. UTILIDADES DE VALIDACIÓN PARA PERFILES

// Propósito: Evitar que el nombre de usuario esté vacío o exceda límites absurdos.
// Toma el texto, lo recorta (trim), extrae los primeros 24 caracteres (slice).
// Si después de eso le quedan 3 letras o más, lo acepta. Si no, le clava por defecto "Usuario".
function nombreUsuarioValido(texto) {
  const limpio = String(texto || "").trim().slice(0, 24);
  return limpio.length >= 3 ? limpio : "Usuario";
}

// Propósito: Limpiar cualquier espacio vacío que haya quedado al principio o al final 
// de un texto (como un "Enter" extra apretado por error en un formulario). 
// Si no es un texto, devuelve un texto vacío de seguridad.
function textoOVacio(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

// 7. CREACIÓN Y ACTUALIZACIÓN DEL PERFIL DE USUARIO

// Propósito: Cuando alguien se registra o inicia sesión, crea su documento de perfil en la base de datos,
// o actualiza sus datos si está editando su cuenta.
// Por qué usa runTransaction: Una transacción de base de datos congela momentáneamente el documento.
// Sirve para leerlo y luego escribirlo en el mismo bloque, evitando que dos procesos lo pisen al mismo tiempo.
export async function crearPerfilUsuario(usuario, datosAdicionales = {}) {
  // Validación de seguridad: si no nos mandan un identificador (uid), interrumpimos el proceso.
  if (!usuario?.uid) {
    throw new Error("No hay un usuario autenticado.");
  }

  const referencia = doc(db, COLECCIONES.usuarios, usuario.uid);
  
  // Array que define estrictamente qué campos tiene permiso de modificar el usuario.
  // Evita que un usuario envíe por código un dato tipo {rol: "admin"} y se apropie del sistema.
  const camposActualizables = [
    "nombreUsuario",
    "nombre",
    "apellido",
    "fotoPerfil",
    "biografia",
    "ubicacion",
    "sitioWeb",
    "fechaNacimiento",
    "pais",
  ];

  return runTransaction(db, async (transaccion) => {
    // Lee el documento actual desde el servidor dentro del contexto seguro de la transacción.
    const existente = await transaccion.get(referencia);

    // CASO A: EL PERFIL YA EXISTE EN FIREBASE (Se trata de una actualización)
    if (existente.exists()) {
      const datosExistentes = existente.data();
      const cambios = {};

      // Recorre la lista de campos permitidos. Si el usuario mandó un valor para ese campo,
      // lo valida, lo limpia y compara si es distinto al que ya estaba en la base de datos.
      // Solo si es distinto (para no gastar lecturas/escrituras inútiles) lo añade al paquete de "cambios".
      camposActualizables.forEach((campo) => {
        if (!Object.hasOwn(datosAdicionales, campo)) return;

        const valor = campo === "nombreUsuario"
          ? nombreUsuarioValido(datosAdicionales[campo])
          : textoOVacio(datosAdicionales[campo]);
        if (datosExistentes[campo] !== valor) cambios[campo] = valor;
      });

      // Evalúa la configuración de notificaciones (que es booleana, no texto).
      if (Object.hasOwn(datosAdicionales, "notificaciones")) {
        const notificaciones = datosAdicionales.notificaciones !== false;
        if (datosExistentes.notificaciones !== notificaciones) {
          cambios.notificaciones = notificaciones;
        }
      }

      // Si se detectó por lo menos un cambio válido, le ordena a la transacción que haga el updateDoc.
      if (Object.keys(cambios).length > 0) {
        transaccion.update(referencia, {
          ...cambios,
          fechaActualizacion: serverTimestamp(),
        });
        // Devuelve el objeto completo uniendo lo viejo y lo nuevo para la pantalla.
        return { uid: existente.id, ...datosExistentes, ...cambios };
      }

      // Si no hubo cambios, devuelve los datos tal cual estaban.
      return { uid: existente.id, ...datosExistentes };
    }

    // CASO B: EL PERFIL NO EXISTE (El usuario ingresa por primerísima vez)
    // Crea un objeto gigante construyendo la estructura oficial de un perfil.
    const perfil = {
      uid: usuario.uid,
      email: usuario.email || "",
      nombreUsuario: nombreUsuarioValido(
        textoOVacio(datosAdicionales.nombreUsuario) ||
          usuario.displayName ||
          usuario.email?.split("@")[0]
      ),
      nombre: textoOVacio(datosAdicionales.nombre),
      apellido: textoOVacio(datosAdicionales.apellido),
      fotoPerfil: textoOVacio(datosAdicionales.fotoPerfil) || usuario.photoURL || "",
      biografia: textoOVacio(datosAdicionales.biografia),
      ubicacion: textoOVacio(datosAdicionales.ubicacion),
      sitioWeb: textoOVacio(datosAdicionales.sitioWeb),
      fechaNacimiento: textoOVacio(datosAdicionales.fechaNacimiento),
      pais: textoOVacio(datosAdicionales.pais),
      notificaciones: datosAdicionales.notificaciones !== false,
      
      // El rol se fija obligatoriamente desde el servidor a "usuario". 
      // Ningún usuario normal puede darse poderes a sí mismo mediante código.
      rol: "usuario",
      permisos: [],
      estado: "activo",
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    };

    // Guarda físicamente este objeto inicial en Firestore usando transaccion.set.
    transaccion.set(referencia, perfil);
    return perfil;
  });
}

// 8. ESCUCHAS ESPECÍFICAS EN TIEMPO REAL

// Propósito: Mantener la pantalla conectada en tiempo real a UN solo documento (ej: detalle de una publicación).
// Funciona igual que escucharDocumentos, pero apunta a doc() en lugar de a collection().
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

// Propósito: Mantener conectada una consulta rápida a un campo específico en tiempo real 
// (ejemplo: escuchar todas las canciones cuyo 'compositorId' coincida con '5').
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

// 9. IMPORTACIÓN MASIVA Y OPERACIONES CON ARRAYS

// Propósito: Guardar muchos documentos a la vez.
// Por qué usa writeBatch: "Lote de escritura". Permite meter múltiples operaciones de guardado en un paquete
// y mandarlas todas juntas al servidor. Si falla internet a la mitad, se cancelan TODAS. Esto evita que 
// la base de datos quede con información parcial e inconsistente.
export async function importarDocumentos(nombreColeccion, items) {
  const lote = writeBatch(db);

  // Recorre todos los items que llegaron. Extrae el id, y empaqueta el resto en "datos".
  items.forEach(({ id, ...datos }) => {
    // Añade la instrucción de guardar este documento al "lote". Aún no se envía a internet.
    lote.set(doc(db, nombreColeccion, String(id)), {
      ...datos,
      fechaCreacion: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });
  });

  // Envía y procesa el paquete completo.
  await lote.commit();
}

// Propósito: Agregar o quitar un elemento de un array (lista interna) adentro de un documento,
// sin alterar el resto del documento ni tener que descargar la lista entera primero.
// Parámetros: 
// - campo: El nombre de la propiedad array (ej: "favoritos").
// - agregar: Boolean. Si es true, añade. Si es false, borra.
export async function alternarEnArray(
  nombreColeccion,
  id,
  campo,
  valor,
  agregar
) {
  await updateDoc(doc(db, nombreColeccion, String(id)), {
    // Si "agregar" es verdad usa arrayUnion() de Firebase (mete el dato si no estaba).
    // Si es falso usa arrayRemove() (busca el dato en la lista y lo saca).
    [campo]: agregar ? arrayUnion(valor) : arrayRemove(valor),
    fechaActualizacion: serverTimestamp(),
  });
}

// 10. COMUNIDAD: PUBLICACIONES

// Propósito: Crear un post de comunidad verificando que la persona haya iniciado sesión.
// Construye un documento de publicación inyectando de manera segura el ID del usuario como autor.
export async function crearPublicacion(datos, usuario, perfil = {}) {
  // Verificación de seguridad local
  if (!usuario?.uid) throw new Error("Tenés que iniciar sesión para publicar.");
  
  // Decide el nombre del autor buscando la mejor opción disponible en los datos de la cuenta.
  const nombre = perfil.nombreUsuario || usuario.displayName || usuario.email?.split("@")[0] || "Usuario";
  const imagenUrl = typeof datos.imagen === "string" ? datos.imagen.trim() : "";
  
  return crearDocumento(COLECCIONES.publicaciones, {
    autorId: usuario.uid, // Estrictamente asignado desde la cuenta real, no desde el formulario.
    autorNombre: nombre,
    autorFoto: perfil.fotoPerfil || usuario.photoURL || "",
    categoria: datos.categoria,
    contenido: datos.contenido,
    imagen: imagenUrl,
    comentarios: [], // Inicialmente nace sin comentarios.
    likes: 0,        // Inicialmente nace con cero 'me gusta'.
    editado: false,  // Marca visual para saber si el texto fue alterado luego de publicado.
  });
}

// Escucha todas las publicaciones, ordenadas de la más nueva a la más vieja.
export function escucharPublicaciones(callback, alError = console.error) {
  return escucharDocumentos(COLECCIONES.publicaciones, callback, { campoOrden: "fechaCreacion", direccion: "desc" }, alError);
}

// Actualiza una publicación existente.
// Protege el sistema asegurando que SOLO se puedan editar las propiedades: contenido, categoria e imagen.
// Marca automáticamente la publicación con la bandera "editado: true".
export async function actualizarPublicacion(id, cambios) {
  const permitidos = { contenido: cambios.contenido, categoria: cambios.categoria };
  if (Object.prototype.hasOwnProperty.call(cambios, "imagen")) permitidos.imagen = cambios.imagen || "";
  
  // Limpia cualquier propiedad que haya quedado como "undefined" para no ensuciar la base de datos.
  Object.keys(permitidos).forEach((k) => permitidos[k] === undefined && delete permitidos[k]);
  
  await actualizarDocumento(COLECCIONES.publicaciones, id, { ...permitidos, editado: true });
}

// Ejecuta el borrado estándar para la colección de publicaciones.
export async function eliminarPublicacion(id) {
  await eliminarDocumento(COLECCIONES.publicaciones, id);
}

// 11. COMUNIDAD: COMENTARIOS

// Propósito: Añade un objeto de comentario adentro del array "comentarios" de una publicación.
// Validaciones: Verifica sesión activa y que el texto no esté vacío.
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

  // Crea la estructura independiente del comentario en memoria.
  // Utiliza crypto.randomUUID() propio del navegador para generarle un ID único interno al comentario.
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

  // Empuja el comentario armado adentro de la publicación oficial en Firestore.
  await updateDoc(
    doc(db, COLECCIONES.publicaciones, String(publicacionId)),
    {
      comentarios: arrayUnion(comentario),
      fechaActualizacion: serverTimestamp(),
    }
  );

  return comentario;
}

// Propósito: Permite que el usuario modifique su comentario.
// Proceso complejo:
// 1. Firebase no permite editar un solo elemento de un array directamente con "updateDoc".
// 2. Por ende, la función descarga el documento completo (.getDoc()).
// 3. Modifica la lista localmente en JavaScript usando .map().
// 4. Sube la lista entera modificada, sobreescribiendo el array original.
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

  // Mapea la lista buscando el comentario específico por ID.
  // Cuando lo encuentra, lo expande y le altera el texto, poniéndole la marca "editado: true".
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

  // Reemplaza la matriz (array) antigua por la nueva matriz actualizada.
  await updateDoc(referencia, {
    comentarios: actualizados,
    fechaActualizacion: serverTimestamp(),
  });
}

// Propósito: Borra un comentario en particular.
// Proceso: Igual que la actualización, descarga el post, pero utiliza .filter() 
// para crear una copia de la lista donde ese comentario ya no está incluido.
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

// 12. COMUNIDAD: DENUNCIAS Y SUSPENSIÓN

// Propósito: Permite crear un reporte interno al staff.
// Registra obligatoriamente quién es el denunciante desde la sesión para evitar denuncias anónimas falsas.
// Nace siempre en el estado "Pendiente".
export async function crearDenuncia(datos, usuario, perfil = {}) {
  if (!usuario?.uid) throw new Error("Tenés que iniciar sesión para denunciar.");
  return crearDocumento(COLECCIONES.denuncias, {
    ...datos,
    denuncianteId: usuario.uid,
    denuncianteNombre: perfil.nombreUsuario || usuario.email?.split("@")[0] || "Usuario",
    estado: "Pendiente",
  });
}

// Funciones administrativas para cambiar el estado de las denuncias y suspender cuentas
// cambiando el estado del documento del usuario.
export async function actualizarEstadoDenuncia(id, estado) {
  await actualizarDocumento(COLECCIONES.denuncias, id, { estado });
}

export function escucharDenuncias(callback, alError = console.error) {
  return escucharDocumentos(COLECCIONES.denuncias, callback, { campoOrden: "fechaCreacion", direccion: "desc" }, alError);
}

export async function suspenderCuenta(uid, suspendida = true) {
  await actualizarDocumento(COLECCIONES.usuarios, uid, { estado: suspendida ? "suspendido" : "activo" });
}

// 13. SISTEMA DE HISTORIAL DE VERSIONES

// Herramientas sencillas para crear, leer y borrar la cronología del juego.
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

// 14. TIENDA: VALIDACIÓN Y PREPARACIÓN DE PRODUCTOS

// Propósito: Función sumamente estricta que filtra, corrige y audita la información 
// de un producto ANTES de que tenga permiso de entrar a la base de datos de Firestore.
// Evita fallos críticos como números de stock negativos o precios inválidos.
function prepararProductoTienda(datos, id) {
  // Normaliza las categorías (reparando diferencias por uso de mayúsculas/minúsculas).
  const categoria = normalizarCategoriaProducto(
    typeof datos.categoria === "string" ? datos.categoria.trim() : ""
  );
  
  // Si la categoría resultó ser Ropa, necesita aplicar formato de talles. Sino, asigna nulo.
  const talles = categoria === "Ropa"
    ? normalizarTallesRopa(datos.talles, datos.stock)
    : null;
    
  // Construye el objeto seguro en memoria.
  const producto = {
    id: String(id),
    nombre: typeof datos.nombre === "string" ? datos.nombre.trim() : "",
    descripcion: typeof datos.descripcion === "string" ? datos.descripcion.trim() : "",
    precio: Number(datos.precio),
    // Si tiene talles, el stock es la suma combinada de todos ellos, calculada de forma segura.
    stock: talles ? totalStockPorTalle(talles) : Number(datos.stock),
    categoria,
    // El operador spread condicional "(...)" inyecta la propiedad talles SÓLO si existen.
    ...(talles ? { talles } : {}),
    estado: datos.estado || "activo",
    imagen: typeof datos.imagen === "string" ? datos.imagen.trim() : "",
    // Garantiza que la propiedad "imagenes" sea siempre un array oficial.
    imagenes: Array.isArray(datos.imagenes)
      ? datos.imagenes.filter((imagen) => typeof imagen === "string")
      : [],
  };

  // Bloque de VALIDACIONES EXTENSAS
  // Si alguna no se cumple, hace un "throw new Error()", lo que interrumpe abruptamente la ejecución
  // de la función principal y devuelve el fallo rojo a la pantalla que esté intentando crear el producto.
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

  // Si sobrevive a todos los errores, devuelve el producto verificado y sanitizado.
  return producto;
}

// 15. TIENDA: GESTIÓN DE PRODUCTOS

export async function crearProducto(datos) {
  // Primero genera una referencia doc() que se encargará de crear el ID automáticamente en Firestore.
  const referencia = doc(collection(db, COLECCIONES.productos));
  // Pasa los datos por la capa estricta de revisión usando ese nuevo ID.
  const producto = prepararProductoTienda(datos, referencia.id);
  // Finalmente guarda en base de datos.
  await setDoc(referencia, producto);
  return referencia.id;
}

export async function actualizarProducto(id, cambios) {
  const referencia = doc(db, COLECCIONES.productos, String(id));
  const resultado = await getDoc(referencia);

  if (!resultado.exists()) {
    throw new Error("El producto no existe.");
  }

  // Junta la información vieja con la nueva (...cambios pisa propiedades viejas del ...resultado.data()).
  const producto = prepararProductoTienda(
    { ...resultado.data(), ...cambios },
    resultado.id
  );

  // Si el producto nuevo NO es ropa, destruye el campo de talles en Firestore usando deleteField().
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

// 16. TIENDA: BANNERS PRINCIPALES (HÉROES)

// Los Héroes (Hero) son las imágenes grandes y promocionales de la pantalla principal de la tienda.
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

// 17. INICIALIZACIÓN DE DATOS POR DEFECTO

// Propósito: Al lanzar la tienda en limpio por primera vez, rellena los productos y banners básicos.
// Si las colecciones ya tienen algo (no están empty), interrumpe el proceso para no pisar el trabajo de nadie.
export async function inicializarTiendaSiVacia(productosIniciales = [], heroesIniciales = []) {
  // Promise.all permite hacer consultas en paralelo para no hacer esperar el doble al sistema.
  const [productosSnapshot, heroesSnapshot] = await Promise.all([
    getDocs(collection(db, COLECCIONES.productos)),
    getDocs(collection(db, COLECCIONES.banners)),
  ]);

  const lote = writeBatch(db);
  let operaciones = 0;

  // Evalúa si la carpeta está vacía y si nos mandaron datos en el array inicial.
  if (productosSnapshot.empty && productosIniciales.length > 0) {
    productosIniciales.forEach((item) => {
      // Si el item inicial no provee ID, le crea uno al vuelo con doc().
      const id = String(item.id ?? doc(collection(db, COLECCIONES.productos)).id);
      const referencia = doc(db, COLECCIONES.productos, id);
      // Lo somete a la validación estricta y lo añade al lote de escritura simultánea.
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

  // Ejecuta de verdad la subida masiva.
  if (operaciones > 0) {
    await lote.commit();
  }

  // SECCIÓN DE MIGRACIÓN HISTÓRICA:
  // Si en el pasado de la base de datos alguien había guardado Ropa sin el sistema nuevo de talles,
  // esto busca toda la Ropa vieja, y le asigna el total del stock anterior al "talle M" por defecto.
  const productosActuales = await getDocs(collection(db, COLECCIONES.productos));
  const ropaSinTalles = productosActuales.docs.filter((documento) => {
    const producto = documento.data();
    return normalizarCategoriaProducto(producto.categoria) === "Ropa"
      && (!producto.talles || typeof producto.talles !== "object" || Array.isArray(producto.talles));
  });

  // Firestore no aguanta un Batch (Lote) infinito. Tiene un límite de 500 operaciones a la vez.
  // Este bucle "for" cuenta de a 500 en 500 (inicio += 500) y va cortando el array original 
  // usando .slice(0, 500), luego .slice(500, 1000), etc. Enviando varios lotes consecutivos.
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

// 18. RESPALDO Y RESTAURACIÓN DEL CATÁLOGO DE PRODUCTOS

// Guarda el nombre en constante del "manifiesto", un archivo de reporte que dice cuántos archivos hay copiados en total.
const ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS = "catalogo-predeterminado";

// Propósito: El administrador toca un botón para guardar una "foto" (Copia de seguridad) de todos los productos actuales.
export async function guardarProductosPredeterminadosActuales() {
  const referenciaPredeterminados = collection(db, COLECCIONES.productosPredeterminados);
  
  // Descarga la copia de seguridad antigua y el catálogo que existe actualmente en el momento del clic.
  const predeterminadosSnapshot = await getDocs(referenciaPredeterminados);
  const productosSnapshot = await getDocs(collection(db, COLECCIONES.productos));
  
  // Evita colisiones de seguridad si por error un producto regular tiene nuestro nombre reservado para el reporte.
  if (productosSnapshot.docs.some(
    (documento) => documento.id === ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
  )) {
    throw new Error("Hay un producto con un identificador reservado que impide guardar el catálogo.");
  }

  // Crea un objeto tipo "Map" (Mapa de JavaScript) en memoria que empareja Claves(IDs) y Valores(ProductosLimpios).
  const productosActuales = new Map(
    productosSnapshot.docs.map((documento) => [
      documento.id,
      prepararProductoTienda(documento.data(), documento.id),
    ])
  );
  
  // Avisa al servidor que estamos EMPEZANDO la captura y cambia "completo" a falso.
  await setDoc(
    doc(db, COLECCIONES.productosPredeterminados, ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS),
    { completo: false, cantidad: productosActuales.size }
  );

  // Busca y extrae todos los archivos de respaldo VIEJOS (obsoletos) que ya no existen en el catálogo actual, 
  // preparándolos para ser destruidos.
  const idsObsoletos = predeterminadosSnapshot.docs
    .filter((documento) =>
      documento.id !== ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
      && !productosActuales.has(documento.id)
    )
    .map((documento) => documento.ref);

  // Borra en bloque de 500 operaciones los respaldos que sobraban.
  for (let inicio = 0; inicio < idsObsoletos.length; inicio += 500) {
    const lote = writeBatch(db);
    idsObsoletos.slice(inicio, inicio + 500).forEach((referencia) => lote.delete(referencia));
    await lote.commit();
  }

  // Toma el Mapa que armamos (productos actuales limpios) y guarda su copia en el historial (también en tandas de 500).
  const productos = [...productosActuales.entries()];
  for (let inicio = 0; inicio < productos.length; inicio += 500) {
    const lote = writeBatch(db);
    productos.slice(inicio, inicio + 500).forEach(([id, producto]) => {
      lote.set(doc(db, COLECCIONES.productosPredeterminados, id), producto);
    });
    await lote.commit();
  }

  // Al finalizar sin errores, da aviso al reporte manifiesto de que la copia terminó EXITOSAMENTE.
  await setDoc(
    doc(db, COLECCIONES.productosPredeterminados, ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS),
    { completo: true, cantidad: productos.length, fechaCaptura: serverTimestamp() }
  );

  return productos.length;
}

// Propósito: Restaura la tienda entera reemplazando el catálogo vivo por la última copia de seguridad guardada.
export async function restaurarProductosPredeterminados() {
  const predeterminadosSnapshot = await getDocs(
    collection(db, COLECCIONES.productosPredeterminados)
  );
  
  // Obtiene el documento oficial del reporte Manifiesto leyendo su archivo específico de la lista.
  const manifiesto = predeterminadosSnapshot.docs.find(
    (documento) => documento.id === ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
  )?.data();

  // Validación: Si la copia dice "completo: false", quiere decir que se cortó internet a la mitad del último guardado
  // y la copia no sirve. Cancela la operación para no corromper la tienda.
  if (manifiesto?.completo !== true) {
    throw new Error("Primero guardá los productos actuales como copia predeterminada.");
  }
  
  const productosPredeterminados = predeterminadosSnapshot.docs.filter(
    (documento) => documento.id !== ID_MANIFIESTO_PRODUCTOS_PREDETERMINADOS
  );
  
  // Verifica adicional: Cuenta uno por uno los archivos, y comprueba que la cuenta dé igual a lo que decía el Manifiesto.
  if (productosPredeterminados.length !== manifiesto.cantidad) {
    throw new Error("La copia guardada está incompleta. No se modificó el catálogo.");
  }

  const productosActualesSnapshot = await getDocs(
    collection(db, COLECCIONES.productos)
  );
  
  const idsPredeterminados = new Set(
    productosPredeterminados.map((documento) => documento.id)
  );
  
  // Crea una extensa matriz (array) de operaciones pendientes "Misión":
  // Lo primero son todos los documentos vivos que ya no están en la copia vieja, así que anota su condena a "eliminar".
  // Lo segundo son todos los documentos vivos de la copia que deben reemplazar o añadirse con el tipo "guardar".
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

  // Ejecuta esa matriz de operaciones masivas cuidando el límite estricto de 500 operaciones por lote de Google.
  for (let inicio = 0; inicio < operaciones.length; inicio += 500) {
    const lote = writeBatch(db);
    operaciones.slice(inicio, inicio + 500).forEach((operacion) => {
      // Si la misión decía "eliminar", los borra. Sino, los pisa/crea de nuevo restaurándolos.
      if (operacion.tipo === "eliminar") {
        lote.delete(operacion.referencia);
      } else {
        lote.set(operacion.referencia, operacion.producto);
      }
    });
    await lote.commit();
  }

  // Retorna cuántos productos exitosos pudo revivir en total.
  return productosPredeterminados.length;
}