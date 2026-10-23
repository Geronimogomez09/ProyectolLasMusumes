import React, { useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  composers,
  songs,
  albums,
} from "../data/musicData";

import "../styles/compositor.css";

function Compositor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [following, setFollowing] =
    useState(false);

  const composer = composers.find(
    (item) => item.id === Number(id)
  );

  if (!composer) {
    return (
      <main>
        <h1>Compositor no encontrado</h1>
      </main>
    );
  }

  const composerSongs = songs.filter(
    (song) => song.composerId === composer.id
  );

  const composerAlbums = albums.filter(
    (album) =>
      album.composerId === composer.id
  );

  return (
    <main className="composer-page">

      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
      </button>

      <section className="composer-header">

        <img
          src={composer.image}
          alt={composer.name}
        />

        <div>

          <span>COMPOSITOR</span>

          <h1>{composer.name}</h1>

          <p>{composer.description}</p>

          <button
            onClick={() =>
              setFollowing(!following)
            }
          >
            {following
              ? "✓ Siguiendo"
              : "♡ Seguir"}
          </button>

        </div>

      </section>

      <section>

        <h2>
          Sus canciones
        </h2>

        <div className="composer-songs">

          {composerSongs.map((song) => (
            <button
              key={song.id}
              onClick={() =>
                navigate(
                  `/musica/cancion/${song.id}`
                )
              }
            >
              <img
                src={song.cover}
                alt={song.title}
              />

              <div>
                <strong>
                  {song.title}
                </strong>

                <span>
                  {song.duration}
                </span>
              </div>
            </button>
          ))}

        </div>

      </section>

      <section>

        <h2>
          Álbumes
        </h2>

        <div className="composer-albums">

          {composerAlbums.map((album) => (
            <button
              key={album.id}
              onClick={() =>
                navigate(
                  `/musica/album/${album.id}`
                )
              }
            >
              <img
                src={album.cover}
                alt={album.title}
              />

              <strong>
                {album.title}
              </strong>

              <span>
                {album.year}
              </span>
            </button>
          ))}

        </div>

      </section>

    </main>
  );
}

export default Compositor;