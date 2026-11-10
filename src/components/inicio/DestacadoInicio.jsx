import { EnlaceInicio } from "./EdicionInicio";
import { Imagen } from "./imagenesInicio";

// Índice: Contenido destacado del inicio.
// ----------------- Contenido destacado del inicio -----------------
// No recibe propiedades; muestra el bloque destacado de la página principal con sus enlaces de navegación.

// DESTACADO INICIO: tarjeta "Destacado de la comunidad" (avatar, texto que invita a compartir
// construcciones y enlace "Ver publicaciones"). Es texto fijo, no se edita.
export default function DestacadoInicio() {
    return (
        <article className="inicio-publicacion h-100">
            <div className="inicio-avatar">
                <Imagen nombre="avatar.png" alt="Avatar de la comunidad" />
            </div>

            <div className="inicio-publicacion-contenido">
                <h3>Destacado de la comunidad</h3>

                <p>
                    ¿Terminaste una construcción increíble? Compartila
                    con otros jugadores y mostrá lo que podés crear.
                </p>

                <span className="inicio-publicacion-autor">
                    Comunidad Wiki-Craft
                </span>

                <EnlaceInicio to="/comunidad" className="inicio-enlace">
                    Ver publicaciones
                    <i className="bi bi-arrow-right ms-2"></i>
                </EnlaceInicio>
            </div>
        </article>
    );
}
