import React from "react";

function SongRow({
  song,
  index,
  composer,
  isFavorite,
  isBlocked,
  onPlay,
  onOpen,
  onToggleFavorite,
  onToggleBlocked,
}) {
  return (
    <div className={`song-row ${isBlocked ? "is-blocked" : ""}`}>
      <span className="song-index">
        {index + 1}
      </span>

      <button
        className="song-cover-button"
        onClick={() => onPlay(song)}
      >
        <img
          src={song.cover}
          alt={song.title}
          className="song-cover"
        />

        <span className="song-cover-play">
          ▶
        </span>
      </button>

      <button
        className="song-info"
        onClick={() => onOpen(song)}
      >
        <strong>{song.title}</strong>

        <span>
          {composer?.name || "Compositor desconocido"}
        </span>
      </button>

      <button
        className={`song-favorite ${
          isFavorite ? "active" : ""
        }`}
        onClick={() => onToggleFavorite(song.id)}
      >
        {isFavorite ? "♥" : "♡"}
      </button>

      <span className="song-duration">
        {song.duration}
      </span>

      <div className="song-menu">
        <button
          className="song-menu-button"
          onClick={() => onOpen(song)}
        >
          ⋮
        </button>

        <div className="song-menu-content">
          <button
            onClick={() =>
              onToggleFavorite(song.id)
            }
          >
            {isFavorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"}
          </button>

          <button
            onClick={() =>
              onToggleBlocked(song.id)
            }
          >
            {isBlocked
              ? "Desbloquear canción"
              : "Bloquear canción"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SongRow;