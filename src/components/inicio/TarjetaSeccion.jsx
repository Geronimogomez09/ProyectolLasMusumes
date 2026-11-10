import { ControlesAdminInicio, EnlaceInicio } from "./EdicionInicio";
import { Icono, Imagen } from "./imagenesInicio";

// Índice: Tarjeta de sección.
// ----------------- Tarjeta de sección -----------------
// Recibe una sección y presenta su título e información visual como acceso a esa parte del sitio.

// TARJETA SECCION INICIO: muestra una sección dentro de "Explorá Wiki-Craft"
// (imagen, icono, título, descripción y enlace "Descubrir").
// En modo administrador muestra los botones de editar y eliminar.
// Recibe: seccion (documento de la colección "inicio" con tipo "seccion").
export default function TarjetaSeccion({ seccion }) {
    return (
        <article className="card inicio-card-seccion h-100">

            {/* Botones de editar y eliminar (solo en modo administrador). */}
            <ControlesAdminInicio tipo="seccion" item={seccion} />

            {/* Imagen de la sección: también es un enlace. */}
            <EnlaceInicio
                to={seccion.enlace}
                className="inicio-imagen-link"
                aria-label={`Explorar ${seccion.titulo}`}
            >
                <Imagen nombre={seccion.imagen} className="inicio-card-imagen" />
            </EnlaceInicio>

            <div className="card-body">

                {/* Icono y título. */}
                <div className="seccion-titulo d-flex">
                    <div className="d-flex icono-container">
                        <Icono nombre={seccion.icono} className="inicio-icono" />
                    </div>

                    <h3>{seccion.titulo}</h3>
                </div>

                <p>{seccion.descripcion}</p>

                <EnlaceInicio to={seccion.enlace} className="inicio-enlace">
                    Descubrir
                    <i className="bi bi-arrow-right ms-2"></i>
                </EnlaceInicio>
            </div>
        </article>
    );
}
