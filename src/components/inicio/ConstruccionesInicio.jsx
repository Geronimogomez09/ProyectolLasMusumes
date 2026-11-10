import {
    BotonAgregarInicio,
    ControlesAdminInicio,
    EnlaceInicio,
    useEdicionInicio,
} from "./EdicionInicio";
import { Imagen } from "./imagenesInicio";

// Índice: Construcciones destacadas.
// ----------------- Construcciones destacadas -----------------
// Recibe la lista de construcciones que se mostrarán en el inicio. Presenta sus imágenes y nombres y, cuando corresponde, las opciones de administración.

// CONSTRUCCIONES INICIO: bloque "Conocé las construcciones" del inicio. Muestra una miniatura
// por cada construcción guardada en Firestore (imagen y nombre al pasar el cursor).
// En modo administrador agrega editar, eliminar y el botón "Agregar".
// Recibe: construcciones (lista de documentos con tipo "construccion").
export default function ConstruccionesInicio({ construcciones }) {
    const { editando } = useEdicionInicio();

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

            {/* Mensaje cuando no hay construcciones y no se está editando. */}
            {construcciones.length === 0 && !editando && (
                <p className="inicio-vacio">
                    Todavía no hay construcciones para mostrar.
                </p>
            )}

            <div className="row g-2">
                {construcciones.map((construccion) => (
                    <div className="col-4" key={construccion.id}>
                        <div className="inicio-construccion-item">
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
