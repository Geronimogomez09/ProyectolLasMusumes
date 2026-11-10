
import React from "react";
import { useNavigate } from "react-router-dom";

// ÍNDICE GENERAL
// 1. Conversión segura de duración
// 2. Datos y callbacks recibidos de la página padre
// 3. Reproducción, detalle y favorito

// FILA REUTILIZABLE DE CANCIÓN
// SongRow no conoce Firestore ni modifica el reproductor por sí misma. Recibe una canción
// y funciones desde la página que la usa. Este diseño permite reutilizar la misma fila en
// repertorios, álbumes y playlists, pero conservar en cada página la decisión de cuál es
// la cola que se reproducirá o dónde se mostrará el detalle.

function formatDuration(duration) {
  // Acepta tanto segundos numéricos como una duración que ya venga como "m:ss". Los
  // valores ausentes o inválidos producen un guion en lugar de texto engañoso. Math.floor
  // elimina fracciones y padStart mantiene el formato habitual de dos dígitos.
  if (duration == null || duration === "") return "—";

  if (typeof duration === "string" && duration.includes(":")) {
    return duration;
  }

  const seconds = Number(duration);

  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function SongRow({
  song,
  index,
  composer,
  isFavorite,
  isBlocked,
  onPlay,
  onOpen,
  onToggleFavorite,
}) {
  // index viene desde map() y se incrementa solo para mostrar posiciones humanas desde 1.
  // onOpen es opcional: cuando existe abre un panel dentro de la misma página; cuando no,
  // openSongDetails navega a la ruta de detalle. De este modo el componente ofrece los dos
  // comportamientos sin forzar a sus padres a implementar un panel.
  const navigate = useNavigate();

  // El botón de portada llama onPlay(song), delegando la creación de la cola. El botón de
  // favorito envía song.id porque el estado real de favoritos vive en MusicContext.
  const openSongDetails = () => {
    if (onOpen) {
      onOpen(song);
    } else {
      navigate(`/musica/cancion/${song.id}`);
    }
  };

  return (
    <div className={`song-row ${isBlocked ? "is-blocked" : ""}`}>
      <span className="song-index">{index + 1}</span>

      <button
        type="button"
        className="song-cover-button"
        onClick={() => onPlay(song)}
        aria-label={`Reproducir ${song.title}`}
      >
        <img
          src={song.cover}
          alt={song.title}
          className="song-cover"
        />
        <span className="song-cover-play">▶</span>
      </button>

      <button
        type="button"
        className="song-info"
        onClick={openSongDetails}
      >
        <strong>{song.title}</strong>
        <span>{composer?.name || "Compositor desconocido"}</span>
      </button>

      <button
        type="button"
        className={`song-favorite ${isFavorite ? "active" : ""}`}
        onClick={() => onToggleFavorite(song.id)}
        aria-label={
          isFavorite
            ? `Quitar ${song.title} de favoritos`
            : `Agregar ${song.title} a favoritos`
        }
        aria-pressed={isFavorite}
        title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      >
        <img
          src="/music/iconos/esmeralda.png"
          alt=""
          className="song-favorite-icon"
        />
      </button>

      <span className="song-duration">
        {formatDuration(song.duration)}
      </span>

      <button
        type="button"
        className="song-menu-button"
        aria-label={`Ver detalles de ${song.title}`}
        title="Ver detalles de la canción"
        onClick={openSongDetails}
      >
        ⋮
      </button>
    </div>
  );
}

export default SongRow;
