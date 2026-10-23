import React from "react";

function FeaturedSongs({
  songs,
  composers,
  onPlay,
}) {
  return (
    <aside className="featured-ranking">
      {songs.map((song, index) => {
        const composer = composers.find(
          (item) => item.id === song.composerId
        );

        return (
          <button
            className="featured-song"
            key={song.id}
            onClick={() => onPlay(song)}
          >
            <span className="featured-position">
              {index + 1}
            </span>

            <img
              src={song.cover}
              alt={song.title}
            />

            <span className="featured-text">
              <strong>{song.title}</strong>
              <small>{composer?.name}</small>
            </span>

            <span className="featured-duration">
              {song.duration}
            </span>
          </button>
        );
      })}
    </aside>
  );
}

export default FeaturedSongs;