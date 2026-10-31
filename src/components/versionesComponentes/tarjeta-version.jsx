import ListaComentarios from '../comunidadComponentes/lista-comentarios';
import '../../styles/tarjeta-version.css';

// Cada entrada acá define qué campo del objeto `version` se muestra, con qué
// título y qué ícono. Si el array de ese campo viene vacío, la sección ni
// se renderiza (por eso un hotfix sin bloques nuevos no muestra "Nuevos
// bloques" vacío).
const SECCIONES = [
  { campo: 'nuevasFunciones', titulo: 'Nuevas funciones', icono: '🆕' },
  { campo: 'cambios', titulo: 'Cambios', icono: '🔄' },
  { campo: 'correcciones', titulo: 'Correcciones', icono: '🛠️' },
  { campo: 'nuevosBloques', titulo: 'Nuevos bloques', icono: '🧱' },
  { campo: 'nuevasCriaturas', titulo: 'Nuevas criaturas', icono: '🐾' },
  { campo: 'nuevosBiomas', titulo: 'Nuevos biomas', icono: '🗺️' },
];

// version: ver forma completa en versiones.jsx (postsIniciales/versionesIniciales)
// comentariosAbiertos: bool — si está abierta la sección de comentarios
// onToggleComentarios, onAgregarComentario: delegados al padre (igual que en Comunidad)
// delay: segundos para el animationDelay de la cascada
function TarjetaVersion({
  version,
  comentariosAbiertos,
  onToggleComentarios,
  onAgregarComentario,
  delay = 0,
}) {
  return (
    <article
      className={`version-card cascada-item ${
        version.destacada ? 'version-card--destacada' : ''
      }`}
      style={{ animationDelay: `${delay}s` }}
    >
      {version.destacada && <span className="version-card__ribbon">¡Reciente!</span>}

      <div className="version-card__imagen-wrap">
        <img
          src={version.imagen}
          alt={`Captura de ${version.nombre}`}
          className="version-card__imagen"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        {/* Fallback: si todavía no pusiste la imagen en public/images/versiones/,
            se ve el número de versión en vez de un ícono roto */}
        <div className="version-card__imagen-fallback" style={{ display: 'none' }}>
          <span>{version.numero}</span>
        </div>
      </div>

      <div className="version-card__cuerpo">
        <div className="version-card__encabezado">
          <h3>
            {version.numero} · {version.nombre}
          </h3>
          <div className="version-card__ediciones">
            {version.edicion.map((ed) => (
              <span
                key={ed}
                className={`edicion-badge edicion-badge--${ed.toLowerCase()}`}
              >
                {ed}
              </span>
            ))}
          </div>
        </div>

        <p className="version-card__fecha">{version.fechaLegible}</p>
        <p className="version-card__descripcion">{version.descripcion}</p>

        {SECCIONES.map(({ campo, titulo, icono }) =>
          version[campo] && version[campo].length > 0 ? (
            <div className="version-card__seccion" key={campo}>
              <h4>
                {icono} {titulo}
              </h4>
              <ul>
                {version[campo].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null
        )}

        <button
          className="version-card__btn-comentarios"
          onClick={() => onToggleComentarios(version.id)}
        >
          💬 {version.comentarios.length} comentario
          {version.comentarios.length === 1 ? '' : 's'}
        </button>

        {comentariosAbiertos && (
          <ListaComentarios
            comentarios={version.comentarios}
            onAgregarComentario={(comentario) =>
              onAgregarComentario(version.id, comentario)
            }
          />
        )}
      </div>
    </article>
  );
}

export default TarjetaVersion;
