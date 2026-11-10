import { EnlaceInicio } from "./EdicionInicio";

// Índice: Portada de la página principal.
// ----------------- Portada de la página principal -----------------
// Recibe la imagen de fondo y presenta la portada del inicio. Sus enlaces llevan a las secciones principales del sitio.

// HERO INICIO: portada de la página de Inicio, con el título "Tu mundo. Tu aventura.",
// una frase y dos botones (Explorar el mundo y Unirme a la comunidad).
// Recibe: imagenFondo (URL de la imagen de fondo; si no hay, usa la del CSS).
export default function HeroInicio({ imagenFondo }) {
    return (
        <section
            className="inicio-hero"
            style={
                imagenFondo
                    ? { "--inicio-hero-imagen": `url("${imagenFondo}")` }
                    : undefined
            }
        >
            <div className="container inicio-hero-contenido">
                <div className="inicio-hero-texto">

                    {/* Etiqueta pequeña sobre el título. */}
                    <span className="inicio-etiqueta">
                        <i className="bi bi-tree-fill me-2"></i>
                        Una wiki hecha por jugadores
                    </span>

                    <h1>
                        Tu mundo. Tu aventura.
                        <span>Tu comunidad.</span>
                    </h1>

                    <p>
                        Descubrí Minecraft, explorá sus versiones y compartí
                        tus construcciones con otros jugadores.
                    </p>

                    {/* Botones hacia Versiones y Comunidad. */}
                    <div className="d-flex flex-wrap gap-3">
                        <EnlaceInicio to="/versiones" className="btn inicio-btn-principal">
                            <i className="bi bi-compass-fill me-2"></i>
                            Explorar el mundo
                            <i className="bi bi-arrow-right ms-2"></i>
                        </EnlaceInicio>

                        <EnlaceInicio to="/comunidad" className="btn inicio-btn-secundario">
                            <i className="bi bi-people-fill me-2"></i>
                            Unirme a la comunidad
                        </EnlaceInicio>
                    </div>
                </div>
            </div>
        </section>
    );
}
