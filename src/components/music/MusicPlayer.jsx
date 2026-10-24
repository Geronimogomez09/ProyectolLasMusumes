import React, {
  useEffect,
  useRef,
  useState,
} from "react";

function MusicPlayer({
  currentSong,
  onNext,
  onPrevious,
}) {
  const audioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!currentSong || !audioRef.current) {
      return;
    }

    const audio = audioRef.current;

    audio.src = currentSong.audio;
    audio.load();

    setCurrentTime(0);

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

  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) {
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) {
      return;
    }

    setDuration(audioRef.current.duration);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) {
      return;
    }

    setCurrentTime(audioRef.current.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onNext();
  };

  const handleProgress = (event) => {
    const value = Number(event.target.value);

    if (!audioRef.current) {
      return;
    }

    audioRef.current.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolume = (event) => {
    const value = Number(event.target.value);

    setVolume(value);

    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return `${minutes}:${remaining
      .toString()
      .padStart(2, "0")}`;
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
          <button onClick={onPrevious}>
            ⏮
          </button>

          <button
            className="player-play"
            onClick={togglePlay}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          <button onClick={onNext}>
            ⏭
          </button>
        </div>

        <div className="player-progress">
          <span>{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgress}
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
        />
      </div>
    </div>
  );
}

export default MusicPlayer;