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