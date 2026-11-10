import ListaComentarios from '../comunidadComponentes/lista-comentarios';
import { resolverImagenVersion } from '../../utils/imagenesVersion';
import '../../styles/tarjeta-version.css';

// Índice: Tarjeta de versión.
// ----------------- Tarjeta de versión -----------------
// Recibe los datos de una versión y las acciones disponibles. Presenta sus cambios y, cuando corresponde, permite abrir las opciones de administración.

const SECCIONES = [
  { campo: 'nuevasFunciones', titulo: 'Nuevas funciones', icono: '🆕' },
  { campo: 'cambios', titulo: 'Cambios', icono: '🔄' },
  { campo: 'correcciones', titulo: 'Correcciones', icono: '🛠️' },
  { campo: 'nuevosBloques', titulo: 'Nuevos bloques', icono: '🧱' },
  { campo: 'nuevasCriaturas', titulo: 'Nuevas criaturas', icono: '🐾' },
  { campo: 'nuevosBiomas', titulo: 'Nuevos biomas', icono: '🗺️' },
];

function TarjetaVersion({
  version,
  comentariosAbiertos,
  onToggleComentarios,
  onAgregarComentario,
  onEditar,
  onEliminar,
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
          src={resolverImagenVersion(version.imagen)}
          alt={`Captura de ${version.nombre}`}
          className="version-card__imagen"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        <div className="version-card__imagen-fallback" style={{ display: 'none' }}>
          <span>{version.numero}</span>
        </div>
      </div>

      <div className="version-card__cuerpo">
        <div className="version-card__encabezado">
          <div>
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

          {/* BOTONES DE EDICIÓN Y ELIMINACIÓN */}
          {(onEditar || onEliminar) && (
            <div className="version-card__acciones">
              <button className="btn-accion btn-accion--editar" onClick={onEditar} title="Editar versión">
                ✏️ Editar
              </button>
              <button className="btn-accion btn-accion--eliminar" onClick={onEliminar} title="Eliminar versión">
                🗑️ Eliminar
              </button>
            </div>
          )}
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
      </div>
    </article>
  );
}

export default TarjetaVersion;