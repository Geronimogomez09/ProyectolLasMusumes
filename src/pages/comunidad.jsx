import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/Footer";
import NuevoPost from "../components/comunidadComponentes/nuevo-post";
import ListaComentarios from "../components/comunidadComponentes/lista-comentarios";
import DenunciaModal from "../components/comunidadComponentes/denuncia-modal";
import AdminComunidad from "../components/comunidadComponentes/admin-comunidad";
import BotonAdmin from "../components/botonAdmin";

import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";

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

import "../styles/Comunidad.css";

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

const nombreUsuario = (usuario, perfil) =>
  perfil?.nombreUsuario ||
  usuario?.displayName ||
  usuario?.email?.split("@")[0] ||
  "Usuario";

export default function Comunidad() {
  const { usuario, perfil } = useAuth();
  const puedeAdministrar = tienePermiso(perfil, "comunidad");

  const [posts, setPosts] = useState([]);

  const [filtro, setFiltro] = useState("Todas");
  const [modal, setModal] = useState(null);
  const [comentariosAbiertos, setComentariosAbiertos] = useState({});

  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!puedeAdministrar) setAdmin(false);
  }, [puedeAdministrar]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // El panel solo se muestra si el usuario es administrador.
  const modoAdmin = admin && puedeAdministrar;

  // Limpiar publicaciones y denuncias ficticias antiguas.
  useEffect(() => {
    localStorage.removeItem("wikicraft_comunidad_posts_v1");
    localStorage.removeItem("wikicraft_comunidad_denuncias_v1");
  }, []);

  // Escuchar publicaciones reales de Firestore.
  useEffect(() => {
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

    return () => offPosts?.();
  }, []);

  const filtrados = useMemo(
    () =>
      posts.filter(
        (p) => filtro === "Todas" || p.categoria === filtro
      ),
    [posts, filtro]
  );

  // Crear publicación.
  async function publicar(datos) {
    try {
      await crearPublicacion(datos, usuario, perfil);
    } catch (e) {
      console.error(e);
      setError("No se pudo publicar. Revisá tu conexión e intentá nuevamente.");
    }
  }

  // Crear denuncia de publicación o comentario.
  async function denunciar(datos) {
    if (!modal) return;

    const esComentario = modal.tipo === "comentario";

    try {
      await crearDenuncia(
        {
          publicacionId: String(modal.publicacionId || modal.id),
          autorId: esComentario ? modal.comentario?.autorId : modal.autorId,
          autorNombre: esComentario
            ? (modal.comentario?.autorNombre || modal.comentario?.usuario || "Usuario")
            : modal.autorNombre,
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

      setModal(null);
    } catch (e) {
      console.error(e);
      setError("No se pudo enviar la denuncia.");
    }
  }

  // Eliminar publicación (propietario o administrador).
  async function borrar(post) {
    if (
      !puedeAdministrar &&
      post.autorId !== usuario?.uid
    ) {
      return;
    }

    if (!window.confirm("¿Eliminar esta publicación?")) return;

    try {
      await eliminarPublicacion(post.id);
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar la publicación.");
    }
  }

  // Editar publicación: solamente su propietario si no es administrador.
  async function editar(post) {
    if (puedeAdministrar || post.autorId !== usuario?.uid) return;

    const contenido = window.prompt(
      "Editar publicación:",
      post.contenido
    );

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

  // Comentarios integrados en cada publicación del muro.
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

  // Cambiar entre Comunidad y administración.
  function alternarAdmin() {
    if (!puedeAdministrar) return;
    setAdmin((prev) => !prev);
  }

  return (
    <>
      {!modoAdmin && <Header />}

      <div className={modoAdmin ? "" : "comunidad-page"}>

        {!modoAdmin && (
          <header className="comunidad-hero">
            <div className="comunidad-hero__overlay" />

            <div className="comunidad-hero__contenido">
              <h1>Comunidad</h1>
              <p>
                Comparti experiencias, construcciones y novedades
                con otros jugadores.
              </p>
            </div>
          </header>
        )}

        <main className={modoAdmin ? "" : "comunidad-main"}>

          {error && (
            <p role="alert">{error}</p>
          )}

          {modoAdmin ? (

            /* ================= PANEL ADMINISTRATIVO ================= */

            <AdminComunidad
              posts={posts}
              onSalir={() => setAdmin(false)}
            />

          ) : (

            /* ================= COMUNIDAD ================= */

            <>
              <nav className="comunidad-filtros">

                {["Todas", ...CATEGORIAS].map((c) => (
                  <button
                    key={c}
                    className={`filtro-pill ${
                      filtro === c ? "filtro-pill--activo" : ""
                    }`}
                    onClick={() => setFiltro(c)}
                  >
                    {c}
                  </button>
                ))}

              </nav>

              <NuevoPost
                usuario={{
                  inicial: nombreUsuario(usuario, perfil)
                    .slice(0, 1)
                    .toUpperCase()
                }}
                categorias={CATEGORIAS}
                onPublicar={publicar}
              />

              {cargando ? (
                <p>Cargando publicaciones...</p>
              ) : filtrados.length === 0 ? (
                <p className="lista-posts__vacio">
                  Todavía no hay publicaciones.
                </p>
              ) : (
                <section className="lista-posts">

                  {filtrados.map((p) => (
                    <article
                      className="post-card"
                      key={p.id}
                    >

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
                            {p.fechaCreacion?.toDate?.()
                              .toLocaleString("es-AR") || "Reciente"}
                          </span>
                        </div>

                        <span className="post-card__categoria-badge">
                          {p.categoria}
                        </span>

                        <button
                          className="btn-warning"
                          onClick={() => setModal({ ...p, id: p.id, tipo: "publicacion" })}
                          aria-label="Denunciar publicación"
                        >
                          ⚠
                        </button>

                      </div>

                      <p className="post-card__contenido">
                        {p.contenido}
                      </p>

                      {p.imagen && (
                        <img
                          className="post-card__imagen"
                          src={p.imagen}
                          alt="Imagen de la publicación"
                        />
                      )}

                      <div className="post-usuario-acciones post-usuario-acciones--mejoradas">
                        {!puedeAdministrar && p.autorId === usuario?.uid && (
                          <button type="button" onClick={() => editar(p)}>✎ Editar</button>
                        )}
                        {(p.autorId === usuario?.uid || puedeAdministrar) && (
                          <button type="button" onClick={() => borrar(p)}>⌫ Eliminar</button>
                        )}
                        <button
                          type="button"
                          className="post-comentarios-toggle"
                          aria-expanded={Boolean(comentariosAbiertos[p.id])}
                          onClick={() => setComentariosAbiertos((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                        >
                          💬 {Array.isArray(p.comentarios) ? p.comentarios.length : 0} comentarios
                          <span>{comentariosAbiertos[p.id] ? "Cerrar" : "Ver / comentar"}</span>
                        </button>
                        <Link className="post-ver-detalle" to={`/publicacion/${p.id}`}>Ver publicación completa →</Link>
                      </div>

                      {comentariosAbiertos[p.id] && (
                        <section className="post-comentarios-inline" aria-label={`Comentarios de ${p.autorNombre || "la publicación"}`}>
                          <div className="post-comentarios-inline__titulo">
                            <div><span>CONVERSACIÓN</span><h3>Comentarios</h3></div>
                            <b>{Array.isArray(p.comentarios) ? p.comentarios.length : 0}</b>
                          </div>
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

      {/* BOTÓN ADMIN ORIGINAL: SE CONSERVA SU COMPONENTE Y UBICACIÓN */}

      {puedeAdministrar && (
        <BotonAdmin
          permiso="comunidad"
          activo={admin}
          alAlternar={alternarAdmin}
          aviso="Estás en el panel de administración de Comunidad."
        />
      )}

      {modal && (
        <DenunciaModal
          tipoContenido={modal.tipo || "publicacion"}
          onConfirmar={denunciar}
          onCancelar={() => setModal(null)}
        />
      )}

      {!modoAdmin && <Footer />}

    </>
  );
}
