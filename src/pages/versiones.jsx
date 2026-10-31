import { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/Footer';
import BotonAdmin from '../components/botonAdmin';
import { useAuth } from '../context/AuthContext';
import TarjetaVersion from '../components/versionesComponentes/tarjeta-version';
import AgregarVersion from '../components/versionesComponentes/agregar-version';
import '../styles/versiones.css';

// ---------------------------------------------------------------------------
// DATOS: versiones reales de Minecraft (Java/Bedrock), con fechas y
// contenido verificados. `fecha` va en formato ISO (yyyy-mm-dd) para poder
// comparar con los filtros de rango; `fechaLegible` es la que se muestra.
// ---------------------------------------------------------------------------
const versionesIniciales = [
  {
    id: 1,
    numero: '1.19',
    nombre: 'The Wild Update',
    edicion: ['Java', 'Bedrock'],
    fecha: '2022-06-07',
    fechaLegible: '7 de junio de 2022',
    imagen: '../public/fondos/fondo2.png',
    descripcion:
      'Expande el mundo subterráneo y los pantanos, con una de las criaturas más temidas del juego: el Warden.',
    nuevasFunciones: [
      'El Warden detecta por sonido y vibraciones, no por vista',
      'Botes con cofre',
    ],
    correcciones: [],
    cambios: ['Los pantanos ahora pueden generar como Pantano de Mangle'],
    nuevosBloques: ['Bloques Sculk', 'Sensor Sculk', 'Catalizador Sculk', 'Chirrido Sculk'],
    nuevasCriaturas: ['Warden', 'Rana', 'Renacuajo', 'Allay'],
    nuevosBiomas: ['Deep Dark', 'Pantano de Mangle'],
    destacada: false,
    comentarios: [],
  },
  {
    id: 2,
    numero: '1.20',
    nombre: 'Trails & Tales',
    edicion: ['Java', 'Bedrock'],
    fecha: '2023-06-07',
    fechaLegible: '7 de junio de 2023',
    imagen: '../public/fondos/fondo3.png',
    descripcion:
      'Una actualización dedicada a la exploración y la narrativa, con un nuevo sistema de arqueología.',
    nuevasFunciones: [
      'Arqueología: cepillá arena o grava sospechosa para encontrar objetos',
      'Carteles colgantes',
      'Botes con cofre para todas las maderas',
    ],
    correcciones: [],
    cambios: ['Los cofres decorados ahora se craftean con cerámicas en vez de ser solo loot'],
    nuevosBloques: ['Madera de bambú', 'Cerámicas decoradas', 'Carteles colgantes'],
    nuevasCriaturas: ['Sniffer', 'Camello'],
    nuevosBiomas: ['Bosque de cerezos'],
    destacada: false,
    comentarios: [
      {
        id: 201,
        usuario: 'PicapiedraXd',
        inicial: 'P',
        colorAvatar: '#7a5c3e',
        texto: 'El sniffer me parece la criatura más tierna que agregaron en años :esmeralda:',
      },
    ],
  },
  {
    id: 3,
    numero: '1.21',
    nombre: 'Tricky Trials',
    edicion: ['Java', 'Bedrock'],
    fecha: '2024-06-13',
    fechaLegible: '13 de junio de 2024',
    imagen: '../public/fondos/fondo4.png',
    descripcion:
      'Centrada en el combate y una nueva estructura subterránea para explorar: las Cámaras de Prueba.',
    nuevasFunciones: [
      'Generador de Prueba y Generador de Prueba Ominoso',
      'El Mace: arma cuerpo a cuerpo con ataque de impacto al caer',
      'El Crafter: bloque que automatiza recetas de crafteo',
    ],
    correcciones: [],
    cambios: ['Encantamientos, pinturas y discos de música ahora funcionan mediante data packs'],
    nuevosBloques: ['Variantes de cobre y toba', 'Macetas decoradas craftables'],
    nuevasCriaturas: ['Breeze', 'Bogged'],
    nuevosBiomas: [],
    destacada: false,
    comentarios: [
      {
        id: 301,
        usuario: 'Nether_Kaiser',
        inicial: 'N',
        colorAvatar: '#b3462c',
        texto: 'El Mace con Density rompe cualquier mob de un golpe si caés desde suficiente altura',
      },
      {
        id: 302,
        usuario: 'ModderaEterna',
        inicial: 'M',
        colorAvatar: '#4a6fa5',
        texto: 'El Crafter todavía no lo vi bien aprovechado, alguien armó algo piola con él? :diamante:',
      },
    ],
  },
  {
    id: 4,
    numero: '26.1',
    nombre: 'Tiny Takeover',
    edicion: ['Java', 'Bedrock'],
    fecha: '2026-03-24',
    fechaLegible: '24 de marzo de 2026',
    imagen: '../public/fondos/fondo5.png',
    descripcion:
      'El primer drop de 2026: rediseño visual completo de las crías de los animales, más mejoras técnicas.',
    nuevasFunciones: [
      'Diente de león dorado: congela o reanuda el crecimiento de una cría',
      'Carteles con nombre ahora craftables',
      'Nuevo instrumento de trompeta para el bloque de nota',
    ],
    correcciones: [],
    cambios: [
      'Nuevos modelos y animaciones para la mayoría de las crías de animales',
      'Java Edition pasa a requerir Java 25',
    ],
    nuevosBloques: [],
    nuevasCriaturas: [],
    nuevosBiomas: [],
    destacada: true,
    comentarios: [],
  },
  {
    id: 5,
    numero: '26.2',
    nombre: 'Chaos Cubed',
    edicion: ['Java', 'Bedrock'],
    fecha: '2026-06-16',
    fechaLegible: '16 de junio de 2026',
    imagen: '../public/fondos/fondo6.png',
    descripcion:
      'Un nuevo bioma subterráneo tan colorido como peligroso, protagonizado por un mob con físicas propias: el Sulfur Cube.',
    nuevasFunciones: ['Lista de amigos integrada', 'Renderizador Vulkan experimental (Java)'],
    correcciones: [],
    cambios: [
      'Las cuevas de azufre solo generan en chunks nuevos, no reescriben el mundo ya explorado',
    ],
    nuevosBloques: ['Azufre', 'Cinabrio', 'Azufre potente'],
    nuevasCriaturas: ['Sulfur Cube', 'Arañas de cueva (ahora también en superficie, en este bioma)'],
    nuevosBiomas: ['Cuevas de Azufre'],
    destacada: true,
    comentarios: [
      {
        id: 501,
        usuario: 'Vale_ObsidianaBUILDER',
        inicial: 'V',
        colorAvatar: '#2f8f5b',
        texto: 'El azufre y el cinabrio combinan re bien para una build temática infernal :tnt:',
      },
    ],
  },
];

const EDICIONES_FILTRO = ['Todas', 'Java', 'Bedrock'];

function Versiones({ versiones: versionesProp }) {
  const [versiones, setVersiones] = useState(versionesProp || versionesIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [edicionFiltro, setEdicionFiltro] = useState('Todas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [comentariosAbiertos, setComentariosAbiertos] = useState({});
  
  // Estado para controlar qué versión se está editando
  const [versionEditando, setVersionEditando] = useState(null);

  // Modo administrador: solo lo puede abrir un admin.
  const { esAdmin } = useAuth();
  const [modoAdminAbierto, setModoAdmin] = useState(false);
  const modoAdmin = modoAdminAbierto && esAdmin;

  function toggleComentarios(id) {
    setComentariosAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAgregarComentario(versionId, comentario) {
    setVersiones((prev) =>
      prev.map((v) =>
        v.id === versionId
          ? {
              ...v,
              comentarios: [
                ...v.comentarios,
                {
                  id: Date.now(),
                  usuario: 'Vos',
                  inicial: 'V',
                  colorAvatar: '#3d9970',
                  texto: comentario.texto,
                },
              ],
            }
          : v
      )
    );
  }

  function handleAgregarVersion(nuevaVersion) {
    setVersiones((prev) => {
      const id = Math.max(0, ...prev.map((v) => v.id)) + 1;
      return [...prev, { ...nuevaVersion, id, comentarios: [] }];
    });
  }

  // Función para actualizar una versión existente
  function handleActualizarVersion(versionActualizada) {
    setVersiones((prev) =>
      prev.map((v) => (v.id === versionActualizada.id ? versionActualizada : v))
    );
    setVersionEditando(null); // Limpiamos el modo edición
  }

  // Función para eliminar una versión con confirmación
  function handleEliminarVersion(id) {
    if (window.confirm('¿Estás seguro de que querés eliminar esta versión?')) {
      setVersiones((prev) => prev.filter((v) => v.id !== id));
      if (versionEditando && versionEditando.id === id) {
        setVersionEditando(null);
      }
    }
  }

  const textoBusqueda = busqueda.trim().toLowerCase();

  const versionesFiltradas = versiones
    .filter((v) => edicionFiltro === 'Todas' || v.edicion.includes(edicionFiltro))
    .filter((v) => !fechaDesde || v.fecha >= fechaDesde)
    .filter((v) => !fechaHasta || v.fecha <= fechaHasta)
    .filter((v) => {
      if (!textoBusqueda) return true;
      const bolsaDeTexto = [
        v.nombre,
        v.numero,
        v.descripcion,
        ...(v.nuevasFunciones || []),
        ...(v.cambios || []),
        ...(v.correcciones || []),
        ...(v.nuevosBloques || []),
        ...(v.nuevasCriaturas || []),
        ...(v.nuevosBiomas || []),
      ]
        .join(' ')
        .toLowerCase();
      return bolsaDeTexto.includes(textoBusqueda);
    })
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <>
      <Header />
      <div className="versiones-page">
        {/* ---------- HERO ---------- */}
        <header className="versiones-hero cascada-item" style={{ animationDelay: '0s' }}>
          <div className="versiones-hero__overlay" />
          <div className="versiones-hero__contenido">
            <h1>Versiones</h1>
            <p>Todo el historial de actualizaciones de Minecraft, Java y Bedrock, en un solo lugar.</p>
          </div>
        </header>

        <main className="versiones-main">
          {/* ---------- AGREGAR / EDITAR VERSIÓN ---------- */}
          {modoAdmin && (
            <AgregarVersion
              onAgregar={handleAgregarVersion}
              versionAEditar={versionEditando}
              onActualizar={handleActualizarVersion}
              onCancelarEdicion={() => setVersionEditando(null)}
            />
          )}

          {/* ---------- BÚSQUEDA + FILTROS ---------- */}
          <section
            className="versiones-controles cascada-item"
            style={{ animationDelay: '0.1s' }}
          >
            <input
              type="text"
              className="versiones-busqueda"
              placeholder="Buscar por nombre, bloque, criatura, bioma..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <div className="versiones-filtro-edicion">
              {EDICIONES_FILTRO.map((ed) => (
                <button
                  key={ed}
                  className={`filtro-pill ${edicionFiltro === ed ? 'filtro-pill--activo' : ''}`}
                  onClick={() => setEdicionFiltro(ed)}
                >
                  {ed}
                </button>
              ))}
            </div>

            <div className="versiones-filtro-fecha">
              <label>
                Desde
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </label>
              <label>
                Hasta
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                />
              </label>
              {(fechaDesde || fechaHasta) && (
                <button
                  className="btn-limpiar-fechas"
                  onClick={() => {
                    setFechaDesde('');
                    setFechaHasta('');
                  }}
                >
                  Limpiar fechas
                </button>
              )}
            </div>
          </section>

          {/* ---------- GRILLA DE VERSIONES ---------- */}
          <section className="versiones-lista">
            {versionesFiltradas.length === 0 && (
              <p className="versiones-lista__vacio">No encontramos versiones con esos filtros.</p>
            )}

            {versionesFiltradas.map((version, index) => (
              <TarjetaVersion
                key={version.id}
                version={version}
                comentariosAbiertos={Boolean(comentariosAbiertos[version.id])}
                onToggleComentarios={toggleComentarios}
                onAgregarComentario={handleAgregarComentario}
                onEditar={modoAdmin ? () => {
                  setVersionEditando(version);
                  window.scrollTo({ top: 200, behavior: 'smooth' });
                } : undefined}
                onEliminar={modoAdmin ? () => handleEliminarVersion(version.id) : undefined}
                delay={0.2 + Math.min(index, 8) * 0.1}
              />
            ))}
          </section>
        </main>
      </div>
      <BotonAdmin
        activo={modoAdmin}
        alAlternar={() => setModoAdmin((abierto) => !abierto)}
        aviso="Podés agregar, editar y eliminar versiones."
      />
      <Footer />
    </>
  );
}

export default Versiones;