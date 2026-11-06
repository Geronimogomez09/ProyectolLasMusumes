// 1. IMPORTACIONES

// Importa los hooks de React utilizados para manejar estados,
// ejecutar efectos secundarios y memorizar valores.
import { useEffect, useMemo, useState } from "react";

// Link permite navegar entre páginas sin recargar el sitio.
import { Link } from "react-router-dom";

// Componentes compartidos que se utilizan en diferentes páginas.
import Header from "../components/header";
import Footer from "../components/Footer";

// Hook personalizado que proporciona la información del usuario autenticado,
// sus datos de perfil y sus permisos.
import { useAuth } from "../context/AuthContext";

// Funciones y constantes utilizadas para trabajar con Firestore.
import {
  COLECCIONES,
  actualizarDocumento,
  escucharPorCampo,
} from "../services/firestore";

// Importa los estilos específicos de la página de perfil.
import "../styles/perfil.css";


// 2. Contsantes 

// SECCIONES: define las opciones que aparecen en el menú lateral.
// Cada objeto contiene un identificador, un nombre visible y la clase del ícono.
const SECCIONES = [
  { id: "resumen", nombre: "Resumen", icono: "bi-grid" },
  { id: "publicaciones", nombre: "Mis publicaciones", icono: "bi-chat-square-text" },
  { id: "guardado", nombre: "Contenido guardado", icono: "bi-heart" },
  { id: "datos", nombre: "Datos personales", icono: "bi-person-gear" },
];

// ICONOS: carga automáticamente las imágenes PNG que se encuentran
// dentro de la carpeta src/assets/iconos.
// import.meta.glob permite localizar archivos según el patrón indicado.
// eager hace que se carguen inmediatamente e import: "default" obtiene sus URLs.
const ICONOS = Object.fromEntries(
  Object.entries(
    import.meta.glob("../assets/iconos/*.png", { eager: true, import: "default" })
  ).map(([ruta, url]) => [ruta.split("/").pop(), url])
);

// DECORACIÓN: relaciona el nombre de cada imagen con la clase CSS
// que determina su posición y apariencia en el fondo.
const DECORACION = [
  ["grass_block.png", "perfil-deco--1"],
  ["dirt.png", "perfil-deco--2"],
  ["diamond.png", "perfil-deco--3"],
  ["sunflower.png", "perfil-deco--4"],
  ["pink_petals.png", "perfil-deco--5"],
  ["wildflowers.png", "perfil-deco--6"],
];

// 3. FUNCIONES 

// INICIALES: obtiene las primeras letras de un nombre para utilizarlas como avatar.
// Si no se proporciona un nombre, utiliza "Jugador" como valor predeterminado.
const iniciales = (nombre = "Jugador") =>
  nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join("").toUpperCase();

// FECHA LEGIBLE: convierte una fecha en un formato más fácil de leer.
// Firestore puede almacenar fechas como Timestamp, que dispone del método toDate().
function fechaLegible(valor) {

  // Si no se recibe una fecha, devuelve un mensaje predeterminado.
  if (!valor) return "Todavía no disponible";

  // Si el valor tiene el método toDate(), lo utiliza para convertirlo en Date.
  // De lo contrario, intenta construir una fecha directamente con el valor recibido.
  const fecha = valor?.toDate ? valor.toDate() : new Date(valor);

  // Comprueba si la fecha obtenida es válida.
  if (Number.isNaN(fecha.getTime())) return "Todavía no disponible";

  // Convierte la fecha a un formato en español de Argentina.
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

// DECORACIÓN: muestra los bloques y las flores que aparecen detrás de la tarjeta.
// Se separa del componente principal para mantener el código organizado.
function Decoracion() {
  return (
    <div className="perfil-decoracion" aria-hidden="true">

      {/* Recorre el arreglo DECORACION y genera un elemento por cada imagen. */}
      {DECORACION.map(([archivo, clase]) =>

        // Comprueba si la imagen existe dentro del objeto ICONOS.
        // Si existe, muestra el elemento; si no, devuelve null.
        ICONOS[archivo] ? (
          <img
            key={archivo}
            src={ICONOS[archivo]}
            className={`perfil-deco ${clase}`}
            alt=""
            draggable="false"
          />
        ) : null
      )}
    </div>
  );
}

// AVATAR: muestra la fotografía del usuario o sus iniciales como alternativa.
function Avatar({ foto, nombre, className = "" }) {

  // FALLO: indica si ocurrió un problema al cargar la imagen.
  const [fallo, setFallo] = useState(false);

  // Cada vez que cambia la dirección de la fotografía, reinicia el estado de error.
  // Esto permite intentar cargar nuevamente la imagen.
  useEffect(() => {
    setFallo(false);
  }, [foto]);

  return (
    <div className={`perfil-avatar ${className}`}>

      {/* Si existe una fotografía y no ocurrió un error, muestra la imagen. */}
      {foto && !fallo ? (
        <img
          src={foto}
          alt={`Foto de ${nombre}`}

          // onError se ejecuta cuando el navegador no consigue cargar la fotografía.
          // En ese caso, actualiza el estado para mostrar las iniciales.
          onError={() => setFallo(true)}
        />
      ) : (

        // Si no hay fotografía o su carga falla, muestra las iniciales del usuario.
        <span>{iniciales(nombre)}</span>
      )}
    </div>
  );
}

// 4. COMPONENTE PRINCIPAL Y ESTADOS

// PERFIL: contiene el menú de navegación, los datos personales,
// las publicaciones y el contenido guardado del usuario.
export default function Perfil() {

  // Obtiene los datos del contexto de autenticación.
  // usuario contiene la información de Firebase Authentication.
  // perfil contiene los datos adicionales almacenados en Firestore.
  // cargando indica si todavía se están obteniendo los datos.
  // esAdmin indica si el usuario tiene permisos de administrador.
  const { usuario, perfil, cargando, esAdmin } = useAuth();

  // SECCIÓN: indica qué apartado del perfil se encuentra seleccionado.
  const [seccion, setSeccion] = useState("resumen");

  // EDITANDO: determina si el formulario de datos personales está abierto.
  const [editando, setEditando] = useState(false);

  // GUARDANDO: indica si se están enviando modificaciones a Firestore.
  const [guardando, setGuardando] = useState(false);

  // MENSAJE: almacena los mensajes de confirmación que se muestran en pantalla.
  const [mensaje, setMensaje] = useState("");

  // ERROR: almacena los mensajes relacionados con problemas de validación o guardado.
  const [error, setError] = useState("");

  // PUBLICACIONES: almacena las publicaciones realizadas por el usuario.
  const [publicaciones, setPublicaciones] = useState([]);

  // FORMULARIO: contiene los valores de los campos de datos personales.
  // Se inicializa con cadenas vacías para evitar campos sin controlar.
  const [formulario, setFormulario] = useState({
    nombreUsuario: "",
    nombre: "",
    apellido: "",
    biografia: "",
    ubicacion: "",
    sitioWeb: "",
    fechaNacimiento: "",
    fotoPerfil: "",
  });

    // 5. EFECTOS DE REACT
  
    // ACTUALIZAR FORMULARIO: copia los datos del perfil de Firestore
    // dentro del estado formulario cada vez que cambia la información del perfil.
    useEffect(() => {
  
      // Si todavía no existe información del perfil, no realiza ninguna operación.
      if (!perfil) return;
  
      // Actualiza los campos utilizando los datos disponibles.
      // El operador || "" establece una cadena vacía cuando un dato no existe.
      setFormulario({
        nombreUsuario: perfil.nombreUsuario || "",
        nombre: perfil.nombre || "",
        apellido: perfil.apellido || "",
        biografia: perfil.biografia || "",
        ubicacion: perfil.ubicacion || "",
        sitioWeb: perfil.sitioWeb || "",
        fechaNacimiento: perfil.fechaNacimiento || "",
        fotoPerfil: perfil.fotoPerfil || "",
      });
    }, [perfil]);
  // ESCUCHAR PUBLICACIONES: obtiene las publicaciones del usuario
    // y mantiene la lista actualizada mediante un listener de Firestore.
    useEffect(() => {
  
      // Comprueba que exista un usuario autenticado y que tenga un UID.
      // Si no existe, no inicia la consulta.
      if (!usuario?.uid) return undefined;
  
      // escucharPorCampo consulta una colección y escucha los documentos
      // que coincidan con el campo y el valor indicados.
      return escucharPorCampo(
        COLECCIONES.publicaciones,
  
        // Campo que identifica al autor de cada publicación.
        "autorId",
  
        // UID del usuario actual: permite obtener solamente sus publicaciones.
        usuario.uid,
  
        // Función que recibe los documentos encontrados.
        (items) =>
  
          // Actualiza el estado publicaciones con una copia de los resultados.
          // sort ordena los elementos desde el más reciente hasta el más antiguo.
          setPublicaciones(
            [...items].sort(
              (a, b) =>
                (b.fechaCreacion?.toMillis?.() || 0) -
                (a.fechaCreacion?.toMillis?.() || 0)
            )
          ),
  
        // Si ocurre un error durante la consulta, lo muestra en la consola.
        (err) => console.error("No se pudieron cargar las publicaciones:", err)
      );
  
      // El efecto vuelve a ejecutarse cuando cambia el UID del usuario.
      // La función devuelta por escucharPorCampo permite detener la escucha anterior.
    }, [usuario?.uid]);

    // FAVORITOS: agrupa las listas de canciones, publicaciones y productos guardados.
      // useMemo evita volver a crear este objeto mientras perfil no cambie.
      const favoritos = useMemo(
        () => ({
          canciones: perfil?.cancionesFavoritas || [],
          publicaciones: perfil?.publicacionesGuardadas || [],
          productos: perfil?.productosFavoritos || [],
        }),
        [perfil]
      );
    
}