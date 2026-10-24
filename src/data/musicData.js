
const DEFAULT_COVER = "/music/covers/sweden.jpg";

/**
 * Catálogo local de música.
 *
 * Estructura preparada para migrar posteriormente a una base de datos.
 * La duración no se define manualmente: la obtendrá el reproductor
 * leyendo los metadatos de cada archivo de audio.
 *
 * status:
 * - published: tiene archivo de audio disponible.
 * - draft: todavía falta completar algún dato o archivo.
 */

const createSong = (
  id,
  title,
  filename,
  composerId,
  albumId = null,
  cover = DEFAULT_COVER
) => ({
  id,
  title,
  composerId,
  albumId,
  audio: filename ? `/music/${filename}` : null,
  cover,
  duration: null,
  status: filename ? "published" : "draft",
  createdAt: null,
  updatedAt: null,
});

// =====================================================
// CANCIONES
// =====================================================

export const songs = [
  // MINECRAFT - VOLUME ALPHA
  createSong(1, "Sweden", "sweden.mp3", 1, 1, "/music/covers/sweden.jpg"),
  createSong(2, "Wet Hands", "wet-hands.mp3", 1, 1, "/music/covers/wet-hands.jpg"),
  createSong(3, "Mice on Venus", "mice-on-venus.mp3", 1, 1, "/music/covers/mice-on-venus.jpg"),
  createSong(4, "Haggstrom", "haggstrom.mp3", 1, 1, "/music/covers/haggstrom.jpg"),
  createSong(5, "Minecraft", "minecraft.mp3", 1, 1, "/music/covers/minecraft.jpg"),
  createSong(6, "Subwoofer Lullaby", "subwoofer-lullaby.mp3", 1, 1, "/music/covers/subwoofer-lullaby.jpg"),

  // MINECRAFT - VOLUME BETA
  createSong(7, "Ki", "ki.mp3", 1, 2),
  createSong(8, "Alpha", "alpha.mp3", 1, 2),
  createSong(9, "Dead Voxel", "dead-voxel.mp3", 1, 2),
  createSong(10, "Moog City 2", "moog-city-2.mp3", 1, 2),
  createSong(11, "Aria Math", "aria-math.mp3", 1, 2),
  createSong(12, "Blind Spots", "blind-spots.mp3", 1, 2),
  createSong(13, "Flake", "flake.mp3", 1, 2),
  createSong(14, "Concrete Halls", "concrete-halls.mp3", 1, 2),
  createSong(15, "Biome Fest", "biome-fest.mp3", 1, 2),
  createSong(16, "Mutation", "mutation.mp3", 1, 2),
  createSong(17, "Haunt Muskie", "haunt-muskie.mp3", 1, 2),
  createSong(18, "Warmth", "warmth.mp3", 1, 2),
  createSong(19, "Floating Trees", "floating-trees.mp3", 1, 2),
  createSong(20, "Kyoto", "kyoto.mp3", 1, 2),
  createSong(21, "Ballad of the Cats", "ballad-of-the-cats.mp3", 1, 2),
  createSong(22, "Taswell", "taswell.mp3", 1, 2),
  createSong(23, "Beginning 2", "beginning-2.mp3", 1, 2),
  createSong(24, "Dreiton", "dreiton.mp3", 1, 2),
  createSong(25, "The End", "the-end.mp3", 1, 2),
  createSong(26, "Chirp", "chirp.mp3", 1, 2),
  createSong(27, "Wait", "wait.mp3", 1, 2),
  createSong(28, "Mellohi", "mellohi.mp3", 1, 2),
  createSong(29, "Stal", "stal.mp3", 1, 2),
  createSong(30, "Strad", "strad.mp3", 1, 2),
  createSong(31, "Eleven", "eleven.mp3", 1, 2),
  createSong(32, "Ward", "ward.mp3", 1, 2),
  createSong(33, "Mall", "mall.mp3", 1, 2),
  createSong(34, "Blocks", "blocks.mp3", 1, 2),
  createSong(35, "Far", "far.mp3", 1, 2),
  createSong(36, "Intro", "intro.mp3", 1, 2),

  // NETHER UPDATE
  createSong(37, "Chrysopoeia", "chrysopoeia.mp3", 2, 3),
  createSong(38, "Rubedo", "rubedo.mp3", 2, 3),
  createSong(39, "So Below", "so-below.mp3", 2, 3),
  createSong(40, "Pigstep (Mono Mix)", "pigstep-mono.mp3", 2, 3),
  createSong(41, "Pigstep (Stereo Mix)", "pigstep-stereo.mp3", 2, 3),

  // VOLUME ALPHA - CANCIONES AGREGADAS
  createSong(42, "Beginning", "beginning.mp3", 1, 1),
  createSong(43, "Cat", "cat.mp3", 1, 1),
  createSong(44, "Chris", "chris.mp3", 1, 1),
  createSong(45, "Clark", "clark.mp3", 1, 1),
  createSong(46, "Danny", "danny.mp3", 1, 1),
  createSong(47, "Death", "death.mp3", 1, 1),
  createSong(48, "Dog", "dog.mp3", 1, 1),
  createSong(49, "Door", "door.mp3", 1, 1),
  createSong(50, "Droopy likes ricochet", "droopy-likes-ricochet.mp3", 1, 1),
  createSong(51, "Droopy likes your face", "droopy-likes-your-face.mp3", 1, 1),
  createSong(52, "Dry Hands", "dry-hands.mp3", 1, 1),
  createSong(53, "Équinoxe", "equinoxe.mp3", 1, 1),
  createSong(54, "Excuse", "excuse.mp3", 1, 1),
  createSong(55, "Key", "key.mp3", 1, 1),
  createSong(56, "Living Mice", "living-mice.mp3", 1, 1),
  createSong(57, "Moog City", "moog-city.mp3", 1, 1),
  createSong(58, "Oxygène", "oxygene.mp3", 1, 1),
  createSong(59, "Thirteen", "thirteen.mp3", 1, 1),

  // CAVES & CLIFFS
  createSong(60, "Stand Tall", "stand-tall.mp3", 2, 4),
  createSong(61, "Left to Bloom", "left-to-bloom.mp3", 2, 4),
  createSong(62, "Ancestry", "ancestry.mp3", 2, 4),
  createSong(63, "Wending", "wending.mp3", 2, 4),
  createSong(64, "Infinite Amethyst", "infinite-amethyst.mp3", 2, 4),
  createSong(65, "One More Day", "one-more-day.mp3", 2, 4),
  createSong(66, "otherside", "otherside.mp3", 2, 4),
  createSong(67, "Floating Dream", "floating-dream.mp3", 6, 4),
  createSong(68, "Comforting Memories", "comforting-memories.mp3", 6, 4),
  createSong(69, "An Ordinary Day", "an-ordinary-day.mp3", 6, 4),

  // THE WILD UPDATE
  createSong(70, "Firebugs", "firebugs.mp3", 2, 5),
  createSong(71, "Aerie", "aerie.mp3", 2, 5),
  createSong(72, "Labyrinthine", "labyrinthine.mp3", 2, 5),
  createSong(73, "Five", "five.mp3", 4, 5),

  // TRAILS & TALES
  createSong(74, "Echo in the Wind", "echo-in-the-wind.mp3", 5, 6),
  createSong(75, "A Familiar Room", "a-familiar-room.mp3", 5, 6),
  createSong(76, "Bromeliad", "bromeliad.mp3", 5, 6),
  createSong(77, "Crescent Dunes", "crescent-dunes.mp3", 5, 6),
  createSong(78, "Relic", "relic.mp3", 5, 6),

  // TRICKY TRIALS
  createSong(79, "Featherfall", "featherfall.mp3", 5, 7),
  createSong(80, "Watcher", "watcher.mp3", 5, 7),
  createSong(81, "Puzzlebox", "puzzlebox.mp3", 5, 7),
  createSong(82, "komorebi", "komorebi.mp3", 6, 7),
  createSong(83, "pokopoko", "pokopoko.mp3", 6, 7),
  createSong(84, "yakusoku", "yakusoku.mp3", 6, 7),
  createSong(85, "Deeper", "deeper.mp3", 2, 7),
  createSong(86, "Eld Unknown", "eld-unknown.mp3", 2, 7),
  createSong(87, "Endless", "endless.mp3", 2, 7),
  createSong(88, "Creator", "creator.mp3", 2, 7),
  createSong(89, "Creator (Music Box Version)", "creator-music-box-version.mp3", 2, 7),
  createSong(90, "Precipice", "precipice.mp3", 5, 7),

  // CHASE THE SKIES
  createSong(91, "Lilypad", "lilypad.mp3", 7, 8),
  createSong(92, "Below and Above", "below-and-above.mp3", 7, 8),
  createSong(93, "O's Piano", "os-piano.mp3", 7, 8),
  createSong(94, "Broken Clocks", "broken-clocks.mp3", 7, 8),
  createSong(95, "Fireflies", "fireflies.mp3", 7, 8),
  createSong(96, "Tears", "tears.mp3", 7, 8),

  // CHAOS CUBED
  createSong(97, "Memories", "memories.mp3", 8, 9),
  createSong(98, "Ebb", "ebb.mp3", 8, 9),
  createSong(99, "Home", "home.mp3", 8, 9),
  createSong(100, "Shores", "shores.mp3", 8, 9),
  createSong(101, "Nightly", "nightly.mp3", 8, 9),
  createSong(102, "Bounce", "bounce.mp3", 8, 9),

  // ÁLBUMES INDIVIDUALES
  createSong(103, "11 (Music Disc)", "disc-11.mp3", 1, 11),
  createSong(104, "Axolotl", "axolotl.mp3", 1, 12),
  createSong(105, "Dragon Fish", "dragon-fish.mp3", 1, 13),
  createSong(106, "Shuniji", "shuniji.mp3", 2, 14),
  createSong(107, "Boss", "boss.mp3", 1, 15),

  // LAVA CHICKEN
  createSong(108, "Lava Chicken", "lava-chicken.mp3", 9, 10),
];

// =====================================================
// ÁLBUMES
// =====================================================

const albumDefinitions = [
  {
    id: 1,
    title: "Minecraft - Volume Alpha",
    composerId: 1,
    composerIds: [1],
    cover: "/music/covers/volume-alpha.jpg",
    description: "Banda sonora original de Minecraft compuesta por C418.",
    status: "published",
  },
  {
    id: 2,
    title: "Minecraft - Volume Beta",
    composerId: 1,
    composerIds: [1],
    cover: "/music/covers/volume-beta.jpg",
    description: "Segundo volumen de la banda sonora de Minecraft de C418.",
    status: "published",
  },
  {
    id: 3,
    title: "Minecraft: Nether Update",
    composerId: 2,
    composerIds: [2],
    cover: "/music/covers/nether-update.jpg",
    description: "Música asociada a la actualización del Nether.",
    status: "published",
  },
  {
    id: 4,
    title: "Minecraft: Caves & Cliffs",
    composerId: 2,
    composerIds: [2, 6],
    cover: "/music/covers/caves-and-cliffs.jpg",
    description: "Música de las actualizaciones Caves & Cliffs.",
    status: "published",
  },
  {
    id: 5,
    title: "Minecraft: The Wild Update",
    composerId: 2,
    composerIds: [2, 4],
    cover: "/music/covers/the-wild-update.jpg",
    description: "Música asociada a The Wild Update.",
    status: "published",
  },
  {
    id: 6,
    title: "Minecraft: Trails & Tales",
    composerId: 5,
    composerIds: [5],
    cover: "/music/covers/trails-and-tales.jpg",
    description: "Banda sonora de Trails & Tales.",
    status: "published",
  },
  {
    id: 7,
    title: "Minecraft: Tricky Trials",
    composerId: 5,
    composerIds: [2, 5, 6],
    cover: "/music/covers/tricky-trials.jpg",
    description: "Música asociada a la actualización Tricky Trials.",
    status: "published",
  },
  {
    id: 8,
    title: "Minecraft: Chase the Skies",
    composerId: 7,
    composerIds: [7],
    cover: "/music/covers/chase-the-skies.jpg",
    description: "Banda sonora de Chase the Skies.",
    status: "published",
  },
  {
    id: 9,
    title: "Minecraft: Chaos Cubed",
    composerId: 8,
    composerIds: [8],
    cover: "/music/covers/chaos-cubed.jpg",
    description: "Música asociada a Chaos Cubed.",
    status: "published",
  },
  {
    id: 10,
    title: "Lava Chicken",
    composerId: 9,
    composerIds: [9],
    cover: "/music/covers/lava-chicken.jpg",
    description: "Disco musical Lava Chicken.",
    status: "published",
  },
    {
    id: 11,
    title: "Minecraft: Music Disc 11",
    composerId: 1,
    composerIds: [1],
    cover: "/music/covers/music-disc-11.jpg",
    description: "Álbum dedicado al disco musical 11 de Minecraft.",
    status: "published",
  },
  {
    id: 12,
    title: "Minecraft: Axolotl",
    composerId: 1,
    composerIds: [1],
    cover: "/music/covers/axolotl.jpg",
    description: "Álbum dedicado a la pista Axolotl.",
    status: "published",
  },
  {
    id: 13,
    title: "Minecraft: Dragon Fish",
    composerId: 1,
    composerIds: [1],
    cover: "/music/covers/dragon-fish.jpg",
    description: "Álbum dedicado a la pista Dragon Fish.",
    status: "published",
  },
  {
    id: 14,
    title: "Minecraft: Shuniji",
    composerId: 2,
    composerIds: [2],
    cover: "/music/covers/shuniji.jpg",
    description: "Álbum dedicado a la pista Shuniji.",
    status: "published",
  },
  {
    id: 15,
    title: "Minecraft: Boss",
    composerId: 1,
    composerIds: [1],
    cover: "/music/covers/boss.jpg",
    description: "Álbum dedicado a la pista Boss.",
    status: "published",
  },
];

export const albums = albumDefinitions.map((album) => ({
  ...album,
  songs: songs
    .filter((song) => song.albumId === album.id)
    .map((song) => song.id),
}));
// Cada canción utiliza la portada de su álbum.
songs.forEach((song) => {
  const album = albums.find((item) => item.id === song.albumId);

  if (album) {
    song.cover = album.cover;
  }
});
// =====================================================
// LISTAS DE REPRODUCCIÓN
// =====================================================

export const playlists = [
  {
    id: 1,
    title: "Favoritos",
    description: "Tus canciones favoritas.",
    cover: "/music/favoritos.gif",
    songs: [],
    system: true,
    status: "published",
  },
  {
    id: 2,
    title: "Exploración",
    description: "Música para recorrer nuevos mundos.",
    cover: "/music/exploracion.gif",
    songs: [1, 3, 4, 5, 7, 10],
    system: false,
    status: "published",
  },
  {
    id: 3,
    title: "Relajación",
    description: "Sonidos tranquilos para descansar.",
    cover: "/music/relajacion.gif",
    songs: [2, 6, 8, 11],
    system: false,
    status: "published",
  },
  {
  id: 4,
  title: "Construcción",
  description: "Música para construir y dar vida a tus ideas.",
  cover: "/music/construccion.gif",
  songs: [1, 3, 4, 5],
  system: false,
  status: "published"
},
];

// =====================================================
// COMPOSITORES
// =====================================================

const composerDefinitions = [
  {
    id: 1,
    name: "C418",
    realName: "Daniel Rosenfeld",
    description:
      "Compositor y productor de la banda sonora clásica de Minecraft.",
    image: "/music/composers/c418.jpg",
  },
  {
    id: 2,
    name: "Lena Raine",
    realName: "Lena Raine",
    description:
      "Compositora que creó música para distintas actualizaciones de Minecraft.",
    image: "/music/composers/lena-raine.jpg",
  },
  {
    id: 4,
    name: "Samuel Åberg",
    realName: "Samuel Åberg",
    description:
      "Compositor y diseñador de sonido que trabajó en música de Minecraft.",
    image: "/music/composers/samuel-aberg.jpg",
  },
  {
    id: 5,
    name: "Aaron Cherof",
    realName: "Aaron Cherof",
    description:
      "Compositor de música para distintas actualizaciones de Minecraft.",
    image: "/music/composers/aaron-cherof.jpg",
  },
  {
    id: 6,
    name: "Kumi Tanioka",
    realName: "Kumi Tanioka",
    description:
      "Compositora y pianista que contribuyó a la música de Minecraft.",
    image: "/music/composers/kumi-tanioka.jpg",
  },
  {
    id: 7,
    name: "Amos Roddy",
    realName: "Amos Roddy",
    description:
      "Compositor de la banda sonora de Chase the Skies.",
    image: "/music/composers/amos-roddy.jpg",
  },
  {
    id: 8,
    name: "fingerspit",
    realName: "Paula Ruiz",
    description:
      "Artista musical asociado a la banda sonora de Chaos Cubed.",
    image: "/music/composers/fingerspit.jpg",
  },
  {
    id: 9,
    name: "Hyper Potions",
    realName: "Hyper Potions",
    description:
      "Dúo de música electrónica responsable del tema Lava Chicken.",
    image: "/music/composers/hyper-potions.jpg",
  },
];

export const composers = composerDefinitions.map((composer) => ({
  ...composer,
  songs: songs
    .filter((song) => song.composerId === composer.id)
    .map((song) => song.id),
  albums: albums
    .filter((album) =>
      (album.composerIds ?? [album.composerId]).includes(composer.id)
    )
    .map((album) => album.id),
}));

// =====================================================
// FUNCIONES DE CONSULTA
// =====================================================

export const getSongById = (id) =>
  songs.find((song) => song.id === Number(id)) ?? null;

export const getAlbumById = (id) =>
  albums.find((album) => album.id === Number(id)) ?? null;

export const getComposerById = (id) =>
  composers.find((composer) => composer.id === Number(id)) ?? null;

export const getSongsByAlbum = (albumId) =>
  songs.filter((song) => song.albumId === Number(albumId));

export const getSongsByComposer = (composerId) =>
  songs.filter((song) => song.composerId === Number(composerId));

export const getPublishedSongs = () =>
  songs.filter((song) => song.status === "published" && song.audio);

export const getDraftSongs = () =>
  songs.filter((song) => song.status === "draft");