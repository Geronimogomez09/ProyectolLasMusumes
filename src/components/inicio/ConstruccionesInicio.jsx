import { BotonAgregarInicio, useEdicionInicio } from "./EdicionInicio";
import { ControlesAdminInicio, EnlaceInicio } from "./EdicionInicio";
import { Imagen } from "./imagenesInicio";

export default function ConstruccionesInicio({ construcciones }) {
    const { editando } = useEdicionInicio();

    const construccionesVisibles = construcciones.filter(
        (c) => editando || c.activo !== false
    );

    return (
        <section className="inicio-construcciones h-100">
            <div className="inicio-titulo-fila">
                <h2 className="inicio-titulo">
                    <span></span>
                    Conocé las construcciones
                </h2>

                <EnlaceInicio to="/comunidad" className="inicio-ver-todo">
                    Ver más
                    <i className="bi bi-arrow-right ms-1"></i>
                </EnlaceInicio>
            </div>

            {construccionesVisibles.length === 0 && !editando && (
                <p className="inicio-vacio">
                    Todavía no hay construcciones para mostrar.
                </p>
            )}

            <div className="row g-2">
                {construccionesVisibles.map((construccion) => (
                    <div
                        className={`col-4 ${construccion.activo === false ? 'opacity-50 border border-warning' : ''}`}
                        key={construccion.id}
                    >
                        <div className="inicio-construccion-item position-relative">
                            <ControlesAdminInicio tipo="construccion" item={construccion} />

                            <EnlaceInicio
                                to="/comunidad"
                                className="inicio-construccion"
                                title={construccion.nombre}
                            >
                                <Imagen
                                    nombre={construccion.imagen}
                                    alt={construccion.nombre}
                                />
                                <span>{construccion.nombre}</span>
                            </EnlaceInicio>
                        </div>
                    </div>
                ))}

                <BotonAgregarInicio
                    tipo="construccion"
                    texto="Agregar"
                    columna="col-4"
                    compacto
                />
            </div>
        </section>
    );
}