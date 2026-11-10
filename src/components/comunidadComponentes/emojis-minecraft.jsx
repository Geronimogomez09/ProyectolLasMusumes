
import React from "react";

// Índice: Emojis de Minecraft en el texto.
// ----------------- Emojis de Minecraft en el texto -----------------
// Recibe un texto y devuelve su representación con los códigos de emoji convertidos en elementos visuales. Se reutiliza al mostrar contenido de Comunidad.

// ==========================================
// EMOJIS MINECRAFT
// Las imágenes están en src/assets/iconos/
// ==========================================

import diamante from "../../assets/iconos/diamond.png";
import esmeralda from "../../assets/iconos/emerald.png";
import oro from "../../assets/iconos/gold_ingot.png";
import hierro from "../../assets/iconos/iron_ingot.png";
import estrella from "../../assets/iconos/nether_star.png";
import creeper from "../../assets/iconos/creeper_head.png";
import tnt from "../../assets/iconos/tnt.png";
import girasol from "../../assets/iconos/sunflower.png";
import cincel from "../../assets/iconos/brush.png";
import corazon from "../../assets/iconos/damage.png";

export const EMOJIS_MINECRAFT = [
  { id: "diamante", nombre: "Diamante", src: diamante },
  { id: "esmeralda", nombre: "Esmeralda", src: esmeralda },
  { id: "oro", nombre: "Lingote de oro", src: oro },
  { id: "hierro", nombre: "Lingote de hierro", src: hierro },
  { id: "estrella", nombre: "Nether estrella", src: estrella },
  { id: "creeper", nombre: "Creeper", src: creeper },
  { id: "tnt", nombre: "TNT", src: tnt },
  { id: "girasol", nombre: "Girasol", src: girasol },
  { id: "cincel", nombre: "Cincel", src: cincel },
  { id: "corazon", nombre: "Corazón", src: corazon },
];

// ==========================================
// CONVERTIR TOKENS EN IMÁGENES
// Ejemplo: :diamante: -> imagen de diamante
// ==========================================

export function renderizarTextoConEmojis(texto = "") {
  const partes = String(texto).split(/(:[a-z_]+:)/gi);

  return partes.map((parte, index) => {
    const match = parte.match(/^:([a-z_]+):$/i);

    if (match) {
      const emoji = EMOJIS_MINECRAFT.find(
        (e) => e.id === match[1].toLowerCase()
      );

      if (emoji) {
        return (
          <img
            key={index}
            src={emoji.src}
            alt={emoji.nombre}
            title={emoji.nombre}
            className="emoji-inline"
            draggable="false"
          />
        );
      }
    }

    return <React.Fragment key={index}>{parte}</React.Fragment>;
  });
}
