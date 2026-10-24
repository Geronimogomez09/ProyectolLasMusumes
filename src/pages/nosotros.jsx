import { useState } from "react";
import Header from "../components/header";
import Footer from "../components/Footer";
import avatar from "../assets/index/avatar.png";
import comunidad from "../assets/index/comunidad.png";
import musica from "../assets/index/musica.png";
import tutoriales from "../assets/index/tutoriales.png";
import "../styles/nosotros.css";

const integrantes = [
    {
        numero: "01",
        nombre: "Nombre del integrante",
        rol: "Desarrollo",
        imagen: avatar,
        alt: "Avatar pixelado de Minecraft",
        descripcion: "Acá podés contar quién es, qué aporta al proyecto y qué parte de Wiki-Craft disfruta crear.",
    },
    {
        numero: "02",
        nombre: "Nombre del integrante",
        rol: "Comunidad",
        imagen: comunidad,
        alt: "Ilustración de la comunidad de Minecraft",
        descripcion: "Un espacio para presentar a quien acompaña a la comunidad y ayuda a que todos tengan un lugar.",
    },
    {
        numero: "03",
        nombre: "Nombre del integrante",
        rol: "Contenido",
        imagen: tutoriales,
        alt: "Ilustración de una aventura de Minecraft",
        descripcion: "Contanos quién prepara las guías, ideas y recursos que ayudan a explorar cada rincón del juego.",
    },
    {
        numero: "04",
        nombre: "Nombre del integrante",
        rol: "Creatividad",
        imagen: musica,
        alt: "Ilustración de Minecraft relacionada con la música",
        descripcion: "Presentá a quien suma nuevas ideas y le da personalidad a las experiencias del sitio.",
    },
];

const pautas = [
    {
        titulo: "Buena convivencia",
        texto: "Tratemos a todas las personas con respeto. No se permiten insultos, acoso, amenazas ni discriminación.",
    },
    {
        titulo: "Contenido apropiado",
        texto: "Compartí material relacionado con Minecraft y Wiki-Craft. Evitá publicaciones explícitas, engañosas o que puedan perjudicar a otros.",
    },
    {
        titulo: "Cuidá tu privacidad",
        texto: "No publiques contraseñas, datos personales ni información privada propia o de otras personas.",
    },
    {
        titulo: "Uso responsable",
        texto: "No hagas spam, no suplantes identidades y respetá los derechos de autor al compartir creaciones y recursos.",
    },
];

function Nosotros() {
    const [estadoFormulario, setEstadoFormulario] = useState("");

    function enviarFormulario(evento) {
        evento.preventDefault();
        setEstadoFormulario(
            "El formulario todavía no está conectado a un servicio de envío; tu mensaje no fue enviado."
        );
    }

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
                        <a className="nosotros-boton" href="#contacto">
                            Hablemos <span aria-hidden="true">↓</span>
                        </a>
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
                                    <button className="nosotros-boton" type="submit">
                                        Enviar mensaje <span aria-hidden="true">→</span>
                                    </button>
                                    <p className="contacto-nota" aria-live="polite">
                                        {estadoFormulario || "Estamos preparando este canal de contacto."}
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
                                <div className="col-12 col-md-6" key={pauta.titulo}>
                                    <article className="pauta-tarjeta">
                                        <span className="pauta-numero" aria-hidden="true">
                                            0{indice + 1}
                                        </span>
                                        <div>
                                            <h3>{pauta.titulo}</h3>
                                            <p>{pauta.texto}</p>
                                        </div>
                                    </article>
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
                                            <img src={integrante.imagen} alt={integrante.alt} loading="lazy" />
                                            <span>{integrante.numero}</span>
                                        </div>
                                        <div className="integrante-contenido">
                                            <p className="integrante-rol">{integrante.rol}</p>
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
        </div>
    );
}

export default Nosotros;
