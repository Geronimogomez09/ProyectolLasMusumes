import { BotonAgregarInicio, useEdicionInicio } from "./EdicionInicio";
import TarjetaNovedad from "./TarjetaNovedad";

export default function NovedadesInicio({ novedades, cargando }) {
    const { editando } = useEdicionInicio();

    const novedadesVisibles = novedades.filter(
        (novedad) => editando || novedad.activo !== false
    );

    return (
        <section className="inicio-seccion">
            <div className="inicio-titulo-fila">
                <h2 className="inicio-titulo">
                    <span></span>
                    Novedades de la comunidad
                </h2>

                <span className="inicio-ver-todo text-muted">
                    Gestión Firestore
                </span>
            </div>

            {cargando && <p className="inicio-vacio">Cargando novedades...</p>}

            {!cargando && novedadesVisibles.length === 0 && !editando && (
                <p className="inicio-vacio">Todavía no hay novedades para mostrar.</p>
            )}

            <div className="row g-3">
                {novedadesVisibles.map((novedad) => (
                    <div
                        className={`col-12 col-md-6 col-lg-4 ${novedad.activo === false ? 'opacity-50 border border-warning' : ''}`}
                        key={novedad.id}
                    >
                        <TarjetaNovedad novedad={novedad} />
                    </div>
                ))}

                <BotonAgregarInicio
                    tipo="novedad"
                    texto="Agregar novedad"
                    columna="col-12 col-md-6 col-lg-4"
                />
            </div>
        </section>
    );
}