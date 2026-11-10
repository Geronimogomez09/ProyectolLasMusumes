// Índice: Búsqueda de imágenes del inicio.
// ----------------- Búsqueda de imágenes del inicio -----------------
// Recibe un valor y una carpeta para resolver la ruta de una imagen. Devuelve la imagen encontrada o el resultado alternativo definido por el módulo.

// IMÁGENES INICIO (components/inicio/imagenesInicio.jsx): busca imágenes y iconos de la
// página de Inicio y los muestra con una imagen de respaldo si algo falla.
// PARA QUÉ SE USA: TarjetaSeccion, TarjetaNovedad, ConstruccionesInicio, HeroInicio
// y ModalAdminInicio.
// DE DÓNDE SALEN: todos los archivos de src/assets (los iconos están en src/assets/iconos).
// Además acepta URLs completas (https://...) y rutas que empiezan con "/".

// BIBLIOTECA DE IMÁGENES: carga automáticamente todos los archivos de src/assets.
// Cada imagen queda guardada por su ruta ("iconos/dirt.png") y por su nombre ("dirt.png").
const ARCHIVOS = import.meta.glob(
    "../../assets/**/*.{png,jpg,jpeg,webp,gif,avif,svg}",
    { eager: true, import: "default" }
);

const BIBLIOTECA = {};
const RUTAS = [];

for (const [ruta, url] of Object.entries(ARCHIVOS)) {
    const relativa = ruta.replace("../../assets/", "");
    const nombre = relativa.split("/").pop();

    RUTAS.push(relativa);
    BIBLIOTECA[relativa] = url;
    if (!(nombre in BIBLIOTECA)) BIBLIOTECA[nombre] = url;
}

// CARPETA DE ICONOS: donde están los iconos de las secciones (src/assets/iconos).
export const CARPETA_ICONOS = "iconos";

// LISTA DE ICONOS: nombres de archivo de la carpeta de iconos, para el selector del modal.
export const ICONOS = RUTAS
    .filter((ruta) => ruta.startsWith(`${CARPETA_ICONOS}/`))
    .map((ruta) => ruta.split("/").pop());

// SUGERENCIAS DE IMAGEN: rutas de assets que se ofrecen al escribir una imagen en el modal.
export const SUGERENCIAS_IMAGEN = RUTAS.filter(
    (ruta) => !ruta.startsWith(`${CARPETA_ICONOS}/`)
);

// IMAGEN DE RESPALDO: dibujo verde que se muestra cuando una imagen no existe o no carga.
const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20" shape-rendering="crispEdges">' +
    '<rect width="32" height="20" fill="#dcefdc"/>' +
    '<g fill="#1db53c" fill-opacity=".35">' +
    '<rect x="10" y="6" width="2" height="2"/><rect x="12" y="8" width="2" height="2"/>' +
    '<rect x="14" y="10" width="2" height="2"/><rect x="16" y="8" width="2" height="2"/>' +
    '<rect x="18" y="6" width="2" height="2"/><rect x="14" y="6" width="2" height="2"/>' +
    '</g></svg>'
)}`;

// ES URL: detecta valores que ya son una dirección (http, https, blob, data o ruta con "/").
const ES_URL = /^(blob:|data:|https?:\/\/|\/\/|\/)/;

// BUSCAR IMAGEN: devuelve la URL final de una imagen, o undefined si no la encuentra.
// Recibe: valor (nombre de archivo, ruta de assets o URL) y carpeta opcional.
export function buscarImagen(valor, carpeta) {
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

// RESOLVER IMAGEN: igual que buscarImagen, pero devuelve la imagen de respaldo si no existe.
function resolverImagen(valor, carpeta) {
    const url = buscarImagen(valor, carpeta);

    if (!url && valor && import.meta.env.DEV) {
        console.warn(`[Inicio] No se encontró la imagen "${valor}" en src/assets/`);
    }

    return url ?? PLACEHOLDER;
}

// CAMBIAR A RESPALDO: si el navegador no puede cargar una imagen, pone la de respaldo.
function aPlaceholder(evento) {
    const img = evento.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = PLACEHOLDER;
}

// IMAGEN INICIO: muestra una imagen del inicio.
// Recibe: nombre (nombre de archivo o URL), carpeta (opcional), alt y los demás atributos de <img>.
export function Imagen({ nombre, carpeta, alt = "", ...resto }) {
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

// ICONO INICIO: muestra un icono de src/assets/iconos.
// Recibe: nombre (por ejemplo "dirt.png") y alt.
export function Icono({ nombre, alt = "", ...resto }) {
    return (
        <Imagen
            nombre={nombre}
            carpeta={CARPETA_ICONOS}
            alt={alt}
            {...resto}
        />
    );
}

// IMAGEN DEL HERO: foto de fondo de la portada (hero.jpg, hero.jpeg, hero.png o hero.webp en assets).
export const HERO_URL = ["hero.jpg", "hero.jpeg", "hero.png", "hero.webp"]
    .map((nombre) => BIBLIOTECA[nombre])
    .find(Boolean);
