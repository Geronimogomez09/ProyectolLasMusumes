import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/index.css";

/* Imágenes
   Vite solo procesa las imágenes que se importan, por eso un texto como
   "comunidad.png" o "../assets/index/castillo.jpg" no funciona como src.
   import.meta.glob importa todas las imágenes de la carpeta y las deja
   indexadas por nombre de archivo: IMAGENES["comunidad.png"] -> URL final.*/

const MODULOS_IMAGENES = import.meta.glob(
    "../assets/index/*.{png,jpg,jpeg,webp,svg}",
    { eager: true, import: "default" }
);

const IMAGENES = Object.fromEntries(
    Object.entries(MODULOS_IMAGENES).map(([ruta, url]) => [ruta.split("/").pop(), url])
);

// Imagen de reemplazo (cuadrícula verde pixelada) para cuando falta un archivo.
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20" shape-rendering="crispEdges">' +
    '<rect width="32" height="20" fill="#dcefdc"/>' +
    '<g fill="#1db53c" fill-opacity=".35">' +
    '<rect x="10" y="6" width="2" height="2"/><rect x="12" y="8" width="2" height="2"/>' +
    '<rect x="14" y="10" width="2" height="2"/><rect x="16" y="8" width="2" height="2"/>' +
    '<rect x="18" y="6" width="2" height="2"/><rect x="14" y="6" width="2" height="2"/>' +
    '</g></svg>'
)}`;

// Acepta un nombre de archivo ("granja.jpg"), una ruta vieja
// ("../assets/index/castillo.jpg") o una URL ya lista (blob:, data:, http, /public).
function obtenerImagen(valor) {
    if (!valor) return PLACEHOLDER;
    if (/^(blob:|data:|https?:\/\/|\/)/.test(valor)) return valor;

    const nombre = valor.split("/").pop();
    const url = IMAGENES[nombre];

    if (!url && import.meta.env.DEV) {
        console.warn(`[Inicio] No se encontró "${nombre}" en src/assets/index/`);
    }

    return url ?? PLACEHOLDER;
}

// Si una imagen falla al cargar, se reemplaza una sola vez por el placeholder.
function aPlaceholder(evento) {
    const img = evento.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = PLACEHOLDER;
}

function Imagen({ nombre, alt = "", ...resto }) {
    return (
        <img
            src={obtenerImagen(nombre)}
            alt={alt}
            loading="lazy"
            onError={aPlaceholder}
            {...resto}
        />
    );
}

// Imagen del hero: si existe en src/assets/index se usa; si no, el CSS usa su ruta de respaldo.
const HERO_URL = ["hero.jpg", "hero.jpeg", "hero.png", "hero.webp"]
    .map((nombre) => IMAGENES[nombre])
    .find(Boolean);

/*
   Contenido inicial
   Solo se guardan nombres de archivo en "imagen". */

const CONTENIDO_INICIAL = {
    secciones: [
        {
            id: "seccion-comunidad",
            titulo: "Comunidad",
            descripcion: "Conocé a otros jugadores, compartí tus ideas, mostrá tus construcciones y participá en eventos.",
            imagen: "comunidad.png",
            enlace: "/comunidad",
            icono: "bi-people-fill",
        },
        {
            id: "seccion-versiones",
            titulo: "Versiones",
            descripcion: "Reviví la historia de Minecraft, explorá cada versión y descubrí todo lo que cambió con el tiempo.",
            imagen: "versiones.jpg",
            enlace: "/versiones",
            icono: "bi-box-fill",
        },
        {
            id: "seccion-musica",
            titulo: "Música",
            descripcion: "Disfrutá de las mejores bandas sonoras, listas y música creada por la comunidad.",
            imagen: "musica.jpg",
            enlace: "/musica",
            icono: "bi-music-note-beamed",
        },
    ],
    novedades: [
        {
            id: "novedad-granja",
            categoria: "TUTORIALES",
            titulo: "Granja automática de aldeanos",
            fecha: "12 abr 2026",
            autor: "NovaBuild",
            descripcion: "Paso a paso para construir una granja de aldeanos eficiente y fácil de replicar.",
            imagen: "granja.jpg",
            enlace: "/comunidad",
        },
        {
            id: "novedad-version",
            categoria: "VERSIONES",
            titulo: "La versión que cambió todo",
            fecha: "8 abr 2026",
            autor: "ZetaCraft",
            descripcion: "Recordamos la actualización que transformó la forma de jugar Minecraft.",
            imagen: "version.jpg",
            enlace: "/versiones",
        },
        {
            id: "novedad-playlist",
            categoria: "MÚSICA",
            titulo: "Nueva playlist: sonidos del Overworld",
            fecha: "5 abr 2026",
            autor: "Luma",
            descripcion: "Una selección de los mejores temas del mundo principal, ideal para tus construcciones.",
            imagen: "playlist.jpg",
            enlace: "/musica",
        },
    ],
    construcciones: [
        { id: "construccion-castillo", nombre: "Castillo medieval", imagen: "castillo.jpg" },
        { id: "construccion-casa", nombre: "Casa moderna", imagen: "casa.jpg" },
        { id: "construccion-portal", nombre: "Portal del Nether", imagen: "portal.jpg" },
    ],
};

/*  Configuración del modo administrador
    Cada tipo define qué campos tiene el formulario y cómo se crea uno nuevo.   */

const ICONOS = [
    { valor: "", nombre: "Personas" },
    { valor: "", nombre: "Cubo" },
    { valor: "", nombre: "Música" },
    { valor: "", nombre: "Árbol" },
    { valor: "", nombre: "Brújula" },
    { valor: "", nombre: "Libro" },
    { valor: "", nombre: "Bolsa" },
    { valor: "", nombre: "Estrella" },
    { valor: "", nombre: "Gema" },
];

function fechaHoy() {
    return new Date()
        .toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
        .replace(/\./g, "");
}

const TIPOS = {
    seccion: {
        clave: "secciones",
        singular: "sección",
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            { nombre: "enlace", etiqueta: "Enlace", tipo: "texto", ayuda: "Ruta interna, por ejemplo /comunidad" },
            { nombre: "icono", etiqueta: "Icono", tipo: "icono" },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ titulo: "", descripcion: "", imagen: "", enlace: "/comunidad", icono: ICONOS[0].valor }),
        nombreDe: (item) => item.titulo,
    },
    novedad: {
        clave: "novedades",
        singular: "novedad",
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "categoria", etiqueta: "Categoría", tipo: "texto", ayuda: "Se muestra en mayúsculas" },
            { nombre: "autor", etiqueta: "Autor", tipo: "texto" },
            { nombre: "fecha", etiqueta: "Fecha", tipo: "texto" },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            { nombre: "enlace", etiqueta: "Enlace", tipo: "texto", ayuda: "Ruta interna, por ejemplo /comunidad" },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ categoria: "", titulo: "", fecha: fechaHoy(), autor: "", descripcion: "", imagen: "", enlace: "/comunidad" }),
        nombreDe: (item) => item.titulo,
    },
    construccion: {
        clave: "construcciones",
        singular: "construcción",
        campos: [
            { nombre: "nombre", etiqueta: "Nombre", tipo: "texto", requerido: true },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ nombre: "", imagen: "" }),
        nombreDe: (item) => item.nombre,
    },
};

function crearId(tipo) {
    return `${tipo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

// Deja los datos listos para guardar: sin espacios sobrantes y con enlace interno válido.
function limpiarDatos(tipo, datos) {
    const limpios = { ...datos };

    Object.keys(limpios).forEach((clave) => {
        if (typeof limpios[clave] === "string") limpios[clave] = limpios[clave].trim();
    });

    if ("enlace" in limpios) {
        limpios.enlace = `/${limpios.enlace.replace(/^\/+/, "")}`;
    }

    if (tipo === "novedad") {
        limpios.categoria = limpios.categoria.toUpperCase();
    }

    return limpios;
}

/* Piezas del modo administrador */

// Botones de editar y eliminar que aparecen sobre cada elemento.
function AccionesAdmin({ nombre, onEditar, onEliminar }) {
    return (
        <div className="inicio-admin-acciones">
            <button
                type="button"
                className="inicio-admin-btn"
                onClick={onEditar}
                aria-label={`Editar ${nombre}`}
                title="Editar"
            >
                <i className="bi bi-pencil-fill"></i>
            </button>
            <button
                type="button"
                className="inicio-admin-btn peligro"
                onClick={onEliminar}
                aria-label={`Eliminar ${nombre}`}
                title="Eliminar"
            >
                <i className="bi bi-trash3-fill"></i>
            </button>
        </div>
    );
}

// Recuadro punteado para agregar un elemento nuevo.
function BotonAgregar({ texto, onClick, compacto = false }) {
    return (
        <button
            type="button"
            className={`inicio-admin-agregar ${compacto ? "compacto" : ""}`}
            onClick={onClick}
        >
            <i className="bi bi-plus-lg"></i>
            {texto}
        </button>
    );
}

// Elige una imagen del proyecto o sube una desde el dispositivo.
function CampoImagen({ id, valor, onCambiar }) {
    const nombres = Object.keys(IMAGENES);
    const esSubida = /^(blob:|data:)/.test(valor);
    const noEncontrada = Boolean(valor) && !esSubida && !IMAGENES[valor.split("/").pop()];

    const elegirArchivo = (evento) => {
        const archivo = evento.target.files?.[0];
        if (archivo) onCambiar(URL.createObjectURL(archivo));
        evento.target.value = "";
    };

    return (
        <div className="inicio-admin-imagen">
            <Imagen nombre={valor} alt="Vista previa de la imagen" loading="eager" />

            <div className="inicio-admin-imagen-controles">
                <select
                    id={id}
                    className="inicio-campo-control"
                    value={valor}
                    onChange={(evento) => onCambiar(evento.target.value)}
                >
                    <option value="">Sin imagen</option>
                    {esSubida && <option value={valor}>Imagen subida</option>}
                    {noEncontrada && <option value={valor}>{valor} (no encontrada)</option>}
                    {nombres.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>

                <label className="inicio-admin-subir">
                    <i className="bi bi-upload"></i>
                    Subir imagen
                    <input type="file" accept="image/*" onChange={elegirArchivo} hidden />
                </label>
            </div>
        </div>
    );
}

// Ventana para editar, agregar o confirmar la eliminación de un elemento.
function ModalAdmin({ modal, onGuardar, onEliminar, onCerrar }) {
    const config = TIPOS[modal.tipo];
    const [datos, setDatos] = useState(modal.datos);
    const [error, setError] = useState("");

    // Escape cierra la ventana y se bloquea el scroll de la página mientras está abierta.
    useEffect(() => {
        const alPresionar = (evento) => {
            if (evento.key === "Escape") onCerrar();
        };
        const overflowPrevio = document.body.style.overflow;

        document.addEventListener("keydown", alPresionar);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", alPresionar);
            document.body.style.overflow = overflowPrevio;
        };
    }, [onCerrar]);

    const cambiarCampo = (nombre, valor) => {
        setDatos((anterior) => ({ ...anterior, [nombre]: valor }));
        setError("");
    };

    const enviar = (evento) => {
        evento.preventDefault();

        const faltante = config.campos.find(
            (campo) => campo.requerido && !String(datos[campo.nombre] ?? "").trim()
        );

        if (faltante) {
            setError(`Completá el campo “${faltante.etiqueta}”.`);
            return;
        }

        onGuardar(modal.tipo, modal.id, limpiarDatos(modal.tipo, datos));
    };

    const cerrarAlHacerClicFuera = (evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
    };

    // Confirmación de eliminación
    if (modal.modo === "eliminar") {
        return (
            <div className="inicio-modal-fondo" onMouseDown={cerrarAlHacerClicFuera}>
                <div
                    className="inicio-modal inicio-modal-chico"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="inicio-modal-titulo"
                >
                    <div className="inicio-modal-cuerpo">
                        <h2 id="inicio-modal-titulo" className="inicio-modal-titulo">
                            Eliminar {config.singular}
                        </h2>
                        <p className="inicio-modal-texto">
                            ¿Seguro que querés eliminar “{config.nombreDe(modal.datos)}”?
                            Como los cambios todavía no se guardan, volverá a aparecer al recargar la página.
                        </p>
                    </div>

                    <div className="inicio-modal-pie">
                        <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="inicio-btn-peligro"
                            onClick={() => onEliminar(modal.tipo, modal.id)}
                            autoFocus
                        >
                            <i className="bi bi-trash3-fill me-2"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Formulario de edición / alta
    const esNuevo = modal.id === null;

    return (
        <div className="inicio-modal-fondo" onMouseDown={cerrarAlHacerClicFuera}>
            <form
                className="inicio-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="inicio-modal-titulo"
                onSubmit={enviar}
                noValidate
            >
                <div className="inicio-modal-encabezado">
                    <h2 id="inicio-modal-titulo" className="inicio-modal-titulo">
                        {esNuevo ? "Agregar" : "Editar"} {config.singular}
                    </h2>
                    <button
                        type="button"
                        className="inicio-admin-btn"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="inicio-modal-cuerpo">
                    {config.campos.map((campo, indice) => {
                        const id = `campo-${campo.nombre}`;
                        const valor = datos[campo.nombre] ?? "";

                        return (
                            <div className="inicio-campo" key={campo.nombre}>
                                <label htmlFor={id}>{campo.etiqueta}</label>

                                {campo.tipo === "texto" && (
                                    <input
                                        id={id}
                                        className="inicio-campo-control"
                                        type="text"
                                        value={valor}
                                        onChange={(e) => cambiarCampo(campo.nombre, e.target.value)}
                                        autoFocus={indice === 0}
                                    />
                                )}

                                {campo.tipo === "area" && (
                                    <textarea
                                        id={id}
                                        className="inicio-campo-control"
                                        rows={3}
                                        value={valor}
                                        onChange={(e) => cambiarCampo(campo.nombre, e.target.value)}
                                    />
                                )}

                                {campo.tipo === "icono" && (
                                    <div className="inicio-admin-iconos" role="radiogroup" aria-label="Icono">
                                        {ICONOS.map((icono) => (
                                            <button
                                                key={icono.valor}
                                                type="button"
                                                role="radio"
                                                aria-checked={valor === icono.valor}
                                                aria-label={icono.nombre}
                                                title={icono.nombre}
                                                className={`inicio-admin-icono ${valor === icono.valor ? "activo" : ""}`}
                                                onClick={() => cambiarCampo(campo.nombre, icono.valor)}
                                            >
                                                <i className={`bi ${icono.valor}`}></i>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {campo.tipo === "imagen" && (
                                    <CampoImagen
                                        id={id}
                                        valor={valor}
                                        onCambiar={(nuevo) => cambiarCampo(campo.nombre, nuevo)}
                                    />
                                )}

                                {campo.ayuda && <small className="inicio-campo-ayuda">{campo.ayuda}</small>}
                            </div>
                        );
                    })}

                    {error && <p className="inicio-campo-error" role="alert">{error}</p>}
                </div>

                <div className="inicio-modal-pie">
                    <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="inicio-btn-principal">
                        <i className="bi bi-check-lg me-2"></i>
                        {esNuevo ? "Agregar" : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
}

/*  Página */

export default function Inicio() {
    // cuando exista el login, "admin" debería salir del rol del usuario
    // y este botón solo debería mostrarse a los administradores.
    const [admin, setAdmin] = useState(false);

    // Por ahora el contenido vive solo en memoria: se pierde al recargar.
    const [contenido, setContenido] = useState(CONTENIDO_INICIAL);

    // Ventana abierta: { modo: "editar" | "eliminar", tipo, id, datos } o null.
    const [modal, setModal] = useState(null);

    const cerrarModal = useCallback(() => setModal(null), []);

    const alternarAdmin = () => {
        setAdmin((activo) => !activo);
        setModal(null);
    };

    const abrirNuevo = (tipo) =>
        setModal({ modo: "editar", tipo, id: null, datos: TIPOS[tipo].nuevo() });

    const abrirEditar = (tipo, item) =>
        setModal({ modo: "editar", tipo, id: item.id, datos: { ...item } });

    const abrirEliminar = (tipo, item) =>
        setModal({ modo: "eliminar", tipo, id: item.id, datos: item });

    // Agrega (id === null) o modifica un elemento.
    const guardar = (tipo, id, datos) => {
        const { clave } = TIPOS[tipo];

        setContenido((anterior) => ({
            ...anterior,
            [clave]: id === null
                ? [...anterior[clave], { ...datos, id: crearId(tipo) }]
                : anterior[clave].map((item) => (item.id === id ? { ...item, ...datos } : item)),
        }));
        setModal(null);
    };

    const eliminar = (tipo, id) => {
        const { clave } = TIPOS[tipo];

        setContenido((anterior) => ({
            ...anterior,
            [clave]: anterior[clave].filter((item) => item.id !== id),
        }));
        setModal(null);
    };

    // En modo administrador los enlaces no navegan, para no perder los cambios sin guardar.
    const bloquearEnAdmin = (evento) => {
        if (admin) evento.preventDefault();
    };

    const { secciones, novedades, construcciones } = contenido;

    return (
        <>
            <Header />

            <main className={`inicio ${admin ? "inicio-modo-admin" : ""}`}>
                <section
                    className="inicio-hero"
                    style={HERO_URL ? { "--inicio-hero-imagen": `url("${HERO_URL}")` } : undefined}
                >
                    <div className="container inicio-hero-contenido">
                        <div className="inicio-hero-texto">
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

                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/versiones" className="btn inicio-btn-principal" onClick={bloquearEnAdmin}>
                                    <i className="bi bi-compass-fill me-2"></i>
                                    Explorar el mundo
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>

                                <Link to="/comunidad" className="btn inicio-btn-secundario" onClick={bloquearEnAdmin}>
                                    <i className="bi bi-people-fill me-2"></i>
                                    Unirme a la comunidad
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container inicio-contenido">
                    {/* ---------- Secciones ---------- */}
                    {(admin || secciones.length > 0) && (
                        <section className="inicio-seccion">
                            <h2 className="inicio-titulo">
                                <span></span>
                                Explorá Wiki-Craft
                            </h2>

                            <div className="row g-3">
                                {secciones.map((seccion) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={seccion.id}>
                                        <article className="card inicio-card-seccion h-100">
                                            {admin && (
                                                <AccionesAdmin
                                                    nombre={seccion.titulo}
                                                    onEditar={() => abrirEditar("seccion", seccion)}
                                                    onEliminar={() => abrirEliminar("seccion", seccion)}
                                                />
                                            )}

                                            <Link
                                                to={seccion.enlace}
                                                className="inicio-imagen-link"
                                                aria-label={`Explorar ${seccion.titulo}`}
                                                onClick={bloquearEnAdmin}
                                            >
                                                <Imagen nombre={seccion.imagen} className="inicio-card-imagen" />
                                            </Link>

                                            <div className="card-body">
                                                <h3>
                                                    <i className={`bi ${seccion.icono}`}></i>
                                                    {seccion.titulo}
                                                </h3>

                                                <p>{seccion.descripcion}</p>

                                                <Link to={seccion.enlace} className="inicio-enlace" onClick={bloquearEnAdmin}>
                                                    Descubrir
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </Link>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                {admin && (
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <BotonAgregar texto="Agregar sección" onClick={() => abrirNuevo("seccion")} />
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ---------- Novedades ---------- */}
                    {(admin || novedades.length > 0) && (
                        <section className="inicio-seccion">
                            <div className="inicio-titulo-fila">
                                <h2 className="inicio-titulo">
                                    <span></span>
                                    Novedades de la comunidad
                                </h2>

                                <Link to="/comunidad" className="inicio-ver-todo" onClick={bloquearEnAdmin}>
                                    Ver todas
                                    <i className="bi bi-arrow-right ms-1"></i>
                                </Link>
                            </div>

                            <div className="row g-3">
                                {novedades.map((novedad) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={novedad.id}>
                                        <article className="card inicio-card-novedad h-100">
                                            {admin && (
                                                <AccionesAdmin
                                                    nombre={novedad.titulo}
                                                    onEditar={() => abrirEditar("novedad", novedad)}
                                                    onEliminar={() => abrirEliminar("novedad", novedad)}
                                                />
                                            )}

                                            <Link to={novedad.enlace} className="inicio-novedad-imagen" onClick={bloquearEnAdmin}>
                                                <Imagen nombre={novedad.imagen} alt={novedad.titulo} />
                                            </Link>

                                            <div className="card-body">
                                                <span className="inicio-categoria">{novedad.categoria}</span>

                                                <h3>
                                                    <Link to={novedad.enlace} onClick={bloquearEnAdmin}>
                                                        {novedad.titulo}
                                                    </Link>
                                                </h3>

                                                <div className="inicio-metadata">
                                                    <span>
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {novedad.fecha}
                                                    </span>
                                                    <span>
                                                        <i className="bi bi-person me-1"></i>
                                                        {novedad.autor}
                                                    </span>
                                                </div>

                                                <p>{novedad.descripcion}</p>

                                                <Link to={novedad.enlace} className="inicio-leer-mas" onClick={bloquearEnAdmin}>
                                                    Leer publicación
                                                    <i className="bi bi-arrow-up-right ms-1"></i>
                                                </Link>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                {admin && (
                                    <div className="col-12 col-md-6 col-lg-4">
                                        <BotonAgregar texto="Agregar novedad" onClick={() => abrirNuevo("novedad")} />
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ---------- Publicación destacada y construcciones ---------- */}
                    <section className="row g-3 inicio-inferior">
                        <div className="col-12 col-lg-5">
                            <article className="inicio-publicacion h-100">
                                <div className="inicio-avatar">
                                    <i className="bi bi-person-fill"></i>
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

                                    <Link to="/comunidad" className="inicio-enlace" onClick={bloquearEnAdmin}>
                                        Ver publicaciones
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Link>
                                </div>
                            </article>
                        </div>

                        <div className="col-12 col-lg-7">
                            <section className="inicio-construcciones h-100">
                                <div className="inicio-titulo-fila">
                                    <h2 className="inicio-titulo">
                                        <span></span>
                                        Conocé las construcciones
                                    </h2>

                                    <Link to="/comunidad" className="inicio-ver-todo" onClick={bloquearEnAdmin}>
                                        Ver más
                                        <i className="bi bi-arrow-right ms-1"></i>
                                    </Link>
                                </div>

                                {construcciones.length === 0 && !admin && (
                                    <p className="inicio-vacio">Todavía no hay construcciones para mostrar.</p>
                                )}

                                <div className="row g-2">
                                    {construcciones.map((construccion) => (
                                        <div className="col-4" key={construccion.id}>
                                            <div className="inicio-construccion-item">
                                                {admin && (
                                                    <AccionesAdmin
                                                        nombre={construccion.nombre}
                                                        onEditar={() => abrirEditar("construccion", construccion)}
                                                        onEliminar={() => abrirEliminar("construccion", construccion)}
                                                    />
                                                )}

                                                <Link
                                                    to="/comunidad"
                                                    className="inicio-construccion"
                                                    title={construccion.nombre}
                                                    onClick={bloquearEnAdmin}
                                                >
                                                    <Imagen nombre={construccion.imagen} alt={construccion.nombre} />
                                                    <span>{construccion.nombre}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                    {admin && (
                                        <div className="col-4">
                                            <BotonAgregar
                                                texto="Agregar"
                                                compacto
                                                onClick={() => abrirNuevo("construccion")}
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </section>

                    {/* ---------- Tienda ---------- */}
                    <section className="inicio-tienda">
                        <div>
                            <span className="inicio-categoria">TIENDA WIKI-CRAFT</span>
                            <h2>Equipate para tu próxima aventura</h2>
                            <p>
                                Explorá los productos disponibles y encontrá algo para
                                vos o para regalarle a otro jugador.
                            </p>
                        </div>

                        <Link to="/tienda" className="btn inicio-btn-principal" onClick={bloquearEnAdmin}>
                            Explorar la tienda
                            <i className="bi bi-arrow-right ms-2"></i>
                        </Link>
                    </section>
                </div>

                {/* ---------- Panel flotante del modo administrador ---------- */}
                <div className="inicio-admin-panel">
                    {admin && (
                        <p className="inicio-admin-aviso">
                            <i className="bi bi-info-circle-fill"></i>
                            Los cambios no se guardan: se pierden al recargar.
                        </p>
                    )}

                    <button
                        type="button"
                        className={`inicio-admin-toggle ${admin ? "activo" : ""}`}
                        aria-pressed={admin}
                        onClick={alternarAdmin}
                    >
                        <i className={`bi ${admin ? "bi-shield-check" : "bi-shield-lock"}`}></i>
                        {admin ? "Salir del modo administrador" : "Modo administrador"}
                    </button>
                </div>

                {modal && (
                    <ModalAdmin
                        key={`${modal.modo}-${modal.tipo}-${modal.id ?? "nuevo"}`}
                        modal={modal}
                        onGuardar={guardar}
                        onEliminar={eliminar}
                        onCerrar={cerrarModal}
                    />
                )}
            </main>

            <Footer />
        </>
    );
}