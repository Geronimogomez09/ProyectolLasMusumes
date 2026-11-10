// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. COMPONENTE PRINCIPAL: ÁLBUM
// 3. VARIABLES DE ESTADO Y ENRUTAMIENTO
// 4. CONTEXTO GLOBAL DE MÚSICA
// 5. BÚSQUEDA Y VALIDACIÓN DEL ÁLBUM
// 6. RENDERIZADO ALTERNATIVO: ÁLBUM NO ENCONTRADO
// 7. OBTENCIÓN DE DATOS RELACIONADOS (COMPOSITOR Y CANCIONES)
// 8. FUNCIONES AUXILIARES PARA DATOS ESPECÍFICOS
// 9. INTERFAZ VISUAL: ENCABEZADO Y ACCIONES PRINCIPALES
// 10. INTERFAZ VISUAL: LISTA DE CANCIONES
// 11. INTERFAZ VISUAL: PANEL LATERAL Y PIE DE PÁGINA

// =====================================================================
// 1. IMPORTACIONES Y DEPENDENCIAS
// =====================================================================
// Las importaciones traen herramientas de otras partes del proyecto
// para que puedan usarse en este archivo.

// Se importa la librería principal de React y el "hook" useState.
// React es la base para crear interfaces, y useState permite crear
// variables especiales que, al cambiar, actualizan la pantalla automáticamente.
import React, { useState } from "react";

// Se importan componentes visuales reutilizables.
// Header es la barra superior de navegación y Footer es el pie de página.
import Header from "../components/header";
import Footer from "../components/Footer";

// Se importan herramientas de navegación web.
// useNavigate permite cambiar de página mediante código (como al hacer clic).
// useParams permite leer valores de la dirección web (URL).
import { useNavigate, useParams } from "react-router-dom";

// Se importa un "contexto" de música.
// Un contexto es un espacio de memoria compartido. En lugar de que
// cada página descargue las canciones por su cuenta, todas acceden a useMusic.
import { useMusic } from "../context/MusicContext";

// Se importan los componentes específicos que muestran la música.
// SongRow muestra una canción en formato de lista.
// SongPanel muestra los detalles grandes de una canción seleccionada.
import SongRow from "../components/music/SongRow";
import SongPanel from "../components/music/SongPanel";

// Se importan los estilos visuales (CSS) que darán colores, tamaños
// y posiciones a los elementos de esta pantalla en particular.
import "../styles/album.css";
import "../styles/musica.css";

// =====================================================================
// 2. COMPONENTE PRINCIPAL: ÁLBUM
// =====================================================================
// En React, un componente es una función que agrupa la lógica y la 
// interfaz de una parte de la aplicación.
// 
// 1. Propósito: Mostrar toda la información de un álbum en específico,
//    incluyendo su portada, compositor y lista de canciones, y permitir
//    reproducirlas.
// 2. Parámetros: No recibe parámetros directos (props) porque obtiene
//    lo que necesita desde la URL y el contexto global de música.
// 3. Retorno: Devuelve código JSX (mezcla de HTML y JavaScript) que 
//    el navegador pintará en la pantalla.
function Album() {

  // =====================================================================
  // 3. VARIABLES DE ESTADO Y ENRUTAMIENTO
  // =====================================================================
  
  // useParams() lee la URL actual.
  // Si la ruta es "/musica/album/15", useParams() extrae un objeto { id: "15" }.
  // Al usar la desestructuración (las llaves { id }), guardamos ese valor
  // directamente en la constante "id".
  const { id } = useParams();
  
  // useNavigate() devuelve una función que guardamos en la variable "navigate".
  // Nos servirá más adelante para enviar al usuario a otra página.
  const navigate = useNavigate();
  
  // useState crea una variable de estado llamada "selectedSong".
  // - selectedSong almacena la canción que el usuario está inspeccionando (para el panel lateral).
  // - setSelectedSong es la función obligatoria que usamos para cambiar ese valor.
  // - El valor (null) indica que al inicio no hay ninguna canción seleccionada.
  // IMPORTANTE: Si llamamos a setSelectedSong, React vuelve a dibujar toda la pantalla.
  const [selectedSong, setSelectedSong] = useState(null);

  // =====================================================================
  // 4. CONTEXTO GLOBAL DE MÚSICA
  // =====================================================================
  // Ejecutamos useMusic() para obtener acceso al catálogo completo y a 
  // las funciones del reproductor.
  // Las llaves { } alrededor de las variables indican que estamos "desestructurando"
  // un objeto grande, tomando únicamente las piezas que nos importan en esta pantalla.
  const {
    songs,           // Array con todas las canciones del sistema.
    albums,          // Array con todos los álbumes.
    composers,       // Array con todos los compositores.
    playSong,        // Función para reproducir una canción específica.
    playCollection,  // Función para reproducir una lista entera (como el álbum).
    isBlocked,       // Función que verifica si una canción está bloqueada.
    isFavorite,      // Función que verifica si una canción es favorita del usuario.
    toggleFavorite,  // Función para agregar o quitar de favoritos.
    toggleBlocked,   // Función para bloquear o desbloquear una canción.
    songDurations,   // Objeto que almacena los tiempos de duración calculados.
  } = useMusic();

  // =====================================================================
  // 5. BÚSQUEDA Y VALIDACIÓN DEL ÁLBUM
  // =====================================================================
  // Necesitamos encontrar el álbum exacto que el usuario quiere ver.
  // 
  // El método .find() recorre el array "albums". Por cada "item" (álbum individual),
  // evalúa una condición. El primero que cumpla la condición se guarda en la constante "album".
  // Si ninguno la cumple, se guarda "undefined".
  // 
  // Usamos Number() para convertir tanto el item.id como el id de la URL en números matemáticos.
  // Esto evita errores donde el texto "15" no coincida con el número 15.
  const album = albums.find(
    (item) => Number(item.id) === Number(id)
  );

  // =====================================================================
  // 6. RENDERIZADO ALTERNATIVO: ÁLBUM NO ENCONTRADO
  // =====================================================================
  // Condicional (if): Evalúa si la variable "album" está vacía, es nula o indefinida.
  // El operador "!" significa "NO". Entonces: "Si NO hay álbum".
  if (!album) {
    // Si entramos a este bloque, el código se interrumpe y devuelve esta
    // pantalla alternativa. El resto del código de la función ya no se ejecutará.
    return (
      // Los símbolos <> y </> se llaman Fragmentos. Permiten devolver varios
      // elementos HTML (como Header, main y Footer) sin envolverlos en un div innecesario.
      <>
        <Header />
        <main className="album-page">
          <button
            type="button"
            // onClick define qué ocurre al hacer clic.
            // Al usar navigate(-1), le pedimos al historial del navegador 
            // que retroceda 1 página, igual que el botón "Atrás" del navegador.
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Volver
          </button>
          <h1>Álbum no encontrado</h1>
        </main>
        <Footer />
      </>
    );
  }

  // =====================================================================
  // 7. OBTENCIÓN DE DATOS RELACIONADOS (COMPOSITOR Y CANCIONES)
  // =====================================================================
  
  // Ahora buscamos al compositor que creó este álbum.
  const composer = composers.find(
    (item) =>
      // Comparamos el ID del compositor actual en el recorrido con el que está en el álbum.
      Number(item.id) ===
      // El operador ?? (Nullish Coalescing) comprueba si la parte izquierda es null o undefined.
      // Si tiene valor (ej: album.composerId tiene un número), usa ese.
      // Si no existe, pasa a la parte derecha (album.composerIds?.[0]).
      // El operador ?. (Optional Chaining) permite buscar el primer elemento [0] de un array,
      // pero si el array composerIds no existe, no produce un error, simplemente devuelve undefined.
      Number(album.composerId ?? album.composerIds?.[0])
  );

  // Se crea un array que contendrá exclusivamente los números de ID de las canciones del álbum.
  // (album.songs ?? []) significa: si el álbum tiene canciones, usalas. Si no, usa un array vacío [].
  // .map(Number) recorre ese array y transforma cada valor a tipo numérico puro.
  const albumSongIds = (album.songs ?? []).map(Number);

  // Filtramos todas las canciones del sistema para dejar solo las que pertenecen a este álbum.
  // El método .filter() devuelve un array nuevo solo con las canciones que devuelvan "true".
  const albumSongs = songs.filter(
    (song) =>
      // CONDICIÓN 1: El ID de álbum guardado en la canción es idéntico al ID de nuestra URL.
      Number(song.albumId) === Number(id) ||
      // El operador "||" (O lógico) significa que si falla la Condición 1, 
      // evaluamos la Condición 2 para ver si al menos esa se cumple:
      
      // CONDICIÓN 2 (Compuesta):
      // Primero (song.albumId == null) comprueba que la canción no tenga un álbum principal asignado.
      // Segundo (&&, Y lógico) ambas partes deben ser verdad.
      // Tercero (.includes()) verifica si el ID de esta canción está dentro de la lista
      // de IDs que calculamos arriba en "albumSongIds".
      (song.albumId == null &&
        albumSongIds.includes(Number(song.id)))
  );

  // De la lista de canciones del álbum, filtramos de nuevo para saber
  // cuáles de ellas realmente se pueden escuchar (no están bloqueadas y tienen archivo de audio).
  // "!" niega el isBlocked, buscando las que NO estén bloqueadas.
  // "&& song.audio" exige que el objeto canción tenga algo en su propiedad 'audio'.
  const playableSongs = albumSongs.filter(
    (song) => !isBlocked(song) && song.audio
  );

  // =====================================================================
  // 8. FUNCIONES AUXILIARES PARA DATOS ESPECÍFICOS
  // =====================================================================
  
  // Función getComposer:
  // 1. Propósito: Encontrar qué compositor hizo una canción en particular.
  // 2. Parámetros: Recibe "song", que representa temporalmente a una canción de la lista.
  // 3. Proceso: Recorre el array global "composers" y devuelve el primero cuyo id
  //    coincida con el "composerId" de la canción enviada.
  const getComposer = (song) =>
    composers.find(
      (item) => Number(item.id) === Number(song?.composerId)
    );

  // Función getAlbum:
  // Funciona igual que getComposer, pero busca el objeto álbum basándose 
  // en el "albumId" almacenado adentro de la canción.
  const getAlbum = (song) =>
    albums.find(
      (item) => Number(item.id) === Number(song?.albumId)
    );

  // =====================================================================
  // 9. INTERFAZ VISUAL: ENCABEZADO Y ACCIONES PRINCIPALES
  // =====================================================================
  // A partir de este return, comienza la estructura de etiquetas HTML (JSX)
  // que el usuario verá dibujada en su navegador.
  return (
    <>
      <Header />
      <main className="album-page">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Volver
        </button>

        <section className="album-header">
          {/* Se carga la imagen de la portada del álbum. album.cover contiene la ruta o enlace. */}
          <img src={album.cover} alt={album.title} />

          <div>
            <span>ÁLBUM</span>
            <h1>{album.title}</h1>

            {/* Condicional JSX: {composer && ( ... )} */}
            {/* Significa: "Si composer existe (no es nulo o falso), mostrá el botón". */}
            {/* Si no se encontró un compositor, este bloque se ignora y no falla. */}
            {composer && (
              <button
                type="button"
                // Al hacer clic, navega a la URL del compositor usando su ID.
                onClick={() =>
                  navigate(`/musica/compositor/${composer.id}`)
                }
              >
                {composer.name}
              </button>
            )}

            <p>
              {/* albumSongs.length cuenta la cantidad de elementos en el array de canciones. */}
              {album.year} · {albumSongs.length} canciones
            </p>
            <p>{album.description}</p>

            <div className="album-actions">
              <button
                type="button"
                className="album-primary-action"
                // El botón se desactiva (disabled) si playableSongs.length es 0 (no hay canciones válidas).
                // El operador "!" invierte el cero (falso) a verdadero, aplicando el atributo "disabled".
                disabled={!playableSongs.length}
                // Llama a la función del contexto para reproducir toda la lista de canciones en orden.
                onClick={() => playCollection(albumSongs)}
              >
                ▶ <span>Reproducir</span>
              </button>

              <button
                type="button"
                className="album-secondary-action"
                disabled={!playableSongs.length}
                // Igual que arriba, pero manda un objeto extra { shuffle: true }
                // que el reproductor entenderá como una orden para mezclar (modo aleatorio).
                onClick={() =>
                  playCollection(albumSongs, { shuffle: true })
                }
              >
                ⤨ <span>Aleatorio</span>
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================================
            10. INTERFAZ VISUAL: LISTA DE CANCIONES
            ===================================================================== */}
        <section className="album-songs songs-list">
          {/* .map() se usa aquí para recorrer el array "albumSongs" y dibujar código HTML por cada uno.
              "song" contiene los datos de la vuelta actual e "index" el número de vuelta (0, 1, 2...). */}
          {albumSongs.map((song, index) => (
            // Componente hijo que dibuja la fila individual.
            <SongRow
              // La propiedad key es obligatoria en React al hacer mapas. Ayuda al motor
              // a identificar de manera única este elemento por si debe borrarlo o moverlo.
              key={song.id}
              // Enviamos un objeto combinado: tomamos los datos originales de la canción (...song)
              // pero le modificamos su duración. Si ya fue calculada en el contexto global
              // (songDurations[song.id]), usamos esa; sino (??), usamos la que viene por defecto.
              song={{
                ...song,
                duration: songDurations[song.id] ?? song.duration,
              }}
              index={index}
              composer={getComposer(song)}
              isFavorite={isFavorite(song)}
              isBlocked={isBlocked(song)}
              // onPlay define qué ocurre si el usuario aprieta el botón de Play en esta fila específica.
              // Ejecutará playSong mandando la canción elegida y toda la lista por si quiere saltar a la siguiente luego.
              onPlay={(selectedSong) =>
                playSong(selectedSong, albumSongs)
              }
              // onOpen avisa que el usuario clickeó la fila (no el play). Esto cambiará 
              // la variable de estado "selectedSong", lo que abrirá el panel lateral que veremos más abajo.
              onOpen={setSelectedSong}
              onToggleFavorite={toggleFavorite}
              onToggleBlocked={toggleBlocked}
            />
          ))}

          {/* Si después de calcular albumSongs vemos que está vacío (longitud 0),
              mostramos este mensaje en lugar de una pantalla en blanco. */}
          {!albumSongs.length && (
            <p>Este álbum todavía no tiene canciones.</p>
          )}
        </section>

        {/* =====================================================================
            11. INTERFAZ VISUAL: PANEL LATERAL Y PIE DE PÁGINA
            ===================================================================== */}
        {/* Este componente muestra los detalles ampliados cuando se hace clic en una fila.
            Si el estado "selectedSong" es null, internamente el panel se mantiene oculto.
            Si tiene un objeto de canción, la dibuja y se despliega. */}
        <SongPanel
          song={selectedSong}
          // Usamos el operador ternario "condición ? verdad : falso".
          // Si selectedSong tiene datos, calculamos el compositor de esa canción. Si es nulo, mandamos null.
          composer={selectedSong ? getComposer(selectedSong) : null}
          // Si hay canción, obtenemos su álbum, sino enviamos el álbum principal de la página actual.
          album={selectedSong ? getAlbum(selectedSong) : album}
          isFavorite={selectedSong ? isFavorite(selectedSong) : false}
          isBlocked={selectedSong ? isBlocked(selectedSong) : false}
          // Función ejecutada cuando se cierra el panel. Reinicia la variable de estado a null.
          onClose={() => setSelectedSong(null)}
          // Si desde el panel abierto le dan a Reproducir:
          // 1. Ejecuta la canción. 2. Cierra el panel volviendo la variable a null.
          onPlay={(song) => {
            playSong(song, albumSongs);
            setSelectedSong(null);
          }}
          onToggleFavorite={toggleFavorite}
          onToggleBlocked={toggleBlocked}
          // Si el usuario toca el nombre del álbum desde adentro del panel,
          // cerramos el panel actual y lo mandamos (navigate) a la página de ese nuevo álbum.
          onOpenAlbum={(selectedAlbum) => {
            setSelectedSong(null);
            navigate(`/musica/album/${selectedAlbum.id}`);
          }}
          // Igual al anterior, pero hacia la página de perfil del compositor.
          onOpenComposer={(selectedComposer) => {
            setSelectedSong(null);
            navigate(`/musica/compositor/${selectedComposer.id}`);
          }}
        />
      </main>
      <Footer />
    </>
  );
}

// export default expone esta función principal "Album" hacia el resto del proyecto.
// Es necesario para que los archivos de rutas sepan qué dibujar cuando entran a esta dirección web.
export default Album;