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
