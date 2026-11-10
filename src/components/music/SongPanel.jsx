
import React, { useEffect } from "react";
import { useMusic } from "../../context/MusicContext";

// ÍNDICE GENERAL
// 1. Iconos SVG reutilizables
// 2. Propiedades que describen la canción seleccionada
// 3. Sincronización de apertura con el reproductor global
// 4. Cierre por teclado y acciones de detalle

// PANEL DE DETALLE DE CANCIÓN
// Este componente recibe los datos ya relacionados por su padre: canción, compositor y
// álbum. Sus callbacks también llegan desde fuera, por lo que el panel se concentra en
// mostrar información y comunicar la intención de la persona usuaria. MusicContext solo
// se usa para avisar al reproductor global si hay un detalle abierto, estado que puede
// afectar la interfaz de reproducción.

function ActionIcon({ name, className = "action-icon" }) {
  // common reúne atributos compartidos para no repetirlos en cada SVG. El switch selecciona
  // una figura por nombre; devolver null para un nombre desconocido evita insertar un icono
  // incorrecto. aria-hidden comunica que estos dibujos acompañan botones con texto accesible.
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    focusable: "false",
  };

  switch (name) {
    case "close":
      return (
        <svg {...common}>
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      );

    case "heart":
      return (
        <svg {...common}>
          <path d="M20.8 8.8c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
        </svg>
      );

    case "ban":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m5.6 5.6 12.8 12.8" />
        </svg>
      );

    case "play":
      return (
        <svg {...common} fill="currentColor" stroke="none">
          <path d="M7 4.8a1 1 0 0 1 1.5-.86l10.1 7.06a1.2 1.2 0 0 1 0 2L8.5 20.06A1 1 0 0 1 7 19.2V4.8Z" />
        </svg>
      );

    case "disc":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.4" />
          <path d="M12 3v2M21 12h-2M12 21v-2M3 12h2" />
        </svg>
      );

    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );

    default:
      return null;
  }
}

export default function SongPanel({
  song,
  composer,
  album,
  isFavorite,
  isBlocked,
  onClose,
  onPlay,
  onToggleFavorite,
  onToggleBlocked,
  onOpenAlbum,
  onOpenComposer,
}) {
  // song puede ser null: esa es la señal para que el panel permanezca cerrado. Las demás
  // propiedades describen la canción sin volver a buscarla en el catálogo. onClose,
  // onPlay y los callbacks de navegación son responsabilidades del padre para conservar
  // una única fuente de estado.
  const { setIsSongDetailsOpen } = useMusic();

  // El primer efecto comunica si el panel está abierto. La limpieza se ejecuta tanto al
  // cerrar como al desmontar, evitando que MusicContext conserve un estado abierto viejo.
  // El segundo efecto instala un listener de teclado solo cuando hay canción. Escape
  // invoca onClose; el return elimina exactamente el mismo listener al cambiar o cerrar,
  // para que no queden atajos activos en una pantalla sin panel.
  useEffect(() => {
    setIsSongDetailsOpen(Boolean(song));

    return () => {
      setIsSongDetailsOpen(false);
    };
  }, [song, setIsSongDetailsOpen]);

  useEffect(() => {
    if (!song) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [song, onClose]);

  if (!song) return null;

  const stopClick = (event) => event.stopPropagation();

  return (
    <div
      className="song-panel-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      onTouchStart={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <aside
        className="song-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Detalles de ${song.title}`}
        onMouseDown={stopClick}
        onTouchStart={stopClick}
      >
        <img
          className="panel-cover"
          src={song.cover}
          alt={`Portada de ${song.title}`}
        />

        <p className="music-eyebrow">DETALLES DE LA CANCIÓN</p>
        <h2>{song.title}</h2>

        {composer && (
          <button
            type="button"
            className="song-panel-action"
            onClick={() => onOpenComposer?.(composer)}
          >
            <img
  src="/music/iconos/aldeano_bibliotecario.png"
  alt=""
  className="song-panel-minecraft-icon"
/>
            <span>{composer.name}</span>
          </button>
        )}

        {album && (
          <button
            type="button"
            className="song-panel-action"
            onClick={() => onOpenAlbum?.(album)}
          >
            <img
  src="/music/iconos/estanteria.png"
  alt=""
  className="song-panel-minecraft-icon"
/>
            <span>{album.title}</span>
          </button>
        )}

        {song.description && (
          <p className="song-panel-description">
            {song.description}
          </p>
        )}

        <button
          type="button"
          className="song-panel-action song-panel-play"
          onClick={() => onPlay?.(song)}
        >
          <ActionIcon name="play" />
          <span>Reproducir canción</span>
        </button>

        <button
          type="button"
          className={`song-panel-action ${isFavorite ? "is-active" : ""}`}
          onClick={() => onToggleFavorite?.(song)}
          aria-pressed={isFavorite}
        >
          <img
  src="/music/iconos/esmeralda.png"
  alt=""
  className={`song-panel-minecraft-icon ${isFavorite ? "is-active" : ""}`}
/>
          <span>
            {isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          </span>
        </button>

        <button
          type="button"
          className={`song-panel-action ${isBlocked ? "is-active" : ""}`}
          onClick={() => onToggleBlocked?.(song)}
          aria-pressed={isBlocked}
        >
          <img
  src="/music/iconos/disco_roto.png"
  alt=""
  className={`song-panel-minecraft-icon ${isBlocked ? "is-active" : ""}`}
/>
          <span>
            {isBlocked ? "Desbloquear canción" : "Bloquear canción"}
          </span>
        </button>
      </aside>
    </div>
  );
}
