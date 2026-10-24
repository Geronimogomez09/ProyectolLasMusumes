import React from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  playlists,
  songs,
} from "../data/musicData";

import "../styles/playlist.css";

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const playlist = playlists.find(
    (item) => item.id === Number(id)
  );

  if (!playlist) {
    return (
      <main>
        <h1>Lista no encontrada</h1>
      </main>
    );
  }

  const playlistSongs = playlist.songs
    .map((songId) =>
      songs.find((song) => song.id === songId)
    )
    .filter(Boolean);

  return (
    <main className="playlist-page">

      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
      </button>

      <section className="playlist-header">

        <img
          src={playlist.cover}
          alt={playlist.name}
        />

        <div>
          <span>LISTA DE REPRODUCCIÓN</span>

          <h1>{playlist.name}</h1>

          <p>{playlist.description}</p>

          <strong>
            {playlistSongs.length} canciones
          </strong>

          <div>
            <button>
              ▶ Reproducir
            </button>

            <button>
              🔀 Aleatorio
            </button>
          </div>
        </div>

      </section>

      <section className="playlist-songs">

        {playlistSongs.map((song, index) => (
          <button
            key={song.id}
            onClick={() =>
              navigate(
                `/musica/cancion/${song.id}`
              )
            }
          >
            <span>{index + 1}</span>

            <img
              src={song.cover}
              alt={song.title}
            />

            <strong>{song.title}</strong>

            <span>
              {song.duration}
            </span>
          </button>
        ))}

      </section>

    </main>
  );
}

export default Playlist;