
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { playlists, songs, composers, albums } from "../data/musicData";
import { useMusic } from "../context/MusicContext";
import SongRow from "../components/music/SongRow";
import SongPanel from "../components/music/SongPanel";
import "../styles/playlist.css";
import "../styles/musica.css";

function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState(null);

  const {
    favoriteSongs,
    playSong,
    playCollection,
    isBlocked,
    isFavorite,
    toggleFavorite,
    toggleBlocked,
    songDurations,
  } = useMusic();

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
          ← Volver
        </button>
        <h1>Lista no encontrada</h1>
      </main>
    );
  }

  const playlistSongs = playlist.system
    ? favoriteSongs
    : (playlist.songs ?? [])
        .map((songId) => songs.find((song) => song.id === songId))
        .filter(Boolean);

  const playableSongs = playlistSongs.filter(
    (song) => !isBlocked(song) && song.audio
  );

  const getComposer = (song) =>
    composers.find((item) => item.id === song?.composerId);

  const getAlbum = (song) =>
    albums.find((item) => item.id === song?.albumId);

  return (
    <main className="playlist-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
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
              disabled={!playableSongs.length}
              onClick={() => playCollection(playlistSongs)}
            >
              ▶ <span>Reproducir</span>
            </button>

            <button
              type="button"
              className="playlist-secondary-action"
              disabled={!playableSongs.length}
              onClick={() =>
                playCollection(playlistSongs, { shuffle: true })
              }
            >
              ⤨ <span>Aleatorio</span>
            </button>
          </div>
        </div>
      </section>

      <section className="playlist-track-section">
        <div className="playlist-track-heading">
          <h2>Canciones</h2>
          <span>{playlistSongs.length} temas</span>
        </div>

        <div className="playlist-songs songs-list">
          {playlistSongs.map((song, index) => (
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
              onPlay={(selectedSong) =>
                playSong(selectedSong, playlistSongs)
              }
              onOpen={setSelectedSong}
              onToggleFavorite={toggleFavorite}
              onToggleBlocked={toggleBlocked}
            />
          ))}

          {playlistSongs.length === 0 && (
            <p>Esta lista todavía no tiene canciones.</p>
          )}
        </div>
      </section>

      <SongPanel
        song={selectedSong}
        composer={selectedSong ? getComposer(selectedSong) : null}
        album={selectedSong ? getAlbum(selectedSong) : null}
        isFavorite={selectedSong ? isFavorite(selectedSong) : false}
        isBlocked={selectedSong ? isBlocked(selectedSong) : false}
        onClose={() => setSelectedSong(null)}
        onPlay={(song) => {
          playSong(song, playlistSongs);
          setSelectedSong(null);
        }}
        onToggleFavorite={toggleFavorite}
        onToggleBlocked={toggleBlocked}
        onOpenAlbum={(selectedAlbum) => {
          setSelectedSong(null);
          navigate(`/musica/album/${selectedAlbum.id}`);
        }}
        onOpenComposer={(selectedComposer) => {
          setSelectedSong(null);
          navigate(`/musica/compositor/${selectedComposer.id}`);
        }}
      />
    </main>
  );
}

export default Playlist;
