import { BotonAgregarInicio, useEdicionInicio } from "./EdicionInicio";
import TarjetaSeccion from "./TarjetaSeccion";

// Índice: Secciones del inicio.
// ----------------- Secciones del inicio -----------------
// Recibe las secciones que deben aparecer en la página principal. Las organiza en enlaces para que la persona pueda abrir cada ?rea del sitio.

// SECCIONES INICIO: bloque "Explorá Wiki-Craft" del inicio. Muestra una TarjetaSeccion
// por cada sección guardada en Firestore. En modo administrador agrega el botón "Agregar sección".
// Si no hay secciones y no se está editando, no muestra nada.
// Recibe: secciones (lista de documentos con tipo "seccion").
export default function SeccionesInicio({ secciones }) {
    const { editando } = useEdicionInicio();

    if (!editando && secciones.length === 0) return null;

    return (
        <section className="inicio-seccion">
            <h2 className="inicio-titulo">
                <span></span>
                Explorá Wiki-Craft
            </h2>

            <div className="row g-3">
                {secciones.map((seccion) => (
                    <div className="col-12 col-md-6 col-lg-4" key={seccion.id}>
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
