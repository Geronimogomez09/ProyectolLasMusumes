
import React, {
  useEffect,
  useRef,
  useState,
} from "react";

function MusicPlayer({
  currentSong,
  onNext,
  onPrevious,
  isShuffle,
  setIsShuffle,
  repeatMode,
  setRepeatMode,
  onDurationChange,
}) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Cargar la canción seleccionada.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !currentSong) {
      return;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    audio.src = currentSong.audio;
    audio.load();

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    playAudio();
  }, [currentSong]);

  // Registrar la duración real del archivo.
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;

    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }

    const realDuration = audio.duration;

    setDuration(realDuration);

    if (currentSong) {
      onDurationChange?.(
        currentSong.id,
        realDuration
      );
    }
  };

  // Reproducir o pausar.
  const togglePlay = async () => {
    const audio = audioRef.current;

    if (!audio || !currentSong) {
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // Actualizar el progreso.
  const handleTimeUpdate = () => {
    const audio = audioRef.current;

    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  // Gestionar el final de la canción.
  const handleEnded = async () => {
    const audio = audioRef.current;

    if (repeatMode === "one" && audio) {
      audio.currentTime = 0;

      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }

      return;
    }

    setIsPlaying(false);
    onNext?.(true);
  };

  // Adelantar o retroceder.
  const handleProgress = (event) => {
    const value = Number(event.target.value);
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = value;
    setCurrentTime(value);
  };

  // Controlar el volumen.
  const handleVolume = (event) => {
    const value = Number(event.target.value);

    setVolume(value);

    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  // Mostrar minutos y segundos.
  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
  };

  // Cambiar entre repetición desactivada,
  // repetir canción y repetir lista.
  const toggleRepeat = () => {
    setRepeatMode((previous) => {
      if (previous === "off") {
        return "one";
      }

      if (previous === "one") {
        return "all";
      }

      return "off";
    });
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="player-song">
        <img
          src={currentSong.cover}
          alt={currentSong.title}
        />

        <div>
          <strong>{currentSong.title}</strong>
          <span>{currentSong.composerName}</span>
        </div>
      </div>

      <div className="player-main">
        <div className="player-controls">
          <button
            type="button"
            className={
              isShuffle
                ? "player-mode active"
                : "player-mode"
            }
            onClick={() =>
              setIsShuffle((previous) => !previous)
            }
            title="Aleatorio"
            aria-label="Activar o desactivar aleatorio"
            aria-pressed={isShuffle}
          >
            🔀
          </button>

          <button
            type="button"
            onClick={onPrevious}
            title="Canción anterior"
            aria-label="Canción anterior"
          >
            ⏮
          </button>

          <button
            type="button"
            className="player-play"
            onClick={togglePlay}
            aria-label={
              isPlaying ? "Pausar" : "Reproducir"
            }
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button
            type="button"
            onClick={onNext}
            title="Canción siguiente"
            aria-label="Canción siguiente"
          >
            ⏭
          </button>

          <button
            type="button"
            className={
              repeatMode !== "off"
                ? "player-mode active"
                : "player-mode"
            }
            onClick={toggleRepeat}
            title={
              repeatMode === "off"
                ? "Repetición desactivada"
                : repeatMode === "one"
                  ? "Repetir canción"
                  : "Repetir lista"
            }
            aria-label="Cambiar modo de repetición"
            aria-pressed={repeatMode !== "off"}
          >
            {repeatMode === "one" ? "🔂" : "🔁"}
          </button>
        </div>

        <div className="player-progress">
          <span>{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={Math.min(currentTime, duration || 0)}
            onChange={handleProgress}
            aria-label="Progreso de la canción"
          />

          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <span>🔊</span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolume}
          aria-label="Volumen"
        />
      </div>
    </div>
  );
}

export default MusicPlayer;
