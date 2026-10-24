
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { songs, composers } from "../data/musicData";

const MusicContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export function MusicProvider({ children }) {
  const [favorites, setFavorites] = useState(
    () => readStorage("wikicraft_music_favorites", [])
  );

  const [blockedSongs, setBlockedSongs] = useState(
    () => readStorage("wikicraft_music_blocked", [])
  );

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);

  // Estado para controlar el cartel de detalles de una canción.
  const [isSongDetailsOpen, setIsSongDetailsOpen] = useState(false);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [songDurations, setSongDurations] = useState({});

  useEffect(() => {
    localStorage.setItem(
      "wikicraft_music_favorites",
      JSON.stringify(favorites)
    );
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(
      "wikicraft_music_blocked",
      JSON.stringify(blockedSongs)
    );
  }, [blockedSongs]);

  // Carga anticipada de duraciones reales de los audios.
  useEffect(() => {
    let cancelled = false;
    let nextIndex = 0;
    const audio = new Audio();

    audio.preload = "metadata";

    const loadNext = () => {
      if (cancelled) return;

      if (nextIndex >= songs.length) {
        audio.removeAttribute("src");
        audio.load();
        return;
      }

      const song = songs[nextIndex++];

      if (!song?.audio) {
        loadNext();
        return;
      }

      audio.onloadedmetadata = () => {
        if (cancelled) return;

        const duration = audio.duration;

        if (Number.isFinite(duration) && duration > 0) {
          setSongDurations((previous) => ({
            ...previous,
            [song.id]: duration,
          }));
        }

        loadNext();
      };

      audio.onerror = () => {
        if (!cancelled) loadNext();
      };

      audio.src = song.audio;
      audio.load();
    };

    loadNext();

    return () => {
      cancelled = true;
      audio.onloadedmetadata = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  const isBlocked = useCallback(
    (songOrId) => {
      const id =
        typeof songOrId === "object" ? songOrId?.id : songOrId;

      return blockedSongs.includes(Number(id));
    },
    [blockedSongs]
  );

  const isFavorite = useCallback(
    (songOrId) => {
      const id =
        typeof songOrId === "object" ? songOrId?.id : songOrId;

      return favorites.includes(Number(id));
    },
    [favorites]
  );

  const toggleFavorite = useCallback((songOrId) => {
    const id = Number(
      typeof songOrId === "object" ? songOrId?.id : songOrId
    );

    if (!id) return;

    setFavorites((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }, []);

  const toggleBlocked = useCallback((songOrId) => {
    const id = Number(
      typeof songOrId === "object" ? songOrId?.id : songOrId
    );

    if (!id) return;

    setBlockedSongs((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );

    setCurrentSong((current) =>
      current?.id === id ? null : current
    );
  }, []);

  const playSong = useCallback(
    (songOrId, collection = songs) => {
      const song =
        typeof songOrId === "object"
          ? songOrId
          : songs.find((item) => item.id === Number(songOrId));

      if (!song || !song.audio || blockedSongs.includes(song.id)) {
        return;
      }

      const validQueue = (collection || [])
        .map((item) =>
          typeof item === "object"
            ? item
            : songs.find((entry) => entry.id === Number(item))
        )
        .filter(
          (item) =>
            item?.audio && !blockedSongs.includes(item.id)
        );

      const finalQueue = validQueue.some(
        (item) => item.id === song.id
      )
        ? validQueue
        : [song, ...validQueue];

      setQueue(finalQueue);
      setCurrentSong(song);
    },
    [blockedSongs]
  );

  const playCollection = useCallback(
    (collection, options = {}) => {
      let orderedQueue = (collection || []).filter(
        (song) =>
          song?.audio && !blockedSongs.includes(song.id)
      );

      if (!orderedQueue.length) return;

      orderedQueue = [...orderedQueue];

      if (options.shuffle) {
        for (let i = orderedQueue.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));

          [orderedQueue[i], orderedQueue[j]] = [
            orderedQueue[j],
            orderedQueue[i],
          ];
        }
      }

      setQueue(orderedQueue);
      setIsShuffle(Boolean(options.shuffle));
      setCurrentSong(orderedQueue[0]);
    },
    [blockedSongs]
  );

  const playNext = useCallback(
    (fromEnded = false) => {
      if (!queue.length || !currentSong) return;

      if (repeatMode === "one" && fromEnded) {
        setCurrentSong({ ...currentSong });
        return;
      }

      const currentIndex = queue.findIndex(
        (song) => song.id === currentSong.id
      );

      if (isShuffle) {
        const candidates = queue.filter(
          (song) =>
            song.id !== currentSong.id &&
            !blockedSongs.includes(song.id)
        );

        if (candidates.length) {
          setCurrentSong(
            candidates[
              Math.floor(Math.random() * candidates.length)
            ]
          );
        } else if (repeatMode !== "all" && fromEnded) {
          setCurrentSong(null);
        }

        return;
      }

      let nextIndex = currentIndex + 1;

      if (nextIndex >= queue.length) {
        if (repeatMode === "all") {
          nextIndex = 0;
        } else {
          if (fromEnded) setCurrentSong(null);
          return;
        }
      }

      for (let offset = 0; offset < queue.length; offset++) {
        const index = (nextIndex + offset) % queue.length;
        const candidate = queue[index];

        if (
          (repeatMode === "all" || index >= nextIndex) &&
          !blockedSongs.includes(candidate.id)
        ) {
          setCurrentSong(candidate);
          return;
        }
      }

      if (fromEnded) setCurrentSong(null);
    },
    [queue, currentSong, repeatMode, isShuffle, blockedSongs]
  );

  const playPrevious = useCallback(() => {
    if (!queue.length || !currentSong) return;

    const currentIndex = queue.findIndex(
      (song) => song.id === currentSong.id
    );

    for (let offset = 1; offset <= queue.length; offset++) {
      const index =
        (currentIndex - offset + queue.length) % queue.length;

      if (!blockedSongs.includes(queue[index].id)) {
        setCurrentSong(queue[index]);
        return;
      }
    }
  }, [queue, currentSong, blockedSongs]);

  const availableSongs = useMemo(
    () => songs.filter((song) => !blockedSongs.includes(song.id)),
    [blockedSongs]
  );

  const favoriteSongs = useMemo(
    () => songs.filter((song) => favorites.includes(song.id)),
    [favorites]
  );

  const getComposer = useCallback(
    (song) =>
      composers.find(
        (composer) => composer.id === song?.composerId
      ),
    []
  );

  const value = {
    favorites,
    favoriteSongs,
    blockedSongs,
    availableSongs,

    currentSong,
    setCurrentSong,
    queue,

    // Estado compartido del cartel de detalles.
    isSongDetailsOpen,
    setIsSongDetailsOpen,

    isShuffle,
    setIsShuffle,
    repeatMode,
    setRepeatMode,

    songDurations,
    setSongDurations,

    isBlocked,
    isFavorite,
    toggleFavorite,
    toggleBlocked,

    playSong,
    playCollection,
    playNext,
    playPrevious,
    getComposer,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error(
      "useMusic debe utilizarse dentro de MusicProvider."
    );
  }

  return context;
}
