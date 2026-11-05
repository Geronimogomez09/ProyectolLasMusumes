import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  songs as initialSongs,
  composers as initialComposers,
  albums as initialAlbums,
  playlists as initialPlaylists,
} from "../data/musicData";

import { useAuth } from "./AuthContext";
import { db } from "../services/firebase";

import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const MusicContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

function normalizarDocumento(documento) {
  const datos = documento.data();

  const status =
    datos.status ??
    (datos.published === false ? "draft" : "published");

  return {
    ...datos,
    id: Number(documento.id),
    status,
    published: status === "published",
    activo: datos.activo !== false,
  };
}

function contenidoPublico(documentos) {
  return documentos.filter(
    (item) => item.activo && item.status === "published"
  );
}

export function MusicProvider({ children }) {
  const { usuario } = useAuth();
  const uid = usuario?.uid;
  const uidPrevio = useRef(null);

  const [songs, setSongs] = useState(initialSongs);
  const [composers, setComposers] = useState(initialComposers);
  const [albums, setAlbums] = useState(initialAlbums);
  const [playlists, setPlaylists] = useState(initialPlaylists);

  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");

  // Reproducciones acumuladas por canción.
  const [rankingCounts, setRankingCounts] = useState({});

  useEffect(() => {
    setCatalogLoading(true);
    setCatalogError("");

    const colecciones = [
      { nombre: "canciones", actualizar: setSongs },
      { nombre: "compositores", actualizar: setComposers },
      { nombre: "albumes", actualizar: setAlbums },
      { nombre: "playlists", actualizar: setPlaylists },
    ];

    let coleccionesCargadas = 0;

    const desuscribir = colecciones.map(({ nombre, actualizar }) => {
      return onSnapshot(
        collection(db, nombre),
        (snapshot) => {
          const documentos = snapshot.docs.map(normalizarDocumento);

          actualizar(contenidoPublico(documentos));

          coleccionesCargadas += 1;

          if (coleccionesCargadas >= colecciones.length) {
            setCatalogLoading(false);
          }
        },
        (error) => {
          console.error(`Error al escuchar ${nombre}:`, error);
          setCatalogError("No se pudo sincronizar el catálogo musical.");
          setCatalogLoading(false);
        }
      );
    });

    return () => {
      desuscribir.forEach((funcion) => funcion());
    };
  }, []);

  // Preferencias musicales vinculadas a Firebase.
  const [favorites, setFavorites] = useState([]);
  const [followingComposers, setFollowingComposers] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const [blockedSongs, setBlockedSongs] = useState(
    () => readStorage("wikicraft_music_blocked", [])
  );

  // Escuchar favoritos, seguidos y playlists personales.
  useEffect(() => {
    if (!uid) {
      setFavorites([]);
      setFollowingComposers([]);
      setUserPlaylists([]);
      return undefined;
    }

    setFavorites([]);
    setFollowingComposers([]);
    setUserPlaylists([]);

    const favoritosRef = collection(db, "usuarios", uid, "favoritos");
    const seguidosRef = collection(db, "usuarios", uid, "seguidos");
    const playlistsRef = collection(db, "usuarios", uid, "playlists");

    const unsubscribeFavoritos = onSnapshot(
      favoritosRef,
      (snapshot) => {
        setFavorites(snapshot.docs.map((item) => Number(item.id)));
      },
      (error) => {
        console.error("Error al cargar favoritos:", error);
      }
    );

    const unsubscribeSeguidos = onSnapshot(
      seguidosRef,
      (snapshot) => {
        setFollowingComposers(
          snapshot.docs.map((item) => Number(item.id))
        );
      },
      (error) => {
        console.error("Error al cargar compositores seguidos:", error);
      }
    );

    const unsubscribePlaylists = onSnapshot(
      playlistsRef,
      (snapshot) => {
        setUserPlaylists(
          snapshot.docs.map((item) => ({
            ...item.data(),
            id: item.id,
            songs: Array.isArray(item.data().songs)
              ? item.data().songs.map(Number)
              : [],
          }))
        );
      },
      (error) => {
        console.error("Error al cargar playlists personales:", error);
      }
    );

    return () => {
      unsubscribeFavoritos();
      unsubscribeSeguidos();
      unsubscribePlaylists();
    };
  }, [uid]);

  // Escuchar el ranking compartido.
  useEffect(() => {
    if (!uid) {
      setRankingCounts({});
      return undefined;
    }

    const rankingRef = collection(db, "rankingMusical");

    const unsubscribe = onSnapshot(
      rankingRef,
      (snapshot) => {
        const ranking = {};

        snapshot.docs.forEach((documento) => {
          ranking[Number(documento.id)] =
            Number(documento.data().reproducciones) || 0;
        });

        setRankingCounts(ranking);
      },
      (error) => {
        console.error("Error al cargar el ranking:", error);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);

  const [isSongDetailsOpen, setIsSongDetailsOpen] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [songDurations, setSongDurations] = useState({});

  // Obtener la portada del álbum.
  const aplicarPortadaAlbum = useCallback(
    (song) => {
      if (!song) return song;

      const album = albums.find(
        (item) => item.id === Number(song.albumId)
      );

      return {
        ...song,
        cover: album?.cover || song.cover || "",
      };
    },
    [albums]
  );

  const songsWithAlbumCover = useMemo(
    () => songs.map(aplicarPortadaAlbum),
    [songs, aplicarPortadaAlbum]
  );

  useEffect(() => {
    localStorage.setItem(
      "wikicraft_music_blocked",
      JSON.stringify(blockedSongs)
    );
  }, [blockedSongs]);

  // Leer las duraciones reales de los audios.
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
  }, [songs]);

  // Registrar una reproducción en Firestore.
  const registrarReproduccion = useCallback(
    (songOrId) => {
      const songId = Number(
        typeof songOrId === "object"
          ? songOrId?.id
          : songOrId
      );

      if (!uid || !songId) return;

      setDoc(
        doc(db, "rankingMusical", String(songId)),
        {
          songId,
          reproducciones: increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ).catch((error) => {
        console.error(
          "No se pudo registrar la reproducción:",
          error
        );
      });
    },
    [uid]
  );

  const isBlocked = useCallback(
    (songOrId) => {
      const id =
        typeof songOrId === "object"
          ? songOrId?.id
          : songOrId;

      return blockedSongs.includes(Number(id));
    },
    [blockedSongs]
  );

  const isFavorite = useCallback(
    (songOrId) => {
      const id =
        typeof songOrId === "object"
          ? songOrId?.id
          : songOrId;

      return favorites.includes(Number(id));
    },
    [favorites]
  );

  // Favoritos.
  const toggleFavorite = useCallback(
    async (songOrId) => {
      const id = Number(
        typeof songOrId === "object"
          ? songOrId?.id
          : songOrId
      );

      if (!id || !uid) return;

      const favoritoRef = doc(
        db,
        "usuarios",
        uid,
        "favoritos",
        String(id)
      );

      const yaEsFavorita = favorites.includes(id);

      try {
        if (yaEsFavorita) {
          await deleteDoc(favoritoRef);
        } else {
          await setDoc(favoritoRef, {
            songId: id,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("No se pudo actualizar el favorito:", error);
      }
    },
    [favorites, uid]
  );

  const isFollowingComposer = useCallback(
    (composerOrId) => {
      const id = Number(
        typeof composerOrId === "object"
          ? composerOrId?.id
          : composerOrId
      );

      return followingComposers.includes(id);
    },
    [followingComposers]
  );

  // Seguir compositores.
  const toggleFollowComposer = useCallback(
    async (composerOrId) => {
      const id = Number(
        typeof composerOrId === "object"
          ? composerOrId?.id
          : composerOrId
      );

      if (!id || !uid) return;

      const seguidoRef = doc(
        db,
        "usuarios",
        uid,
        "seguidos",
        String(id)
      );

      const yaLoSigue = followingComposers.includes(id);

      try {
        if (yaLoSigue) {
          await deleteDoc(seguidoRef);
        } else {
          await setDoc(seguidoRef, {
            composerId: id,
            createdAt: serverTimestamp(),
          });
        }
      } catch (error) {
        console.error("No se pudo actualizar el seguimiento:", error);
      }
    },
    [followingComposers, uid]
  );

  // Crear playlist personal.
  const createUserPlaylist = useCallback(
    async (playlistData) => {
      if (!uid) return null;

      const nombre = playlistData?.name?.trim();

      if (!nombre) return null;

      try {
        const nuevaPlaylist = await addDoc(
          collection(db, "usuarios", uid, "playlists"),
          {
            name: nombre,
            description: playlistData.description?.trim() || "",
            cover: playlistData.cover || "",
            songs: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        return nuevaPlaylist.id;
      } catch (error) {
        console.error("No se pudo crear la playlist:", error);
        return null;
      }
    },
    [uid]
  );

  // Editar playlist personal.
  const updateUserPlaylist = useCallback(
    async (playlistId, changes) => {
      if (!uid || !playlistId) return;

      try {
        await updateDoc(
          doc(db, "usuarios", uid, "playlists", playlistId),
          {
            ...changes,
            updatedAt: serverTimestamp(),
          }
        );
      } catch (error) {
        console.error("No se pudo editar la playlist:", error);
      }
    },
    [uid]
  );

  // Eliminar playlist personal.
  const deleteUserPlaylist = useCallback(
    async (playlistId) => {
      if (!uid || !playlistId) return;

      try {
        await deleteDoc(
          doc(db, "usuarios", uid, "playlists", playlistId)
        );
      } catch (error) {
        console.error("No se pudo eliminar la playlist:", error);
      }
    },
    [uid]
  );

  // Agregar canción a playlist.
  const addSongToUserPlaylist = useCallback(
    async (playlistId, songOrId) => {
      const songId = Number(
        typeof songOrId === "object"
          ? songOrId?.id
          : songOrId
      );

      if (!uid || !playlistId || !songId) return;

      try {
        await updateDoc(
          doc(db, "usuarios", uid, "playlists", playlistId),
          {
            songs: arrayUnion(songId),
            updatedAt: serverTimestamp(),
          }
        );
      } catch (error) {
        console.error("No se pudo agregar la canción:", error);
      }
    },
    [uid]
  );

  // Quitar canción de playlist.
  const removeSongFromUserPlaylist = useCallback(
    async (playlistId, songOrId) => {
      const songId = Number(
        typeof songOrId === "object"
          ? songOrId?.id
          : songOrId
      );

      if (!uid || !playlistId || !songId) return;

      try {
        await updateDoc(
          doc(db, "usuarios", uid, "playlists", playlistId),
          {
            songs: arrayRemove(songId),
            updatedAt: serverTimestamp(),
          }
        );
      } catch (error) {
        console.error("No se pudo quitar la canción:", error);
      }
    },
    [uid]
  );

  // Bloquear o desbloquear canción.
  const toggleBlocked = useCallback((songOrId) => {
    const id = Number(
      typeof songOrId === "object"
        ? songOrId?.id
        : songOrId
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

  // Reproducir canción individual.
  const playSong = useCallback(
    (songOrId, collection = songsWithAlbumCover) => {
      const song = aplicarPortadaAlbum(
        typeof songOrId === "object"
          ? songOrId
          : songsWithAlbumCover.find(
              (item) => item.id === Number(songOrId)
            )
      );

      if (
        !song ||
        !song.audio ||
        blockedSongs.includes(song.id)
      ) {
        return;
      }

      registrarReproduccion(song);

      const validQueue = (collection || [])
        .map((item) => {
          const found =
            typeof item === "object"
              ? item
              : songsWithAlbumCover.find(
                  (entry) => entry.id === Number(item)
                );

          return aplicarPortadaAlbum(found);
        })
        .filter(
          (item) =>
            item?.audio &&
            !blockedSongs.includes(item.id)
        );

      const finalQueue = validQueue.some(
        (item) => item.id === song.id
      )
        ? validQueue
        : [song, ...validQueue];

      setQueue(finalQueue);
      setCurrentSong(song);
    },
    [
      blockedSongs,
      songsWithAlbumCover,
      aplicarPortadaAlbum,
      registrarReproduccion,
    ]
  );

  // Reproducir colección.
  const playCollection = useCallback(
    (collection, options = {}) => {
      let orderedQueue = (collection || [])
        .map(aplicarPortadaAlbum)
        .filter(
          (song) =>
            song?.audio &&
            !blockedSongs.includes(song.id)
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

      registrarReproduccion(orderedQueue[0]);

      setQueue(orderedQueue);
      setIsShuffle(Boolean(options.shuffle));
      setCurrentSong(orderedQueue[0]);
    },
    [blockedSongs, aplicarPortadaAlbum, registrarReproduccion]
  );

  // Siguiente canción.
  const playNext = useCallback(
    (fromEnded = false) => {
      if (!queue.length || !currentSong) return;

      if (repeatMode === "one" && fromEnded) {
        registrarReproduccion(currentSong);
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
          const candidata =
            candidates[Math.floor(Math.random() * candidates.length)];

          registrarReproduccion(candidata);
          setCurrentSong(candidata);
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
          registrarReproduccion(candidate);
          setCurrentSong(candidate);
          return;
        }
      }

      if (fromEnded) setCurrentSong(null);
    },
    [
      queue,
      currentSong,
      repeatMode,
      isShuffle,
      blockedSongs,
      registrarReproduccion,
    ]
  );

  // Canción anterior.
  const playPrevious = useCallback(() => {
    if (!queue.length || !currentSong) return;

    const currentIndex = queue.findIndex(
      (song) => song.id === currentSong.id
    );

    for (let offset = 1; offset <= queue.length; offset++) {
      const index =
        (currentIndex - offset + queue.length) % queue.length;

      if (!blockedSongs.includes(queue[index].id)) {
        registrarReproduccion(queue[index]);
        setCurrentSong(queue[index]);
        return;
      }
    }
  }, [queue, currentSong, blockedSongs, registrarReproduccion]);

  // Canciones disponibles y favoritas.
  const availableSongs = useMemo(
    () =>
      songsWithAlbumCover.filter(
        (song) => !blockedSongs.includes(song.id)
      ),
    [songsWithAlbumCover, blockedSongs]
  );

  const favoriteSongs = useMemo(
    () =>
      songsWithAlbumCover.filter((song) =>
        favorites.includes(song.id)
      ),
    [songsWithAlbumCover, favorites]
  );

  const getComposer = useCallback(
    (song) =>
      composers.find(
        (composer) =>
          composer.id === Number(song?.composerId)
      ),
    [composers]
  );

  const getAlbum = useCallback(
    (song) =>
      albums.find(
        (album) =>
          album.id === Number(song?.albumId)
      ),
    [albums]
  );

  const value = {
    songs: songsWithAlbumCover,
    composers,
    albums,
    playlists,

    catalogLoading,
    catalogError,

    favorites,
    favoriteSongs,
    followingComposers,
    userPlaylists,
    blockedSongs,
    availableSongs,

    rankingCounts,

    currentSong: aplicarPortadaAlbum(currentSong),
    setCurrentSong,
    queue: queue.map(aplicarPortadaAlbum),

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
    isFollowingComposer,
    toggleFollowComposer,

    createUserPlaylist,
    updateUserPlaylist,
    deleteUserPlaylist,
    addSongToUserPlaylist,
    removeSongFromUserPlaylist,

    toggleBlocked,

    playSong,
    playCollection,
    playNext,
    playPrevious,
    getComposer,
    getAlbum,
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