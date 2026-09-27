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
        className="playlist-card-image"
        onClick={() => onOpen(playlist)}
      >
        <img
          src={playlist.cover}
          alt={playlist.name}
        />
      </button>

      <div className="playlist-card-content">
        <button
          className="playlist-card-title"
          onClick={() => onOpen(playlist)}
        >
          {playlist.name}
        </button>

        <p>{playlist.description}</p>

        <span>
          {songCount} canciones
        </span>

        <button
          className="playlist-play"
          onClick={() => onPlay(playlist)}
        >
          ▶
        </button>
      </div>
    </article>
  );
}

export default PlaylistCard;