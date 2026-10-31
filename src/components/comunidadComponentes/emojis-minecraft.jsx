// ---------------------------------------------------------------------------
// emojisMinecraft.jsx
//
// EMOJIS_MINECRAFT es la variable pedida para ir agregando la imagen de cada
// emoji.
//
// Solución: crear la carpeta `public/emojis/` en la raíz del proyecto
// (al lado de `public/index.html` o `public/favicon.ico`, NO dentro de src/)
// y poner ahí cada ícono con el mismo nombre de archivo que ves abajo
// (PNG/WEBP, fondo transparente, 32x32 recomendado). Como está en `public/`,
// Vite lo sirve tal cual en esa URL sin necesidad de import ni de tocar
// este archivo.
//
// Para agregar un emoji nuevo: sumá un objeto { id, nombre, src } al array.
// El id es lo que se escribe como token dentro del texto: :diamante:
// ---------------------------------------------------------------------------

export const EMOJIS_MINECRAFT = [
  { id: 'diamante', nombre: 'Diamante', src: 'iconos/diamond.png' },
  { id: 'esmeralda', nombre: 'Esmeralda', src: 'iconos/emerald.png' },
  { id: 'oro', nombre: 'Lingote de oro', src: 'iconos/gold_ingot.png' },
  { id: 'hierro', nombre: 'Lingote de hierro', src: 'iconos/iron_ingot.png' },
  { id: 'estrella', nombre: 'Nether estrella', src: 'iconos/nether_star.png' },
  { id: 'creeper', nombre: 'Creeper', src: 'iconos/creeper_head.png' },
  { id: 'tnt', nombre: 'TNT', src: 'iconos/tnt.png' },
  {id: 'girasol', nombre: 'Girasol', src: 'iconos/sunflower.png' },
  {id: 'cincel', nombre: 'Cincel', src: 'iconos/brush.png' },
  {id: 'corazon', nombre: 'Corazon', src: 'iconos/damage.png' },
  {id: 'void', nombre: 'Void', src: 'iconos/structure_void.png' },
];

// Convierte un texto con tokens tipo ":diamante:" en un array de nodos React,
// reemplazando cada token reconocido por su <img>. Se usa tanto al escribir
// (preview, si se quisiera) como al mostrar el comentario ya publicado.
export function renderizarTextoConEmojis(texto) {
  const partes = texto.split(/(:[a-z_]+:)/g);

  return partes.map((parte, index) => {
    const match = parte.match(/^:([a-z_]+):$/);
    if (match) {
      const emoji = EMOJIS_MINECRAFT.find((e) => e.id === match[1]);
      if (emoji) {
        return (
          <img
            key={index}
            src={emoji.src}
            alt={emoji.nombre}
            title={emoji.nombre}
            className="emoji-inline"
          />
        );
      }
    }
    return <span key={index}>{parte}</span>;
  });
}
