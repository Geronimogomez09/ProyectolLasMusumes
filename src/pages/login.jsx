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


// COMPONENTE PRINCIPAL: contiene los formularios de inicio de sesión y registro.
export default function Login() {

  // Obtiene la función para redirigir al usuario a otra página.
  const navigate = useNavigate();

  // Obtiene la dirección actual para determinar qué formulario mostrar inicialmente.
  const { pathname } = useLocation();

  // VISTA: indica si se debe mostrar el formulario de inicio de sesión o el de registro.
  // Si la URL es /registro, comienza mostrando el registro. En caso contrario, muestra el login.
  const [vista, setVista] = useState(
    pathname === "/registro" ? "registro" : "login"
  );

  // ERROR: almacena los mensajes de validación o los errores devueltos por Firebase.
  const [error, setError] = useState("");

  // CARGANDO: indica si se está realizando una operación de autenticación.
  // Se utiliza para deshabilitar el botón y mostrar un indicador de carga.
  const [cargando, setCargando] = useState(false);

  // MOSTRAR PASSWORD: controla si la contraseña del formulario debe mostrarse
  // como texto normal o permanecer oculta.
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // MOSTRAR CONFIRM PASSWORD: controla la visibilidad del campo de confirmación
  // de contraseña durante el registro.
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  // FUNCIÓN DE INICIO DE SESIÓN:
  // obtiene los datos del formulario, los valida y consulta Firebase Authentication.
  const entrar = async (e) => {

    // Evita que el formulario se envíe de la manera tradicional y recargue la página.
    e.preventDefault();

    // Limpia cualquier mensaje de error anterior.
    setError("");

    // FormData permite obtener los valores de los campos del formulario mediante su atributo name.
    const formData = new FormData(e.currentTarget);

    // Recupera el correo y elimina los espacios al principio y al final.
    const email = formData.get("loginEmail")?.trim();

    // Recupera la contraseña ingresada.
    const password = formData.get("loginPassword");

    // Comprueba que ambos campos tengan contenido.
    if (!email || !password) {
      setError("Completá todos los campos.");
      return;
    }

    // Activa el estado de carga antes de comunicarse con Firebase.
    setCargando(true);

    try {
      // Comprueba las credenciales mediante Firebase Authentication.
      await signInWithEmailAndPassword(auth, email, password);

      // Si el inicio de sesión es correcto, redirige al usuario a la página principal.
      navigate("/");

    } catch (err) {

      // Si ocurre un error, lo convierte en un mensaje comprensible.
      setError(traducirErrorFirebase(err.code));

    } finally {

      // Desactiva el estado de carga tanto si la operación fue exitosa como si falló.
      setCargando(false);
    }
  };

  // FUNCIÓN DE REGISTRO:
  // obtiene los datos del formulario, realiza las validaciones y crea una cuenta en Firebase.
  const registrarse = async (e) => {

    // Evita el envío tradicional del formulario.
    e.preventDefault();

    // Limpia los errores anteriores.
    setError("");

    // Recupera los valores de los diferentes campos mediante FormData.
    const formData = new FormData(e.currentTarget);

    // Obtiene el nombre y el correo electrónico y elimina los espacios sobrantes.
    const nombre = formData.get("regNombre")?.trim();
    const email = formData.get("regEmail")?.trim();

    // Recupera las dos contraseñas para comprobar que coincidan.
    const password = formData.get("regPassword");
    const confirmPassword = formData.get("regConfirmPassword");

    // Comprueba si el usuario aceptó los términos y condiciones.
    const aceptaTerminos = formData.get("regTerminos");

    // Verifica que los campos obligatorios tengan contenido.
    if (!email || !password || !confirmPassword || !nombre) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    // Comprueba que la contraseña y su confirmación sean iguales.
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Impide continuar si el usuario no aceptó los términos.
    if (!aceptaTerminos) {
      setError("Debés aceptar los términos y condiciones.");
      return;
    }

    // Activa el indicador de carga mientras se crea la cuenta.
    setCargando(true);

    try {

      // Crea una cuenta nueva utilizando el correo y la contraseña.
      // Firebase devuelve las credenciales del usuario creado.
      const credenciales = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Actualiza el perfil del usuario para guardar su nombre como displayName.
      await updateProfile(credenciales.user, {
        displayName: nombre,
      });

      // Redirige a la página principal cuando termina el registro.
      navigate("/");

    } catch (err) {

      // Traduce los posibles errores de Firebase.
      setError(traducirErrorFirebase(err.code));

    } finally {

      // Finaliza el estado de carga, independientemente del resultado.
      setCargando(false);
    }
  };

  // FUNCIÓN PARA CAMBIAR DE FORMULARIO:
  // permite pasar del login al registro y viceversa.
  const cambiarVista = (nuevaVista) => {

    // Limpia los mensajes de error al cambiar de formulario.
    setError("");

    // Oculta los campos de contraseña al cambiar de vista.
    setMostrarPassword(false);
    setMostrarConfirmPassword(false);

    // Actualiza la vista que debe mostrarse.
    setVista(nuevaVista);
  };
  
}