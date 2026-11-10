import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/Footer";
import PerfilDecoracion from "../components/perfil/PerfilDecoracion";
import PerfilMenuLateral from "../components/perfil/PerfilMenuLateral";
import PerfilResumen from "../components/perfil/PerfilResumen";
import PerfilPublicaciones from "../components/perfil/PerfilPublicaciones";
import PerfilGuardados from "../components/perfil/PerfilGuardados";
import PerfilDatos from "../components/perfil/PerfilDatos";
import PerfilFormulario from "../components/perfil/PerfilFormulario";

import { useAuth } from "../context/AuthContext";
import { useMusic } from "../context/MusicContext";
import useGuardados from "../hooks/useGuardados";
import { SECCIONES_ADMIN, esSuperAdmin, tienePermiso } from "../utils/permisos";
import {
  COLECCIONES,
  actualizarDocumento,
  escucharPorCampo,
  escucharProductos,
  escucharPublicaciones,
} from "../services/firestore";

import "../styles/perfil.css";

// ÍNDICE GENERAL
// 1. Importaciones y dependencias
// 2. Secciones disponibles en el perfil
// 3. Campos que se pueden modificar
// 4. Rutas de administración
// 5. Componente principal y obtención de contexto
// 6. Estados de la página y datos almacenados
// 7. Contenido guardado del usuario
// 8. Apertura de una sección solicitada desde la navegación
// 9. Escucha de las publicaciones propias
// 10. Carga temporal de publicaciones y productos guardados
// 11. Pantalla de carga
// 12. Datos calculados para mostrar el perfil
// 13. Comprobación de permisos y accesos administrativos
// 14. Cálculo del total de elementos guardados
// 15. Navegación entre secciones
// 16. Guardado de los cambios del perfil
// 17. Eliminación de elementos guardados
// 18. Estructura visual y componentes del perfil
// 19. Renderizado condicional de cada sección

// 1. IMPORTACIONES Y DEPENDENCIAS
// React:
// - useState permite guardar información que puede cambiar mientras se utiliza la página.
// - useEffect permite ejecutar procesos cuando cambian determinados datos, por ejemplo,
//   escuchar publicaciones cuando se inicia sesión o cuando se abre una sección.
// React Router:
// - useLocation permite consultar información de la navegación actual, como los datos
//   enviados mediante la propiedad state de un enlace.
// Componentes visuales:
// - Header y Footer son las partes superior e inferior compartidas con otras páginas.
// - Los componentes Perfil... dividen el perfil en partes más pequeñas: decoración,
//   menú lateral, resumen, publicaciones, guardados, datos y formulario.
// Contextos y hooks propios:
// - useAuth proporciona los datos de la sesión y del perfil del usuario.
// - useMusic proporciona las canciones disponibles en el contexto de música.
// - useGuardados permite consultar y modificar los elementos guardados por el usuario.
// Utilidades y Firestore:
// - permisos.js contiene las comprobaciones de permisos administrativos.
// - firestore.js reúne las operaciones utilizadas para leer y actualizar documentos.
// - perfil.css contiene los estilos visuales específicos de esta página.


// 2. SECCIONES DISPONIBLES EN EL PERFIL
// Este array define los apartados que aparecen en el menú lateral.
// Cada objeto representa una opción y contiene tres propiedades:
// - id: identificador interno utilizado por el programa para saber qué sección abrir.
// - nombre: texto que se muestra como título o nombre visible de la sección.
// - icono: clase de Bootstrap Icons que identifica visualmente la opción.
//
// Por ejemplo, si el usuario selecciona "Contenido guardado", el programa utiliza
// el identificador "guardado" para mostrar el componente PerfilGuardados.
// El id debe coincidir con los valores que se comparan más adelante en este archivo.
const SECCIONES = [
  { id: "resumen", nombre: "Resumen", icono: "bi-grid" },
  { id: "publicaciones", nombre: "Mis publicaciones", icono: "bi-chat-square-text" },
  { id: "guardado", nombre: "Contenido guardado", icono: "bi-heart" },
  { id: "datos", nombre: "Datos personales", icono: "bi-person-gear" },
];

// 3. CAMPOS QUE SE PUEDEN MODIFICAR EN EL PERFIL
// Esta lista funciona como una autorización interna de los campos que el formulario
// puede enviar para actualizar el documento del usuario en Firestore.
//
// Cada texto debe coincidir exactamente con el nombre de una propiedad almacenada
// en el documento de usuarios/{uid}. Por ejemplo, "nombreUsuario" identifica el
// campo donde se guarda el nombre público de la cuenta.
//
// La lista se utiliza más adelante en guardarCambios() para construir un objeto
// que contenga únicamente los campos permitidos.
// IMPORTANTE: no se incluyen propiedades sensibles como rol, permisos o estado.
// De esta manera, el formulario de perfil no intenta modificar esos datos.
//
// Esta comprobación del lado del cliente organiza los datos antes de enviarlos.
// La seguridad definitiva también depende de las reglas configuradas en Firestore.
const CAMPOS_PERFIL = [
  "nombreUsuario",
  "nombre",
  "apellido",
  "biografia",
  "ubicacion",
  "sitioWeb",
  "fechaNacimiento",
  "fotoPerfil",
  "pais",
  "notificaciones",
];

// 4. RUTAS DE ADMINISTRACIÓN
// Este objeto relaciona el identificador de cada sección administrable con la ruta
// de la página correspondiente.
//
// Las claves (inicio, historia, versiones, etc.) deben coincidir con los identificadores
// utilizados en SECCIONES_ADMIN, que proviene del archivo utils/permisos.
// El valor de cada propiedad es la dirección a la que debe navegar el acceso rápido.
//
// Ejemplo:
// Si una sección administrable tiene el id "historia", se obtiene "/historia".
// Si se intenta consultar una clave que no existe en este objeto, más adelante se
// utiliza "/" como ruta alternativa.
const RUTAS_ADMIN = {
  inicio: "/",
  historia: "/historia",
  versiones: "/versiones",
  comunidad: "/comunidad",
  musica: "/musica/maestro",
  tienda: "/tienda",
};

// 5. COMPONENTE PRINCIPAL: PÁGINA DE PERFIL
// Este componente construye la página completa del perfil del usuario.
// Se utiliza en la ruta /perfil y organiza la interfaz en un menú lateral y un panel
// principal. El panel muestra una sección por vez: resumen, publicaciones, guardados
// o datos personales.
//
// También administra los datos necesarios para esas secciones, consulta información
// de Firestore, comprueba permisos y coordina el guardado de los cambios.
//
// La navegación puede solicitar que se abra una sección concreta enviando información
// mediante state. Ejemplo desde otro componente:
// <Link to="/perfil" state={{ seccion: "guardado" }}>Contenido guardado</Link>
//
// En ese caso, al entrar al perfil se abrirá directamente el apartado "guardado".
export default function Perfil() {
  // 5.1. OBTENCIÓN DE DATOS DE CONTEXTO Y NAVEGACIÓN
  // useAuth() devuelve información relacionada con la autenticación:
  // - usuario: datos de la cuenta autenticada, como uid, email o displayName.
// - perfil: datos adicionales del usuario guardados en la aplicación.
// - cargando: indica si todavía se están recuperando los datos de autenticación/perfil.
  //
  // useLocation() permite acceder a la ubicación actual de React Router.
  // Se utiliza especialmente para leer location.state?.seccion, que puede indicar
  // qué apartado debe abrirse al ingresar a esta página.
  //
  // useMusic() proporciona songs, que contiene las canciones disponibles en el
  // contexto de música. Se pasan a la sección de contenido guardado para relacionar
  // los identificadores guardados con los datos completos de las canciones.
  const { usuario, perfil, cargando } = useAuth();
  const location = useLocation();
  const { songs } = useMusic();

  // 6. ESTADOS DE LA PÁGINA
  // useState crea valores que React conserva entre renderizados.
  // Cuando se llama a la función actualizadora correspondiente (set...), React
  // actualiza el estado y vuelve a renderizar el componente para reflejar el cambio.
  //
  // seccion:
  // Guarda el identificador del apartado que se está mostrando.
  // Se intenta obtener inicialmente desde location.state?.seccion.
  // El operador ?. evita un error si location.state no existe.
  // Si no se recibió ninguna sección, se abre "resumen" como opción predeterminada.
  //
  // editando:
  // Indica si el usuario está modificando sus datos personales.
  // false significa que se muestran los datos en modo de lectura.
  // true significa que se muestra el formulario de edición.
  //
  // guardando:
  // Indica si hay una operación de guardado en curso. Se utiliza para que el formulario
  // pueda mostrar o controlar su estado mientras se envían los cambios a Firestore.
  //
  // mensaje y error:
  // Almacenan textos para informar si una operación terminó correctamente o si ocurrió
  // un problema. Si contienen una cadena vacía, no hay ningún aviso para mostrar.
  const [seccion, setSeccion] = useState(location.state?.seccion || "resumen");
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // 6.1. ESTADOS PARA LOS DATOS OBTENIDOS DE FIRESTORE
  // Estos estados almacenan colecciones que se reciben desde el servicio firestore.js.
  //
  // publicaciones:
  // Contiene las publicaciones realizadas por el usuario autenticado. Se carga mediante
  // una escucha filtrada por el campo autorId.
  //
  // todasPublicaciones:
  // Contiene las publicaciones disponibles en la colección general. Se utiliza en la
  // sección de guardados para encontrar los datos completos de las publicaciones cuyos
  // identificadores guardó el usuario.
  //
  // productos:
  // Contiene los productos recibidos desde Firestore. Se utiliza junto con los IDs
  // guardados para mostrar los productos correspondientes.
  //
  // Los arrays comienzan vacíos porque los datos se reciben de forma asíncrona:
  // la página puede renderizarse antes de que termine la consulta a Firestore.
  const [publicaciones, setPublicaciones] = useState([]);
  const [todasPublicaciones, setTodasPublicaciones] = useState([]);
  const [productos, setProductos] = useState([]);

  // 7. CONTENIDO GUARDADO DEL USUARIO
  // useGuardados es un hook personalizado que administra los elementos guardados.
  // Se llama tres veces porque la aplicación distingue tres tipos de contenido:
  // canciones, publicaciones y productos.
  //
  // Cada llamada recibe un tipo y devuelve información relacionada con esa categoría.
  // En este componente se utiliza principalmente la propiedad ids, que contiene los
  // identificadores de los elementos guardados, y la función alternar(id), que cambia
  // el estado de guardado de un elemento.
  //
  // Por ejemplo, guardadasCanciones.ids contiene los IDs de las canciones guardadas.
  // Los datos completos de esas canciones se obtienen desde songs, no desde este array
  // de identificadores.
  //
  // Según la implementación del hook, cada instancia escucha la subcolección adecuada
  // dentro del documento del usuario en Firestore.
  const guardadasCanciones = useGuardados("cancion");
  const guardadasPublicaciones = useGuardados("publicacion");
  const guardadosProductos = useGuardados("producto");

  // 8. ABRIR UNA SECCIÓN SOLICITADA DESDE LA NAVEGACIÓN
  // Este efecto se ejecuta cuando cambia location.key, una clave que React Router
  // actualiza al producirse una nueva navegación.
  //
  // La secuencia es:
  // 1. Se consulta si la navegación envió una sección mediante location.state.
  // 2. Se comprueba que el identificador exista dentro del array SECCIONES.
  // 3. Si existe, se actualiza la sección visible.
  // 4. Se cierra el modo de edición y se limpian los mensajes anteriores.
  //
  // SECCIONES.some() recorre el array y devuelve true si al menos uno de sus elementos
  // cumple la condición indicada. En este caso, comprueba que s.id coincida con pedida.
  //
  // Ejemplo: si pedida vale "guardado", se encuentra el objeto cuyo id es "guardado"
  // y se abre esa sección. Si llega un identificador que no existe, no se cambia
  // la sección actual.
  useEffect(() => {
    const pedida = location.state?.seccion;

    if (pedida && SECCIONES.some((s) => s.id === pedida)) {
      setSeccion(pedida);
      setEditando(false);
      setMensaje("");
      setError("");
    }
  }, [location.key]);

  // 9. ESCUCHA DE LAS PUBLICACIONES PROPIAS
  // Este efecto obtiene y mantiene actualizada la lista de publicaciones del usuario.
  // Se vuelve a ejecutar cuando cambia usuario?.uid, es decir, cuando cambia el
  // identificador de la cuenta autenticada.
  //
  // Primero se comprueba que exista un uid. El uid es el identificador único que
  // Firebase Authentication asigna a cada usuario.
  // Si no existe, se devuelve undefined y no se inicia ninguna escucha.
  //
  // escucharPorCampo recibe:
  // 1. La colección de Firestore donde se encuentran las publicaciones.
  // 2. El nombre del campo por el que se filtra: "autorId".
  // 3. El valor que debe tener ese campo: el uid del usuario actual.
  // 4. Una función que recibe los documentos encontrados y actualiza el estado.
  // 5. Una función que recibe y muestra los errores que puedan producirse.
  //
  // Los resultados se copian con [...items] antes de ordenarlos. Esto crea un nuevo
  // array y evita ordenar directamente el array recibido.
  // sort() organiza las publicaciones comparando sus fechas de creación.
  // toMillis() convierte el Timestamp de Firestore en milisegundos.
  // El operador ?. permite que el código no falle si fechaCreacion o toMillis no existen.
  // El valor || 0 utiliza cero como alternativa cuando no hay una fecha disponible.
  //
  // La resta coloca primero la fecha más grande, por eso las publicaciones más recientes
  // aparecen antes que las antiguas.
  //
  // escucharPorCampo devuelve una función para cancelar la escucha. El return de este
  // efecto entrega esa función a React, que la ejecutará cuando corresponda limpiar
  // el efecto, por ejemplo, al cambiar de usuario o desmontar el componente.
  useEffect(() => {
    if (!usuario?.uid) return undefined;

    return escucharPorCampo(
      COLECCIONES.publicaciones,
      "autorId",
      usuario.uid,
      (items) =>
        setPublicaciones(
          [...items].sort(
            (a, b) =>
              (b.fechaCreacion?.toMillis?.() || 0) -
              (a.fechaCreacion?.toMillis?.() || 0)
          )
        ),
      (err) => console.error("No se pudieron cargar las publicaciones:", err)
    );
  }, [usuario?.uid]);

  // 10. CARGA DE PUBLICACIONES Y PRODUCTOS PARA LA SECCIÓN DE GUARDADOS
  // Estas escuchas solamente se activan cuando la sección actual es "guardado".
  // Así se evita mantener consultas activas de publicaciones y productos mientras
  // el usuario está mirando el resumen, sus publicaciones o sus datos personales.
  //
  // Si la sección actual no es "guardado", el efecto termina inmediatamente.
  // Cuando sí lo es:
  // 1. escucharPublicaciones obtiene las publicaciones generales y actualiza
  //    el estado todasPublicaciones.
  // 2. escucharProductos obtiene los productos y actualiza el estado productos.
  // 3. Cada función recibe también un callback para informar errores.
  //
  // Las variables dejarPublicaciones y dejarProductos guardan las funciones de limpieza
  // devueltas por cada escucha. Al salir de la sección o desmontar el componente,
  // React ejecuta la función de limpieza del efecto.
  //
  // El operador ?. antes de llamar a cada función permite que la limpieza no produzca
  // un error si alguna de las variables no contiene una función.
  useEffect(() => {
    if (seccion !== "guardado") return undefined;

    const dejarPublicaciones = escucharPublicaciones(
      setTodasPublicaciones,
      (err) => console.error("No se pudieron cargar las publicaciones:", err)
    );
    const dejarProductos = escucharProductos(
      setProductos,
      (err) => console.error("No se pudieron cargar los productos:", err)
    );

    return () => {
      dejarPublicaciones?.();
      dejarProductos?.();
    };
  }, [seccion]);

  // 11. PANTALLA DE CARGA
  // Antes de mostrar el perfil completo, se comprueba si la información necesaria
  // todavía se está cargando o si el objeto perfil no está disponible.
  //
  // Si cargando es true, significa que el proceso de carga todavía no terminó.
  // Si !perfil es true, significa que perfil no contiene un valor válido.
  // El operador || hace que alcance con que una de las dos situaciones ocurra
  // para mostrar esta pantalla temporal.
  //
  // El return anticipado detiene el renderizado del resto del componente durante
  // ese momento. Se muestra el encabezado, un indicador giratorio de Bootstrap
  // y el texto "Cargando tu perfil...".
  if (cargando || !perfil) {
    return (
      <>
        <Header />
        <main className="perfil-page perfil-page--cargando">
          <span className="spinner-border" role="status" />
          <p>Cargando tu perfil...</p>
        </main>
      </>
    );
  }

  // 12. DATOS CALCULADOS PARA MOSTRAR EL PERFIL
  // Estas constantes preparan información a partir de los datos del usuario.
  // No modifican el perfil original: calculan valores que luego se pasan a los
  // componentes visuales.
  //
  // nombreMostrar:
  // Busca el primer nombre disponible siguiendo este orden:
  // 1. perfil.nombreUsuario: nombre público configurado en Wiki-Craft.
  // 2. usuario.displayName: nombre asociado a la cuenta de autenticación.
  // 3. usuario.email.split("@")[0]: parte del correo anterior al símbolo @.
  // 4. "Jugador": texto utilizado si no existe ninguno de los datos anteriores.
  //
  // El operador || devuelve el primer valor que no sea considerado vacío o falso.
  // El operador ?. evita intentar acceder a una propiedad cuando el objeto anterior
  // no existe.
  //
  // nombreCompleto:
  // Construye un array con nombre y apellido. filter(Boolean) elimina valores vacíos,
  // nulos o indefinidos. join(" ") une los elementos restantes con un espacio.
  // Por ejemplo: ["Iván", "Barrera"] se convierte en "Iván Barrera".
  //
  // foto:
  // Prioriza la foto guardada en el perfil de Wiki-Craft. Si no existe, utiliza
  // la foto de la cuenta de autenticación. Si tampoco hay una, utiliza una cadena vacía.
  const nombreMostrar =
    perfil.nombreUsuario || usuario?.displayName || usuario?.email?.split("@")[0] || "Jugador";
  const nombreCompleto = [perfil.nombre, perfil.apellido].filter(Boolean).join(" ");
  const foto = perfil.fotoPerfil || usuario?.photoURL || "";

  // 13. COMPROBACIÓN DE PERMISOS Y ACCESOS ADMINISTRATIVOS
  // Estas operaciones determinan qué herramientas de administración puede ver el usuario.
  //
  // superAdmin:
  // esSuperAdmin(perfil) comprueba si el perfil corresponde a una cuenta con permisos
  // de superadministrador, según las reglas definidas en utils/permisos.
  //
  // seccionesAdmin:
  // SECCIONES_ADMIN contiene las secciones que pueden administrarse.
  // filter() crea un nuevo array conservando solamente aquellas para las que
  // tienePermiso(perfil, s.id) devuelve true.
  //
  // accesosAdmin:
  // map() transforma cada sección autorizada en un nuevo objeto.
  // El operador spread (...s) copia las propiedades originales de la sección.
  // Después se agrega ruta, que se obtiene desde RUTAS_ADMIN.
  // Si no hay una ruta definida para ese id, se utiliza "/" como alternativa.
  //
  // rolAdmin:
  // Es true cuando el usuario es superadministrador o tiene al menos una sección
  // administrable. length > 0 comprueba que el array no esté vacío.
  const superAdmin = esSuperAdmin(perfil);
  const seccionesAdmin = SECCIONES_ADMIN.filter((s) => tienePermiso(perfil, s.id));
  const accesosAdmin = seccionesAdmin.map((s) => ({ ...s, ruta: RUTAS_ADMIN[s.id] || "/" }));
  const rolAdmin = superAdmin || seccionesAdmin.length > 0;

  // 13.1. TEXTO QUE IDENTIFICA EL ROL DEL USUARIO
  // El texto comienza con "Explorador", que funciona como rol predeterminado.
  // Luego se comprueban las condiciones en orden:
  //
  // - Si superAdmin es true, el texto pasa a ser "Superadmin".
  // - Si no es superadministrador, pero tiene secciones administrables, se construye
  //   el texto "Administrador de..." seguido de los nombres de esas secciones.
  // - Si no se cumple ninguna condición, conserva "Explorador".
  //
  // map() obtiene los nombres de las secciones autorizadas y join(", ") los une
  // con coma y espacio. Por ejemplo: "Administrador de Historia, Tienda".
  let rolTexto = "Explorador";
  if (superAdmin) {
    rolTexto = "Superadmin";
  } else if (seccionesAdmin.length > 0) {
    rolTexto = `Administrador de ${seccionesAdmin.map((s) => s.nombre).join(", ")}`;
  }

  // 14. CANTIDAD TOTAL DE ELEMENTOS GUARDADOS
  // Cada hook mantiene por separado los identificadores de canciones, publicaciones
  // y productos guardados.
  // Se suman las longitudes de los tres arrays para obtener una cantidad general.
  //
  // Ejemplo:
  // - 3 canciones guardadas.
  // - 2 publicaciones guardadas.
  // - 4 productos guardados.
  // Total: 3 + 2 + 4 = 9 elementos guardados.
  //
  // Este número se utiliza en el resumen del perfil.
  const totalGuardado =
    guardadasCanciones.ids.length +
    guardadasPublicaciones.ids.length +
    guardadosProductos.ids.length;

  // 14.1. DATOS DE LA SECCIÓN ACTUAL
  // Busca dentro de SECCIONES el objeto cuyo id coincide con el estado seccion.
  // find() devuelve el primer elemento que cumple la condición.
  // Si no encuentra coincidencias, se utiliza SECCIONES[0], es decir, la primera
  // sección del array (Resumen), como alternativa para evitar que falten sus datos.
  // El resultado permite obtener, por ejemplo, el nombre que se muestra como título.
  const seccionActual = SECCIONES.find((s) => s.id === seccion) || SECCIONES[0];

  // 15. NAVEGACIÓN ENTRE SECCIONES DEL PERFIL
  // Esta función centraliza el cambio de apartado.
  //
  // Parámetros:
  // - id: identificador de la sección que se desea mostrar. Debe coincidir con un id
  //   definido en el array SECCIONES.
  // - abrirEdicion: valor opcional que indica si se debe abrir el formulario de edición.
  //   Su valor predeterminado es false, por lo que normalmente se abre en modo lectura.
  //
  // Secuencia:
  // 1. Actualiza seccion para mostrar el apartado solicitado.
  // 2. Actualiza editando según el segundo parámetro.
  // 3. Limpia el mensaje de éxito anterior.
  // 4. Limpia el error anterior.
  //
  // Ejemplo:
  // irA("datos", true) abre Datos personales directamente en modo edición.
  // irA("resumen") abre Resumen y deja editando en false.
  function irA(id, abrirEdicion = false) {
    setSeccion(id);
    setEditando(abrirEdicion);
    setMensaje("");
    setError("");
  }

  // 16. GUARDAR LOS CAMBIOS DEL PERFIL
  // Esta función recibe los datos enviados por PerfilFormulario y los guarda
  // en el documento del usuario dentro de la colección de usuarios de Firestore.
  //
  // El proceso es asíncrono porque la actualización requiere comunicarse con Firestore.
  // async permite utilizar await para esperar el resultado de esa operación sin
  // bloquear toda la interfaz.
  //
  // Parámetro:
  // - datos: objeto con los valores que el formulario quiere guardar.
  //
  // Secuencia general:
  // 1. Limpia los mensajes anteriores.
  // 2. Construye un objeto nuevo llamado cambios.
  // 3. Copia únicamente las propiedades permitidas por CAMPOS_PERFIL.
  // 4. Activa el estado guardando.
  // 5. Envía los cambios a Firestore.
  // 6. Si la operación funciona, cierra el formulario y muestra un mensaje de éxito.
  // 7. Si falla, registra el error y muestra un aviso.
  // 8. En cualquier caso, desactiva el estado guardando.
  async function guardarCambios(datos) {
    // 16.1. LIMPIEZA DE AVISOS ANTERIORES
    // Evita que un mensaje de una operación anterior siga visible mientras se intenta
    // guardar una nueva modificación.
    setError("");
    setMensaje("");

    // 16.2. CONSTRUCCIÓN DE LOS CAMPOS AUTORIZADOS
    // Se crea un objeto vacío. Luego forEach() recorre los nombres almacenados
    // en CAMPOS_PERFIL, uno por uno.
    //
    // En cada vuelta, campo representa el nombre de una propiedad permitida.
    // Se consulta datos[campo] para obtener el valor enviado por el formulario.
    // La condición !== undefined comprueba que esa propiedad haya sido enviada.
    // Si existe, se copia al objeto cambios.
    //
    // Ejemplo:
    // Si datos contiene { nombre: "Iván", rol: "admin" }, el recorrido solo copia
    // "nombre" si está en CAMPOS_PERFIL. "rol" se ignora porque no está autorizado.
    // Esto evita enviar desde este formulario propiedades ajenas a la edición del perfil.
    const cambios = {};
    CAMPOS_PERFIL.forEach((campo) => {
      if (datos[campo] !== undefined) cambios[campo] = datos[campo];
    });

    // Se activa el indicador de guardado antes de iniciar la comunicación con Firestore.
    // El componente PerfilFormulario recibe este estado mediante la propiedad guardando
    // y puede utilizarlo para reflejar que la operación está en curso.
    setGuardando(true);

    try {
      // 16.3. ENVÍO DE LA ACTUALIZACIÓN A FIRESTORE
      // actualizarDocumento recibe tres argumentos:
      // 1. COLECCIONES.usuarios: identifica la colección donde se encuentra el perfil.
      // 2. usuario.uid: identifica el documento concreto del usuario autenticado.
      // 3. cambios: objeto que contiene solamente los campos permitidos y enviados.
      //
      // await espera a que la operación termine antes de continuar con la siguiente línea.
      // Si la promesa se resuelve correctamente, se ejecutan las instrucciones siguientes.
      // Si se rechaza por un error, la ejecución pasa directamente al bloque catch.
      await actualizarDocumento(COLECCIONES.usuarios, usuario.uid, cambios);

      // 16.4. RESPUESTA CUANDO EL GUARDADO FINALIZA CORRECTAMENTE
      // Se cierra el modo de edición para volver a mostrar los datos en modo lectura.
      // Luego se establece un mensaje que la interfaz mostrará como confirmación.
      setEditando(false);
      setMensaje("Guardamos los cambios de tu perfil.");
    } catch (err) {
      // 16.5. RESPUESTA CUANDO OCURRE UN ERROR
      // catch recibe el error producido durante la operación.
      // console.error() lo muestra en la consola del navegador para facilitar
      // la revisión técnica del problema.
      // setError() guarda un mensaje más sencillo para que lo vea el usuario.
      console.error(err);
      setError("No pudimos guardar los cambios. Revisá tu conexión e intentá de nuevo.");
    } finally {
      // 16.6. FINALIZACIÓN DEL ESTADO DE GUARDADO
      // finally se ejecuta tanto si la operación tuvo éxito como si ocurrió un error.
      // Por eso se utiliza para desactivar guardando en ambos escenarios y evitar
      // que la interfaz quede indicando que todavía se está guardando.
      setGuardando(false);
    }
  }

  // 17. QUITAR UN ELEMENTO DEL CONTENIDO GUARDADO
  // Esta función recibe el tipo de elemento y su identificador.
  //
  // Parámetros:
  // - tipo: indica si el elemento es una "cancion", "publicacion" o "producto".
  // - id: identificador del elemento que se quiere quitar de guardados.
  //
  // Según el tipo recibido, se llama a alternar(id) en el hook correspondiente.
  // La función alternar pertenece a useGuardados y cambia el estado de guardado
  // del elemento indicado. En este contexto se utiliza para quitarlo de la lista.
  //
  // Ejemplo:
  // quitarGuardado("producto", "producto123") solicita cambiar el estado de guardado
  // del producto con identificador "producto123".
  //
  // Los tres if son independientes. Solamente se ejecuta el que coincide con tipo.
  function quitarGuardado(tipo, id) {
    if (tipo === "cancion") guardadasCanciones.alternar(id);
    if (tipo === "publicacion") guardadasPublicaciones.alternar(id);
    if (tipo === "producto") guardadosProductos.alternar(id);
  }

  // 18. ESTRUCTURA VISUAL PRINCIPAL DEL PERFIL
  // A partir de este return se define el contenido que React dibuja en la página.
  // El fragmento <>...</> permite agrupar varios elementos sin crear una etiqueta
  // HTML adicional alrededor de ellos.
  //
  // La estructura general es:
  // 1. Header: encabezado general del sitio.
  // 2. main: contenido principal de la página de perfil.
  // 3. PerfilDecoracion: elementos decorativos propios del diseño del perfil.
  // 4. perfil-contenedor y perfil-card: contenedores que organizan el menú y el panel.
  // 5. PerfilMenuLateral: navegación entre las secciones del perfil.
  // 6. perfil-panel-der: panel donde se muestra el contenido seleccionado.
  // 7. Footer: pie de página general del sitio.
  return (
    <>
      <Header />

      <main className="perfil-page">
        <PerfilDecoracion />

        <div className="perfil-contenedor">
          <div className="perfil-card">
            {/* 18.1. MENÚ LATERAL DEL PERFIL
                Este componente muestra la imagen, el nombre, el rol y las opciones
                de navegación del usuario.

                Propiedades que recibe:
                - foto: dirección de la imagen de perfil calculada anteriormente.
                - nombre: nombre que se debe mostrar en el menú.
                - rolTexto: texto descriptivo del rol del usuario.
                - rolAdmin: indica si tiene permisos administrativos.
                - secciones: array con las opciones disponibles del perfil.
                - seccionActual: id del apartado que está seleccionado.
                - onCambiar: función que se ejecuta cuando se selecciona otra sección.

                La función flecha (id) => irA(id) recibe el identificador seleccionado
                y lo envía a irA(), que actualiza el estado de navegación. */}
            <PerfilMenuLateral
              foto={foto}
              nombre={nombreMostrar}
              rolTexto={rolTexto}
              rolAdmin={rolAdmin}
              secciones={SECCIONES}
              seccionActual={seccion}
              onCambiar={(id) => irA(id)}
            />

            <section className="perfil-panel-der">
              {/* 18.2. CABECERA INTERNA DEL PERFIL
                  Muestra la identidad visual de Wiki-Craft y una leyenda que presenta
                  este apartado como el espacio personal del usuario.
                  Las clases bi-* pertenecen a Bootstrap Icons y dibujan los íconos. */}
              <div className="perfil-cabecera">
                <span className="perfil-etiqueta">
                  <i className="bi bi-flower2" /> Wiki-Craft
                </span>
                <span className="perfil-nota">
                  <i className="bi bi-sun" /> Tu espacio personal
                </span>
              </div>

              {/* 18.3. TÍTULO Y BOTÓN PARA EDITAR LOS DATOS
                  seccionActual.nombre contiene el nombre visible de la sección activa.
                  Por eso el título cambia automáticamente cuando el usuario navega
                  entre Resumen, Mis publicaciones, Contenido guardado y Datos personales.

                  El botón "Editar datos" solamente se muestra cuando:
                  - La sección actual es "datos".
                  - El formulario todavía no está abierto (editando es false).

                  Al hacer clic, setEditando(true) cambia el estado y React vuelve a
                  renderizar el componente. Más abajo, esa condición hace que aparezca
                  PerfilFormulario en lugar de PerfilDatos. */}
              <div className="perfil-titulo-fila">
                <h2 className="perfil-titulo">{seccionActual.nombre}</h2>

                {seccion === "datos" && !editando && (
                  <button type="button" className="perfil-btn" onClick={() => setEditando(true)}>
                    <i className="bi bi-pencil-fill" /> Editar datos
                  </button>
                )}
              </div>

              {/* 18.4. MENSAJES DE RESULTADO
                  Estos avisos dependen de los estados mensaje y error.
                  La expresión mensaje && (...) significa que el bloque se renderiza
                  cuando mensaje contiene un valor verdadero, normalmente un texto.
                  El mismo criterio se aplica a error.

                  role="status" permite identificar el aviso de éxito como información
                  de estado. role="alert" identifica el error como un mensaje importante
                  que debe ser anunciado por tecnologías de asistencia. */}
              {mensaje && (
                <div className="perfil-alerta perfil-alerta--exito" role="status">{mensaje}</div>
              )}
              {error && (
                <div className="perfil-alerta perfil-alerta--error" role="alert">{error}</div>
              )}

              {/* 19. RENDERIZADO CONDICIONAL DE LAS SECCIONES
                  Este contenedor incluye el contenido que corresponde al apartado activo.
                  key={seccion} le indica a React que cada sección debe tratarse como una
                  instancia distinta. Cuando cambia seccion, React puede desmontar el
                  contenido anterior y montar el nuevo; en este diseño también permite
                  reiniciar la animación asociada al cambio de contenido.

                  Cada condición compara el identificador seccion con una opción.
                  Solo se renderiza el componente cuya condición sea verdadera. */}

              <div className="perfil-contenido" key={seccion}>
                {/* 19.1. SECCIÓN RESUMEN
                    Se muestra cuando seccion vale "resumen".
                    PerfilResumen recibe los datos necesarios para construir la vista
                    general del usuario.

                    Datos enviados:
                    - perfil: información completa del perfil.
                    - email: correo de la cuenta autenticada.
                    - nombreCompleto: nombre y apellido unidos.
                    - publicaciones: publicaciones propias obtenidas desde Firestore.
                    - totalGuardado: cantidad total de canciones, publicaciones y productos guardados.
                    - accesosAdmin: accesos rápidos correspondientes a sus permisos.
                    - esSuper: indica si la cuenta es superadministradora.
                    - onIrA: permite que el resumen solicite navegar a otra sección.

                    La función irA se pasa como propiedad para que el componente hijo
                    pueda solicitar un cambio de sección sin modificar directamente
                    el estado interno de este componente. */}
                {seccion === "resumen" && (
                  <PerfilResumen
                    perfil={perfil}
                    email={usuario.email}
                    nombreCompleto={nombreCompleto}
                    publicaciones={publicaciones}
                    totalGuardado={totalGuardado}
                    accesosAdmin={accesosAdmin}
                    esSuper={superAdmin}
                    onIrA={irA}
                  />
                )}

                {/* 19.2. SECCIÓN MIS PUBLICACIONES
                    Se muestra cuando seccion vale "publicaciones".
                    Se entrega el array publicaciones, que contiene las publicaciones
                    cuyo autorId coincide con el uid del usuario autenticado.
                    La consulta y el ordenamiento se realizan en el efecto de la sección 9. */}
                {seccion === "publicaciones" && (
                  <PerfilPublicaciones publicaciones={publicaciones} />
                )}

                {/* 19.3. SECCIÓN CONTENIDO GUARDADO
                    Se muestra cuando seccion vale "guardado".
                    PerfilGuardados necesita dos clases de información:

                    A) Identificadores guardados:
                    - idsCanciones: IDs de canciones guardadas por el usuario.
                    - idsPublicaciones: IDs de publicaciones guardadas.
                    - idsProductos: IDs de productos guardados.

                    B) Datos completos para mostrar cada elemento:
                    - canciones: información de canciones obtenida desde MusicContext.
                    - publicaciones: colección general recibida desde Firestore.
                    - productos: productos recibidos desde Firestore.

                    Los identificadores indican qué elementos pertenecen a los guardados;
                    los arrays de datos completos permiten mostrar sus nombres, imágenes,
                    descripciones y demás información disponible.

                    onQuitar recibe quitarGuardado para que el componente hijo pueda
                    solicitar que un elemento se elimine de la lista de guardados. */}
                {seccion === "guardado" && (
                  <PerfilGuardados
                    idsCanciones={guardadasCanciones.ids}
                    idsPublicaciones={guardadasPublicaciones.ids}
                    idsProductos={guardadosProductos.ids}
                    canciones={songs}
                    publicaciones={todasPublicaciones}
                    productos={productos}
                    onQuitar={quitarGuardado}
                  />
                )}

                {/* 19.4. SECCIÓN DATOS PERSONALES
                    Esta sección tiene dos modos de visualización:
                    - Modo lectura: muestra PerfilDatos cuando editando es false.
                    - Modo edición: muestra PerfilFormulario cuando editando es true.

                    La condición editando ? (...) : (...) es un operador ternario:
                    si editando es true, se muestra el formulario; de lo contrario,
                    se muestran los datos personales.

                    PerfilFormulario recibe:
                    - perfil: valores actuales que se pueden editar.
                    - email: correo de la cuenta.
                    - nombreMostrar: nombre utilizado como referencia visual.
                    - guardando: estado de la operación de guardado.
                    - onGuardar: función que recibe los datos del formulario y ejecuta
                      guardarCambios().
                    - onCancelar: función que vuelve a la sección de datos en modo lectura.

                    PerfilDatos recibe el perfil y el correo para mostrar la información
                    sin habilitar su edición. */}
                {seccion === "datos" &&
                  (editando ? (
                    <PerfilFormulario
                      perfil={perfil}
                      email={usuario.email}
                      nombreMostrar={nombreMostrar}
                      guardando={guardando}
                      onGuardar={guardarCambios}
                      onCancelar={() => irA("datos")}
                    />
                  ) : (
                    <PerfilDatos perfil={perfil} email={usuario.email} />
                  ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
