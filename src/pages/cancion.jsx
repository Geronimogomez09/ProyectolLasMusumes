
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  songs,
  composers,
  albums,
} from "../data/musicData";

import { useMusic } from "../context/MusicContext";
import "../styles/cancion.css";

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function Cancion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    currentSong,
    playSong,
    isFavorite,
    toggleFavorite,
    songDurations,
    isBlocked,
  } = useMusic();

  const song = songs.find(
    (item) => item.id === Number(id)
  );

  if (!song) {
    return (
      <main className="song-page">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Volver
        </button>

        <section className="song-not-found">
          <span className="song-eyebrow">WIKICRAFT MUSIC</span>
          <h1>Canción no encontrada</h1>
          <p>Esta canción no existe o ya no está disponible.</p>
        </section>
      </main>
    );
  }

  const composer = composers.find(
    (item) => item.id === song.composerId
  );

  const album = albums.find(
    (item) => item.id === song.albumId
  );

  const favorite = isFavorite(song);
  const blocked = isBlocked(song);
  const isCurrentSong = currentSong?.id === song.id;

  const duration =
    formatDuration(songDurations[song.id]) ||
    formatDuration(Number(song.durationSeconds)) ||
    (typeof song.duration === "string" ? song.duration : null);

  const handlePlay = () => {
    if (blocked || !song.audio) return;
    playSong(song);
  };

  return (
    <main className="song-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        <span aria-hidden="true">←</span> Volver
      </button>

      <div className="song-page-heading">
        <span className="song-eyebrow">WIKICRAFT MUSIC</span>
        <p>UNIVERSO MUSICAL · ARCHIVO DE MELODÍAS</p>
      </div>

      <section className="song-detail">
        <div className="song-cover-frame">
          <div className="song-cover-pixel-border">
            <img
              src={song.cover}
              alt={`Portada de ${song.title}`}
              className="song-cover"
            />
          </div>

          <span className="song-cover-caption">
            ♪ SOUNDTRACK COLLECTION
          </span>
        </div>

        <div className="song-information">
          <span className="song-category">
            {isCurrentSong ? "▶ SONANDO AHORA" : "♫ CANCIÓN"}
          </span>

          <h1>{song.title}</h1>

          <div className="song-divider" />

          {composer && (
            <div className="song-metadata">
              <span className="metadata-label">COMPOSITOR</span>
              <button
                type="button"
                className="song-link"
                onClick={() =>
                  navigate(`/musica/compositor/${composer.id}`)
                }
              >
                {composer.name} <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}

          {album && (
            <div className="song-metadata">
              <span className="metadata-label">ÁLBUM</span>
              <button
                type="button"
                className="song-link"
                onClick={() =>
                  navigate(`/musica/album/${album.id}`)
                }
              >
                {album.title} <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}

          <div className="song-metadata">
            <span className="metadata-label">DURACIÓN</span>
            <p className="song-duration">
              {duration || "Calculando duración…"}
            </p>
          </div>

          <div className="song-actions">
            <button
              type="button"
              className="song-play-button"
              onClick={handlePlay}
              disabled={blocked || !song.audio}
            >
              <span aria-hidden="true">▶</span>
              {blocked
                ? "Canción bloqueada"
                : isCurrentSong
                  ? "Reproducir de nuevo"
                  : "Reproducir canción"}
            </button>

            <button
              type="button"
              className={`song-favorite-button ${
                favorite ? "is-favorite" : ""
              }`}
              onClick={() => toggleFavorite(song)}
              aria-pressed={favorite}
            >
              <span aria-hidden="true">
                {favorite ? "♥" : "♡"}
              </span>
              {favorite ? "En favoritos" : "Añadir a favoritos"}
            </button>
          </div>

          <p className="song-footer-note">
            {favorite
              ? "Esta melodía forma parte de tu colección."
              : "Guardá tus melodías favoritas para encontrarlas fácilmente."}
          </p>
        </div>
      </section>
    </main>
  );
}

export default Cancion;
