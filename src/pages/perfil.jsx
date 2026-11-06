// 1. IMPORTACIONES

// Importa los hooks de React utilizados para manejar estados,
// ejecutar efectos secundarios y memorizar valores.
import { useEffect, useMemo, useState } from "react";

// Link permite navegar entre páginas sin recargar el sitio.
import { Link } from "react-router-dom";

// Componentes compartidos que se utilizan en diferentes páginas.
import Header from "../components/header";
import Footer from "../components/Footer";

// Hook personalizado que proporciona la información del usuario autenticado,
// sus datos de perfil y sus permisos.
import { useAuth } from "../context/AuthContext";

// Funciones y constantes utilizadas para trabajar con Firestore.
import {
  COLECCIONES,
  actualizarDocumento,
  escucharPorCampo,
} from "../services/firestore";

// Importa los estilos específicos de la página de perfil.
import "../styles/perfil.css";


// 2. Contsantes 

// SECCIONES: define las opciones que aparecen en el menú lateral.
// Cada objeto contiene un identificador, un nombre visible y la clase del ícono.
const SECCIONES = [
  { id: "resumen", nombre: "Resumen", icono: "bi-grid" },
  { id: "publicaciones", nombre: "Mis publicaciones", icono: "bi-chat-square-text" },
  { id: "guardado", nombre: "Contenido guardado", icono: "bi-heart" },
  { id: "datos", nombre: "Datos personales", icono: "bi-person-gear" },
];

// ICONOS: carga automáticamente las imágenes PNG que se encuentran
// dentro de la carpeta src/assets/iconos.
// import.meta.glob permite localizar archivos según el patrón indicado.
// eager hace que se carguen inmediatamente e import: "default" obtiene sus URLs.
const ICONOS = Object.fromEntries(
  Object.entries(
    import.meta.glob("../assets/iconos/*.png", { eager: true, import: "default" })
  ).map(([ruta, url]) => [ruta.split("/").pop(), url])
);

// DECORACIÓN: relaciona el nombre de cada imagen con la clase CSS
// que determina su posición y apariencia en el fondo.
const DECORACION = [
  ["grass_block.png", "perfil-deco--1"],
  ["dirt.png", "perfil-deco--2"],
  ["diamond.png", "perfil-deco--3"],
  ["sunflower.png", "perfil-deco--4"],
  ["pink_petals.png", "perfil-deco--5"],
  ["wildflowers.png", "perfil-deco--6"],
];

// 3. FUNCIONES 

// INICIALES: obtiene las primeras letras de un nombre para utilizarlas como avatar.
// Si no se proporciona un nombre, utiliza "Jugador" como valor predeterminado.
const iniciales = (nombre = "Jugador") =>
  nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();

// FECHA LEGIBLE: convierte una fecha en un formato más fácil de leer.
// Firestore puede almacenar fechas como Timestamp, que dispone del método toDate().
function fechaLegible(valor) {

  // Si no se recibe una fecha, devuelve un mensaje predeterminado.
  if (!valor) return "Todavía no disponible";

  // Si el valor tiene el método toDate(), lo utiliza para convertirlo en Date.
  // De lo contrario, intenta construir una fecha directamente con el valor recibido.
  const fecha = valor?.toDate ? valor.toDate() : new Date(valor);

  // Comprueba si la fecha obtenida es válida.
  if (Number.isNaN(fecha.getTime())) return "Todavía no disponible";

  // Convierte la fecha a un formato en español de Argentina.
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

// DECORACIÓN: muestra los bloques y las flores que aparecen detrás de la tarjeta.
// Se separa del componente principal para mantener el código organizado.
function Decoracion() {
  return (
    <div className="perfil-decoracion" aria-hidden="true">

      {/* Recorre el arreglo DECORACION y genera un elemento por cada imagen. */}
      {DECORACION.map(([archivo, clase]) =>

        // Comprueba si la imagen existe dentro del objeto ICONOS.
        // Si existe, muestra el elemento; si no, devuelve null.
        ICONOS[archivo] ? (
          <img
            key={archivo}
            src={ICONOS[archivo]}
            className={`perfil-deco ${clase}`}
            alt=""
            draggable="false"
          />
        ) : null
      )}
    </div>
  );
}

// AVATAR: muestra la fotografía del usuario o sus iniciales como alternativa.
function Avatar({ foto, nombre, className = "" }) {

  // FALLO: indica si ocurrió un problema al cargar la imagen.
  const [fallo, setFallo] = useState(false);

  // Cada vez que cambia la dirección de la fotografía, reinicia el estado de error.
  // Esto permite intentar cargar nuevamente la imagen.
  useEffect(() => {
    setFallo(false);
  }, [foto]);

  return (
    <div className={`perfil-avatar ${className}`}>

      {/* Si existe una fotografía y no ocurrió un error, muestra la imagen. */}
      {foto && !fallo ? (
        <img
          src={foto}
          alt={`Foto de ${nombre}`}

          // onError se ejecuta cuando el navegador no consigue cargar la fotografía.
          // En ese caso, actualiza el estado para mostrar las iniciales.
          onError={() => setFallo(true)}
        />
      ) : (

        // Si no hay fotografía o su carga falla, muestra las iniciales del usuario.
        <span>{iniciales(nombre)}</span>
      )}
    </div>
  );
}

// 4. COMPONENTE PRINCIPAL Y ESTADOS

// PERFIL: contiene el menú de navegación, los datos personales,
// las publicaciones y el contenido guardado del usuario.
export default function Perfil() {

  // Obtiene los datos del contexto de autenticación.
  // usuario contiene la información de Firebase Authentication.
  // perfil contiene los datos adicionales almacenados en Firestore.
  // cargando indica si todavía se están obteniendo los datos.
  // esAdmin indica si el usuario tiene permisos de administrador.
  const { usuario, perfil, cargando, esAdmin } = useAuth();

  // SECCIÓN: indica qué apartado del perfil se encuentra seleccionado.
  const [seccion, setSeccion] = useState("resumen");

  // EDITANDO: determina si el formulario de datos personales está abierto.
  const [editando, setEditando] = useState(false);

  // GUARDANDO: indica si se están enviando modificaciones a Firestore.
  const [guardando, setGuardando] = useState(false);

  // MENSAJE: almacena los mensajes de confirmación que se muestran en pantalla.
  const [mensaje, setMensaje] = useState("");

  // ERROR: almacena los mensajes relacionados con problemas de validación o guardado.
  const [error, setError] = useState("");

  // PUBLICACIONES: almacena las publicaciones realizadas por el usuario.
  const [publicaciones, setPublicaciones] = useState([]);

  // FORMULARIO: contiene los valores de los campos de datos personales.
  // Se inicializa con cadenas vacías para evitar campos sin controlar.
  const [formulario, setFormulario] = useState({
    nombreUsuario: "",
    nombre: "",
    apellido: "",
    biografia: "",
    ubicacion: "",
    sitioWeb: "",
    fechaNacimiento: "",
    fotoPerfil: "",
  });

    // 5. EFECTOS DE REACT
  
    // ACTUALIZAR FORMULARIO: copia los datos del perfil de Firestore
    // dentro del estado formulario cada vez que cambia la información del perfil.
    useEffect(() => {
  
      // Si todavía no existe información del perfil, no realiza ninguna operación.
      if (!perfil) return;
  
      // Actualiza los campos utilizando los datos disponibles.
      // El operador || "" establece una cadena vacía cuando un dato no existe.
      setFormulario({
        nombreUsuario: perfil.nombreUsuario || "",
        nombre: perfil.nombre || "",
        apellido: perfil.apellido || "",
        biografia: perfil.biografia || "",
        ubicacion: perfil.ubicacion || "",
        sitioWeb: perfil.sitioWeb || "",
        fechaNacimiento: perfil.fechaNacimiento || "",
        fotoPerfil: perfil.fotoPerfil || "",
      });
    }, [perfil]);
  // ESCUCHAR PUBLICACIONES: obtiene las publicaciones del usuario
    // y mantiene la lista actualizada mediante un listener de Firestore.
    useEffect(() => {
  
      // Comprueba que exista un usuario autenticado y que tenga un UID.
      // Si no existe, no inicia la consulta.
      if (!usuario?.uid) return undefined;
  
      // escucharPorCampo consulta una colección y escucha los documentos
      // que coincidan con el campo y el valor indicados.
      return escucharPorCampo(
        COLECCIONES.publicaciones,
  
        // Campo que identifica al autor de cada publicación.
        "autorId",
  
        // UID del usuario actual: permite obtener solamente sus publicaciones.
        usuario.uid,
  
        // Función que recibe los documentos encontrados.
        (items) =>
  
          // Actualiza el estado publicaciones con una copia de los resultados.
          // sort ordena los elementos desde el más reciente hasta el más antiguo.
          setPublicaciones(
            [...items].sort(
              (a, b) =>
                (b.fechaCreacion?.toMillis?.() || 0) -
                (a.fechaCreacion?.toMillis?.() || 0)
            )
          ),
  
        // Si ocurre un error durante la consulta, lo muestra en la consola.
        (err) => console.error("No se pudieron cargar las publicaciones:", err)
      );
  
      // El efecto vuelve a ejecutarse cuando cambia el UID del usuario.
      // La función devuelta por escucharPorCampo permite detener la escucha anterior.
    }, [usuario?.uid]);

    // FAVORITOS: agrupa las listas de canciones, publicaciones y productos guardados.
      // useMemo evita volver a crear este objeto mientras perfil no cambie.
      const favoritos = useMemo(
        () => ({
          canciones: perfil?.cancionesFavoritas || [],
          publicaciones: perfil?.publicacionesGuardadas || [],
          productos: perfil?.productosFavoritos || [],
        }),
        [perfil]
      );
// ESTADO DE CARGA: mientras se obtienen los datos o todavía no existe el perfil,
  // muestra un indicador de espera en lugar de presentar información incompleta.
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
  // 6. DATOS CALCULADOS DEL PERFIL

  // NOMBRE A MOSTRAR: utiliza el nombre de usuario, el nombre de Firebase
  // o la parte anterior a la arroba del correo, siguiendo ese orden de prioridad.
  const nombreMostrar =
    perfil.nombreUsuario || usuario?.displayName || usuario?.email?.split("@")[0] || "Jugador";

  // NOMBRE COMPLETO: combina el nombre y el apellido.
  // filter(Boolean) elimina los valores vacíos antes de unirlos.
  const nombreCompleto = [perfil.nombre, perfil.apellido].filter(Boolean).join(" ");

  // FOTO: utiliza primero la fotografía guardada en Firestore.
  // Si no existe, intenta utilizar la fotografía del perfil de Firebase.
  const foto = perfil.fotoPerfil || usuario?.photoURL || "";

  // TOTAL GUARDADO: suma la cantidad de canciones, publicaciones y productos favoritos.
  const totalGuardado =
    favoritos.canciones.length + favoritos.publicaciones.length + favoritos.productos.length;

  // SECCIÓN ACTUAL: busca en el arreglo SECCIONES el apartado seleccionado.
  // Se utiliza para mostrar el título correspondiente en el panel derecho.
  const seccionActual = SECCIONES.find((s) => s.id === seccion);

  // 7. FUNCIONES DE ACCIÓN

  // CAMBIAR SECCIÓN: modifica el apartado que se muestra
  // y permite abrir directamente el formulario de edición.
  function irA(id, abrirEdicion = false) {

    // Actualiza la sección seleccionada.
    setSeccion(id);

    // Determina si debe mostrarse el formulario de edición.
    setEditando(abrirEdicion);

    // Limpia los mensajes anteriores al cambiar de apartado.
    setMensaje("");
    setError("");
  }

  // CAMBIAR CAMPO: actualiza el valor de un campo del formulario cuando el usuario escribe.
  function cambiarCampo(evento) {

    // Conserva los demás campos utilizando el estado anterior.
    // evento.target.name identifica el campo que cambió.
    // evento.target.value contiene el nuevo valor ingresado.
    setFormulario((actual) => ({ ...actual, [evento.target.name]: evento.target.value }));
  }

  // GUARDAR CAMBIOS: valida los datos personales y actualiza el documento del usuario.
  async function guardarCambios(evento) {

    // Evita que el formulario se envíe de forma tradicional y recargue la página.
    evento.preventDefault();

    // Limpia los mensajes anteriores.
    setError("");
    setMensaje("");

    // Obtiene el enlace de la fotografía y elimina los espacios sobrantes.
    const fotoUrl = formulario.fotoPerfil.trim();

    // Comprueba que el enlace comience con http:// o https://.
    // Si no cumple esta condición, muestra un error y detiene el guardado.
    if (fotoUrl && !/^https?:\/\//i.test(fotoUrl)) {
      setError("El enlace de la foto tiene que empezar con http:// o https://");
      return;
    }

    // Activa el indicador de carga mientras se guardan los cambios.
    setGuardando(true);

    try {
      // Actualiza el documento del usuario dentro de la colección de usuarios.
      // Solo se envían los datos personales del formulario.
      // El rol y el estado de la cuenta no se modifican.
      await actualizarDocumento(COLECCIONES.usuarios, usuario.uid, {
        nombreUsuario: formulario.nombreUsuario.trim(),
        nombre: formulario.nombre.trim(),
        apellido: formulario.apellido.trim(),
        biografia: formulario.biografia.trim(),
        ubicacion: formulario.ubicacion.trim(),
        sitioWeb: formulario.sitioWeb.trim(),
        fechaNacimiento: formulario.fechaNacimiento,
        fotoPerfil: fotoUrl,
      });

      // Cierra el modo de edición cuando la actualización termina correctamente.
      setEditando(false);

      // Muestra un mensaje de confirmación.
      setMensaje("Guardamos los cambios de tu perfil.");

    } catch (err) {

      // Muestra el error técnico en la consola para facilitar su diagnóstico.
      console.error(err);

      // Informa al usuario que no se pudieron guardar los cambios.
      setError("No pudimos guardar los cambios. Revisá tu conexión e intentá de nuevo.");

    } finally {

      // Desactiva el estado de carga tanto si la operación fue exitosa como si falló.
      setGuardando(false);
    }
  }
  // 8. ESTRUCTURA VISUAL GENERAL

  // 8. ESTRUCTURA VISUAL GENERAL

  return (
    <>
      {/* HEADER: muestra el encabezado general del sitio. */}
      <Header />

      {/* CONTENEDOR PRINCIPAL: agrupa todo el contenido de la página de perfil. */}
      <main className="perfil-page">

        {/* Muestra los elementos decorativos del fondo. */}
        <Decoracion />

        <div className="perfil-contenedor">

          {/* TARJETA PRINCIPAL: divide el perfil en dos paneles. */}
          <div className="perfil-card">

            {/* 9. PANEL IZQUIERDO: avatar, nombre, rol y navegación. */}
            <aside className="perfil-panel-izq">

              {/* AVATAR: muestra la fotografía o las iniciales del usuario. */}
              <Avatar foto={foto} nombre={nombreMostrar} className="perfil-avatar--grande" />

              {/* Nombre que aparece en la parte superior del panel. */}
              <h1 className="perfil-nombre">{nombreMostrar}</h1>

              {/* ROL: muestra una etiqueta según los permisos del usuario. */}
              <span className={`perfil-rol ${esAdmin ? "perfil-rol--admin" : ""}`}>
                <i className={`bi ${esAdmin ? "bi-shield-check" : "bi-compass"}`} />
                {esAdmin ? "Administrador" : "Explorador"}
              </span>

              {/* MENÚ: genera los botones de navegación a partir del arreglo SECCIONES. */}
              <nav className="perfil-nav" aria-label="Secciones del perfil">
                {SECCIONES.map((item) => (
                  <button
                    key={item.id}
                    type="button"

                    // Aplica la clase activo únicamente a la sección seleccionada.
                    className={seccion === item.id ? "activo" : ""}

                    // Indica mediante un atributo accesible cuál es la sección actual.
                    aria-current={seccion === item.id ? "page" : undefined}

                    // Ejecuta irA() cuando el usuario selecciona una sección.
                    onClick={() => irA(item.id)}
                  >
                    {/* Ícono correspondiente a la sección. */}
                    <i className={`bi ${item.icono}`} aria-hidden="true" />

                    {/* Nombre visible de la sección. */}
                    {item.nombre}
                  </button>
                ))}
              </nav>

              {/* ESTADO DE CUENTA: indica visualmente que la cuenta está activa. */}
              <p className="perfil-estado">
                <span className="perfil-punto" /> Cuenta activa
              </p>
            </aside>

            {/* 10. PANEL DERECHO: contiene el encabezado y las secciones del perfil. */}
            <section className="perfil-panel-der">

              {/* CABECERA: identifica el sitio y muestra un mensaje complementario. */}
              <div className="perfil-cabecera">
                <span className="perfil-etiqueta">
                  <i className="bi bi-flower2" /> Wiki-Craft
                </span>

                <span className="perfil-nota">
                  <i className="bi bi-sun" /> Tu espacio personal
                </span>
              </div>

              {/* TÍTULO: muestra el nombre del apartado seleccionado. */}
              <div className="perfil-titulo-fila">
                <h2 className="perfil-titulo">{seccionActual.nombre}</h2>

                {/* El botón de edición aparece solamente en Datos personales
                    y cuando el formulario todavía está cerrado. */}
                {seccion === "datos" && !editando && (
                  <button
                    type="button"
                    className="perfil-btn"
                    onClick={() => setEditando(true)}
                  >
                    <i className="bi bi-pencil-fill" /> Editar datos
                  </button>
                )}
              </div>

              {/* MENSAJE DE ÉXITO: aparece cuando se guardan correctamente los cambios. */}
              {mensaje && (
                <div className="perfil-alerta perfil-alerta--exito" role="status">
                  {mensaje}
                </div>
              )}

              {/* MENSAJE DE ERROR: aparece cuando ocurre un problema. */}
              {error && (
                <div className="perfil-alerta perfil-alerta--error" role="alert">
                  {error}
                </div>
              )}

              {/* CONTENIDO: muestra el apartado seleccionado.
                  key={seccion} hace que React vuelva a montar este contenedor
                  al cambiar de sección y reinicie su animación de entrada. */}
              <div className="perfil-contenido" key={seccion}>

                {/* 11. SECCIÓN RESUMEN */}

                {/* Se muestra únicamente cuando la sección seleccionada es "resumen". */}
                {seccion === "resumen" && (
                  <>
                    {/* ESTADÍSTICAS: muestra publicaciones, elementos guardados y fecha de registro. */}
                    <div className="perfil-stats">

                      {/* Cantidad de publicaciones realizadas por el usuario. */}
                      <article>
                        <i className="bi bi-chat-square-text" />
                        <div>
                          <strong>{publicaciones.length}</strong>
                          <small>Publicaciones</small>
                        </div>
                      </article>

                      {/* Cantidad total de elementos guardados. */}
                      <article>
                        <i className="bi bi-heart" />
                        <div>
                          <strong>{totalGuardado}</strong>
                          <small>Elementos guardados</small>
                        </div>
                      </article>

                      {/* Fecha en la que se registró el usuario. */}
                      <article>
                        <i className="bi bi-calendar-heart" />
                        <div>
                          <strong>{fechaLegible(perfil.fechaRegistro)}</strong>
                          <small>Te uniste</small>
                        </div>
                      </article>
                    </div>

                    {/* TARJETAS INFORMATIVAS: organiza la información en dos columnas. */}
                    <div className="perfil-grid">

                      {/* ACERCA DE MÍ: muestra los datos personales del usuario. */}
                      <article className="perfil-bloque">
                        <div className="perfil-bloque-cab">
                          <h3>Acerca de mí</h3>

                          {/* Abre la sección de datos personales directamente en modo edición. */}
                          <button type="button" className="perfil-link" onClick={() => irA("datos", true)}>
                            Editar
                          </button>
                        </div>

                        {/* Muestra la biografía o un mensaje alternativo si está vacía. */}
                        <p className="perfil-texto">
                          {perfil.biografia ||
                            "Todavía no escribiste tu biografía. Contale a la comunidad qué te gusta de Minecraft."}
                        </p>

                        {/* Muestra el nombre completo solamente si hay algún dato disponible. */}
                        {nombreCompleto && <p className="perfil-dato"><i className="bi bi-person" /> {nombreCompleto}</p>}

                        {/* Correo electrónico obtenido de Firebase Authentication. */}
                        <p className="perfil-dato"><i className="bi bi-envelope" /> {usuario.email}</p>

                        {/* Muestra la ubicación o un texto alternativo. */}
                        <p className="perfil-dato">
                          <i className="bi bi-geo-alt" /> {perfil.ubicacion || "Ubicación sin especificar"}
                        </p>

                        {/* El sitio web aparece solamente cuando el usuario guardó una dirección. */}
                        {perfil.sitioWeb && (
                          <p className="perfil-dato">
                            <i className="bi bi-link-45deg" />

                            {/* Abre el sitio externo en una nueva pestaña. */}
                            <a href={perfil.sitioWeb} target="_blank" rel="noreferrer">{perfil.sitioWeb}</a>
                          </p>
                        )}
                      </article>

                      {/* ÚLTIMAS PUBLICACIONES: muestra hasta tres publicaciones recientes. */}
                      <article className="perfil-bloque">
                        <div className="perfil-bloque-cab">
                          <h3>Últimas publicaciones</h3>

                          {/* Cambia a la sección donde aparecen todas las publicaciones. */}
                          <button type="button" className="perfil-link" onClick={() => irA("publicaciones")}>
                            Ver todas
                          </button>
                        </div>

                        {/* Comprueba si el usuario tiene publicaciones. */}
                        {publicaciones.length ? (

                          // slice(0, 3) limita la lista a las tres primeras publicaciones.
                          publicaciones.slice(0, 3).map((pub) => (
                            <Link to={`/publicacion/${pub.id}`} className="perfil-mini" key={pub.id}>
                              <strong>{pub.categoria || "Publicación"}</strong>
                              <span>{pub.contenido || "Sin texto"}</span>
                            </Link>
                          ))
                        ) : (

                          // Mensaje que aparece cuando todavía no hay publicaciones.
                          <p className="perfil-vacio-chico">Todavía no publicaste nada en la comunidad.</p>
                        )}
                      </article>
                    </div>

                    {/* HERRAMIENTAS DE ADMINISTRADOR:
                        esta tarjeta solamente aparece si el usuario tiene permisos de administrador. */}
                    {esAdmin && (
                      <article className="perfil-bloque perfil-bloque--admin">
                        <div className="perfil-bloque-cab">
                          <h3><i className="bi bi-shield-check" /> Herramientas de administrador</h3>
                        </div>

                        <p className="perfil-texto">
                          En cada página tenés un botón «Modo administrador» (abajo a la derecha) para
                          agregar, editar o eliminar contenido.
                        </p>

                        {/* Accesos directos a distintas páginas del sitio. */}
                        <div className="perfil-accesos">
                          <Link to="/">Inicio</Link>
                          <Link to="/historia">Historia</Link>
                          <Link to="/versiones">Versiones</Link>
                          <Link to="/comunidad">Comunidad</Link>
                          <Link to="/musica/maestro">Maestro de melodías</Link>
                        </div>
                      </article>
                    )}
                  </>
                )}

                {/* 12. SECCIÓN PUBLICACIONES */}

                {/* Muestra las publicaciones realizadas por el usuario. */}
                {seccion === "publicaciones" && (
                  publicaciones.length ? (
                    <div className="perfil-lista">

                      {/* Recorre todas las publicaciones y genera una tarjeta para cada una. */}
                      {publicaciones.map((pub) => (
                        <article className="perfil-bloque perfil-post" key={pub.id}>

                          {/* PARTE SUPERIOR: muestra la categoría y la fecha de creación. */}
                          <div className="perfil-post-top">
                            <span className="perfil-chip">{pub.categoria || "General"}</span>
                            <small>{fechaLegible(pub.fechaCreacion)}</small>
                          </div>

                          {/* Muestra el texto de la publicación o un mensaje alternativo. */}
                          <p className="perfil-texto">{pub.contenido || "Publicación sin texto."}</p>

                          {/* Muestra la imagen únicamente si la publicación contiene una. */}
                          {pub.imagen && (
                            <img className="perfil-post-imagen" src={pub.imagen} alt="Imagen de la publicación" />
                          )}

                          {/* PARTE INFERIOR: muestra las interacciones y el acceso al detalle. */}
                          <div className="perfil-post-pie">
                            <span>
                              <i className="bi bi-heart" /> {pub.likes || 0} · <i className="bi bi-chat" />{" "}
                              {pub.comentarios?.length || 0}
                            </span>

                            {/* Abre la página individual de la publicación. */}
                            <Link to={`/publicacion/${pub.id}`} className="perfil-link">Abrir publicación</Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (

                    // ESTADO VACÍO: aparece cuando el usuario todavía no publicó contenido.
                    <div className="perfil-vacio">
                      <i className="bi bi-chat-square-text" />
                      <h3>Tu aventura empieza acá</h3>
                      <p>Cuando publiques algo en la comunidad, lo vas a ver en esta sección.</p>

                      {/* Permite ir directamente a la página de comunidad. */}
                      <Link to="/comunidad" className="perfil-btn">Ir a la comunidad</Link>
                    </div>
                  )
                )}

                {/* 13. SECCIÓN CONTENIDO GUARDADO */}

                {/* Muestra las cantidades de canciones, publicaciones y productos favoritos. */}
                {seccion === "guardado" && (
                  <div className="perfil-favoritos">

                    {/* CANCIONES: muestra la cantidad de canciones guardadas. */}
                    <article className="perfil-bloque">
                      <i className="bi bi-music-note-beamed" />
                      <strong>{favoritos.canciones.length}</strong>
                      <h3>Canciones favoritas</h3>
                      <p>Temas que guardaste para volver a escuchar.</p>
                      <Link to="/musica" className="perfil-link">Ir a música</Link>
                    </article>

                    {/* PUBLICACIONES: muestra los aportes de la comunidad guardados. */}
                    <article className="perfil-bloque">
                      <i className="bi bi-bookmark-heart" />
                      <strong>{favoritos.publicaciones.length}</strong>
                      <h3>Publicaciones guardadas</h3>
                      <p>Ideas y aportes de la comunidad.</p>
                      <Link to="/comunidad" className="perfil-link">Ir a la comunidad</Link>
                    </article>

                    {/* PRODUCTOS: muestra los artículos favoritos de la tienda. */}
                    <article className="perfil-bloque">
                      <i className="bi bi-bag-heart" />
                      <strong>{favoritos.productos.length}</strong>
                      <h3>Productos favoritos</h3>
                      <p>Artículos de la tienda que te interesan.</p>
                      <Link to="/tienda" className="perfil-link">Ir a la tienda</Link>
                    </article>
                  </div>
                )}

                {/* 14. SECCIÓN DATOS PERSONALES */}

                {/* Muestra el formulario de edición o los datos actuales,
                    dependiendo del valor del estado editando. */}
                {seccion === "datos" && (
                  editando ? (

                    // FORMULARIO: permite modificar los datos personales guardados en Firestore.
                    <form className="perfil-form" onSubmit={guardarCambios}>

                      {/* FOTO DE PERFIL: muestra una vista previa y permite ingresar su enlace. */}
                      <div className="perfil-form-foto">
                        <Avatar foto={formulario.fotoPerfil.trim()} nombre={nombreMostrar} />

                        <label>
                          Foto de perfil (enlace)
                          <input
                            name="fotoPerfil"
                            value={formulario.fotoPerfil}
                            onChange={cambiarCampo}
                            placeholder="https://..."
                          />
                          <small>Pegá el enlace de una imagen. Si lo dejás vacío se muestran tus iniciales.</small>
                        </label>
                      </div>

                      {/* NOMBRE DE USUARIO: campo obligatorio con una longitud limitada. */}
                      <label>
                        Nombre de usuario *
                        <input
                          name="nombreUsuario"
                          value={formulario.nombreUsuario}
                          onChange={cambiarCampo}
                          required
                          minLength={3}
                          maxLength={24}
                        />
                      </label>

                      {/* NOMBRE Y APELLIDO: organiza los dos campos en una misma fila. */}
                      <div className="perfil-form-fila">
                        <label>
                          Nombre
                          <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} maxLength={50} />
                        </label>
                        <label>
                          Apellido
                          <input name="apellido" value={formulario.apellido} onChange={cambiarCampo} maxLength={50} />
                        </label>
                      </div>

                      {/* BIOGRAFÍA: permite escribir una descripción personal de hasta 300 caracteres. */}
                      <label>
                        Biografía
                        <textarea
                          name="biografia"
                          value={formulario.biografia}
                          onChange={cambiarCampo}
                          rows={4}
                          maxLength={300}
                          placeholder="Contá algo sobre vos..."
                        />

                        {/* Muestra la cantidad de caracteres utilizados. */}
                        <small>{formulario.biografia.length}/300</small>
                      </label>

                      {/* UBICACIÓN Y FECHA DE NACIMIENTO: agrupa dos datos personales. */}
                      <div className="perfil-form-fila">
                        <label>
                          Ubicación
                          <input
                            name="ubicacion"
                            value={formulario.ubicacion}
                            onChange={cambiarCampo}
                            maxLength={80}
                            placeholder="Ciudad, país"
                          />
                        </label>
                        <label>
                          Fecha de nacimiento
                          <input
                            type="date"
                            name="fechaNacimiento"
                            value={formulario.fechaNacimiento}
                            onChange={cambiarCampo}
                          />
                        </label>
                      </div>

                      {/* SITIO WEB: permite guardar una dirección web personal. */}
                      <label>
                        Sitio web
                        <input
                          type="url"
                          name="sitioWeb"
                          value={formulario.sitioWeb}
                          onChange={cambiarCampo}
                          placeholder="https://..."
                        />
                      </label>

                      {/* CORREO ELECTRÓNICO: muestra el correo de la cuenta sin permitir modificarlo. */}
                      <label>
                        Correo electrónico
                        <input value={usuario.email || ""} disabled />
                        <small>El correo no se puede cambiar desde acá.</small>
                      </label>

                      {/* ACCIONES: contiene los botones para cancelar o guardar los cambios. */}
                      <div className="perfil-acciones">

                        {/* CANCELAR: cierra la edición y vuelve a mostrar los datos personales. */}
                        <button
                          type="button"
                          className="perfil-btn perfil-btn--suave"
                          onClick={() => irA("datos")}
                        >
                          Cancelar
                        </button>

                        {/* GUARDAR: envía los datos y se deshabilita mientras se procesan. */}
                        <button type="submit" className="perfil-btn" disabled={guardando}>
                          {guardando ? "Guardando..." : "Guardar cambios"}
                        </button>
                      </div>
                    </form>
                  ) : (

                    // VISTA DE DATOS: muestra la información guardada cuando no está abierto el formulario.
                    <div className="perfil-datos">

                      {/* Recorre los datos del usuario y crea una fila por cada campo. */}
                      {[
                        ["Nombre de usuario", perfil.nombreUsuario],
                        ["Nombre", perfil.nombre],
                        ["Apellido", perfil.apellido],
                        ["Correo electrónico", usuario.email],
                        ["Ubicación", perfil.ubicacion],
                        ["Fecha de nacimiento", perfil.fechaNacimiento],
                        ["Sitio web", perfil.sitioWeb],
                        ["Biografía", perfil.biografia],
                      ].map(([etiqueta, valor]) => (
                        <div key={etiqueta}>
                          <small>{etiqueta}</small>
                          <strong>{valor || "Sin especificar"}</strong>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER: muestra el pie de página compartido del sitio. */}
      <Footer />
    </>
  );
}