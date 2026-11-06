// Importa React y el hook useState para administrar los estados del componente.
import React, { useState } from "react";

// useLocation permite consultar la URL actual y useNavigate permite cambiar de página.
import { useLocation, useNavigate } from "react-router-dom";

// Funciones de Firebase Authentication para iniciar sesión, crear cuentas
// y actualizar los datos del perfil de un usuario.
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

// Importa la instancia de autenticación configurada en el proyecto.
import { auth } from "../services/firebase";

// Importa los estilos específicos de la página de acceso y registro.
import "../styles/login.css";

// Lista de países disponibles en el formulario de registro.
// Se utiliza posteriormente para generar las opciones del selector.
const PAISES = ["Argentina", "Chile", "Colombia", "España", "México", "Uruguay", "Otro"];

// Convierte los códigos de error de Firebase en mensajes comprensibles para el usuario.
// Recibe el código de error y devuelve el mensaje correspondiente.
function traducirErrorFirebase(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese email ya está registrado.";

    case "auth/invalid-email":
      return "El email no es válido.";

    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";

    // Estos códigos representan problemas con las credenciales ingresadas.
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o contraseña incorrectos.";

    case "auth/too-many-requests":
      return "Demasiados intentos. Probá de nuevo en unos minutos.";

    // Mensaje general para errores que no se contemplaron anteriormente.
    default:
      return "Ocurrió un error. Intentá nuevamente.";
  }
}

// Carga automáticamente los archivos de imagen que se encuentran dentro de src/assets.
// También busca imágenes ubicadas en subcarpetas, como assets/iconos.
// import.meta.glob es una función de Vite que permite localizar archivos según un patrón.
const RECURSOS_ACCESO = Object.entries(
  import.meta.glob("../assets/**/*.{png,jpg,jpeg,webp,gif,avif,svg}", {
    eager: true,
    import: "default",
  })
).reduce((recursos, [ruta, url]) => {
  // Elimina la parte inicial de la ruta para conservar únicamente la ubicación dentro de assets.
  const relativa = ruta.replace("../assets/", "");

  // Obtiene el nombre del archivo sin incluir las carpetas anteriores.
  const nombre = relativa.split("/").pop();

  // Guarda cada imagen utilizando tanto su ruta relativa como su nombre.
  // Esto permite buscarla de cualquiera de las dos formas.
  recursos[relativa] = url;
  recursos[nombre] = url;

  return recursos;
}, {});

// COMPONENTE DE IMAGEN: busca una imagen dentro de los recursos cargados anteriormente.
// Recibe el nombre del archivo y la clase CSS que debe utilizar.
function ImagenAcceso({ nombre, className }) {
  // Primero busca la imagen por su nombre y después intenta encontrarla
  // dentro de la carpeta iconos.
  const src = RECURSOS_ACCESO[nombre] ?? RECURSOS_ACCESO[`iconos/${nombre}`];

  // Si no encuentra el archivo, no muestra ningún elemento.
  if (!src) return null;

  // Muestra la imagen encontrada con los estilos recibidos.
  return (
    <img
      src={src}
      className={className}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  );
}

// COMPONENTE DECORATIVO: agrupa los bloques, flores, animales y partículas
// que forman parte de la ambientación inspirada en los biomas de Minecraft.
function DecoracionAcceso() {
  return (
    <div className="acceso-decoracion" aria-hidden="true">

      {/* BLOQUES: agrega imágenes de bloques de diferentes materiales. */}
      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-uno">
        <ImagenAcceso nombre="grass_block.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-dos">
        <ImagenAcceso nombre="dirt.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-tres">
        <ImagenAcceso nombre="stone.png" className="acceso-recurso-imagen" />
      </span>

      {/* FLORES Y VEGETACIÓN: agrega elementos naturales para complementar el fondo. */}
      <span className="acceso-recurso acceso-flor acceso-flor--uno">
        <ImagenAcceso nombre="wildflowers.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-flor acceso-flor--dos">
        <ImagenAcceso nombre="pink_petals.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-flor acceso-flor--tres">
        <ImagenAcceso nombre="sunflower.png" className="acceso-recurso-imagen" />
      </span>

      {/* ANIMALES: incorpora personajes decorativos del mundo de Minecraft. */}
      <span className="acceso-animal acceso-animal--zorro">
        <ImagenAcceso nombre="FoxPixel.png" className="acceso-animal-img" />
      </span>

      <span className="acceso-animal acceso-animal--abeja">
        <ImagenAcceso nombre="BeePixel.png" className="acceso-animal-img" />
      </span>

      <span className="acceso-animal acceso-animal--rana">
        <ImagenAcceso nombre="FrogPixel.png" className="acceso-animal-img" />
      </span>

      <span className="acceso-animal acceso-animal--moobloom">
        <ImagenAcceso nombre="MoobloomPixel.png" className="acceso-animal-img" />
      </span>

      {/* PARTÍCULAS: pequeños elementos de luz que complementan la decoración. */}
      <span className="acceso-particula acceso-particula--uno" />
      <span className="acceso-particula acceso-particula--dos" />
      <span className="acceso-particula acceso-particula--tres" />
    </div>
  );
}