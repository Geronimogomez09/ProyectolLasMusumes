
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/Footer";
import NuevoPost from "../components/comunidadComponentes/nuevo-post";
import DenunciaModal from "../components/comunidadComponentes/denuncia-modal";
import BotonAdmin from "../components/botonAdmin";

import { useAuth } from "../context/AuthContext";

import {
  escucharPublicaciones,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
  crearDenuncia,
  escucharDenuncias,
  actualizarEstadoDenuncia,
  escucharDocumentos,
  suspenderCuenta
} from "../services/firestore";

import "../styles/Comunidad.css";

const CATEGORIAS = [
  "construcciones",
  "Mods",
  "Anuncios",
  "pvps"
];

const nombreUsuario = (usuario, perfil) =>
  perfil?.nombreUsuario ||
  usuario?.displayName ||
  usuario?.email?.split("@")[0] ||
  "Usuario";

export default function Comunidad() {
  const { usuario, perfil, esAdmin } = useAuth();

  const [posts, setPosts] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [filtro, setFiltro] = useState("Todas");
  const [modal, setModal] = useState(null);

  const [admin, setAdmin] = useState(false);
  const [adminSeccion, setAdminSeccion] = useState("denuncias");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  // Escuchar denuncias y usuarios cuando se abre el panel.
  useEffect(() => {
    if (!esAdmin || !admin) return;

    const offReports = escucharDenuncias(setDenuncias);
    const offUsers = escucharDocumentos("usuarios", setUsuarios);

    return () => {
      offReports?.();
      offUsers?.();
    };
  }, [esAdmin, admin]);

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

  // Crear denuncia.
  async function denunciar(datos) {
    if (!modal) return;

    try {
      await crearDenuncia(
        {
          publicacionId: modal.id,
          autorId: modal.autorId,
          autorNombre: modal.autorNombre,
          contenido: modal.contenido,
          motivo: datos.motivo,
          detalle: datos.detalle,
          tipoContenido: "publicacion"
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

  // Eliminar publicación.
  async function borrar(post) {
    if (
      !esAdmin &&
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
    if (esAdmin || post.autorId !== usuario?.uid) return;

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

  // Cambiar entre Comunidad y administración.
  function alternarAdmin() {
    if (!esAdmin) return;

    if (!admin) {
      setAdminSeccion("denuncias");
    }

    setAdmin(!admin);
  }

  return (
    <>
      {!(admin && esAdmin) && <Header />}

      <div className={admin && esAdmin ? "" : "comunidad-page"}>

        {!(admin && esAdmin) && (
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

        <main className={admin && esAdmin ? "" : "comunidad-main"}>

          {error && (
            <p role="alert">{error}</p>
          )}

          {/* ================= PANEL ADMINISTRATIVO ================= */}

          {admin && esAdmin ? (
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
                    <small>Centro de moderación</small>
                  </div>
                </div>

                <button
                  className="admin-salir"
                  onClick={() => setAdmin(false)}
                >
                  ← Volver a Comunidad
                </button>

              </header>

              <section className="admin-dashboard">

                <div className="admin-welcome">

                  <div>
                    <span className="admin-eyebrow">
                      PANEL DE CONTROL / COMUNIDAD
                    </span>

                    <h1>Administración</h1>

                    <p>
                      Gestioná las publicaciones, revisá denuncias
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
                    <strong>
                      {denuncias.filter(
                        (d) => d.estado === "Pendiente"
                      ).length}
                    </strong>
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

                    <span className="admin-sidebar__label">
                      MODERACIÓN
                    </span>

                    <button
                      className={
                        adminSeccion === "denuncias"
                          ? "seleccionado"
                          : ""
                      }
                      onClick={() => setAdminSeccion("denuncias")}
                    >
                      <span>⚑</span>
                      Denuncias
                      <b>
                        {denuncias.filter(
                          (d) => d.estado === "Pendiente"
                        ).length}
                      </b>
                    </button>

                    <button
                      className={
                        adminSeccion === "publicaciones"
                          ? "seleccionado"
                          : ""
                      }
                      onClick={() => setAdminSeccion("publicaciones")}
                    >
                      <span>▤</span>
                      Publicaciones
                      <b>{posts.length}</b>
                    </button>

                    <button
                      className={
                        adminSeccion === "cuentas"
                          ? "seleccionado"
                          : ""
                      }
                      onClick={() => setAdminSeccion("cuentas")}
                    >
                      <span>♙</span>
                      Cuentas
                      <b>
                        {usuarios.filter(
                          (u) => u.rol !== "admin"
                        ).length}
                      </b>
                    </button>

                    <button
                      className={
                        adminSeccion === "comentarios"
                          ? "seleccionado"
                          : ""
                      }
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
                            <span className="admin-eyebrow">
                              BANDEJA DE ENTRADA
                            </span>

                            <h2>Denuncias recibidas</h2>

                            <p>
                              Revisá los reportes enviados por la comunidad.
                            </p>
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

                            {[...denuncias].map((d) => (
                              <article
                                className="comunidad-admin-denuncia"
                                key={d.id}
                              >

                                <div className="comunidad-admin-denuncia__top">

                                  <div>
                                    <span className="admin-report-id">
                                      REPORTE #{String(d.id).slice(-5)}
                                    </span>

                                    <strong>
                                      Publicación de {d.autorNombre || "Usuario"}
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
                                    "La publicación denunciada ya no está disponible."}
                                </p>

                                <div className="admin-report-meta">
                                  <span>
                                    Denunciante: {d.denuncianteNombre || "Usuario"}
                                  </span>

                                  <span>
                                    ⚑ {d.motivo || "Sin motivo"}
                                  </span>

                                  <span>
                                    ◷ {d.fechaCreacion?.toDate?.()
                                      .toLocaleString("es-AR") ||
                                      "Fecha no disponible"}
                                  </span>
                                </div>

                                {d.detalle && (
                                  <p className="admin-report-detail">
                                    “{d.detalle}”
                                  </p>
                                )}

                                {d.estado === "Pendiente" && (
                                  <div className="admin-denuncia-acciones">

                                    <button
                                      className="admin-btn-primary"
                                      onClick={() =>
                                        actualizarEstadoDenuncia(
                                          d.id,
                                          "Revisada"
                                        ).catch(() =>
                                          setError(
                                            "No se pudo actualizar la denuncia."
                                          )
                                        )
                                      }
                                    >
                                      ✓ Marcar revisada
                                    </button>

                                    <button
                                      className="admin-btn-danger"
                                      onClick={async () => {
                                        if (
                                          !window.confirm(
                                            "¿Eliminar la publicación denunciada?"
                                          )
                                        ) return;

                                        try {
                                          await eliminarPublicacion(
                                            d.publicacionId
                                          );

                                          await actualizarEstadoDenuncia(
                                            d.id,
                                            "Publicación eliminada"
                                          );
                                        } catch (e) {
                                          console.error(e);
                                          setError(
                                            "No se pudo eliminar la publicación denunciada."
                                          );
                                        }
                                      }}
                                    >
                                      Eliminar publicación
                                    </button>

                                    <button
                                      className="admin-btn-quiet"
                                      onClick={() =>
                                        actualizarEstadoDenuncia(
                                          d.id,
                                          "Descartada"
                                        ).catch(() =>
                                          setError(
                                            "No se pudo descartar la denuncia."
                                          )
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
                            <span className="admin-eyebrow">
                              CONTENIDO
                            </span>

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
                            <p>
                              Las publicaciones nuevas aparecerán acá.
                            </p>
                          </div>
                        ) : (
                          <div className="admin-lista-posts">

                            {posts.map((post) => (
                              <article
                                className="admin-item"
                                key={post.id}
                              >

                                <div className="admin-item__avatar">
                                  {(post.autorNombre || "U")
                                    .slice(0, 1)
                                    .toUpperCase()}
                                </div>

                                <div className="admin-item__main">

                                  <div className="admin-item__meta">
                                    <strong>
                                      {post.autorNombre || "Usuario"}
                                    </strong>

                                    <span>
                                      {post.categoria || "General"}
                                    </span>
                                  </div>

                                  <p>{post.contenido}</p>

                                  <div className="admin-item__actions">
                                    <button
                                      className="admin-btn-danger"
                                      onClick={() => borrar(post)}
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
                            <span className="admin-eyebrow">
                              USUARIOS REGISTRADOS
                            </span>

                            <h2>Gestión de cuentas</h2>

                            <p>
                              Podés suspender o reactivar cuentas de usuarios.
                            </p>
                          </div>

                          <span className="admin-count">
                            {usuarios.filter(
                              (u) => u.rol !== "admin"
                            ).length} cuentas
                          </span>

                        </div>

                        {usuarios.filter(
                          (u) => u.rol !== "admin"
                        ).length === 0 ? (
                          <div className="admin-empty">
                            <span>♙</span>
                            <h3>No hay usuarios registrados</h3>
                            <p>
                              Las cuentas aparecerán acá cuando se registren.
                            </p>
                          </div>
                        ) : (
                          <div className="admin-lista-posts">

                            {usuarios
                              .filter((u) => u.rol !== "admin")
                              .map((u) => (
                                <article
                                  className="admin-item"
                                  key={u.uid}
                                >

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

                                      <span>
                                        {u.email || "Sin correo"}
                                      </span>
                                    </div>

                                    <p>
                                      Estado de la cuenta:{" "}
                                      <strong>
                                        {u.estado === "suspendido"
                                          ? "Suspendida"
                                          : "Activa"}
                                      </strong>
                                    </p>

                                    <div className="admin-item__actions">
                                      <button
                                        className={
                                          u.estado === "suspendido"
                                            ? "admin-btn-primary"
                                            : "admin-btn-danger"
                                        }
                                        onClick={async () => {
                                          try {
                                            await suspenderCuenta(
                                              u.uid,
                                              u.estado !== "suspendido"
                                            );
                                          } catch (e) {
                                            console.error(e);
                                            setError(
                                              "No se pudo modificar el estado de la cuenta."
                                            );
                                          }
                                        }}
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
                            <span className="admin-eyebrow">
                              CONVERSACIONES
                            </span>

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
                              <article
                                className="admin-comments-group"
                                key={post.id}
                              >

                                <div className="admin-comments-group__heading">
                                  <strong>
                                    {post.autorNombre || "Usuario"}
                                  </strong>

                                  <span>{post.contenido}</span>
                                </div>

                                {post.comentarios.map(
                                  (comentario, index) => (
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

                                        <p>
                                          {comentario.texto ||
                                            comentario.contenido}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                )}

                              </article>
                            ))
                        )}
                      </>
                    )}

                  </section>
                </div>

                <footer className="admin-footer">
                  <span>WIKI-CRAFT · MODERATION TOOLS</span>
                  <span>
                    Los cambios se guardan en Firebase Firestore.
                  </span>
                </footer>

              </section>
            </main>
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
                          onClick={() => setModal(p)}
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

                      <div className="post-usuario-acciones">

                        {/* Editar: únicamente el propietario que no sea admin. */}
                        {!esAdmin && p.autorId === usuario?.uid && (
                          <button onClick={() => editar(p)}>
                            Editar
                          </button>
                        )}

                        {/* Eliminar: propietario o administrador. */}
                        {(p.autorId === usuario?.uid || esAdmin) && (
                          <button onClick={() => borrar(p)}>
                            Eliminar
                          </button>
                        )}

                      </div>

                      <Link to={`/publicacion/${p.id}`}>
                        Ver publicación completa →
                      </Link>

                    </article>
                  ))}

                </section>
              )}
            </>

          )}

        </main>
      </div>

      {/* BOTÓN ADMIN ORIGINAL: SE CONSERVA SU COMPONENTE Y UBICACIÓN */}

      {esAdmin && (
        <BotonAdmin
          activo={admin}
          alAlternar={alternarAdmin}
          aviso="Estás en el panel de administración de Comunidad."
        />
      )}

      {modal && (
        <DenunciaModal
          onConfirmar={denunciar}
          onCancelar={() => setModal(null)}
        />
      )}

      {!(admin && esAdmin) && <Footer />}

    </>
  );
}
