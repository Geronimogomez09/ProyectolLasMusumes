// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. CONFIGURACIÓN: CATEGORÍAS GLOBALES
// 3. FUNCIÓN AUXILIAR: RESOLUCIÓN DE NOMBRE DE USUARIO
// 4. COMPONENTE PRINCIPAL: COMUNIDAD
// 5. SESIÓN, PERMISOS Y ESTADO DE GUARDADOS
// 6. VARIABLES DE ESTADO LOCAL (USESTATE)
// 7. EFECTOS SECUNDARIOS: PERMISOS Y LIMPIEZA
// 8. ESCUCHA DE DATOS EN TIEMPO REAL (FIREBASE)
// 9. PROCESAMIENTO: FILTRADO MEMORIZADO
// 10. FUNCIONES DE INTERACCIÓN: PUBLICAR Y DENUNCIAR
// 11. FUNCIONES DE INTERACCIÓN: GESTIÓN DE PUBLICACIONES (EDITAR/ELIMINAR)
// 12. FUNCIONES DE INTERACCIÓN: GESTIÓN DE COMENTARIOS
// 13. FUNCIÓN AUXILIAR: ALTERNAR MODO ADMINISTRADOR
// 14. INTERFAZ VISUAL (JSX): ENCABEZADOS Y MODO ADMIN
// 15. INTERFAZ VISUAL: BARRA DE FILTROS Y FORMULARIO
// 16. INTERFAZ VISUAL: LISTA DE PUBLICACIONES (TARJETAS)
// 17. INTERFAZ VISUAL: ACCIONES DE TARJETA Y COMENTARIOS INLINE
// 18. INTERFAZ VISUAL: MODALES Y BOTÓN FLOTANTE

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos hooks fundamentales de React para manejar el estado y el ciclo de vida.
import { useEffect, useMemo, useState } from "react";

// Importamos Link para la navegación sin recargar la página.
import { Link } from "react-router-dom";

// Importamos componentes visuales estructurales y modulares del muro.
import Header from "../components/header";
import Footer from "../components/Footer";
import NuevoPost from "../components/comunidadComponentes/nuevo-post";
import ListaComentarios from "../components/comunidadComponentes/lista-comentarios";
import DenunciaModal from "../components/comunidadComponentes/denuncia-modal";
import AdminComunidad from "../components/comunidadComponentes/admin-comunidad";
import BotonAdmin from "../components/botonAdmin";
import BotonGuardar from "../components/guardadosComponentes/BotonGuardar";

// Importamos el contexto de autenticación y herramientas de permisos.
import { useAuth } from "../context/AuthContext";
import useGuardados from "../hooks/useGuardados";
import { tienePermiso } from "../utils/permisos";

// Importamos todos los servicios de conexión a la base de datos Firestore.
import {
  escucharPublicaciones,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  crearDenuncia,
  crearComentario,
  actualizarComentario,
  eliminarComentario
} from "../services/firestore";

// Importamos los estilos específicos para esta pantalla.
import "../styles/Comunidad.css";

// 2. CONFIGURACIÓN: CATEGORÍAS GLOBALES

// Definimos un array constante con las categorías oficiales del muro.
// Esto permite que los botones de filtro y el menú desplegable del formulario 
// se generen automáticamente desde una única fuente de verdad.
// Nota: La opción "Todas" no está aquí porque es exclusiva del filtro visual, 
// no es una categoría que se guarde en la base de datos.
const CATEGORIAS = [
  "construcciones",
  "Mods",
  "Anuncios",
  "pvps",
  "consultas",
  "eventos",
  "skins",
  "texturas",
  "redstone",
  "otros"
];

// 3. FUNCIÓN AUXILIAR: RESOLUCIÓN DE NOMBRE DE USUARIO

// Propósito: Determinar el mejor nombre para mostrar en pantalla basándose en los datos disponibles.
// Proceso (Cascada de prioridades):
// 1. Busca el "nombreUsuario" configurado en el perfil interno de la aplicación.
// 2. Si no existe, busca el "displayName" genérico que provee Firebase Auth.
// 3. Si tampoco existe, toma el correo electrónico y lo corta en la arroba (@) para usar la primera mitad.
// 4. Si el usuario es anónimo o todo falla, devuelve "Usuario".
const nombreUsuario = (usuario, perfil) =>
  perfil?.nombreUsuario ||
  usuario?.displayName ||
  usuario?.email?.split("@")[0] ||
  "Usuario";

// 4. COMPONENTE PRINCIPAL: COMUNIDAD

// Exporta la función principal que construye toda la página de la comunidad.
export default function Comunidad() {
  
  // 5. SESIÓN, PERMISOS Y ESTADO DE GUARDADOS
  
  // Obtenemos los datos del usuario logueado y su perfil desde el contexto.
  const { usuario, perfil } = useAuth();
  
  // Evaluamos si este usuario tiene permisos específicos de "comunidad" (moderador/admin).
  // Si devuelve true, se habilitarán botones para borrar cualquier post y ver el panel oculto.
  const puedeAdministrar = tienePermiso(perfil, "comunidad");

  // Invocamos el hook personalizado "useGuardados" pasándole la categoría "publicacion".
  // Esto nos devuelve un objeto con la lista de posts guardados y las funciones para agregar o quitar.
  const guardadas = useGuardados("publicacion");

  // 6. VARIABLES DE ESTADO LOCAL (USESTATE)
  
  // "posts": Almacena el array completo de publicaciones descargado de Firestore.
  const [posts, setPosts] = useState([]);

  // "filtro": Guarda qué categoría está seleccionada para ver (por defecto muestra "Todas").
  const [filtro, setFiltro] = useState("Todas");
  
  // "modal": Si contiene información de un post o comentario, el modal de denuncia aparece. Si es null, se oculta.
  const [modal, setModal] = useState(null);
  
  // "comentariosAbiertos": Objeto diccionario que registra qué publicaciones tienen sus comentarios desplegados.
  // Ejemplo interno: { "id-post-1": true, "id-post-2": false }.
  const [comentariosAbiertos, setComentariosAbiertos] = useState({});

  // "admin": Booleano que indica si el moderador hizo clic para abrir la vista del panel administrativo.
  const [admin, setAdmin] = useState(false);

  // "cargando": Booleano visual que muestra el texto "Cargando..." mientras esperamos a internet.
  const [cargando, setCargando] = useState(true);
  
  // "error": Texto para mostrar avisos al usuario en caso de fallos de red.
  const [error, setError] = useState("");

  // 7. EFECTOS SECUNDARIOS: PERMISOS Y LIMPIEZA

  // Efecto de seguridad: Si la cuenta pierde los permisos de administrador mientras está en la página,
  // este efecto lo detecta y apaga la variable "admin" forzando la salida del panel.
  useEffect(() => {
    if (!puedeAdministrar) setAdmin(false);
  }, [puedeAdministrar]);

  // "modoAdmin": Combina la intención de abrir el panel (admin) con la verificación real de que tenga permiso.
  const modoAdmin = admin && puedeAdministrar;

  // Efecto de limpieza heredada: Se ejecuta una única vez al montar la página.
  // Borra archivos residuales en el navegador de versiones muy antiguas del sistema.
  useEffect(() => {
    localStorage.removeItem("wikicraft_comunidad_posts_v1");
    localStorage.removeItem("wikicraft_comunidad_denuncias_v1");
  }, []);

  // 8. ESCUCHA DE DATOS EN TIEMPO REAL (FIREBASE)

  // Efecto principal de conexión a la base de datos.
  useEffect(() => {
    // Inicia la suscripción a Firestore que actualiza la variable "posts" cada vez que alguien publica algo.
    const offPosts = escucharPublicaciones(
      (items) => {
        setPosts(items);
        setCargando(false);
      },
      (e) => {
        console.error(e);
        setError("No se pudieron cargar las publicaciones.");
        setCargando(false);
      }
    );

    // Función de limpieza: Cuando el usuario cambia a otra página (ej: Tienda),
    // React ejecuta esto para desconectar el micrófono de Firestore y no gastar datos.
    return () => offPosts?.();
  }, []);

  // 9. PROCESAMIENTO: FILTRADO MEMORIZADO

  // useMemo "recuerda" la lista de publicaciones para no tener que recalcularla
  // en cada renderizado (lo cual volvería lenta la página).
  // Solo vuelve a filtrar si la lista original "posts" cambia, o si el usuario toca otro botón de "filtro".
  const filtrados = useMemo(
    () =>
      posts.filter(
        (p) => filtro === "Todas" || p.categoria === filtro
      ),
    [posts, filtro]
  );

  // 10. FUNCIONES DE INTERACCIÓN: PUBLICAR Y DENUNCIAR

  // Propósito: Toma los datos escritos en el componente "NuevoPost" y los envía al servidor.
  async function publicar(datos) {
    try {
      // Pasa los datos del formulario, y la identidad segura proveniente del contexto (usuario/perfil).
      await crearPublicacion(datos, usuario, perfil);
    } catch (e) {
      console.error(e);
      setError("No se pudo publicar. Revisá tu conexión e intentá nuevamente.");
    }
  }

  // Propósito: Construye un objeto complejo para reportar mal comportamiento.
  // El modal puede denunciar tanto Publicaciones enteras como Comentarios individuales.
  async function denunciar(datos) {
    if (!modal) return;

    // Detecta internamente a qué tipo de elemento le estamos apuntando.
    const esComentario = modal.tipo === "comentario";

    try {
      await crearDenuncia(
        {
          // Si es comentario, hereda el ID de la publicación madre desde modal.publicacionId.
          publicacionId: String(modal.publicacionId || modal.id),
          
          // Extrae el ID y Nombre del autor del elemento infractor.
          autorId: esComentario ? modal.comentario?.autorId : modal.autorId,
          autorNombre: esComentario
            ? (modal.comentario?.autorNombre || modal.comentario?.usuario || "Usuario")
            : modal.autorNombre,
            
          // Copia el texto exacto que fue denunciado para que el admin tenga pruebas.
          contenido: esComentario
            ? (modal.comentario?.texto || modal.comentario?.contenido || "")
            : modal.contenido,
            
          comentarioId: esComentario ? modal.comentario?.id : null,
          motivo: datos.motivo,
          detalle: datos.detalle,
          tipoContenido: esComentario ? "comentario" : "publicacion"
        },
        usuario,
        perfil
      );

      // Cierra el cuadro de diálogo de la denuncia.
      setModal(null);
    } catch (e) {
      console.error(e);
      setError("No se pudo enviar la denuncia.");
    }
  }

  // 11. FUNCIONES DE INTERACCIÓN: GESTIÓN DE PUBLICACIONES (EDITAR/ELIMINAR)

  // Propósito: Borrar una publicación entera de la base de datos.
  async function borrar(post) {
    // Bloqueo de seguridad frontal: Si NO tenés permisos de admin, 
    // y además el autor del post NO coincide con tu propio ID, aborta el proceso.
    if (
      !puedeAdministrar &&
      post.autorId !== usuario?.uid
    ) {
      return;
    }

    // Pide una confirmación nativa del navegador para evitar borrados accidentales.
    if (!window.confirm("¿Eliminar esta publicación?")) return;

    try {
      await eliminarPublicacion(post.id);
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar la publicación.");
    }
  }

  // Propósito: Modificar el texto de un post ya creado.
  async function editar(post) {
    // Los administradores moderan borrando, no editando las palabras de otros,
    // por eso se bloquea si sos admin o si no sos el autor real.
    if (puedeAdministrar || post.autorId !== usuario?.uid) return;

    // Utiliza el prompt nativo para pedir el nuevo texto (ideal para cambios rápidos).
    const contenido = window.prompt(
      "Editar publicación:",
      post.contenido
    );

    // Valida que el texto no esté vacío ni se haya apretado cancelar.
    if (contenido === null || !contenido.trim()) return;

    try {
      await actualizarPublicacion(post.id, {
        contenido: contenido.trim()
      });
    } catch (e) {
      console.error(e);
      setError("No se pudo editar la publicación.");
    }
  }

  // 12. FUNCIONES DE INTERACCIÓN: GESTIÓN DE COMENTARIOS

  // Envoltorios de funciones (wrappers) que conectan el componente visual de comentarios
  // con los servicios puros de Firestore que importamos arriba.
  async function agregarComentario(postId, datos) {
    try {
      await crearComentario(postId, datos, usuario, perfil);
    } catch (e) {
      console.error(e);
      setError(e.message || "No se pudo publicar el comentario.");
    }
  }

  async function editarComentario(postId, comentarioId, texto) {
    try {
      await actualizarComentario(postId, comentarioId, texto);
    } catch (e) {
      console.error(e);
      setError("No se pudo editar el comentario.");
    }
  }

  async function borrarComentario(postId, comentarioId) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await eliminarComentario(postId, comentarioId);
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar el comentario.");
    }
  }

  // 13. FUNCIÓN AUXILIAR: ALTERNAR MODO ADMINISTRADOR

  // Cambia el estado que define si vemos el muro o el panel secreto de moderación.
  function alternarAdmin() {
    // Validación extra: no permite cambiar el estado si no hay permisos.
    if (!puedeAdministrar) return;
    setAdmin((prev) => !prev);
  }

  // 14. INTERFAZ VISUAL (JSX): ENCABEZADOS Y MODO ADMIN

  return (
    <>
      {/* Si NO estamos en modo administrador, muestra la barra superior de navegación. */}
      {!modoAdmin && <Header />}

      {/* El div principal pierde su clase limitadora si estamos en modo admin,
          para que la tabla de moderación pueda ocupar el 100% del ancho. */}
      <div className={modoAdmin ? "" : "comunidad-page"}>

        {/* Portada gigante o Banner del muro (oculto en modo admin). */}
        {!modoAdmin && (
          <header className="comunidad-hero">
            <div className="comunidad-hero__overlay" />

            <div className="comunidad-hero__contenido">
              <h1>Comunidad</h1>
              <p>
                Compartí experiencias, construcciones y novedades
                con otros jugadores.
              </p>
            </div>
          </header>
        )}

        <main className={modoAdmin ? "" : "comunidad-main"}>

          {/* Bloque visual de alertas de error de conexión. */}
          {error && (
            <p role="alert">{error}</p>
          )}

          {/* Operador ternario principal de la aplicación.
              Si modoAdmin es verdad, dibuja el componente de administración.
              Si es falso, dibuja todo el bloque del muro público. */}
          {modoAdmin ? (

            /* PANEL ADMINISTRATIVO */
            <AdminComunidad
              posts={posts}
              onSalir={() => setAdmin(false)}
            />

          ) : (

            /* MURO PÚBLICO */
            <>
              {/* 15. INTERFAZ VISUAL: BARRA DE FILTROS Y FORMULARIO */}
              <nav className="comunidad-filtros">
                {/* Une la palabra "Todas" con el resto de las categorías y las dibuja como botones. */}
                {["Todas", ...CATEGORIAS].map((c) => (
                  <button
                    key={c}
                    className={`filtro-pill ${
                      filtro === c ? "filtro-pill--activo" : ""
                    }`}
                    // Cambia la variable de estado "filtro", lo que dispara la recarga del useMemo.
                    onClick={() => setFiltro(c)}
                  >
                    {c}
                  </button>
                ))}
              </nav>

              {/* Componente del formulario para escribir nuevas publicaciones. */}
              <NuevoPost
                usuario={{
                  // Le mandamos la inicial del usuario calculada previamente.
                  inicial: nombreUsuario(usuario, perfil)
                    .slice(0, 1)
                    .toUpperCase()
                }}
                categorias={CATEGORIAS}
                onPublicar={publicar}
              />

              {/* 16. INTERFAZ VISUAL: LISTA DE PUBLICACIONES (TARJETAS) */}
              {/* Condiciones encadenadas: 
                  ¿Cargando? Muestra texto.
                  Si no, ¿Lista vacía? Muestra texto de vacío.
                  Si no, recorre la lista dibujando las tarjetas. */}
              {cargando ? (
                <p>Cargando publicaciones...</p>
              ) : filtrados.length === 0 ? (
                <p className="lista-posts__vacio">
                  Todavía no hay publicaciones.
                </p>
              ) : (
                <section className="lista-posts">

                  {/* Iteración de cada post filtrado para crear su estructura HTML. */}
                  {filtrados.map((p) => (
                    <article
                      className="post-card"
                      key={p.id}
                    >
                      {/* Encabezado del Post (Avatar, Nombre, Fecha, Categoría y Denuncia). */}
                      <div className="post-card__encabezado">

                        <div className="avatar">
                          {(p.autorNombre || "U")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>

                        <div className="post-card__meta">
                          <span className="post-card__usuario">
                            {p.autorNombre}
                          </span>

                          <span className="post-card__submeta">
                            {/* Transforma la fecha compleja de Firebase a formato local legible. */}
                            {p.fechaCreacion?.toDate?.()
                              .toLocaleString("es-AR") || "Reciente"}
                          </span>
                        </div>

                        <span className="post-card__categoria-badge">
                          {p.categoria}
                        </span>

                        <button
                          className="btn-warning"
                          // Abre el modal pasándole los datos específicos de esta publicación.
                          onClick={() => setModal({ ...p, id: p.id, tipo: "publicacion" })}
                          aria-label="Denunciar publicación"
                        >
                          ⚠
                        </button>

                      </div>

                      <p className="post-card__contenido">
                        {p.contenido}
                      </p>

                      {/* Solo dibuja la imagen si el post tiene un enlace válido en su base de datos. */}
                      {p.imagen && (
                        <img
                          className="post-card__imagen"
                          src={p.imagen}
                          alt="Imagen de la publicación"
                        />
                      )}

                      {/* 17. INTERFAZ VISUAL: ACCIONES DE TARJETA Y COMENTARIOS INLINE */}
                      <div className="post-usuario-acciones post-usuario-acciones--mejoradas">

                        {/* Botón de favoritos personalizado integrado a nuestro hook useGuardados. */}
                        <BotonGuardar
                          guardado={guardadas.estaGuardado(p.id)}
                          alAlternar={() => guardadas.alternar(p.id)}
                          icono="marcador"
                          conTexto
                          nombre="publicación"
                        />

                        {/* Botón de Editar: Visible solo para el autor (y bloqueado para admins). */}
                        {!puedeAdministrar && p.autorId === usuario?.uid && (
                          <button type="button" onClick={() => editar(p)}>✎ Editar</button>
                        )}
                        
                        {/* Botón de Eliminar: Visible si sos autor O si sos admin. */}
                        {(p.autorId === usuario?.uid || puedeAdministrar) && (
                          <button type="button" onClick={() => borrar(p)}>⌫ Eliminar</button>
                        )}
                        
                        <button
                          type="button"
                          className="post-comentarios-toggle"
                          // Informa al lector de pantalla si los comentarios están abiertos.
                          aria-expanded={Boolean(comentariosAbiertos[p.id])}
                          // Alterna el estado verdadero/falso específicamente para la ID de este post 
                          // en nuestro diccionario de "comentariosAbiertos".
                          onClick={() => setComentariosAbiertos((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                        >
                          💬 {Array.isArray(p.comentarios) ? p.comentarios.length : 0} comentarios
                          <span>{comentariosAbiertos[p.id] ? "Cerrar" : "Ver / comentar"}</span>
                        </button>
                        
                        <Link className="post-ver-detalle" to={`/publicacion/${p.id}`}>
                          Ver publicación completa →
                        </Link>
                      </div>

                      {/* Componente de lista de comentarios: Solo se dibuja si el ID del post actual 
                          está marcado como 'true' en el diccionario "comentariosAbiertos". */}
                      {comentariosAbiertos[p.id] && (
                        <section className="post-comentarios-inline" aria-label={`Comentarios de ${p.autorNombre || "la publicación"}`}>
                          <div className="post-comentarios-inline__titulo">
                            <div><span>CONVERSACIÓN</span><h3>Comentarios</h3></div>
                            <b>{Array.isArray(p.comentarios) ? p.comentarios.length : 0}</b>
                          </div>
                          
                          {/* Inyección de la lista y envío de callbacks envolventes. */}
                          <ListaComentarios
                            comentarios={Array.isArray(p.comentarios) ? p.comentarios : []}
                            onAgregarComentario={(datos) => agregarComentario(p.id, datos)}
                            modoAdministrador={Boolean(puedeAdministrar)}
                            modoUsuario={!puedeAdministrar}
                            usuarioActualId={usuario?.uid}
                            onEditarComentario={(comentarioId, texto) => editarComentario(p.id, comentarioId, texto)}
                            onEliminarComentario={(comentarioId) => borrarComentario(p.id, comentarioId)}
                            onDenunciarComentario={(comentario) =>
                              setModal({ tipo: "comentario", publicacionId: p.id, comentario })
                            }
                          />
                        </section>
                      )}

                    </article>
                  ))}

                </section>
              )}
            </>
          )}

        </main>
      </div>

      {/* 18. INTERFAZ VISUAL: MODALES Y BOTÓN FLOTANTE */}

      {/* Si el usuario tiene permisos, se dibuja este botón flotante en la esquina. */}
      {puedeAdministrar && (
        <BotonAdmin
          permiso="comunidad"
          activo={admin}
          alAlternar={alternarAdmin}
          aviso="Estás en el panel de administración de Comunidad."
        />
      )}

      {/* Si la variable "modal" contiene algo, se superpone el componente del cuadro de denuncia. */}
      {modal && (
        <DenunciaModal
          tipoContenido={modal.tipo || "publicacion"}
          onConfirmar={denunciar}
          onCancelar={() => setModal(null)}
        />
      )}

      {/* El Footer desaparece si estamos en el panel de administración. */}
      {!modoAdmin && <Footer />}

    </>
  );
}