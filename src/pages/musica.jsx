import Header from '../components/header';
export default function Musica() {
  return (
    <>
      <Header />
    
    <div className="container my-5">
      <div className="jumbotron bg-light p-5 rounded-lg">
        <h1 className="display-4">Bienvenido a WikiCraft</h1>
        <p className="lead">Tu punto de inicio para explorar todo sobre Minecraft</p>
        <hr className="my-4" />
        <p>Guías, noticias, recursos y mucho más.</p>
        <a className="btn btn-primary btn-lg" href="#" role="button">
          Comenzar
        </a>
      </div>

      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Historia</h5>
              <p className="card-text">Conoce la evolución de Minecraft</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Comunidad</h5>
              <p className="card-text">Conecta con otros jugadores</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Tienda</h5>
              <p className="card-text">Compra merchandising exclusivo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
{/* REPERTORIO */}

      <section className="music-section">

        <div className="section-title">
          <span>01</span>

          <div>
            <h2>Todo el repertorio</h2>

            <p>
              {availableSongs.length} canciones
            </p>
          </div>
        </div>

        <div className="songs-list">

          {availableSongs.map((song, index) => (
            <SongRow
              key={song.id}
              song={song}
              index={index}
              composer={getComposer(song)}
              isFavorite={favorites.includes(
                song.id
              )}
              isBlocked={blockedSongs.includes(
                song.id
              )}
              onPlay={playSong}
              onOpen={setSelectedSong}
              onToggleFavorite={toggleFavorite}
              onToggleBlocked={toggleBlocked}
            />
          ))}

        </div>

      </section>

      {/* DESTACADAS */}

      <section className="music-section">

        <div className="section-title">
          <span>02</span>

          <div>
            <h2>Canciones destacadas</h2>

            <p>
              Las canciones más destacadas
            </p>
          </div>
        </div>

        <FeaturedSongs
          songs={availableSongs.slice(0, 5)}
          composers={composers}
          onPlay={playSong}
        />

      </section>

      {/* PLAYLISTS */}

      <section className="music-section">

        <div className="section-title">
          <span>03</span>

          <div>
            <h2>Listas de reproducción</h2>

            <p>
              Música organizada para cada momento
            </p>
          </div>
        </div>

        <div className="playlist-grid">

          {playlists.map((playlist) => (
            <PlaylistCard
              key={playlist.id}
              playlist={playlist}
              songCount={
                playlist.system
                  ? favoriteSongs.length
                  : playlist.songs.length
              }
              onPlay={playPlaylist}
              onOpen={(item) =>
                navigate(
                  `/musica/playlist/${item.id}`
                )
              }
            />
          ))}

        </div>

      </section>

      {/* ÁLBUMES */}

      <section className="music-section">

        <div className="section-title">
          <span>04</span>

          <div>
            <h2>Álbumes</h2>

            <p>
              Explorá los álbumes completos
            </p>
          </div>
        </div>

        <div className="album-grid">

          {albums.map((album) => {
            const composer =
              composers.find(
                (item) =>
                  item.id === album.composerId
              );

            return (
              <button
                key={album.id}
                className="album-card"
                onClick={() =>
                  navigate(
                    `/musica/album/${album.id}`
                  )
                }
              >
                <img
                  src={album.cover}
                  alt={album.title}
                />

                <strong>{album.title}</strong>

                <span>
                  {composer?.name}
                </span>

                <small>
                  {album.songs.length} canciones
                </small>
              </button>
            );
          })}

        </div>

      </section>

      {/* COMPOSITORES */}

      <section className="music-section">

        <div className="section-title">
          <span>05</span>

          <div>
            <h2>Compositores</h2>

            <p>
              Descubrí quién está detrás de la música
            </p>
          </div>
        </div>

        <div className="composer-grid">

          {composers.map((composer) => (
            <ComposerCard
              key={composer.id}
              composer={composer}
              onOpen={(item) =>
                navigate(
                  `/musica/compositor/${item.id}`
                )
              }
            />
          ))}

        </div>

      </section>

      {/* PANEL DE CANCIÓN */}

      <SongPanel
        song={selectedSong}
        composer={
          selectedSong
            ? getComposer(selectedSong)
            : null
        }
        album={
          selectedSong
            ? getAlbum(selectedSong)
            : null
        }
        isFavorite={
          selectedSong
            ? favorites.includes(selectedSong.id)
            : false
        }
        isBlocked={
          selectedSong
            ? blockedSongs.includes(selectedSong.id)
            : false
        }
        onClose={() => setSelectedSong(null)}
        onPlay={(song) => {
          playSong(song);
          setSelectedSong(null);
        }}
        onToggleFavorite={toggleFavorite}
        onToggleBlocked={toggleBlocked}
        onOpenAlbum={(album) =>
          navigate(
            `/musica/album/${album.id}`
          )
        }
        onOpenComposer={(composer) =>
          navigate(
            `/musica/compositor/${composer.id}`
          )
        }
      />

      {/* REPRODUCTOR */}

      <MusicPlayer
        currentSong={currentSong}
        onNext={playNext}
        onPrevious={playPrevious}
      />

    </main>
  );
}

export default Musica;