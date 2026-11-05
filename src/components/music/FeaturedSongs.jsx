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
          (item) =>
            Number(item.id) === Number(song.composerId)
        );

        const reproducciones = song.reproducciones ?? 0;

        return (
          <button
            className="featured-song"
            key={song.id}
            type="button"
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
              <small>
                {composer?.name || "Compositor desconocido"}
              </small>
            </span>

            <span className="featured-duration">
              {reproducciones}{" "}
              {reproducciones === 1
                ? "reproducción"
                : "reproducciones"}
            </span>
          </button>
        );
      })}

      {songs.length === 0 && (
        <p className="songs-empty">
          Todavía no hay canciones en el ranking.
        </p>
      )}
    </aside>
  );
}

export default FeaturedSongs;