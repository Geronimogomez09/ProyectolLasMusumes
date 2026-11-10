import { EnlaceInicio } from "./EdicionInicio";
import TarjetaNovedad from "./TarjetaNovedad";

// Índice: Novedades del inicio.
// ----------------- Novedades del inicio -----------------
// Recibe la lista de novedades y el estado de carga. Muestra el contenido disponible o la indicación correspondiente mientras se esperan los datos.

// NOVEDADES INICIO: bloque "Últimas novedades" del inicio. Muestra una TarjetaNovedad por
// cada novedad automática (última publicación, versión, producto y canción).
// Recibe: novedades (lista armada por cargarNovedadesInicio) y cargando (true mientras se buscan).
export default function NovedadesInicio({ novedades, cargando }) {
    return (
        <section className="inicio-seccion">
            <div className="inicio-titulo-fila">
                <h2 className="inicio-titulo">
                    <span></span>
                    Últimas novedades
                </h2>

                <EnlaceInicio to="/comunidad" className="inicio-ver-todo">
                    Ver comunidad
                    <i className="bi bi-arrow-right ms-1"></i>
                </EnlaceInicio>
            </div>

            {/* Mensajes mientras se cargan las novedades o si no hay ninguna. */}
            {cargando && <p className="inicio-vacio">Buscando novedades...</p>}

            {!cargando && novedades.length === 0 && (
                <p className="inicio-vacio">
                    Todavía no hay novedades para mostrar.
                </p>
            )}

            <div className="row g-3">
                {novedades.map((novedad) => (
                    <div className="col-12 col-lg-6" key={novedad.id}>
                        <TarjetaNovedad novedad={novedad} />
                    </div>
                ))}
            </div>
        </section>
    );
}
