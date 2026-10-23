import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/index.css";

/* ============================================================================
   1. IMÁGENES
   ----------------------------------------------------------------------------
   Todo lo que sea imagen (fotos E iconos) pasa por el mismo buscador.
   Vite solo procesa las imágenes que se importan, por eso se usa import.meta.glob
   sobre TODA la carpeta src/assets (cualquier subcarpeta).

   Un campo "imagen" puede contener cualquiera de estas cosas:
     - un nombre de archivo ............ "granja.jpg"
     - una ruta dentro de assets ....... "index/granja.jpg"
     - una ruta vieja .................. "../assets/index/granja.jpg"
     - una URL externa ................. "https://sitio.com/foto.png"
     - una ruta de /public ............. "/fotos/portada.png"
     - una imagen subida (blob / data)
   ========================================================================= */

const ARCHIVOS = import.meta.glob(
    "../assets/**/*.{png,jpg,jpeg,webp,gif,avif,svg}",
    { eager: true, import: "default" }
);

// BIBLIOTECA["index/castillo.jpg"] y BIBLIOTECA["castillo.jpg"] -> URL final.
// RUTAS es la lista de rutas relativas, útil para sugerencias en el formulario.
const BIBLIOTECA = {};
const RUTAS = [];

for (const [ruta, url] of Object.entries(ARCHIVOS)) {
    const relativa = ruta.replace("../assets/", "");
    const nombre = relativa.split("/").pop();

    RUTAS.push(relativa);
    BIBLIOTECA[relativa] = url;
    if (!(nombre in BIBLIOTECA)) BIBLIOTECA[nombre] = url; // si hay repetidos, gana el primero
}

// Carpeta (dentro de src/assets) donde viven los iconos de las secciones.
const CARPETA_ICONOS = "emojis";

const ICONOS = RUTAS
    .filter((ruta) => ruta.startsWith(`${CARPETA_ICONOS}/`))
    .map((ruta) => ruta.split("/").pop());

const SUGERENCIAS_IMAGEN = RUTAS.filter((ruta) => !ruta.startsWith(`${CARPETA_ICONOS}/`));

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

const ES_URL = /^(blob:|data:|https?:\/\/|\/\/|\/)/;

// Devuelve la URL final o undefined si no se encuentra.
// "carpeta" da prioridad a una subcarpeta (se usa para los iconos).
function buscarImagen(valor, carpeta) {
    if (!valor) return undefined;
    if (ES_URL.test(valor)) return valor;

    const clave = valor.replace(/^(\.{1,2}\/)*(src\/)?assets\//, "");
    const nombre = clave.split("/").pop();

    return (
        (carpeta && BIBLIOTECA[`${carpeta}/${nombre}`]) ||
        BIBLIOTECA[clave] ||
        BIBLIOTECA[nombre]
    );
}

function resolverImagen(valor, carpeta) {
    const url = buscarImagen(valor, carpeta);

    if (!url && valor && import.meta.env.DEV) {
        console.warn(`[Inicio] No se encontró la imagen "${valor}" en src/assets/`);
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

function Imagen({ nombre, carpeta, alt = "", ...resto }) {
    return (
        <img
            src={resolverImagen(nombre, carpeta)}
            alt={alt}
            loading="lazy"
            onError={aPlaceholder}
            {...resto}
        />
    );
}

// Los iconos son imágenes de la carpeta de iconos.
function Icono({ nombre, alt = "", ...resto }) {
    return <Imagen nombre={nombre} carpeta={CARPETA_ICONOS} alt={alt} {...resto} />;
}

// Imagen del hero: si existe en src/assets se usa; si no, el CSS usa su ruta de respaldo.
const HERO_URL = ["hero.jpg", "hero.jpeg", "hero.png", "hero.webp"]
    .map((nombre) => BIBLIOTECA[nombre])
    .find(Boolean);

/* ============================================================================
   2. ROLES Y PERMISOS
   ----------------------------------------------------------------------------
   Cada usuario tiene un rol numérico. Cada acción exige un rol mínimo.
   Para cambiar quién puede qué, solo se tocan estas dos tablas.
   (Ajustá los números para que coincidan con los de tu base de datos.)
   ========================================================================= */

const ROLES = {
    VISITANTE: 0,
    USUARIO: 1,
    EDITOR: 2,
    ADMIN: 3,
};

const PERMISOS = {
    crear: ROLES.EDITOR,
    editar: ROLES.EDITOR,
    eliminar: ROLES.ADMIN,
};

const puedeHacer = (rol, accion) => rol >= PERMISOS[accion];

// Mientras no exista el login, el rol lo controla el botón flotante.
// Cuando esté el login: poné MODO_DEMO en false y usá el rol real en useRol().
const MODO_DEMO = true;

function useRol() {
    const [rolDemo, setRolDemo] = useState(ROLES.VISITANTE);

    // const { usuario } = useAuth();
    // const rolReal = Number(usuario?.rol ?? ROLES.VISITANTE);
    const rolReal = ROLES.VISITANTE;

    return {
        rol: MODO_DEMO ? rolDemo : rolReal,
        alternarDemo: () =>
            setRolDemo((actual) => (actual >= ROLES.ADMIN ? ROLES.VISITANTE : ROLES.ADMIN)),
    };
}

/* ============================================================================
   3. CONTENIDO INICIAL
   ----------------------------------------------------------------------------
   En "imagen" va cualquiera de los formatos de la sección 1.
   En "icono" va el nombre de un archivo de src/assets/emojis/.
   ========================================================================= */

const CONTENIDO_INICIAL = {
    secciones: [
        {
            id: "seccion-comunidad",
            titulo: "Comunidad",
            descripcion: "Conocé a otros jugadores, compartí tus ideas, mostrá tus construcciones y participá en eventos.",
            imagen: "comunidad.png",
            enlace: "/comunidad",
            icono: "dirt.png",
        },
        {
            id: "seccion-versiones",
            titulo: "Versiones",
            descripcion: "Reviví la historia de Minecraft, explorá cada versión y descubrí todo lo que cambió con el tiempo.",
            imagen: "versiones.png",
            enlace: "/versiones",
            icono: "brush.png",
        },
        {
            id: "seccion-musica",
            titulo: "Música",
            descripcion: "Disfrutá de las mejores bandas sonoras, listas y música creada por la comunidad.",
            imagen: "musica-2.jpg",
            enlace: "/musica",
            icono: "note_block.png",
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
            imagen: "versioncambio.png",
            enlace: "/versiones",
        },
        {
            id: "novedad-playlist",
            categoria: "MÚSICA",
            titulo: "Nueva playlist: sonidos del Overworld",
            fecha: "5 abr 2026",
            autor: "Luma",
            descripcion: "Una selección de los mejores temas del mundo principal, ideal para tus construcciones.",
            imagen: "musica.png",
            enlace: "/musica",
        },
    ],
    construcciones: [
        { id: "construccion-castillo", nombre: "Castillo medieval", imagen: "castillo.png" },
        { id: "construccion-casa", nombre: "Casa moderna", imagen: "casamoderna.jpg" },
        { id: "construccion-portal", nombre: "Portal del Nether", imagen: "portal.jpg" },
    ],
};

/* ============================================================================
   4. TIPOS DE CONTENIDO
   ----------------------------------------------------------------------------
   Para agregar un CAMPO nuevo: una línea en "campos".
   Para agregar un TIPO nuevo: una entrada acá + su sección en la página.
   Para agregar un tipo de CONTROL nuevo (ej. fecha): un componente en CONTROLES.

   Cada campo puede tener "limpiar": una función que normaliza el valor al guardar.
   ========================================================================= */

function fechaHoy() {
    return new Date()
        .toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
        .replace(/\./g, "");
}

const aRutaInterna = (valor) => `/${valor.replace(/^\/+/, "")}`;
const aMayusculas = (valor) => valor.toUpperCase();

const CAMPO_ENLACE = {
    nombre: "enlace",
    etiqueta: "Enlace",
    tipo: "texto",
    ayuda: "Ruta interna, por ejemplo /comunidad",
    limpiar: aRutaInterna,
};

const TIPOS = {
    seccion: {
        clave: "secciones",
        singular: "sección",
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            CAMPO_ENLACE,
            { nombre: "icono", etiqueta: "Icono", tipo: "icono" },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ titulo: "", descripcion: "", imagen: "", enlace: "/comunidad", icono: ICONOS[0] ?? "" }),
        nombreDe: (item) => item.titulo,
    },
    novedad: {
        clave: "novedades",
        singular: "novedad",
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "categoria", etiqueta: "Categoría", tipo: "texto", ayuda: "Se muestra en mayúsculas", limpiar: aMayusculas },
            { nombre: "autor", etiqueta: "Autor", tipo: "texto" },
            { nombre: "fecha", etiqueta: "Fecha", tipo: "texto" },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            CAMPO_ENLACE,
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

// Deja los datos listos para guardar: sin espacios sobrantes y con cada "limpiar" aplicado.
function limpiarDatos(tipo, datos) {
    const limpios = { ...datos };

    for (const campo of TIPOS[tipo].campos) {
        let valor = limpios[campo.nombre] ?? "";
        if (typeof valor === "string") valor = valor.trim();
        if (campo.limpiar) valor = campo.limpiar(valor);
        limpios[campo.nombre] = valor;
    }

    return limpios;
}

/* ============================================================================
   5. CONTEXTO DE EDICIÓN
   ----------------------------------------------------------------------------
   Reparte permisos y acciones a toda la página, así cada elemento solo escribe
   <Controles /> o <Agregar /> y no repite condiciones de admin.
   ========================================================================= */

const EdicionContext = createContext({
    editando: false,
    puede: () => false,
    abrirNuevo: () => {},
    abrirEditar: () => {},
    abrirEliminar: () => {},
});

const useEdicion = () => useContext(EdicionContext);

// Link que no navega mientras se está editando, para no perder cambios sin guardar.
function Enlace({ onClick, ...props }) {
    const { editando } = useEdicion();

    return (
        <Link
            {...props}
            onClick={(evento) => {
                if (editando) evento.preventDefault();
                onClick?.(evento);
            }}
        />
    );
}

// Botones de editar y eliminar sobre cada elemento (según permisos).
function Controles({ tipo, item }) {
    const { puede, abrirEditar, abrirEliminar } = useEdicion();
    const puedeEditar = puede("editar");
    const puedeEliminar = puede("eliminar");

    if (!puedeEditar && !puedeEliminar) return null;

    const nombre = TIPOS[tipo].nombreDe(item);

    return (
        <div className="inicio-admin-acciones">
            {puedeEditar && (
                <button
                    type="button"
                    className="inicio-admin-btn"
                    onClick={() => abrirEditar(tipo, item)}
                    aria-label={`Editar ${nombre}`}
                    title="Editar"
                >
                    <i className="bi bi-pencil-fill"></i>
                </button>
            )}
            {puedeEliminar && (
                <button
                    type="button"
                    className="inicio-admin-btn peligro"
                    onClick={() => abrirEliminar(tipo, item)}
                    aria-label={`Eliminar ${nombre}`}
                    title="Eliminar"
                >
                    <i className="bi bi-trash3-fill"></i>
                </button>
            )}
        </div>
    );
}

// Recuadro punteado para agregar un elemento nuevo (según permisos).
// "columna" es la clase de la columna de Bootstrap que lo envuelve.
function Agregar({ tipo, texto, columna, compacto = false }) {
    const { puede, abrirNuevo } = useEdicion();

    if (!puede("crear")) return null;

    return (
        <div className={columna}>
            <button
                type="button"
                className={`inicio-admin-agregar ${compacto ? "compacto" : ""}`}
                onClick={() => abrirNuevo(tipo)}
            >
                <i className="bi bi-plus-lg"></i>
                {texto}
            </button>
        </div>
    );
}

/* ============================================================================
   6. CONTROLES DEL FORMULARIO
   ----------------------------------------------------------------------------
   Cada tipo de campo es un componente con las mismas props:
   { id, valor, onCambiar, autoFocus }.
   ========================================================================= */

function ControlTexto({ id, valor, onCambiar, autoFocus }) {
    return (
        <input
            id={id}
            className="inicio-campo-control"
            type="text"
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
            autoFocus={autoFocus}
        />
    );
}

function ControlArea({ id, valor, onCambiar }) {
    return (
        <textarea
            id={id}
            className="inicio-campo-control"
            rows={3}
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
        />
    );
}

// Elige un icono entre los archivos de la carpeta de iconos.
function ControlIcono({ id, valor, onCambiar }) {
    if (ICONOS.length === 0) {
        return (
            <small className="inicio-campo-ayuda">
                No hay iconos todavía. Agregá imágenes en src/assets/{CARPETA_ICONOS}/.
            </small>
        );
    }

    return (
        <div id={id} className="inicio-admin-iconos" role="radiogroup" aria-label="Icono">
            {ICONOS.map((icono) => {
                const nombre = icono.replace(/\.[^.]+$/, "");
                const activo = valor === icono;

                return (
                    <button
                        key={icono}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        aria-label={nombre}
                        title={nombre}
                        className={`inicio-admin-icono ${activo ? "activo" : ""}`}
                        onClick={() => onCambiar(icono)}
                    >
                        <Icono nombre={icono} loading="eager" />
                    </button>
                );
            })}
        </div>
    );
}

// Acepta un nombre, una ruta, una URL, o una imagen subida desde el dispositivo.
function ControlImagen({ id, valor, onCambiar }) {
    const esSubida = /^(blob:|data:)/.test(valor);
    const noEncontrada = Boolean(valor) && !buscarImagen(valor);

    const elegirArchivo = (evento) => {
        const archivo = evento.target.files?.[0];
        if (archivo) onCambiar(URL.createObjectURL(archivo));
        evento.target.value = "";
    };

    return (
        <div className="inicio-admin-imagen">
            <Imagen nombre={valor} alt="Vista previa de la imagen" loading="eager" />

            <div className="inicio-admin-imagen-controles">
                <input
                    id={id}
                    className="inicio-campo-control"
                    type="text"
                    list={`${id}-sugerencias`}
                    value={esSubida ? "" : valor}
                    placeholder={esSubida ? "Imagen subida" : "granja.jpg, https://… o /fotos/portada.png"}
                    onChange={(e) => onCambiar(e.target.value)}
                    autoComplete="off"
                />
                <datalist id={`${id}-sugerencias`}>
                    {SUGERENCIAS_IMAGEN.map((ruta) => (
                        <option key={ruta} value={ruta} />
                    ))}
                </datalist>

                <label className="inicio-admin-subir">
                    <i className="bi bi-upload"></i>
                    Subir imagen
                    <input type="file" accept="image/*" onChange={elegirArchivo} hidden />
                </label>

                {noEncontrada && (
                    <small className="inicio-campo-error">
                        No se encontró esa imagen en src/assets/. Revisá el nombre o usá una URL.
                    </small>
                )}
            </div>
        </div>
    );
}

const CONTROLES = {
    texto: ControlTexto,
    area: ControlArea,
    icono: ControlIcono,
    imagen: ControlImagen,
};

/* ============================================================================
   7. VENTANA DE EDICIÓN
   ========================================================================= */

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
                        const Control = CONTROLES[campo.tipo];

                        return (
                            <div className="inicio-campo" key={campo.nombre}>
                                <label htmlFor={id}>{campo.etiqueta}</label>

                                <Control
                                    id={id}
                                    valor={datos[campo.nombre] ?? ""}
                                    onCambiar={(nuevo) => cambiarCampo(campo.nombre, nuevo)}
                                    autoFocus={indice === 0}
                                />

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

/* ============================================================================
   8. PÁGINA
   ========================================================================= */

export default function Inicio() {
    const { rol, alternarDemo } = useRol();

    const puede = useCallback((accion) => puedeHacer(rol, accion), [rol]);

    // Hay controles de edición visibles si el rol permite al menos una acción.
    const editando = puede("crear") || puede("editar") || puede("eliminar");

    // Por ahora el contenido vive solo en memoria: se pierde al recargar.
    const [contenido, setContenido] = useState(CONTENIDO_INICIAL);

    // Ventana abierta: { modo: "editar" | "eliminar", tipo, id, datos } o null.
    const [modal, setModal] = useState(null);

    const cerrarModal = useCallback(() => setModal(null), []);

    // Si el rol pierde permisos con la ventana abierta, se cierra.
    useEffect(() => {
        if (!editando) setModal(null);
    }, [editando]);

    const abrirNuevo = (tipo) =>
        puede("crear") && setModal({ modo: "editar", tipo, id: null, datos: TIPOS[tipo].nuevo() });

    const abrirEditar = (tipo, item) =>
        puede("editar") && setModal({ modo: "editar", tipo, id: item.id, datos: { ...item } });

    const abrirEliminar = (tipo, item) =>
        puede("eliminar") && setModal({ modo: "eliminar", tipo, id: item.id, datos: item });

    // Agrega (id === null) o modifica un elemento.
    // Cuando haya backend, es acá donde va la llamada a la API.
    const guardar = (tipo, id, datos) => {
        if (!puede(id === null ? "crear" : "editar")) return;

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
        if (!puede("eliminar")) return;

        const { clave } = TIPOS[tipo];

        setContenido((anterior) => ({
            ...anterior,
            [clave]: anterior[clave].filter((item) => item.id !== id),
        }));
        setModal(null);
    };

    const alternarModoDemo = () => {
        alternarDemo();
        setModal(null);
    };

    const { secciones, novedades, construcciones } = contenido;

    return (
        <EdicionContext.Provider value={{ editando, puede, abrirNuevo, abrirEditar, abrirEliminar }}>
            <Header />

            <main className={`inicio ${editando ? "inicio-modo-admin" : ""}`}>
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
                                <Enlace to="/versiones" className="btn inicio-btn-principal">
                                    <i className="bi bi-compass-fill me-2"></i>
                                    Explorar el mundo
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Enlace>

                                <Enlace to="/comunidad" className="btn inicio-btn-secundario">
                                    <i className="bi bi-people-fill me-2"></i>
                                    Unirme a la comunidad
                                </Enlace>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container inicio-contenido">
                    {/* ---------- Secciones ---------- */}
                    {(editando || secciones.length > 0) && (
                        <section className="inicio-seccion">
                            <h2 className="inicio-titulo">
                                <span></span>
                                Explorá Wiki-Craft
                            </h2>

                            <div className="row g-3">
                                {secciones.map((seccion) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={seccion.id}>
                                        <article className="card inicio-card-seccion h-100">
                                            <Controles tipo="seccion" item={seccion} />

                                            <Enlace
                                                to={seccion.enlace}
                                                className="inicio-imagen-link"
                                                aria-label={`Explorar ${seccion.titulo}`}
                                            >
                                                <Imagen nombre={seccion.imagen} className="inicio-card-imagen" />
                                            </Enlace>

                                            <div className="card-body">
                                                <div className="seccion-titulo d-flex">
                                                    <div className="d-flex icono-container">
                                                        <Icono nombre={seccion.icono} className="inicio-icono" />
                                                    </div>
                                                    <h3>
                                                        {seccion.titulo}
                                                    </h3>
                                                </div>
                                                <p>{seccion.descripcion}</p>

                                                <Enlace to={seccion.enlace} className="inicio-enlace">
                                                    Descubrir
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </Enlace>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                <Agregar tipo="seccion" texto="Agregar sección" columna="col-12 col-md-6 col-lg-4" />
                            </div>
                        </section>
                    )}

                    {/* ---------- Novedades ---------- */}
                    {(editando || novedades.length > 0) && (
                        <section className="inicio-seccion">
                            <div className="inicio-titulo-fila">
                                <h2 className="inicio-titulo">
                                    <span></span>
                                    Novedades de la comunidad
                                </h2>

                                <Enlace to="/comunidad" className="inicio-ver-todo">
                                    Ver todas
                                    <i className="bi bi-arrow-right ms-1"></i>
                                </Enlace>
                            </div>

                            <div className="row g-3">
                                {novedades.map((novedad) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={novedad.id}>
                                        <article className="card inicio-card-novedad h-100">
                                            <Controles tipo="novedad" item={novedad} />

                                            <Enlace to={novedad.enlace} className="inicio-novedad-imagen">
                                                <Imagen nombre={novedad.imagen} alt={novedad.titulo} />
                                            </Enlace>

                                            <div className="card-body">
                                                <span className="inicio-categoria">{novedad.categoria}</span>

                                                <h3>
                                                    <Enlace to={novedad.enlace}>{novedad.titulo}</Enlace>
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

                                                <Enlace to={novedad.enlace} className="inicio-leer-mas">
                                                    Leer publicación
                                                    <i className="bi bi-arrow-up-right ms-1"></i>
                                                </Enlace>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                <Agregar tipo="novedad" texto="Agregar novedad" columna="col-12 col-md-6 col-lg-4" />
                            </div>
                        </section>
                    )}

                    {/* ---------- Publicación destacada y construcciones ---------- */}
                    <section className="row g-3 inicio-inferior">
                        <div className="col-12 col-lg-5">
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

                                    <Enlace to="/comunidad" className="inicio-enlace">
                                        Ver publicaciones
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Enlace>
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

                                    <Enlace to="/comunidad" className="inicio-ver-todo">
                                        Ver más
                                        <i className="bi bi-arrow-right ms-1"></i>
                                    </Enlace>
                                </div>

                                {construcciones.length === 0 && !editando && (
                                    <p className="inicio-vacio">Todavía no hay construcciones para mostrar.</p>
                                )}

                                <div className="row g-2">
                                    {construcciones.map((construccion) => (
                                        <div className="col-4" key={construccion.id}>
                                            <div className="inicio-construccion-item">
                                                <Controles tipo="construccion" item={construccion} />

                                                <Enlace
                                                    to="/comunidad"
                                                    className="inicio-construccion"
                                                    title={construccion.nombre}
                                                >
                                                    <Imagen nombre={construccion.imagen} alt={construccion.nombre} />
                                                    <span>{construccion.nombre}</span>
                                                </Enlace>
                                            </div>
                                        </div>
                                    ))}

                                    <Agregar tipo="construccion" texto="Agregar" columna="col-4" compacto />
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

                        <Enlace to="/tienda" className="btn inicio-btn-principal">
                            Explorar la tienda
                            <i className="bi bi-arrow-right ms-2"></i>
                        </Enlace>
                    </section>
                </div>

                {/* ---------- Panel flotante ----------
                    El botón solo existe en modo demo. Con login real desaparece
                    y los controles se muestran solos según el rol. */}
                {(MODO_DEMO || editando) && (
                    <div className="inicio-admin-panel">
                        {editando && (
                            <p className="inicio-admin-aviso">
                                <i className="bi bi-info-circle-fill"></i>
                                Los cambios no se guardan: se pierden al recargar.
                            </p>
                        )}

                        {MODO_DEMO && (
                            <button
                                type="button"
                                className={`inicio-admin-toggle ${editando ? "activo" : ""}`}
                                aria-pressed={editando}
                                onClick={alternarModoDemo}
                            >
                                <i className={`bi ${editando ? "bi-shield-check" : "bi-shield-lock"}`}></i>
                                {editando ? "Salir del modo administrador" : "Modo administrador"}
                            </button>
                        )}
                    </div>
                )}

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
        </EdicionContext.Provider>
    );
}