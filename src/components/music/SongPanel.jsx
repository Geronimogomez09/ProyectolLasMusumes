import React from "react";

function SongPanel({
  song,
  composer,
  album,
  isFavorite,
  isBlocked,
  onClose,
  onPlay,
  onToggleFavorite,
  onToggleBlocked,
  onOpenAlbum,
  onOpenComposer,
}) {
  if (!song) {
    return null;
  }

  return (
    <div className="song-panel-overlay">
      <aside className="song-panel">

        <button
          className="panel-close"
          onClick={onClose}
        >
          ✕
        </button>

        <img
          className="panel-cover"
          src={song.cover}
          alt={song.title}
        />

        <span className="panel-label">
          CANCIÓN
        </span>

        <h2>{song.title}</h2>

        <button
          className="panel-composer"
          onClick={() => onOpenComposer(composer)}
        >
          {composer?.name}
        </button>

        <p>
          Duración: {song.duration}
        </p>

        <button
          className="panel-main-button"
          onClick={() => onPlay(song)}
        >
          ▶ Reproducir
        </button>

        <button
          onClick={() =>
            onToggleFavorite(song.id)
          }
        >
          {isFavorite
            ? "♥ Quitar de favoritos"
            : "♡ Agregar a favoritos"}
        </button>

        <button
          onClick={() =>
            onToggleBlocked(song.id)
          }
        >
          {isBlocked
            ? "Desbloquear canción"
            : "🚫 Bloquear canción"}
        </button>

        {album && (
          <button
            className="panel-link"
            onClick={() => onOpenAlbum(album)}
          >
            Ver álbum
            <span>{album.title}</span>
          </button>
        )}

      </aside>
    </div>
  );
}

export default SongPanel;