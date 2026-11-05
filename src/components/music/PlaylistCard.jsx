
import React from "react";

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
