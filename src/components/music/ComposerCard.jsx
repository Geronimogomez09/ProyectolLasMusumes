import React from "react";

function ComposerCard({
  composer,
  onOpen,
}) {
  return (
    <button
      className="composer-card"
      onClick={() => onOpen(composer)}
    >
      <img
        src={composer.image}
        alt={composer.name}
      />

      <strong>{composer.name}</strong>

      <span>
        {composer.songs.length} temas
      </span>
    </button>
  );
}

export default ComposerCard;