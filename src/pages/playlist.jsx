
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { playlists, songs } from "../data/musicData";
import "../styles/playlist.css";

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

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const playlist = playlists.find(
    (item) => item.id === Number(id)
  );

  if (!playlist) {
    return (
      <main className="playlist-page">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
        <h1>Lista no encontrada</h1>
      </main>
    );
  }

  const playlistSongs = (playlist.songs ?? [])
    .map((songId) => songs.find((song) => song.id === songId))
    .filter(Boolean);

  return (
    <main className="playlist-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="m15 18-6-6 6-6M9 12h12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Volver
      </button>

      <section className="playlist-header">
        <img
          src={playlist.cover}
          alt={`Portada de ${playlist.title}`}
        />

        <div className="playlist-info">
          <span className="playlist-eyebrow">
            LISTA DE REPRODUCCIÓN
          </span>

          <h1>{playlist.title}</h1>

          <p>{playlist.description}</p>

          <strong className="playlist-count">
            {playlistSongs.length} canciones
          </strong>

          <div className="playlist-actions">
            <button
              type="button"
              className="playlist-primary-action"
              aria-label="Reproducir playlist"
              title="Reproducir playlist"
            >
              <PlayIcon />
              <span>Reproducir</span>
            </button>

            <button
              type="button"
              className="playlist-secondary-action"
              aria-label="Reproducción aleatoria"
              title="Reproducción aleatoria"
            >
              <ShuffleIcon />
              <span>Aleatorio</span>
            </button>
          </div>
        </div>
      </section>

      <section className="playlist-track-section">
        <div className="playlist-track-heading">
          <h2>Canciones</h2>
          <span>{playlistSongs.length} temas</span>
        </div>

        <div className="playlist-songs">
          {playlistSongs.map((song, index) => (
            <button
              type="button"
              className="playlist-track"
              key={song.id}
              onClick={() =>
                navigate(`/musica/cancion/${song.id}`)
              }
            >
              <span className="playlist-track-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              <img src={song.cover} alt="" />

              <span className="playlist-track-info">
                <strong>{song.title}</strong>
                <span>{song.duration}</span>
              </span>

              <span className="playlist-track-open">
                <PlayIcon />
              </span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Playlist;
