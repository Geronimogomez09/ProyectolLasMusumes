import Header from '../components/header';

export default function Comunidad() {
  return (
    <>
      <Header />

      <div className="container my-5">

        {/* ENCABEZADO */}
        <div className="text-center mb-5">
          <h1 className="display-4">Comunidad WikiCraft</h1>
          <p className="lead">
            Comparte tus experiencias, construcciones y aventuras con otros
            jugadores de Minecraft.
          </p>
        </div>


        {/* BUSCADOR Y FILTROS */}
        <div className="card shadow-sm mb-4">
          <div className="card-body">

            <div className="row g-3">

              <div className="col-md-8">
                <label className="form-label">
                  Buscar publicaciones
                </label>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por palabras clave..."
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">
                  Categoría
                </label>

                <select className="form-select">
                  <option>Todas las categorías</option>
                  <option>Experiencias de juego</option>
                  <option>Construcciones</option>
                  <option>Capturas de pantalla</option>
                  <option>Actualizaciones</option>
                  <option>Consejos y guías</option>
                  <option>Proyectos</option>
                  <option>Fan arts</option>
                </select>
              </div>

            </div>

          </div>
        </div>


        {/* PUBLICACIONES */}
        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2>Publicaciones</h2>

          <button className="btn btn-success">
            + Crear publicación
          </button>

        </div>


        {/* PUBLICACIÓN 1 */}
        <div className="card shadow-sm mb-4">

          <div className="card-body">

            {/* AUTOR */}
            <div className="d-flex align-items-center mb-3">

              <div className="bg-secondary rounded-circle p-3 me-3">
                👤
              </div>

              <div>
                <h5 className="mb-0">
                  Nombre del usuario
                </h5>

                <small className="text-muted">
                  17 de septiembre de 2026 - 10:30
                </small>
              </div>

            </div>


            {/* CATEGORÍA */}
            <span className="badge text-bg-success mb-3">
              Construcciones
            </span>


            {/* CONTENIDO */}
            <h4>
              Mi nueva construcción en Minecraft
            </h4>

            <p>
              Después de varios días construyendo, finalmente terminé mi
              nueva ciudad medieval. ¿Qué opinan?
            </p>


            {/* IMAGEN */}
            <div className="bg-light border rounded p-5 text-center mb-3">
              📷 Imagen adjunta
            </div>


            {/* REACCIONES */}
            <div className="d-flex gap-2 flex-wrap mb-3">

              <button className="btn btn-outline-primary">
                👍 Me gusta <span>12</span>
              </button>

              <button className="btn btn-outline-info">
                💎 Diamante <span>8</span>
              </button>

              <button className="btn btn-outline-success">
                💚 Esmeralda <span>5</span>
              </button>

            </div>


            {/* COMENTARIOS */}
            <div className="border-top pt-3">

              <h6>
                💬 Comentarios (4)
              </h6>

              <div className="bg-light rounded p-3 mb-2">
                <strong>Jugador123</strong>

                <p className="mb-0">
                  ¡Está increíble! Me encanta el diseño de la ciudad.
                </p>
              </div>

              <div className="bg-light rounded p-3 mb-3">
                <strong>SteveCraft</strong>

                <p className="mb-0">
                  ¿Cuánto tiempo tardaste en construirla?
                </p>
              </div>


              <div className="input-group">

                <input
                  type="text"
                  className="form-control"
                  placeholder="Escribe un comentario..."
                />

                <button className="btn btn-primary">
                  Comentar
                </button>

              </div>

            </div>

          </div>
        </div>


        {/* PUBLICACIÓN 2 */}
        <div className="card shadow-sm mb-5">

          <div className="card-body">

            <div className="d-flex align-items-center mb-3">

              <div className="bg-secondary rounded-circle p-3 me-3">
                👤
              </div>

              <div>

                <h5 className="mb-0">
                  AlexMiner
                </h5>

                <small className="text-muted">
                  16 de septiembre de 2026 - 21:15
                </small>

              </div>

            </div>


            <span className="badge text-bg-warning mb-3">
              Consejos y guías
            </span>


            <h4>
              Consejo para encontrar diamantes
            </h4>

            <p>
              Les comparto algunos consejos que me ayudaron a encontrar
              diamantes más rápido durante mis partidas.
            </p>


            <div className="d-flex gap-2 flex-wrap">

              <button className="btn btn-outline-primary">
                👍 Me gusta <span>20</span>
              </button>

              <button className="btn btn-outline-info">
                💎 Diamante <span>15</span>
              </button>

              <button className="btn btn-outline-success">
                💚 Esmeralda <span>7</span>
              </button>

            </div>


            <div className="border-top pt-3 mt-3">

              <h6>
                💬 Comentarios (7)
              </h6>

            </div>

          </div>
        </div>

      </div>
    </>
  );
}
