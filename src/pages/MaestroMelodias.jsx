import React, { useMemo, useState } from 'react';
import Header from '../components/header';
import Footer from '../components/Footer';
import { songs, composers, albums } from '../data/musicData';
import '../styles/maestro-melodias.css';

const emptySong = {
  title: '',
  composerId: '',
  albumId: '',
  audio: '',
};

function MaestroMelodias() {
  const [catalog, setCatalog] = useState(() =>
    songs.map((song) => ({
      ...song,
      published: song.published !== false,
    }))
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySong);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');

  const publishedCount = catalog.filter((song) => song.published).length;
  const draftCount = catalog.length - publishedCount;

  const filteredSongs = useMemo(() => {
    return catalog.filter((song) => {
      const composer = composers.find(
        (item) => item.id === Number(song.composerId)
      );

      const searchText = [
        song.title,
        composer?.name || '',
      ].join(' ').toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && song.published) ||
        (statusFilter === 'draft' && !song.published);

      return matchesSearch && matchesStatus;
    });
  }, [catalog, search, statusFilter]);

  const openNewSong = () => {
    setEditingId(null);
    setForm(emptySong);
    setMessage('');
    setShowForm(true);
  };

  const openEditSong = (song) => {
    setEditingId(song.id);
    setForm({
      title: song.title || '',
      composerId: String(song.composerId ?? ''),
      albumId: String(song.albumId ?? ''),
      audio: song.audio || '',
    });
    setMessage('');
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveSong = (event) => {
    event.preventDefault();

    const title = form.title.trim();
    const audio = form.audio.trim();

    if (!title || !audio || !form.composerId || !form.albumId) {
      setMessage('Completá todos los campos antes de guardar.');
      return;
    }

    if (editingId !== null) {
      setCatalog((previous) =>
        previous.map((song) =>
          song.id === editingId
            ? {
                ...song,
                title,
                audio,
                composerId: Number(form.composerId),
                albumId: Number(form.albumId),
              }
            : song
        )
      );

      setMessage('La canción se actualizó en esta sesión.');
    } else {
      const newSong = {
        id: Math.max(0, ...catalog.map((song) => Number(song.id) || 0)) + 1,
        title,
        audio,
        composerId: Number(form.composerId),
        albumId: Number(form.albumId),
        duration: null,
        published: false,
      };

      setCatalog((previous) => [...previous, newSong]);
      setMessage('Canción agregada como borrador en esta sesión.');
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptySong);
  };

  const togglePublished = (id) => {
    setCatalog((previous) =>
      previous.map((song) =>
        song.id === id
          ? { ...song, published: !song.published }
          : song
      )
    );
  };

  const deleteSong = (song) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar "${song.title}" del catálogo de esta sesión?`
    );

    if (!confirmed) return;

    setCatalog((previous) =>
      previous.filter((item) => item.id !== song.id)
    );

    setMessage('La canción se quitó del catálogo de esta sesión.');
  };

  const getComposerName = (composerId) => {
    return (
      composers.find((composer) => composer.id === Number(composerId))
        ?.name || 'Sin compositor'
    );
  };

  const getAlbumName = (albumId) => {
    return (
      albums.find((album) => album.id === Number(albumId))
        ?.title || 'Sin álbum'
    );
  };

  return (
    <>
      <Header />

      <main className="maestro-page">
        <section className="maestro-hero">
          <div className="maestro-hero-icon">♫</div>

          <div>
            <span className="maestro-eyebrow">WIKICRAFT · GESTIÓN MUSICAL</span>
            <h1>Maestro de Melodías</h1>
            <p>
              Administrá las canciones, organizá los álbumes y mantené
              actualizado el catálogo musical.
            </p>
          </div>

          <button
            className="maestro-primary-button"
            type="button"
            onClick={openNewSong}
          >
            + Agregar canción
          </button>
        </section>

        <section className="maestro-stats">
          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">♫</span>
            <div>
              <p>Canciones del catálogo</p>
              <strong>{catalog.length}</strong>
            </div>
          </article>

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">✓</span>
            <div>
              <p>Publicadas</p>
              <strong>{publishedCount}</strong>
            </div>
          </article>

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">◷</span>
            <div>
              <p>Borradores</p>
              <strong>{draftCount}</strong>
            </div>
          </article>

          <article className="maestro-stat-card">
            <span className="maestro-stat-icon">♬</span>
            <div>
              <p>Compositores disponibles</p>
              <strong>{composers.length}</strong>
            </div>
          </article>
        </section>

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

        {showForm && (
          <section className="maestro-form-card">
            <div className="maestro-section-heading">
              <div>
                <span className="maestro-eyebrow">
                  {editingId !== null ? 'EDICIÓN' : 'NUEVO CONTENIDO'}
                </span>
                <h2>
                  {editingId !== null ? 'Editar canción' : 'Agregar canción'}
                </h2>
              </div>

              <button
                className="maestro-close-button"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptySong);
                  setMessage('');
                }}
                aria-label="Cerrar formulario"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveSong}>
              <div className="maestro-form-grid">
                <label>
                  Título de la canción
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ej.: Sweden"
                    required
                  />
                </label>

                <label>
                  Compositor
                  <select
                    name="composerId"
                    value={form.composerId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar compositor</option>
                    {composers.map((composer) => (
                      <option key={composer.id} value={composer.id}>
                        {composer.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Álbum
                  <select
                    name="albumId"
                    value={form.albumId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccionar álbum</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Ruta del archivo de audio
                  <input
                    type="text"
                    name="audio"
                    value={form.audio}
                    onChange={handleChange}
                    placeholder="/music/sweden.mp3"
                    required
                  />
                  <small>
                    Indicá la ruta de un archivo que ya exista en la carpeta
                    pública del proyecto.
                  </small>
                </label>
              </div>

              <div className="maestro-form-actions">
                <button
                  type="button"
                  className="maestro-secondary-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setForm(emptySong);
                    setMessage('');
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="maestro-primary-button"
                >
                  {editingId !== null ? 'Guardar cambios' : 'Crear borrador'}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="maestro-catalog">
          <div className="maestro-section-heading">
            <div>
              <span className="maestro-eyebrow">BIBLIOTECA</span>
              <h2>Catálogo musical</h2>
              <p>Buscá y administrá las canciones de WikiCraft.</p>
            </div>
          </div>

          <div className="maestro-toolbar">
            <div className="maestro-search">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por canción o compositor..."
                aria-label="Buscar canciones"
              />
            </div>

            <select
              className="maestro-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="published">Publicadas</option>
              <option value="draft">Borradores</option>
            </select>
          </div>

          <div className="maestro-table-wrapper">
            <table className="maestro-table">
              <thead>
                <tr>
                  <th>Canción</th>
                  <th>Compositor</th>
                  <th>Álbum</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredSongs.map((song) => (
                  <tr key={song.id}>
                    <td>
                      <div className="maestro-song-cell">
                        <div className="maestro-song-cover">♫</div>
                        <div>
                          <strong>{song.title}</strong>
                          <small>{song.audio || 'Sin archivo de audio'}</small>
                        </div>
                      </div>
                    </td>

                    <td>{getComposerName(song.composerId)}</td>
                    <td>{getAlbumName(song.albumId)}</td>

                    <td>
                      <span
                        className={`maestro-status ${
                          song.published ? 'is-published' : 'is-draft'
                        }`}
                      >
                        {song.published ? 'Publicada' : 'Borrador'}
                      </span>
                    </td>

                    <td>
                      <div className="maestro-actions">
                        <button
                          type="button"
                          className="maestro-action-button"
                          onClick={() => openEditSong(song)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="maestro-action-button"
                          onClick={() => togglePublished(song.id)}
                        >
                          {song.published ? 'Despublicar' : 'Publicar'}
                        </button>

                        <button
                          type="button"
                          className="maestro-action-button is-danger"
                          onClick={() => deleteSong(song)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredSongs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="maestro-empty">
                      No se encontraron canciones con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="maestro-results">
            Mostrando {filteredSongs.length} de {catalog.length} canciones
          </p>
        </section>

        <aside className="maestro-notice">
          <strong>Importante</strong>
          <p>
            Este panel es una primera versión de prueba. Los cambios se
            mantienen mientras la página sigue abierta, pero todavía no se
            guardan en una base de datos ni actualizan el catálogo público.
          </p>
        </aside>
      </main>

      <Footer />
    </>
  );
}

export default MaestroMelodias;