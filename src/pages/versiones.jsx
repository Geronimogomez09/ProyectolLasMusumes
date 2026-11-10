
import { useEffect, useState } from 'react';

import {
  escucharVersiones,
  guardarVersion,
  borrarVersion,
  obtenerDocumento,
  crearDocumento,
} from '../services/firestore';

import Header from '../components/header';
import Footer from '../components/Footer';
import BotonAdmin from '../components/botonAdmin';
import { useAuth } from '../context/AuthContext';
import { tienePermiso } from '../utils/permisos';

import TarjetaVersion from '../components/versionesComponentes/tarjeta-version';
import AgregarVersion from '../components/versionesComponentes/agregar-version';

import '../styles/versiones.css';

// Índice: versiones iniciales; carga desde Firestore; administración; búsqueda y filtros; tarjetas informativas.
// -----------------------------------------------------------------------------
// VERSIONES ORIGINALES
// -----------------------------------------------------------------------------

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
    nuevosBloques: [
      'Bloques Sculk',
      'Sensor Sculk',
      'Catalizador Sculk',
      'Chirrido Sculk',
    ],
    nuevasCriaturas: ['Warden', 'Rana', 'Renacuajo', 'Allay'],
    nuevosBiomas: ['Deep Dark', 'Pantano de Mangle'],
    destacada: false,
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
    cambios: [
      'Los cofres decorados ahora se craftean con cerámicas en vez de ser solo loot',
    ],
    nuevosBloques: [
      'Madera de bambú',
      'Cerámicas decoradas',
      'Carteles colgantes',
    ],
    nuevasCriaturas: ['Sniffer', 'Camello'],
    nuevosBiomas: ['Bosque de cerezos'],
    destacada: false,
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
    cambios: [
      'Encantamientos, pinturas y discos de música ahora funcionan mediante data packs',
    ],
    nuevosBloques: [
      'Variantes de cobre y toba',
      'Macetas decoradas craftables',
    ],
    nuevasCriaturas: ['Breeze', 'Bogged'],
    nuevosBiomas: [],
    destacada: false,
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
    nuevasFunciones: [
      'Lista de amigos integrada',
      'Renderizador Vulkan experimental (Java)',
    ],
    correcciones: [],
    cambios: [
      'Las cuevas de azufre solo generan en chunks nuevos, no reescriben el mundo ya explorado',
    ],
    nuevosBloques: ['Azufre', 'Cinabrio', 'Azufre potente'],
    nuevasCriaturas: [
      'Sulfur Cube',
      'Arañas de cueva (ahora también en superficie, en este bioma)',
    ],
    nuevosBiomas: ['Cuevas de Azufre'],
    destacada: true,
  },
];

const EDICIONES_FILTRO = ['Todas', 'Java', 'Bedrock'];

// ----------------- Catálogo y administración de versiones -----------------
// Firestore aporta las versiones; el permiso habilita altas, cambios y eliminaciones, y los filtros ordenan la lista.
function Versiones({ versiones: versionesProp }) {
  const { perfil } = useAuth();
  const puedeAdministrar = tienePermiso(perfil, "versiones");

  const [versiones, setVersiones] = useState(versionesProp || []);
  const [busqueda, setBusqueda] = useState('');
  const [edicionFiltro, setEdicionFiltro] = useState('Todas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const [versionEditando, setVersionEditando] = useState(null);

  const [modoAdminAbierto, setModoAdmin] = useState(false);
  const modoAdmin = modoAdminAbierto && puedeAdministrar;

  useEffect(() => {
    if (!puedeAdministrar) {
      setModoAdmin(false);
      setVersionEditando(null);
    }
  }, [puedeAdministrar]);

  const [restaurando, setRestaurando] = useState(false);

  // ---------------------------------------------------------------------------
  // ESCUCHAR VERSIONES DE FIRESTORE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const desuscribir = escucharVersiones(
      (items) => {
        const versionesSinComentarios = items.map(
          ({ comentarios, ...version }) => version
        );

        setVersiones(versionesSinComentarios);
      },
      (error) => {
        console.error('Error al cargar las versiones:', error);
      }
    );

    return desuscribir;
  }, []);

  // ---------------------------------------------------------------------------
  // RESTAURAR VERSIONES ORIGINALES
  // ---------------------------------------------------------------------------

  async function restaurarVersionesIniciales() {
    if (!puedeAdministrar) return;
    if (restaurando) return;

    const confirmar = window.confirm(
      'Se van a restaurar las cinco versiones originales que falten. ¿Continuar?'
    );

    if (!confirmar) return;

    setRestaurando(true);

    try {
      let agregadas = 0;
      let existentes = 0;

      for (const { id, ...version } of versionesIniciales) {
        const idFirestore = `legacy-${id}`;

        const documentoExistente = await obtenerDocumento(
          'versiones',
          idFirestore
        );

        if (documentoExistente) {
          existentes++;
          continue;
        }

        await crearDocumento(
          'versiones',
          version,
          idFirestore
        );

        agregadas++;
      }

      alert(
        `Restauración finalizada.\n\nVersiones agregadas: ${agregadas}\nVersiones que ya existían: ${existentes}`
      );
    } catch (error) {
      console.error('Error al restaurar las versiones:', error);

      alert(
        'No se pudieron restaurar todas las versiones. Revisá la consola.'
      );
    } finally {
      setRestaurando(false);
    }
  }

  // ---------------------------------------------------------------------------
  // AGREGAR VERSIÓN
  // ---------------------------------------------------------------------------

  async function handleAgregarVersion(nuevaVersion) {
    if (!puedeAdministrar) return;
    try {
      await guardarVersion(nuevaVersion);
    } catch (error) {
      console.error('Error al agregar la versión:', error);
      alert('No se pudo agregar la versión. Intentá nuevamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // ACTUALIZAR VERSIÓN
  // ---------------------------------------------------------------------------

  async function handleActualizarVersion(versionActualizada) {
    if (!puedeAdministrar) return;
    try {
      const { id, ...datosActualizados } = versionActualizada;

      await guardarVersion(datosActualizados, id);

      setVersionEditando(null);
    } catch (error) {
      console.error('Error al actualizar la versión:', error);
      alert('No se pudo actualizar la versión. Intentá nuevamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // ELIMINAR VERSIÓN
  // ---------------------------------------------------------------------------

  async function handleEliminarVersion(id) {
    if (!puedeAdministrar) return;
    if (
      !window.confirm(
        '¿Estás seguro de que querés eliminar esta versión?'
      )
    ) {
      return;
    }

    try {
      await borrarVersion(id);

      if (versionEditando?.id === id) {
        setVersionEditando(null);
      }
    } catch (error) {
      console.error('Error al eliminar la versión:', error);
      alert('No se pudo eliminar la versión. Intentá nuevamente.');
    }
  }

  // ---------------------------------------------------------------------------
  // BÚSQUEDA Y FILTROS
  // ---------------------------------------------------------------------------

  const textoBusqueda = busqueda.trim().toLowerCase();

  const versionesFiltradas = versiones
    .filter(
      (v) =>
        edicionFiltro === 'Todas' ||
        (v.edicion || []).includes(edicionFiltro)
    )
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

  // ---------------------------------------------------------------------------
  // RENDERIZADO
  // ---------------------------------------------------------------------------

  return (
    <>
      <Header />

      <div className="versiones-page">

        {/* HERO */}
        <header
          className="versiones-hero cascada-item"
          style={{ animationDelay: '0s' }}
        >
          <div className="versiones-hero__overlay" />

          <div className="versiones-hero__contenido">
            <h1>Versiones</h1>

            <p>
              Todo el historial de actualizaciones de Minecraft,
              Java y Bedrock, en un solo lugar.
            </p>
          </div>
        </header>

        <main className="versiones-main">

          {/* ADMINISTRACIÓN */}
          {modoAdmin && (
            <>
              <AgregarVersion
                onAgregar={handleAgregarVersion}
                versionAEditar={versionEditando}
                onActualizar={handleActualizarVersion}
                onCancelarEdicion={() => setVersionEditando(null)}
              />

              <button className="restaurar-versiones"
                type="button"
                onClick={restaurarVersionesIniciales}
                disabled={restaurando}
              >
                {restaurando
                  ? 'Restaurando versiones...'
                  : 'Restaurar versiones originales'}
              </button>
            </>
          )}

          {/* BÚSQUEDA Y FILTROS */}
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
                  className={`filtro-pill ${
                    edicionFiltro === ed ? 'filtro-pill--activo' : ''
                  }`}
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

          {/* LISTA DE VERSIONES */}
          <section className="versiones-lista">
            {versionesFiltradas.length === 0 && (
              <p className="versiones-lista__vacio">
                No encontramos versiones con esos filtros.
              </p>
            )}

            {versionesFiltradas.map((version, index) => (
              <TarjetaVersion
                key={version.id}
                version={version}
                onEditar={
                  modoAdmin
                    ? () => {
                        setVersionEditando(version);

                        window.scrollTo({
                          top: 200,
                          behavior: 'smooth',
                        });
                      }
                    : undefined
                }
                onEliminar={
                  modoAdmin
                    ? () => handleEliminarVersion(version.id)
                    : undefined
                }
                delay={0.2 + Math.min(index, 8) * 0.1}
              />
            ))}
          </section>
        </main>
      </div>

      {/* BOTÓN ADMINISTRADOR */}
      {puedeAdministrar && (
        <BotonAdmin
          permiso="versiones"
          activo={modoAdmin}
          alAlternar={() => setModoAdmin((abierto) => !abierto)}
          aviso="Podés agregar, editar y eliminar versiones."
        />
      )}

      <Footer />
    </>
  );
}

export default Versiones;
