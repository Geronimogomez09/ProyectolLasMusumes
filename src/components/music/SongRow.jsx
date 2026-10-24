import React from "react";
import { useNavigate } from "react-router-dom";

function formatDuration(duration) {
  if (duration == null || duration === "") return "—";

  if (typeof duration === "string" && duration.includes(":")) {
    return duration;
  }

  const seconds = Number(duration);

  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

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
}) {
  const navigate = useNavigate();

  const openSongDetails = () => {
    if (onOpen) {
      onOpen(song);
    } else {
      navigate(`/musica/cancion/${song.id}`);
    }
  };

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
        onClick={openSongDetails}
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

      <button
        type="button"
        className="song-menu-button"
        aria-label={`Ver detalles de ${song.title}`}
        title="Ver detalles de la canción"
        onClick={openSongDetails}
      >
        ⋮
      </button>
    </div>
  );
}

export default SongRow;