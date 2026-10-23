import React, { useEffect, useRef, useState } from "react";

function PlayerIcon({ name, className = "" }) {
  const common = {
    className: `player-icon ${className}`.trim(),
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
    case "shuffle":
      return <svg {...common}><path d="m16 3 4 4-4 4" /><path d="M4 7h2.5c4.5 0 6.5 10 11 10H20" /><path d="m16 13 4 4-4 4" /><path d="M4 17h2.5c1.4 0 2.5-1.1 3.7-2.6" /><path d="M14 9.5c1.1-1.4 2.1-2.5 3.5-2.5H20" /></svg>;
    case "previous":
      return <svg {...common}><path d="M6 5v14" /><path d="m19 5-10 7 10 7V5Z" /></svg>;
    case "play":
      return <svg {...common} fill="currentColor" stroke="none"><path d="M7 4.8a1 1 0 0 1 1.5-.86l10.1 7.06a1.2 1.2 0 0 1 0 2L8.5 20.06A1 1 0 0 1 7 19.2V4.8Z" /></svg>;
    case "pause":
      return <svg {...common} fill="currentColor" stroke="none"><rect x="6" y="4.5" width="4.3" height="15" rx="1" /><rect x="13.7" y="4.5" width="4.3" height="15" rx="1" /></svg>;
    case "next":
      return <svg {...common}><path d="M18 5v14" /><path d="m5 5 10 7-10 7V5Z" /></svg>;
    case "repeat":
      return <svg {...common}><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></svg>;
    case "repeat-one":
      return <svg {...common}><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /><path d="M12 10v5" /><path d="m10.5 11.5 1.5-1.5" /></svg>;
    case "volume":
      return <svg {...common}><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>;
    case "mute":
      return <svg {...common}><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m16 9 5 6" /><path d="m21 9-5 6" /></svg>;
    default:
      return null;
  }
}

export default function MusicPlayer({
  currentSong,
  onClose,
  isDetailsOpen = false,
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!currentSong?.audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }

    audio.src = currentSong.audio;
    audio.volume = volume;
    audio.load();

    let cancelled = false;
    const playAudio = async () => {
      try {
        await audio.play();
        if (!cancelled) setIsPlaying(true);
      } catch {
        if (!cancelled) setIsPlaying(false);
      }
    };
    playAudio();

    return () => {
      cancelled = true;
      audio.pause();
    };
  }, [currentSong, volume]);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    setDuration(audio.duration);
    if (currentSong?.id != null) {
      onDurationChange?.(currentSong.id, audio.duration);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio) return;
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

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

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

  const handleProgress = (event) => {
    const value = Number(event.target.value);
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (event) => {
    const value = Number(event.target.value);
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value;
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  };

  const toggleRepeat = () => {
    setRepeatMode((previous) => previous === "off" ? "one" : previous === "one" ? "all" : "off");
  };

  if (!currentSong) return null;

  return (
<div
  className={`music-player ${isDetailsOpen ? "details-open" : ""}`}
>
  <button
    type="button"
    className="player-close"
    onClick={onClose}
    aria-label="Cerrar reproductor"
    title="Cerrar reproductor"
  >
    ×
  </button>
      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />

      <div className="player-song">
        <img src={currentSong.cover} alt={currentSong.title} />
        <div>
          <strong>{currentSong.title}</strong>
          <span>{currentSong.composerName}</span>
        </div>
      </div>

      <div className="player-main">
        <div className="player-controls">
          <button
            type="button"
            className={isShuffle ? "player-mode active" : "player-mode"}
            onClick={() => setIsShuffle((previous) => !previous)}
            title="Aleatorio"
            aria-label="Activar o desactivar aleatorio"
            aria-pressed={isShuffle}
          ><PlayerIcon name="shuffle" /></button>

          <button type="button" onClick={onPrevious} title="Canción anterior" aria-label="Canción anterior">
            <PlayerIcon name="previous" />
          </button>

          <button type="button" className="player-play" onClick={togglePlay} aria-label={isPlaying ? "Pausar" : "Reproducir"}>
            <PlayerIcon name={isPlaying ? "pause" : "play"} />
          </button>

          <button type="button" onClick={onNext} title="Canción siguiente" aria-label="Canción siguiente">
            <PlayerIcon name="next" />
          </button>

          <button
            type="button"
            className={`player-mode ${repeatMode !== "off" ? "active" : ""} ${repeatMode === "one" ? "repeat-one" : ""}`}
            onClick={toggleRepeat}
            title={repeatMode === "off" ? "Repetición desactivada" : repeatMode === "one" ? "Repetir canción" : "Repetir lista"}
            aria-label="Cambiar modo de repetición"
            aria-pressed={repeatMode !== "off"}
          ><PlayerIcon name={repeatMode === "one" ? "repeat-one" : "repeat"} /></button>
        </div>

        <div className="player-progress">
          <span>{formatTime(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={handleProgress} disabled={!duration} aria-label="Progreso de la canción" />
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-volume">
        <span aria-hidden="true"><PlayerIcon name={volume === 0 ? "mute" : "volume"} /></span>
        <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolume} aria-label="Volumen" />
      </div>
    </div>
  );
}
