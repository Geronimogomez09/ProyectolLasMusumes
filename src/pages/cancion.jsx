import React from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  songs,
  composers,
  albums,
} from "../data/musicData";

import "../styles/cancion.css";

function Cancion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const song = songs.find(
    (item) => item.id === Number(id)
  );

  if (!song) {
    return (
      <main>
        <h1>Canción no encontrada</h1>
      </main>
    );
  }

  const composer = composers.find(
    (item) => item.id === song.composerId
  );

  const album = albums.find(
    (item) => item.id === song.albumId
  );

  return (
    <main className="song-page">

      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
      </button>

      <section className="song-detail">

        <img
          src={song.cover}
          alt={song.title}
        />

        <div>

          <span>CANCIÓN</span>

          <h1>{song.title}</h1>

          <button
            onClick={() =>
              navigate(
                `/musica/compositor/${composer.id}`
              )
          >
            {composer?.name}
          </button>

          <p>
            Duración: {song.duration}
          </p>

          {album && (
            <button
              onClick={() =>
                navigate(
                  `/musica/album/${album.id}`
                )
              }
            >
              Álbum: {album.title}
            </button>
          )}

          <div>
            <button>
              ▶ Reproducir
            </button>

            <button>
              ♡ Favorito
            </button>
          </div>

        </div>

      </section>

    </main>
  );
}

export default Cancion;