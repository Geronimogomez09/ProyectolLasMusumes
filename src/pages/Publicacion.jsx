import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import ListaComentarios from "../components/comunidadComponentes/lista-comentarios";
import DenunciaModal from "../components/comunidadComponentes/denuncia-modal";
import BotonGuardar from "../components/guardadosComponentes/BotonGuardar";
import AvatarComunidad from "../components/comunidadComponentes/avatar-comunidad";
import { useAuth } from "../context/AuthContext";
import useGuardados from "../hooks/useGuardados";
import { tienePermiso } from "../utils/permisos";
import {
  escucharDocumento,
  actualizarPublicacion,
  eliminarPublicacion,
  crearComentario,
  actualizarComentario,
  eliminarComentario,
  crearDenuncia,
} from "../services/firestore";
import "../styles/Publicacion.css";

// ÍNDICE GENERAL
// 1. Dependencias de la pantalla de detalle
// 2. Datos de navegación, sesión y permisos
// 3. Estados locales de carga, edición y modal
// 4. Suscripción en tiempo real a la publicación solicitada
// 5. Datos derivados: comentarios y propiedad de la publicación
// 6. Guardado, eliminación y moderación de contenido
// 7. Estados visuales: carga, ausencia de documento y detalle
// 8. Lista de comentarios y formulario de denuncia

// 1. PÁGINA DE DETALLE DE UNA PUBLICACIÓN
// Esta pantalla representa una sola publicación de la Comunidad. No recibe el
// contenido como propiedad: obtiene el identificador desde la URL, por ejemplo
// /publicacion/abc123, y usa ese id para escuchar el documento correspondiente.
// Mientras el usuario permanece aquí, cualquier cambio hecho en Firestore se refleja
// automáticamente gracias a escucharDocumento(). El resto de acciones delega las
// escrituras en services/firestore.js, de forma que esta página se ocupa de la
// interacción y el servicio de la comunicación con la base de datos.
export default function Publicacion() {
  // 2. DATOS DE NAVEGACIÓN, SESIÓN Y PERMISOS
  // useParams() lee las partes variables declaradas por la ruta. En este caso id no
  // es inventado por la página: es el identificador que React Router extrajo del enlace.
  // useNavigate() entrega una función para cambiar de pantalla después de eliminar.
  // useAuth() aporta tanto la cuenta autenticada (usuario) como el perfil propio de
  // Wiki-Craft (perfil). Se mantienen separados porque Firebase Auth y Firestore
  // guardan responsabilidades distintas.
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, perfil } = useAuth();

  // tienePermiso() centraliza la decisión sobre el acceso administrativo. Si devuelve
  // true, puedeModerar habilita controles de moderación; si devuelve false, la página
  // solamente permite al autor editar su propio contenido. La interfaz no reemplaza
  // las reglas de Firestore: estas validaciones mejoran la experiencia, pero el servidor
  // sigue siendo quien autoriza definitivamente una operación.
  const puedeModerar = tienePermiso(perfil, "comunidad");

  // PUBLICACIONES GUARDADAS: ids que el usuario guardó. Se usa en el botón "Guardar".
  const guardadas = useGuardados("publicacion");

  // 3. ESTADOS LOCALES
  // post empieza en null porque el documento llega de forma asíncrona. cargando evita
  // confundir ese instante inicial con una publicación inexistente. error guarda un
  // texto presentable para la persona usuaria, mientras que el error técnico completo
  // queda en la consola. modal conserva qué clase de contenido se está denunciando;
  // editando y textoEditado controlan el pequeño formulario de edición.
  const [post, setPost] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");

  // 4. ESCUCHA EN TIEMPO REAL DEL DOCUMENTO
  // El efecto se ejecuta al montar la página y cada vez que cambia id. Primero marca
  // la vista como cargando y después inicia una suscripción. El callback exitoso puede
  // recibir un documento o null si fue borrado; ambos casos finalizan la carga. El
  // return es esencial: React ejecuta cancelar al salir de la página o al abrir otro
  // id, evitando que una suscripción anterior actualice una pantalla que ya cambió.
  useEffect(() => {
    setCargando(true);
    const cancelar = escucharDocumento(
      "publicaciones", id,
      (documento) => { setPost(documento); setCargando(false); },
      (e) => { console.error(e); setError("No se pudo cargar la publicación."); setCargando(false); }
    );
    return () => cancelar?.();
  }, [id]);

  // 5. DATOS DERIVADOS
  // comentarios siempre debe ser un array porque ListaComentarios lo recorre. La
  // comprobación Array.isArray cubre publicaciones antiguas, incompletas o que aún no
  // tengan comentarios. esAutor solo es true cuando existen uid y publicación y ambos
  // identificadores coinciden; Boolean convierte el resultado en true o false explícito.
  const comentarios = Array.isArray(post?.comentarios) ? post.comentarios : [];
  const esAutor = Boolean(usuario?.uid && post?.autorId === usuario.uid);

  // 6. ACCIONES SOBRE EL CONTENIDO
  // Todas estas funciones son async porque las escrituras hacia Firestore tardan un
  // tiempo indeterminado. await espera el resultado antes de cerrar un modo o navegar.
  // Ante un rechazo, catch conserva la pantalla actual y muestra una explicación. Las
  // suscripciones activas actualizarán post/comentarios cuando Firestore confirme el
  // cambio, por eso ninguna función modifica manualmente la copia local.

  // GUARDAR PUBLICACIÓN: descarta solo espacios vacíos. trim() crea una versión sin
  // espacios iniciales/finales; si queda vacía no se envía nada. La marca editado sirve
  // para que el renderizado informe que el texto visible no es el original.
  async function guardarPublicacion() {
    if (!textoEditado.trim()) return;
    try { await actualizarPublicacion(id, { contenido: textoEditado.trim(), editado: true }); setEditando(false); }
    catch (e) { console.error(e); setError("No se pudo actualizar la publicación."); }
  }

  // BORRAR PUBLICACIÓN: window.confirm requiere una decisión explícita. Si se cancela,
  // return detiene la función sin hacer ninguna escritura. Si Firestore la elimina,
  // navigate devuelve al muro, donde ya no debería aparecer este documento.
  async function borrarPublicacion() {
    if (!window.confirm("¿Seguro que querés eliminar esta publicación?")) return;
    try { await eliminarPublicacion(id); navigate("/comunidad"); }
    catch (e) { console.error(e); setError("No se pudo eliminar la publicación."); }
  }

  // COMENTARIOS: datos llega desde ListaComentarios. El servicio incorpora al comentario
  // la información de autor tomada de usuario/perfil; por eso la página no construye ni
  // confía en esos campos provenientes del formulario.
  async function agregarComentario(datos) {
    try { await crearComentario(id, datos, usuario, perfil); }
    catch (e) { console.error(e); setError(e.message || "No se pudo agregar el comentario."); }
  }

  // editarComentario identifica dos niveles: id identifica la publicación y comentarioId
  // el elemento concreto dentro de su array de comentarios.
  async function editarComentario(comentarioId, texto) {
    try { await actualizarComentario(id, comentarioId, texto); }
    catch (e) { console.error(e); setError("No se pudo editar el comentario."); }
  }

  // borrarComentario usa la misma confirmación preventiva que el borrado de la publicación.
  async function borrarComentario(comentarioId) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try { await eliminarComentario(id, comentarioId); }
    catch (e) { console.error(e); setError("No se pudo eliminar el comentario."); }
  }

  // DENUNCIAR: modal determina si el objetivo es la publicación completa o un comentario.
  // A partir de esa elección se copian los datos relevantes a un único objeto de denuncia.
  // comentarioId queda en null para publicaciones, lo que permite distinguir ambos casos
  // más tarde en el panel administrativo. El modal solo se cierra después de guardar con
  // éxito; si falla, queda disponible y se muestra el mensaje de error.
  async function denunciar(datos) {
    if (!modal || !post) return;
    const esComentario = modal.tipo === "comentario";
    try {
      await crearDenuncia({
        publicacionId: id,
        autorId: esComentario ? modal.comentario.autorId : post.autorId,
        autorNombre: esComentario ? modal.comentario.usuario : post.autorNombre,
        contenido: esComentario ? modal.comentario.texto : post.contenido,
        comentarioId: esComentario ? modal.comentario.id : null,
        motivo: datos.motivo, detalle: datos.detalle,
        tipoContenido: esComentario ? "comentario" : "publicacion",
      }, usuario, perfil);
      setModal(null);
    } catch (e) { console.error(e); setError("No se pudo enviar la denuncia."); }
  }

  // 7. RENDERIZADO CON ESTADOS EXCLUYENTES
  // Después de mostrar un posible error, el ternario decide entre tres situaciones:
  // 1. cargando: la consulta todavía no respondió;
  // 2. !post: terminó la consulta pero el documento no existe;
  // 3. detalle: hay un documento y se habilitan sus datos e interacciones.
  // Solo una de ellas se inserta en el DOM a la vez. Los componentes Header y Footer
  // permanecen fuera de la condición para conservar el marco de navegación.
  return (
    <>
      <Header />
      <main className="publicacion-main">
        <div className="publicacion-page-header">
          <nav className="publicacion-breadcrumb"><Link to="/comunidad">Comunidad</Link><span>/</span><span>Publicación</span></nav>
          <p className="publicacion-eyebrow">WIKI-CRAFT · ESPACIO DE LA COMUNIDAD</p>
          <h1>Explorá la conversación</h1>
          <p className="publicacion-page-subtitulo">Compartí ideas, descubrí opiniones y seguí construyendo junto a otros jugadores.</p>
          <Link to="/comunidad" className="publicacion-volver publicacion-volver--arriba">← Volver a Comunidad</Link>
        </div>

        {error && <p className="publicacion-error" role="alert">{error}</p>}
        {cargando ? (
          <section className="publicacion-no-encontrada"><p>Cargando publicación...</p></section>
        ) : !post ? (
          <section className="publicacion-no-encontrada">
            <span className="publicacion-no-encontrada__icono">⛏</span>
            <p className="publicacion-eyebrow">WIKI-CRAFT / COMUNIDAD</p>
            <h1>Publicación no encontrada</h1>
            <p>Puede que se haya eliminado o que el enlace ya no sea válido.</p>
            <Link to="/comunidad" className="publicacion-volver">← Volver a Comunidad</Link>
          </section>
        ) : (
          <article className="publicacion-detalle">
            <div className="publicacion-autor">
              <AvatarComunidad
                className="publicacion-avatar"
                style={{ backgroundColor: post.colorAvatar || "#278b45" }}
                foto={
                  post.autorId === usuario?.uid
                    ? perfil?.fotoPerfil || usuario?.photoURL || post.autorFoto
                    : post.autorFoto
                }
                nombre={post.autorNombre}
              />
              <div className="publicacion-autor__datos"><strong>{post.autorNombre || "Usuario"}</strong><span>{post.fechaCreacion?.toDate?.().toLocaleString("es-AR") || "Publicación de la comunidad"}</span></div>
              <span className="publicacion-categoria">{post.categoria || "Comunidad"}</span>

              {/* BOTÓN GUARDAR PUBLICACIÓN: guarda o quita esta publicación de
                  "Contenido guardado" del perfil. Lo ve cualquier usuario. */}
              <BotonGuardar
                guardado={guardadas.estaGuardado(post.id)}
                alAlternar={() => guardadas.alternar(post.id)}
                icono="marcador"
                nombre="publicación"
              />

              <button className="publicacion-icon-action publicacion-denunciar" type="button" onClick={() => setModal({ tipo: "publicacion" })} title="Denunciar publicación" aria-label="Denunciar publicación">⚑</button>
            </div>

            {editando ? (
              <div className="publicacion-edicion"><textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} rows={5} aria-label="Editar publicación"/><div><button type="button" onClick={guardarPublicacion}>Guardar cambios</button><button type="button" className="secundario" onClick={() => setEditando(false)}>Cancelar</button></div></div>
            ) : (
              <div className="publicacion-contenido">{post.contenido}{post.editado && <small> · editado</small>}</div>
            )}
            {post.imagen && <img className="publicacion-imagen" src={post.imagen} alt="Imagen adjunta a la publicación" />}

            {(esAutor || puedeModerar) && !editando && <div className="publicacion-acciones-propias"><span>{esAutor ? "Esta publicación es tuya" : "Herramientas de administración"}</span>{esAutor && <button type="button" onClick={() => { setTextoEditado(post.contenido || ""); setEditando(true); }}>✎ Editar</button>}<button type="button" className="peligro" onClick={borrarPublicacion}>⌫ Eliminar</button></div>}

            {/* 8. CONVERSACIÓN: ListaComentarios recibe los callbacks, no accede a
                Firestore directamente. Así el componente reutilizable solo reúne la
                interacción visual y esta página mantiene el contexto de la publicación. */}
            <section className="publicacion-comentarios">
              <div className="publicacion-comentarios__titulo"><div><span>CONVERSACIÓN DE LA COMUNIDAD</span><h2>Comentarios</h2><p>Sumate a la charla y compartí tu opinión.</p></div><b>{comentarios.length}</b></div>
              <ListaComentarios
                comentarios={comentarios}
                onAgregarComentario={agregarComentario}
                modoAdministrador={puedeModerar}
                modoUsuario={!puedeModerar}
                usuarioActualId={usuario?.uid}
                onEditarComentario={editarComentario}
                onEliminarComentario={borrarComentario}
                onDenunciarComentario={(comentario) => setModal({ tipo: "comentario", comentario })}
              />
            </section>
            <div className="publicacion-pie"><Link to="/comunidad" className="publicacion-volver">← Volver al muro de Comunidad</Link><span>WIKI-CRAFT · JUGAMOS Y CONSTRUIMOS JUNTOS</span></div>
          </article>
        )}
      </main>
      {modal && <DenunciaModal tipoContenido={modal.tipo} onConfirmar={denunciar} onCancelar={() => setModal(null)} />}
      <Footer />
    </>
  );
}
