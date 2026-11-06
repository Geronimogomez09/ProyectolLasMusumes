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
