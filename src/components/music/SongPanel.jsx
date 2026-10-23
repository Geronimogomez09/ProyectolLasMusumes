import React, { useEffect } from "react";

function ActionIcon({ name, className = "action-icon" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false",
  };

  switch (name) {
    case "close":
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "heart":
      return <svg {...common}><path d="M20.8 8.8c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" /></svg>;
    case "ban":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></svg>;
    case "play":
      return <svg {...common} fill="currentColor" stroke="none"><path d="M7 4.8a1 1 0 0 1 1.5-.86l10.1 7.06a1.2 1.2 0 0 1 0 2L8.5 20.06A1 1 0 0 1 7 19.2V4.8Z" /></svg>;
    case "disc":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.4" /><path d="M12 3v2M21 12h-2M12 21v-2M3 12h2" /></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
    default:
      return null;
  }
}

export default function SongPanel({
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
  useEffect(() => {
    if (!song) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [song, onClose]);

  if (!song) return null;

  const stopClick = (event) => event.stopPropagation();

  return (
    <div
      className="song-panel-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      onTouchStart={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        className="song-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${song.title}`}
        onMouseDown={stopClick}
        onTouchStart={stopClick}
      >
        <button type="button" className="panel-close" onClick={onClose} aria-label="Cerrar detalles" title="Cerrar">
          <ActionIcon name="close" className="panel-close-icon" />
        </button>

        <img className="panel-cover" src={song.cover} alt={`Portada de ${song.title}`} />

        <p className="music-eyebrow">DETALLES DE LA CANCIÓN</p>
        <h2>{song.title}</h2>

        {composer && (
          <button type="button" className="song-panel-action" onClick={() => onOpenComposer?.(composer)}>
            <ActionIcon name="user" />
            <span>{composer.name}</span>
          </button>
        )}

        {album && (
          <button type="button" className="song-panel-action" onClick={() => onOpenAlbum?.(album)}>
            <ActionIcon name="disc" />
            <span>{album.title}</span>
          </button>
        )}

        {song.description && <p className="song-panel-description">{song.description}</p>}

        <button type="button" className="song-panel-action song-panel-play" onClick={() => onPlay?.(song)}>
          <ActionIcon name="play" />
          <span>Reproducir canción</span>
        </button>

        <button
          type="button"
          className={`song-panel-action ${isFavorite ? "is-active" : ""}`}
          onClick={() => onToggleFavorite?.(song)}
          aria-pressed={isFavorite}
        >
          <ActionIcon name="heart" />
          <span>{isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}</span>
        </button>

        <button
          type="button"
          className={`song-panel-action ${isBlocked ? "is-active" : ""}`}
          onClick={() => onToggleBlocked?.(song)}
          aria-pressed={isBlocked}
        >
          <ActionIcon name="ban" />
          <span>{isBlocked ? "Desbloquear canción" : "Bloquear canción"}</span>
        </button>
      </aside>
    </div>
  );
}
