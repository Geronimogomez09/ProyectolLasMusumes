// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. COLECCIONES, ICONOS, CONFIGURACIÓN Y FORMULARIOS INICIALES
// 3. NORMALIZACIÓN DE DOCUMENTOS DE FIRESTORE
// 4. COMPONENTE PRINCIPAL Y ESTADOS ADMINISTRATIVOS
// 5. DESPLAZAMIENTO AUTOMÁTICO DEL FORMULARIO
// 6. SUSCRIPCIONES EN TIEMPO REAL AL CATÁLOGO MUSICAL
// 7. DATOS DERIVADOS, CONTEOS, BÚSQUEDA Y FILTROS
// 8. RESOLUCIÓN DE RELACIONES Y PORTADAS
// 9. APERTURA, EDICIÓN Y CIERRE DE FORMULARIOS
// 10. IDENTIFICADORES, VALIDACIONES Y GUARDADO
// 11. PUBLICACIÓN, PAPELERA Y RESTAURACIÓN
// 12. SELECTOR DE CANCIONES
// 13. FORMULARIO DINÁMICO
// 14. FILAS DE LAS TABLAS Y ENCABEZADOS
// 15. RENDERIZADO DE LA PAPELERA
// 16. INTERFAZ PRINCIPAL DEL ADMINISTRADOR
// 17. EXPORTACIÓN DEL COMPONENTE


// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos React y los hooks que permiten controlar el comportamiento del componente.
//
// - useEffect: ejecuta procesos secundarios cuando el componente se monta o cuando
//   cambian determinadas dependencias. También permite limpiar suscripciones.
// - useMemo: memoriza el resultado de un cálculo para evitar repetirlo cuando sus
//   dependencias no han cambiado.
// - useRef: conserva una referencia a un elemento o valor sin provocar renderizados.
// - useState: crea estados internos que permiten actualizar la interfaz.
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// Importamos useNavigate de React Router.
// Esta función permite cambiar de ruta desde JavaScript, por ejemplo, para volver
// a la biblioteca musical cuando se presiona el botón administrativo.
import { useNavigate } from 'react-router-dom';

// Importamos las herramientas necesarias de Firebase Firestore.
//
// - collection: obtiene una referencia a una colección de documentos.
// - doc: obtiene una referencia a un documento específico.
// - onSnapshot: establece una suscripción en tiempo real a una colección o documento.
// - getDocs: consulta los documentos existentes en una colección.
// - setDoc: crea o reemplaza un documento con un ID determinado.
// - updateDoc: actualiza campos de un documento existente.
// - serverTimestamp: genera una marca de tiempo usando la hora del servidor de Firebase.
// - writeBatch: permite agrupar varias escrituras para confirmarlas como una operación.
import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

// Importamos los componentes compartidos del proyecto.
//
// - BotonAdmin: botón flotante que permite regresar o alternar hacia la sección musical.
// - Header: encabezado general del sitio.
// - Footer: pie de página general.
import BotonAdmin from '../components/botonAdmin';
import Header from '../components/header';
import Footer from '../components/Footer';

// Importamos la conexión configurada con Firebase.
// La variable db representa la instancia de Firestore que utiliza este componente.
import { db } from '../services/firebase';

// Importamos los estilos generales y los estilos específicos del acordeón.
import '../styles/maestro-melodias.css';
import '../styles/maestro-melodias-accordion.css';

// Importamos el botón encargado de iniciar la importación del catálogo musical.
// Su funcionamiento interno está definido en su propio componente.
import ImportarCatalogoButton from '../components/music/ImportarCatalogoButton';


// 2. COLECCIONES, ICONOS, CONFIGURACIÓN Y FORMULARIOS INICIALES

// COLECCIONES:
// Este objeto relaciona los nombres internos utilizados por React con los nombres
// reales de las colecciones almacenadas en Firestore.
//
// Por ejemplo:
// - canciones es la clave que utiliza el componente.
// - 'canciones' es el nombre de la colección en Firebase.
//
// Centralizar estos nombres evita repetirlos manualmente en diferentes funciones.
// También permite recorrer todas las colecciones mediante Object.entries() u Object.keys().
const COLECCIONES = {
  canciones: 'canciones',
  albumes: 'albumes',
  playlists: 'playlists',
  compositores: 'compositores',
};


// ICONOS DEL PANEL:
// Almacena las rutas de las imágenes utilizadas en las diferentes secciones del
// administrador.
//
// Cada propiedad identifica un recurso visual:
// - canciones, albumes, playlists y compositores representan las categorías.
// - papelera identifica el apartado de elementos eliminados.
// - agregar y editar representan acciones de administración.
// - borrador identifica el estado de contenido no publicado.
// - tocadiscos representa visualmente el panel.
// - importar identifica la herramienta de importación.
//
// De esta manera, el JSX puede acceder a las imágenes mediante ICONOS_MAESTRO[key]
// sin tener que escribir cada ruta directamente en los elementos visuales.
const ICONOS_MAESTRO = {
  canciones: '/music/iconos/disco_musical.png',
  albumes: '/music/iconos/estanteria.png',
  playlists: '/music/iconos/cofre_ender.gif',
  compositores: '/music/iconos/aldeano_bibliotecario.png',
  papelera: '/music/iconos/cubo_de_lava.png',
  agregar: '/music/iconos/libro_y_pluma.png',
  editar: '/music/iconos/yunque.png',
  borrador: '/music/iconos/disco_roto.png',
  tocadiscos: '/music/iconos/tocadiscos.png',
  importar: '/music/iconos/enderpearl.png',
};


// CONFIGURACIÓN PRESENTABLE:
// Define los textos que necesita cada sección para mostrarse correctamente.
//
// Cada tipo de contenido tiene:
// - label: nombre visible de la categoría.
// - singular: nombre individual del elemento.
// - icon: símbolo textual asociado a la categoría.
// - description: explicación breve que aparece en el acordeón.
//
// Por ejemplo, CONFIG.canciones.label devuelve "Canciones", mientras que
// CONFIG.canciones.singular devuelve "canción".
//
// Esta estructura permite reutilizar los mismos formularios, mensajes y encabezados
// para distintas categorías, cambiando únicamente el tipo seleccionado.
const CONFIG = {
  canciones: {
    label: 'Canciones',
    singular: 'canción',
    icon: '♫',
    description: 'Administrá el repertorio, los archivos de audio y su publicación.',
  },
  albumes: {
    label: 'Álbumes',
    singular: 'álbum',
    icon: '▣',
    description: 'Organizá las canciones, portadas y datos de cada álbum.',
  },
  playlists: {
    label: 'Playlists',
    singular: 'playlist',
    icon: '☷',
    description: 'Creá listas y elegí qué canciones forman parte de ellas.',
  },
  compositores: {
    label: 'Compositores',
    singular: 'compositor',
    icon: '♙',
    description: 'Mantené actualizada la información de los creadores.',
  },
  papelera: {
    label: 'Papelera',
    singular: 'elemento',
    icon: '⌫',
    description: 'Restaurá contenido eliminado sin perder sus datos.',
  },
};


// FORMULARIOS VACÍOS:
// Establece los valores iniciales de cada formulario.
//
// Estos objetos se utilizan cuando se crea un contenido nuevo. Cada propiedad coincide
// con el nombre de un campo que posteriormente se utiliza en los inputs.
//
// Es importante que los campos tengan valores iniciales:
// - Los textos comienzan como cadenas vacías ('').
// - Las selecciones múltiples comienzan como arrays vacíos ([]).
// - Las opciones booleanas comienzan como false.
//
// Esto permite trabajar con inputs controlados de React, es decir, elementos cuyo valor
// depende directamente del estado form.
//
// songs es un array porque un álbum o una playlist pueden contener varias canciones.
// system comienza en false porque este formulario crea playlists personalizadas,
// no playlists automáticas o pertenecientes al sistema.
const EMPTY = {
  canciones: {
    title: '',
    composerId: '',
    albumId: '',
    audio: '',
  },
  albumes: {
    title: '',
    year: '',
    description: '',
    cover: '',
    composerId: '',
    songs: [],
  },
  playlists: {
    title: '',
    description: '',
    cover: '',
    songs: [],
    system: false,
  },
  compositores: {
    name: '',
    realName: '',
    description: '',
    image: '',
  },
};


// 3. NORMALIZACIÓN DE DOCUMENTOS DE FIRESTORE

// FUNCIÓN: normalizarDocumento()
//
// Propósito:
// Adaptar los documentos recibidos desde Firestore al formato de datos que necesita
// el administrador.
//
// Parámetro:
// - documento: documento individual recibido desde una consulta o snapshot de Firestore.
//
// Proceso:
// 1. Recupera las propiedades almacenadas dentro del documento mediante data().
// 2. Determina el estado de publicación.
// 3. Devuelve un objeto nuevo con los datos originales y algunas propiedades normalizadas.
//
// Firestore mantiene el ID del documento separado de sus datos internos. Por eso,
// documento.id permite recuperar el identificador y documento.data() permite obtener
// las propiedades guardadas.
//
// La función contempla documentos antiguos que quizás no tengan la propiedad status.
// En esos casos, utiliza el campo published como referencia para deducir el estado.
//
// El operador ?? (Nullish Coalescing) utiliza el valor de la derecha solamente cuando
// el de la izquierda es null o undefined.
//
// Por ejemplo:
// datos.status ?? 'published'
//
// Si datos.status existe, se conserva. Si no existe, se utiliza el valor alternativo.
//
// Esta función no escribe en Firestore. Únicamente transforma los datos recibidos
// antes de almacenarlos en el estado local de React.
function normalizarDocumento(documento) {
  // Recuperamos las propiedades almacenadas dentro del documento de Firestore.
  const datos = documento.data();

  // Determinamos el estado del contenido.
  //
  // Si datos.status ya existe, se utiliza directamente.
  // Si no existe, se consulta el antiguo campo published:
  // - published === false: el documento se considera borrador.
  // - En cualquier otro caso: se considera publicado.
  const status =
    datos.status ?? (datos.published === false ? 'draft' : 'published');

  // Devolvemos un objeto nuevo utilizando el operador spread (...).
  //
  // ...datos copia todas las propiedades originales.
  // Luego se agregan o reemplazan las propiedades normalizadas:
  // - id: convierte el ID del documento a número.
  // - status: guarda el estado calculado.
  // - published: mantiene una representación booleana del estado.
  // - activo: considera activo todo documento que no tenga activo=false.
  //
  // El operador !== compara si un valor es diferente del indicado.
  // Por eso, datos.activo !== false devuelve true cuando activo no existe,
  // es true o tiene cualquier valor diferente de false.
  return {
    ...datos,
    id: Number(documento.id),
    status,
    published: status === 'published',
    activo: datos.activo !== false,
  };
}


// 4. COMPONENTE PRINCIPAL Y ESTADOS ADMINISTRATIVOS

// COMPONENTE: MaestroMelodias()
//
// Es el componente principal de la pantalla administrativa.
//
// Su responsabilidad es coordinar:
// - La lectura de canciones, álbumes, playlists y compositores.
// - La búsqueda y el filtrado de los elementos.
// - La creación y edición de documentos.
// - La publicación y despublicación de contenido.
// - El envío de elementos a la papelera y su restauración.
// - La representación de tablas, formularios y estadísticas.
//
// No recibe props externas. Obtiene la información desde Firestore y controla su
// propia interfaz mediante estados de React.
function MaestroMelodias() {

  // NAVEGACIÓN:
  // useNavigate() proporciona una función para cambiar de página desde el código.
  // Se utiliza al final del componente para volver a la sección musical mediante
  // navigate('/musica').
  const navigate = useNavigate();


  // REFERENCIA DEL FORMULARIO:
  // useRef crea una referencia persistente que no provoca un nuevo renderizado cuando
  // cambia su propiedad current.
  //
  // formRef se conecta más adelante con la sección HTML del formulario.
  // Así se puede desplazar la página hasta ese elemento cuando se abre.
  const formRef = useRef(null);


  // ESTADO: data
  //
  // Guarda los documentos recibidos desde las cuatro colecciones de Firestore.
  //
  // Cada propiedad contiene un array:
  // - canciones: documentos de canciones.
  // - albumes: documentos de álbumes.
  // - playlists: documentos de playlists.
  // - compositores: documentos de compositores.
  //
  // Los arrays comienzan vacíos porque los datos todavía no fueron recibidos
  // desde Firebase cuando se produce el primer renderizado.
  const [data, setData] = useState({
    canciones: [],
    albumes: [],
    playlists: [],
    compositores: [],
  });


  // ESTADOS DE CARGA Y ERROR:
  //
  // loading indica si las colecciones todavía están esperando su primera respuesta.
  // error almacena un mensaje cuando ocurre un problema al recuperar información.
  //
  // setLoading y setError son las funciones que permiten modificar estos estados.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // ESTADOS DE NAVEGACIÓN Y FILTRADO:
  //
  // openSection identifica qué sección del acordeón está abierta.
  // Inicialmente se muestra la sección de canciones.
  //
  // search almacena el texto escrito en el buscador.
  //
  // statusFilter determina qué estados se muestran:
  // - all: todos los estados.
  // - published: solamente publicados.
  // - draft: solamente borradores.
  const [openSection, setOpenSection] = useState('canciones');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');


  // ESTADOS DEL FORMULARIO:
  //
  // editing permite saber si el formulario está creando o editando un documento.
  // Si es null, no existe una edición activa.
  //
  // form almacena los valores escritos o seleccionados en los campos.
  //
  // showForm determina si el formulario debe aparecer en pantalla.
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [showForm, setShowForm] = useState(false);


  // ESTADOS DE GUARDADO Y MENSAJES:
  //
  // saving indica que se está ejecutando una operación de escritura en Firestore.
  // Se utiliza, por ejemplo, para deshabilitar botones mientras se guarda.
  //
  // message almacena mensajes de confirmación o advertencia relacionados con
  // las operaciones administrativas.
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');


// 5. DESPLAZAMIENTO AUTOMÁTICO DEL FORMULARIO

  // useEffect ejecuta este proceso después de que React actualiza la interfaz.
  //
  // Si showForm es true y formRef.current contiene una referencia válida,
  // se desplaza la página hasta el formulario.
  //
  // scrollIntoView() es un método del DOM que lleva un elemento a la zona visible.
  //
  // Sus opciones:
  // - behavior: 'smooth' realiza el desplazamiento de manera animada.
  // - block: 'start' alinea el comienzo del elemento con el inicio del área visible.
  //
  // El array [showForm] indica que el efecto solamente debe repetirse cuando
  // cambia el estado de visibilidad del formulario.
  //
  // Por ejemplo:
  // - showForm pasa de false a true: se desplaza hasta el formulario.
  // - Se modifica un input: el efecto no se repite.
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [showForm]);


// 6. SUSCRIPCIONES EN TIEMPO REAL AL CATÁLOGO MUSICAL

  // Este efecto establece conexiones de escucha con las cuatro colecciones de Firestore.
  //
  // onSnapshot permite recibir automáticamente los cambios que se producen en la base
  // de datos. Por eso, cuando un administrador agrega, modifica, publica o restaura
  // contenido, la interfaz puede actualizarse sin tener que recargar la página.
  //
  // El array de dependencias vacío [] indica que el efecto se ejecuta al montar
  // el componente y que su función de limpieza se ejecuta cuando se desmonta.

  useEffect(() => {

    // unsubscribers guarda las funciones que permiten cancelar cada suscripción.
    // Se necesita conservarlas para cerrar las conexiones cuando el componente
    // deja de estar montado.
    const unsubscribers = [];


    // loaded es un Set, una estructura que almacena valores únicos.
    //
    // Se utiliza para registrar qué colecciones ya enviaron su primera respuesta.
    // Si una colección vuelve a emitir información, su clave no se duplica.
    const loaded = new Set();


    // Object.entries() transforma COLECCIONES en un array de pares.
    //
    // Ejemplo:
    // ['canciones', 'canciones']
    // ['albumes', 'albumes']
    //
    // forEach() recorre cada par y ejecuta una función.
    //
    // key representa la clave que utiliza React.
    // collectionName representa el nombre de la colección en Firestore.
    Object.entries(COLECCIONES).forEach(([key, collectionName]) => {

      // onSnapshot establece una escucha en tiempo real sobre la colección indicada.
      //
      // collection(db, collectionName) construye la referencia:
      // - db: conexión con Firestore.
      // - collectionName: nombre de la colección que queremos escuchar.
      //
      // La función devuelve unsubscribe, que permite detener esta escucha.
      const unsubscribe = onSnapshot(
        collection(db, collectionName),

        // PRIMER CALLBACK: RESPUESTA EXITOSA
        //
        // snapshot representa el conjunto de documentos recibido desde Firestore.
        // snapshot.docs contiene los documentos individuales.
        (snapshot) => {

          // Actualizamos únicamente la colección que acaba de responder.
          //
          // previous representa el estado anterior.
          // ...previous conserva las demás colecciones.
          // [key] utiliza una propiedad dinámica para actualizar la colección correcta.
          //
          // snapshot.docs.map(normalizarDocumento) recorre todos los documentos
          // y aplica la función normalizarDocumento a cada uno.
          setData((previous) => ({
            ...previous,
            [key]: snapshot.docs.map(normalizarDocumento),
          }));


          // Registramos que esta colección ya respondió.
          loaded.add(key);


          // Comprobamos si todas las colecciones enviaron su primera respuesta.
          //
          // Object.keys(COLECCIONES).length devuelve la cantidad total de colecciones.
          // loaded.size devuelve cuántas colecciones distintas ya fueron cargadas.
          //
          // Cuando ambas cantidades coinciden, dejamos de mostrar el estado de carga.
          if (loaded.size === Object.keys(COLECCIONES).length) {
            setLoading(false);
          }
        },


        // SEGUNDO CALLBACK: ERROR DE LECTURA
        //
        // Si Firestore no puede recuperar una colección, se ejecuta esta función.
        // err contiene los detalles del error recibido.
        (err) => {

          // Registramos el error en la consola para facilitar su diagnóstico.
          console.error(`Error al cargar ${collectionName}:`, err);


          // Mostramos un mensaje general en la interfaz.
          // Se indica que el problema podría estar relacionado con los permisos
          // configurados en Firestore.
          setError(
            `No se pudo cargar ${collectionName}. Revisá los permisos de Firestore.`
          );


          // Desactivamos la carga para evitar que el panel quede esperando
          // indefinidamente después de un error.
          setLoading(false);
        }
      );


      // Guardamos el cancelador de esta suscripción.
      // Luego se utilizará en la función de limpieza del efecto.
      unsubscribers.push(unsubscribe);
    });


    // FUNCIÓN DE LIMPIEZA:
    //
    // React ejecuta esta función cuando el componente se desmonta.
    // También puede ejecutarla antes de volver a establecer el efecto.
    //
    // forEach recorre todos los canceladores guardados y detiene cada escucha.
    // Esto evita mantener suscripciones innecesarias cuando la pantalla ya no existe.
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);


// 7. DATOS DERIVADOS, CONTEOS, BÚSQUEDA Y FILTROS

  // FUNCIÓN AUXILIAR: active()
  //
  // Recibe el nombre de una colección y devuelve solamente los documentos activos.
  //
  // Parámetro:
  // - key: nombre interno de la colección, por ejemplo 'canciones' o 'albumes'.
  //
  // filter() crea un nuevo array con los elementos que cumplen la condición.
  // En este caso, se conservan los documentos cuya propiedad activo sea true.
  //
  // No modifica data ni elimina documentos de Firestore.
  const active = (key) =>
    data[key].filter((item) => item.activo);


  // ELEMENTOS ELIMINADOS:
  //
  // Construye una lista que reúne los documentos inactivos de todas las colecciones.
  //
  // Object.entries(COLECCIONES) permite recorrer cada colección y conocer:
  // - key: clave interna.
  // - collectionName: nombre real de Firestore.
  //
  // flatMap() combina los arrays que devuelve cada recorrido en un único array.
  //
  // Primero filter() conserva los documentos cuyo activo no es true.
  // Luego map() crea una copia de cada documento y agrega dos metadatos:
  // - _type: identifica a qué categoría pertenece.
  // - _collection: conserva el nombre de la colección original.
  //
  // Estos metadatos permiten que restoreItem() sepa en qué colección debe buscar
  // el documento para restaurarlo.
  //
  // El guion bajo inicial indica que son propiedades auxiliares de la interfaz.
  const deleted = Object.entries(COLECCIONES).flatMap(
    ([key, collectionName]) =>
      data[key]
        .filter((item) => !item.activo)
        .map((item) => ({
          ...item,
          _type: key,
          _collection: collectionName,
        }))
  );


  // LISTA DE CANCIONES ACTIVAS:
  // Reutiliza active() para obtener únicamente las canciones que no están en la papelera.
  const activeSongs = active('canciones');


  // COMPOSITORES DISPONIBLES:
  //
  // Primero se recuperan los compositores activos.
  // Después se filtran nuevamente para conservar solo los publicados.
  //
  // Esta lista se utiliza en los selectores de canciones y álbumes.
  const availableComposers = active('compositores').filter(
    (item) => item.status === 'published'
  );


  // ÁLBUMES DISPONIBLES:
  //
  // Aplica el mismo criterio que availableComposers.
  // Solo se permiten seleccionar álbumes activos y publicados.
  const availableAlbums = active('albumes').filter(
    (item) => item.status === 'published'
  );


  // CONTEOS:
  //
  // Este objeto reúne las cantidades de elementos activos de cada categoría
  // y la cantidad total de documentos que se encuentran en la papelera.
  //
  // length devuelve la cantidad de elementos de cada array.
  // Los valores se utilizan en las tarjetas estadísticas y en los encabezados
  // de las secciones del acordeón.
  const counts = {
    canciones: active('canciones').length,
    albumes: active('albumes').length,
    playlists: active('playlists').length,
    compositores: active('compositores').length,
    papelera: deleted.length,
  };


  // LISTA ACTUAL DE ELEMENTOS: currentItems
  //
  // useMemo memoriza el resultado de los filtros.
  // Esto evita recalcular toda la búsqueda si sus dependencias siguen teniendo
  // los mismos valores.
  //
  // Las dependencias son:
  // - openSection: sección seleccionada.
  // - search: texto de búsqueda.
  // - statusFilter: estado de publicación seleccionado.
  // - data: catálogo recibido desde Firestore.
  //
  // Si cualquiera de estos valores cambia, React vuelve a ejecutar el cálculo.
  const currentItems = useMemo(() => {

    // Si no hay una sección seleccionada, devolvemos un array vacío.
    if (!openSection) return [];


    // CASO ESPECIAL: PAPELERA
    //
    // La papelera no utiliza el filtro de publicación.
    // Por eso, se busca directamente dentro del array deleted.
    if (openSection === 'papelera') {

      return deleted.filter((item) => {

        // Reunimos en una sola cadena los campos que pueden identificar al elemento.
        //
        // Algunos documentos utilizan title, mientras que los compositores utilizan name.
        // realName permite encontrar compositores también por su nombre real.
        const text = [
          item.title,
          item.name,
          item.realName,
        ]

          // filter(Boolean) elimina los valores vacíos, null, undefined y otros
          // valores que JavaScript considera falsos.
          .filter(Boolean)

          // join(' ') combina los valores restantes en una única cadena,
          // separados por espacios.
          .join(' ')

          // toLowerCase() convierte el texto a minúsculas para que la búsqueda
          // no distinga entre mayúsculas y minúsculas.
          .toLowerCase();


        // includes() comprueba si el texto del documento contiene lo escrito
        // en el buscador.
        return text.includes(search.toLowerCase());
      });
    }


    // VALIDACIÓN DE SECCIÓN:
    //
    // COLECCIONES[openSection] comprueba si existe una colección asociada
    // a la sección seleccionada.
    //
    // Si no existe, se devuelve un array vacío para evitar intentar acceder
    // a una propiedad inexistente de data.
    if (!COLECCIONES[openSection]) return [];


    // Recuperamos los documentos de la sección y excluimos los inactivos.
    const items = data[openSection].filter(
      (item) => item.activo
    );


    // Aplicamos simultáneamente la búsqueda por texto y el filtro de publicación.
    return items.filter((item) => {

      // Construimos una cadena de búsqueda con las propiedades que pueden existir
      // en cada tipo de documento.
      //
      // title se utiliza en canciones, álbumes y playlists.
      // name y realName se utilizan en compositores.
      // description permite buscar por parte de una descripción.
      const text = [
        item.title,
        item.name,
        item.realName,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();


      // matchesSearch será true si el texto del elemento contiene la búsqueda.
      const matchesSearch = text.includes(search.toLowerCase());


      // matchesStatus determina si el elemento coincide con el filtro de publicación.
      //
      // Si statusFilter es 'all', todos los estados son válidos.
      // De lo contrario, el estado del documento debe coincidir con el seleccionado.
      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;


      // El operador && significa Y.
      // Por lo tanto, el elemento se muestra solamente cuando cumple ambas condiciones:
      // coincide con el texto y coincide con el estado.
      return matchesSearch && matchesStatus;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSection, search, statusFilter, data]);


// 8. RESOLUCIÓN DE RELACIONES Y PORTADAS

  // FUNCIÓN: getComposerName()
  //
  // Recibe el ID de un compositor y busca su nombre dentro de data.compositores.
  //
  // find() devuelve el primer elemento que cumple la condición.
  // Number(id) convierte el identificador recibido a número para compararlo
  // con el ID almacenado en el documento.
  //
  // El operador ?. (Optional Chaining) evita un error si find() no encuentra
  // ningún compositor. En ese caso, el resultado será undefined.
  //
  // Finalmente, || devuelve el texto alternativo cuando no se encuentra un nombre.
  const getComposerName = (id) =>
    data.compositores.find(
      (item) => item.id === Number(id)
    )?.name || 'Sin compositor';


  // FUNCIÓN: getAlbumName()
  //
  // Funciona de manera similar a getComposerName(), pero busca un álbum.
  // Devuelve su título o el texto 'Sin álbum' si no existe una coincidencia.
  const getAlbumName = (id) =>
    data.albumes.find(
      (item) => item.id === Number(id)
    )?.title || 'Sin álbum';


  // FUNCIÓN: getCover()
  //
  // Recibe:
  // - type: tipo de contenido que se está mostrando.
  // - item: documento completo del elemento.
  //
  // Su objetivo es obtener la imagen adecuada para cada categoría.
  //
  // En las canciones se prioriza la portada del álbum relacionado.
  // Si el álbum no tiene portada, se intenta utilizar item.cover.
  // Para los demás tipos se consulta directamente el campo correspondiente.
  const getCover = (type, item) => {

    // CASO 1: CANCIONES
    //
    // Busca el álbum cuyo ID coincide con item.albumId.
    // Number() normaliza el tipo del identificador para realizar la comparación.
    if (type === 'canciones') {
      const album = data.albumes.find(
        (album) => album.id === Number(item.albumId)
      );

      // Prioridad:
      // 1. Portada del álbum relacionado.
      // 2. Portada propia de la canción.
      // 3. Cadena vacía si ninguna existe.
      return album?.cover || item.cover || '';
    }


    // CASO 2: ÁLBUMES
    // Utiliza directamente la propiedad cover.
    if (type === 'albumes') return item.cover || '';


    // CASO 3: PLAYLISTS
    // Utiliza la portada almacenada en el documento de la playlist.
    if (type === 'playlists') return item.cover || '';


    // CASO 4: COMPOSITORES
    // Los compositores guardan su imagen en la propiedad image.
    if (type === 'compositores') return item.image || '';


    // Si el tipo no corresponde a ninguno de los anteriores, devuelve una cadena vacía.
    return '';
  };


// 9. APERTURA, EDICIÓN Y CIERRE DE FORMULARIOS

  // FUNCIÓN: openNew()
  //
  // Prepara el formulario para crear un documento nuevo.
  //
  // Parámetro:
  // - type: tipo de contenido que se desea crear.
  //
  // Primero comprueba que exista una plantilla EMPTY para ese tipo.
  // Luego selecciona la sección, elimina cualquier edición anterior,
  // copia los valores iniciales y muestra el formulario.
  const openNew = (type) => {

    // Si EMPTY no contiene una plantilla para el tipo recibido, se registra el error
    // en la consola y se detiene la función mediante return.
    if (!EMPTY[type]) {
      console.error('Tipo de formulario inválido:', type);
      return;
    }


    // Actualizamos la sección activa para que coincida con el tipo de contenido.
    setOpenSection(type);


    // null indica que no estamos editando un documento existente.
    setEditing(null);


    // Copiamos el objeto inicial correspondiente.
    //
    // El spread (...EMPTY[type]) crea un objeto nuevo.
    // Esto evita modificar accidentalmente la plantilla original EMPTY.
    setForm({ ...EMPTY[type] });


    // Limpiamos mensajes anteriores.
    setMessage('');


    // Hacemos visible el formulario.
    setShowForm(true);
  };


  // FUNCIÓN: handleAddClick()
  //
  // Se ejecuta al presionar el botón principal de agregar contenido.
  //
  // Si la sección abierta corresponde a una colección válida, utiliza esa sección.
  // Si se encuentra en la papelera o no hay una sección válida, selecciona canciones
  // como tipo predeterminado.
  //
  // Finalmente llama a openNew() para preparar el formulario.
  const handleAddClick = () => {
    const type = COLECCIONES[openSection]
      ? openSection
      : 'canciones';

    openNew(type);
  };


  // FUNCIÓN: openEdit()
  //
  // Prepara el formulario para modificar un documento existente.
  //
  // Parámetros:
  // - type: tipo de documento que se editará.
  // - item: objeto que contiene los datos actuales del documento.
  //
  // Primero bloquea las playlists del sistema.
  // Luego combina los valores iniciales con los datos existentes y realiza
  // algunas conversiones para adaptar los campos a los controles del formulario.
  const openEdit = (type, item) => {

    // Las playlists del sistema tienen una condición especial:
    // no pueden modificarse desde el administrador.
    //
    // Se informa al usuario y se detiene la función.
    if (type === 'playlists' && item.system) {
      setMessage('Las playlists del sistema no se pueden modificar.');
      return;
    }


    // Creamos el objeto inicial combinando dos fuentes:
    // - EMPTY[type]: estructura y valores predeterminados.
    // - item: datos guardados del documento existente.
    //
    // Como item aparece después del spread, sus valores reemplazan los iniciales
    // cuando las propiedades coinciden.
    let initial = {
      ...EMPTY[type],
      ...item,
    };


    // CONFIGURACIÓN ESPECIAL PARA ÁLBUMES
    if (type === 'albumes') {

      // Reconstruimos la lista de canciones seleccionadas.
      //
      // Array.isArray() comprueba que item.songs sea realmente un array.
      // item.songs.length verifica que tenga al menos un elemento.
      //
      // Si existe una lista válida, map(Number) convierte todos sus IDs a números.
      // Si no existe, se buscan las canciones que tengan este álbum asignado
      // mediante su propiedad albumId.
      //
      // Esto permite editar documentos antiguos que todavía no guardaban
      // la relación de canciones dentro de item.songs.
      initial.songs =
        Array.isArray(item.songs) && item.songs.length
          ? item.songs.map(Number)
          : data.canciones
              .filter(
                (song) => Number(song.albumId) === item.id
              )
              .map((song) => song.id);


      // El compositor principal puede estar guardado en composerId
      // o dentro del array composerIds.
      //
      // ?? permite utilizar composerIds[0] cuando composerId no existe.
      // String() convierte el resultado a texto porque los selectores HTML
      // trabajan normalmente con valores de tipo string.
      initial.composerId = String(
        item.composerId ?? item.composerIds?.[0] ?? ''
      );
    }


    // CONFIGURACIÓN ESPECIAL PARA CANCIONES
    if (type === 'canciones') {

      // Convertimos los identificadores a texto para que coincidan con los valores
      // de los elementos select del formulario.
      //
      // Si una relación no existe, se utiliza una cadena vacía.
      initial.composerId = String(item.composerId ?? '');
      initial.albumId = String(item.albumId ?? '');
    }


    // CONFIGURACIÓN ESPECIAL PARA PLAYLISTS
    if (type === 'playlists') {

      // Si item.songs no existe, se utiliza un array vacío.
      // map(Number) convierte los identificadores de las canciones a números.
      initial.songs = (item.songs ?? []).map(Number);
    }


    // Actualizamos la sección para que coincida con el documento editado.
    setOpenSection(type);


    // Guardamos los datos necesarios para identificar la edición.
    //
    // type indica la colección.
    // id identifica el documento específico.
    //
    // Más adelante saveItem() utiliza estos valores para decidir
    // si debe actualizar un documento existente o crear uno nuevo.
    setEditing({
      type,
      id: item.id,
    });


    // Cargamos en el formulario los valores preparados anteriormente.
    setForm(initial);


    // Eliminamos mensajes anteriores y mostramos el formulario.
    setMessage('');
    setShowForm(true);
  };


  // FUNCIÓN: closeForm()
  //
  // Cierra el formulario y limpia su información temporal.
  //
  // showForm=false oculta el formulario.
  // editing=null elimina el documento que se estaba editando.
  // form={} deja el estado sin datos cargados.
  //
  // La siguiente apertura utilizará openNew() u openEdit() para preparar
  // nuevamente todos los campos.
  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({});
  };


  // FUNCIÓN: handleChange()
  //
  // Controla los cambios de los inputs y selects del formulario.
  //
  // event representa el evento generado por el elemento HTML.
  // event.target identifica el control que produjo el cambio.
  //
  // name contiene el atributo name del input.
  // value contiene el nuevo valor escrito o seleccionado.
  //
  // La propiedad [name] es dinámica: modifica la propiedad del formulario
  // cuyo nombre coincide con el atributo name del elemento.
  //
  // El spread (...previous) conserva todos los campos que no se modificaron.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // FUNCIÓN: toggleSongSelection()
  //
  // Agrega o quita una canción de la selección del formulario.
  //
  // Parámetro:
  // - songId: identificador de la canción que se quiere seleccionar o deseleccionar.
  //
  // previous representa el estado anterior del formulario.
  // previous.songs contiene las canciones seleccionadas.
  //
  // Si songs no existe, ?? utiliza un array vacío.
  //
  // includes() comprueba si songId ya se encuentra seleccionado:
  // - Si existe, filter() crea un array sin ese ID.
  // - Si no existe, el spread agrega el ID al final de un array nuevo.
  //
  // La función devuelve un objeto actualizado sin modificar directamente
  // el estado anterior.
  const toggleSongSelection = (songId) => {
    setForm((previous) => {
      const selected = previous.songs ?? [];

      return {
        ...previous,
        songs: selected.includes(songId)
          ? selected.filter((id) => id !== songId)
          : [...selected, songId],
      };
    });
  };


// 10. IDENTIFICADORES, VALIDACIONES Y GUARDADO

  // FUNCIÓN ASÍNCRONA: nextId()
  //
  // Calcula el próximo identificador numérico disponible para una colección.
  //
  // Parámetro:
  // - collectionName: nombre de la colección de Firestore que se consultará.
  //
  // async permite utilizar await dentro de la función.
  // await pausa la ejecución de esta función hasta recibir la respuesta de getDocs().
  //
  // El proceso:
  // 1. Consulta todos los documentos de la colección.
  // 2. Recupera sus IDs.
  // 3. Convierte los IDs a números.
  // 4. Reemplaza los valores no numéricos por cero.
  // 5. Busca el número mayor.
  // 6. Devuelve ese número más uno.
  //
  // Math.max() obtiene el valor máximo.
  // El operador spread (...) entrega los elementos del array como argumentos.
  //
  // Ejemplo:
  // IDs existentes: [1, 2, 5, 8].
  // Math.max(0, ...ids) devuelve 8.
  // El resultado final será 9.
  //
  // Importante:
  // Este método sigue la convención de IDs numéricos del catálogo, pero no garantiza
  // por sí solo que dos administradores simultáneos no calculen el mismo ID.
  const nextId = async (collectionName) => {

    // Consultamos todos los documentos de la colección seleccionada.
    const snapshot = await getDocs(
      collection(db, collectionName)
    );


    // Convertimos los IDs de los documentos a números.
    //
    // Number(item.id) intenta realizar la conversión.
    // || 0 utiliza cero si el resultado es un valor falso, como NaN.
    const ids = snapshot.docs.map(
      (item) => Number(item.id) || 0
    );


    // Obtenemos el mayor ID y le sumamos uno.
    // El cero inicial permite trabajar correctamente incluso con una colección vacía.
    return Math.max(0, ...ids) + 1;
  };


  // FUNCIÓN ASÍNCRONA PRINCIPAL: saveItem()
  //
  // Centraliza el guardado de todos los formularios.
  //
  // Parámetro:
  // - event: evento de envío generado por el formulario HTML.
  //
  // La función puede crear documentos nuevos o actualizar documentos existentes.
  // También sincroniza las relaciones entre álbumes y canciones cuando corresponde.
  //
  // El proceso general es:
  // 1. Evitar el envío tradicional del formulario.
  // 2. Identificar el tipo de contenido.
  // 3. Validar los campos obligatorios.
  // 4. Preparar los datos que se enviarán a Firestore.
  // 5. Actualizar o crear el documento.
  // 6. Sincronizar relaciones cuando sea necesario.
  // 7. Mostrar un mensaje de resultado.
  // 8. Liberar el estado de guardado incluso si ocurre un error.
  const saveItem = async (event) => {

    // preventDefault() evita que el navegador recargue la página
    // al enviar el formulario.
    event.preventDefault();


    // Determinamos el tipo de contenido.
    //
    // Si editing existe, utilizamos editing.type porque estamos modificando
    // un documento existente.
    //
    // Si editing es null, utilizamos openSection porque estamos creando
    // contenido dentro de la sección actualmente seleccionada.
    const type = editing?.type ?? openSection;


    // Buscamos el nombre real de la colección de Firestore.
    const collectionName = COLECCIONES[type];


    // Si no existe una colección asociada al tipo, detenemos el proceso.
    if (!collectionName) return;


    // Recuperamos los valores principales del formulario.
    //
    // String() garantiza que el valor sea tratado como texto.
    // ?? utiliza una cadena vacía cuando la propiedad no existe.
    // trim() elimina espacios en blanco al principio y al final.
    const title = String(form.title ?? '').trim();
    const name = String(form.name ?? '').trim();


    // VALIDACIÓN GENERAL DE NOMBRE O TÍTULO:
    //
    // Los compositores utilizan name.
    // Las canciones, álbumes y playlists utilizan title.
    //
    // Si el campo obligatorio está vacío, se muestra un mensaje y se detiene
    // el guardado mediante return.
    if (
      (type === 'compositores' && !name) ||
      (type !== 'compositores' && !title)
    ) {
      setMessage('Completá el nombre o título antes de guardar.');
      return;
    }


    // VALIDACIÓN DE CANCIONES:
    //
    // Una canción necesita:
    // - Una ruta de audio.
    // - Un compositor asociado.
    // - Un álbum asociado.
    //
    // form.audio?.trim() utiliza Optional Chaining para evitar llamar trim()
    // si audio es null o undefined.
    if (
      type === 'canciones' &&
      (
        !form.audio?.trim() ||
        !form.composerId ||
        !form.albumId
      )
    ) {
      setMessage('Completá el audio, el compositor y el álbum.');
      return;
    }


    // VALIDACIÓN DE ÁLBUMES:
    // No se permite crear o guardar un álbum sin compositor principal.
    if (type === 'albumes' && !form.composerId) {
      setMessage('Seleccioná al menos un compositor para el álbum.');
      return;
    }


    // VALIDACIÓN DE PLAYLISTS:
    //
    // Se exige que exista al menos una canción seleccionada.
    // Si songs no existe, se utiliza un array vacío.
    // length devuelve la cantidad de canciones seleccionadas.
    if (
      type === 'playlists' &&
      !(form.songs ?? []).length
    ) {
      setMessage('Seleccioná al menos una canción para la playlist.');
      return;
    }


    // Iniciamos el estado de guardado.
    // La interfaz puede utilizar saving para deshabilitar controles.
    setSaving(true);


    // Limpiamos cualquier mensaje anterior antes de intentar la escritura.
    setMessage('');


    // try permite ejecutar operaciones que pueden producir errores.
    // catch captura esos errores y finally ejecuta una acción final
    // independientemente de si el proceso terminó correctamente o no.
    try {

      // serverTimestamp() genera una marca de tiempo utilizando el servidor
      // de Firebase, evitando depender del reloj local del dispositivo.
      const timestamp = serverTimestamp();


      // payload comienza con la fecha de actualización.
      //
      // Después, cada tipo de contenido agrega sus propios campos.
      // let permite reasignar el objeto payload más adelante.
      let payload = {
        fechaActualizacion: timestamp,
      };


      // PREPARACIÓN DE DATOS PARA CANCIONES
      if (type === 'canciones') {

        // Comprobamos que el compositor seleccionado esté disponible.
        //
        // some() recorre el array y devuelve true si al menos un elemento
        // cumple la condición.
        //
        // Number(form.composerId) convierte el valor del select a número.
        const composerExists = availableComposers.some(
          (item) => item.id === Number(form.composerId)
        );


        // Comprobamos que el álbum seleccionado también exista
        // dentro de la lista de álbumes activos y publicados.
        const albumExists = availableAlbums.some(
          (item) => item.id === Number(form.albumId)
        );


        // Si alguna relación no es válida, lanzamos un error.
        // throw interrumpe el flujo normal y dirige la ejecución al catch.
        if (!composerExists || !albumExists) {
          throw new Error(
            'Seleccioná un compositor y un álbum publicados.'
          );
        }


        // Completamos el payload con los campos propios de una canción.
        //
        // ...payload conserva la fecha de actualización.
        // title contiene el título ya normalizado.
        // audio contiene la ruta del archivo.
        // composerId y albumId se convierten a números.
        payload = {
          ...payload,
          title,
          audio: form.audio.trim(),
          composerId: Number(form.composerId),
          albumId: Number(form.albumId),
        };
      }


      // PREPARACIÓN DE DATOS PARA ÁLBUMES
      if (type === 'albumes') {

        // Convertimos el ID del compositor seleccionado a número.
        const composerId = Number(form.composerId);


        // Comprobamos que el compositor exista entre los disponibles.
        if (
          !availableComposers.some(
            (item) => item.id === composerId
          )
        ) {
          throw new Error('Seleccioná un compositor publicado.');
        }


        // Construimos los campos del álbum.
        payload = {
          ...payload,
          title,

          // Si year está vacío, guardamos null.
          // De lo contrario, convertimos el año a número.
          year: form.year === ''
            ? null
            : Number(form.year),

          // trim() elimina espacios innecesarios en los textos.
          description: (form.description ?? '').trim(),
          cover: (form.cover ?? '').trim(),

          // Se guarda el compositor principal en dos formatos:
          // composerId como identificador individual.
          // composerIds como array de identificadores.
          composerId,
          composerIds: [composerId],

          // map(Number) convierte los IDs seleccionados a números.
          songs: (form.songs ?? []).map(Number),
        };
      }


      // PREPARACIÓN DE DATOS PARA PLAYLISTS
      if (type === 'playlists') {
        payload = {
          ...payload,
          title,
          description: (form.description ?? '').trim(),
          cover: (form.cover ?? '').trim(),

          // Guardamos los IDs de las canciones seleccionadas.
          songs: (form.songs ?? []).map(Number),

          // Las playlists creadas desde este formulario siempre son personalizadas.
          system: false,
        };
      }


      // PREPARACIÓN DE DATOS PARA COMPOSITORES
      if (type === 'compositores') {
        payload = {
          ...payload,
          name,
          realName: (form.realName ?? '').trim(),
          description: (form.description ?? '').trim(),
          image: (form.image ?? '').trim(),
        };
      }


      // CASO 1: EDICIÓN DE UN DOCUMENTO EXISTENTE
      //
      // Si editing tiene un valor, updateDoc modifica el documento correspondiente.
      // doc() construye una referencia usando:
      // - db: conexión con Firestore.
      // - collectionName: colección del documento.
      // - String(editing.id): identificador convertido a texto.
      if (editing) {
        await updateDoc(
          doc(db, collectionName, String(editing.id)),
          payload
        );


        // SINCRONIZACIÓN DE RELACIONES AL EDITAR ÁLBUMES
        //
        // Cuando se modifica un álbum, también deben actualizarse las canciones
        // que forman parte de él.
        if (type === 'albumes') {

          // selectedIds contiene los IDs de las canciones que quedaron seleccionadas.
          //
          // Set evita duplicados y permite comprobar rápidamente si un ID existe
          // mediante has().
          const selectedIds = new Set(
            (form.songs ?? []).map(Number)
          );


          // writeBatch crea un lote de operaciones de escritura.
          // Las modificaciones se acumulan y se envían juntas mediante commit().
          const batch = writeBatch(db);


          // ACTUALIZACIÓN DE CANCIONES RELACIONADAS
          //
          // Se consideran:
          // - Canciones que antes pertenecían a este álbum.
          // - Canciones que ahora fueron seleccionadas.
          //
          // Esto permite asignar las nuevas relaciones y quitar las anteriores.
          data.canciones
            .filter(
              (song) =>
                Number(song.albumId) === editing.id ||
                selectedIds.has(song.id)
            )
            .forEach((song) => {

              // Actualizamos el documento de la canción.
              batch.update(
                doc(db, 'canciones', String(song.id)),
                {
                  // Si la canción está seleccionada, conserva el ID del álbum.
                  // Si ya no está seleccionada, albumId pasa a null.
                  albumId: selectedIds.has(song.id)
                    ? editing.id
                    : null,

                  // Actualizamos también la fecha de modificación.
                  fechaActualizacion: timestamp,
                }
              );
            });


          // ACTUALIZACIÓN DE OTROS ÁLBUMES
          //
          // Buscamos álbumes distintos del que se está editando.
          // Solo se consideran aquellos que tengan songs como array.
          data.albumes
            .filter(
              (album) =>
                album.id !== editing.id &&
                Array.isArray(album.songs)
            )
            .forEach((album) => {

              // Construimos una lista sin las canciones que fueron seleccionadas
              // para el álbum actual.
              //
              // Esto evita que una misma canción permanezca relacionada
              // con varios álbumes mediante sus arrays songs.
              const remainingSongs = album.songs
                .map(Number)
                .filter(
                  (songId) => !selectedIds.has(songId)
                );


              // Comparamos las longitudes para saber si realmente se quitó
              // alguna canción de este álbum.
              //
              // Si las longitudes son diferentes, actualizamos el documento.
              if (
                remainingSongs.length !== album.songs.length
              ) {
                batch.update(
                  doc(db, 'albumes', String(album.id)),
                  {
                    songs: remainingSongs,
                    fechaActualizacion: timestamp,
                  }
                );
              }
            });


          // Confirmamos todas las operaciones agrupadas.
          // Hasta que commit() no se ejecuta correctamente, los cambios del lote
          // no quedan confirmados en Firestore.
          await batch.commit();
        }


        // Si la edición termina correctamente, informamos al usuario.
        setMessage(
          `El ${CONFIG[type].singular} se actualizó correctamente.`
        );

      } else {

        // CASO 2: CREACIÓN DE UN DOCUMENTO NUEVO
        //
        // Si editing es null, calculamos un nuevo ID para la colección.
        const id = await nextId(collectionName);


        // Construimos el documento que se almacenará.
        //
        // ...payload incorpora todos los campos preparados anteriormente.
        // status='draft' y published=false indican que se crea como borrador.
        // activo=true indica que no se encuentra en la papelera.
        // fechaCreacion registra la fecha de alta.
        const newPayload = {
          ...payload,
          status: 'draft',
          published: false,
          activo: true,
          fechaCreacion: timestamp,
        };


        // Las canciones nuevas comienzan sin duración calculada.
        if (type === 'canciones') {
          newPayload.duration = null;
        }


        // Los compositores nuevos comienzan con listas vacías de canciones y álbumes.
        // Estas propiedades pueden utilizarse posteriormente para representar
        // las relaciones del compositor con el catálogo.
        if (type === 'compositores') {
          newPayload.songs = [];
          newPayload.albums = [];
        }


        // setDoc crea el documento con el ID calculado.
        //
        // A diferencia de addDoc(), setDoc permite indicar explícitamente
        // el identificador del documento.
        await setDoc(
          doc(db, collectionName, String(id)),
          newPayload
        );


        // SINCRONIZACIÓN AL CREAR UNA CANCIÓN
        if (type === 'canciones') {

          // Recuperamos el ID del álbum seleccionado.
          const albumId = Number(form.albumId);


          // Buscamos el documento correspondiente dentro de data.albumes.
          const album = data.albumes.find(
            (item) => Number(item.id) === albumId
          );


          // Si no existe el álbum, lanzamos un error.
          if (!album) {
            throw new Error('No se encontró el álbum seleccionado.');
          }


          // Recuperamos las canciones que ya pertenecen al álbum.
          //
          // Primero se intenta utilizar album.songs.
          // Si no existe, se reconstruye la relación buscando canciones
          // cuyo albumId coincida con el álbum seleccionado.
          //
          // map(Number) normaliza todos los identificadores.
          const currentSongs = (
            album.songs ??
            data.canciones
              .filter((song) => Number(song.albumId) === albumId)
              .map((song) => song.id)
          ).map(Number);


          // Actualizamos el documento del álbum.
          //
          // Se crea un array nuevo con:
          // - Las canciones que ya estaban relacionadas.
          // - El ID de la canción que acabamos de crear.
          //
          // new Set() elimina posibles IDs duplicados.
          // El spread vuelve a convertir el Set en un array.
          await updateDoc(
            doc(db, 'albumes', String(albumId)),
            {
              songs: [...new Set([...currentSongs, id])],
              fechaActualizacion: serverTimestamp(),
            }
          );
        }


        // SINCRONIZACIÓN AL CREAR UN ÁLBUM
        if (
          type === 'albumes' &&
          (form.songs ?? []).length
        ) {

          // Creamos un lote de escrituras para actualizar las canciones
          // que fueron seleccionadas dentro del nuevo álbum.
          const batch = writeBatch(db);


          // Recorremos todos los IDs seleccionados.
          form.songs.forEach((songId) => {

            // Actualizamos la propiedad albumId de cada canción.
            batch.update(
              doc(db, 'canciones', String(songId)),
              {
                albumId: id,
                fechaActualizacion: timestamp,
              }
            );
          });


          // Confirmamos el lote de operaciones.
          await batch.commit();
        }


        // Informamos que el documento fue creado.
        // Se aclara que comienza como borrador y todavía no está publicado.
        setMessage(
          `El ${CONFIG[type].singular} se creó como borrador.`
        );
      }


      // Si todas las operaciones anteriores terminaron correctamente,
      // cerramos el formulario y limpiamos sus estados.
      closeForm();

    } catch (err) {

      // CAPTURA DE ERRORES:
      //
      // Si alguna operación falla, se registra el error en la consola.
      // err contiene la información del problema.
      console.error(`Error al guardar ${type}:`, err);


      // Mostramos el mensaje específico del error cuando existe.
      // Si no existe err.message, se utiliza un mensaje general.
      setMessage(
        err.message ||
          'No se pudo guardar el contenido. Revisá los permisos de Firestore.'
      );

    } finally {

      // FINALIZACIÓN:
      //
      // finally se ejecuta tanto si el guardado fue exitoso como si ocurrió un error.
      // Por eso se utiliza para liberar saving y permitir nuevas operaciones.
      setSaving(false);
    }
  };


// 11. PUBLICACIÓN, PAPELERA Y RESTAURACIÓN

  // FUNCIÓN ASÍNCRONA: togglePublished()
  //
  // Cambia el estado de publicación de un documento.
  //
  // Parámetros:
  // - type: tipo de contenido.
  // - item: documento cuyo estado se quiere modificar.
  //
  // Si el documento está publicado, pasa a borrador.
  // Si está en borrador, pasa a publicado.
  //
  // La operación no crea ni elimina documentos: solamente modifica sus propiedades.
  const togglePublished = async (type, item) => {

    // Operador ternario:
    // - Si el estado actual es published, el nuevo será draft.
    // - En caso contrario, el nuevo será published.
    const status =
      item.status === 'published'
        ? 'draft'
        : 'published';


    try {

      // Actualizamos el documento en Firestore.
      await updateDoc(
        doc(db, COLECCIONES[type], String(item.id)),
        {
          status,

          // Mantenemos el campo booleano published sincronizado con status.
          published: status === 'published',

          // Registramos la fecha de modificación.
          fechaActualizacion: serverTimestamp(),
        }
      );


      // Mostramos un mensaje según el nuevo estado.
      setMessage(
        status === 'published'
          ? 'Contenido publicado correctamente.'
          : 'Contenido pasado a borradores.'
      );

    } catch (err) {

      // Registramos el error y mostramos un mensaje general.
      console.error('Error al cambiar publicación:', err);
      setMessage('No se pudo cambiar el estado de publicación.');
    }
  };


  // FUNCIÓN ASÍNCRONA: moveToTrash()
  //
  // Envía un documento a la papelera sin eliminarlo definitivamente.
  //
  // Parámetros:
  // - type: colección a la que pertenece el documento.
  // - item: documento que se desea enviar a la papelera.
  //
  // La operación cambia activo a false.
  // Los datos originales se conservan para permitir su restauración.
  const moveToTrash = async (type, item) => {

    // Obtenemos un nombre representativo para mostrarlo en el mensaje de confirmación.
    // Se prioriza title, luego name y finalmente un texto genérico.
    const label = item.title || item.name || 'este elemento';


    // window.confirm() abre un cuadro de confirmación del navegador.
    //
    // Si el usuario cancela, confirm() devuelve false.
    // El operador ! invierte ese resultado y permite detener la función.
    if (
      !window.confirm(
        `¿Querés mover "${label}" a la papelera? Podés restaurarlo después.`
      )
    ) {
      return;
    }


    try {

      // Enviamos el documento a la papelera modificando activo.
      // No se utiliza deleteDoc(), por lo que el documento continúa existiendo.
      await updateDoc(
        doc(db, COLECCIONES[type], String(item.id)),
        {
          activo: false,
          fechaActualizacion: serverTimestamp(),
        }
      );


      // Confirmamos la operación al usuario.
      setMessage(`"${label}" se movió a la papelera.`);

    } catch (err) {

      // Informamos si Firestore no pudo actualizar el documento.
      console.error('Error al eliminar:', err);
      setMessage('No se pudo mover el contenido a la papelera.');
    }
  };


  // FUNCIÓN ASÍNCRONA: restoreItem()
  //
  // Recupera un documento que se encuentra en la papelera.
  //
  // Parámetro:
  // - item: documento eliminado, incluyendo los metadatos _collection y _type.
  //
  // _collection permite identificar la colección original.
  // id permite localizar el documento.
  //
  // La restauración cambia activo a true. El resto de los datos y el estado
  // de publicación se conservan.
  const restoreItem = async (item) => {

    try {

      // Actualizamos el documento dentro de su colección original.
      await updateDoc(
        doc(db, item._collection, String(item.id)),
        {
          activo: true,
          fechaActualizacion: serverTimestamp(),
        }
      );


      // Mostramos el nombre del documento restaurado.
      setMessage(
        `"${item.title || item.name || 'El elemento'}" se restauró correctamente.`
      );

    } catch (err) {

      // Registramos el error y mostramos una notificación.
      console.error('Error al restaurar:', err);
      setMessage('No se pudo restaurar el contenido.');
    }
  };


// 12. SELECTOR DE CANCIONES

  // FUNCIÓN: renderSongPicker()
  //
  // Devuelve una estructura JSX reutilizable para seleccionar canciones.
  //
  // Se utiliza dentro de los formularios de álbumes y playlists.
  //
  // La selección depende de form.songs:
  // - Si el ID está incluido, la casilla aparece marcada.
  // - Si no está incluido, aparece desmarcada.
  //
  // Al cambiar una casilla se ejecuta toggleSongSelection(), que agrega o quita
  // el identificador correspondiente.
  //
  // activeSongs contiene solamente canciones activas, por lo que los documentos
  // enviados a la papelera no aparecen como opciones.
  const renderSongPicker = () => (
    <div className="maestro-song-picker">

      {/* ENCABEZADO DEL SELECTOR */}
      <div className="maestro-picker-heading">

        {/* Nombre de la herramienta de selección. */}
        <strong>Seleccionar canciones</strong>

        {/* Muestra la cantidad de canciones seleccionadas actualmente.
            Si form.songs no existe, se utiliza un array vacío. */}
        <span>
          {(form.songs ?? []).length} seleccionadas
        </span>
      </div>


      {/* LISTA DE CANCIONES DISPONIBLES */}
      <div className="maestro-picker-list">

        {/* map() recorre activeSongs y genera una opción visual por cada canción.
            song representa el documento que se está procesando. */}
        {activeSongs.map((song) => (

          <label
            className="maestro-picker-song"
            key={song.id}
          >

            {/* Casilla controlada por React.
                checked comprueba si el ID está incluido en form.songs.
                onChange modifica la selección mediante toggleSongSelection(). */}
            <input
              type="checkbox"
              checked={(form.songs ?? []).includes(song.id)}
              onChange={() => toggleSongSelection(song.id)}
            />

            {/* Título de la canción. */}
            <span>{song.title}</span>

            {/* Nombre del compositor asociado.
                getComposerName() transforma el ID guardado en un nombre visible. */}
            <small>
              {getComposerName(song.composerId)}
            </small>
          </label>
        ))}


        {/* Si activeSongs no tiene elementos, length será cero.
            En ese caso se muestra un mensaje en lugar de una lista vacía. */}
        {!activeSongs.length && (
          <p className="maestro-empty">
            Todavía no hay canciones cargadas.
          </p>
        )}
      </div>
    </div>
  );


// 13. FORMULARIO DINÁMICO

  // FUNCIÓN: renderForm()
  //
  // Genera el formulario correspondiente a la sección seleccionada.
  //
  // En lugar de crear cuatro componentes independientes, utiliza una sola estructura
  // que cambia los campos según el valor de type.
  //
  // Esto permite reutilizar los mismos controles de guardado, cancelación,
  // edición y validación para todas las categorías.
  const renderForm = () => {

    // Si showForm es false, el formulario no debe mostrarse.
    // return null indica a React que no renderice ningún elemento.
    if (!showForm) return null;


    // Determinamos el tipo del formulario.
    // Si se está editando, se utiliza editing.type.
    // Si se está creando, se utiliza openSection.
    const type = editing?.type ?? openSection;


    // Comprobamos que exista una plantilla inicial para el tipo seleccionado.
    // Si no existe, no se renderiza el formulario.
    if (!EMPTY[type]) return null;


    // Devolvemos la tarjeta del formulario.
    return (
      <section
        className="maestro-form-card"
        ref={formRef}
        style={{ scrollMarginTop: '110px' }}
      >

        {/* ENCABEZADO DEL FORMULARIO */}
        <div className="maestro-section-heading">

          <div>

            {/* El texto cambia según el formulario esté creando o editando.
                editing tiene un valor cuando se abrió mediante openEdit(). */}
            <span className="maestro-eyebrow">
              {editing ? 'EDICIÓN' : 'NUEVO CONTENIDO'}
            </span>


            {/* CONFIG[type].singular permite construir el título de forma dinámica.
                Por ejemplo: "Editar canción" o "Agregar álbum". */}
            <h2>
              {editing
                ? `Editar ${CONFIG[type].singular}`
                : `Agregar ${CONFIG[type].singular}`}
            </h2>
          </div>


          {/* Botón para cerrar el formulario.
              aria-label proporciona una descripción accesible del botón. */}
          <button
            className="maestro-close-button"
            type="button"
            onClick={closeForm}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>


        {/* FORMULARIO HTML */}
        {/* onSubmit ejecuta saveItem() cuando se envía el formulario. */}
        <form onSubmit={saveItem}>
          <div className="maestro-form-grid">


            {/* FORMULARIO DE CANCIONES */}
            {type === 'canciones' && (
              <>

                {/* TÍTULO:
                    Campo obligatorio que se guarda en form.title. */}
                <label>
                  Título de la canción

                  <input
                    name="title"
                    value={form.title ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: Sweden"
                    required
                  />
                </label>


                {/* COMPOSITOR:
                    El select muestra los compositores activos y publicados.
                    El value representa el ID seleccionado. */}
                <label>
                  Compositor

                  <select
                    name="composerId"
                    value={form.composerId ?? ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Seleccionar compositor
                    </option>

                    {/* Recorremos los compositores disponibles para crear
                        una opción por cada uno. */}
                    {availableComposers.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>


                {/* ÁLBUM:
                    Permite asociar la canción con un álbum publicado. */}
                <label>
                  Álbum

                  <select
                    name="albumId"
                    value={form.albumId ?? ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Seleccionar álbum
                    </option>

                    {availableAlbums.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>


                {/* AUDIO:
                    Recibe la ruta del archivo de audio.
                    El atributo required impide enviar el formulario vacío. */}
                <label>
                  Ruta del archivo de audio

                  <input
                    name="audio"
                    value={form.audio ?? ''}
                    onChange={handleChange}
                    placeholder="/music/sweden.mp3"
                    required
                  />

                  <small>
                    Indicá la ruta de un archivo que ya exista en la carpeta pública.
                  </small>
                </label>
              </>
            )}


            {/* FORMULARIO DE ÁLBUMES */}
            {type === 'albumes' && (
              <>

                {/* NOMBRE DEL ÁLBUM */}
                <label>
                  Nombre del álbum

                  <input
                    name="title"
                    value={form.title ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: Minecraft - Volume Alpha"
                    required
                  />
                </label>


                {/* COMPOSITOR PRINCIPAL:
                    El selector utiliza los compositores activos y publicados. */}
                <label>
                  Compositor principal

                  <select
                    name="composerId"
                    value={form.composerId ?? ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Seleccionar compositor
                    </option>

                    {availableComposers.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>


                {/* AÑO:
                    type="number" permite introducir valores numéricos.
                    min y max establecen límites para el control HTML. */}
                <label>
                  Año

                  <input
                    name="year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: 2011"
                  />
                </label>


                {/* PORTADA:
                    Recibe la ruta de la imagen del álbum. */}
                <label>
                  Ruta de portada

                  <input
                    name="cover"
                    value={form.cover ?? ''}
                    onChange={handleChange}
                    placeholder="/music/covers/album.jpg"
                  />
                </label>


                {/* DESCRIPCIÓN:
                    textarea permite escribir contenido de varias líneas.
                    maestro-field-full permite que el campo ocupe el ancho completo
                    de la cuadrícula, según las reglas del CSS. */}
                <label className="maestro-field-full">
                  Descripción

                  <textarea
                    name="description"
                    value={form.description ?? ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descripción del álbum..."
                  />
                </label>


                {/* SELECTOR DE CANCIONES:
                    Reutiliza renderSongPicker() para asociar canciones con el álbum. */}
                <div className="maestro-field-full">
                  {renderSongPicker()}

                  <small>
                    Podés seleccionar las canciones que pertenecen a este álbum.
                  </small>
                </div>
              </>
            )}


            {/* FORMULARIO DE PLAYLISTS */}
            {type === 'playlists' && (
              <>

                {/* NOMBRE DE LA PLAYLIST */}
                <label>
                  Nombre de la playlist

                  <input
                    name="title"
                    value={form.title ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: Exploración"
                    required
                  />
                </label>


                {/* PORTADA DE LA PLAYLIST */}
                <label>
                  Ruta de portada

                  <input
                    name="cover"
                    value={form.cover ?? ''}
                    onChange={handleChange}
                    placeholder="/music/playlists/exploracion.jpg"
                  />
                </label>


                {/* DESCRIPCIÓN DE LA PLAYLIST */}
                <label className="maestro-field-full">
                  Descripción

                  <textarea
                    name="description"
                    value={form.description ?? ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="¿Qué caracteriza a esta playlist?"
                  />
                </label>


                {/* SELECCIÓN DE CANCIONES:
                    Las playlists también utilizan el selector reutilizable. */}
                <div className="maestro-field-full">
                  {renderSongPicker()}
                </div>
              </>
            )}


            {/* FORMULARIO DE COMPOSITORES */}
            {type === 'compositores' && (
              <>

                {/* NOMBRE ARTÍSTICO:
                    Es el campo principal que identifica al compositor. */}
                <label>
                  Nombre artístico

                  <input
                    name="name"
                    value={form.name ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: C418"
                    required
                  />
                </label>


                {/* NOMBRE REAL:
                    Campo complementario que no es obligatorio. */}
                <label>
                  Nombre real

                  <input
                    name="realName"
                    value={form.realName ?? ''}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                  />
                </label>


                {/* IMAGEN:
                    Recibe la ruta de la imagen del compositor. */}
                <label className="maestro-field-full">
                  Ruta de imagen

                  <input
                    name="image"
                    value={form.image ?? ''}
                    onChange={handleChange}
                    placeholder="/music/composers/c418.jpg"
                  />
                </label>


                {/* DESCRIPCIÓN DEL COMPOSITOR */}
                <label className="maestro-field-full">
                  Descripción

                  <textarea
                    name="description"
                    value={form.description ?? ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Información del compositor..."
                  />
                </label>
              </>
            )}
          </div>


          {/* ACCIONES DEL FORMULARIO */}
          <div className="maestro-form-actions">

            {/* CANCELAR:
                Cierra el formulario sin guardar los cambios.
                Se deshabilita mientras saving es true. */}
            <button
              type="button"
              className="maestro-secondary-button"
              onClick={closeForm}
              disabled={saving}
            >
              Cancelar
            </button>


            {/* GUARDAR:
                type="submit" activa el evento onSubmit del formulario.
                El texto cambia según se esté guardando, editando o creando. */}
            <button
              type="submit"
              className="maestro-primary-button"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : editing
                  ? 'Guardar cambios'
                  : 'Crear borrador'}
            </button>
          </div>
        </form>
      </section>
    );
  };


// 14. FILAS DE LAS TABLAS Y ENCABEZADOS

  // FUNCIÓN: renderRow()
  //
  // Genera una fila de tabla para una canción, álbum, playlist o compositor.
  //
  // Parámetros:
  // - type: categoría del documento.
  // - item: documento que se representa en esa fila.
  //
  // La función adapta el contenido de la fila según el tipo.
  // También genera los botones para editar, publicar, despublicar o eliminar.
  const renderRow = (type, item) => {

    // Determinamos el texto principal de la fila.
    // Se utiliza title cuando existe; de lo contrario, name.
    // Si ninguno está disponible, se muestra 'Sin nombre'.
    const title = item.title || item.name || 'Sin nombre';


    // SUBTÍTULO:
    //
    // Se construye un texto secundario diferente según la categoría.
    //
    // Las condiciones ternarias permiten seleccionar la información adecuada:
    // - Canciones: ruta de audio.
    // - Álbumes: año y compositor.
    // - Playlists: cantidad de canciones y si pertenece al sistema.
    // - Compositores: nombre real.
    const subtitle =
      type === 'canciones'
        ? item.audio || 'Sin archivo de audio'
        : type === 'albumes'
          ? `${item.year || 'Año no indicado'} · ${getComposerName(
              item.composerId ?? item.composerIds?.[0]
            )}`
          : type === 'playlists'
            ? `${(item.songs ?? []).length} canciones${
                item.system ? ' · Sistema' : ''
              }`
            : item.realName || 'Compositor';


    // Devolvemos una fila HTML de tabla.
    return (
      <tr key={`${type}-${item.id}`}>

        {/* COLUMNA PRINCIPAL:
            Incluye portada, nombre y subtítulo del documento. */}
        <td>
          <div className="maestro-song-cell">

            {/* CONTENEDOR DE PORTADA */}
            <div className="maestro-song-cover">

              {/* Si getCover() devuelve una ruta válida, se muestra la imagen.
                  De lo contrario, se utiliza el icono predeterminado de la categoría. */}
              {getCover(type, item) ? (
                <img
                  src={getCover(type, item)}
                  alt={`Portada de ${title}`}
                  loading="lazy"
                />
              ) : (
                <img
                  src={ICONOS_MAESTRO[type]}
                  alt=""
                  className="maestro-fallback-icon"
                />
              )}
            </div>


            {/* TÍTULO Y SUBTÍTULO */}
            <div>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>
          </div>
        </td>


        {/* COLUMNAS EXCLUSIVAS DE CANCIONES:
            Muestran el compositor y el álbum asociados mediante sus IDs. */}
        {type === 'canciones' && (
          <>
            <td>{getComposerName(item.composerId)}</td>
            <td>{getAlbumName(item.albumId)}</td>
          </>
        )}


        {/* COLUMNA EXCLUSIVA DE ÁLBUMES:
            Muestra cuántas canciones contiene el álbum.
            Si item.songs no existe, reconstruye la cantidad buscando canciones
            cuyo albumId coincida con el ID del álbum. */}
        {type === 'albumes' && (
          <td>
            {(item.songs ??
              data.canciones
                .filter(
                  (song) => Number(song.albumId) === item.id
                )
                .map((song) => song.id)
            ).length}{' '}
            canciones
          </td>
        )}


        {/* COLUMNA EXCLUSIVA DE PLAYLISTS:
            Distingue las listas automáticas de las personalizadas. */}
        {type === 'playlists' && (
          <td>
            {item.system ? 'Automática' : 'Personalizada'}
          </td>
        )}


        {/* COLUMNA EXCLUSIVA DE COMPOSITORES:
            Cuenta cuántas canciones tienen asignado este compositor. */}
        {type === 'compositores' && (
          <td>
            {
              data.canciones.filter(
                (song) =>
                  Number(song.composerId) === item.id
              ).length
            }{' '}
            canciones
          </td>
        )}


        {/* ESTADO DE PUBLICACIÓN:
            La clase CSS cambia según el documento esté publicado o sea borrador. */}
        <td>
          <span
            className={`maestro-status ${
              item.status === 'published'
                ? 'is-published'
                : 'is-draft'
            }`}
          >

            {/* Si está publicado, se muestra el texto correspondiente.
                Si es borrador, se agrega también el icono identificador. */}
            {item.status === 'published' ? (
              'Publicado'
            ) : (
              <>
                <img
                  src={ICONOS_MAESTRO.borrador}
                  alt=""
                  className="maestro-status-icon"
                />
                Borrador
              </>
            )}
          </span>
        </td>


        {/* ACCIONES ADMINISTRATIVAS */}
        <td>
          <div className="maestro-actions">

            {/* EDITAR:
                Abre el formulario con los datos del documento.
                Las playlists del sistema tienen el botón deshabilitado. */}
            <button
              type="button"
              className="maestro-action-button maestro-edit-button"
              onClick={() => openEdit(type, item)}
              disabled={type === 'playlists' && item.system}
            >
              <img
                src={ICONOS_MAESTRO.editar}
                alt=""
                className="maestro-button-icon"
              />
              Editar
            </button>


            {/* PUBLICACIÓN:
                Las playlists del sistema no muestran esta acción.
                Los demás documentos pueden alternar entre publicado y borrador. */}
            {item.system ? (
              <span className="maestro-system-label">
                Sistema
              </span>
            ) : (
              <button
                type="button"
                className="maestro-action-button"
                onClick={() => togglePublished(type, item)}
              >
                {item.status === 'published'
                  ? 'Despublicar'
                  : 'Publicar'}
              </button>
            )}


            {/* ELIMINAR:
                Ejecuta moveToTrash(), que cambia activo a false.
                No elimina definitivamente el documento.
                Las playlists del sistema tampoco pueden enviarse a la papelera. */}
            <button
              type="button"
              className="maestro-action-button is-danger"
              onClick={() => moveToTrash(type, item)}
              disabled={type === 'playlists' && item.system}
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    );
  };


  // FUNCIÓN: tableHeaders()
  //
  // Devuelve los encabezados de la tabla según la sección abierta.
  //
  // Las columnas cambian porque no todas las categorías tienen las mismas propiedades.
  // Por ejemplo, las canciones muestran compositor y álbum, mientras que las playlists
  // muestran su tipo.
  //
  // Esta función solo genera encabezados; las filas se construyen mediante renderRow().
  const tableHeaders = () => {

    // ENCABEZADOS DE CANCIONES
    if (openSection === 'canciones') {
      return (
        <tr>
          <th>Contenido</th>
          <th>Compositor</th>
          <th>Álbum</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      );
    }


    // ENCABEZADOS DE ÁLBUMES
    if (openSection === 'albumes') {
      return (
        <tr>
          <th>Álbum</th>
          <th>Contenido</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      );
    }


    // ENCABEZADOS DE PLAYLISTS
    if (openSection === 'playlists') {
      return (
        <tr>
          <th>Playlist</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      );
    }


    // ENCABEZADOS DE COMPOSITORES
    // Si no se trata de las tres secciones anteriores, se utiliza esta estructura.
    return (
      <tr>
        <th>Compositor</th>
        <th>Repertorio</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    );
  };


// 15. RENDERIZADO DE LA PAPELERA

  // FUNCIÓN: renderTrash()
  //
  // Genera las filas de la tabla de papelera.
  //
  // A diferencia de renderRow(), esta función no muestra acciones de edición,
  // publicación o eliminación.
  //
  // La acción principal disponible es restaurar el documento.
  //
  // currentItems contiene los documentos filtrados que pertenecen a la papelera.
  const renderTrash = () =>
    currentItems.map((item) => (

      // Cada fila utiliza una clave compuesta por el tipo y el ID.
      // Esto permite diferenciar documentos de distintas colecciones que puedan
      // compartir el mismo identificador numérico.
      <tr key={`${item._type}-${item.id}`}>

        {/* INFORMACIÓN DEL DOCUMENTO */}
        <td>
          <div className="maestro-song-cell">

            {/* En esta vista se utiliza el icono de la categoría como imagen
                identificadora del contenido eliminado. */}
            <div className="maestro-song-cover">
              <img
                src={ICONOS_MAESTRO[item._type]}
                alt=""
                className="maestro-fallback-icon"
              />
            </div>


            {/* Nombre y categoría del elemento eliminado. */}
            <div>
              <strong>
                {item.title || item.name || 'Sin nombre'}
              </strong>

              <small>
                {CONFIG[item._type].label}
              </small>
            </div>
          </div>
        </td>


        {/* ESTADO ANTERIOR:
            La papelera conserva el estado de publicación que tenía el documento. */}
        <td>
          <span
            className={`maestro-status ${
              item.status === 'published'
                ? 'is-published'
                : 'is-draft'
            }`}
          >
            {item.status === 'published'
              ? 'Publicado'
              : 'Borrador'}
          </span>
        </td>


        {/* RESTAURAR:
            Ejecuta restoreItem() y utiliza los metadatos del documento
            para recuperar su colección original. */}
        <td>
          <button
            type="button"
            className="maestro-action-button"
            onClick={() => restoreItem(item)}
          >
            Restaurar
          </button>
        </td>
      </tr>
    ));


// 16. INTERFAZ PRINCIPAL DEL ADMINISTRADOR

  // A partir de aquí comienza el JSX principal del componente.
  //
  // Se construye la página completa utilizando:
  // - Header y Footer compartidos.
  // - Encabezado administrativo.
  // - Formulario dinámico.
  // - Tarjetas de estadísticas.
  // - Mensajes de estado.
  // - Acordeón con las colecciones.
  // - Tablas de contenido.
  // - Papelera recuperable.
  // - Botón flotante de navegación.
  return (
    <>
      {/* ENCABEZADO GENERAL DEL SITIO */}
      <Header />


      {/* CONTENEDOR PRINCIPAL DEL ADMINISTRADOR */}
      <main className="maestro-page">


        {/* ENCABEZADO DEL PANEL */}
        <section className="maestro-hero">

          {/* ICONO PRINCIPAL DEL PANEL */}
          <div className="maestro-hero-icon">
            <img
              src={ICONOS_MAESTRO.tocadiscos}
              alt="Maestro de Melodías"
            />
          </div>


          {/* TÍTULO Y DESCRIPCIÓN */}
          <div>
            <span className="maestro-eyebrow">
              WIKICRAFT · GESTIÓN MUSICAL
            </span>

            <h1>Maestro de Melodías</h1>

            <p>
              Administrá canciones, álbumes, playlists y compositores
              desde un solo lugar.
            </p>
          </div>


          {/* BOTONES PRINCIPALES */}
          <div className="maestro-hero-buttons">

            {/* AGREGAR CONTENIDO:
                handleAddClick() determina qué tipo de formulario debe abrirse.
                Si la sección actual es la papelera, el botón queda deshabilitado. */}
            <button
              type="button"
              className="maestro-primary-button"
              onClick={handleAddClick}
              disabled={openSection === 'papelera'}
            >
              <img
                src={ICONOS_MAESTRO.agregar}
                alt=""
                className="maestro-button-icon"
              />

              <span>
                Agregar{' '}

                {/* El texto cambia según la sección seleccionada.
                    Si no hay una categoría válida, se muestra "contenido". */}
                {openSection && openSection !== 'papelera'
                  ? CONFIG[openSection].singular
                  : 'contenido'}
              </span>
            </button>


            {/* COMPONENTE EXTERNO DE IMPORTACIÓN:
                Su lógica se encuentra en ImportarCatalogoButton.jsx.
                Aquí solamente se incorpora su representación visual y funcional. */}
            <ImportarCatalogoButton />
          </div>
        </section>


        {/* FORMULARIO DINÁMICO:
            renderForm() devuelve el formulario correspondiente si showForm es true.
            Si está cerrado, devuelve null y no ocupa espacio en la interfaz. */}
        {renderForm()}


        {/* ESTADÍSTICAS DEL CATÁLOGO */}
        <section className="maestro-stats">

          {/* TARJETA DE CANCIONES */}
          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.canciones} alt="" />
            </span>

            <div>
              <p>Canciones</p>

              {/* counts.canciones contiene la cantidad de canciones activas. */}
              <strong>{counts.canciones}</strong>
            </div>
          </article>


          {/* TARJETA DE ÁLBUMES */}
          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.albumes} alt="" />
            </span>

            <div>
              <p>Álbumes</p>
              <strong>{counts.albumes}</strong>
            </div>
          </article>


          {/* TARJETA DE PLAYLISTS */}
          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.playlists} alt="" />
            </span>

            <div>
              <p>Playlists</p>
              <strong>{counts.playlists}</strong>
            </div>
          </article>


          {/* TARJETA DE COMPOSITORES */}
          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.compositores} alt="" />
            </span>

            <div>
              <p>Compositores</p>
              <strong>{counts.compositores}</strong>
            </div>
          </article>
        </section>


        {/* MENSAJES DE OPERACIÓN */}

        {/* MENSAJE GENERAL:
            Aparece cuando message contiene algún texto.
            role="status" permite que tecnologías de asistencia anuncien
            el cambio de estado sin interrumpir innecesariamente al usuario. */}
        {message && (
          <div className="maestro-message" role="status">
            {message}

            {/* Botón para limpiar el mensaje. */}
            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>
          </div>
        )}


        {/* MENSAJE DE ERROR:
            Se muestra cuando error contiene información sobre un problema de carga.
            role="alert" permite anunciar el mensaje como una alerta. */}
        {error && (
          <div className="maestro-message" role="alert">
            {error}
          </div>
        )}


        {/* BIBLIOTECA MUSICAL */}
        <section className="maestro-library">

          {/* ENCABEZADO DE LA BIBLIOTECA */}
          <div className="maestro-section-heading">
            <div>
              <span className="maestro-eyebrow">
                CENTRO DE ADMINISTRACIÓN
              </span>

              <h2>Biblioteca musical</h2>

              <p>
                Elegí una sección para desplegar sus herramientas de gestión.
              </p>
            </div>
          </div>


          {/* ACORDEÓN PRINCIPAL */}
          <div className="maestro-accordion">


            {/* SECCIONES PRINCIPALES:
                Object.keys(COLECCIONES) devuelve las claves del objeto:
                canciones, albumes, playlists y compositores.

                map() genera una sección de acordeón por cada una. */}
            {Object.keys(COLECCIONES).map((key) => (

              <section
                className={`maestro-accordion-item ${
                  openSection === key ? 'is-open' : ''
                }`}
                key={key}
              >

                {/* BOTÓN DEL ACORDEÓN:
                    Al presionarlo, abre la sección correspondiente.
                    Si ya está abierta, la cierra. */}
                <button
                  type="button"
                  className="maestro-accordion-trigger"
                  onClick={() => {

                    // Si la sección presionada ya está abierta, openSection pasa a ''.
                    // De lo contrario, se guarda la nueva clave.
                    setOpenSection(
                      openSection === key ? '' : key
                    );


                    // Al cambiar de sección, cerramos cualquier formulario abierto
                    // y limpiamos la información temporal de edición.
                    setShowForm(false);
                    setEditing(null);


                    // Reiniciamos la búsqueda y el filtro para comenzar
                    // con una vista limpia en la nueva categoría.
                    setSearch('');
                    setStatusFilter('all');
                  }}
                  aria-expanded={openSection === key}
                >

                  {/* ICONO DE LA CATEGORÍA */}
                  <span className="maestro-accordion-icon">
                    <img
                      src={ICONOS_MAESTRO[key]}
                      alt=""
                    />
                  </span>


                  {/* NOMBRE Y DESCRIPCIÓN */}
                  <span className="maestro-accordion-copy">
                    <strong>{CONFIG[key].label}</strong>

                    <small>
                      {CONFIG[key].description}
                    </small>
                  </span>


                  {/* CANTIDAD DE ELEMENTOS ACTIVOS */}
                  <span className="maestro-accordion-count">
                    {counts[key]}
                  </span>


                  {/* INDICADOR VISUAL:
                      Muestra − cuando la sección está abierta y + cuando está cerrada. */}
                  <span className="maestro-accordion-chevron">
                    {openSection === key ? '−' : '+'}
                  </span>
                </button>


                {/* CONTENIDO DEL ACORDEÓN:
                    Solo se renderiza cuando la sección correspondiente está abierta. */}
                {openSection === key && (
                  <div className="maestro-accordion-content">


                    {/* HERRAMIENTAS DE BÚSQUEDA Y FILTRADO */}
                    <div className="maestro-toolbar">

                      {/* BUSCADOR */}
                      <div className="maestro-search">
                        <span>⌕</span>

                        <input
                          type="search"
                          value={search}

                          // Actualiza search con el texto ingresado.
                          onChange={(event) =>
                            setSearch(event.target.value)
                          }

                          // El placeholder cambia según la categoría.
                          placeholder={`Buscar ${CONFIG[
                            key
                          ].label.toLowerCase()}...`}

                          // aria-label proporciona una descripción accesible.
                          aria-label={`Buscar ${CONFIG[key].label}`}
                        />
                      </div>


                      {/* FILTRO POR ESTADO */}
                      <select
                        className="maestro-filter"
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        aria-label="Filtrar por estado"
                      >
                        <option value="all">
                          Todos los estados
                        </option>

                        <option value="published">
                          Publicados
                        </option>

                        <option value="draft">
                          Borradores
                        </option>
                      </select>
                    </div>


                    {/* TABLA DE CONTENIDO */}
                    <div className="maestro-table-wrapper">
                      <table className="maestro-table">

                        {/* Los encabezados se generan según la categoría abierta. */}
                        <thead>
                          {tableHeaders()}
                        </thead>


                        {/* CUERPO DE LA TABLA */}
                        <tbody>

                          {/* CASO 1: CARGANDO */}
                          {loading ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="maestro-empty"
                              >
                                Cargando catálogo musical...
                              </td>
                            </tr>

                          ) : currentItems.length ? (

                            /* CASO 2: EXISTEN RESULTADOS
                               Se recorre currentItems y se genera una fila
                               mediante renderRow() para cada documento. */
                            currentItems.map((item) =>
                              renderRow(key, item)
                            )

                          ) : (

                            /* CASO 3: NO HAY RESULTADOS
                               Se muestra un mensaje cuando la búsqueda o los filtros
                               no encuentran elementos para la sección. */
                            <tr>
                              <td
                                colSpan="5"
                                className="maestro-empty"
                              >
                                No se encontró contenido en esta sección.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>


                    {/* RESUMEN DE RESULTADOS:
                        Muestra la cantidad filtrada y la cantidad total activa
                        de la categoría. */}
                    <p className="maestro-results">
                      Mostrando {currentItems.length} de {counts[key]}{' '}
                      {CONFIG[key].label.toLowerCase()}
                    </p>
                  </div>
                )}
              </section>
            ))}


            {/* SECCIÓN DE PAPELERA */}
            <section
              className={`maestro-accordion-item maestro-trash-section ${
                openSection === 'papelera' ? 'is-open' : ''
              }`}
            >

              {/* BOTÓN DE APERTURA DE LA PAPELERA */}
              <button
                type="button"
                className="maestro-accordion-trigger"
                onClick={() => {

                  // Alterna entre abrir y cerrar la papelera.
                  setOpenSection(
                    openSection === 'papelera' ? '' : 'papelera'
                  );


                  // Cerramos el formulario y limpiamos la edición activa.
                  setShowForm(false);
                  setEditing(null);


                  // Reiniciamos la búsqueda y el filtro.
                  setSearch('');
                  setStatusFilter('all');
                }}
                aria-expanded={openSection === 'papelera'}
              >

                {/* ICONO DE PAPELERA */}
                <span className="maestro-accordion-icon">
                  <img
                    src={ICONOS_MAESTRO.papelera}
                    alt=""
                  />
                </span>


                {/* TÍTULO Y DESCRIPCIÓN */}
                <span className="maestro-accordion-copy">
                  <strong>Papelera</strong>

                  <small>
                    Restaurá canciones, álbumes, playlists y compositores eliminados.
                  </small>
                </span>


                {/* CANTIDAD DE ELEMENTOS ELIMINADOS */}
                <span className="maestro-accordion-count">
                  {counts.papelera}
                </span>


                {/* INDICADOR DE APERTURA */}
                <span className="maestro-accordion-chevron">
                  {openSection === 'papelera' ? '−' : '+'}
                </span>
              </button>


              {/* CONTENIDO DE LA PAPELERA */}
              {openSection === 'papelera' && (
                <div className="maestro-accordion-content">


                  {/* BUSCADOR DE ELEMENTOS ELIMINADOS */}
                  <div className="maestro-toolbar">
                    <div className="maestro-search">
                      <span>⌕</span>

                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Buscar contenido eliminado..."
                        aria-label="Buscar en papelera"
                      />
                    </div>
                  </div>


                  {/* TABLA DE PAPELERA */}
                  <div className="maestro-table-wrapper">
                    <table className="maestro-table">

                      {/* ENCABEZADOS DE LA PAPELERA */}
                      <thead>
                        <tr>
                          <th>Contenido</th>
                          <th>Estado anterior</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>


                      {/* CONTENIDO DE LA TABLA */}
                      <tbody>

                        {/* CASO 1: CARGANDO */}
                        {loading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="maestro-empty"
                            >
                              Cargando papelera...
                            </td>
                          </tr>

                        ) : currentItems.length ? (

                          /* CASO 2: EXISTEN ELEMENTOS ELIMINADOS
                             renderTrash() genera sus filas y botones de restauración. */
                          renderTrash()

                        ) : (

                          /* CASO 3: PAPELERA VACÍA */
                          <tr>
                            <td
                              colSpan="3"
                              className="maestro-empty"
                            >
                              La papelera está vacía.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>


                  {/* CANTIDAD DE ELEMENTOS QUE COINCIDEN CON LA BÚSQUEDA */}
                  <p className="maestro-results">
                    {currentItems.length} elementos en la papelera
                  </p>
                </div>
              )}
            </section>
          </div>
        </section>


        {/* AVISO INFORMATIVO */}
        <aside className="maestro-notice">
          <strong>Gestión del catálogo</strong>

          <p>
            Los cambios se guardan en Firestore y se sincronizan
            automáticamente. Los elementos enviados a la papelera se
            conservan y pueden restaurarse sin perder sus datos ni su
            estado de publicación.
          </p>
        </aside>
      </main>


      {/* BOTÓN ADMINISTRATIVO FLOTANTE:
          El componente recibe activo para indicar su estado visual.
          alAlternar recibe una función que navega hacia la biblioteca musical. */}
      <BotonAdmin
        activo
        alAlternar={() => navigate('/musica')}
      />


      {/* PIE DE PÁGINA GENERAL */}
      <Footer />
    </>
  );
}


// 17. EXPORTACIÓN DEL COMPONENTE

// Exportamos MaestroMelodias como exportación predeterminada.
//
// Esto permite importarlo desde otros archivos del proyecto, por ejemplo,
// desde el sistema de rutas:
//
// import MaestroMelodias from './pages/MaestroMelodias';
//
// Luego puede utilizarse como una página dentro de React Router.
export default MaestroMelodias;