// Índice: Navegaci?n por la línea de tiempo.
// ----------------- Navegaci?n por la línea de tiempo -----------------
// Recibe los grupos de eras, la zona e ?ndices activos y las acciones para saltar a una era o evento. Devuelve controles que sincronizan la selección con la línea de tiempo.

// ASIDE LINEA: panel lateral de la página Historia. Muestra en qué era y en qué hito está la
// persona ("Estás en"), el porcentaje de avance, la lista de eras (con los hitos de la era
// actual desplegados) y el botón "Volver arriba". Cada era y cada hito se puede tocar para
// ir hasta él.
// Recibe: grupos, zona, indiceActivo, indicePorId, pctRef, onIrEra, onIrEvento.
// Se usa en historia.jsx.
function AsideLinea({ grupos, zona, indiceActivo, indicePorId, pctRef, onIrEra, onIrEvento }) {
    // Datos de la zona actual: posición de la era activa y el hito activo.
    const idxEra = grupos.findIndex((g) => g.era.id === zona.era);
    const eraActiva = idxEra >= 0 ? grupos[idxEra] : null;
    const eventoActivo = grupos.flatMap((g) => g.eventos).find((e) => e.id === zona.evento);

    return (
        <aside className="historia-aside" aria-label="Línea de tiempo">
            <div className="historia-aside-panel">
                <p className="historia-aside-etiqueta">Estás en</p>

                {/* ZONA ACTUAL: con key, al cambiar de era el bloque se vuelve a montar y repite su entrada. */}
                <div className="historia-aside-zona" key={eraActiva ? eraActiva.era.id : 'inicio'}>
                    <strong>{eraActiva ? eraActiva.era.nombre : 'El comienzo del viaje'}</strong>
                    <span>
                        {eventoActivo
                            ? `${eventoActivo.fecha.slice(0, 4)} · ${eventoActivo.titulo}`
                            : eraActiva ? eraActiva.era.rango : '2009 – hoy'}
                    </span>
                </div>

                {/* PROGRESO: barra y porcentaje. El número lo escribe historia.jsx con pctRef. */}
                <div className="historia-aside-progreso">
                    <div className="historia-aside-barra" role="presentation"><span /></div>
                    <em ref={pctRef}>0%</em>
                </div>

                {/* LISTA DE ERAS Y HITOS */}
                <nav className="historia-aside-nav" aria-label="Eras y hitos">
                    <ol className="historia-aside-eras">
                        {grupos.map((g, gi) => {
                            const estadoEra = gi < idxEra ? 'pasada' : gi === idxEra ? 'activa' : 'futura';
                            return (
                                <li key={g.era.id} data-estado={estadoEra}>
                                    <button
                                        type="button"
                                        className="historia-aside-era"
                                        aria-current={estadoEra === 'activa' ? 'true' : undefined}
                                        onClick={() => onIrEra(g.era.id)}
                                    >
                                        <span className="historia-aside-num">{gi + 1}</span>
                                        <span className="historia-aside-era-texto">
                                            <b>{g.era.nombre}</b>
                                            <small>{g.era.rango}</small>
                                        </span>
                                    </button>

                                    {/* Solo la era activa despliega sus hitos. */}
                                    <div className="historia-aside-sub" data-abierto={estadoEra === 'activa'}>
                                        <ol className="historia-aside-eventos">
                                            {g.eventos.map((ev) => {
                                                const idx = indicePorId.get(ev.id);
                                                const estado = idx < indiceActivo ? 'pasado' : idx === indiceActivo ? 'activo' : 'futuro';
                                                return (
                                                    <li key={ev.id}>
                                                        <button
                                                            type="button"
                                                            className="historia-aside-ev"
                                                            data-estado={estado}
                                                            aria-current={estado === 'activo' ? 'location' : undefined}
                                                            onClick={() => onIrEvento(ev.id)}
                                                        >
                                                            <span className="historia-aside-punto" />
                                                            <span className="historia-aside-anio">{ev.fecha.slice(0, 4)}</span>
                                                            <span className="historia-aside-titulo">{ev.titulo}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {/* BOTÓN VOLVER ARRIBA: sube al inicio de la página. */}
                <button
                    type="button"
                    className="inicio-enlace historia-aside-arriba"
                    onClick={() => {
                        const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                        window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
                    }}
                >
                    Volver arriba <i aria-hidden="true">↑</i>
                </button>
            </div>
        </aside>
    );
}

export default AsideLinea;