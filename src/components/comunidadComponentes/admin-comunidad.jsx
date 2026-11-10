import { useEffect, useState } from "react";

import { tienePermiso } from "../../utils/permisos";
import { useAuth } from "../../context/AuthContext";

import {
  eliminarPublicacion,
  eliminarComentario,
  escucharDenuncias,
  actualizarEstadoDenuncia,
  escucharDocumentos,
  suspenderCuenta
} from "../../services/firestore";

import "../../styles/AdminComunidad.css";

// Índice: Moderación de publicaciones y denuncias.
// ----------------- Moderación de publicaciones y denuncias -----------------
// Recibe publicaciones y la acción para volver a Comunidad. Si el perfil tiene permiso, escucha denuncias y cuentas, y permite moderar contenido o suspender cuentas; al desmontarse, retira las escuchas.

/**
 * Panel de moderación de Comunidad.
 *
 * Props:
 *  - posts:   publicaciones ya escuchadas por la página (evita un segundo listener).
 *  - onSalir: callback para volver a la vista de Comunidad.
 *
 * Autenticación: el componente revisa `esAdmin` por su cuenta. Si el usuario
 * no es administrador no renderiza nada ni abre ningún listener de Firestore,
 * y cada acción destructiva vuelve a verificar el permiso antes de ejecutarse.
 */
export default function AdminComunidad({ posts = [], onSalir }) {
 const { perfil } = useAuth();
const esAdmin = tienePermiso(perfil, "comunidad");
  const [denuncias, setDenuncias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [adminSeccion, setAdminSeccion] = useState("denuncias");
  const [error, setError] = useState("");

  // Escuchar denuncias y usuarios solo mientras el panel está montado.
  useEffect(() => {
    if (!esAdmin) return;

    const offReports = escucharDenuncias(setDenuncias);
    const offUsers = escucharDocumentos("usuarios", setUsuarios);

    return () => {
      offReports?.();
      offUsers?.();
    };
  }, [esAdmin]);

  if (!esAdmin) return null;

  const pendientes = denuncias.filter((d) => d.estado === "Pendiente");
  const cuentas = usuarios.filter(
    (u) => u.rol !== "admin" && u.rol !== "superadmin"
  );

  // Eliminar una publicación desde el listado de contenido.
  async function borrarPublicacion(post) {
    if (!esAdmin) return;
    if (!window.confirm("¿Eliminar esta publicación?")) return;

    try {
      await eliminarPublicacion(post.id);
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar la publicación.");
    }
  }

  // Eliminar el comentario asociado a una denuncia y cerrar el reporte.
  async function moderarComentarioDenunciado(denuncia) {
    if (!esAdmin) return;

    if (!denuncia?.publicacionId || !denuncia?.comentarioId) {
      setError("No se encontró el comentario asociado a esta denuncia.");
      return;
    }
    if (!window.confirm("¿Eliminar el comentario denunciado?")) return;

    try {
      await eliminarComentario(denuncia.publicacionId, denuncia.comentarioId);
      await actualizarEstadoDenuncia(denuncia.id, "Comentario eliminado");
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar el comentario denunciado.");
    }
  }

  // Eliminar la publicación asociada a una denuncia y cerrar el reporte.
  async function moderarPublicacionDenunciada(denuncia) {
    if (!esAdmin) return;
    if (!window.confirm("¿Eliminar la publicación denunciada?")) return;

    try {
      await eliminarPublicacion(denuncia.publicacionId);
      await actualizarEstadoDenuncia(denuncia.id, "Publicación eliminada");
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar la publicación denunciada.");
    }
  }

  function cambiarEstadoDenuncia(denuncia, estado, mensajeError) {
    if (!esAdmin) return;
    actualizarEstadoDenuncia(denuncia.id, estado).catch(() =>
      setError(mensajeError)
    );
  }

  async function alternarSuspension(usuario) {
    if (!esAdmin) return;

    try {
      await suspenderCuenta(usuario.uid, usuario.estado !== "suspendido");
    } catch (e) {
      console.error(e);
      setError("No se pudo modificar el estado de la cuenta.");
    }
  }

  return (
    <main className="comunidad-admin-page">

      <div className="admin-page-fondo" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <header className="admin-topbar">

        <div className="admin-brand">
          <span className="admin-brand__icon">⚒</span>

          <div>
            <strong>WIKI-CRAFT</strong>
            <small>Centro de moderacion</small>
          </div>
        </div>

        <button className="admin-salir" onClick={onSalir}>
          ← Volver a Comunidad
        </button>

      </header>

      <section className="admin-dashboard">

        {error && <p role="alert">{error}</p>}

        <div className="admin-welcome">

          <div>
            <span className="admin-eyebrow">
              PANEL DE CONTROL / COMUNIDAD
            </span>

            <h1>Administracion</h1>

            <p>
              Gestioná las publicaciones, revis denuncias
              y mantené la comunidad segura.
            </p>
          </div>

          <div className="admin-status">
            <span className="admin-status__dot" />
            SISTEMA ACTIVO
          </div>

        </div>

        {/* ESTADÍSTICAS */}

        <div className="admin-stats">

          <article className="admin-stat admin-stat--green">
            <span className="admin-stat__icon">▤</span>
            <small>Publicaciones</small>
            <strong>{posts.length}</strong>
            <span>Contenido publicado</span>
          </article>

          <article className="admin-stat admin-stat--gold">
            <span className="admin-stat__icon">⚑</span>
            <small>Denuncias pendientes</small>
            <strong>{pendientes.length}</strong>
            <span>Requieren revisión</span>
          </article>

          <article className="admin-stat admin-stat--blue">
            <span className="admin-stat__icon">♙</span>
            <small>Cuentas registradas</small>
            <strong>{usuarios.length}</strong>
            <span>Usuarios de Wiki-Craft</span>
          </article>

        </div>

        {/* ESPACIO DE TRABAJO */}

        <div className="admin-workspace">

          <aside className="admin-sidebar">

            <span className="admin-sidebar__label">MODERACIÓN</span>

            <button
              className={adminSeccion === "denuncias" ? "seleccionado" : ""}
              onClick={() => setAdminSeccion("denuncias")}
            >
              <span>⚑</span>
              Denuncias
              <b>{pendientes.length}</b>
            </button>

            <button
              className={adminSeccion === "publicaciones" ? "seleccionado" : ""}
              onClick={() => setAdminSeccion("publicaciones")}
            >
              <span>▤</span>
              Publicaciones
              <b>{posts.length}</b>
            </button>

            <button
              className={adminSeccion === "cuentas" ? "seleccionado" : ""}
              onClick={() => setAdminSeccion("cuentas")}
            >
              <span>♙</span>
              Cuentas
              <b>{cuentas.length}</b>
            </button>

            <button
              className={adminSeccion === "comentarios" ? "seleccionado" : ""}
              onClick={() => setAdminSeccion("comentarios")}
            >
              <span>☰</span>
              Comentarios
            </button>

            <div className="admin-sidebar__nota">
              <span>✦ Consejo</span>
              <p>
                Revisá el contexto antes de tomar una
                decisión de moderación.
              </p>
            </div>

          </aside>

          <section className="admin-content">

            {/* DENUNCIAS */}

            {adminSeccion === "denuncias" && (
              <>
                <div className="admin-section-heading">

                  <div>
                    <span className="admin-eyebrow">BANDEJA DE ENTRADA</span>

                    <h2>Denuncias recibidas</h2>

                    <p>Revisá los reportes enviados por la comunidad.</p>
                  </div>

                  <span className="admin-count">
                    {denuncias.length} reportes
                  </span>

                </div>

                {denuncias.length === 0 ? (
                  <div className="admin-empty">
                    <span>✓</span>
                    <h3>Todo tranquilo por acá</h3>
                    <p>
                      Cuando alguien denuncie una publicación,
                      aparecerá en esta bandeja.
                    </p>
                  </div>
                ) : (
                  <div className="comunidad-admin-denuncias">

                    {denuncias.map((d) => (
                      <article className="comunidad-admin-denuncia" key={d.id}>

                        <div className="comunidad-admin-denuncia__top">

                          <div>
                            <span className="admin-report-id">
                              REPORTE #{String(d.id).slice(-5)}
                            </span>

                            <strong>
                              {d.tipoContenido === "comentario"
                                ? `Comentario de ${d.autorNombre || "Usuario"}`
                                : `Publicación de ${d.autorNombre || "Usuario"}`}
                            </strong>
                          </div>

                          <span
                            className={
                              d.estado === "Pendiente"
                                ? "estado-pendiente"
                                : "estado-resuelto"
                            }
                          >
                            {d.estado || "Pendiente"}
                          </span>

                        </div>

                        <p className="admin-report-content">
                          {d.contenido ||
                            (d.tipoContenido === "comentario"
                              ? "El comentario denunciado ya no está disponible."
                              : "La publicación denunciada ya no está disponible.")}
                        </p>

                        <div className="admin-report-meta">
                          <span>
                            Denunciante: {d.denuncianteNombre || "Usuario"}
                          </span>

                          <span>⚑ {d.motivo || "Sin motivo"}</span>

                          <span>
                            ◷ {d.fechaCreacion?.toDate?.()
                              .toLocaleString("es-AR") ||
                              "Fecha no disponible"}
                          </span>
                        </div>

                        {d.detalle && (
                          <p className="admin-report-detail">“{d.detalle}”</p>
                        )}

                        {d.estado === "Pendiente" && (
                          <div className="admin-denuncia-acciones">

                            <button
                              className="admin-btn-primary"
                              onClick={() =>
                                cambiarEstadoDenuncia(
                                  d,
                                  "Revisada",
                                  "No se pudo actualizar la denuncia."
                                )
                              }
                            >
                              ✓ Marcar revisada
                            </button>

                            <button
                              className="admin-btn-danger"
                              onClick={() =>
                                d.tipoContenido === "comentario"
                                  ? moderarComentarioDenunciado(d)
                                  : moderarPublicacionDenunciada(d)
                              }
                            >
                              {d.tipoContenido === "comentario"
                                ? "Eliminar comentario"
                                : "Eliminar publicación"}
                            </button>

                            <button
                              className="admin-btn-quiet"
                              onClick={() =>
                                cambiarEstadoDenuncia(
                                  d,
                                  "Descartada",
                                  "No se pudo descartar la denuncia."
                                )
                              }
                            >
                              Descartar
                            </button>

                          </div>
                        )}

                      </article>
                    ))}

                  </div>
                )}
              </>
            )}

            {/* PUBLICACIONES */}

            {adminSeccion === "publicaciones" && (
              <>
                <div className="admin-section-heading">

                  <div>
                    <span className="admin-eyebrow">CONTENIDO</span>

                    <h2>Publicaciones</h2>

                    <p>
                      Desde aquí podés revisar y eliminar contenido.
                      La administración no puede editar publicaciones.
                    </p>
                  </div>

                  <span className="admin-count">
                    {posts.length} publicaciones
                  </span>

                </div>

                {posts.length === 0 ? (
                  <div className="admin-empty">
                    <span>▤</span>
                    <h3>No hay publicaciones</h3>
                    <p>Las publicaciones nuevas aparecerán acá.</p>
                  </div>
                ) : (
                  <div className="admin-lista-posts">

                    {posts.map((post) => (
                      <article className="admin-item" key={post.id}>

                        <div className="admin-item__avatar">
                          {(post.autorNombre || "U").slice(0, 1).toUpperCase()}
                        </div>

                        <div className="admin-item__main">

                          <div className="admin-item__meta">
                            <strong>{post.autorNombre || "Usuario"}</strong>

                            <span>{post.categoria || "General"}</span>
                          </div>

                          <p>{post.contenido}</p>

                          <div className="admin-item__actions">
                            <button
                              className="admin-btn-danger"
                              onClick={() => borrarPublicacion(post)}
                            >
                              ⌫ Eliminar publicación
                            </button>
                          </div>

                        </div>

                      </article>
                    ))}

                  </div>
                )}
              </>
            )}

            {/* CUENTAS */}

            {adminSeccion === "cuentas" && (
              <>
                <div className="admin-section-heading">

                  <div>
                    <span className="admin-eyebrow">USUARIOS REGISTRADOS</span>

                    <h2>Gestión de cuentas</h2>

                    <p>Podés suspender o reactivar cuentas de usuarios.</p>
                  </div>

                  <span className="admin-count">
                    {cuentas.length} cuentas
                  </span>

                </div>

                {cuentas.length === 0 ? (
                  <div className="admin-empty">
                    <span>♙</span>
                    <h3>No hay usuarios registrados</h3>
                    <p>Las cuentas aparecerán acá cuando se registren.</p>
                  </div>
                ) : (
                  <div className="admin-lista-posts">

                    {cuentas.map((u) => (
                      <article className="admin-item" key={u.uid}>

                        <div className="admin-item__avatar">
                          {(u.nombreUsuario || u.email || "U")
                            .slice(0, 1)
                            .toUpperCase()}
                        </div>

                        <div className="admin-item__main">

                          <div className="admin-item__meta">
                            <strong>
                              {u.nombreUsuario || u.email || "Usuario"}
                            </strong>

                            <span>{u.email || "Sin correo"}</span>
                          </div>

                          <p>
                            Estado de la cuenta:{" "}
                            <strong>
                              {u.estado === "suspendido" ? "Suspendida" : "Activa"}
                            </strong>
                          </p>

                          <div className="admin-item__actions">
                            <button
                              className={
                                u.estado === "suspendido"
                                  ? "admin-btn-primary"
                                  : "admin-btn-danger"
                              }
                              onClick={() => alternarSuspension(u)}
                            >
                              {u.estado === "suspendido"
                                ? "Reactivar cuenta"
                                : "Suspender cuenta"}
                            </button>
                          </div>

                        </div>

                      </article>
                    ))}

                  </div>
                )}
              </>
            )}

            {/* COMENTARIOS */}

            {adminSeccion === "comentarios" && (
              <>
                <div className="admin-section-heading">
                  <div>
                    <span className="admin-eyebrow">CONVERSACIONES</span>

                    <h2>Comentarios</h2>

                    <p>
                      Comentarios asociados a las publicaciones
                      de la comunidad.
                    </p>
                  </div>
                </div>

                {posts.every(
                  (post) =>
                    !Array.isArray(post.comentarios) ||
                    post.comentarios.length === 0
                ) ? (
                  <div className="admin-empty">
                    <span>☰</span>
                    <h3>Todavía no hay comentarios</h3>
                    <p>
                      Los comentarios aparecerán acá cuando
                      estén disponibles en las publicaciones.
                    </p>
                  </div>
                ) : (
                  posts
                    .filter(
                      (post) =>
                        Array.isArray(post.comentarios) &&
                        post.comentarios.length > 0
                    )
                    .map((post) => (
                      <article className="admin-comments-group" key={post.id}>

                        <div className="admin-comments-group__heading">
                          <strong>{post.autorNombre || "Usuario"}</strong>

                          <span>{post.contenido}</span>
                        </div>

                        {post.comentarios.map((comentario, index) => (
                          <div
                            className="admin-item"
                            key={comentario.id || index}
                          >
                            <div className="admin-item__main">
                              <div className="admin-item__meta">
                                <strong>
                                  {comentario.autorNombre ||
                                    comentario.usuario ||
                                    "Usuario"}
                                </strong>
                              </div>

                              <p>{comentario.texto || comentario.contenido}</p>
                            </div>
                          </div>
                        ))}

                      </article>
                    ))
                )}
              </>
            )}

          </section>
        </div>

        <footer className="admin-footer">
          <span>WIKI-CRAFT · MODERATION TOOLS</span>
          <span>Los cambios se guardan en Firebase Firestore.</span>
        </footer>

      </section>
    </main>
  );
}
