// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. DATOS ESTÁTICOS DE PÁGINAS FIJAS
// 3. FUNCIONES AUXILIARES: NORMALIZACIÓN DE TEXTO
// 4. FUNCIONES AUXILIARES: SISTEMA DE PUNTUACIÓN
// 5. FUNCIONES AUXILIARES: RECUPERACIÓN DE DATOS LOCALES
// 6. COMPONENTE PRINCIPAL: BÚSQUEDA
// 7. VARIABLES DE ESTADO Y PARÁMETROS DE URL
// 8. CONEXIÓN CON LA BASE DE DATOS (EFECTOS SECUNDARIOS)
// 9. PROCESAMIENTO Y FILTRADO DE RESULTADOS
// 9.1. PREPARACIÓN DE TÉRMINOS
// 9.2. BÚSQUEDA EN EL CATÁLOGO MUSICAL
// 9.3. BÚSQUEDA EN LA TIENDA DE PRODUCTOS
// 9.4. BÚSQUEDA EN EL HISTORIAL DE EVENTOS
// 9.5. COMBINACIÓN, PUNTUACIÓN Y ORDENAMIENTO
// 10. INTERFAZ VISUAL: ENCABEZADO Y ESTADOS DE CARGA
// 11. INTERFAZ VISUAL: LISTA DE RESULTADOS Y MENSAJES VACÍOS

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos "useEffect", "useMemo" y "useState" desde React.
// - useState: permite crear variables que, al cambiar, actualizan la pantalla.
// - useEffect: permite ejecutar código secundario (como buscar en una base de datos) 
//   cuando la pantalla carga por primera vez o cuando cambia algún dato específico.
// - useMemo: permite memorizar el resultado de un cálculo pesado para no tener que 
//   volver a hacerlo a menos que los datos originales cambien.
import { useEffect, useMemo, useState } from "react";

// Importamos herramientas de enrutamiento para movernos entre páginas web.
// - Link: es un componente que funciona como un enlace <a> de HTML, pero optimizado para React.
// - useSearchParams: permite leer la información que viaja en la dirección de la página web (URL), 
//   específicamente los parámetros después del signo de interrogación (ej: ?q=minecraft).
import { Link, useSearchParams } from "react-router-dom";

// Importamos los componentes visuales compartidos de la página.
import Footer from "../components/Footer";
import Header from "../components/header";

// Importamos el contexto de música (variables globales de canciones y listas).
import { useMusic } from "../context/MusicContext";

// Importamos los datos iniciales e información de las eras para la sección de historia.
import { ERAS, EVENTOS_INICIALES } from "../data/historiaData";

// Importamos la función que permite pedir los productos en tiempo real a Firebase Firestore.
import { escucharProductos } from "../services/firestore";

// Importamos el archivo CSS que le da colores y formas a esta página.
import "../styles/busqueda.css";

// 2. DATOS ESTÁTICOS DE PÁGINAS FIJAS

// Se declara una constante PAGINAS que almacena un array (lista) de objetos.
// Cada objeto representa una página estática del sitio web que también debe 
// poder ser encontrada en el buscador.
//
// Propiedades de cada objeto:
// - titulo: El nombre oficial que verá el usuario.
// - tipo: Categoría visual del resultado.
// - descripcion: Texto breve que explica de qué trata la página.
// - href: La ruta (URL interna) a la que llevará al hacer clic.
// - texto: Palabras clave ocultas. Si el usuario escribe "comprar", 
//   encontrará la Tienda aunque la palabra no esté en el título.
const PAGINAS = [
    {
        titulo: "Inicio",
        tipo: "Sección",
        descripcion: "Novedades, construcciones y contenido destacado de Wiki-Craft.",
        href: "/",
        texto: "principal portada novedades construcciones"
    },
    {
        titulo: "Comunidad",
        tipo: "Sección",
        descripcion: "Publicaciones, conversaciones y creaciones de la comunidad.",
        href: "/comunidad",
        texto: "jugadores publicaciones posts comentarios construcciones"
    },
    {
        titulo: "Música",
        tipo: "Sección",
        descripcion: "Explorá canciones, álbumes, compositores y listas.",
        href: "/musica",
        texto: "banda sonora canciones soundtrack playlist listas compositor"
    },
    {
        titulo: "Tienda",
        tipo: "Sección",
        descripcion: "Productos y artículos inspirados en Minecraft.",
        href: "/tienda",
        texto: "comprar productos ropa accesorios figuras tienda"
    },
    {
        titulo: "Historia de Minecraft",
        tipo: "Sección",
        descripcion: "Recorré las eras, versiones y principales hitos del juego.",
        href: "/historia",
        texto: "actualizaciones versiones eras hitos eventos"
    },
    {
        titulo: "Versiones",
        tipo: "Sección",
        descripcion: "Información y publicaciones sobre las versiones del juego.",
        href: "/versiones",
        texto: "versiones actualizaciones release"
    },
    {
        titulo: "Nosotros",
        tipo: "Sección",
        descripcion: "Conocé más sobre Wiki-Craft.",
        href: "/nosotros",
        texto: "acerca equipo"
    }
];

// 3. FUNCIONES AUXILIARES: NORMALIZACIÓN DE TEXTO

// 1. Propósito: Preparar cualquier texto para ser comparado de forma justa en la búsqueda.
//    Convierte mayúsculas a minúsculas, quita espacios extra y elimina acentos.
// 2. Parámetros: "texto", que es la cadena de caracteres a procesar.
// 3. Proceso:
//    - String(texto ?? ""): Se asegura de que sea un texto válido. Si es nulo o indefinido (??), usa un texto vacío ("").
//    - .normalize("NFD"): Separa las letras de sus acentos (ej: "á" se vuelve "a" + "´").
//    - .replace(/[\u0300-\u036f]/g, ""): Busca esos acentos separados (usando una expresión regular) y los borra.
//    - .toLocaleLowerCase("es"): Convierte todo a letras minúsculas siguiendo reglas del idioma español.
//    - .trim(): Elimina los espacios en blanco al principio y al final del texto.
// 4. Retorno: Devuelve el texto completamente limpio.
function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim();
}

// 4. FUNCIONES AUXILIARES: SISTEMA DE PUNTUACIÓN

// 1. Propósito: Evaluar qué tan relevante es un resultado según las palabras que escribió el usuario.
// 2. Parámetros: 
//    - resultado: El objeto (canción, producto, página) que se está evaluando.
//    - terminos: Un array con las palabras (limpias) que buscó el usuario.
// 3. Proceso y Condiciones:
//    - Primero normaliza el título del resultado.
//    - Luego crea un "contenido" uniendo la descripción, el tipo y las palabras clave ocultas.
//    - Evalúa una condición estricta con el método .every(): TODOS los términos buscados deben 
//      estar incluidos (.includes) en el contenido o en el título.
//      Si falta aunque sea uno, devuelve -1 (lo que significa que el resultado se descarta).
//    - Si supera la prueba, usa .reduce() para sumar puntos.
//      .reduce() recorre cada término y acumula un puntaje:
//      * Si el título es exactamente igual al término: suma 10 puntos.
//      * Si el título comienza (.startsWith) con el término: suma 5 puntos.
//      * Si el título solamente contiene (.includes) el término: suma 3 puntos.
// 4. Retorno: El puntaje numérico total.
function puntuarResultado(resultado, terminos) {
    const titulo = normalizar(resultado.titulo);
    const contenido = normalizar(
        `${resultado.descripcion} ${resultado.tipo} ${resultado.texto ?? ""}`
    );

    if (!terminos.every((termino) => contenido.includes(termino) || titulo.includes(termino))) {
        return -1;
    }

    return terminos.reduce(
        (puntos, termino) =>
            puntos +
            (titulo === termino ? 10 : titulo.startsWith(termino) ? 5 : titulo.includes(termino) ? 3 : 0),
        0
    );
}

// 5. FUNCIONES AUXILIARES: RECUPERACIÓN DE DATOS LOCALES

// 1. Propósito: Leer el historial de eventos que el usuario tiene guardado en su propio navegador.
// 2. Proceso:
//    - Utiliza un bloque "try/catch" para intentar ejecutar código que podría fallar (como leer datos corruptos).
//    - window.localStorage.getItem busca un archivo interno del navegador llamado "historia-minecraft-v1".
//    - JSON.parse() convierte ese texto guardado en un objeto o array de JavaScript.
//    - Si la información existe y es un array con elementos (.length > 0), devuelve esos datos.
//    - Si la información está vacía o el archivo estaba roto (se dispara el catch), 
//      devuelve la constante EVENTOS_INICIALES por defecto.
function leerEventosGuardados() {
    try {
        const guardados = JSON.parse(
            window.localStorage.getItem("historia-minecraft-v1") || "null"
        );
        return Array.isArray(guardados) && guardados.length
            ? guardados
            : EVENTOS_INICIALES;
    } catch {
        return EVENTOS_INICIALES;
    }
}

// 6. COMPONENTE PRINCIPAL: BÚSQUEDA

// Exporta por defecto la función del componente para ser usada en el sistema de rutas.
export default function Busqueda() {
    
    // 7. VARIABLES DE ESTADO Y PARÁMETROS DE URL

    // useSearchParams() lee la URL actual. Si la URL es "misitio.com/buscar?q=diamante",
    // extraemos la letra "q".
    const [parametros] = useSearchParams();
    
    // Obtenemos el valor de "q" y le aplicamos .trim() para limpiar espacios extra.
    // Si no existe, usamos un texto vacío (""). Esta constante es la palabra que el usuario buscó.
    const consulta = parametros.get("q")?.trim() ?? "";
    
    // Traemos variables globales de la música.
    const { songs, composers, albums, playlists, isBlocked } = useMusic();
    
    // Variables de estado locales (useState) para la Tienda:
    // - productos: almacenará la lista de productos descargada de Firebase.
    // - productosCargando: indica si la aplicación aún está esperando la respuesta (inicia en true).
    // - errorProductos: indica si hubo una falla de conexión (inicia en false).
    const [productos, setProductos] = useState([]);
    const [productosCargando, setProductosCargando] = useState(true);
    const [errorProductos, setErrorProductos] = useState(false);
    
    // Estado local para los eventos históricos. Llama una sola vez a la función leerEventosGuardados
    // para establecer el valor inicial.
    const [eventos] = useState(leerEventosGuardados);

    // 8. CONEXIÓN CON LA BASE DE DATOS (EFECTOS SECUNDARIOS)

    // useEffect ejecuta instrucciones después de que la pantalla se dibuja.
    // El array vacío al final "[]" indica que esto solo se ejecutará UNA vez al cargar la página.
    useEffect(() => escucharProductos(
        // Primer parámetro: Qué hacer cuando los datos llegan con éxito.
        (documentos) => {
            setProductos(documentos);
            setProductosCargando(false);
            setErrorProductos(false);
        },
        // Segundo parámetro: Qué hacer si ocurre un error (falla de internet, permisos denegados).
        (error) => {
            console.error("Error al buscar productos:", error);
            setProductosCargando(false);
            setErrorProductos(true);
        }
    ), []);

    // 9. PROCESAMIENTO Y FILTRADO DE RESULTADOS

    // useMemo "recuerda" el cálculo completo de la búsqueda.
    // Solo volverá a ejecutar toda esta lógica gigante si cambia alguna de las variables
    // puestas en el array del final ([albums, composers, consulta...]).
    // Esto hace que la página sea mucho más rápida.
    const resultados = useMemo(() => {
        
        // 9.1. PREPARACIÓN DE TÉRMINOS
        // Normaliza lo que el usuario escribió (ej: "Árbol  rojo").
        // .split(/\s+/) divide esa frase en un array separando por espacios.
        // .filter(Boolean) elimina espacios vacíos residuales.
        // Resultado: ["arbol", "rojo"]
        const terminos = normalizar(consulta).split(/\s+/).filter(Boolean);

        // Si no hay términos (el usuario no escribió nada), devuelve un array vacío de inmediato.
        if (terminos.length === 0) return [];

        // 9.2. BÚSQUEDA EN EL CATÁLOGO MUSICAL
        // Se crea un array agrupando canciones, álbumes, compositores y playlists.
        // Se utiliza el operador "..." (spread) para extraer los elementos de cada sub-lista 
        // y meterlos todos mezclados en la gran lista de "resultadosMusicales".
        const resultadosMusicales = [
            
            // Procesa Canciones:
            // Filtra (.filter) las canciones para sacar las que estén bloqueadas.
            // Luego las transforma (.map) en un objeto con el formato estándar de búsqueda.
            ...songs
                .filter((cancion) => !isBlocked(cancion))
                .map((cancion) => {
                    // Busca internamente quién es el compositor y cuál es el álbum de esta canción.
                    const compositor = composers.find(
                        (item) => Number(item.id) === Number(cancion.composerId)
                    );
                    const album = albums.find(
                        (item) => Number(item.id) === Number(cancion.albumId)
                    );

                    return {
                        titulo: cancion.title,
                        tipo: "Canción",
                        // Une el nombre del compositor y álbum separándolos por " · ".
                        // filter(Boolean) evita que se ponga el punto si uno de los dos no existe.
                        descripcion: [compositor?.name, album?.title].filter(Boolean).join(" · "),
                        texto: `${compositor?.name ?? ""} ${album?.title ?? ""}`,
                        href: `/musica/cancion/${cancion.id}`
                    };
                }),
                
            // Procesa Álbumes: los transforma al formato de búsqueda.
            ...albums.map((album) => ({
                titulo: album.title,
                tipo: "Álbum",
                descripcion: album.description,
                href: `/musica/album/${album.id}`
            })),
            
            // Procesa Compositores.
            ...composers.map((compositor) => ({
                titulo: compositor.name,
                tipo: "Compositor",
                descripcion: compositor.description,
                href: `/musica/compositor/${compositor.id}`
            })),
            
            // Procesa Listas de reproducción:
            // Solo toma las que están activas y publicadas, y las transforma.
            ...playlists
                .filter((lista) => lista.activo !== false && lista.status === "published")
                .map((lista) => ({
                    titulo: lista.title,
                    tipo: "Lista de reproducción",
                    descripcion: lista.description,
                    href: `/musica/playlist/${lista.id}`
                }))
        ];

        // 9.3. BÚSQUEDA EN LA TIENDA DE PRODUCTOS
        // Filtra los productos que descargamos de Firebase para quitar los "inactivos".
        // Luego los transforma al formato de búsqueda y construye un enlace (href)
        // que lleva a la tienda y abre el detalle del producto específico.
        const resultadosTienda = productos
            .filter((producto) => producto.estado !== "inactivo")
            .map((producto) => ({
                titulo: producto.nombre,
                tipo: "Producto",
                descripcion: [producto.categoria, producto.descripcion].filter(Boolean).join(" · "),
                texto: `${producto.categoria ?? ""} ${producto.descripcion ?? ""}`,
                // encodeURIComponent asegura que caracteres raros en el ID no rompan la URL web.
                href: `/tienda#producto=${encodeURIComponent(producto.id)}`
            }));

        // 9.4. BÚSQUEDA EN EL HISTORIAL DE EVENTOS
        // Recorre los eventos locales para encontrar la Era histórica a la que pertenecen.
        // Los transforma al formato general.
        const resultadosHistoria = eventos.map((evento) => {
            const era = ERAS.find((item) => item.id === evento.era);
            return {
                titulo: evento.titulo,
                tipo: "Historia",
                descripcion: `${evento.fechaTexto ?? evento.fecha ?? ""}${era ? ` · ${era.nombre}` : ""}`,
                texto: `${evento.descripcion ?? ""} ${(evento.puntos ?? []).join(" ")} ${evento.version ?? ""} ${evento.tipo ?? ""}`,
                href: `/historia#evento-${encodeURIComponent(evento.id)}`
            };
        });

        // 9.5. COMBINACIÓN, PUNTUACIÓN Y ORDENAMIENTO
        // Junta todas las categorías (...PAGINAS, ...resultadosMusicales, etc.) en un solo super-array.
        return [...PAGINAS, ...resultadosMusicales, ...resultadosTienda, ...resultadosHistoria]
            // Paso A: A cada resultado le calcula los puntos usando la función auxiliar.
            // Crea un objeto temporal { resultado: objeto_original, puntuacion: numero }.
            .map((resultado) => ({
                resultado,
                puntuacion: puntuarResultado(resultado, terminos)
            }))
            // Paso B: Elimina (filtra) aquellos que sacaron menos de 0 puntos (no coincidieron).
            .filter((item) => item.puntuacion >= 0)
            // Paso C: Ordena (.sort) la lista.
            // Prioridad 1: Ordena de mayor a menor puntuación (b.puntuacion - a.puntuacion).
            // Prioridad 2: Si tienen la misma puntuación (||), ordena alfabéticamente por título usando localeCompare.
            .sort((a, b) => b.puntuacion - a.puntuacion || a.resultado.titulo.localeCompare(b.resultado.titulo, "es"))
            // Paso D: Desempaqueta el objeto temporal, devolviendo solo los resultados puros ya ordenados.
            .map((item) => item.resultado);
            
    }, [albums, composers, consulta, eventos, isBlocked, playlists, productos, songs]);

    // 10. INTERFAZ VISUAL: ENCABEZADO Y ESTADOS DE CARGA

    // Retorna la estructura HTML (JSX) final.
    return (
        <>
            {/* Barra superior de navegación */}
            <Header />
            
            <main className="busqueda-pagina">
                <div className="busqueda-contenido">
                    <p className="busqueda-etiqueta">WIKI-CRAFT</p>
                    <h1>Resultados de búsqueda</h1>
                    
                    {/* Operador ternario: ¿Hay algo escrito en el buscador (consulta)? 
                        Si es verdadero (?), procesa resultados. Si es falso (:), pide al usuario que escriba. */}
                    {consulta ? (
                        <>
                            <p className="busqueda-resumen">
                                {/* Si la longitud de resultados es mayor a 0, dice la cantidad,
                                    sino (falso), dice "No encontramos resultados". */}
                                {resultados.length
                                    ? `${resultados.length} resultado${resultados.length === 1 ? "" : "s"} para`
                                    : "No encontramos resultados para"}{" "}
                                <strong>“{consulta}”</strong>
                            </p>
                            
                            {/* Si hubo error descargando productos, muestra el aviso. */}
                            {errorProductos && (
                                <p className="busqueda-aviso" role="status">
                                    No se pudieron cargar los productos de la tienda.
                                </p>
                            )}
                            
                            {/* Si está descargando productos, muestra el texto de espera. */}
                            {productosCargando && (
                                <p className="busqueda-aviso" role="status">
                                    Cargando productos de la tienda…
                                </p>
                            )}
                            
                            {/* 11. INTERFAZ VISUAL: LISTA DE RESULTADOS Y MENSAJES VACÍOS */}
                            
                            {/* Evalúa si la cantidad de resultados finales es mayor a cero. */}
                            {resultados.length > 0 ? (
                                <ul className="busqueda-lista">
                                    {/* .map() dibuja un componente HTML <li> (elemento de lista) 
                                        por cada objeto encontrado en el array final. */}
                                    {resultados.map((resultado) => (
                                        // "key" ayuda a React a identificar unívocamente este bloque.
                                        // Combina el tipo y la ruta para crear un ID único.
                                        <li key={`${resultado.tipo}-${resultado.href}`}>
                                            <Link className="busqueda-resultado" to={resultado.href}>
                                                <span className="busqueda-tipo">{resultado.tipo}</span>
                                                <span className="busqueda-titulo">{resultado.titulo}</span>
                                                {/* Si el resultado tiene descripción, dibuja su espacio HTML, 
                                                    sino lo ignora. */}
                                                {resultado.descripcion && (
                                                    <span className="busqueda-descripcion">
                                                        {resultado.descripcion}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : !productosCargando ? (
                                // Si NO hay resultados (la longitud es 0) y tampoco están cargando los productos,
                                // entonces confirma que la búsqueda está completamente vacía y da sugerencias.
                                <p className="busqueda-vacia">
                                    Probá con otro nombre, canción, producto o sección.
                                </p>
                            ) : null}
                        </>
                    ) : (
                        // Bloque "else" del primer ternario: El usuario todavía no escribió nada en el buscador.
                        <p className="busqueda-vacia">
                            Escribí una palabra en el buscador del encabezado para encontrar contenido.
                        </p>
                    )}
                </div>
            </main>
            
            {/* Pie de página */}
            <Footer />
        </>
    );
}