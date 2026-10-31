import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Header from '../components/header';
import Footer from '../components/Footer';
import BotonAdmin from '../components/botonAdmin';
import { useAuth } from '../context/AuthContext';
import '../styles/index.css';   // base + modo administrador (los estilos que ya tenías)
import '../styles/historia.css'; // estilos propios de esta página (línea de tiempo, aside, tarjetas)

// ---------------------------------------------------------------------------
// 1. IMÁGENES (todas vienen de internet)
//    - Texturas pixel art: repositorio público PrismarineJS/minecraft-assets.
//    - Cabezas de jugadores: mc-heads.net.
//    Si una imagen no carga, la tarjeta muestra un bloque de respaldo
//    (ver <ImagenEvento />), así el diseño nunca se rompe.
// ---------------------------------------------------------------------------
const BASE_TEXTURAS =
  'https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21.1';
const texBloque = (nombre) => `${BASE_TEXTURAS}/blocks/${nombre}.png`;
const texObjeto = (nombre) => `${BASE_TEXTURAS}/items/${nombre}.png`;
const texCabeza = (jugador) => `https://mc-heads.net/avatar/${jugador}/256`;

// ---------------------------------------------------------------------------
// 2. DATOS
//    Las ERAS agrupan los hitos. Cada hito tiene `era` (id de la era) y
//    `fecha` en formato ISO (sirve para ordenar); `fechaTexto` es lo que se ve.
//    `ajuste`: 'pixel' (texturas, se agrandan sin suavizar) o 'foto' (capturas).
//    Fechas verificadas con la Wikipedia (Development of Minecraft: Java Edition).
// ---------------------------------------------------------------------------
const ERAS = [
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

const TIPOS = ['Lanzamiento', 'Actualización', 'Hito', 'Plataforma', 'Empresa'];

const EVENTOS_INICIALES = [
  // ------------------------------ LOS ORÍGENES ------------------------------
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

  // ------------------------------- ALPHA Y BETA ------------------------------
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

  // --------------------------- LANZAMIENTO Y MOJANG --------------------------
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

  // ----------------------------- LA ERA MICROSOFT ----------------------------
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

  // -------------------------- GRANDES ACTUALIZACIONES ------------------------
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

  // ---------------------------------- GAME DROPS -----------------------------
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

// Texturas sugeridas en el formulario de administrador
const TEXTURAS_SUGERIDAS = [
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

const VACIO = {
  titulo: '', era: ERAS[0].id, fecha: '', fechaTexto: '', tipo: 'Actualización', version: '',
  descripcion: '', puntosTexto: '', imagen: '', ajuste: 'pixel', destacada: false,
};

// Si cambiás los datos de arriba y no ves cambios, es porque el navegador
// guardó la versión anterior: usá «Restaurar originales» o subí el número.
const CLAVE_GUARDADO = 'historia-minecraft-v1';

// ---------------------------------------------------------------------------
// 3. FUNCIONES AUXILIARES
// ---------------------------------------------------------------------------
function leerGuardado() {
  try {
    const crudo = window.localStorage.getItem(CLAVE_GUARDADO);
    const datos = crudo ? JSON.parse(crudo) : null;
    return Array.isArray(datos) && datos.length ? datos : null;
  } catch {
    return null;
  }
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const porFecha = (a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.id - b.id);

// Desplaza con suavidad, salvo que la persona haya pedido "reducir movimiento"
function desplazarA(id, alineacion = 'center') {
  const el = document.getElementById(id);
  if (!el) return;
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: alineacion });
}

// Cierra con Escape y bloquea el scroll de la página mientras hay una ventana abierta
function useModal(onCerrar) {
  useEffect(() => {
    const alTeclear = (ev) => { if (ev.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);
}

// ---------------------------------------------------------------------------
// 4. COMPONENTES PEQUEÑOS
// ---------------------------------------------------------------------------
const IconoEditar = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const IconoBorrar = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

// Imagen de internet con respaldo: si falla la carga se muestra un bloque dibujado con CSS
function ImagenEvento({ src, alt }) {
  const [fallo, setFallo] = useState(false);
  useEffect(() => { setFallo(false); }, [src]);

  if (!src || fallo) {
    return <span className="historia-media-vacia" role="img" aria-label="Imagen no disponible" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
    />
  );
}

// ---------------------------------------------------------------------------
// 5. TARJETA DE UN HITO
// ---------------------------------------------------------------------------
function TarjetaEvento({ evento: e, mostrarAnio, estado, modoAdmin, abierto, onToggle, onEditar, onEliminar }) {
  return (
    <article
      id={`evento-${e.id}`}
      className="historia-evento historia-revelar"
      data-era={e.era}
      data-evento={e.id}
      data-estado={estado}
    >
      <div className="historia-fecha">{mostrarAnio ? e.fecha.slice(0, 4) : ''}</div>

      <div className="historia-nodo" aria-hidden="true"><i /></div>

      <div className={`historia-card${e.destacada ? ' historia-card--destacada' : ''}`}>
        {modoAdmin && (
          <div className="inicio-admin-acciones">
            <button type="button" className="inicio-admin-btn" title="Editar"
              aria-label={`Editar ${e.titulo}`} onClick={() => onEditar(e)}>
              <IconoEditar />
            </button>
            <button type="button" className="inicio-admin-btn peligro" title="Eliminar"
              aria-label={`Eliminar ${e.titulo}`} onClick={() => onEliminar(e)}>
              <IconoBorrar />
            </button>
          </div>
        )}

        <div className={`historia-media historia-media--${e.ajuste === 'foto' ? 'foto' : 'pixel'}`}>
          <ImagenEvento src={e.imagen} alt={e.titulo} />
          <span className="historia-chip" data-tipo={e.tipo}>{e.tipo}</span>
          {e.version && <span className="historia-version">{e.version}</span>}
        </div>

        <div className="historia-card-cuerpo">
          <div className="historia-card-meta">
            <time dateTime={e.fecha}>{e.fechaTexto}</time>
            {e.destacada && <span className="historia-estrella">★ Hito clave</span>}
          </div>
          <h3>{e.titulo}</h3>
          <p>{e.descripcion}</p>

          {e.puntos?.length > 0 && (
            <>
              <div className="historia-detalle" id={`detalle-${e.id}`} data-abierto={abierto}>
                <ul>
                  {e.puntos.map((punto, i) => <li key={i}>{punto}</li>)}
                </ul>
              </div>
              <button
                type="button"
                className="inicio-enlace historia-mas"
                aria-expanded={abierto}
                aria-controls={`detalle-${e.id}`}
                onClick={() => onToggle(e.id)}
              >
                {abierto ? 'Ver menos' : 'Ver detalles'} <i aria-hidden="true">↓</i>
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// 6. ASIDE: mini línea de tiempo + zona actual
// ---------------------------------------------------------------------------
function AsideLinea({ grupos, zona, indiceActivo, indicePorId, pctRef, onIrEra, onIrEvento }) {
  const idxEra = grupos.findIndex((g) => g.era.id === zona.era);
  const eraActiva = idxEra >= 0 ? grupos[idxEra] : null;
  const eventoActivo = grupos.flatMap((g) => g.eventos).find((e) => e.id === zona.evento);

  return (
    <aside className="historia-aside" aria-label="Línea de tiempo">
      <div className="historia-aside-panel">
        <p className="historia-aside-etiqueta">Estás en</p>

        {/* key: al cambiar de era el bloque se vuelve a montar y repite su entrada suave */}
        <div className="historia-aside-zona" key={eraActiva ? eraActiva.era.id : 'inicio'}>
          <strong>{eraActiva ? eraActiva.era.nombre : 'El comienzo del viaje'}</strong>
          <span>
            {eventoActivo
              ? `${eventoActivo.fecha.slice(0, 4)} · ${eventoActivo.titulo}`
              : eraActiva ? eraActiva.era.rango : '2009 – hoy'}
          </span>
        </div>

        <div className="historia-aside-progreso">
          <div className="historia-aside-barra" role="presentation"><span /></div>
          <em ref={pctRef}>0%</em>
        </div>

        <nav className="historia-aside-nav" aria-label="Eras y hitos">
          <ol className="historia-aside-eras">
            {grupos.map((g, gi) => {
              const estadoEra = gi < idxEra ? 'pasada' : gi === idxEra ? 'activa' : 'futura';
              return (
                <li key={g.era.id} data-estado={estadoEra}>
                  <button
                    type="button"
                    className="historia-aside-era"
                    aria-current={estadoEra === 'activa' ? 'true' : undefined}
                    onClick={() => onIrEra(g.era.id)}
                  >
                    <span className="historia-aside-num">{gi + 1}</span>
                    <span className="historia-aside-era-texto">
                      <b>{g.era.nombre}</b>
                      <small>{g.era.rango}</small>
                    </span>
                  </button>

                  {/* Solo la era activa despliega sus hitos (animación con grid-template-rows) */}
                  <div className="historia-aside-sub" data-abierto={estadoEra === 'activa'}>
                    <ol className="historia-aside-eventos">
                      {g.eventos.map((ev) => {
                        const idx = indicePorId.get(ev.id);
                        const estado = idx < indiceActivo ? 'pasado' : idx === indiceActivo ? 'activo' : 'futuro';
                        return (
                          <li key={ev.id}>
                            <button
                              type="button"
                              className="historia-aside-ev"
                              data-estado={estado}
                              aria-current={estado === 'activo' ? 'location' : undefined}
                              onClick={() => onIrEvento(ev.id)}
                            >
                              <span className="historia-aside-punto" />
                              <span className="historia-aside-anio">{ev.fecha.slice(0, 4)}</span>
                              <span className="historia-aside-titulo">{ev.titulo}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </li>
              );
            })}
          </ol>
        </nav>

        <button
          type="button"
          className="inicio-enlace historia-aside-arriba"
          onClick={() => {
            const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
          }}
        >
          Volver arriba <i aria-hidden="true">↑</i>
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// 7. MODO ADMINISTRADOR: ventanas (usan las clases .inicio-modal-* de inicio.css)
// ---------------------------------------------------------------------------
function ModalEvento({ inicial, eraInicial, onGuardar, onCerrar }) {
  const [d, setD] = useState(() =>
    inicial
      ? { ...VACIO, ...inicial, puntosTexto: (inicial.puntos || []).join('\n') }
      : { ...VACIO, era: eraInicial || ERAS[0].id }
  );
  const [error, setError] = useState('');
  const primerCampo = useRef(null);

  useModal(onCerrar);
  useEffect(() => { primerCampo.current?.focus(); }, []);

  const cambiar = (campo) => (ev) => {
    const valor = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
    setD((previo) => ({ ...previo, [campo]: valor }));
  };

  function enviar(ev) {
    ev.preventDefault();
    if (!d.titulo.trim()) return setError('Escribí un título para el hito.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) return setError('Elegí una fecha válida.');
    if (!d.descripcion.trim()) return setError('Agregá una descripción.');
    if (d.imagen.trim() && !/^https?:\/\//i.test(d.imagen.trim())) {
      return setError('La imagen tiene que ser un enlace que empiece con http:// o https://');
    }

    onGuardar({
      id: inicial?.id,
      era: d.era,
      fecha: d.fecha,
      fechaTexto: d.fechaTexto.trim() || formatearFecha(d.fecha),
      tipo: d.tipo,
      version: d.version.trim(),
      titulo: d.titulo.trim(),
      descripcion: d.descripcion.trim(),
      puntos: d.puntosTexto.split('\n').map((p) => p.trim()).filter(Boolean),
      imagen: d.imagen.trim(),
      ajuste: d.ajuste,
      destacada: d.destacada,
    });
  }

  return (
    <div className="inicio-modal-fondo"
      onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onCerrar(); }}>
      <form className="inicio-modal" role="dialog" aria-modal="true"
        aria-labelledby="modal-evento-titulo" onSubmit={enviar} noValidate>
        <div className="inicio-modal-encabezado">
          <h2 className="inicio-modal-titulo" id="modal-evento-titulo">
            {inicial ? 'Editar hito' : 'Agregar hito'}
          </h2>
          <button type="button" className="inicio-admin-btn" aria-label="Cerrar" onClick={onCerrar}>×</button>
        </div>

        <div className="inicio-modal-cuerpo">
          <div className="inicio-campo">
            <label htmlFor="h-titulo">Título</label>
            <input id="h-titulo" ref={primerCampo} className="inicio-campo-control"
              value={d.titulo} onChange={cambiar('titulo')} maxLength={80} />
          </div>

          <div className="historia-form-fila">
            <div className="inicio-campo">
              <label htmlFor="h-fecha">Fecha</label>
              <input id="h-fecha" type="date" className="inicio-campo-control"
                value={d.fecha} onChange={cambiar('fecha')} />
            </div>
            <div className="inicio-campo">
              <label htmlFor="h-tipo">Tipo</label>
              <select id="h-tipo" className="inicio-campo-control" value={d.tipo} onChange={cambiar('tipo')}>
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="inicio-campo">
            <label htmlFor="h-fecha-texto">Texto de la fecha (opcional)</label>
            <input id="h-fecha-texto" className="inicio-campo-control" value={d.fechaTexto}
              onChange={cambiar('fechaTexto')} placeholder="Ej.: Fines de junio de 2010" />
            <span className="inicio-campo-ayuda">
              Si lo dejás vacío se arma solo a partir de la fecha, por ejemplo «17 de mayo de 2009».
            </span>
          </div>

          <div className="historia-form-fila">
            <div className="inicio-campo">
              <label htmlFor="h-era">Era</label>
              <select id="h-era" className="inicio-campo-control" value={d.era} onChange={cambiar('era')}>
                {ERAS.map((era) => <option key={era.id} value={era.id}>{era.nombre}</option>)}
              </select>
            </div>
            <div className="inicio-campo">
              <label htmlFor="h-version">Versión (opcional)</label>
              <input id="h-version" className="inicio-campo-control" value={d.version}
                onChange={cambiar('version')} placeholder="Ej.: 1.21" maxLength={40} />
            </div>
          </div>

          <div className="inicio-campo">
            <label htmlFor="h-desc">Descripción</label>
            <textarea id="h-desc" rows={4} className="inicio-campo-control"
              value={d.descripcion} onChange={cambiar('descripcion')} />
          </div>

          <div className="inicio-campo">
            <label htmlFor="h-puntos">Puntos clave (opcional)</label>
            <textarea id="h-puntos" rows={4} className="inicio-campo-control"
              value={d.puntosTexto} onChange={cambiar('puntosTexto')} />
            <span className="inicio-campo-ayuda">Uno por línea. Se ven al tocar «Ver detalles».</span>
          </div>

          <div className="inicio-campo">
            <label>Imagen</label>
            <div className="inicio-admin-imagen">
              <div className="historia-preview" data-ajuste={d.ajuste}>
                <ImagenEvento src={d.imagen.trim()} alt="Vista previa" />
              </div>
              <div className="inicio-admin-imagen-controles">
                <input className="inicio-campo-control" value={d.imagen} onChange={cambiar('imagen')}
                  placeholder="https://..." aria-label="Enlace de la imagen" />
                <select className="inicio-campo-control" value={d.ajuste} onChange={cambiar('ajuste')}
                  aria-label="Estilo de la imagen">
                  <option value="pixel">Pixel art / textura (se agranda sin suavizar)</option>
                  <option value="foto">Captura o foto (ocupa todo el recuadro)</option>
                </select>
              </div>
            </div>
            <span className="inicio-campo-ayuda">Pegá un enlace o elegí una textura:</span>
            <div className="inicio-admin-iconos">
              {TEXTURAS_SUGERIDAS.map(([nombre, url]) => (
                <button key={url} type="button" title={nombre} aria-label={nombre}
                  className={`inicio-admin-icono${d.imagen === url ? ' activo' : ''}`}
                  onClick={() => setD((p) => ({ ...p, imagen: url, ajuste: 'pixel' }))}>
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          </div>

          <label className="historia-check">
            <input type="checkbox" checked={d.destacada} onChange={cambiar('destacada')} />
            Marcar como hito clave
          </label>

          {error && <p className="inicio-campo-error" role="alert">{error}</p>}
        </div>

        <div className="inicio-modal-pie">
          <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="inicio-btn-principal">{inicial ? 'Guardar cambios' : 'Agregar hito'}</button>
        </div>
      </form>
    </div>
  );
}

function ModalConfirmar({ titulo, texto, textoBoton, onConfirmar, onCerrar }) {
  useModal(onCerrar);
  return (
    <div className="inicio-modal-fondo"
      onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onCerrar(); }}>
      <div className="inicio-modal inicio-modal-chico" role="alertdialog" aria-modal="true"
        aria-labelledby="modal-confirmar-titulo">
        <div className="inicio-modal-encabezado">
          <h2 className="inicio-modal-titulo" id="modal-confirmar-titulo">{titulo}</h2>
        </div>
        <div className="inicio-modal-cuerpo">
          <p className="inicio-modal-texto">{texto}</p>
        </div>
        <div className="inicio-modal-pie">
          <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button type="button" className="inicio-btn-peligro" onClick={onConfirmar}>{textoBoton}</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 8. PÁGINA
// ---------------------------------------------------------------------------
function Historia({ eventos: eventosProp }) {
  const [eventos, setEventos] = useState(() => eventosProp || leerGuardado() || EVENTOS_INICIALES);
  const { esAdmin } = useAuth();
  const [modoAdminAbierto, setModoAdmin] = useState(false);
  const modoAdmin = modoAdminAbierto && esAdmin; // solo el admin puede editar
  const [modal, setModal] = useState(null); // null | {tipo:'form'|'borrar'|'restaurar', ...}
  const [abiertos, setAbiertos] = useState({});
  const [zona, setZona] = useState({ era: null, evento: null }); // dónde está la persona

  const raizRef = useRef(null);
  const lineaRef = useRef(null);
  const pctRef = useRef(null);
  const cerrarModal = useCallback(() => setModal(null), []);

  // Guarda los cambios del administrador en el navegador
  useEffect(() => {
    try { window.localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(eventos)); } catch { /* sin storage */ }
  }, [eventos]);

  // Hitos agrupados por era y ordenados por fecha. Las eras vacías solo se ven en modo admin.
  const grupos = useMemo(
    () =>
      ERAS.map((era) => ({ era, eventos: eventos.filter((e) => e.era === era.id).sort(porFecha) }))
        .filter((g) => modoAdmin || g.eventos.length > 0),
    [eventos, modoAdmin]
  );
  const planos = useMemo(() => grupos.flatMap((g) => g.eventos), [grupos]);
  const indicePorId = useMemo(() => new Map(planos.map((e, i) => [e.id, i])), [planos]);

  // Posición del hito activo dentro de la lista completa (-1 = todavía no empezó)
  let indiceActivo = -1;
  if (zona.evento != null) {
    indiceActivo = planos.findIndex((e) => e.id === zona.evento);
  } else if (zona.era) {
    const primero = planos.findIndex((e) => e.era === zona.era);
    indiceActivo = primero >= 0 ? primero - 0.5 : -1;
  }

  // --- Scrollspy: detecta qué era / hito cruza una franja a ~40% de la pantalla ---
  useEffect(() => {
    const linea = lineaRef.current;
    if (!linea || !('IntersectionObserver' in window)) return undefined;
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          const era = en.target.dataset.era;
          const evento = en.target.dataset.evento ? Number(en.target.dataset.evento) : null;
          setZona((previa) => (previa.era === era && previa.evento === evento ? previa : { era, evento }));
        });
      },
      { rootMargin: '-38% 0px -58% 0px' }
    );
    linea.querySelectorAll('[data-era]').forEach((n) => observador.observe(n));
    return () => observador.disconnect();
  }, [grupos]);

  // --- Entrada suave: cada bloque aparece al llegar a la pantalla ---
  useEffect(() => {
    const nodos = lineaRef.current?.querySelectorAll('.historia-revelar:not([data-visible])');
    if (!nodos || nodos.length === 0) return undefined;
    if (!('IntersectionObserver' in window)) {
      nodos.forEach((n) => n.setAttribute('data-visible', ''));
      return undefined;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.setAttribute('data-visible', '');
          observador.unobserve(en.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    nodos.forEach((n) => observador.observe(n));
    return () => observador.disconnect();
  }, [grupos]);

  // --- Progreso: llena la línea verde y la barra del aside sin re-renderizar React ---
  useEffect(() => {
    const raiz = raizRef.current;
    const linea = lineaRef.current;
    if (!raiz || !linea) return undefined;
    let pendiente = false;

    const calcular = () => {
      pendiente = false;
      const caja = linea.getBoundingClientRect();
      const ancla = window.innerHeight * 0.4;
      const p = Math.min(1, Math.max(0, (ancla - caja.top) / caja.height));
      raiz.style.setProperty('--progreso', p.toFixed(4));
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
    };
    const alMover = () => {
      if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); }
    };

    calcular();
    window.addEventListener('scroll', alMover, { passive: true });
    window.addEventListener('resize', alMover);
    return () => {
      window.removeEventListener('scroll', alMover);
      window.removeEventListener('resize', alMover);
    };
  }, [grupos]);

  // --- Acciones ---
  const alternarDetalle = (id) => setAbiertos((previo) => ({ ...previo, [id]: !previo[id] }));

  function guardarEvento(datos) {
    const esNuevo = datos.id == null;
    const nuevoId = Math.max(0, ...eventos.map((e) => e.id)) + 1;
    setEventos((previo) =>
      esNuevo
        ? [...previo, { ...datos, id: nuevoId }]
        : previo.map((e) => (e.id === datos.id ? { ...e, ...datos } : e))
    );
    setModal(null);
    // Lleva a la persona al hito recién creado o editado
    setTimeout(() => desplazarA(`evento-${esNuevo ? nuevoId : datos.id}`), 150);
  }

  function eliminarEvento(id) {
    setEventos((previo) => previo.filter((e) => e.id !== id));
    setModal(null);
  }

  function restaurarOriginales() {
    setEventos(EVENTOS_INICIALES);
    setModal(null);
  }

  const idxEraActiva = grupos.findIndex((g) => g.era.id === zona.era);
  const eraActiva = idxEraActiva >= 0 ? grupos[idxEraActiva].era : null;
  const anios = new Date().getFullYear() - 2009;

  return (
    <>
      <Header />
      <div ref={raizRef} className={`inicio historia${modoAdmin ? ' inicio-modo-admin' : ''}`}>
        {/* ---------- HERO ---------- */}
        <header className="historia-hero">
          <div className="historia-cubos" aria-hidden="true">
            {['grass_block_side', 'tnt_side', 'emerald_block', 'netherrack', 'crafting_table_front'].map((b) => (
              <img key={b} className="historia-cubo" src={texBloque(b)} alt=""
                onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
            ))}
          </div>

          <div className="historia-hero-contenido">
            <span className="historia-eyebrow">Línea de tiempo</span>
            <h1>
              La historia de <span>Minecraft</span>
            </h1>
            <p>
              De un prototipo hecho en ratos libres a uno de los videojuegos más vendidos de todos los
              tiempos. Recorré cada hito del desarrollo, desde Cave Game hasta los game drops.
            </p>
            <div className="historia-stats">
              <div><strong>{anios}</strong><span>años de historia</span></div>
              <div><strong>{eventos.length}</strong><span>hitos en la línea</span></div>
              <div><strong>300 M+</strong><span>copias vendidas (dato de 2023)</span></div>
            </div>
            {grupos.length > 0 && (
              <button type="button" className="inicio-btn-principal"
                onClick={() => desplazarA(`era-${grupos[0].era.id}`, 'start')}>
                Empezar el recorrido
              </button>
            )}
          </div>
        </header>

        {/* Barra de progreso para pantallas chicas (reemplaza al aside) */}
        <div className="historia-mini" aria-hidden="true">
          <strong>{eraActiva ? eraActiva.nombre : 'El comienzo del viaje'}</strong>
          <div className="historia-aside-barra"><span /></div>
        </div>

        <div className="historia-layout">
          <AsideLinea
            grupos={grupos}
            zona={zona}
            indiceActivo={indiceActivo}
            indicePorId={indicePorId}
            pctRef={pctRef}
            onIrEra={(id) => desplazarA(`era-${id}`, 'start')}
            onIrEvento={(id) => desplazarA(`evento-${id}`, 'center')}
          />

          {/* ---------- LÍNEA DE TIEMPO ---------- */}
          <main className="historia-linea" ref={lineaRef}>
            {grupos.length === 0 && (
              <p className="inicio-vacio">
                Todavía no hay hitos. Activá el modo administrador para agregar el primero.
              </p>
            )}

            {grupos.map((g, gi) => (
              <section key={g.era.id} aria-labelledby={`titulo-${g.era.id}`}>
                <div id={`era-${g.era.id}`} className="historia-era historia-revelar" data-era={g.era.id}>
                  <div className="historia-fecha historia-fecha--era">Era {gi + 1}</div>
                  <div className="historia-nodo historia-nodo--era" aria-hidden="true"><b>{gi + 1}</b></div>
                  <div className="historia-era-card">
                    <img src={g.era.textura} alt="" loading="lazy"
                      onError={(ev) => { ev.currentTarget.style.display = 'none'; }} />
                    <div>
                      <span className="inicio-etiqueta">{g.era.rango}</span>
                      <h2 className="inicio-titulo" id={`titulo-${g.era.id}`}>
                        <span />
                        {g.era.nombre}
                      </h2>
                      <p>{g.era.descripcion}</p>
                    </div>
                  </div>
                </div>

                {g.eventos.map((ev, i) => {
                  const idx = indicePorId.get(ev.id);
                  const estado = idx < indiceActivo ? 'pasado' : idx === indiceActivo ? 'activo' : 'futuro';
                  return (
                    <TarjetaEvento
                      key={ev.id}
                      evento={ev}
                      mostrarAnio={i === 0 || g.eventos[i - 1].fecha.slice(0, 4) !== ev.fecha.slice(0, 4)}
                      estado={estado}
                      modoAdmin={modoAdmin}
                      abierto={Boolean(abiertos[ev.id])}
                      onToggle={alternarDetalle}
                      onEditar={(e) => setModal({ tipo: 'form', evento: e })}
                      onEliminar={(e) => setModal({ tipo: 'borrar', evento: e })}
                    />
                  );
                })}

                {modoAdmin && (
                  <div className="historia-evento historia-evento--agregar">
                    <div className="historia-nodo" aria-hidden="true"><i /></div>
                    <button type="button" className="inicio-admin-agregar compacto"
                      onClick={() => setModal({ tipo: 'form', evento: null, era: g.era.id })}>
                      <i aria-hidden="true">+</i>
                      Agregar hito a «{g.era.nombre}»
                    </button>
                  </div>
                )}
              </section>
            ))}
          </main>
        </div>

        {/* ---------- BOTÓN DE ADMINISTRADOR (solo admin) ---------- */}
        <BotonAdmin
          activo={modoAdmin}
          alAlternar={() => setModoAdmin((v) => !v)}
          aviso="Editá, agregá o eliminá hitos."
        >
          <button type="button" className="boton-admin-toggle"
            onClick={() => setModal({ tipo: 'restaurar' })}>
            Restaurar originales
          </button>
        </BotonAdmin>

        {/* ---------- VENTANAS ---------- */}
        {modal?.tipo === 'form' && (
          <ModalEvento
            inicial={modal.evento}
            eraInicial={modal.era}
            onGuardar={guardarEvento}
            onCerrar={cerrarModal}
          />
        )}
        {modal?.tipo === 'borrar' && (
          <ModalConfirmar
            titulo="Eliminar hito"
            texto={`¿Estás seguro de que querés eliminar «${modal.evento.titulo}»? Esta acción no se puede deshacer.`}
            textoBoton="Eliminar"
            onConfirmar={() => eliminarEvento(modal.evento.id)}
            onCerrar={cerrarModal}
          />
        )}
        {modal?.tipo === 'restaurar' && (
          <ModalConfirmar
            titulo="Restaurar originales"
            texto="Se van a perder los cambios que hiciste y la línea de tiempo vuelve a los hitos originales."
            textoBoton="Restaurar"
            onConfirmar={restaurarOriginales}
            onCerrar={cerrarModal}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

export default Historia;