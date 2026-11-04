import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import ListaComentarios from "../components/comunidadComponentes/lista-comentarios";
import DenunciaModal from "../components/comunidadComponentes/denuncia-modal";
import { useAuth } from "../context/AuthContext";
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

export default function Publicacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, perfil, esAdmin } = useAuth();
  const [post, setPost] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState("");

  useEffect(() => {
    setCargando(true);
    const cancelar = escucharDocumento(
      "publicaciones", id,
      (documento) => { setPost(documento); setCargando(false); },
      (e) => { console.error(e); setError("No se pudo cargar la publicación."); setCargando(false); }
    );
    return () => cancelar?.();
  }, [id]);

  const comentarios = Array.isArray(post?.comentarios) ? post.comentarios : [];
  const esAutor = Boolean(usuario?.uid && post?.autorId === usuario.uid);

  async function guardarPublicacion() {
    if (!textoEditado.trim()) return;
    try { await actualizarPublicacion(id, { contenido: textoEditado.trim(), editado: true }); setEditando(false); }
    catch (e) { console.error(e); setError("No se pudo actualizar la publicación."); }
  }

  async function borrarPublicacion() {
    if (!window.confirm("¿Seguro que querés eliminar esta publicación?")) return;
    try { await eliminarPublicacion(id); navigate("/comunidad"); }
    catch (e) { console.error(e); setError("No se pudo eliminar la publicación."); }
  }

  async function agregarComentario(datos) {
    try { await crearComentario(id, datos, usuario, perfil); }
    catch (e) { console.error(e); setError(e.message || "No se pudo agregar el comentario."); }
  }

  async function editarComentario(comentarioId, texto) {
    try { await actualizarComentario(id, comentarioId, texto); }
    catch (e) { console.error(e); setError("No se pudo editar el comentario."); }
  }

  async function borrarComentario(comentarioId) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try { await eliminarComentario(id, comentarioId); }
    catch (e) { console.error(e); setError("No se pudo eliminar el comentario."); }
  }

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
              <div className="publicacion-avatar" style={{ backgroundColor: post.colorAvatar || "#278b45" }}>{(post.autorNombre || "U").slice(0, 1).toUpperCase()}</div>
              <div className="publicacion-autor__datos"><strong>{post.autorNombre || "Usuario"}</strong><span>{post.fechaCreacion?.toDate?.().toLocaleString("es-AR") || "Publicación de la comunidad"}</span></div>
              <span className="publicacion-categoria">{post.categoria || "Comunidad"}</span>
              <button className="publicacion-icon-action publicacion-denunciar" type="button" onClick={() => setModal({ tipo: "publicacion" })} title="Denunciar publicación" aria-label="Denunciar publicación">⚑</button>
            </div>

            {editando ? (
              <div className="publicacion-edicion"><textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} rows={5} aria-label="Editar publicación"/><div><button type="button" onClick={guardarPublicacion}>Guardar cambios</button><button type="button" className="secundario" onClick={() => setEditando(false)}>Cancelar</button></div></div>
            ) : (
              <div className="publicacion-contenido">{post.contenido}{post.editado && <small> · editado</small>}</div>
            )}
            {post.imagen && <img className="publicacion-imagen" src={post.imagen} alt="Imagen adjunta a la publicación" />}

            {(esAutor || esAdmin) && !editando && <div className="publicacion-acciones-propias"><span>{esAutor ? "Esta publicación es tuya" : "Herramientas de administración"}</span>{esAutor && <button type="button" onClick={() => { setTextoEditado(post.contenido || ""); setEditando(true); }}>✎ Editar</button>}<button type="button" className="peligro" onClick={borrarPublicacion}>⌫ Eliminar</button></div>}

            <section className="publicacion-comentarios">
              <div className="publicacion-comentarios__titulo"><div><span>CONVERSACIÓN DE LA COMUNIDAD</span><h2>Comentarios</h2><p>Sumate a la charla y compartí tu opinión.</p></div><b>{comentarios.length}</b></div>
              <ListaComentarios
                comentarios={comentarios}
                onAgregarComentario={agregarComentario}
                modoAdministrador={Boolean(esAdmin)}
                modoUsuario={!esAdmin}
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
