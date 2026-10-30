/* ============================================================================
   DATOS DE INICIO (base de ejemplo)
   ----------------------------------------------------------------------------
   Todo el contenido de Inicio se guarda en el navegador (localStorage) bajo una
   sola clave, igual que hacen las publicaciones de Comunidad.

   Es el "archivo" que comparten Inicio y la página de cada publicación:
     - Publicación -> destacarPublicacion() agrega una tarjeta (oculta).
     - Inicio      -> cargarInicio() la lee y el administrador la activa.

   Cuando exista la base de datos real, solo hay que cambiar estas funciones.

   En "imagen" va cualquiera de los formatos que acepta utils/imagenes.jsx.
   En "icono" va el nombre de un archivo de src/assets/emojis/.

   Las novedades tienen:
     activa    -> true: se ve en Inicio. false: solo la ve el administrador.
     origenId  -> id de la publicación de la que salió (si salió de una).
   ========================================================================= */

const CLAVE = "wikicraft_inicio_v1";

export const CONTENIDO_INICIAL = {
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
            activa: true,
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
            activa: true,
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
            activa: true,
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

/* ---------- Leer y guardar ---------- */

export function cargarInicio() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Se completan las claves que falten por si el formato guardado es más viejo.
        return guardado ? { ...CONTENIDO_INICIAL, ...JSON.parse(guardado) } : CONTENIDO_INICIAL;
    } catch {
        return CONTENIDO_INICIAL;
    }
}

// Devuelve false si el navegador no pudo guardar (casi siempre por falta de espacio).
export function guardarInicio(contenido) {
    try {
        localStorage.setItem(CLAVE, JSON.stringify(contenido));
        return true;
    } catch {
        return false;
    }
}

/* ---------- Utilidades ---------- */

export function crearId(prefijo) {
    return `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function fechaHoy() {
    return new Date()
        .toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
        .replace(/\./g, "");
}

/* ---------- Publicaciones destacadas ---------- */

// Devuelve la tarjeta de Inicio que salió de esa publicación (si existe).
export function buscarNovedadDePublicacion(origenId) {
    return cargarInicio().novedades.find((novedad) => novedad.origenId === origenId);
}

// Crea la tarjeta de Inicio a partir de una publicación.
// Queda desactivada: el administrador de Inicio decide cuándo mostrarla.
// Devuelve la novedad creada, o null si no se pudo guardar.
export function destacarPublicacion({ origenId, titulo, descripcion, imagen, autor, categoria, enlace }) {
    const contenido = cargarInicio();

    const novedad = {
        id: crearId("novedad"),
        origenId,
        activa: false,
        categoria: (categoria || "COMUNIDAD").toUpperCase(),
        titulo,
        fecha: fechaHoy(),
        autor: autor || "Comunidad Wiki-Craft",
        descripcion,
        imagen,
        enlace,
    };

    // La más nueva va primero.
    const ok = guardarInicio({ ...contenido, novedades: [novedad, ...contenido.novedades] });

    return ok ? novedad : null;
}
