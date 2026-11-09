
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

// COMPONENTES
import BotonMaestroMelodias from '../components/BotonMaestroMelodias';
import Header from '../components/header';
import Footer from '../components/Footer';
import ImportarCatalogoButton from '../components/music/ImportarCatalogoButton';

// FIREBASE
import { db } from '../services/firebase';

// ESTILOS
import '../styles/maestro-melodias.css';
import '../styles/maestro-melodias-accordion.css';


// ==========================================================
// CONFIGURACIÓN DE COLECCIONES
// ==========================================================

const COLECCIONES = {
  canciones: 'canciones',
  albumes: 'albumes',
  playlists: 'playlists',
  compositores: 'compositores',
};


// ==========================================================
// ICONOS DE MAESTRO DE MELODÍAS
// ==========================================================

const ICONOS_MAESTRO = {
  canciones: '/music/iconos/disco_musical.png',
  albumes: '/music/iconos/estanteria.png',
  playlists: '/music/iconos/cofre_ender.gif',
  compositores: '/music/iconos/aldeano_bibliotecario.png',
  papelera: '/music/iconos/cubo_de_lava.png',
  agregar: '/music/iconos/libro_y_pluma.png',
  editar: '/music/iconos/yunque.png',
  borrador: '/music/iconos/disco_roto.png',
  tocadiscos: '/music/iconos/tocadiscos.png',
  importar: '/music/iconos/enderpearl.png',
};


// ==========================================================
// CONFIGURACIÓN VISUAL Y DESCRIPTIVA
// ==========================================================

const CONFIG = {
  canciones: {
    label: 'Canciones',
    singular: 'canción',
    icon: '♫',
    description: 'Administrá el repertorio, los archivos de audio y su publicación.',
  },

  albumes: {
    label: 'Álbumes',
    singular: 'álbum',
    icon: '▣',
    description: 'Organizá las canciones, portadas y datos de cada álbum.',
  },

  playlists: {
    label: 'Playlists',
    singular: 'playlist',
    icon: '☷',
    description: 'Creá listas y elegí qué canciones forman parte de ellas.',
  },

  compositores: {
    label: 'Compositores',
    singular: 'compositor',
    icon: '♙',
    description: 'Mantené actualizada la información de los creadores.',
  },

  papelera: {
    label: 'Papelera',
    singular: 'elemento',
    icon: '⌫',
    description: 'Restaurá contenido eliminado sin perder sus datos.',
  },
};


// ==========================================================
// FORMULARIOS VACÍOS
// ==========================================================

const EMPTY = {
  canciones: {
    title: '',
    composerId: '',
    albumId: '',
    audio: '',
  },

  albumes: {
    title: '',
    year: '',
    description: '',
    cover: '',
    composerId: '',
    songs: [],
  },

  playlists: {
    title: '',
    description: '',
    cover: '',
    songs: [],
    system: false,
  },

  compositores: {
    name: '',
    realName: '',
    description: '',
    image: '',
  },
};


// ==========================================================
// NORMALIZACIÓN DE DOCUMENTOS DE FIRESTORE
// ==========================================================

function normalizarDocumento(documento) {
  const datos = documento.data();

  const status =
    datos.status ?? (datos.published === false ? 'draft' : 'published');

  return {
    ...datos,
    id: Number(documento.id),
    status,
    published: status === 'published',
    activo: datos.activo !== false,
  };
}


// ==========================================================
// COMPONENTE PRINCIPAL
// ==========================================================

function MaestroMelodias() {
  const navigate = useNavigate();

  const formRef = useRef(null);


  // ========================================================
  // ESTADOS
  // ========================================================

  const [data, setData] = useState({
    canciones: [],
    albumes: [],
    playlists: [],
    compositores: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [openSection, setOpenSection] = useState('canciones');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');


  // ========================================================
  // DESPLAZAMIENTO AUTOMÁTICO AL FORMULARIO
  // ========================================================

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [showForm]);


  // ========================================================
  // FIRESTORE EN TIEMPO REAL
  // ========================================================

  useEffect(() => {
    const unsubscribers = [];
    const loaded = new Set();

    Object.entries(COLECCIONES).forEach(([key, collectionName]) => {
      const unsubscribe = onSnapshot(
        collection(db, collectionName),

        (snapshot) => {
          setData((previous) => ({
            ...previous,
            [key]: snapshot.docs.map(normalizarDocumento),
          }));

          loaded.add(key);

          if (loaded.size === Object.keys(COLECCIONES).length) {
            setLoading(false);
          }
        },

        (err) => {
          console.error(`Error al cargar ${collectionName}:`, err);

          setError(
            `No se pudo cargar ${collectionName}. Revisá los permisos de Firestore.`
          );

          setLoading(false);
        }
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);


  // ========================================================
  // DATOS Y CONTADORES
  // ========================================================

  const active = (key) =>
    data[key].filter((item) => item.activo);

  const deleted = Object.entries(COLECCIONES).flatMap(
    ([key, collectionName]) =>
      data[key]
        .filter((item) => !item.activo)
        .map((item) => ({
          ...item,
          _type: key,
          _collection: collectionName,
        }))
  );

  const activeSongs = active('canciones');

  const availableComposers = active('compositores').filter(
    (item) => item.status === 'published'
  );

  const availableAlbums = active('albumes').filter(
    (item) => item.status === 'published'
  );

  const counts = {
    canciones: active('canciones').length,
    albumes: active('albumes').length,
    playlists: active('playlists').length,
    compositores: active('compositores').length,
    papelera: deleted.length,
  };


  // ========================================================
  // ELEMENTOS DE LA SECCIÓN ACTUAL
  // ========================================================

  const currentItems = useMemo(() => {
    if (!openSection) return [];

    if (openSection === 'papelera') {
      return deleted.filter((item) => {
        const text = [
          item.title,
          item.name,
          item.realName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(search.toLowerCase());
      });
    }

    if (!COLECCIONES[openSection]) return [];

    const items = data[openSection].filter(
      (item) => item.activo
    );

    return items.filter((item) => {
      const text = [
        item.title,
        item.name,
        item.realName,
        item.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = text.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSection, search, statusFilter, data]);


  // ========================================================
  // FUNCIONES AUXILIARES
  // ========================================================

  const getComposerName = (id) =>
    data.compositores.find(
      (item) => item.id === Number(id)
    )?.name || 'Sin compositor';

  const getAlbumName = (id) =>
    data.albumes.find(
      (item) => item.id === Number(id)
    )?.title || 'Sin álbum';

  const getCover = (type, item) => {
    if (type === 'canciones') {
      const album = data.albumes.find(
        (album) => album.id === Number(item.albumId)
      );

      return album?.cover || item.cover || '';
    }

    if (type === 'albumes') return item.cover || '';

    if (type === 'playlists') return item.cover || '';

    if (type === 'compositores') return item.image || '';

    return '';
  };


  // ========================================================
  // APERTURA Y CIERRE DE FORMULARIOS
  // ========================================================

  const openNew = (type) => {
    if (!EMPTY[type]) {
      console.error('Tipo de formulario inválido:', type);
      return;
    }

    setOpenSection(type);
    setEditing(null);
    setForm({ ...EMPTY[type] });
    setMessage('');
    setShowForm(true);
  };

  const handleAddClick = () => {
    const type = COLECCIONES[openSection]
      ? openSection
      : 'canciones';

    openNew(type);
  };

  const openEdit = (type, item) => {
    if (type === 'playlists' && item.system) {
      setMessage('Las playlists del sistema no se pueden modificar.');
      return;
    }

    let initial = {
      ...EMPTY[type],
      ...item,
    };

    if (type === 'albumes') {
      initial.songs =
        Array.isArray(item.songs) && item.songs.length
          ? item.songs.map(Number)
          : data.canciones
              .filter(
                (song) => Number(song.albumId) === item.id
              )
              .map((song) => song.id);

      initial.composerId = String(
        item.composerId ?? item.composerIds?.[0] ?? ''
      );
    }

    if (type === 'canciones') {
      initial.composerId = String(item.composerId ?? '');
      initial.albumId = String(item.albumId ?? '');
    }

    if (type === 'playlists') {
      initial.songs = (item.songs ?? []).map(Number);
    }

    setOpenSection(type);

    setEditing({
      type,
      id: item.id,
    });

    setForm(initial);
    setMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({});
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleSongSelection = (songId) => {
    setForm((previous) => {
      const selected = previous.songs ?? [];

      return {
        ...previous,
        songs: selected.includes(songId)
          ? selected.filter((id) => id !== songId)
          : [...selected, songId],
      };
    });
  };


  // ========================================================
  // IDENTIFICADORES Y GUARDADO
  // ========================================================

  const nextId = async (collectionName) => {
    const snapshot = await getDocs(
      collection(db, collectionName)
    );

    const ids = snapshot.docs.map(
      (item) => Number(item.id) || 0
    );

    return Math.max(0, ...ids) + 1;
  };

  const saveItem = async (event) => {
    event.preventDefault();

    const type = editing?.type ?? openSection;
    const collectionName = COLECCIONES[type];

    if (!collectionName) return;

    const title = String(form.title ?? '').trim();
    const name = String(form.name ?? '').trim();

    if (
      (type === 'compositores' && !name) ||
      (type !== 'compositores' && !title)
    ) {
      setMessage('Completá el nombre o título antes de guardar.');
      return;
    }

    if (
      type === 'canciones' &&
      (
        !form.audio?.trim() ||
        !form.composerId ||
        !form.albumId
      )
    ) {
      setMessage('Completá el audio, el compositor y el álbum.');
      return;
    }

    if (type === 'albumes' && !form.composerId) {
      setMessage('Seleccioná al menos un compositor para el álbum.');
      return;
    }

    if (
      type === 'playlists' &&
      !(form.songs ?? []).length
    ) {
      setMessage('Seleccioná al menos una canción para la playlist.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const timestamp = serverTimestamp();

      let payload = {
        fechaActualizacion: timestamp,
      };

      // ----------------------------------------------------
      // GUARDAR CANCIÓN
      // ----------------------------------------------------

      if (type === 'canciones') {
        const composerExists = availableComposers.some(
          (item) => item.id === Number(form.composerId)
        );

        const albumExists = availableAlbums.some(
          (item) => item.id === Number(form.albumId)
        );

        if (!composerExists || !albumExists) {
          throw new Error(
            'Seleccioná un compositor y un álbum publicados.'
          );
        }

        payload = {
          ...payload,
          title,
          audio: form.audio.trim(),
          composerId: Number(form.composerId),
          albumId: Number(form.albumId),
        };
      }

      // ----------------------------------------------------
      // GUARDAR ÁLBUM
      // ----------------------------------------------------

      if (type === 'albumes') {
        const composerId = Number(form.composerId);

        if (
          !availableComposers.some(
            (item) => item.id === composerId
          )
        ) {
          throw new Error('Seleccioná un compositor publicado.');
        }

        payload = {
          ...payload,
          title,
          year: form.year === ''
            ? null
            : Number(form.year),
          description: (form.description ?? '').trim(),
          cover: (form.cover ?? '').trim(),
          composerId,
          composerIds: [composerId],
          songs: (form.songs ?? []).map(Number),
        };
      }

      // ----------------------------------------------------
      // GUARDAR PLAYLIST
      // ----------------------------------------------------

      if (type === 'playlists') {
        payload = {
          ...payload,
          title,
          description: (form.description ?? '').trim(),
          cover: (form.cover ?? '').trim(),
          songs: (form.songs ?? []).map(Number),
          system: false,
        };
      }

      // ----------------------------------------------------
      // GUARDAR COMPOSITOR
      // ----------------------------------------------------

      if (type === 'compositores') {
        payload = {
          ...payload,
          name,
          realName: (form.realName ?? '').trim(),
          description: (form.description ?? '').trim(),
          image: (form.image ?? '').trim(),
        };
      }


      // ====================================================
      // ACTUALIZAR ELEMENTO EXISTENTE
      // ====================================================

      if (editing) {
        await updateDoc(
          doc(db, collectionName, String(editing.id)),
          payload
        );

        // Sincronizar las canciones pertenecientes al álbum.
        if (type === 'albumes') {
          const selectedIds = new Set(
            (form.songs ?? []).map(Number)
          );

          const batch = writeBatch(db);

          data.canciones
            .filter(
              (song) =>
                Number(song.albumId) === editing.id ||
                selectedIds.has(song.id)
            )
            .forEach((song) => {
              batch.update(
                doc(db, 'canciones', String(song.id)),
                {
                  albumId: selectedIds.has(song.id)
                    ? editing.id
                    : null,
                  fechaActualizacion: timestamp,
                }
              );
            });

          data.albumes
            .filter(
              (album) =>
                album.id !== editing.id &&
                Array.isArray(album.songs)
            )
            .forEach((album) => {
              const remainingSongs = album.songs
                .map(Number)
                .filter(
                  (songId) => !selectedIds.has(songId)
                );

              if (
                remainingSongs.length !== album.songs.length
              ) {
                batch.update(
                  doc(db, 'albumes', String(album.id)),
                  {
                    songs: remainingSongs,
                    fechaActualizacion: timestamp,
                  }
                );
              }
            });

          await batch.commit();
        }

        setMessage(
          `El ${CONFIG[type].singular} se actualizó correctamente.`
        );
      }


      // ====================================================
      // CREAR ELEMENTO NUEVO
      // ====================================================

      else {
        const id = await nextId(collectionName);

        const newPayload = {
          ...payload,
          status: 'draft',
          published: false,
          activo: true,
          fechaCreacion: timestamp,
        };

        if (type === 'canciones') {
          newPayload.duration = null;
        }

        if (type === 'compositores') {
          newPayload.songs = [];
          newPayload.albums = [];
        }

        await setDoc(
          doc(db, collectionName, String(id)),
          newPayload
        );

        // Vincular canción nueva con su álbum.
        if (type === 'canciones') {
          const albumId = Number(form.albumId);

          const album = data.albumes.find(
            (item) => Number(item.id) === albumId
          );

          if (!album) {
            throw new Error('No se encontró el álbum seleccionado.');
          }

          const currentSongs = (
            album.songs ??
            data.canciones
              .filter((song) => Number(song.albumId) === albumId)
              .map((song) => song.id)
          ).map(Number);

          await updateDoc(
            doc(db, 'albumes', String(albumId)),
            {
              songs: [...new Set([...currentSongs, id])],
              fechaActualizacion: serverTimestamp(),
            }
          );
        }

        // Vincular canciones seleccionadas con el álbum nuevo.
        if (
          type === 'albumes' &&
          (form.songs ?? []).length
        ) {
          const batch = writeBatch(db);

          form.songs.forEach((songId) => {
            batch.update(
              doc(db, 'canciones', String(songId)),
              {
                albumId: id,
                fechaActualizacion: timestamp,
              }
            );
          });

          await batch.commit();
        }

        setMessage(
          `El ${CONFIG[type].singular} se creó como borrador.`
        );
      }

      closeForm();

    } catch (err) {
      console.error(`Error al guardar ${type}:`, err);

      setMessage(
        err.message ||
          'No se pudo guardar el contenido. Revisá los permisos de Firestore.'
      );

    } finally {
      setSaving(false);
    }
  };


  // ========================================================
  // PUBLICACIÓN Y PAPELERA
  // ========================================================

  const togglePublished = async (type, item) => {
    const status =
      item.status === 'published'
        ? 'draft'
        : 'published';

    try {
      await updateDoc(
        doc(db, COLECCIONES[type], String(item.id)),
        {
          status,
          published: status === 'published',
          fechaActualizacion: serverTimestamp(),
        }
      );

      setMessage(
        status === 'published'
          ? 'Contenido publicado correctamente.'
          : 'Contenido pasado a borradores.'
      );

    } catch (err) {
      console.error('Error al cambiar publicación:', err);
      setMessage('No se pudo cambiar el estado de publicación.');
    }
  };

  const moveToTrash = async (type, item) => {
    const label = item.title || item.name || 'este elemento';

    if (
      !window.confirm(
        `¿Querés mover "${label}" a la papelera? Podés restaurarlo después.`
      )
    ) {
      return;
    }

    try {
      await updateDoc(
        doc(db, COLECCIONES[type], String(item.id)),
        {
          activo: false,
          fechaActualizacion: serverTimestamp(),
        }
      );

      setMessage(`"${label}" se movió a la papelera.`);

    } catch (err) {
      console.error('Error al eliminar:', err);
      setMessage('No se pudo mover el contenido a la papelera.');
    }
  };

  const restoreItem = async (item) => {
    try {
      await updateDoc(
        doc(db, item._collection, String(item.id)),
        {
          activo: true,
          fechaActualizacion: serverTimestamp(),
        }
      );

      setMessage(
        `"${item.title || item.name || 'El elemento'}" se restauró correctamente.`
      );

    } catch (err) {
      console.error('Error al restaurar:', err);
      setMessage('No se pudo restaurar el contenido.');
    }
  };


  // ========================================================
  // SELECTOR DE CANCIONES
  // ========================================================

  const renderSongPicker = () => (
    <div className="maestro-song-picker">

      <div className="maestro-picker-heading">
        <strong>Seleccionar canciones</strong>

        <span>
          {(form.songs ?? []).length} seleccionadas
        </span>
      </div>

      <div className="maestro-picker-list">
        {activeSongs.map((song) => (
          <label
            className="maestro-picker-song"
            key={song.id}
          >
            <input
              type="checkbox"
              checked={(form.songs ?? []).includes(song.id)}
              onChange={() => toggleSongSelection(song.id)}
            />

            <span>{song.title}</span>

            <small>
              {getComposerName(song.composerId)}
            </small>
          </label>
        ))}

        {!activeSongs.length && (
          <p className="maestro-empty">
            Todavía no hay canciones cargadas.
          </p>
        )}
      </div>
    </div>
  );


  // ========================================================
  // FORMULARIO DINÁMICO
  // ========================================================

  const renderForm = () => {
    if (!showForm) return null;

    const type = editing?.type ?? openSection;

    if (!EMPTY[type]) return null;

    return (
      <section
        className="maestro-form-card"
        ref={formRef}
        style={{ scrollMarginTop: '110px' }}
      >

        <div className="maestro-section-heading">
          <div>
            <span className="maestro-eyebrow">
              {editing ? 'EDICIÓN' : 'NUEVO CONTENIDO'}
            </span>

            <h2>
              {editing
                ? `Editar ${CONFIG[type].singular}`
                : `Agregar ${CONFIG[type].singular}`}
            </h2>
          </div>

          <button
            className="maestro-close-button"
            type="button"
            onClick={closeForm}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form onSubmit={saveItem}>
          <div className="maestro-form-grid">

            {/* FORMULARIO DE CANCIONES */}

            {type === 'canciones' && (
              <>
                <label>
                  Título de la canción

                  <input
                    name="title"
                    value={form.title ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: Sweden"
                    required
                  />
                </label>

                <label>
                  Compositor

                  <select
                    name="composerId"
                    value={form.composerId ?? ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Seleccionar compositor
                    </option>

                    {availableComposers.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Álbum

                  <select
                    name="albumId"
                    value={form.albumId ?? ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Seleccionar álbum
                    </option>

                    {availableAlbums.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Ruta del archivo de audio

                  <input
                    name="audio"
                    value={form.audio ?? ''}
                    onChange={handleChange}
                    placeholder="/music/sweden.mp3"
                    required
                  />

                  <small>
                    Indicá la ruta de un archivo que ya exista en la carpeta pública.
                  </small>
                </label>
              </>
            )}


            {/* FORMULARIO DE ÁLBUMES */}

            {type === 'albumes' && (
              <>
                <label>
                  Nombre del álbum

                  <input
                    name="title"
                    value={form.title ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: Minecraft - Volume Alpha"
                    required
                  />
                </label>

                <label>
                  Compositor principal

                  <select
                    name="composerId"
                    value={form.composerId ?? ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Seleccionar compositor
                    </option>

                    {availableComposers.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Año

                  <input
                    name="year"
                    type="number"
                    min="1900"
                    max="2100"
                    value={form.year ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: 2011"
                  />
                </label>

                <label>
                  Ruta de portada

                  <input
                    name="cover"
                    value={form.cover ?? ''}
                    onChange={handleChange}
                    placeholder="/music/covers/album.jpg"
                  />
                </label>

                <label className="maestro-field-full">
                  Descripción

                  <textarea
                    name="description"
                    value={form.description ?? ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Descripción del álbum..."
                  />
                </label>

                <div className="maestro-field-full">
                  {renderSongPicker()}

                  <small>
                    Podés seleccionar las canciones que pertenecen a este álbum.
                  </small>
                </div>
              </>
            )}


            {/* FORMULARIO DE PLAYLISTS */}

            {type === 'playlists' && (
              <>
                <label>
                  Nombre de la playlist

                  <input
                    name="title"
                    value={form.title ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: Exploración"
                    required
                  />
                </label>

                <label>
                  Ruta de portada

                  <input
                    name="cover"
                    value={form.cover ?? ''}
                    onChange={handleChange}
                    placeholder="/music/playlists/exploracion.jpg"
                  />
                </label>

                <label className="maestro-field-full">
                  Descripción

                  <textarea
                    name="description"
                    value={form.description ?? ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="¿Qué caracteriza a esta playlist?"
                  />
                </label>

                <div className="maestro-field-full">
                  {renderSongPicker()}
                </div>
              </>
            )}


            {/* FORMULARIO DE COMPOSITORES */}

            {type === 'compositores' && (
              <>
                <label>
                  Nombre artístico

                  <input
                    name="name"
                    value={form.name ?? ''}
                    onChange={handleChange}
                    placeholder="Ej.: C418"
                    required
                  />
                </label>

                <label>
                  Nombre real

                  <input
                    name="realName"
                    value={form.realName ?? ''}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                  />
                </label>

                <label className="maestro-field-full">
                  Ruta de imagen

                  <input
                    name="image"
                    value={form.image ?? ''}
                    onChange={handleChange}
                    placeholder="/music/composers/c418.jpg"
                  />
                </label>

                <label className="maestro-field-full">
                  Descripción

                  <textarea
                    name="description"
                    value={form.description ?? ''}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Información del compositor..."
                  />
                </label>
              </>
            )}

          </div>


          {/* ACCIONES DEL FORMULARIO */}

          <div className="maestro-form-actions">

            <button
              type="button"
              className="maestro-secondary-button"
              onClick={closeForm}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="maestro-primary-button"
              disabled={saving}
            >
              {saving
                ? 'Guardando...'
                : editing
                  ? 'Guardar cambios'
                  : 'Crear borrador'}
            </button>

          </div>
        </form>
      </section>
    );
  };


  // ========================================================
  // FILAS DE LAS TABLAS
  // ========================================================

  const renderRow = (type, item) => {
    const title = item.title || item.name || 'Sin nombre';

    const subtitle =
      type === 'canciones'
        ? item.audio || 'Sin archivo de audio'
        : type === 'albumes'
          ? `${item.year || 'Año no indicado'} · ${getComposerName(
              item.composerId ?? item.composerIds?.[0]
            )}`
          : type === 'playlists'
            ? `${(item.songs ?? []).length} canciones${
                item.system ? ' · Sistema' : ''
              }`
            : item.realName || 'Compositor';

    return (
      <tr key={`${type}-${item.id}`}>

        <td>
          <div className="maestro-song-cell">

            <div className="maestro-song-cover">
              {getCover(type, item) ? (
                <img
                  src={getCover(type, item)}
                  alt={`Portada de ${title}`}
                  loading="lazy"
                />
              ) : (
                <img
                  src={ICONOS_MAESTRO[type]}
                  alt=""
                  className="maestro-fallback-icon"
                />
              )}
            </div>

            <div>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>

          </div>
        </td>


        {/* COLUMNAS DE CANCIONES */}

        {type === 'canciones' && (
          <>
            <td>{getComposerName(item.composerId)}</td>
            <td>{getAlbumName(item.albumId)}</td>
          </>
        )}


        {/* COLUMNA DE ÁLBUMES */}

        {type === 'albumes' && (
          <td>
            {(item.songs ??
              data.canciones
                .filter(
                  (song) => Number(song.albumId) === item.id
                )
                .map((song) => song.id)
            ).length}{' '}
            canciones
          </td>
        )}


        {/* COLUMNA DE PLAYLISTS */}

        {type === 'playlists' && (
          <td>
            {item.system ? 'Automática' : 'Personalizada'}
          </td>
        )}


        {/* COLUMNA DE COMPOSITORES */}

        {type === 'compositores' && (
          <td>
            {
              data.canciones.filter(
                (song) =>
                  Number(song.composerId) === item.id
              ).length
            }{' '}
            canciones
          </td>
        )}


        {/* ESTADO */}

        <td>
          <span
            className={`maestro-status ${
              item.status === 'published'
                ? 'is-published'
                : 'is-draft'
            }`}
          >
            {item.status === 'published' ? (
              'Publicado'
            ) : (
              <>
                <img
                  src={ICONOS_MAESTRO.borrador}
                  alt=""
                  className="maestro-status-icon"
                />
                Borrador
              </>
            )}
          </span>
        </td>


        {/* ACCIONES */}

        <td>
          <div className="maestro-actions">

            <button
              type="button"
              className="maestro-action-button maestro-edit-button"
              onClick={() => openEdit(type, item)}
              disabled={type === 'playlists' && item.system}
            >
              <img
                src={ICONOS_MAESTRO.editar}
                alt=""
                className="maestro-button-icon"
              />

              Editar
            </button>

            {item.system ? (
              <span className="maestro-system-label">
                Sistema
              </span>
            ) : (
              <button
                type="button"
                className="maestro-action-button"
                onClick={() => togglePublished(type, item)}
              >
                {item.status === 'published'
                  ? 'Despublicar'
                  : 'Publicar'}
              </button>
            )}

            <button
              type="button"
              className="maestro-action-button is-danger"
              onClick={() => moveToTrash(type, item)}
              disabled={type === 'playlists' && item.system}
            >
              Eliminar
            </button>

          </div>
        </td>

      </tr>
    );
  };


  // ========================================================
  // ENCABEZADOS DE TABLAS
  // ========================================================

  const tableHeaders = () => {
    if (openSection === 'canciones') {
      return (
        <tr>
          <th>Contenido</th>
          <th>Compositor</th>
          <th>Álbum</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      );
    }

    if (openSection === 'albumes') {
      return (
        <tr>
          <th>Álbum</th>
          <th>Contenido</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      );
    }

    if (openSection === 'playlists') {
      return (
        <tr>
          <th>Playlist</th>
          <th>Tipo</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      );
    }

    return (
      <tr>
        <th>Compositor</th>
        <th>Repertorio</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    );
  };


  // ========================================================
  // CONTENIDO DE LA PAPELERA
  // ========================================================

  const renderTrash = () =>
    currentItems.map((item) => (
      <tr key={`${item._type}-${item.id}`}>

        <td>
          <div className="maestro-song-cell">

            <div className="maestro-song-cover">
              <img
                src={ICONOS_MAESTRO[item._type]}
                alt=""
                className="maestro-fallback-icon"
              />
            </div>

            <div>
              <strong>
                {item.title || item.name || 'Sin nombre'}
              </strong>

              <small>
                {CONFIG[item._type].label}
              </small>
            </div>

          </div>
        </td>

        <td>
          <span
            className={`maestro-status ${
              item.status === 'published'
                ? 'is-published'
                : 'is-draft'
            }`}
          >
            {item.status === 'published'
              ? 'Publicado'
              : 'Borrador'}
          </span>
        </td>

        <td>
          <button
            type="button"
            className="maestro-action-button"
            onClick={() => restoreItem(item)}
          >
            Restaurar
          </button>
        </td>

      </tr>
    ));


  // ========================================================
  // INTERFAZ PRINCIPAL
  // ========================================================

  return (
    <>
      <Header />

      <main className="maestro-page">


        {/* ==================================================
            ENCABEZADO
            ================================================== */}

        <section className="maestro-hero">

          <div className="maestro-hero-icon">
            <img
              src={ICONOS_MAESTRO.tocadiscos}
              alt="Maestro de Melodías"
            />
          </div>

          <div>
            <span className="maestro-eyebrow">
              WIKICRAFT · GESTIÓN MUSICAL
            </span>

            <h1>Maestro de Melodías</h1>

            <p>
              Administrá canciones, álbumes, playlists y compositores
              desde un solo lugar.
            </p>
          </div>

          <div className="maestro-hero-buttons">

            <button
              type="button"
              className="maestro-primary-button"
              onClick={handleAddClick}
              disabled={openSection === 'papelera'}
            >
              <img
                src={ICONOS_MAESTRO.agregar}
                alt=""
                className="maestro-button-icon"
              />

              <span>
                Agregar{' '}
                {openSection && openSection !== 'papelera'
                  ? CONFIG[openSection].singular
                  : 'contenido'}
              </span>
            </button>

            <ImportarCatalogoButton />

          </div>

        </section>


        {/* FORMULARIO */}

        {renderForm()}


        {/* ==================================================
            ESTADÍSTICAS
            ================================================== */}

        <section className="maestro-stats">

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.canciones} alt="" />
            </span>

            <div>
              <p>Canciones</p>
              <strong>{counts.canciones}</strong>
            </div>
          </article>

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.albumes} alt="" />
            </span>

            <div>
              <p>Álbumes</p>
              <strong>{counts.albumes}</strong>
            </div>
          </article>

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.playlists} alt="" />
            </span>

            <div>
              <p>Playlists</p>
              <strong>{counts.playlists}</strong>
            </div>
          </article>

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">
              <img src={ICONOS_MAESTRO.compositores} alt="" />
            </span>

            <div>
              <p>Compositores</p>
              <strong>{counts.compositores}</strong>
            </div>
          </article>

        </section>


        {/* ==================================================
            MENSAJES
            ================================================== */}

        {message && (
          <div className="maestro-message" role="status">

            {message}

            <button
              type="button"
              onClick={() => setMessage('')}
              aria-label="Cerrar mensaje"
            >
              ×
            </button>

          </div>
        )}

        {error && (
          <div className="maestro-message" role="alert">
            {error}
          </div>
        )}


        {/* ==================================================
            BIBLIOTECA MUSICAL
            ================================================== */}

        <section className="maestro-library">

          <div className="maestro-section-heading">
            <div>
              <span className="maestro-eyebrow">
                CENTRO DE ADMINISTRACIÓN
              </span>

              <h2>Biblioteca musical</h2>

              <p>
                Elegí una sección para desplegar sus herramientas de gestión.
              </p>
            </div>
          </div>


          {/* ACORDEÓN */}

          <div className="maestro-accordion">


            {/* ==============================================
                SECCIONES PRINCIPALES
                ============================================== */}

            {Object.keys(COLECCIONES).map((key) => (
              <section
                className={`maestro-accordion-item ${
                  openSection === key ? 'is-open' : ''
                }`}
                key={key}
              >

                <button
                  type="button"
                  className="maestro-accordion-trigger"
                  onClick={() => {
                    setOpenSection(
                      openSection === key ? '' : key
                    );

                    setShowForm(false);
                    setEditing(null);
                    setSearch('');
                    setStatusFilter('all');
                  }}
                  aria-expanded={openSection === key}
                >

                  <span className="maestro-accordion-icon">
                    <img
                      src={ICONOS_MAESTRO[key]}
                      alt=""
                    />
                  </span>

                  <span className="maestro-accordion-copy">
                    <strong>{CONFIG[key].label}</strong>

                    <small>
                      {CONFIG[key].description}
                    </small>
                  </span>

                  <span className="maestro-accordion-count">
                    {counts[key]}
                  </span>

                  <span className="maestro-accordion-chevron">
                    {openSection === key ? '−' : '+'}
                  </span>

                </button>


                {/* CONTENIDO DESPLEGABLE */}

                {openSection === key && (
                  <div className="maestro-accordion-content">


                    {/* BARRA DE HERRAMIENTAS */}

                    <div className="maestro-toolbar">

                      <div className="maestro-search">
                        <span>⌕</span>

                        <input
                          type="search"
                          value={search}
                          onChange={(event) =>
                            setSearch(event.target.value)
                          }
                          placeholder={`Buscar ${CONFIG[
                            key
                          ].label.toLowerCase()}...`}
                          aria-label={`Buscar ${CONFIG[key].label}`}
                        />
                      </div>

                      <select
                        className="maestro-filter"
                        value={statusFilter}
                        onChange={(event) =>
                          setStatusFilter(event.target.value)
                        }
                        aria-label="Filtrar por estado"
                      >
                        <option value="all">
                          Todos los estados
                        </option>

                        <option value="published">
                          Publicados
                        </option>

                        <option value="draft">
                          Borradores
                        </option>
                      </select>

                    </div>


                    {/* TABLA */}

                    <div className="maestro-table-wrapper">

                      <table className="maestro-table">

                        <thead>
                          {tableHeaders()}
                        </thead>

                        <tbody>

                          {loading ? (
                            <tr>
                              <td
                                colSpan="5"
                                className="maestro-empty"
                              >
                                Cargando catálogo musical...
                              </td>
                            </tr>
                          ) : currentItems.length ? (
                            currentItems.map((item) =>
                              renderRow(key, item)
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan="5"
                                className="maestro-empty"
                              >
                                No se encontró contenido en esta sección.
                              </td>
                            </tr>
                          )}

                        </tbody>

                      </table>

                    </div>


                    {/* RESULTADOS */}

                    <p className="maestro-results">
                      Mostrando {currentItems.length} de {counts[key]}{' '}
                      {CONFIG[key].label.toLowerCase()}
                    </p>

                  </div>
                )}

              </section>
            ))}


            {/* ==============================================
                PAPELERA
                ============================================== */}

            <section
              className={`maestro-accordion-item maestro-trash-section ${
                openSection === 'papelera' ? 'is-open' : ''
              }`}
            >

              <button
                type="button"
                className="maestro-accordion-trigger"
                onClick={() => {
                  setOpenSection(
                    openSection === 'papelera' ? '' : 'papelera'
                  );

                  setShowForm(false);
                  setEditing(null);
                  setSearch('');
                  setStatusFilter('all');
                }}
                aria-expanded={openSection === 'papelera'}
              >

                <span className="maestro-accordion-icon">
                  <img
                    src={ICONOS_MAESTRO.papelera}
                    alt=""
                  />
                </span>

                <span className="maestro-accordion-copy">
                  <strong>Papelera</strong>

                  <small>
                    Restaurá canciones, álbumes, playlists y compositores eliminados.
                  </small>
                </span>

                <span className="maestro-accordion-count">
                  {counts.papelera}
                </span>

                <span className="maestro-accordion-chevron">
                  {openSection === 'papelera' ? '−' : '+'}
                </span>

              </button>


              {/* CONTENIDO DE PAPELERA */}

              {openSection === 'papelera' && (
                <div className="maestro-accordion-content">


                  {/* BÚSQUEDA */}

                  <div className="maestro-toolbar">

                    <div className="maestro-search">
                      <span>⌕</span>

                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Buscar contenido eliminado..."
                        aria-label="Buscar en papelera"
                      />
                    </div>

                  </div>


                  {/* TABLA DE PAPELERA */}

                  <div className="maestro-table-wrapper">

                    <table className="maestro-table">

                      <thead>
                        <tr>
                          <th>Contenido</th>
                          <th>Estado anterior</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>

                      <tbody>

                        {loading ? (
                          <tr>
                            <td
                              colSpan="3"
                              className="maestro-empty"
                            >
                              Cargando papelera...
                            </td>
                          </tr>
                        ) : currentItems.length ? (
                          renderTrash()
                        ) : (
                          <tr>
                            <td
                              colSpan="3"
                              className="maestro-empty"
                            >
                              La papelera está vacía.
                            </td>
                          </tr>
                        )}

                      </tbody>

                    </table>

                  </div>


                  {/* RESULTADOS */}

                  <p className="maestro-results">
                    {currentItems.length} elementos en la papelera
                  </p>

                </div>
              )}

            </section>

          </div>
        </section>


        {/* ==================================================
            AVISO FINAL
            ================================================== */}

        <aside className="maestro-notice">

          <strong>Gestión del catálogo</strong>

          <p>
            Los cambios se guardan en Firestore y se sincronizan
            automáticamente. Los elementos enviados a la papelera se
            conservan y pueden restaurarse sin perder sus datos ni su
            estado de publicación.
          </p>

        </aside>

      </main>


      {/* ====================================================
          BOTÓN FLOTANTE EXCLUSIVO DE MAESTRO DE MELODÍAS
          ==================================================== */}

      <div
  style={{
    position: 'fixed',
    right: '30px',
    bottom: '30px',
    zIndex: 999999,
    background: 'red',
    color: 'white',
    padding: '20px',
    borderRadius: '10px',
  }}
>
  PRUEBA DEL BOTÓN
</div>

<BotonMaestroMelodias
  activo
  alAlternar={() => navigate('/musica')}
/>

      <Footer />
    </>
  );
}

export default MaestroMelodias;
