import TarjetaEvento from './TarjetaEvento';

// Índice: Secci?n de era histórica.
// ----------------- Secci?n de era histórica -----------------
// Recibe los datos y eventos de una era junto con las acciones de administración. Presenta el contenido de ese periodo y conecta sus eventos con la vista de historia.

// ERA HISTORIA: bloque de una era dentro de la línea de tiempo. Muestra la tarjeta grande de la
// era (número, rango de años, nombre y descripción), todos los hitos de esa era (TarjetaEvento) y,
// en modo administrador, el botón "Agregar hito" de esa era.
// Recibe: grupo ({ era, eventos }), numero, indicePorId, indiceActivo, abiertos, modoAdmin,
// onToggle, onEditar, onEliminar, onAgregar. Se usa en historia.jsx.
function EraHistoria({
    grupo,
    numero,
    indicePorId,
    indiceActivo,
    abiertos,
    modoAdmin,
    onToggle,
    onEditar,
    onEliminar,
    onAgregar,
}) {
    const { era, eventos } = grupo;

    return (
        <section aria-labelledby={`titulo-${era.id}`}>
            {/* TARJETA DE ERA: encabezado de la era. */}
            <div id={`era-${era.id}`} className="historia-era historia-revelar" data-era={era.id}>
                <div className="historia-fecha historia-fecha--era">Era {numero}</div>
                <div className="historia-nodo historia-nodo--era" aria-hidden="true"><b>{numero}</b></div>
                <div className="historia-era-card">
                    <img
                        src={era.textura}
                        alt=""
                        loading="lazy"
                        onError={(ev) => { ev.currentTarget.style.display = 'none'; }}
                    />
                    <div>
                        <span className="inicio-etiqueta">{era.rango}</span>
                        <h2 className="inicio-titulo" id={`titulo-${era.id}`}>
                            <span />
                            {era.nombre}
                        </h2>
                        <p>{era.descripcion}</p>
                    </div>
                </div>
            </div>

            {/* HITOS DE LA ERA: el año solo se muestra en el primer hito de cada año. */}
            {eventos.map((ev, i) => {
                const idx = indicePorId.get(ev.id);
                const estado = idx < indiceActivo ? 'pasado' : idx === indiceActivo ? 'activo' : 'futuro';
                return (
                    <TarjetaEvento
                        key={ev.id}
                        evento={ev}
                        mostrarAnio={i === 0 || eventos[i - 1].fecha.slice(0, 4) !== ev.fecha.slice(0, 4)}
                        estado={estado}
                        modoAdmin={modoAdmin}
                        abierto={Boolean(abiertos[ev.id])}
                        onToggle={onToggle}
                        onEditar={onEditar}
                        onEliminar={onEliminar}
                    />
                );
            })}

            {/* BOTÓN AGREGAR HITO: solo en modo administrador. */}
            {modoAdmin && (
                <div className="historia-evento historia-evento--agregar">
                    <div className="historia-nodo" aria-hidden="true"><i /></div>
                    <button
                        type="button"
                        className="inicio-admin-agregar compacto"
                        onClick={() => onAgregar(era.id)}
                    >
                        <i aria-hidden="true">+</i>
                        Agregar hito a «{era.nombre}»
                    </button>
                </div>
            )}
        </section>
    );
}

export default EraHistoria;