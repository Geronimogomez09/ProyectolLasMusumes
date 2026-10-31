
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { albums, songs, composers } from "../data/musicData";
import { useMusic } from "../context/MusicContext";
import SongRow from "../components/music/SongRow";
import SongPanel from "../components/music/SongPanel";
import "../styles/album.css";

function Album() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState(null);

  const {
    playSong,
    playCollection,
    isBlocked,
    isFavorite,
    toggleFavorite,
    toggleBlocked,
    songDurations,
  } = useMusic();

  const album = albums.find((item) => item.id === Number(id));

  if (!album) {
    return (
      <main className="album-page">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Volver
        </button>
        <h1>Álbum no encontrado</h1>
      </main>
    );
  }

  const composer = composers.find(
    (item) => item.id === album.composerId
  );

  const albumSongs = (album.songs ?? [])
    .map((songId) => songs.find((song) => song.id === songId))
    .filter(Boolean);

  const playableSongs = albumSongs.filter(
    (song) => !isBlocked(song) && song.audio
  );

  const getComposer = (song) =>
    composers.find((item) => item.id === song?.composerId);

  const getAlbum = (song) =>
    albums.find((item) => item.id === song?.albumId);

  return (
    <main className="album-page">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="back-button"
      >
        ← Volver
      </button>

      <section className="album-header">
        <img src={album.cover} alt={album.title} />

        <div>
          <span>ÁLBUM</span>
          <h1>{album.title}</h1>

          {composer && (
            <button
              type="button"
              onClick={() =>
                navigate(`/musica/compositor/${composer.id}`)
              }
            >
              {composer.name}
            </button>
          )}

          <p>
            {album.year} · {albumSongs.length} canciones
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

      <section className="album-songs songs-list">
        {albumSongs.map((song, index) => (
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
              playSong(selectedSong, albumSongs)
            }
            onOpen={setSelectedSong}
            onToggleFavorite={toggleFavorite}
            onToggleBlocked={toggleBlocked}
          />
        ))}

        {!albumSongs.length && (
          <p>Este álbum todavía no tiene canciones.</p>
        )}
      </section>

      <SongPanel
        song={selectedSong}
        composer={selectedSong ? getComposer(selectedSong) : null}
        album={selectedSong ? getAlbum(selectedSong) : album}
        isFavorite={selectedSong ? isFavorite(selectedSong) : false}
        isBlocked={selectedSong ? isBlocked(selectedSong) : false}
        onClose={() => setSelectedSong(null)}
        onPlay={(song) => {
          playSong(song, albumSongs);
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

export default Album;
