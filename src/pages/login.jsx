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
