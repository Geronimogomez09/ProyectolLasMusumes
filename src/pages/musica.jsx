
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";
import BotonAdmin from "../components/botonAdmin";
import Footer from "../components/Footer";

import { songs, composers, albums, playlists } from "../data/musicData";
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
    favoriteSongs,
    isBlocked,
    isFavorite,
    toggleFavorite,
    toggleBlocked,
    playSong,
    playCollection,
    songDurations,
  } = useMusic();

  const availableSongs = songs.filter((song) => !isBlocked(song));

  const songsToShow = showAllSongs
    ? availableSongs
    : availableSongs.slice(0, 10);

  const getComposer = (song) =>
    composers.find((composer) => composer.id === song?.composerId);

  const getAlbum = (song) =>
    albums.find((album) => album.id === song?.albumId);

  const playPlaylist = (playlist) => {
    const playlistSongs = playlist.system
      ? favoriteSongs.filter((song) => !isBlocked(song))
      : (playlist.songs ?? [])
          .map((songId) => songs.find((song) => song.id === songId))
          .filter((song) => song && !isBlocked(song));

    playCollection(playlistSongs);
  };

  return (
    <>
      <Header />

      <main className="music-page">
        <section
          className="music-header container my-5"
          style={{
            backgroundImage: "url('/music/banner-minecraft.gif')",
          }}
        >
          <p className="music-eyebrow">WIKICRAFT · MÚSICA</p>
          <h1>Biblioteca musical</h1>
          <p>
            Explorá el repertorio musical, descubrí compositores, álbumes y
            listas de reproducción.
          </p>
        </section>

        <div className="container">
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2>Todo el repertorio</h2>
                <p>{availableSongs.length} canciones disponibles</p>
              </div>
            </div>

            <div className="songs-list">
              {songsToShow.length > 0 ? (
                songsToShow.map((song, index) => (
                  <SongRow
                    key={song.id}
                    song={{
                      ...song,
                      duration: songDurations[song.id] ?? song.duration,
                    }}
                    index={index}
                    composer={getComposer(song)}
                    isFavorite={isFavorite(song)}
                    isBlocked={isBlocked(song)}
                    onPlay={(item) => playSong(item, availableSongs)}
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
                onClick={() => setShowAllSongs((previous) => !previous)}
                aria-expanded={showAllSongs}
              >
                {showAllSongs
                  ? "Mostrar menos canciones"
                  : "Ver todas las canciones"}
              </button>
            )}
          </section>

          <section className="music-section">
            <div className="section-title">
              <div>
                <h2>Canciones destacadas</h2>
                <p>Las canciones más destacadas</p>
              </div>
            </div>

            <FeaturedSongs
              songs={availableSongs.slice(0, 5)}
              composers={composers}
              onPlay={(song) => playSong(song, availableSongs)}
            />
          </section>

          <section className="music-section">
            <div className="section-title">
              <div>
                <h2>Listas de reproducción</h2>
                <p>Música organizada para cada momento</p>
              </div>
            </div>

            <div className="playlist-grid">
              {playlists.map((playlist) => {
                const playlistSongCount = playlist.system
                  ? favoriteSongs.filter((song) => !isBlocked(song)).length
                  : (playlist.songs ?? []).filter((songId) =>
                      availableSongs.some((song) => song.id === songId)
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

          <section className="music-section">
            <div className="section-title">
              <div>
                <h2>Álbumes</h2>
                <p>Explorá los álbumes completos</p>
              </div>
            </div>

            <div className="album-grid">
              {albums.map((album) => {
                const composer = composers.find(
                  (item) => item.id === album.composerId
                );

                return (
                  <button
                    key={album.id}
                    type="button"
                    className="album-card"
                    onClick={() => navigate(`/musica/album/${album.id}`)}
                  >
                    <img src={album.cover} alt={album.title} />

                    <strong>{album.title}</strong>

                    <span>
                      {composer?.name || "Compositor desconocido"}
                    </span>

                    <small>{album.songs.length} canciones</small>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="music-section">
            <div className="section-title">
              <div>
                <h2>Compositores</h2>
                <p>Descubrí quién está detrás de la música</p>
              </div>
            </div>

            <div className="composer-grid">
              {composers.map((composer) => (
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

        <SongPanel
          song={selectedSong}
          composer={selectedSong ? getComposer(selectedSong) : null}
          album={selectedSong ? getAlbum(selectedSong) : null}
          isFavorite={selectedSong ? isFavorite(selectedSong) : false}
          isBlocked={selectedSong ? isBlocked(selectedSong) : false}
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

      <BotonAdmin alAlternar={() => navigate("/musica/maestro")} />

      <Footer />
    </>
  );
}
