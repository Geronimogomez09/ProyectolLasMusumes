
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";
import BotonMaestroMelodias from "../components/BotonMaestroMelodias";
import Footer from "../components/Footer";

import { useMusic } from "../context/MusicContext";

import SongRow from "../components/music/SongRow";
import FeaturedSongs from "../components/music/FeaturedSongs";
import PlaylistCard from "../components/music/PlaylistCard";
import ComposerCard from "../components/music/ComposerCard";
import SongPanel from "../components/music/SongPanel";

import "../styles/musica.css";

export default function Musica() {
  const navigate = useNavigate();

  const [selectedSong, setSelectedSong] = useState(null);
  const [showAllSongs, setShowAllSongs] = useState(false);

  const {
    songs,
    composers,
    albums,
    playlists,
    favoriteSongs,
    rankingCounts,
    isBlocked,
    isFavorite,
    toggleFavorite,
    toggleBlocked,
    playSong,
    playCollection,
    songDurations,
  } = useMusic();

  // ==========================================================
  // CANCIONES DISPONIBLES
  // ==========================================================

  const availableSongs = songs.filter(
    (song) => !isBlocked(song)
  );

  const songsToShow = showAllSongs
    ? availableSongs
    : availableSongs.slice(0, 10);

  // ==========================================================
  // CANCIONES DESTACADAS
  // ==========================================================

  const featuredSongs = [...availableSongs]
    .sort(
      (a, b) =>
        (rankingCounts[b.id] ?? 0) -
        (rankingCounts[a.id] ?? 0)
    )
    .slice(0, 5)
    .map((song) => ({
      ...song,
      reproducciones: rankingCounts[song.id] ?? 0,
    }));

  // ==========================================================
  // FUNCIONES AUXILIARES
  // ==========================================================

  const getComposer = (song) =>
    composers.find(
      (composer) =>
        Number(composer.id) === Number(song?.composerId)
    );

  const getAlbum = (song) =>
    albums.find(
      (album) =>
        Number(album.id) === Number(song?.albumId)
    );

  const getAlbumSongs = (album) =>
    availableSongs.filter(
      (song) =>
        Number(song.albumId) === Number(album.id)
    );

  // ==========================================================
  // REPRODUCCIÓN DE LISTAS
  // ==========================================================

  const playPlaylist = (playlist) => {
    const playlistSongs = playlist.system
      ? favoriteSongs.filter(
          (song) => !isBlocked(song)
        )
      : (playlist.songs ?? [])
          .map((songId) =>
            availableSongs.find(
              (song) => Number(song.id) === Number(songId)
            )
          )
          .filter(Boolean);

    if (playlistSongs.length > 0) {
      playCollection(playlistSongs);
    }
  };

  // ==========================================================
  // CONTENIDO PUBLICADO
  // ==========================================================

  const publicPlaylists = playlists.filter(
    (playlist) =>
      playlist.activo !== false &&
      playlist.status === "published"
  );

  const publicAlbums = albums.filter(
    (album) =>
      album.activo !== false &&
      album.status === "published"
  );

  const publicComposers = composers.filter(
    (composer) =>
      composer.activo !== false &&
      composer.status === "published"
  );

  // ==========================================================
  // RENDERIZADO
  // ==========================================================

  return (
    <>
      <Header />

      <main className="music-page">

        {/* ENCABEZADO */}
        <section
          className="music-header"
          style={{
            backgroundImage: "url('/music/banner-minecraft.gif')",
          }}
        >
          <div className="music-header-content container">
            <p className="music-eyebrow">
              WIKICRAFT · MÚSICA
            </p>

            <h1>Biblioteca musical</h1>

            <p>
              Explorá el repertorio musical, descubrí compositores,
              álbumes y listas de reproducción.
            </p>
          </div>
        </section>

        <div className="container">

          {/* TODO EL REPERTORIO */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/disco_musical.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Todo el repertorio
                </h2>

                <p>
                  {availableSongs.length} canciones disponibles
                </p>
              </div>
            </div>

            <div className="songs-list">
              {songsToShow.length > 0 ? (
                songsToShow.map((song, index) => (
                  <SongRow
                    key={song.id}
                    song={{
                      ...song,
                      duration:
                        songDurations[song.id] ?? song.duration,
                    }}
                    index={index}
                    composer={getComposer(song)}
                    isFavorite={isFavorite(song)}
                    isBlocked={isBlocked(song)}
                    onPlay={(item) =>
                      playSong(item, availableSongs)
                    }
                    onOpen={setSelectedSong}
                    onToggleFavorite={toggleFavorite}
                    onToggleBlocked={toggleBlocked}
                  />
                ))
              ) : (
                <p className="songs-empty">
                  No hay canciones disponibles.
                </p>
              )}
            </div>

            {availableSongs.length > 10 && (
              <button
                type="button"
                className="songs-expand-button"
                onClick={() =>
                  setShowAllSongs((previous) => !previous)
                }
                aria-expanded={showAllSongs}
              >
                {showAllSongs
                  ? "Mostrar menos canciones"
                  : "Ver todas las canciones"}
              </button>
            )}
          </section>

          {/* RANKING DE CANCIONES DESTACADAS */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/disco_musical.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Canciones destacadas
                </h2>

                <p>
                  Las canciones más escuchadas por nuestra comunidad
                </p>
              </div>
            </div>

            <FeaturedSongs
              songs={featuredSongs}
              composers={publicComposers}
              onPlay={(song) =>
                playSong(song, availableSongs)
              }
            />
          </section>

          {/* LISTAS DE REPRODUCCIÓN */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/cofre_ender.gif"
                    alt=""
                    className="music-category-icon"
                  />
                  Listas de reproducción
                </h2>

                <p>
                  Música organizada para cada momento
                </p>
              </div>
            </div>

            <div className="playlist-grid">
              {publicPlaylists.map((playlist) => {
                const playlistSongCount = playlist.system
                  ? favoriteSongs.filter(
                      (song) => !isBlocked(song)
                    ).length
                  : (playlist.songs ?? []).filter(
                      (songId) =>
                        availableSongs.some(
                          (song) =>
                            Number(song.id) === Number(songId)
                        )
                    ).length;

                return (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    songCount={playlistSongCount}
                    onPlay={playPlaylist}
                    onOpen={(item) =>
                      navigate(`/musica/playlist/${item.id}`)
                    }
                  />
                );
              })}
            </div>
          </section>

          {/* ÁLBUMES */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/estanteria.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Álbumes
                </h2>

                <p>
                  Explorá los álbumes completos
                </p>
              </div>
            </div>

            <div className="album-grid">
              {publicAlbums.map((album) => {
                const composer = getComposer({
                  composerId: album.composerId,
                });

                const albumSongs = getAlbumSongs(album);

                return (
                  <button
                    key={album.id}
                    type="button"
                    className="album-card"
                    onClick={() =>
                      navigate(`/musica/album/${album.id}`)
                    }
                  >
                    <img
                      src={album.cover}
                      alt={album.title}
                    />

                    <strong>{album.title}</strong>

                    <span>
                      {composer?.name || "Compositor desconocido"}
                    </span>

                    <small>
                      {albumSongs.length} canciones
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          {/* COMPOSITORES */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/aldeano_bibliotecario.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Compositores
                </h2>

                <p>
                  Descubrí quién está detrás de la música
                </p>
              </div>
            </div>

            <div className="composer-grid">
              {publicComposers.map((composer) => (
                <ComposerCard
                  key={composer.id}
                  composer={composer}
                  onOpen={(item) =>
                    navigate(`/musica/compositor/${item.id}`)
                  }
                />
              ))}
            </div>
          </section>

        </div>

        {/* PANEL DE DETALLES DE CANCIÓN */}
        <SongPanel
          song={selectedSong}
          composer={
            selectedSong ? getComposer(selectedSong) : null
          }
          album={
            selectedSong ? getAlbum(selectedSong) : null
          }
          isFavorite={
            selectedSong ? isFavorite(selectedSong) : false
          }
          isBlocked={
            selectedSong ? isBlocked(selectedSong) : false
          }
          onClose={() => setSelectedSong(null)}
          onPlay={(song) => {
            playSong(song, availableSongs);
            setSelectedSong(null);
          }}
          onToggleFavorite={toggleFavorite}
          onToggleBlocked={toggleBlocked}
          onOpenAlbum={(album) => {
            setSelectedSong(null);
            navigate(`/musica/album/${album.id}`);
          }}
          onOpenComposer={(composer) => {
            setSelectedSong(null);
            navigate(`/musica/compositor/${composer.id}`);
          }}
        />

      </main>

      {/* BOTÓN FLOTANTE - MAESTRO DE MELODÍAS */}
      <BotonMaestroMelodias
        activo={false}
        alAlternar={() => navigate("/musica/maestro")}
      />

      <Footer />
    </>
  );
}
