
import React from "react";

function ComposerCard({
  composer,
  onOpen,
}) {
  return (
    <button
      type="button"
      className="composer-card"
      onClick={() => onOpen(composer)}
    >
      <img
        src={composer.image}
        alt={composer.name}
      />

      <strong className="composer-card-title">
        <img
          src="/music/iconos/aldeano_bibliotecario.png"
          alt=""
          className="music-category-icon"
        />
        {composer.name}
      </strong>

      <span>
        {composer.songs.length} temas
      </span>
    </button>
  );
}

export default ComposerCard;
