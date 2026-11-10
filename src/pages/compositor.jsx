// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. COMPONENTE PRINCIPAL: PÁGINA DE COMPOSITOR
// 3. PARÁMETROS DE URL Y NAVEGACIÓN
// 4. CONTEXTO GLOBAL DE MÚSICA
// 5. BÚSQUEDA DEL COMPOSITOR SOLICITADO
// 6. PANTALLA ALTERNATIVA: COMPOSITOR NO ENCONTRADO
// 7. FILTRADO DE CANCIONES RELACIONADAS
// 8. FILTRADO DE ÁLBUMES RELACIONADOS
// 9. FUNCIÓN AUXILIAR: CÁLCULO DE DURACIÓN
// 10. INTERFAZ VISUAL: ENCABEZADO Y SEGUIMIENTO
// 11. INTERFAZ VISUAL: LISTA DE CANCIONES
// 12. INTERFAZ VISUAL: LISTA DE ÁLBUMES Y PIE DE PÁGINA

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos la base de la librería React para que este archivo pueda generar interfaces visuales.
import React from "react";

// Importamos los componentes universales del sitio que se repiten en cada vista.
import Header from "../components/header";
import Footer from "../components/Footer";

// Importamos los "hooks" (herramientas) de react-router-dom:
// - useNavigate nos permitirá programar botones para cambiar de página.
// - useParams nos permitirá leer información oculta directamente desde la dirección de la página.
import { useNavigate, useParams } from "react-router-dom";

// Importamos el acceso a la "memoria global" de música que contiene todos los datos cargados.
import { useMusic } from "../context/MusicContext";

// Importamos los archivos CSS específicos para darle aspecto y posicionamiento a los elementos.
import "../styles/musica.css";
import "../styles/compositor.css";

// 2. COMPONENTE PRINCIPAL: PÁGINA DE COMPOSITOR

// Función que define y empaqueta la vista entera del perfil de un compositor.
// No recibe propiedades externas (props) porque obtiene todos sus datos a través de la URL y el contexto.
function Compositor() {
  
  // 3. PARÁMETROS DE URL Y NAVEGACIÓN

  // Extrae de la dirección web (URL) el identificador numérico o de texto.
  // Por ejemplo, si el usuario entró a "/musica/compositor/5", { id } será "5".
  const { id } = useParams();
  
  // Guardamos la función de navegación en una variable llamada "navigate"
  // para poder llamarla más adelante cuando el usuario haga clic en un enlace.
  const navigate = useNavigate();

  // 4. CONTEXTO GLOBAL DE MÚSICA

  // Desempaquetamos (desestructuramos) las herramientas necesarias del estado global:
  // - composers: Lista maestra de todos los compositores.
  // - songs: Lista maestra de todas las canciones.
  // - albums: Lista maestra de todos los álbumes.
  // - songDurations: Diccionario de tiempos exactos calculados para cada canción.
  // - isFollowingComposer: Función que responde true/false si el usuario sigue a este compositor.
  // - toggleFollowComposer: Función que permite seguir o dejar de seguir a este compositor.
  const {
    composers,
    songs,
    albums,
    songDurations,
    isFollowingComposer,
    toggleFollowComposer,
  } = useMusic();

  // 5. BÚSQUEDA DEL COMPOSITOR SOLICITADO

  // Recorre el array global "composers" con el método .find() buscando al compositor que nos pidieron.
  // Convierte ambos valores a número puro usando Number() para evitar que el código falle 
  // si un lado es el texto "5" y el otro es el número matemático 5.
  const composer = composers.find(
    (item) => Number(item.id) === Number(id)
  );

  // 6. PANTALLA ALTERNATIVA: COMPOSITOR NO ENCONTRADO

  // Condicional de seguridad: Si la función .find() de arriba falló (porque el ID no existe),
  // la constante "composer" será "undefined".
  // Al negarlo con "!", evaluamos: "Si no existe el compositor, ejecuta este bloque".
  if (!composer) {
    // Si entramos aquí, el componente devuelve esta pantalla de error y el código termina anticipadamente.
    return (
      <>
        <Header />
        <main className="composer-page">
          <h1>Compositor no encontrado</h1>
          <button
            type="button"
            className="back-button"
            // Vuelve a la página anterior en el historial del navegador.
            onClick={() => navigate(-1)}
          >
            ← Volver
          </button>
        </main>
        <Footer />
      </>
    );
  }

  // 7. FILTRADO DE CANCIONES RELACIONADAS

  // Recorre la lista gigante de canciones (songs) usando .filter().
  // Este método devuelve un nuevo array más pequeño que contiene ÚNICAMENTE las canciones
  // que devuelvan "true" a la condición establecida.
  // La condición exige que el "composerId" guardado adentro de cada canción sea idéntico
  // al ID del compositor que estamos mirando en esta página.
  const composerSongs = songs.filter(
    (song) =>
      Number(song.composerId) === Number(composer.id)
  );

  // 8. FILTRADO DE ÁLBUMES RELACIONADOS

  // Realiza un filtrado similar con la lista de álbumes, pero con una condición más completa
  // para abarcar diferentes formatos en los que puede estar guardada la base de datos.
  const composerAlbums = albums.filter(
    (album) =>
      // Opción A: Verifica si el álbum pertenece exclusivamente a este compositor (album.composerId simple).
      Number(album.composerId) === Number(composer.id) ||
      
      // Opción B (|| significa "O si no se cumple lo anterior, comprobá esto"):
      // Algunos álbumes viejos pueden haber sido hechos por varios compositores a la vez, 
      // y tienen un array llamado "composerIds".
      // 
      // (album.composerIds ?? []) significa: Si "composerIds" es nulo o no existe, usá un array vacío [].
      // Esto evita un error crítico donde el programa intente usar .some() sobre un valor inexistente.
      // 
      // El método .some() revisa la lista de IDs internos del álbum. Si al menos UNO (algún)
      // ID interno coincide con el de nuestro compositor actual, devuelve "true" y el álbum se incluye.
      (album.composerIds ?? []).some(
        (composerId) => Number(composerId) === Number(composer.id)
      )
  );

  // 9. FUNCIÓN AUXILIAR: CÁLCULO DE DURACIÓN

  // 1. Propósito: Resolver cómo se mostrará la duración de cada canción individual de la lista.
  // 2. Parámetros: Recibe el objeto completo de una canción.
  // 3. Proceso:
  const getDuration = (song) => {
    
    // Primero, intenta leer la duración desde dos fuentes posibles usando el operador Nullish Coalescing (??).
    // Esto significa: intentá con la propiedad izquierda "song.duration". Si es "null" o "undefined", 
    // pasá a intentar con la derecha "songDurations?.[song.id]" (el diccionario de tiempos guardados en memoria).
    const duration =
      song.duration ??
      songDurations?.[song.id];

    // Caso 1: Si la duración encontrada es una cadena de texto válida y no está vacía 
    // (ej: "3:45" guardado a mano por un editor), se devuelve directamente ese mismo texto.
    if (typeof duration === "string" && duration.trim()) {
      return duration;
    }

    // Caso 2: Si el resultado es un número puro y real (ej: 225 segundos),
    // se hace la conversión matemática a formato Minutos:Segundos.
    if (typeof duration === "number" && Number.isFinite(duration)) {
      // Divide por 60 y recorta los decimales para obtener minutos.
      const minutes = Math.floor(duration / 60);
      
      // Obtiene el remanente de segundos de la división exacta por 60.
      const seconds = Math.floor(duration % 60);

      // Ensambla el texto final forzando que los segundos tengan dos dígitos usando padStart.
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    // Caso 3: Si nada funcionó (no era texto ni era número matemático),
    // se devuelve un texto alternativo genérico para no romper la pantalla.
    return "Duración desconocida";
  };

  // 10. INTERFAZ VISUAL: ENCABEZADO Y SEGUIMIENTO

  // Comienza a dibujarse la estructura HTML oficial (JSX) del perfil.
  return (
    <>
      <Header />
      <main className="composer-page">
        {/* Botón superior de retroceso en el historial. */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="back-button"
        >
          ← Volver
        </button>

        {/* Encabezado del perfil con la imagen y datos del compositor */}
        <section className="composer-header">
          <img src={composer.image} alt={composer.name} />

          <div>
            <span>COMPOSITOR</span>
            <h1>{composer.name}</h1>
            <p>{composer.description}</p>

            {/* BOTÓN DE SEGUIMIENTO */}
            <button
              type="button"
              // Lógica de clases (className): Inyecta la clase CSS "active" si la función
              // global isFollowingComposer confirma que el usuario sigue a esta persona. 
              // Esto hace que el botón cambie de color visualmente.
              className={`composer-follow-button ${
                isFollowingComposer(composer.id) ? "active" : ""
              }`}
              // Al hacer clic, le avisa a Firebase (a través del contexto) que queremos alternar 
              // el seguimiento de este ID en particular.
              onClick={() => toggleFollowComposer(composer.id)}
              // aria-pressed asiste a los lectores de pantalla marcando si el botón está "hundido" o no.
              aria-pressed={isFollowingComposer(composer.id)}
            >
              <img
                src="/music/iconos/brujuladerecuperacion.gif"
                alt=""
                className="composer-follow-icon"
              />
              <span>
                {/* Cambia el texto interno dependiendo de la respuesta de la misma función. */}
                {isFollowingComposer(composer.id) ? "Siguiendo" : "Seguir"}
              </span>
            </button>
          </div>
        </section>

        {/* 11. INTERFAZ VISUAL: LISTA DE CANCIONES */}
        <section className="composer-section">
          <h2 className="composer-section-title">
            <img
              src="/music/iconos/disco_musical.png"
              alt=""
              className="music-category-icon"
            />
            Sus canciones
          </h2>

          <div className="composer-songs">
            {/* Recorre el array filtrado de canciones (composerSongs) y dibuja un bloque HTML por cada una. */}
            {composerSongs.map((song) => (
              <button
                type="button"
                // "key" obligatorio para que el motor de React reconozca e indexe cada elemento único del recorrido.
                key={song.id}
                className="composer-song-item"
                // Al tocar el botón de una canción de la lista, el navegador cambia a su pantalla de detalles (Cancion.jsx).
                onClick={() =>
                  navigate(`/musica/cancion/${song.id}`)
                }
              >
                <img src={song.cover} alt={song.title} />

                <div>
                  <strong>{song.title}</strong>
                  {/* Llama a la función de cálculo matemático de tiempo, enviándole esta canción específica. */}
                  <span>{getDuration(song)}</span>
                </div>
              </button>
            ))}

            {/* Evalúa matemáticamente si el array filtrado quedó vacío (longitud igual a cero).
                Si la condición da verdadero, muestra un texto en vez de un espacio en blanco roto. */}
            {composerSongs.length === 0 && (
              <p>Este compositor todavía no tiene canciones.</p>
            )}
          </div>
        </section>

        {/* 12. INTERFAZ VISUAL: LISTA DE ÁLBUMES Y PIE DE PÁGINA */}
        <section className="composer-section">
          <h2 className="composer-section-title">
            <img
              src="/music/iconos/estanteria.png"
              alt=""
              className="music-category-icon"
            />
            Álbumes
          </h2>

          <div className="composer-albums">
            {/* Realiza el mismo recorrido iterativo con .map() que hicimos con las canciones, 
                pero esta vez con el array "composerAlbums" creado más arriba. */}
            {composerAlbums.map((album) => (
              <button
                type="button"
                key={album.id}
                // Si hace clic en un álbum, salta a la pantalla de detalles de Album (Album.jsx).
                onClick={() =>
                  navigate(`/musica/album/${album.id}`)
                }
              >
                <img src={album.cover} alt={album.title} />
                <strong>{album.title}</strong>
                <span>{album.year}</span>
              </button>
            ))}

            {/* Condición que detecta si el array de álbumes quedó vacío para evitar huecos en la página. */}
            {composerAlbums.length === 0 && (
              <p>Este compositor todavía no tiene álbumes.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Expone el empaquetado del componente para que otras partes del proyecto (como las rutas)
// puedan invocarlo y dibujarlo en la pantalla del usuario.
export default Compositor;