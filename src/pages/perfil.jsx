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
