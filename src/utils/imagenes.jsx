/* ============================================================================
   IMÁGENES
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
     - una imagen subida (data:)
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
export const CARPETA_ICONOS = "emojis";

export const ICONOS = RUTAS
    .filter((ruta) => ruta.startsWith(`${CARPETA_ICONOS}/`))
    .map((ruta) => ruta.split("/").pop());

export const SUGERENCIAS_IMAGEN = RUTAS.filter((ruta) => !ruta.startsWith(`${CARPETA_ICONOS}/`));

// Imagen de reemplazo (cuadrícula verde pixelada) para cuando falta un archivo.
export const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(
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

export function resolverImagen(valor, carpeta) {
    const url = buscarImagen(valor, carpeta);

    if (!url && valor && import.meta.env.DEV) {
        console.warn(`[imagenes] No se encontró la imagen "${valor}" en src/assets/`);
    }

    return url ?? PLACEHOLDER;
}

// Si una imagen falla al cargar, se reemplaza una sola vez por el placeholder.
export function aPlaceholder(evento) {
    const img = evento.currentTarget;
    if (img.dataset.fallback) return;
    img.dataset.fallback = "1";
    img.src = PLACEHOLDER;
}

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

// Los iconos son imágenes de la carpeta de iconos.
export function Icono({ nombre, alt = "", ...resto }) {
    return <Imagen nombre={nombre} carpeta={CARPETA_ICONOS} alt={alt} {...resto} />;
}

// Imagen del hero: si existe en src/assets se usa; si no, el CSS usa su ruta de respaldo.
export const HERO_URL = ["hero.jpg", "hero.jpeg", "hero.png", "hero.webp"]
    .map((nombre) => BIBLIOTECA[nombre])
    .find(Boolean);

/* ----------------------------------------------------------------------------
   Imágenes subidas desde el dispositivo
   Como ahora los datos se guardan en el navegador, la imagen se convierte a
   texto (data URL) y se reduce de tamaño para no llenar el espacio disponible.
   ------------------------------------------------------------------------- */

export function leerImagenSubida(archivo, ladoMax = 1200, calidad = 0.82) {
    return new Promise((resolver, rechazar) => {
        if (!archivo.type.startsWith("image/")) {
            rechazar(new Error("El archivo elegido no es una imagen."));
            return;
        }

        const lector = new FileReader();
        lector.onerror = () => rechazar(new Error("No se pudo leer el archivo."));
        lector.onload = () => {
            // SVG y GIF se guardan tal cual (no se pueden reducir con canvas sin perder cosas).
            if (/svg|gif/.test(archivo.type)) {
                resolver(lector.result);
                return;
            }

            const img = new Image();
            img.onerror = () => rechazar(new Error("No se pudo abrir la imagen."));
            img.onload = () => {
                const escala = Math.min(1, ladoMax / Math.max(img.width, img.height));
                const canvas = document.createElement("canvas");
                canvas.width = Math.round(img.width * escala);
                canvas.height = Math.round(img.height * escala);

                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#fff"; // evita fondo negro en PNG con transparencia
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                resolver(canvas.toDataURL("image/jpeg", calidad));
            };
            img.src = lector.result;
        };
        lector.readAsDataURL(archivo);
    });
}
