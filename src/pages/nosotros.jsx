import { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import Footer from "../components/Footer";
import integrante01 from "../assets/index/integrante-01.png";
import integrante02 from "../assets/index/integrante-02.png";
import integrante03 from "../assets/index/integrante-03.png";
import integrante04 from "../assets/index/integrante-04.png";
import convivenciaIcono from "../assets/iconos/heart.png";
import contenidoIcono from "../assets/iconos/knowledge_book.png";
import privacidadIcono from "../assets/iconos/ender_chest.png";
import responsabilidadIcono from "../assets/iconos/brush.png";
import "../styles/nosotros.css";

// Índice: equipo del proyecto; pautas de comunidad; formulario de contacto; modales informativos.
// ----------------- Equipo y pautas de la comunidad -----------------
// Estos datos alimentan las tarjetas informativas; el componente también controla el formulario de contacto.
const integrantes = [
    {
        numero: "01",
        nombre: "Ana Vera",
        rol: "Desarrollo",
        imagen: integrante01,
        alt: "Personaje de Minecraft con pelo castaño y ropa oscura",
        descripcion: "Ana creó la página de Música, la sección más completa del sitio: reúne álbumes, canciones y artistas para descubrir y disfrutar el universo musical de Minecraft.",
    },
    {
        numero: "02",
        nombre: "Geronimo Gomez",
        rol: "Comunidad",
        imagen: integrante02,
        alt: "Personaje de Minecraft con uniforme negro y azul",
        descripcion: "Geronimo desarrolló la página de Comunidad y ayuda a que todos encuentren su lugar para compartir. También se encarga de organizar y mantener las ramas del proyecto.",
    },
    {
        numero: "03",
        nombre: "Ivan Barrera",
        rol: "Contenido",
        imagen: integrante03,
        alt: "Personaje de Minecraft vestido de negro",
        descripcion: "Ivan creó las páginas Principal e Historia, y está muy comprometido con acompañar a los usuarios para que tengan una buena experiencia en Wiki-Craft.",
    },
    {
        numero: "04",
        nombre: "Juan Sada",
        rol: "Creatividad",
        imagen: integrante04,
        alt: "Personaje de Minecraft con campera gris",
        descripcion: "Juan creó la página Nosotros y está a cargo de la Tienda, donde administra los productos para mantener el catálogo organizado y actualizado.",
    },
];

const pautas = [
    {
        titulo: "Buena convivencia",
        texto: "Tratemos a todas las personas con respeto. No se permiten insultos, acoso, amenazas ni discriminación.",
        detalles: [
            "Debatí ideas sin atacar a quien piensa distinto. Los insultos, las amenazas y el acoso no tienen lugar en la comunidad.",
            "No publiques contenido discriminatorio ni persigas a otras personas dentro o fuera del sitio.",
            "Si una conversación se pone tensa, tomá distancia y usá las herramientas de reporte para pedir ayuda al equipo.",
        ],
        icono: convivenciaIcono,
        iconoAlt: "Corazón de Minecraft",
    },
    {
        titulo: "Contenido apropiado",
        texto: "Compartí material relacionado con Minecraft y Wiki-Craft. Evitá publicaciones explícitas, engañosas o que puedan perjudicar a otros.",
        detalles: [
            "Compartí construcciones, guías, ideas y conversaciones relacionadas con Minecraft y la comunidad.",
            "No publiques contenido explícito, violento, engañoso, spam o enlaces que puedan poner en riesgo a otras personas.",
            "Antes de publicar una imagen o un enlace, revisá que sea apropiado para la comunidad y que la descripción sea clara.",
        ],
        icono: contenidoIcono,
        iconoAlt: "Libro del conocimiento de Minecraft",
    },
    {
        titulo: "Cuidá tu privacidad",
        texto: "No publiques contraseñas, datos personales ni información privada propia o de otras personas.",
        detalles: [
            "Nunca compartas contraseñas, códigos de acceso, direcciones, teléfonos ni datos de pago.",
            "Pedí permiso antes de publicar fotos, mensajes privados o información que identifique a otra persona.",
            "Desconfiá de quien te pida credenciales o te prometa recompensas a cambio de información personal; avisá al equipo si ocurre.",
        ],
        icono: privacidadIcono,
        iconoAlt: "Cofre de Ender de Minecraft",
    },
    {
        titulo: "Uso responsable",
        texto: "No hagas spam, no suplantes identidades y respetá los derechos de autor al compartir creaciones y recursos.",
        detalles: [
            "Publicá cada aporte en el espacio correspondiente y evitá repetir mensajes, promocionar contenido sin permiso o llenar las conversaciones de enlaces.",
            "No te hagas pasar por otra persona, por el equipo del sitio ni por una marca o creador.",
            "Compartí solo contenido propio o que tengas permiso para usar, y reconocé a su autor cuando corresponda.",
        ],
        icono: responsabilidadIcono,
        iconoAlt: "Pincel de Minecraft",
    },
];

function Nosotros() {
    const [estadoFormulario, setEstadoFormulario] = useState("");
    const [enviandoFormulario, setEnviandoFormulario] = useState(false);
    const [mensajeEnviado, setMensajeEnviado] = useState(false);
    const [integranteSeleccionado, setIntegranteSeleccionado] = useState(null);
    const imagenActivadora = useRef(null);
    const botonCerrarImagen = useRef(null);
    const botonConfirmarEnvio = useRef(null);
    const botonEnviarFormulario = useRef(null);

    useEffect(() => {
        if (!integranteSeleccionado) return undefined;

        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        botonCerrarImagen.current?.focus();

        function cerrarConEscape(evento) {
            if (evento.key === "Escape") {
                setIntegranteSeleccionado(null);
            }
        }

        document.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.body.style.overflow = overflowAnterior;
            document.removeEventListener("keydown", cerrarConEscape);
            imagenActivadora.current?.focus();
        };
    }, [integranteSeleccionado]);

    useEffect(() => {
        if (!mensajeEnviado) return undefined;

        const overflowAnterior = document.body.style.overflow;
        const botonFormulario = botonEnviarFormulario.current;
        document.body.style.overflow = "hidden";
        botonConfirmarEnvio.current?.focus();

        function cerrarConEscape(evento) {
            if (evento.key === "Escape") {
                setMensajeEnviado(false);
            }
        }

        document.addEventListener("keydown", cerrarConEscape);

        return () => {
            document.body.style.overflow = overflowAnterior;
            document.removeEventListener("keydown", cerrarConEscape);
            botonFormulario?.focus();
        };
    }, [mensajeEnviado]);

    // ----------------- Envío del formulario de contacto -----------------
    // Recibe los campos del formulario, los envía al servicio de contacto y actualiza el mensaje de resultado.
    async function enviarFormulario(evento) {
        evento.preventDefault();
        setEnviandoFormulario(true);
        setEstadoFormulario("Enviando tu mensaje...");

        const elementoFormulario = evento.currentTarget;
        const formulario = new FormData(elementoFormulario);
        const email = formulario.get("email");

        try {
            const respuesta = await fetch("https://formsubmit.co/ajax/sadajuanignacio123@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    _from: "WIKI-CRAFT",
                    _replyto: email,
                    _subject: `Nuevo mensaje de contacto - WIKI-CRAFT`,
                    _template: "basic",
                    Mensaje: [
                        "Nuevo mensaje de contacto - WIKI-CRAFT",
                        "",
                        `Nombre: ${formulario.get("nombre")}`,
                        `Correo electrónico: ${email}`,
                        `Asunto: ${formulario.get("asunto")}`,
                        "",
                        "Mensaje:",
                        formulario.get("mensaje"),
                    ].join("\n"),
                }),
            });
            const resultado = await respuesta.json();

            if (!respuesta.ok || !["true", true].includes(resultado.success)) {
                throw new Error(resultado.message || "El servicio rechazó el envío.");
            }

            elementoFormulario.reset();
            setEstadoFormulario("¡Mensaje enviado! Gracias por escribirnos.");
            setMensajeEnviado(true);
        } catch (error) {
            console.error("No se pudo enviar el formulario de contacto:", error);
            setEstadoFormulario(
                "No pudimos enviar tu mensaje. Revisá tu conexión e intentá nuevamente."
            );
        } finally {
            setEnviandoFormulario(false);
        }
    }

    // ----------------- Equipo, pautas y contacto -----------------
    // La interfaz presenta el contenido informativo y los modales de detalle y confirmación de envío.
    return (
        <div className="nosotros-page" id="top">
            <Header />

            <main>
                <section className="nosotros-hero" aria-labelledby="nosotros-titulo">
                    <div className="container nosotros-hero-contenido">
                        <p className="nosotros-etiqueta">Wiki-Craft · Un proyecto en comunidad</p>
                        <h1 id="nosotros-titulo">Nos conocemos jugando</h1>
                        <p className="nosotros-hero-texto">
                            Este espacio es para compartir ideas, resolver dudas y construir juntos
                            un rincón para quienes disfrutan Minecraft.
                        </p>
                        <div className="nosotros-hero-acciones">
                            <a className="nosotros-boton" href="#contacto">
                                Hablemos <span aria-hidden="true">→</span>
                            </a>
                            <a className="nosotros-boton nosotros-boton-secundario" href="#equipo">
                                Conocenos <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </section>

                <section className="nosotros-seccion nosotros-contacto" id="contacto" aria-labelledby="contacto-titulo">
                    <div className="container">
                        <div className="nosotros-encabezado">
                            <p className="nosotros-etiqueta">Nos encanta leerte</p>
                            <h2 id="contacto-titulo">Contactanos</h2>
                            <p>
                                ¿Tenés una consulta, una idea o algo para compartir? Dejanos tu
                                mensaje y contanos cómo podemos ayudarte.
                            </p>
                        </div>

                        <form className="contacto-formulario" onSubmit={enviarFormulario}>
                            <div className="row g-4">
                                <div className="col-12 col-md-6">
                                    <label htmlFor="contacto-nombre">Tu nombre</label>
                                    <input
                                        id="contacto-nombre"
                                        name="nombre"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="¿Cómo te llamás?"
                                        required
                                    />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label htmlFor="contacto-email">Tu correo electrónico</label>
                                    <input
                                        id="contacto-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="nombre@ejemplo.com"
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <label htmlFor="contacto-asunto">Asunto</label>
                                    <input
                                        id="contacto-asunto"
                                        name="asunto"
                                        type="text"
                                        placeholder="¿Sobre qué querés hablar?"
                                        required
                                    />
                                </div>
                                <div className="col-12">
                                    <label htmlFor="contacto-mensaje">Tu mensaje</label>
                                    <textarea
                                        id="contacto-mensaje"
                                        name="mensaje"
                                        rows="5"
                                        placeholder="Escribinos con un poco más de detalle..."
                                        required
                                    />
                                </div>
                                <div className="col-12 contacto-acciones">
                                    <button
                                        ref={botonEnviarFormulario}
                                        className="nosotros-boton"
                                        type="submit"
                                        disabled={enviandoFormulario}
                                    >
                                        {enviandoFormulario ? "Enviando..." : "Enviar mensaje"} <span aria-hidden="true">→</span>
                                    </button>
                                    <p className="contacto-nota" aria-live="polite">
                                        {estadoFormulario || "Tu mensaje será enviado a las oficinas de WIKI-CRAFT."}
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </section>

                <section className="nosotros-seccion nosotros-pautas" id="pautas" aria-labelledby="pautas-titulo">
                    <div className="container">
                        <div className="nosotros-encabezado">
                            <p className="nosotros-etiqueta">Entre todos hacemos la diferencia</p>
                            <h2 id="pautas-titulo">Pautas y políticas</h2>
                            <p>
                                Queremos que Wiki-Craft sea un lugar amable, útil y seguro para
                                toda la comunidad. Estas pautas aplican a las interacciones en el sitio.
                            </p>
                        </div>

                        <div className="row g-3 g-lg-4">
                            {pautas.map((pauta, indice) => (
                                <div className="col-12" key={pauta.titulo}>
                                    <details className="pauta-tarjeta">
                                        <summary className="pauta-resumen">
                                            <span className="pauta-numero" aria-hidden="true">
                                                0{indice + 1}
                                            </span>
                                            <img className="pauta-icono" src={pauta.icono} alt={pauta.iconoAlt} />
                                            <span className="pauta-titulo">{pauta.titulo}</span>
                                            <span className="pauta-desplegar" aria-hidden="true">+</span>
                                        </summary>
                                        <div className="pauta-contenido">
                                            <p className="pauta-introduccion">{pauta.texto}</p>
                                            <ul>
                                                {pauta.detalles.map((detalle) => (
                                                    <li key={detalle}>{detalle}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                        <p className="pautas-cierre">
                            Al participar, ayudás a mantener un entorno respetuoso. El contenido
                            que infrinja estas pautas podrá ser revisado y moderado.
                        </p>
                    </div>
                </section>

                <section className="nosotros-seccion nosotros-equipo" id="equipo" aria-labelledby="equipo-titulo">
                    <div className="container">
                        <div className="nosotros-encabezado">
                            <p className="nosotros-etiqueta">Las personas detrás del proyecto</p>
                            <h2 id="equipo-titulo">Nosotros</h2>
                            <p>
                                Somos un equipo que trabaja para acercar la comunidad y todo lo
                                que hace especial al universo de Minecraft.
                            </p>
                        </div>

                        <div className="row g-4">
                            {integrantes.map((integrante) => (
                                <div className="col-12 col-sm-6 col-xl-3" key={integrante.numero}>
                                    <article className="integrante-tarjeta">
                                        <div className="integrante-imagen">
                                            <button
                                                className="integrante-imagen-boton"
                                                type="button"
                                                aria-label={`Ver imagen completa de ${integrante.nombre}`}
                                                onClick={(evento) => {
                                                    imagenActivadora.current = evento.currentTarget;
                                                    setIntegranteSeleccionado(integrante);
                                                }}
                                            >
                                                <img src={integrante.imagen} alt={integrante.alt} loading="lazy" />
                                            </button>
                                            <span>{integrante.numero}</span>
                                        </div>
                                        <div className="integrante-contenido">
                                            <p className="integrante-rol">WIKI-CRAFT</p>
                                            <h3>{integrante.nombre}</h3>
                                            <p>{integrante.descripcion}</p>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            {mensajeEnviado && (
                <div
                    className="contacto-exito-overlay"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="contacto-exito-titulo"
                >
                    <div className="contacto-exito-contenido">
                        <span className="contacto-exito-tilde" aria-hidden="true">✓</span>
                        <h2 id="contacto-exito-titulo">¡Mensaje enviado correctamente!</h2>
                        <p>Gracias por escribirnos. El equipo de WIKI-CRAFT recibió tu mensaje.</p>
                        <button
                            ref={botonConfirmarEnvio}
                            className="nosotros-boton"
                            type="button"
                            onClick={() => setMensajeEnviado(false)}
                        >
                            Volver a la página
                        </button>
                    </div>
                </div>
            )}

            {integranteSeleccionado && (
                <div
                    className="integrante-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Imagen completa de ${integranteSeleccionado.nombre}`}
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            setIntegranteSeleccionado(null);
                        }
                    }}
                >
                    <button
                        ref={botonCerrarImagen}
                        className="integrante-lightbox-cerrar"
                        type="button"
                        aria-label="Cerrar imagen"
                        onClick={() => setIntegranteSeleccionado(null)}
                    >
                        ×
                    </button>
                    <img
                        src={integranteSeleccionado.imagen}
                        alt={integranteSeleccionado.alt}
                    />
                    <p>{integranteSeleccionado.nombre}</p>
                </div>
            )}
        </div>
    );
}

export default Nosotros;
