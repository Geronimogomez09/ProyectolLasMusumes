
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { composers, songs, albums } from "../data/musicData";
import "../styles/musica.css";
import "../styles/compositor.css";

function Compositor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);

  const composer = composers.find(
    (item) => item.id === Number(id)
  );

  if (!composer) {
    return (
      <main className="composer-page">
        <h1>Compositor no encontrado</h1>
        <button
          type="button"
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
      </main>
    );
  }

  const composerSongs = songs.filter(
    (song) => song.composerId === composer.id
  );

  const composerAlbums = albums.filter(
    (album) => album.composerId === composer.id
  );

  return (
    <main className="composer-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
      </button>

      <section className="composer-header">
        <img src={composer.image} alt={composer.name} />

        <div>
          <span>COMPOSITOR</span>
          <h1>{composer.name}</h1>
          <p>{composer.description}</p>

          <button
            type="button"
            onClick={() => setFollowing((previous) => !previous)}
          >
            {following ? "✓ Siguiendo" : "♡ Seguir"}
          </button>
        </div>
      </section>

      <section className="composer-section">
        <h2>Sus canciones</h2>

        <div className="composer-songs">
          {composerSongs.map((song) => (
            <button
              type="button"
              key={song.id}
              className="composer-song-item"
              onClick={() =>
                navigate(`/musica/cancion/${song.id}`)
              }
            >
              <img src={song.cover} alt={song.title} />

              <div>
                <strong>{song.title}</strong>
                <span>{song.duration || "Duración desconocida"}</span>
              </div>
            </button>
          ))}

          {composerSongs.length === 0 && (
            <p>Este compositor todavía no tiene canciones.</p>
          )}
        </div>
      </section>

      <section className="composer-section">
        <h2>Álbumes</h2>

        <div className="composer-albums">
          {composerAlbums.map((album) => (
            <button
              type="button"
              key={album.id}
              onClick={() =>
                navigate(`/musica/album/${album.id}`)
              }
            >
              <img src={album.cover} alt={album.title} />
              <strong>{album.title}</strong>
              <span>{album.year}</span>
            </button>
          ))}

          {composerAlbums.length === 0 && (
            <p>Este compositor todavía no tiene álbumes.</p>
          )}
        </div>
      </section>
    </main>
  );
}

export default Compositor;
