import { BotonAgregarInicio, useEdicionInicio } from "./EdicionInicio";
import TarjetaSeccion from "./TarjetaSeccion";

export default function SeccionesInicio({ secciones }) {
    const { editando } = useEdicionInicio();

    const seccionesVisibles = secciones.filter(
        (seccion) => editando || seccion.activo !== false
    );

    if (!editando && seccionesVisibles.length === 0) return null;

    return (
        <section className="inicio-seccion">
            <h2 className="inicio-titulo">
                <span></span>
                Explorá Wiki-Craft
            </h2>

            <div className="row g-3">
                {seccionesVisibles.map((seccion) => (
                    <div
                        className={`col-12 col-md-6 col-lg-4 ${seccion.activo === false ? 'opacity-50 border border-warning' : ''}`}
                        key={seccion.id}
                    >
                        <TarjetaSeccion seccion={seccion} />
                    </div>
                ))}

                <BotonAgregarInicio
                    tipo="seccion"
                    texto="Agregar sección"
                    columna="col-12 col-md-6 col-lg-4"
                />
            </div>
        </section>
    );
}