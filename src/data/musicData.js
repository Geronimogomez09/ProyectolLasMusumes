export const songs = [
  {
    id: 1,
    title: "Sweden",
    composerId: 1,
    duration: "3:35",
    audio: "/music/sweden.mp3",
    cover: "/music/covers/sweden.jpg",
    albumId: 1,
  },

  {
    id: 2,
    title: "Wet Hands",
    composerId: 1,
    duration: "1:30",
    audio: "/music/wet-hands.mp3",
    cover: "/music/covers/wet-hands.jpg",
    albumId: 1,
  },

  {
    id: 3,
    title: "Mice on Venus",
    composerId: 1,
    duration: "4:41",
    audio: "/music/mice-on-venus.mp3",
    cover: "/music/covers/mice-on-venus.jpg",
    albumId: 1,
  },

  {
    id: 4,
    title: "Haggstrom",
    composerId: 1,
    duration: "3:18",
    audio: "/music/haggstrom.mp3",
    cover: "/music/covers/haggstrom.jpg",
    albumId: 1,
  },

  {
    id: 5,
    title: "Minecraft",
    composerId: 1,
    duration: "4:14",
    audio: "/music/minecraft.mp3",
    cover: "/music/covers/minecraft.jpg",
    albumId: 1,
  },

  {
    id: 6,
    title: "Subwoofer Lullaby",
    composerId: 1,
    duration: "3:28",
    audio: "/music/subwoofer-lullaby.mp3",
    cover: "/music/covers/subwoofer-lullaby.jpg",
    albumId: 1,
  },
];

export const albums = [
  {
    id: 1,
    title: "Minecraft - Volume Alpha",
    composerId: 1,
    cover: "/music/covers/sweden.jpg",
    songs: [1, 2, 3, 4, 5, 6],
  },
];

export const playlists = [
  {
    id: 1,
    name: "Favoritos",
    description: "Tus canciones favoritas",
    cover: "/music/playlists/favoritos.jpg",
    system: true,
    songs: [],
  },

  {
    id: 2,
    name: "Exploración",
    description: "Música para explorar",
    cover: "/music/playlists/exploracion.jpg",
    system: false,
    songs: [1, 3, 4, 5],
  },

  {
    id: 3,
    name: "Relajación",
    description: "Una selección tranquila",
    cover: "/music/playlists/relajacion.jpg",
    system: false,
    songs: [2, 6],
  },
];

export const composers = [
  {
    id: 1,
    name: "C418",
    description:
      "Daniel Rosenfeld, conocido como C418, es un compositor y productor musical reconocido principalmente por crear gran parte de la música original de Minecraft.",
    image: "/music/composers/c418.jpg",
    songs: [1, 2, 3, 4, 5, 6],
    albums: [1],
  },
];