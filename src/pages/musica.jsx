import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/header";
import BotonAdmin from "../components/botonAdmin";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";

import { useMusic } from "../context/MusicContext";

import SongRow from "../components/music/SongRow";
import FeaturedSongs from "../components/music/FeaturedSongs";
import PlaylistCard from "../components/music/PlaylistCard";
import ComposerCard from "../components/music/ComposerCard";
import SongPanel from "../components/music/SongPanel";

import "../styles/musica.css";

// ÍNDICE GENERAL
// 1. Catálogo compartido y control de acceso
// 2. Estado local de la pantalla
// 3. Canciones disponibles y límite de la lista inicial
// 4. Ranking y relaciones entre canciones, álbumes y compositores
// 5. Reproducción de una lista completa
// 6. Filtro de contenido público
// 7. Renderizado del repertorio, ranking, listas, álbumes y compositores
// 8. Panel de detalle y acceso al administrador musical

// 1. PÁGINA PRINCIPAL DE MÚSICA
// Esta página presenta el catálogo, pero no posee la reproducción por sí misma. Usa
// MusicContext como fuente única de canciones y acciones; de esa manera una canción
// puede seguir sonando aunque se navegue a otra página. Los componentes SongRow,
// PlaylistCard y ComposerCard se ocupan de partes visuales, mientras que Musica decide
// qué datos llega a cada uno y qué acción global debe ejecutarse al interactuar.
export default function Musica() {
  // 1.1. NAVEGACIÓN Y PERMISO ADMINISTRATIVO
  // navigate() crea enlaces mediante código para abrir el detalle de álbum, lista o
  // compositor. tienePermiso() recibe el perfil, no solo el usuario de autenticación,
  // porque los permisos específicos de Wiki-Craft viven en ese perfil.
  const navigate = useNavigate();
  const { perfil } = useAuth();
  const puedeAdministrar = tienePermiso(perfil, "musica");

  // 2. ESTADO LOCAL DE LA INTERFAZ
  // selectedSong representa la canción cuyo panel informativo está abierto. null
  // significa que no hay panel. showAllSongs define si el repertorio muestra solo las
  // primeras diez canciones o la lista completa. Estos estados no duplican el catálogo:
  // solamente controlan cómo se presenta.
  const [selectedSong, setSelectedSong] = useState(null);
  const [showAllSongs, setShowAllSongs] = useState(false);

  const {
    songs,
    composers,
    albums,
    playlists,
    favoriteSongs,
    rankingCounts,
    isBlocked,
    isFavorite,
    toggleFavorite,
    toggleBlocked,
    playSong,
    playCollection,
    songDurations,
  } = useMusic();

  // 3. CANCIONES DISPONIBLES
  // isBlocked() consulta la preferencia personal almacenada por MusicContext. filter()
  // devuelve un nuevo array, por lo tanto no cambia songs ni elimina canciones del
  // catálogo global. songsToShow aplica slice(0, 10) solo en modo resumido; slice tampoco
  // modifica el array original y el límite final no se incluye.
  const availableSongs = songs.filter(
    (song) => !isBlocked(song)
  );

  const songsToShow = showAllSongs
    ? availableSongs
    : availableSongs.slice(0, 10);

  // 4. RANKING DE CANCIONES DESTACADAS
  // [...availableSongs] crea primero una copia porque sort() sí modifica el array que
  // recibe. La comparación resta las reproducciones: un resultado positivo coloca b
  // antes que a, por eso quedan primero las más escuchadas. ?? 0 cubre canciones que
  // todavía no tienen contador. Después slice conserva cinco y map agrega el valor
  // reproducciones que FeaturedSongs necesita para mostrar el ranking.
  const featuredSongs = [...availableSongs]
    .sort(
      (a, b) =>
        (rankingCounts[b.id] ?? 0) -
        (rankingCounts[a.id] ?? 0)
    )
    .slice(0, 5)
    .map((song) => ({
      ...song,
      reproducciones: rankingCounts[song.id] ?? 0,
    }));

  // RELACIONES DEL CATÁLOGO: una canción almacena IDs, mientras los nombres, portadas y
  // otros datos viven en sus colecciones. Number() permite comparar un id recibido como
  // texto desde Firestore con uno numérico de los datos iniciales. find() devuelve el
  // primer elemento coincidente o undefined, que el renderizado trata con alternativas.
  const getComposer = (song) =>
    composers.find(
      (composer) =>
        Number(composer.id) === Number(song?.composerId)
    );

  const getAlbum = (song) =>
    albums.find(
      (album) =>
        Number(album.id) === Number(song?.albumId)
    );

  // getAlbumSongs aplica el mismo vínculo inverso para contar o reproducir las canciones
  // del álbum. Solo usa availableSongs: una canción bloqueada no reaparece por pertenecer
  // a un álbum.
  const getAlbumSongs = (album) =>
    availableSongs.filter(
      (song) =>
        Number(song.albumId) === Number(album.id)
    );

  // 5. REPRODUCIR UNA LISTA
  // Las listas del sistema no guardan IDs propios: representan los favoritos actuales.
  // Las listas comunes sí contienen playlist.songs. map busca cada id y puede producir
  // undefined cuando una canción ya no existe; filter(Boolean) elimina esos resultados
  // antes de crear la cola. Si la lista queda vacía no se llama al reproductor, evitando
  // sustituir la cola actual por una cola sin canciones.
  const playPlaylist = (playlist) => {
    const playlistSongs = playlist.system
      ? favoriteSongs.filter(
          (song) => !isBlocked(song)
        )
      : (playlist.songs ?? [])
          .map((songId) =>
            availableSongs.find(
              (song) => Number(song.id) === Number(songId)
            )
          )
          .filter(Boolean);

    if (playlistSongs.length > 0) {
      playCollection(playlistSongs);
    }
  };

  // 6. CONTENIDO PUBLICABLE
  // Estas tres listas excluyen elementos desactivados y borradores. La condición
  // activo !== false considera visible a un registro antiguo que no incluya activo,
  // mientras status === "published" exige una publicación explícita. Cada filter crea
  // un resultado nuevo para no cambiar los arrays que pertenecen al contexto.
  const publicPlaylists = playlists.filter(
    (playlist) =>
      playlist.activo !== false &&
      playlist.status === "published"
  );

  const publicAlbums = albums.filter(
    (album) =>
      album.activo !== false &&
      album.status === "published"
  );

  const publicComposers = composers.filter(
    (composer) =>
      composer.activo !== false &&
      composer.status === "published"
  );

  // 7. ESTRUCTURA VISUAL DEL CATÁLOGO
  // El renderizado pasa datos y funciones a los componentes hijos. Al hacer clic en una
  // canción, playSong recibe además availableSongs para construir la cola a partir de
  // lo que realmente se puede reproducir. El panel inferior recibe selectedSong y sus
  // relaciones calculadas; sus callbacks cierran el panel antes de navegar cuando la
  // persona abre el álbum o compositor asociado.
  return (
    <>
      <Header />

      <main className="music-page">
        <section
          className="music-header"
          style={{
            backgroundImage: "url('/music/banner-minecraft.gif')",
          }}
        >
          <div className="music-header-content container">
            <p className="music-eyebrow">
              WIKICRAFT · MÚSICA
            </p>

            <h1>Biblioteca musical</h1>

            <p>
              Explorá el repertorio musical, descubrí compositores,
              álbumes y listas de reproducción.
            </p>
          </div>
        </section>

        <div className="container">

          {/* REPERTORIO: cada SongRow recibe una duración medida si ya se conoce; de
              lo contrario conserva la duración del catálogo. La clave id permite a
              React identificar cada fila cuando cambia la lista. */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/disco_musical.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Todo el repertorio
                </h2>

                <p>
                  {availableSongs.length} canciones disponibles
                </p>
              </div>
            </div>

            <div className="songs-list">
              {songsToShow.length > 0 ? (
                songsToShow.map((song, index) => (
                  <SongRow
                    key={song.id}
                    song={{
                      ...song,
                      duration:
                        songDurations[song.id] ?? song.duration,
                    }}
                    index={index}
                    composer={getComposer(song)}
                    isFavorite={isFavorite(song)}
                    isBlocked={isBlocked(song)}
                    onPlay={(item) =>
                      playSong(item, availableSongs)
                    }
                    onOpen={setSelectedSong}
                    onToggleFavorite={toggleFavorite}
                    onToggleBlocked={toggleBlocked}
                  />
                ))
              ) : (
                <p className="songs-empty">
                  No hay canciones disponibles.
                </p>
              )}
            </div>

            {availableSongs.length > 10 && (
              <button
                type="button"
                className="songs-expand-button"
                onClick={() =>
                  setShowAllSongs((previous) => !previous)
                }
                aria-expanded={showAllSongs}
              >
                {showAllSongs
                  ? "Mostrar menos canciones"
                  : "Ver todas las canciones"}
              </button>
            )}
          </section>

          {/* RANKING: usa el array derivado featuredSongs, no reordena el catálogo base. */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/disco_musical.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Canciones destacadas
                </h2>

                <p>
                  Las canciones más escuchadas por nuestra comunidad
                </p>
              </div>
            </div>

            <FeaturedSongs
              songs={featuredSongs}
              composers={publicComposers}
              onPlay={(song) =>
                playSong(song, availableSongs)
              }
            />
          </section>

          {/* LISTAS: el conteo considera favoritos o IDs todavía disponibles según el tipo. */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/cofre_ender.gif"
                    alt=""
                    className="music-category-icon"
                  />
                  Listas de reproducción
                </h2>

                <p>
                  Música organizada para cada momento
                </p>
              </div>
            </div>

            <div className="playlist-grid">
              {publicPlaylists.map((playlist) => {
                const playlistSongCount = playlist.system
                  ? favoriteSongs.filter(
                      (song) => !isBlocked(song)
                    ).length
                  : (playlist.songs ?? []).filter(
                      (songId) =>
                        availableSongs.some(
                          (song) =>
                            Number(song.id) === Number(songId)
                        )
                    ).length;

                return (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    songCount={playlistSongCount}
                    onPlay={playPlaylist}
                    onOpen={(item) =>
                      navigate(`/musica/playlist/${item.id}`)
                    }
                  />
                );
              })}
            </div>
          </section>

          {/* ÁLBUMES: getComposer y getAlbumSongs transforman IDs en información visible. */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/estanteria.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Álbumes
                </h2>

                <p>Explorá los álbumes completos</p>
              </div>
            </div>

            <div className="album-grid">
              {publicAlbums.map((album) => {
                const composer = getComposer({
                  composerId: album.composerId,
                });

                const albumSongs = getAlbumSongs(album);

                return (
                  <button
                    key={album.id}
                    type="button"
                    className="album-card"
                    onClick={() =>
                      navigate(`/musica/album/${album.id}`)
                    }
                  >
                    <img
                      src={album.cover}
                      alt={album.title}
                    />

                    <strong>{album.title}</strong>

                    <span>
                      {composer?.name || "Compositor desconocido"}
                    </span>

                    <small>
                      {albumSongs.length} canciones
                    </small>
                  </button>
                );
              })}
            </div>
          </section>

          {/* COMPOSITORES: cada tarjeta navega al detalle del compositor seleccionado. */}
          <section className="music-section">
            <div className="section-title">
              <div>
                <h2 className="music-section-heading">
                  <img
                    src="/music/iconos/aldeano_bibliotecario.png"
                    alt=""
                    className="music-category-icon"
                  />
                  Compositores
                </h2>

                <p>
                  Descubrí quién está detrás de la música
                </p>
              </div>
            </div>

            <div className="composer-grid">
              {publicComposers.map((composer) => (
                <ComposerCard
                  key={composer.id}
                  composer={composer}
                  onOpen={(item) =>
                    navigate(`/musica/compositor/${item.id}`)
                  }
                />
              ))}
            </div>
          </section>
        </div>

        {/* 8. PANEL DE DETALLE: se mantiene montado, pero null indica que no debe mostrar
            una canción. Esto permite cerrar el panel sin alterar el catálogo ni la cola. */}
        <SongPanel
          song={selectedSong}
          composer={
            selectedSong ? getComposer(selectedSong) : null
          }
          album={
            selectedSong ? getAlbum(selectedSong) : null
          }
          isFavorite={
            selectedSong ? isFavorite(selectedSong) : false
          }
          isBlocked={
            selectedSong ? isBlocked(selectedSong) : false
          }
          onClose={() => setSelectedSong(null)}
          onPlay={(song) => {
            playSong(song, availableSongs);
            setSelectedSong(null);
          }}
          onToggleFavorite={toggleFavorite}
          onToggleBlocked={toggleBlocked}
          onOpenAlbum={(album) => {
            setSelectedSong(null);
            navigate(`/musica/album/${album.id}`);
          }}
          onOpenComposer={(composer) => {
            setSelectedSong(null);
            navigate(`/musica/compositor/${composer.id}`);
          }}
        />
      </main>

      {puedeAdministrar && (
        <BotonAdmin
          permiso="musica"
          alAlternar={() => navigate("/musica/maestro")}
        />
      )}

      <Footer />
    </>
  );
}
