import React from "react";
import Header from "../components/header";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useMusic } from "../context/MusicContext";
import "../styles/musica.css";
import "../styles/compositor.css";

function Compositor() {
  const { id } = useParams();
  const navigate = useNavigate();
  

const {
  composers,
  songs,
  albums,
  songDurations,
  isFollowingComposer,
  toggleFollowComposer,
} = useMusic();

  const composer = composers.find(
    (item) => Number(item.id) === Number(id)
  );

  if (!composer) {
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  }

  const composerSongs = songs.filter(
    (song) =>
      Number(song.composerId) === Number(composer.id)
  );

  const composerAlbums = albums.filter(
    (album) =>
      Number(album.composerId) === Number(composer.id) ||
      (album.composerIds ?? []).some(
        (composerId) => Number(composerId) === Number(composer.id)
      )
  );

  const getDuration = (song) => {
    const duration =
      song.duration ??
      songDurations?.[song.id];

    if (typeof duration === "string" && duration.trim()) {
      return duration;
    }

    if (typeof duration === "number" && Number.isFinite(duration)) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);

      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    return "Duración desconocida";
  };

  return (
    <>
      <Header />
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
  className={`composer-follow-button ${
    isFollowingComposer(composer.id) ? "active" : ""
  }`}
  onClick={() => toggleFollowComposer(composer.id)}
  aria-pressed={isFollowingComposer(composer.id)}
>
  <img
    src="/music/iconos/brujuladerecuperacion.gif"
    alt=""
    className="composer-follow-icon"
  />
  <span>
    {isFollowingComposer(composer.id) ? "Siguiendo" : "Seguir"}
  </span>
</button>
          </div>
        </section>

        <section className="composer-section">
          <h2 className="composer-section-title">
  <img
    src="/music/iconos/disco_musical.png"
    alt=""
    className="music-category-icon"
  />
  Sus canciones
</h2>

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
                  <span>{getDuration(song)}</span>
                </div>
              </button>
            ))}

            {composerSongs.length === 0 && (
              <p>Este compositor todavía no tiene canciones.</p>
            )}
          </div>
        </section>

        <section className="composer-section">
          <h2 className="composer-section-title">
  <img
    src="/music/iconos/estanteria.png"
    alt=""
    className="music-category-icon"
  />
  Álbumes
</h2>

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
      <Footer />
    </>
  );
}

export default Compositor;