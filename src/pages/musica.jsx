
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/Footer";
import {
  songs,
  composers,
  albums,
  playlists,
} from "../data/musicData";

import SongRow from "../components/music/SongRow";
import FeaturedSongs from "../components/music/FeaturedSongs";
import PlaylistCard from "../components/music/PlaylistCard";
import ComposerCard from "../components/music/ComposerCard";
import SongPanel from "../components/music/SongPanel";
import MusicPlayer from "../components/music/MusicPlayer";

import "../styles/musica.css";

export default function Musica() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [blockedSongs, setBlockedSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [songDurations, setSongDurations] = useState({});

  const availableSongs = songs.filter(
    (song) => !blockedSongs.includes(song.id)
  );

  const favoriteSongs = songs.filter(
    (song) => favorites.includes(song.id)
  );

  const getComposer = (song) =>
    composers.find(
      (composer) => composer.id === song.composerId
    );

  const getAlbum = (song) =>
    albums.find(
      (album) => album.id === song.albumId
    );

  const playSong = (song) => {
    setCurrentSong(song);
  };

  const playNext = (fromEnded = false) => {
    if (availableSongs.length === 0) return;

    if (!currentSong) {
      setCurrentSong(availableSongs[0]);
      return;
    }

    const currentIndex = availableSongs.findIndex(
      (song) => song.id === currentSong.id
    );

    if (currentIndex === -1) {
      setCurrentSong(availableSongs[0]);
      return;
    }

    if (
      fromEnded &&
      currentIndex === availableSongs.length - 1 &&
      repeatMode !== "all" &&
      !isShuffle
    ) {
      return;
    }

    if (isShuffle && availableSongs.length > 1) {
      const otherSongs = availableSongs.filter(
        (song) => song.id !== currentSong.id
      );

      const randomIndex = Math.floor(
        Math.random() * otherSongs.length
      );

      setCurrentSong(otherSongs[randomIndex]);
      return;
    }

    const nextIndex = currentIndex + 1;

    if (nextIndex >= availableSongs.length) {
      if (repeatMode === "all" || !fromEnded) {
        setCurrentSong(availableSongs[0]);
      }
      return;
    }

    setCurrentSong(availableSongs[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentSong) {
      if (availableSongs.length > 0) {
        setCurrentSong(availableSongs[0]);
      }
      return;
    }

    const currentIndex = availableSongs.findIndex(
      (song) => song.id === currentSong.id
    );

    if (currentIndex === -1) {
      setCurrentSong(availableSongs[0]);
      return;
    }

    const previousIndex =
      currentIndex === 0
        ? availableSongs.length - 1
        : currentIndex - 1;

    setCurrentSong(availableSongs[previousIndex]);
  };

  const toggleFavorite = (song) => {
    const songId = typeof song === "object" ? song.id : song;

    setFavorites((previousFavorites) =>
      previousFavorites.includes(songId)
        ? previousFavorites.filter((id) => id !== songId)
        : [...previousFavorites, songId]
    );
  };

  const toggleBlocked = (song) => {
    const songId = typeof song === "object" ? song.id : song;

    if (
      !blockedSongs.includes(songId) &&
      currentSong?.id === songId
    ) {
      setCurrentSong(null);
    }

    setBlockedSongs((previousBlocked) =>
      previousBlocked.includes(songId)
        ? previousBlocked.filter((id) => id !== songId)
        : [...previousBlocked, songId]
    );
  };

  const playPlaylist = (playlist) => {
    let playlistSongs = [];

    if (playlist.system) {
      playlistSongs = favoriteSongs;
    } else {
      playlistSongs = songs.filter(
        (song) =>
          playlist.songs.includes(song.id) &&
          !blockedSongs.includes(song.id)
      );
    }

    if (playlistSongs.length > 0) {
      setCurrentSong(playlistSongs[0]);
    }
  };

  return (
    <>
      <Header />

      <main className="music-page">
        <section className="music-header container my-5">
          <p className="music-eyebrow">
            WIKICRAFT · MÚSICA
          </p>

          <h1>Biblioteca musical</h1>

          <p>
            Explorá el repertorio musical, descubrí compositores,
            álbumes y listas de reproducción.
          </p>
        </section>

        <div className="container">
          <section className="music-section">
            <div className="section-title">
              <span>01</span>

              <div>
                <h2>Todo el repertorio</h2>
                <p>{availableSongs.length} canciones</p>
              </div>
            </div>

            <div className="songs-list">
              {availableSongs.length > 0 ? (
                availableSongs.map((song, index) => (
                  <SongRow
                    key={song.id}
                    song={{
                      ...song,
                      duration:
                        songDurations[song.id] ??
                        song.duration,
                    }}
                    index={index}
                    composer={getComposer(song)}
                    isFavorite={favorites.includes(song.id)}
                    isBlocked={blockedSongs.includes(song.id)}
                    onPlay={playSong}
                    onOpen={setSelectedSong}
                    onToggleFavorite={toggleFavorite}
                    onToggleBlocked={toggleBlocked}
                  />
                ))
              ) : (
                <p>No hay canciones disponibles.</p>
              )}
            </div>
          </section>

          <section className="music-section">
            <div className="section-title">
              <span>02</span>

              <div>
                <h2>Canciones destacadas</h2>
                <p>Las canciones más destacadas</p>
              </div>
            </div>

            <FeaturedSongs
              songs={availableSongs.slice(0, 5)}
              composers={composers}
              onPlay={playSong}
            />
          </section>

          <section className="music-section">
            <div className="section-title">
              <span>03</span>

              <div>
                <h2>Listas de reproducción</h2>
                <p>Música organizada para cada momento</p>
              </div>
            </div>

            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  songCount={
                    playlist.system
                      ? favoriteSongs.length
                      : playlist.songs.length
                  }
                  onPlay={playPlaylist}
                  onOpen={(item) =>
                    navigate(`/musica/playlist/${item.id}`)
                  }
                />
              ))}
            </div>
          </section>

          <section className="music-section">
            <div className="section-title">
              <span>04</span>

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
                    onClick={() =>
                      navigate(`/musica/album/${album.id}`)
                    }
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
              <span>05</span>

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
          composer={
            selectedSong ? getComposer(selectedSong) : null
          }
          album={selectedSong ? getAlbum(selectedSong) : null}
          isFavorite={
            selectedSong
              ? favorites.includes(selectedSong.id)
              : false
          }
          isBlocked={
            selectedSong
              ? blockedSongs.includes(selectedSong.id)
              : false
          }
          onClose={() => setSelectedSong(null)}
          onPlay={(song) => {
            playSong(song);
            setSelectedSong(null);
          }}
          onToggleFavorite={toggleFavorite}
          onToggleBlocked={toggleBlocked}
          onOpenAlbum={(album) =>
            navigate(`/musica/album/${album.id}`)
          }
          onOpenComposer={(composer) =>
            navigate(`/musica/compositor/${composer.id}`)
          }
        />
      </main>

      <MusicPlayer
        currentSong={currentSong}
        onNext={playNext}
        onPrevious={playPrevious}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        repeatMode={repeatMode}
        setRepeatMode={setRepeatMode}
        onDurationChange={(songId, duration) => {
          setSongDurations((previous) => ({
            ...previous,
            [songId]: duration,
          }));
        }}
      />

      <Footer />
    </>
  );
}
