
import React from "react";

function formatDuration(duration) {
  if (duration == null || duration === "") {
    return "—";
  }

  // Compatibilidad con duraciones antiguas como "3:35".
  if (typeof duration === "string" && duration.includes(":")) {
    return duration;
  }

  const seconds = Number(duration);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

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
      <span className="song-index">{index + 1}</span>

      <button
        type="button"
        className="song-cover-button"
        onClick={() => onPlay(song)}
        aria-label={`Reproducir ${song.title}`}
      >
        <img
          src={song.cover}
          alt={song.title}
          className="song-cover"
        />

        <span className="song-cover-play">▶</span>
      </button>

      <button
        type="button"
        className="song-info"
        onClick={() => onOpen(song)}
      >
        <strong>{song.title}</strong>

        <span>{composer?.name || "Compositor desconocido"}</span>
      </button>

      <button
        type="button"
        className={`song-favorite ${isFavorite ? "active" : ""}`}
        onClick={() => onToggleFavorite(song.id)}
        aria-label={
          isFavorite
            ? `Quitar ${song.title} de favoritos`
            : `Agregar ${song.title} a favoritos`
        }
        aria-pressed={isFavorite}
      >
        {isFavorite ? "♥" : "♡"}
      </button>

      <span className="song-duration">
        {formatDuration(song.duration)}
      </span>

      <div className="song-menu">
        <button
          type="button"
          className="song-menu-button"
          aria-label={`Opciones de ${song.title}`}
          onClick={() => onOpen(song)}
        >
          ⋮
        </button>

        <div className="song-menu-content">
          <button
            type="button"
            onClick={() => onToggleFavorite(song.id)}
          >
            {isFavorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"}
          </button>

          <button
            type="button"
            onClick={() => onToggleBlocked(song.id)}
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
