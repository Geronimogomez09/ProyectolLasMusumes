import { texBloque } from '../../data/historiaData';

// Índice: Portada de la historia.
// ----------------- Portada de la historia -----------------
// Recibe el rango de años, la cantidad de eventos, si hay eras y la acción para comenzar. Resume la historia y permite desplazarse a su contenido.

// HERO HISTORIA: portada de la página Historia. Muestra el título "La historia de Minecraft",
// una descripción, tres números (años de historia, cantidad de hitos, copias vendidas), los
// bloques flotantes del fondo y el botón "Empezar el recorrido".
// Recibe: anios, cantidadEventos, hayEras, onEmpezar. Se usa en historia.jsx.
function HeroHistoria({ anios, cantidadEventos, hayEras, onEmpezar }) {
    // Bloques de Minecraft que flotan detrás del título.
    const bloques = ['grass_block_side', 'tnt_side', 'emerald_block', 'netherrack', 'crafting_table_front'];

    return (
        <header className="historia-hero">
            {/* Bloques flotantes decorativos. Si una imagen no carga, se oculta. */}
            <div className="historia-cubos" aria-hidden="true">
                {bloques.map((bloque) => (
                    <img
                        key={bloque}
                        className="historia-cubo"
                        src={texBloque(bloque)}
                        alt=""
                        onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                    />
                ))}
            </div>

            <div className="historia-hero-contenido">
                <span className="historia-eyebrow">Línea de tiempo</span>
                <h1>
                    La historia de <span>Minecraft</span>
                </h1>
                <p>
                    De un prototipo hecho en ratos libres a uno de los videojuegos más vendidos de todos los
                    tiempos. Recorré cada hito del desarrollo, desde Cave Game hasta los game drops.
                </p>

                {/* Números destacados de la portada. */}
                <div className="historia-stats">
                    <div><strong>{anios}</strong><span>años de historia</span></div>
                    <div><strong>{cantidadEventos}</strong><span>hitos en la línea</span></div>
                    <div><strong>300 M+</strong><span>copias vendidas (dato de 2023)</span></div>
                </div>

                {/* El botón lleva a la primera era. Solo aparece si hay al menos una era. */}
                {hayEras && (
                    <button type="button" className="inicio-btn-principal" onClick={onEmpezar}>
                        Empezar el recorrido
                    </button>
                )}
            </div>
        </header>
    );
}

export default HeroHistoria;