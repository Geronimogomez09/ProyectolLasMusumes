import React from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  albums,
  songs,
  composers,
} from "../data/musicData";

import "../styles/album.css";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16 3h5v5M4 7h2.5c5 0 6 10 11 10H21m-5-5 5 5-5 5M4 17h2.5c2 0 3.5-2 4.5-4M16 3l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Album() {
  const { id } = useParams();
  const navigate = useNavigate();

  const album = albums.find(
    (item) => item.id === Number(id)
  );

  if (!album) {
    return (
      <main>
        <h1>Álbum no encontrado</h1>
      </main>
    );
  }

  const composer = composers.find(
    (item) => item.id === album.composerId
  );

  const albumSongs = album.songs
    .map((songId) =>
      songs.find((song) => song.id === songId)
    )
    .filter(Boolean);

  return (
    <main className="album-page">

      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
      </button>

      <section className="album-header">

        <img
          src={album.cover}
          alt={album.title}
        />

        <div>

          <span>ÁLBUM</span>

          <h1>{album.title}</h1>

          <button
            onClick={() =>
              navigate(
                `/musica/compositor/${composer.id}`
              )
            }
          >
            {composer?.name}
          </button>

          <p>
            {album.year} ·{" "}
            {albumSongs.length} canciones
          </p>

          <p>{album.description}</p>


<div className="album-actions">
  <button
    type="button"
    className="album-primary-action"
    aria-label="Reproducir álbum"
    title="Reproducir álbum"
  >
    <PlayIcon />
    <span>Reproducir</span>
  </button>

  <button
    type="button"
    className="album-secondary-action"
    aria-label="Reproducción aleatoria"
    title="Reproducción aleatoria"
  >
    <ShuffleIcon />
    <span>Aleatorio</span>
  </button>
</div>


        </div>

      </section>

      <section className="album-songs">

        {albumSongs.map((song, index) => (
          <button
            key={song.id}
            onClick={() =>
              navigate(
                `/musica/cancion/${song.id}`
              )
            }
          >
            <span>
              {String(index + 1).padStart(2, "0")}
            </span>

            <img
              src={song.cover}
              alt={song.title}
            />

            <strong>{song.title}</strong>

            <span>{song.duration}</span>
          </button>
        ))}

      </section>

    </main>
  );
}

export default Album;