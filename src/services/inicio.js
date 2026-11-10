
// ============================================================
// ÍNDICE GENERAL
// ============================================================
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. DATOS INICIALES DEL SISTEMA
// 3. CONFIGURACIÓN DE COLECCIONES DE FIRESTORE
// 4. RELACIÓN ENTRE TIPOS DE CONTENIDO Y COLECCIONES
// 5. INICIALIZACIÓN AUTOMÁTICA DE DATOS
// 6. SUSCRIPCIÓN A LOS CAMBIOS DE FIREBASE
// 7. CREACIÓN DE CONTENIDO
// 8. EDICIÓN DE CONTENIDO
// 9. ACTIVACIÓN Y DESACTIVACIÓN DE CONTENIDO


// ============================================================
// 1. IMPORTACIONES Y DEPENDENCIAS
// ============================================================

// Importamos diferentes funciones y herramientas de Firebase Firestore.
// Firestore es el servicio de Firebase que utilizamos como base de datos
// para almacenar y consultar la información de Wiki-Craft.

// collection:
// Permite obtener una referencia a una colección de la base de datos.
// Una colección es un conjunto de documentos relacionados.

// onSnapshot:
// Permite escuchar una colección o consulta en tiempo real.
// Cuando los datos cambian en Firebase, recibimos automáticamente
// la información actualizada sin tener que recargar la página.

// addDoc:
// Permite agregar un documento nuevo a una colección.
// Firebase genera automáticamente un identificador único para ese documento.

// updateDoc:
// Permite modificar los campos de un documento que ya existe,
// sin necesidad de reemplazar toda su información.

// doc:
// Permite obtener una referencia a un documento específico.
// Para identificarlo necesitamos indicar la colección y su identificador.

// query:
// Permite construir consultas personalizadas sobre una colección.

// where:
// Permite establecer condiciones en una consulta.
// Por ejemplo, buscar únicamente documentos cuyo campo "activo" sea true.

// serverTimestamp:
// Permite obtener una marca de tiempo generada por los servidores de Firebase.
// Se utiliza para registrar cuándo se creó o modificó un documento.

// runTransaction:
// Permite ejecutar una transacción.
// Una transacción agrupa varias operaciones para que se realicen
// de manera segura, evitando inconsistencias en la base de datos.

import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    serverTimestamp,
    runTransaction,
} from "firebase/firestore";

// Importamos la conexión con nuestra base de datos de Firebase.
// La variable "db" representa la instancia de Firestore que utiliza
// el proyecto para realizar las operaciones de almacenamiento.
import { db } from "./firebase";


// ============================================================
// 2. DATOS INICIALES DEL SISTEMA
// ============================================================

// Exportamos una constante llamada CONTENIDO_INICIAL.
// La palabra "export" permite que otros archivos del proyecto
// puedan importar y utilizar esta información.

// Esta constante contiene los datos predeterminados que tendrá
// la página de inicio de Wiki-Craft.

// Se organiza en tres grupos:
// - secciones: apartados principales de la página.
// - novedades: noticias o contenidos destacados.
// - construcciones: imágenes de construcciones de Minecraft.

// Cada grupo es un array (lista) de objetos.
// Cada objeto representa un elemento individual del sitio.

export const CONTENIDO_INICIAL = {

    // --------------------------------------------------------
    // 2.1. SECCIONES PRINCIPALES
    // --------------------------------------------------------

    // Array que almacena las secciones principales de Wiki-Craft.
    secciones: [

        // Primer objeto: representa la sección Comunidad.
        {
            // Identificador propio del elemento.
            // Se utiliza para reconocerlo y almacenarlo en Firebase.
            id: "seccion-comunidad",

            // Nombre que aparecerá en la página.
            titulo: "Comunidad",

            // Descripción que explica qué puede encontrar el visitante.
            descripcion: "Conocé a otros jugadores, compartí tus ideas, mostrá tus construcciones y participá en eventos.",

            // Nombre del archivo de imagen que representa la sección.
            imagen: "comunidad.png",

            // Dirección interna a la que se accederá al hacer clic.
            enlace: "/comunidad",

            // Imagen pequeña utilizada como icono de la sección.
            icono: "dirt.png",

            // Indica que el elemento está habilitado y puede mostrarse.
            // true significa activo y false significa inactivo.
            activo: true,
        },

        // Segundo objeto: representa la sección Versiones.
        {
            id: "seccion-versiones",
            titulo: "Versiones",
            descripcion: "Reviví la historia de Minecraft, explorá cada versión y descubrí todo lo que cambió con el tiempo.",
            imagen: "versiones.png",
            enlace: "/versiones",
            icono: "brush.png",
            activo: true,
        },

        // Tercer objeto: representa la sección Música.
        {
            id: "seccion-musica",
            titulo: "Música",
            descripcion: "Disfrutá de las mejores bandas sonoras, listas y música creada por la comunidad.",
            imagen: "musica-2.jpg",
            enlace: "/musica",
            icono: "note_block.png",
            activo: true,
        },
    ],


    // --------------------------------------------------------
    // 2.2. NOVEDADES
    // --------------------------------------------------------

    // Array que almacena las novedades que aparecen en la página principal.
    novedades: [

        // Primera novedad: tutorial sobre una granja de aldeanos.
        {
            // Identificador único del contenido.
            id: "novedad-granja",

            // Categoría a la que pertenece la publicación.
            categoria: "TUTORIALES",

            // Título que verá el visitante.
            titulo: "Granja automática de aldeanos",

            // Fecha de publicación representada como texto.
            fecha: "12 abr 2026",

            // Nombre del autor de la publicación.
            autor: "NovaBuild",

            // Explicación breve del contenido.
            descripcion: "Paso a paso para construir una granja de aldeanos eficiente y fácil de replicar.",

            // Imagen que acompaña a la novedad.
            imagen: "granja.jpg",

            // Ruta interna a la que llevará el contenido.
            enlace: "/comunidad",

            // Indica que la novedad está habilitada.
            activo: true,
        },

        // Segunda novedad: relacionada con las versiones de Minecraft.
        {
            id: "novedad-version",
            categoria: "VERSIONES",
            titulo: "La versión que cambió todo",
            fecha: "8 abr 2026",
            autor: "ZetaCraft",
            descripcion: "Recordamos la actualización que transformó la forma de jugar Minecraft.",
            imagen: "versioncambio.png",
            enlace: "/versiones",
            activo: true,
        },

        // Tercera novedad: relacionada con la música del juego.
        {
            id: "novedad-playlist",
            categoria: "MÚSICA",
            titulo: "Nueva playlist: sonidos del Overworld",
            fecha: "5 abr 2026",
            autor: "Luma",
            descripcion: "Una selección de los mejores temas del mundo principal, ideal para tus construcciones.",
            imagen: "musica.png",
            enlace: "/musica",
            activo: true,
        },
    ],


    // --------------------------------------------------------
    // 2.3. CONSTRUCCIONES DESTACADAS
    // --------------------------------------------------------

    // Array que almacena las construcciones que se muestran
    // como contenido visual destacado en la página principal.
    construcciones: [

        // Primera construcción: un castillo medieval.
        {
            // Identificador único del elemento.
            id: "construccion-castillo",

            // Nombre que identifica la construcción.
            nombre: "Castillo medieval",

            // Imagen que representa la construcción.
            imagen: "castillo.png",

            // Determina si la construcción está habilitada.
            activo: true
        },

        // Segunda construcción: una casa moderna.
        {
            id: "construccion-casa",
            nombre: "Casa moderna",
            imagen: "casamoderna.jpg",
            activo: true
        },

        // Tercera construcción: un portal del Nether.
        {
            id: "construccion-portal",
            nombre: "Portal del Nether",
            imagen: "portal.jpg",
            activo: true
        },
    ],
};


// ============================================================
// 3. CONFIGURACIÓN DE COLECCIONES DE FIRESTORE
// ============================================================

// Declaramos una constante llamada COLECCIONES.

// Su función es almacenar los nombres de las colecciones
// que utilizaremos dentro de Firebase Firestore.

// Una colección funciona como una carpeta que agrupa documentos
// que contienen información de una misma categoría.

// En este caso tenemos tres colecciones:
// - secciones
// - novedades
// - construcciones

// Centralizar estos nombres en una constante evita tener que
// escribirlos manualmente muchas veces en diferentes funciones.

const COLECCIONES = {

    // Nombre de la colección donde se guardan las secciones.
    secciones: "secciones",

    // Nombre de la colección donde se guardan las novedades.
    novedades: "novedades",

    // Nombre de la colección donde se guardan las construcciones.
    construcciones: "construcciones",
};


// ============================================================
// 4. RELACIÓN ENTRE TIPOS DE CONTENIDO Y COLECCIONES
// ============================================================

// Declaramos otra constante que relaciona los tipos de contenido
// utilizados por las funciones con sus respectivas colecciones.

// Esto permite que las funciones reciban un tipo de contenido
// y automáticamente sepan en qué colección de Firebase trabajar.

// Por ejemplo:
// Si una función recibe "seccion", utilizará la colección "secciones".
// Si recibe "novedad", utilizará la colección "novedades".
// Si recibe "construccion", utilizará la colección "construcciones".

const COLECCION_POR_TIPO = {

    // Relaciona el tipo "seccion" con la colección de secciones.
    seccion: COLECCIONES.secciones,

    // Relaciona el tipo "novedad" con la colección de novedades.
    novedad: COLECCIONES.novedades,

    // Relaciona el tipo "construccion" con la colección de construcciones.
    construccion: COLECCIONES.construcciones,
};


// ============================================================
// 5. INICIALIZACIÓN AUTOMÁTICA DE DATOS
// ============================================================

// Exportamos una función asíncrona que permite cargar
// el contenido inicial de Wiki-Craft en Firebase.

// "async" indica que la función realiza operaciones que pueden
// tardar en completarse, como consultar o escribir en una base de datos.

// "export" permite que otros archivos puedan importar esta función.

// Su característica principal es que es IDEMPOTENTE.

// ¿Qué significa idempotente?
// Significa que podemos ejecutar esta función varias veces
// sin duplicar los datos que ya existen.

// Si un documento ya está guardado, no vuelve a crearlo.
// Si un documento no existe, lo agrega.

// Esto es importante porque evita que cada vez que se inicia
// la aplicación se generen copias innecesarias del contenido.

export async function inicializarInicioIdempotente() {

    // Creamos una constante que almacenará todos los documentos
    // iniciales que queremos comprobar en Firebase.

    // Object.entries():
    // Convierte el objeto CONTENIDO_INICIAL en una lista de pares.
    // Cada par contiene el nombre del grupo y su array de elementos.
    //
    // Ejemplo:
    // ["secciones", [...]]
    // ["novedades", [...]]
    // ["construcciones", [...]]
    //
    // flatMap():
    // Permite recorrer esos grupos y convertirlos en una única lista.
    // A diferencia de map(), también aplana los arrays resultantes.

    const documentosIniciales = Object.entries(CONTENIDO_INICIAL).flatMap(

        // Desestructuración:
        // "tipo" recibe el nombre de la categoría.
        // "items" recibe el array de elementos de esa categoría.
        //
        // Por ejemplo:
        // tipo = "secciones"
        // items = lista de secciones.

        ([tipo, items]) =>

            // map() recorre todos los elementos de la categoría.
            // Por cada elemento genera un nuevo objeto.

            items.map(

                // Desestructuración del objeto:
                // "id" obtiene el identificador del elemento.
                // "...datos" obtiene todas las propiedades restantes.
                //
                // Los tres puntos (...) representan el operador REST.
                // En este caso permite separar el identificador
                // del resto de la información del objeto.

                ({ id, ...datos }) => ({

                    // referencia:
                    // Crea una referencia al documento de Firebase.
                    //
                    // doc() recibe tres argumentos:
                    // 1. db: conexión con Firestore.
                    // 2. COLECCIONES[tipo]: nombre de la colección.
                    // 3. id: identificador del documento.
                    //
                    // De esta manera cada elemento tendrá una ubicación
                    // específica dentro de la base de datos.

                    referencia: doc(db, COLECCIONES[tipo], id),

                    // datos:
                    // Guarda todas las propiedades del elemento,
                    // excepto el identificador que ya utilizamos
                    // para construir la referencia del documento.

                    datos,
                })
            )
    );


    // Iniciamos una transacción de Firebase.
    // Una transacción permite realizar varias operaciones
    // de lectura y escritura de manera controlada.

    // La palabra "await" hace que JavaScript espere a que
    // la transacción termine antes de continuar con la función.

    await runTransaction(db, async (transaccion) => {

        // Consultamos todos los documentos iniciales para comprobar
        // cuáles existen actualmente en Firebase.

        // Promise.all():
        // Ejecuta todas las consultas y espera a que terminen.
        // Devuelve un array con los resultados de cada consulta.

        // transaccion.get():
        // Obtiene el contenido de un documento específico
        // utilizando la referencia que creamos anteriormente.

        const existentes = await Promise.all(

            // map() recorre todos los documentos iniciales.
            // Por cada uno realiza una consulta para verificar su existencia.

            documentosIniciales.map(
                ({ referencia }) => transaccion.get(referencia)
            )
        );


        // Recorremos los resultados obtenidos de las consultas.
        // forEach() ejecuta una función por cada elemento del array.

        // "snapshot" representa el resultado de consultar un documento.
        // "indice" indica la posición de ese resultado dentro del array.

        existentes.forEach((snapshot, indice) => {

            // snapshot.exists() comprueba si el documento existe en Firebase.
            //
            // El operador ! significa negación.
            // Por lo tanto, !snapshot.exists() significa:
            // "Si el documento NO existe".

            if (!snapshot.exists()) {

                // Si el documento no existe, lo creamos en Firebase.

                // transaccion.set():
                // Guarda un documento utilizando la referencia indicada.
                // Si el documento no existiera, lo crea con estos datos.

                transaccion.set(

                    // Recuperamos la referencia del documento
                    // correspondiente a la posición actual del array.
                    documentosIniciales[indice].referencia,

                    // Creamos el objeto que se almacenará en Firebase.
                    {

                        // Spread operator:
                        // Copia todas las propiedades del contenido inicial.
                        ...documentosIniciales[indice].datos,

                        // Garantizamos que el documento comience activo.
                        activo: true,

                        // Guarda la fecha de creación utilizando
                        // el horario generado por los servidores de Firebase.
                        createdAt: serverTimestamp(),

                        // Guarda la fecha de la última actualización.
                        fechaActualizacion: serverTimestamp(),
                    }
                );
            }
        });
    });
}


// ============================================================
// 6. SUSCRIPCIÓN A LOS CAMBIOS DE FIREBASE
// ============================================================

// Exportamos una función que permite escuchar los cambios
// que ocurren en las colecciones de la página de inicio.

// Recibe tres parámetros:
//
// 1. onDatosActualizados:
// Es una función que se ejecutará cuando Firebase entregue
// información nueva o actualizada.
//
// 2. onError:
// Es una función que se ejecutará si ocurre algún error
// durante la conexión o consulta.
//
// 3. incluirInactivos:
// Es un parámetro opcional que por defecto vale false.
// Si es false, solamente se reciben elementos activos.
// Si es true, también se reciben los elementos inactivos.
//
// Esto permite utilizar la misma función tanto para visitantes
// como para administradores.

export function suscribirseAInicio(
    onDatosActualizados,
    onError,
    incluirInactivos = false
) {

    // Creamos una función interna llamada escucharColeccion.
    // Esta función permite escuchar cualquiera de las tres colecciones
    // sin tener que repetir todo el código de consulta.

    // Recibe "tipo", que indica qué colección queremos escuchar.
    const escucharColeccion = (tipo) => {

        // collection() crea una referencia a la colección indicada.
        // Utilizamos el objeto COLECCIONES para obtener su nombre.

        // Por ejemplo:
        // escucharColeccion("secciones")
        // obtiene la referencia a la colección "secciones".

        const referencia = collection(db, COLECCIONES[tipo]);


        // Creamos una consulta que dependerá del parámetro incluirInactivos.

        // Operador ternario:
        // Evalúa una condición y elige entre dos alternativas.
        //
        // Si incluirInactivos es true:
        // Se consulta la colección completa.
        //
        // Si incluirInactivos es false:
        // Se utiliza query() y where() para recuperar
        // únicamente los documentos cuyo campo "activo" sea true.

        const consulta = incluirInactivos

            // Alternativa para administradores:
            // Obtiene todos los documentos, estén activos o inactivos.
            ? referencia

            // Alternativa para visitantes:
            // Obtiene solamente los documentos activos.
            : query(referencia, where("activo", "==", true));


        // onSnapshot() establece una escucha en tiempo real.
        // Esto significa que Firebase notificará automáticamente
        // cuando cambie la información de la consulta.

        // Recibe tres argumentos:
        // 1. La consulta que queremos escuchar.
        // 2. Una función que procesa los datos recibidos.
        // 3. Una función que procesa posibles errores.

        return onSnapshot(

            // Consulta que se va a escuchar.
            consulta,

            // Esta función se ejecuta cuando Firebase entrega
            // los documentos de la colección o cuando se modifican.

            (snapshot) => {

                // Creamos un array llamado items con los documentos recibidos.

                // snapshot.docs:
                // Contiene todos los documentos que devolvió la consulta.

                // map():
                // Recorre cada documento y crea un objeto nuevo.

                const items = snapshot.docs.map((documento) => ({

                    // documento.id obtiene el identificador propio
                    // que Firebase asignó al documento.

                    id: documento.id,

                    // documento.data() obtiene todos los campos
                    // y valores almacenados dentro del documento.

                    // El operador spread (...) incorpora esos campos
                    // al objeto que estamos construyendo.

                    ...documento.data(),
                }));


                // Ejecutamos la función que recibimos como parámetro.
                //
                // Le entregamos dos valores:
                // 1. tipo: indica qué colección se actualizó.
                // 2. items: contiene los documentos obtenidos.
                //
                // De esta manera, el componente que utiliza este servicio
                // puede saber qué información recibió y actualizar su estado.

                onDatosActualizados(tipo, items);
            },

            // Si Firebase encuentra un error durante la escucha,
            // ejecuta la función onError que recibimos al llamar
            // a suscribirseAInicio().
            onError
        );
    };


    // Iniciamos tres escuchas independientes.
    // Cada una se encarga de una colección diferente.

    // Escucha los cambios de las secciones.
    const unsubSecciones = escucharColeccion("secciones");

    // Escucha los cambios de las novedades.
    const unsubNovedades = escucharColeccion("novedades");

    // Escucha los cambios de las construcciones.
    const unsubConstrucciones = escucharColeccion("construcciones");


    // Devolvemos una función que permite cancelar las tres escuchas.

    // ¿Para qué sirve?
    // onSnapshot() mantiene una conexión activa con Firebase.
    // Si dejamos esas conexiones funcionando cuando ya no necesitamos
    // los datos, podemos generar consumo innecesario de recursos.

    // Cuando el componente que utiliza este servicio se desmonta,
    // puede ejecutar esta función para detener las escuchas.

    return () => {

        // Cancela la escucha de la colección de secciones.
        unsubSecciones();

        // Cancela la escucha de la colección de novedades.
        unsubNovedades();

        // Cancela la escucha de la colección de construcciones.
        unsubConstrucciones();
    };
}


// ============================================================
// 7. CREACIÓN DE CONTENIDO
// ============================================================

// Exportamos una función asíncrona que permite crear
// un nuevo elemento dentro de Firebase.

// Recibe dos parámetros:
//
// tipo:
// Indica qué clase de contenido queremos crear.
// Puede ser "seccion", "novedad" o "construccion".
//
// datos:
// Es un objeto que contiene la información del nuevo elemento.
// Por ejemplo, su título, descripción, imagen, enlace, etc.

export async function crearItemFirestore(tipo, datos) {

    // Buscamos en COLECCION_POR_TIPO cuál es la colección
    // que corresponde al tipo de contenido recibido.

    // Por ejemplo:
    // Si tipo = "seccion", nombreCol será "secciones".

    const nombreCol = COLECCION_POR_TIPO[tipo];


    // Verificamos que el tipo de contenido sea válido.
    //
    // Si nombreCol no existe o no tiene un valor válido,
    // se ejecuta throw new Error().
    //
    // throw permite lanzar un error y detener la ejecución
    // de la función en ese punto.

    if (!nombreCol) throw new Error("Tipo de contenido inválido");


    // Creamos un nuevo objeto que contiene toda la información
    // que queremos guardar en Firebase.

    const nuevoDoc = {

        // Spread operator:
        // Copia todas las propiedades recibidas en el parámetro datos.
        ...datos,

        // Establecemos que el nuevo contenido esté activo
        // desde el momento en que se crea.
        activo: true,

        // Guardamos la fecha y hora de creación o actualización.
        //
        // new Date() obtiene la fecha y hora actuales del dispositivo.
        // toISOString() convierte esa fecha en un texto
        // con un formato estándar internacional.
        fechaActualizacion: new Date().toISOString(),
    };


    // addDoc() guarda un documento nuevo dentro de Firebase.
    //
    // collection(db, nombreCol):
    // Indica en qué colección queremos guardar la información.
    //
    // nuevoDoc:
    // Contiene todos los datos que se van a almacenar.
    //
    // Firebase genera automáticamente un identificador único
    // para el documento creado.

    await addDoc(collection(db, nombreCol), nuevoDoc);
}


// ============================================================
// 8. EDICIÓN DE CONTENIDO
// ============================================================

// Exportamos una función asíncrona para modificar
// un elemento que ya existe en Firebase.

// Recibe tres parámetros:
//
// tipo:
// Indica la categoría del contenido que queremos modificar.
//
// id:
// Identificador del documento que queremos editar.
//
// datos:
// Objeto que contiene los nuevos valores que queremos guardar.

export async function editarItemFirestore(tipo, id, datos) {

    // Determinamos en qué colección se encuentra el documento
    // utilizando el tipo de contenido recibido.

    const nombreCol = COLECCION_POR_TIPO[tipo];


    // Comprobamos que la categoría recibida sea válida.
    // Si no existe una colección asociada, detenemos la función
    // y mostramos un error.

    if (!nombreCol) throw new Error("Tipo de contenido inválido");


    // Creamos una copia del objeto datos.
    //
    // Utilizamos spread operator (...) para copiar sus propiedades.
    // De esta manera podemos modificar la copia sin alterar
    // directamente el objeto original recibido como parámetro.

    const datosActualizables = { ...datos };


    // Eliminamos la propiedad "id" del objeto que vamos a actualizar.
    //
    // delete es una instrucción de JavaScript que permite
    // quitar una propiedad de un objeto.
    //
    // Esto evita intentar modificar el identificador del documento
    // como si fuera un campo normal de su contenido.

    delete datosActualizables.id;


    // Creamos una referencia al documento específico que queremos editar.
    //
    // doc() recibe:
    // 1. db: conexión con Firebase.
    // 2. nombreCol: colección donde se encuentra el documento.
    // 3. id: identificador del documento que queremos modificar.

    const docRef = doc(db, nombreCol, id);


    // updateDoc() actualiza los campos del documento indicado.
    // No reemplaza todo el documento: modifica los campos enviados.

    await updateDoc(docRef, {

        // Incorporamos todos los datos que queremos actualizar.
        // Utilizamos la copia sin la propiedad id.
        ...datosActualizables,

        // Actualizamos el estado del elemento.
        //
        // La condición datos.activo !== false significa:
        // Si activo es exactamente false, el resultado será false.
        // Si es true, undefined u otro valor distinto de false,
        // el resultado será true.
        //
        // Esto permite que el contenido permanezca activo
        // salvo que se indique expresamente lo contrario.

        activo: datos.activo !== false,

        // Registramos la fecha y hora de la última modificación.
        fechaActualizacion: new Date().toISOString(),
    });
}


// ============================================================
// 9. ACTIVACIÓN Y DESACTIVACIÓN DE CONTENIDO
// ============================================================

// Exportamos una función asíncrona que permite cambiar
// el estado de un elemento entre activo e inactivo.

// Recibe tres parámetros:
//
// tipo:
// Indica si estamos trabajando con una sección,
// una novedad o una construcción.
//
// id:
// Identificador del documento que queremos modificar.
//
// estadoActual:
// Valor booleano que indica el estado actual del elemento.
// true significa activo.
// false significa inactivo.

// IMPORTANTE:
// Esta función NO elimina documentos de Firebase.
// Solamente cambia su estado para controlar si se muestran
// o no en las partes públicas de Wiki-Craft.

export async function cambiarEstadoActivoFirestore(tipo, id, estadoActual) {

    // Identificamos la colección correspondiente al tipo recibido.
    const nombreCol = COLECCION_POR_TIPO[tipo];


    // Comprobamos que el tipo de contenido sea válido.
    // Si no existe una colección asociada, lanzamos un error.

    if (!nombreCol) throw new Error("Tipo de contenido inválido");


    // Creamos una referencia al documento que queremos modificar.
    //
    // Se utiliza el identificador recibido para localizar
    // exactamente el elemento dentro de su colección.

    const docRef = doc(db, nombreCol, id);


    // updateDoc() modifica únicamente los campos que indicamos.
    //
    // En este caso actualizamos el estado activo y la fecha
    // de la última modificación.

    await updateDoc(docRef, {

        // Operador de negación (!):
        // Invierte el valor booleano del estado actual.
        //
        // Si estadoActual es true, pasa a false.
        // Si estadoActual es false, pasa a true.
        //
        // De esta manera se puede activar o desactivar
        // un elemento sin eliminarlo de la base de datos.

        activo: !estadoActual,

        // Guardamos la fecha y hora en que se realizó el cambio.
        fechaActualizacion: new Date().toISOString(),
    });
}
