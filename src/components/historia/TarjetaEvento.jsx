import ImagenEvento from './ImagenEvento';

// Índice: Tarjeta de evento histórico.
// ----------------- Tarjeta de evento histórico -----------------
// Recibe un evento, su estado de apertura y las acciones disponibles. Muestra el resumen y, si está habilitada la administración, permite editar o eliminar el evento.

// TARJETA EVENTO: muestra un hito de la línea de tiempo de Historia (año, nodo sobre la línea,
// imagen, tipo, versión, fecha, título, descripción y los "Ver detalles" desplegables). En modo
// administrador suma los botones de editar y eliminar.
// Recibe: evento, mostrarAnio, estado, modoAdmin, abierto, onToggle, onEditar, onEliminar.
// Se usa en EraHistoria.
function TarjetaEvento({ evento: e, mostrarAnio, estado, modoAdmin, abierto, onToggle, onEditar, onEliminar }) {
    return (
        <article
            id={`evento-${e.id}`}
            className="historia-evento historia-revelar"
            data-era={e.era}
            data-evento={e.id}
            data-estado={estado}
        >
            {/* AÑO Y NODO: columna izquierda y punto sobre la línea. */}
            <div className="historia-fecha">{mostrarAnio ? e.fecha.slice(0, 4) : ''}</div>

            <div className="historia-nodo" aria-hidden="true"><i /></div>

            <div className={`historia-card${e.destacada ? ' historia-card--destacada' : ''}`}>
                {/* BOTONES DE ADMINISTRADOR: editar (lápiz) y eliminar (tacho). Íconos dibujados con SVG. */}
                {modoAdmin && (
                    <div className="inicio-admin-acciones">
                        <button
                            type="button"
                            className="inicio-admin-btn"
                            title="Editar"
                            aria-label={`Editar ${e.titulo}`}
                            onClick={() => onEditar(e)}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                        </button>
                        <button
                            type="button"
                            className="inicio-admin-btn peligro"
                            title="Eliminar"
                            aria-label={`Eliminar ${e.titulo}`}
                            onClick={() => onEliminar(e)}
                        >
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M3 6h18" />
                                <path d="M8 6V4h8v2" />
                                <path d="M19 6l-1 14H6L5 6" />
                                <path d="M10 11v6M14 11v6" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* IMAGEN: con la etiqueta del tipo de hito y la versión. */}
                <div className={`historia-media historia-media--${e.ajuste === 'foto' ? 'foto' : 'pixel'}`}>
                    <ImagenEvento src={e.imagen} alt={e.titulo} />
                    <span className="historia-chip" data-tipo={e.tipo}>{e.tipo}</span>
                    {e.version && <span className="historia-version">{e.version}</span>}
                </div>

                {/* TEXTO: fecha, título, descripción y puntos clave desplegables. */}
                <div className="historia-card-cuerpo">
                    <div className="historia-card-meta">
                        <time dateTime={e.fecha}>{e.fechaTexto}</time>
                        {e.destacada && <span className="historia-estrella">★ Hito clave</span>}
                    </div>
                    <h3>{e.titulo}</h3>
                    <p>{e.descripcion}</p>

                    {e.puntos?.length > 0 && (
                        <>
                            <div className="historia-detalle" id={`detalle-${e.id}`} data-abierto={abierto}>
                                <ul>
                                    {e.puntos.map((punto, i) => <li key={i}>{punto}</li>)}
                                </ul>
                            </div>
                            <button
                                type="button"
                                className="inicio-enlace historia-mas"
                                aria-expanded={abierto}
                                aria-controls={`detalle-${e.id}`}
                                onClick={() => onToggle(e.id)}
                            >
                                {abierto ? 'Ver menos' : 'Ver detalles'} <i aria-hidden="true">↓</i>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

export default TarjetaEvento;