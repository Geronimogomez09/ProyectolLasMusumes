// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. FUNCIÓN AUXILIAR: FORMATO DE DURACIÓN
// 3. COMPONENTE PRINCIPAL: PÁGINA DE CANCIÓN
// 4. PARÁMETROS DE RUTA Y HERRAMIENTAS DE NAVEGACIÓN
// 5. CONEXIÓN CON EL CONTEXTO MUSICAL GLOBAL
// 6. BÚSQUEDA DEL REGISTRO DE LA CANCIÓN
// 7. PANTALLA ALTERNATIVA: CANCIÓN NO ENCONTRADA
// 8. BÚSQUEDA DE RELACIONES: COMPOSITOR Y ÁLBUM
// 9. CÁLCULO DE ESTADOS VISUALES Y DURACIÓN FINAL
// 10. FUNCIÓN DE REPRODUCCIÓN (EVENTO CLICK)
// 11. CONSTRUCCIÓN DE LA INTERFAZ VISUAL (HTML/JSX)
// 12. SECCIÓN VISUAL: PORTADA Y METADATOS
// 13. SECCIÓN VISUAL: BOTONES DE ACCIÓN

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos React, la librería principal que permite construir interfaces de usuario.
import React from "react";

// Importamos los componentes visuales genéricos que se repiten en varias pantallas.
import Header from "../components/header";
import Footer from "../components/Footer";

// Importamos las herramientas de react-router-dom para manipular la URL de la página.
// - useNavigate: permite crear una función para forzar cambios de página mediante clics.
// - useParams: permite extraer variables dinámicas ocultas en la dirección web (URL).
import { useNavigate, useParams } from "react-router-dom";

// Importamos el almacén global de música (contexto).
// Permite que esta página acceda a las canciones descargadas sin tener que volver a pedirlas a Firebase.
import { useMusic } from "../context/MusicContext";

// Importamos la hoja de estilos CSS exclusiva para darle diseño a la página de canciones.
import "../styles/cancion.css";

// 2. FUNCIÓN AUXILIAR: FORMATO DE DURACIÓN

// Propósito: Convertir un número total de segundos en un texto legible para humanos (ej: "3:05").
// Parámetros: "seconds" (segundos), que representa la duración matemática de la canción.
// Proceso y Condiciones:
// - Number.isFinite(seconds): Evalúa si el valor recibido es un número real válido.
//   Si recibimos algo roto como "NaN" (Not a Number), textos, nulos o infinito, esto da falso.
// - El operador "!" invierte esa condición.
// - "||" (O lógico): Evalúa si se cumple lo anterior, O si los segundos son menores o iguales a cero.
// - Si cualquiera de las dos cosas está mal, retorna "null" (nada), interrumpiendo la función.
function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return null;
  }

  // Math.floor() redondea siempre hacia abajo para quitar los decimales.
  // Dividir los segundos totales por 60 nos da la cantidad de minutos enteros.
  const minutes = Math.floor(seconds / 60);
  
  // El operador módulo "%" devuelve el "resto" de una división.
  // "seconds % 60" significa: dividí los segundos por 60, y decime cuántos segundos sobraron.
  // Así, 65 % 60 devuelve 5.
  const remainingSeconds = Math.floor(seconds % 60);

  // Construcción del texto final usando "Template Literals" (comillas invertidas `` y ${}).
  // String() convierte el número suelto en un texto.
  // .padStart(2, "0") asegura que el texto de los segundos siempre tenga 2 espacios obligatorios.
  // Si los segundos sobrantes son "5", padStart le pega un "0" adelante devolviendo "05".
  // Retorno: El string final, por ejemplo "1:05".
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// 3. COMPONENTE PRINCIPAL: PÁGINA DE CANCIÓN

// Este componente representa la vista entera y detallada de una sola canción.
function Cancion() {
  
  // 4. PARÁMETROS DE RUTA Y HERRAMIENTAS DE NAVEGACIÓN
  
  // useParams() revisa la barra de direcciones del navegador.
  // Si entramos a "misitio.com/cancion/123", extrae el valor "123" y lo guarda
  // automáticamente en la variable constante "id".
  const { id } = useParams();
  
  // Guardamos la función de navegación en una variable para usarla en los botones.
  const navigate = useNavigate();

  // 5. CONEXIÓN CON EL CONTEXTO MUSICAL GLOBAL
  
  // Extraemos únicamente las herramientas e información que necesitamos del contexto de música.
  // - arrays de datos: songs, composers, albums.
  // - currentSong: almacena el objeto de la canción que está sonando en este preciso momento en toda la app.
  // - playSong: función para mandar una canción al reproductor.
  // - isFavorite / toggleFavorite: funciones para verificar o cambiar si la canción es favorita.
  // - songDurations: objeto de memoria que guarda los cálculos de duración de todas las canciones.
  // - isBlocked: función que chequea si la canción fue censurada o bloqueada.
  const {
    songs,
    composers,
    albums,
    currentSong,
    playSong,
    isFavorite,
    toggleFavorite,
    songDurations,
    isBlocked,
  } = useMusic();

  // 6. BÚSQUEDA DEL REGISTRO DE LA CANCIÓN
  
  // Busca dentro de todo el catálogo global de canciones cuál es la que queremos mostrar.
  // .find() recorre la lista completa.
  // Number() se usa en ambos lados de la comparación porque el "id" de la URL es texto ("123"),
  // pero el "id" en la base de datos podría ser un número. Number() unifica el formato.
  const song = songs.find(
    (item) => Number(item.id) === Number(id)
  );

  // 7. PANTALLA ALTERNATIVA: CANCIÓN NO ENCONTRADA
  
  // Si la búsqueda anterior devolvió "undefined" (no se halló la canción), "song" estará vacía.
  // El operador "!" invierte esa condición para que entre al "if" si la canción NO existe.
  if (!song) {
    // Retorna una pantalla de error genérica y amigable.
    // Al usar "return" acá, el programa sale de la función Cancion() y no procesa el resto del código.
    return (
      <>
        <Header />
        <main className="song-page">
          <button
            type="button"
            // El "-1" en navigate le dice al historial del navegador que dé un paso atrás (página anterior).
            onClick={() => navigate(-1)}
            className="back-button"
          >
            ← Volver
          </button>

          <section className="song-not-found">
            <span className="song-eyebrow">WIKICRAFT MUSIC</span>
            <h1>Canción no encontrada</h1>
            <p>Esta canción no existe o ya no está disponible.</p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  // 8. BÚSQUEDA DE RELACIONES: COMPOSITOR Y ÁLBUM
  
  // Sabiendo que la canción sí existe, ahora buscamos a su compositor y a su álbum.
  // Comparamos el ID oficial del compositor con el "composerId" guardado dentro de la canción.
  const composer = composers.find(
    (item) => Number(item.id) === Number(song.composerId)
  );

  // Hacemos lo mismo con el álbum, usando el "albumId".
  const album = albums.find(
    (item) => Number(item.id) === Number(song.albumId)
  );

  // 9. CÁLCULO DE ESTADOS VISUALES Y DURACIÓN FINAL
  
  // Le pasamos la canción encontrada a la función global isFavorite.
  // Nos devuelve un valor booleano (true/false) que define si debemos pintar el corazón o no.
  const favorite = isFavorite(song);
  
  // Le pasamos la canción a isBlocked para saber si está deshabilitada.
  const blocked = isBlocked(song);

  // Comprueba si la canción que el usuario está mirando es la MISMA que la app está reproduciendo.
  // Evitamos errores (cuelgues) usando currentSong?.id, que significa: "Si currentSong existe, leé el id. Sino, devolvé vacío".
  const isCurrentSong =
    Number(currentSong?.id) === Number(song.id);

  // Mecanismo en cascada (fallback) para calcular la duración, usando el operador O (||).
  // Funciona así: Intenta la Opción A, si falla, intenta la B, si falla, intenta la C.
  // 
  // Opción A: formatDuration intenta usar los segundos guardados en el registro global en vivo "songDurations".
  // Opción B: formatDuration intenta usar los segundos fijos guardados en la base de datos "song.durationSeconds".
  // Opción C: Si todo falla, chequea si existe un texto manual pre-escrito en "song.duration" (ej: "3:10").
  // Si al final nada de esto sirve, el resultado será "null".
  const duration =
    formatDuration(songDurations?.[song.id]) ||
    formatDuration(Number(song.durationSeconds)) ||
    (typeof song.duration === "string" ? song.duration : null);

  // 10. FUNCIÓN DE REPRODUCCIÓN (EVENTO CLICK)
  
  // Esta función interna decide qué hacer cuando el usuario apriete el botón "Reproducir".
  const handlePlay = () => {
    // Condición de bloqueo: Si la canción fue bloqueada por el sistema (blocked),
    // O si la canción carece físicamente de archivo de audio (!song.audio),
    // interrumpe la función ejecutando "return" para que no haga nada y evite romper el reproductor.
    if (blocked || !song.audio) return;
    
    // Si pasó las validaciones, le envía la canción al reproductor global.
    playSong(song);
  };

  // 11. CONSTRUCCIÓN DE LA INTERFAZ VISUAL (HTML/JSX)
  
  // Aquí comienza la estructura que dibujará la página en la pantalla del usuario.
  return (
    <>
      <Header />
      <main className="song-page">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          {/* aria-hidden="true" le avisa a los lectores de pantalla para personas ciegas 
              que ignoren la flechita visual porque no aporta significado extra. */}
          <span aria-hidden="true">←</span> Volver
        </button>

        <div className="song-page-heading">
          <span className="song-eyebrow">WIKICRAFT MUSIC</span>
          <p>UNIVERSO MUSICAL · ARCHIVO DE MELODÍAS</p>
        </div>

        {/* 12. SECCIÓN VISUAL: PORTADA Y METADATOS */}
        <section className="song-detail">
          
          {/* Contenedor de la imagen de portada de la canción */}
          <div className="song-cover-frame">
            <div className="song-cover-pixel-border">
              <img
                src={song.cover}
                alt={`Portada de ${song.title}`}
                className="song-cover"
              />
            </div>

            <span className="song-cover-caption">
              ♪ SOUNDTRACK COLLECTION
            </span>
          </div>

          {/* Contenedor de la información escrita y los botones */}
          <div className="song-information">
            
            <span className="song-category">
              {/* Operador ternario (condición ? verdadero : falso).
                  Si la variable isCurrentSong es verdadera, muestra "SONANDO AHORA", 
                  sino muestra simplemente "CANCIÓN". */}
              {isCurrentSong ? "▶ SONANDO AHORA" : "♫ CANCIÓN"}
            </span>

            <h1>{song.title}</h1>

            <div className="song-divider" />

            {/* Condicional JSX: Solo dibuja este bloque si la variable "composer" contiene datos. */}
            {composer && (
              <div className="song-metadata">
                <span className="metadata-label">COMPOSITOR</span>
                <button
                  type="button"
                  className="song-link"
                  // Al hacer clic, le dice al navegador que nos lleve al perfil de este compositor específico.
                  onClick={() =>
                    navigate(`/musica/compositor/${composer.id}`)
                  }
                >
                  {composer.name} <span aria-hidden="true">↗</span>
                </button>
              </div>
            )}

            {/* Condicional JSX: Igual que el compositor, pero evaluando si existe el "album". */}
            {album && (
              <div className="song-metadata">
                <span className="metadata-label">ÁLBUM</span>
                <button
                  type="button"
                  className="song-link"
                  onClick={() =>
                    navigate(`/musica/album/${album.id}`)
                  }
                >
                  {album.title} <span aria-hidden="true">↗</span>
                </button>
              </div>
            )}

            <div className="song-metadata">
              <span className="metadata-label">DURACIÓN</span>
              <p className="song-duration">
                {/* Si la variable duration tiene texto (calculado antes), lo muestra.
                    Sino (||), muestra el texto alternativo "Calculando duración...". */}
                {duration || "Calculando duración…"}
              </p>
            </div>

            {/* 13. SECCIÓN VISUAL: BOTONES DE ACCIÓN */}
            <div className="song-actions">
              
              <button
                type="button"
                className="song-play-button"
                // Al hacer clic ejecuta la función handlePlay creada arriba.
                onClick={handlePlay}
                // Si la canción está bloqueada o no tiene audio, le pone el atributo disabled (desactivado)
                // al botón HTML para que se vea gris y no se pueda apretar.
                disabled={blocked || !song.audio}
              >
                <span aria-hidden="true">▶</span>
                {/* Operador ternario anidado para decidir qué texto ponerle al botón:
                    1. ¿Está bloqueada? Escribe "Canción bloqueada".
                    2. Si no, ¿Está sonando ahora? Escribe "Reproducir de nuevo".
                    3. Si no es ninguna de las dos, escribe "Reproducir canción". */}
                {blocked
                  ? "Canción bloqueada"
                  : isCurrentSong
                    ? "Reproducir de nuevo"
                    : "Reproducir canción"}
              </button>

              <button
                type="button"
                // Inyecta dinámicamente la clase CSS "is-favorite" si la variable favorite es verdadera, 
                // para que el botón cambie de color.
                className={`song-favorite-button ${
                  favorite ? "is-favorite" : ""
                }`}
                // Al hacer clic, ejecuta directamente la función global del contexto para alternar el guardado.
                onClick={() => toggleFavorite(song)}
                // Atributo de accesibilidad que indica a los lectores de pantalla el estado actual del botón pulsador.
                aria-pressed={favorite}
              >
                {/* Cambia el ícono del corazón según si está guardado (♥ relleno) o no (♡ hueco). */}
                <span aria-hidden="true">
                  {favorite ? "♥" : "♡"}
                </span>
                {/* Cambia el texto descriptivo del botón. */}
                {favorite ? "En favoritos" : "Añadir a favoritos"}
              </button>
            </div>

            <p className="song-footer-note">
              {/* Cambia el subtítulo final de la página dependiendo de si la canción está en la colección personal o no. */}
              {favorite
                ? "Esta melodía forma parte de tu colección."
                : "Guardá tus melodías favoritas para encontrarlas fácilmente."}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Expone el componente de forma predeterminada para que el enrutador de React pueda dibujarlo.
export default Cancion;