import { Link } from "react-router-dom";
import { fechaLegible } from "./perfilUtils";

// Índice: Resumen del perfil.
// ----------------- Resumen del perfil -----------------
// Recibe el perfil y los datos relacionados para presentar su resumen. Coordina las secciones visibles y las acciones disponibles en esta vista.

// RESUMEN PERFIL: sección "Resumen" del perfil.
// PARA QUÉ SE USA: ver de un vistazo cuántas publicaciones y guardados tiene el usuario,
// su biografía, sus últimas publicaciones y, si es admin, accesos rápidos a sus secciones.
// QUÉ MUESTRA: tres estadísticas, bloque "Acerca de mí", "Últimas publicaciones" y
// "Herramientas de administrador" (solo si tiene permisos).
// Recibe: perfil, email, nombreCompleto, publicaciones (del usuario), totalGuardado (número),
// accesosAdmin (lista {id, nombre, ruta}), esSuper (true si es superadmin) y onIrA(id, abrirEdicion).
export default function PerfilResumen({
  perfil,
  email,
  nombreCompleto,
  publicaciones,
  totalGuardado,
  accesosAdmin,
  esSuper,
  onIrA,
}) {
  const mostrarAdmin = esSuper || accesosAdmin.length > 0;
  const mostrarNombreCompleto =
    nombreCompleto &&
    nombreCompleto.trim().toLocaleLowerCase("es") !==
      String(perfil.nombreUsuario || "").trim().toLocaleLowerCase("es");

  return (
    <>
      {/* ESTADÍSTICAS: publicaciones, elementos guardados y fecha de registro. */}
      <div className="perfil-stats">
        <article>
          <i className="bi bi-chat-square-text" />
          <div>
            <strong>{publicaciones.length}</strong>
            <small>Publicaciones</small>
          </div>
        </article>

        <article>
          <i className="bi bi-heart" />
          <div>
            <strong>{totalGuardado}</strong>
            <small>Elementos guardados</small>
          </div>
        </article>

        <article>
          <i className="bi bi-calendar-heart" />
          <div>
            <strong>{fechaLegible(perfil.fechaRegistro)}</strong>
            <small>Te uniste</small>
          </div>
        </article>
      </div>

      <div className="perfil-grid">
        {/* ACERCA DE MÍ: biografía y datos de contacto del usuario. */}
        <article className="perfil-bloque">
          <div className="perfil-bloque-cab">
            <h3>Acerca de mí</h3>
            <button type="button" className="perfil-link" onClick={() => onIrA("datos", true)}>
              Editar
            </button>
          </div>

          <p className="perfil-texto">
            {perfil.biografia ||
              "Todavía no escribiste tu biografía. Contale a la comunidad qué te gusta de Minecraft."}
          </p>

          {mostrarNombreCompleto && (
            <p className="perfil-dato"><i className="bi bi-person" /> {nombreCompleto}</p>
          )}
          <p className="perfil-dato"><i className="bi bi-envelope" /> {email}</p>
          <p className="perfil-dato">
            <i className="bi bi-geo-alt" /> {perfil.ubicacion || "Ubicación sin especificar"}
          </p>
          {perfil.pais && (
            <p className="perfil-dato">
              <i className="bi bi-globe-americas" /> {perfil.pais}
            </p>
          )}
          {perfil.sitioWeb && (
            <p className="perfil-dato">
              <i className="bi bi-link-45deg" />
              <a href={perfil.sitioWeb} target="_blank" rel="noreferrer">{perfil.sitioWeb}</a>
            </p>
          )}
        </article>

        {/* ÚLTIMAS PUBLICACIONES: las tres más recientes del usuario. */}
        <article className="perfil-bloque">
          <div className="perfil-bloque-cab">
            <h3>Últimas publicaciones</h3>
            <button type="button" className="perfil-link" onClick={() => onIrA("publicaciones")}>
              Ver todas
            </button>
          </div>

          {publicaciones.length ? (
            publicaciones.slice(0, 3).map((pub) => (
              <Link to={`/publicacion/${pub.id}`} className="perfil-mini" key={pub.id}>
                <strong>{pub.categoria || "Publicación"}</strong>
                <span>{pub.contenido || "Sin texto"}</span>
              </Link>
            ))
          ) : (
            <p className="perfil-vacio-chico">Todavía no publicaste nada en la comunidad.</p>
          )}
        </article>
      </div>

      {/* HERRAMIENTAS DE ADMINISTRADOR: un acceso por cada sección que el usuario administra.
          El superadmin ve todas las secciones y además la página de usuarios. */}
      {mostrarAdmin && (
        <article className="perfil-bloque perfil-bloque--admin">
          <div className="perfil-bloque-cab">
            <h3><i className="bi bi-shield-check" /> Herramientas de administrador</h3>
          </div>

          <p className="perfil-texto">
            En cada página que administrás tenés un botón «Modo administrador» (abajo a la
            derecha) para agregar, editar o eliminar contenido.
          </p>

          <div className="perfil-accesos">
            {accesosAdmin.map((acceso) => (
              <Link key={acceso.id} to={acceso.ruta}>{acceso.nombre}</Link>
            ))}
            {esSuper && <Link to="/admin/usuarios">Crear administrador</Link>}
          </div>
        </article>
      )}
    </>
  );
}
