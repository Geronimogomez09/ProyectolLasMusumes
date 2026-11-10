
import React from "react";

// Índice: Tarjeta de lista de reproducción.
// ----------------- Tarjeta de lista de reproducción -----------------
// Recibe los datos de una lista y las acciones disponibles. Muestra el resumen de la lista y permite seleccionarla desde el catálogo.

function PlaylistCard({
  playlist,
  songCount,
  onOpen,
  onPlay,
}) {
  return (
    <article className="playlist-card">
      <button
        type="button"
        className="playlist-card-image"
        onClick={() => onOpen(playlist)}
      >
        <img
          src={playlist.cover}
          alt={playlist.title}
        />
      </button>

      <div className="playlist-card-content">
        <button
          type="button"
          className="playlist-card-title"
          onClick={() => onOpen(playlist)}
        >
          <img
            src="/music/iconos/cofre_ender.gif"
            alt=""
            className="music-category-icon"
          />
          {playlist.title}
        </button>

        <p>{playlist.description}</p>

        <span>{songCount} canciones</span>

        <button
          type="button"
          className="playlist-play"
          onClick={() => onPlay(playlist)}
          aria-label={`Reproducir ${playlist.title}`}
        >
          ▶
        </button>
      </div>
    </article>
  );
}

export default PlaylistCard;
