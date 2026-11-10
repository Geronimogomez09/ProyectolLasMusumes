// DATOS HISTORIA: guarda la información fija de la página Historia (eras, hitos iniciales,
// tipos de hito, texturas sugeridas y formulario vacío). Se usa en historia.jsx y en los
// componentes de components/historia. No tiene lógica: solo datos.
//
// ÍNDICE
// - Texturas e imágenes: direcciones para bloques, objetos y cabezas.
// - Eras e hitos: contenido inicial de la línea de tiempo.
// - Tipos, texturas sugeridas y formulario: opciones para administrar hitos.

// ----------------- Texturas e imágenes -----------------
// Origen: imágenes públicas de PrismarineJS y mc-heads.net.
// Si una imagen no carga, la tarjeta muestra un bloque de respaldo (ver ImagenEvento).
// TEXTURAS DE INTERNET: dirección base de las imágenes pixel art de bloques y objetos
// (repositorio público PrismarineJS/minecraft-assets). Cabezas de jugadores: mc-heads.net.
const BASE_TEXTURAS =
  'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.1';

// FUNCIONES DE TEXTURA: reciben un nombre y devuelven la dirección de una imagen.
export const texBloque = (nombre) => `${BASE_TEXTURAS}/blocks/${nombre}.png`;
export const texObjeto = (nombre) => `${BASE_TEXTURAS}/items/${nombre}.png`;
export const texCabeza = (jugador) => `https://mc-heads.net/avatar/${jugador}/256`;

// ----------------- Eras e hitos -----------------
// ERAS: etapas de la historia que agrupan los hitos. Cada hito tiene `era` con el id de una era.
// Se muestran como tarjeta grande de era (EraHistoria) y como ítem del aside (AsideLinea).
export const ERAS = [
  {
    id: 'origenes',
    nombre: 'Los orígenes',
    rango: '2009 – 2010',
    textura: texBloque('grass_block_side'),
    descripcion:
      'Un prototipo en Java, un foro de desarrolladores independientes y un mundo hecho de bloques.',
  },
  {
    id: 'alpha-beta',
    nombre: 'Alpha y Beta',
    rango: '2010 – 2011',
    textura: texBloque('netherrack'),
    descripcion: 'El juego se vende antes de estar terminado y crece con actualizaciones muy frecuentes.',
  },
  {
    id: 'mojang',
    nombre: 'Lanzamiento y Mojang',
    rango: '2011 – 2014',
    textura: texObjeto('ender_eye'),
    descripcion: 'La versión 1.0, el relevo de Notch a Jeb y los años de Mojang como estudio independiente.',
  },
  {
    id: 'microsoft',
    nombre: 'La era Microsoft',
    rango: '2014 – 2019',
    textura: texBloque('emerald_block'),
    descripcion: 'La compra por 2.500 millones de dólares, el combate rehecho y la unificación en Bedrock.',
  },
  {
    id: 'grandes',
    nombre: 'Grandes actualizaciones',
    rango: '2020 – 2024',
    textura: texObjeto('netherite_ingot'),
    descripcion: 'Una gran actualización por año: el Nether, las cuevas, el Deep Dark, la arqueología y las Cámaras de Prueba.',
  },
  {
    id: 'drops',
    nombre: 'Game drops',
    rango: '2024 – hoy',
    textura: texObjeto('bundle'),
    descripcion: 'Entregas más chicas y frecuentes, versiones por calendario y un Minecraft que no deja de cambiar.',
  },
];

// ----------------- Opciones del formulario -----------------
// TIPOS DE HITO: opciones del selector "Tipo" en el formulario de administrador (ModalEvento).
export const TIPOS = ['Lanzamiento', 'Actualización', 'Hito', 'Plataforma', 'Empresa'];

// EVENTOS INICIALES: datos de respaldo de la línea de tiempo y base de "Restaurar originales".
// Entradas: registros con fecha ISO para ordenar y fechaTexto para mostrar.
// `ajuste` indica si la imagen se recorta como pixel art o como fotografía.
export const EVENTOS_INICIALES = [
  // ----------------- Los orígenes -----------------
  {
    id: 1, era: 'origenes', fecha: '2009-05-17', fechaTexto: '13 – 17 de mayo de 2009',
    tipo: 'Hito', version: 'Cave Game', destacada: true, ajuste: 'pixel',
    titulo: 'Nace Cave Game',
    descripcion:
      'Markus «Notch» Persson sube un video de su prototipo el 13 de mayo y, el 17, publica una versión en los foros de TIGSource. El mundo eran apenas bloques de pasto y de piedra que se podían poner y sacar.',
    puntos: [
      'Inspirado en Infiniminer y en RubyDung, un proyecto anterior de Persson',
      'Programado en Java',
      'Primero se llamó Minecraft: Order of the Stone y después, simplemente, Minecraft',
    ],
    imagen: texBloque('cobblestone'),
  },
  {
    id: 2, era: 'origenes', fecha: '2009-09-01', fechaTexto: '2009',
    tipo: 'Actualización', version: 'Classic', destacada: false, ajuste: 'pixel',
    titulo: 'Minecraft Classic: multijugador y supervivencia',
    descripcion:
      'Persson sigue actualizando el juego según lo que opina el foro. Aparecen ramas de prueba con partidas en línea y un modo con barra de vida y monstruos.',
    puntos: [
      'Multiplayer Test: las primeras partidas multijugador',
      'Survival Test: zombis, esqueletos y creepers',
      'C418 compone las primeras músicas ambientales',
    ],
    imagen: texObjeto('gunpowder'),
  },
  {
    id: 3, era: 'origenes', fecha: '2009-12-23', fechaTexto: '23 de diciembre de 2009',
    tipo: 'Actualización', version: 'Indev', destacada: false, ajuste: 'pixel',
    titulo: 'Indev: llega el crafteo',
    descripcion:
      'A pedido del público, Persson abre una rama de desarrollo para quienes tenían cuenta paga. Termina creciendo mucho más de lo planeado y deja de llevar número de versión.',
    puntos: [
      'Crafteo y fundición: la base del modo Supervivencia',
      'Herramientas, cultivos y ciclo de día y noche',
      'Iluminación dinámica',
    ],
    imagen: texBloque('crafting_table_front'),
  },
  {
    id: 4, era: 'origenes', fecha: '2010-02-27', fechaTexto: '27 de febrero de 2010',
    tipo: 'Actualización', version: 'Infdev', destacada: false, ajuste: 'pixel',
    titulo: 'Infdev: mundos infinitos',
    descripcion: 'Persson empieza a experimentar con mundos sin límites y abre una nueva rama de desarrollo.',
    puntos: ['El mundo se genera a medida que el jugador avanza', 'Es el paso previo a la fase Alpha'],
    imagen: texObjeto('map'),
  },

  // ----------------- Alpha y Beta -----------------
  {
    id: 5, era: 'alpha-beta', fecha: '2010-06-30', fechaTexto: 'Fines de junio de 2010',
    tipo: 'Lanzamiento', version: 'Alpha', destacada: true, ajuste: 'pixel',
    titulo: 'Comienza la fase Alpha',
    descripcion:
      'Minecraft entra en Alpha: las actualizaciones son frecuentes y a veces llegan sin aviso. Con las ventas, Persson renuncia a su empleo en 2010 para dedicarse al juego y funda Mojang junto a Jakob Porsér y Carl Manneh.',
    puntos: [
      'Se suma la redstone, un material que transmite señales',
      'Con ella los jugadores construyen mecanismos e incluso computadoras',
      'Las ventas de la Alpha terminan superando el sueldo de Persson',
    ],
    imagen: texObjeto('redstone'),
  },
  {
    id: 6, era: 'alpha-beta', fecha: '2010-10-30', fechaTexto: '30 de octubre de 2010',
    tipo: 'Actualización', version: 'Alpha 1.2.0', destacada: false, ajuste: 'pixel',
    titulo: 'La actualización de Halloween: biomas y Nether',
    descripcion:
      'Llegan los biomas —desiertos, bosques, tundras nevadas— y una dimensión infernal a la que se entra por un portal construido por el jugador.',
    puntos: ['Primer Nether: lava, monstruos y los ghasts que lanzan bolas de fuego', 'Distintos biomas dentro de un mismo mundo'],
    imagen: texBloque('netherrack'),
  },
  {
    id: 7, era: 'alpha-beta', fecha: '2010-12-20', fechaTexto: '20 de diciembre de 2010',
    tipo: 'Lanzamiento', version: 'Beta 1.0', destacada: false, ajuste: 'pixel',
    titulo: 'Empieza la Beta',
    descripcion:
      'Minecraft pasa a Beta con huevos arrojables y hojas que se caen solas. El precio sube de 10 a 14,75 euros y, en enero de 2011, el juego supera el millón de copias vendidas.',
    puntos: [
      'Durante 2011 llegan las camas, los lobos domesticables, los mapas y las trampillas',
      'Los pistones, movidos con redstone, aparecen en la Beta 1.7',
    ],
    imagen: texObjeto('egg'),
  },
  {
    id: 8, era: 'alpha-beta', fecha: '2011-09-14', fechaTexto: '14 de septiembre de 2011',
    tipo: 'Actualización', version: 'Beta 1.8', destacada: false, ajuste: 'pixel',
    titulo: 'Adventure Update',
    descripcion: 'Rehace la generación del mundo y el movimiento del jugador, y suma la barra de hambre y el modo Creativo.',
    puntos: [
      'Nuevos biomas, barrancos y aldeas (todavía sin habitantes)',
      'Correr y golpes críticos',
      'Comer repone la barra de hambre en lugar de curar directamente',
      'Modo Creativo: sin daño, con vuelo y bloques ilimitados',
    ],
    imagen: texObjeto('cooked_beef'),
  },

  // ----------------- Lanzamiento y Mojang -----------------
  {
    id: 9, era: 'mojang', fecha: '2011-11-18', fechaTexto: '18 de noviembre de 2011',
    tipo: 'Lanzamiento', version: '1.0.0', destacada: true, ajuste: 'pixel',
    titulo: 'Minecraft 1.0: el lanzamiento oficial',
    descripcion:
      'Durante la MineCon 2011 el juego sale de la Beta. Iba a ser la Beta 1.9, pero se lo bautizó 1.0.0 para marcar la versión completa.',
    puntos: [
      'Aparece el End y su jefe final, el Ender Dragon',
      'Encantamientos para herramientas, armas y armaduras',
      'Aldeanos y fortalezas del Nether',
      'La Beta ya había vendido más de 4 millones de copias',
    ],
    imagen: texObjeto('ender_eye'),
  },
  {
    id: 10, era: 'mojang', fecha: '2011-12-02', fechaTexto: 'Diciembre de 2011',
    tipo: 'Hito', version: '', destacada: false, ajuste: 'pixel',
    titulo: 'Jeb toma el mando',
    descripcion:
      'Tras el lanzamiento, Notch cede el control creativo a Jens «Jeb» Bergensten y se dedica a otro proyecto, 0x10c, que después fue abandonado.',
    puntos: [
      'Con Jeb las actualizaciones se vuelven temáticas',
      'La Redstone Update (13 de marzo de 2013) inaugura una serie de updates enfocadas en una sola idea',
    ],
    imagen: texCabeza('jeb_'),
  },
  {
    id: 11, era: 'mojang', fecha: '2012-05-09', fechaTexto: '9 de mayo de 2012',
    tipo: 'Plataforma', version: 'Xbox 360', destacada: false, ajuste: 'pixel',
    titulo: 'Minecraft llega a las consolas',
    descripcion: 'El juego sale en Xbox 360 como descarga de Xbox Live Arcade, por 1.600 Microsoft Points (19,99 dólares).',
    puntos: ['Primera versión para consola', 'Empieza a expandirse más allá de la PC'],
    imagen: texObjeto('compass_00'),
  },
  {
    id: 12, era: 'mojang', fecha: '2012-10-25', fechaTexto: '25 de octubre de 2012',
    tipo: 'Actualización', version: '1.4', destacada: false, ajuste: 'pixel',
    titulo: 'Pretty Scary Update',
    descripcion: 'Una actualización con aire de Halloween que suma al Wither, a las brujas y herramientas nuevas para construir.',
    puntos: ['El Wither: un jefe que se invoca con bloques', 'Yunques para reparar y encantar', 'Balizas, marcos para ítems y macetas'],
    imagen: texObjeto('nether_star'),
  },
  {
    id: 13, era: 'mojang', fecha: '2013-10-25', fechaTexto: '25 de octubre de 2013',
    tipo: 'Actualización', version: '1.7', destacada: false, ajuste: 'pixel',
    titulo: 'The Update that Changed the World',
    descripcion: 'Cambia por completo la generación del mundo: 11 biomas nuevos y mucha más variedad de terreno.',
    puntos: ['Sabanas, mesetas y bosques de distintos tipos', 'Nuevo tipo de mundo «amplificado»', 'Arena roja, podzol y hielo compacto'],
    imagen: texBloque('grass_block_side'),
  },
  {
    id: 14, era: 'mojang', fecha: '2014-09-15', fechaTexto: '15 de septiembre de 2014',
    tipo: 'Empresa', version: '', destacada: true, ajuste: 'pixel',
    titulo: 'Microsoft compra Mojang',
    descripcion:
      'Microsoft anuncia la compra de Mojang y de la propiedad intelectual de Minecraft por 2.500 millones de dólares. El trato se cierra el 6 de noviembre.',
    puntos: [
      'Persson había publicado en junio que buscaba vender su parte, agotado por la presión',
      'Persson, Porsér y Manneh dejan la empresa',
      'Las grandes actualizaciones se frenan hasta febrero de 2016',
    ],
    imagen: texBloque('emerald_block'),
  },

  // ----------------- La era Microsoft -----------------
  {
    id: 15, era: 'microsoft', fecha: '2016-02-29', fechaTexto: '29 de febrero de 2016',
    tipo: 'Actualización', version: '1.9', destacada: false, ajuste: 'pixel',
    titulo: 'Combat Update',
    descripcion: 'El primer gran update tras la compra. Rehace el combate y amplía la dimensión del End.',
    puntos: [
      'Enfriamiento de ataque y mano secundaria',
      'El escudo, que absorbe casi todo el daño',
      'Ciudades del End y élitros para planear',
      'Fue polémica: parte de la comunidad PvP decidió no actualizar',
    ],
    imagen: texObjeto('elytra'),
  },
  {
    id: 16, era: 'microsoft', fecha: '2017-09-20', fechaTexto: '20 de septiembre de 2017',
    tipo: 'Plataforma', version: 'Better Together', destacada: true, ajuste: 'pixel',
    titulo: 'Better Together: nace Bedrock',
    descripcion:
      'Unifica las versiones de Windows 10, consolas y móviles bajo el nombre Minecraft: Bedrock Edition. La versión original de PC pasa a llamarse Java Edition.',
    puntos: ['Una sola base para Windows 10, consolas y móviles', 'Desde entonces conviven las ediciones Java y Bedrock'],
    imagen: texBloque('beacon'),
  },
  {
    id: 17, era: 'microsoft', fecha: '2018-07-18', fechaTexto: '18 de julio de 2018',
    tipo: 'Actualización', version: '1.13', destacada: false, ajuste: 'pixel',
    titulo: 'Update Aquatic',
    descripcion: 'Un rediseño total de los océanos, que dejan de ser un enorme bloque de agua vacío.',
    puntos: [
      'Corales, pastos marinos, naufragios y tesoros enterrados',
      'Peces como criaturas, delfines y tortugas marinas',
      'El ahogado y el tridente',
      'Nueva mecánica de natación',
    ],
    imagen: texObjeto('trident'),
  },
  {
    id: 18, era: 'microsoft', fecha: '2019-04-23', fechaTexto: '23 de abril de 2019',
    tipo: 'Actualización', version: '1.14', destacada: false, ajuste: 'pixel',
    titulo: 'Village & Pillage',
    descripcion: 'Renueva aldeas y aldeanos y agrega un evento en el que las aldeas son atacadas.',
    puntos: [
      'Cada aldeano tiene un oficio que depende de su bloque de trabajo',
      'Incursiones (raids) de illagers',
      'Pandas, zorros, ballestas, fogatas y bambú',
    ],
    imagen: texObjeto('crossbow_standby'),
  },

  // ----------------- Grandes actualizaciones -----------------
  {
    id: 19, era: 'grandes', fecha: '2020-06-23', fechaTexto: '23 de junio de 2020',
    tipo: 'Actualización', version: '1.16', destacada: false, ajuste: 'pixel',
    titulo: 'Nether Update',
    descripcion: 'El Nether se vuelve variado, peligroso y, por fin, útil.',
    puntos: [
      'Biomas nuevos: valles de almas, deltas de basalto y bosques carmesí y distorsionado',
      'Piglins, que comercian a cambio de oro',
      'Netherita: la mejora para el equipo de diamante',
      'Ancla de reaparición y el disco Pigstep, de Lena Raine',
    ],
    imagen: texObjeto('netherite_ingot'),
  },
  {
    id: 20, era: 'grandes', fecha: '2021-06-08',
    fechaTexto: 'Parte I: 8 de junio de 2021 · Parte II: 30 de noviembre de 2021',
    tipo: 'Actualización', version: '1.17 / 1.18', destacada: true, ajuste: 'pixel',
    titulo: 'Caves & Cliffs',
    descripcion:
      'La actualización más ambiciosa hasta ese momento se dividió en dos para no apurarla. La primera parte trajo cobre, amatistas y ajolotes; la segunda rehízo el mundo.',
    puntos: [
      'La altura del mundo pasa de 256 a 384 bloques',
      'Montañas más altas y cuevas más profundas, con biomas nuevos',
      'Ajolotes, cabras montesas y calamares luminosos',
      'El Deep Dark y la arqueología quedaron para más adelante',
    ],
    imagen: texBloque('amethyst_block'),
  },
  {
    id: 21, era: 'grandes', fecha: '2022-06-07', fechaTexto: '7 de junio de 2022',
    tipo: 'Actualización', version: '1.19', destacada: false, ajuste: 'pixel',
    titulo: 'The Wild Update',
    descripcion: 'Suma el pantano de manglar y el Deep Dark, con el temido Warden.',
    puntos: [
      'Ranas, renacuajos y botes con cofre',
      'Bloques sculk que detectan vibraciones',
      'Parte de la comunidad la apodó «The Mild Update» por su cantidad de contenido',
      'La 1.19.1 (28 de junio) sumó los reportes de chat, muy debatidos',
    ],
    imagen: texBloque('sculk_catalyst_side'),
  },
  {
    id: 22, era: 'grandes', fecha: '2023-06-07', fechaTexto: '7 de junio de 2023',
    tipo: 'Actualización', version: '1.20', destacada: false, ajuste: 'pixel',
    titulo: 'Trails & Tales',
    descripcion: 'Una actualización de exploración y personalización que por fin trae la arqueología.',
    puntos: [
      'Arqueología con pincel y cerámicas decoradas',
      'El sniffer y los camellos',
      'Bosque de cerezos y madera de bambú',
      'Ornamentos para armaduras y carteles colgantes',
    ],
    imagen: texObjeto('brush'),
  },
  {
    id: 23, era: 'grandes', fecha: '2024-06-13', fechaTexto: '13 de junio de 2024',
    tipo: 'Actualización', version: '1.21', destacada: false, ajuste: 'pixel',
    titulo: 'Tricky Trials',
    descripcion: 'Fue la última gran actualización anual antes de cambiar de estrategia.',
    puntos: [
      'Cámaras de Prueba con generadores de monstruos y botín',
      'El Mace, un arma que castiga las caídas',
      'El Breeze y las cargas de viento',
      'El Crafter, una mesa de crafteo automática',
    ],
    imagen: texObjeto('mace'),
  },

  // ----------------- Game drops -----------------
  {
    id: 24, era: 'drops', fecha: '2024-09-10', fechaTexto: 'Septiembre de 2024',
    tipo: 'Hito', version: '', destacada: true, ajuste: 'pixel',
    titulo: 'Mojang cambia el ritmo: game drops',
    descripcion:
      'Mojang anuncia que deja las grandes actualizaciones anuales por entregas más chicas y frecuentes. El primer drop, Bats and Pots, había salido el 5 de diciembre de 2023 y recibió su nombre de forma retroactiva.',
    puntos: [
      'Armored Paws (23 de abril de 2024): armadillos y lobos distintos según el bioma',
      'Bundles of Bravery (22 de octubre de 2024): bundles que guardan varios ítems en un solo espacio',
      'The Garden Awakens (3 de diciembre de 2024): el Jardín Pálido y el Creaking',
    ],
    imagen: texObjeto('bundle'),
  },
  {
    id: 25, era: 'drops', fecha: '2025-03-25', fechaTexto: 'Marzo – diciembre de 2025',
    tipo: 'Actualización', version: '', destacada: false, ajuste: 'pixel',
    titulo: 'Un año entero de drops',
    descripcion: 'Con el nuevo esquema, 2025 trae cuatro entregas. Las luciérnagas, planeadas para 2022, vuelven en la primera.',
    puntos: [
      'Spring to Life (25 de marzo): luciérnagas, arbustos y variantes de vaca, cerdo y gallina',
      'Chase the Skies (17 de junio): el happy ghast y la barra de localización de jugadores',
      'Copper Age (30 de septiembre): el golem de cobre y el equipo de cobre',
      'Mounts of Mayhem (9 de diciembre): la lanza y los nautilos que se pueden montar',
    ],
    imagen: texObjeto('copper_ingot'),
  },
  {
    id: 26, era: 'drops', fecha: '2025-12-02', fechaTexto: '2 de diciembre de 2025',
    tipo: 'Hito', version: '26.1', destacada: false, ajuste: 'pixel',
    titulo: 'Las versiones pasan a medirse por calendario',
    descripcion:
      'Mojang anuncia que abandona la numeración clásica (1.21.x) y desde 2026 usará versiones por calendario. La próxima entrega se llamará 26.1.',
    puntos: ['El primer número indica el año', 'Las versiones de Java y de Bedrock pueden no coincidir'],
    imagen: texObjeto('clock_00'),
  },
  {
    id: 27, era: 'drops', fecha: '2026-03-24', fechaTexto: '24 de marzo de 2026',
    tipo: 'Actualización', version: '26.1', destacada: false, ajuste: 'pixel',
    titulo: 'Tiny Takeover',
    descripcion: 'Rediseña a las crías de casi todos los animales, con nuevos modelos y animaciones.',
    puntos: [
      'Diente de león dorado: detiene el crecimiento de una cría',
      'Las etiquetas de nombre se pueden craftear',
    ],
    imagen: texObjeto('wheat'),
  },
  {
    id: 28, era: 'drops', fecha: '2026-06-16', fechaTexto: '16 de junio de 2026',
    tipo: 'Actualización', version: '26.2', destacada: true, ajuste: 'pixel',
    titulo: 'Chaos Cubed',
    descripcion: 'Un bioma subterráneo de azufre, tan colorido como peligroso, y un mob con físicas propias.',
    puntos: [
      'Cuevas de azufre con bloques de azufre y cinabrio, aguas termales y géiseres',
      'El cubo de azufre: rebota como una pelota y cambia según el bloque que traga',
      'Java Edition avanza de OpenGL hacia Vulkan',
    ],
    imagen: texBloque('glowstone'),
  },
  {
    id: 29, era: 'drops', fecha: '2026-09-15', fechaTexto: '15 de septiembre de 2026',
    tipo: 'Actualización', version: '26.3 (Java) · 26.50 (Bedrock)', destacada: true, ajuste: 'pixel',
    titulo: 'Wilderness Bound',
    descripcion: 'El tercer drop de 2026 apuesta por la exploración del Overworld: un bosque otoñal y campamentos abandonados.',
    puntos: [
      'Bosque moteado con álamos de hojas rojas, naranjas y amarillas',
      'Campamentos abandonados en 18 biomas, con botín y mapas del explorador',
      'Cojines para sentarse y camas de paja',
      'Escaleras y losas para los 16 colores de lana y de concreto',
    ],
    imagen: texBloque('pumpkin_side'),
  },
];

// TEXTURAS SUGERIDAS: imágenes que el administrador puede elegir con un clic en el formulario
// de hito (ModalEvento). Cada elemento es [nombre, dirección].
export const TEXTURAS_SUGERIDAS = [
  ['Roca', texBloque('cobblestone')],
  ['Tierra', texBloque('dirt')],
  ['Pasto', texBloque('grass_block_side')],
  ['Mesa de crafteo', texBloque('crafting_table_front')],
  ['TNT', texBloque('tnt_side')],
  ['Netherrack', texBloque('netherrack')],
  ['Esmeralda', texBloque('emerald_block')],
  ['Baliza', texBloque('beacon')],
  ['Redstone', texObjeto('redstone')],
  ['Ojo de Ender', texObjeto('ender_eye')],
  ['Netherita', texObjeto('netherite_ingot')],
  ['Élitros', texObjeto('elytra')],
];

// FORMULARIO VACÍO: valores iniciales del formulario de hito (ModalEvento) cuando se agrega
// un hito nuevo. La era por defecto es la primera de ERAS; el formulario lo completa el usuario.
export const VACIO = {
  titulo: '', era: ERAS[0].id, fecha: '', fechaTexto: '', tipo: 'Actualización', version: '',
  descripcion: '', puntosTexto: '', imagen: '', ajuste: 'pixel', destacada: false,
};