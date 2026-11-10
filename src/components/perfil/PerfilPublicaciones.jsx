import { Link } from "react-router-dom";
import { fechaLegible } from "./perfilUtils";

// Índice: Publicaciones del perfil.
// ----------------- Publicaciones del perfil -----------------
// Recibe las publicaciones de la persona y las muestra en la sección correspondiente del perfil.

// PUBLICACIONES PERFIL: sección "Mis publicaciones" del perfil.
// PARA QUÉ SE USA: listar todo lo que el usuario publicó en Comunidad.
// QUÉ MUESTRA: una tarjeta por publicación (categoría, fecha, texto, imagen, likes,
// cantidad de comentarios y enlace a la publicación) o un mensaje si todavía no publicó nada.
// Recibe: publicaciones (lista de publicaciones del usuario, ya ordenadas).
export default function PerfilPublicaciones({ publicaciones }) {
  if (publicaciones.length === 0) {
    return (
      <div className="perfil-vacio">
        <i className="bi bi-chat-square-text" />
        <h3>Tu aventura empieza acá</h3>
        <p>Cuando publiques algo en la comunidad, lo vas a ver en esta sección.</p>
        <Link to="/comunidad" className="perfil-btn">Ir a la comunidad</Link>
      </div>
    );
  }

  return (
    <div className="perfil-lista">
      {publicaciones.map((pub) => (
        <article className="perfil-bloque perfil-post" key={pub.id}>
          <div className="perfil-post-top">
            <span className="perfil-chip">{pub.categoria || "General"}</span>
            <small>{fechaLegible(pub.fechaCreacion)}</small>
          </div>

          <p className="perfil-texto">{pub.contenido || "Publicación sin texto."}</p>

          {pub.imagen && (
            <img className="perfil-post-imagen" src={pub.imagen} alt="Imagen de la publicación" />
          )}

          <div className="perfil-post-pie">
            <span>
              <i className="bi bi-heart" /> {pub.likes || 0} · <i className="bi bi-chat" />{" "}
              {pub.comentarios?.length || 0}
            </span>
            <Link to={`/publicacion/${pub.id}`} className="perfil-link">Abrir publicación</Link>
          </div>
        </article>
      ))}
    </div>
  );
}
