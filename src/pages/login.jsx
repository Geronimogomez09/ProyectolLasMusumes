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
        <ImagenAcceso nombre="wildflowers.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-dos">
        <ImagenAcceso nombre="BeePixel.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-tres">
        <ImagenAcceso nombre="MoobloomPixel.png" className="acceso-recurso-imagen" />
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
        <ImagenAcceso nombre="BeePixel.png" className="acceso-animal-img" />
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
  
    // RENDERIZADO: define la estructura visual de la página.
  return (
    <div className="acceso-page">

      {/* Muestra los elementos decorativos del fondo. */}
      <DecoracionAcceso />

      {/* CONTENEDOR: centra la tarjeta en la pantalla y permite adaptarla a distintos tamaños. */}
      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5 acceso-contenedor">

        {/* TARJETA: divide el contenido en dos columnas, una informativa y otra para el formulario. */}
        <div className="row border rounded p-4 w-100 acceso-card g-0">

          {/* PANEL IZQUIERDO: presenta información y una descripción del proyecto. */}
          <div className="col-md-4 border-end d-flex flex-column justify-content-center p-4 acceso-panel-izq">

            {/* Etiqueta decorativa que identifica el propósito de la sección. */}
            <span className="acceso-panel-etiqueta">
              <i className="bi bi-flower1" />
              UN MUNDO POR DESCUBRIR
            </span>

            {/* El título y la descripción cambian según el formulario seleccionado. */}
            <h2 className="fw-bold">
              {vista === "login"
                ? "¡Qué bueno verte!"
                : "Creá tu aventura"}
            </h2>

            <p>
              {vista === "login"
                ? "Ingresá a tu cuenta y seguí explorando todo lo que la comunidad tiene para compartir."
                : "Unite a Wiki-Craft, compartí tus ideas y empezá a formar parte de nuestra comunidad."}
            </p>

            {/* PUNTOS DESTACADOS: muestra algunas de las actividades que ofrece el sitio. */}
            <div className="acceso-panel-puntos" aria-hidden="true">
              <span>
                <i className="bi bi-compass" /> Explorar
              </span>

              <span>
                <i className="bi bi-tree" /> Crear
              </span>

              <span>
                <i className="bi bi-stars" /> Compartir
              </span>
            </div>
          </div>

          {/* PANEL DERECHO: contiene el encabezado, los mensajes de error y los formularios. */}
          <div className="col-md-8 p-4 acceso-panel-form">

            {/* ENCABEZADO: muestra la marca del sitio y un mensaje de bienvenida. */}
            <div className="acceso-form-cabecera">
              <span className="acceso-form-etiqueta">
                <i className="bi bi-flower2" />
                WIKI-CRAFT
              </span>

              <span className="acceso-form-nota">
                <i className="bi bi-sun" />
                Tu próxima aventura empieza acá
              </span>
            </div>

            {/* MENSAJE DE ERROR: aparece únicamente cuando existe un error registrado. */}
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}

            {/* FORMULARIO DE LOGIN:
                se muestra solamente cuando la variable vista tiene el valor "login". */}
            {vista === "login" && (
              <form
                onSubmit={entrar}
                key="login"
                className="acceso-form"
              >

                {/* CAMPO DE CORREO: solicita el email utilizado para registrar la cuenta. */}
                <div className="mb-3">
                  <label
                    className="form-label fw-bold"
                    htmlFor="loginEmail"
                  >
                    Correo electrónico *
                  </label>

                  <div className="input-group">

                    {/* Ícono que identifica el campo de correo. */}
                    <span className="input-group-text">
                      <i className="bi bi-envelope" />
                    </span>

                    <input
                      id="loginEmail"
                      type="email"
                      name="loginEmail"
                      className="form-control"
                      placeholder="Ingresá tu correo electrónico"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* CAMPO DE CONTRASEÑA: solicita la contraseña de la cuenta. */}
                <div className="mb-4">
                  <label
                    className="form-label fw-bold"
                    htmlFor="loginPassword"
                  >
                    Contraseña *
                  </label>

                  <div className="input-group">

                    {/* Ícono del campo de contraseña. */}
                    <span className="input-group-text">
                      <i className="bi bi-lock" />
                    </span>

                    <input
                      id="loginPassword"

                      // Cambia el tipo de input dependiendo de la visibilidad seleccionada.
                      type={mostrarPassword ? "text" : "password"}

                      name="loginPassword"
                      className="form-control"
                      placeholder="Ingresá tu contraseña"
                      autoComplete="current-password"
                      required
                    />

                    {/* BOTÓN DE VISIBILIDAD: alterna entre mostrar y ocultar la contraseña. */}
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      aria-label={
                        mostrarPassword
                          ? "Ocultar contraseña"
                          : "Mostrar contraseña"
                      }
                      onClick={() =>
                        setMostrarPassword(!mostrarPassword)
                      }
                    >
                      <i
                        className={`bi ${
                          mostrarPassword ? "bi-eye" : "bi-eye-slash"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* ACCIONES: contiene el botón para ingresar y el acceso al registro. */}
                <div className="acceso-acciones">

                  {/* BOTÓN PRINCIPAL: envía los datos del formulario para iniciar sesión. */}
                  <button
                    type="submit"
                    className="btn btn-primary acceso-btn-submit"
                    disabled={cargando}
                  >

                    {/* El contenido del botón cambia mientras se procesa la solicitud. */}
                    {cargando ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2" />
                        Entrar
                      </>
                    )}
                  </button>

                  {/* CAMBIO DE VISTA: ofrece un acceso al formulario de registro. */}
                  <div className="acceso-cambio-vista">
                    <span>¿No tenés una cuenta?</span>

                    <button
                      type="button"
                      className="btn btn-outline-secondary acceso-btn-cambio"
                      onClick={() => cambiarVista("registro")}
                    >
                      Registrarse
                      <i className="bi bi-arrow-right ms-1" />
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* FORMULARIO DE REGISTRO:
                se muestra únicamente cuando la variable vista tiene el valor "registro". */}
            {vista === "registro" && (
              <form
                onSubmit={registrarse}
                key="registro"
                className="acceso-form"
              >

                {/* DATOS PERSONALES: agrupa los campos de usuario y nombre. */}
                <div className="row g-3 mb-3">

                  {/* CAMPO DE NOMBRE DE USUARIO. */}
                  <div className="col-md-6">
                    <label
                      className="form-label fw-bold"
                      htmlFor="regUsername"
                    >
                      Nombre de usuario *
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person-badge" />
                      </span>

                      <input
                        id="regUsername"
                        type="text"
                        name="regUsername"
                        className="form-control"
                        placeholder="Elegí un usuario"
                      />
                    </div>
                  </div>

                  {/* CAMPO DE NOMBRE: solicita el nombre que se guardará en el perfil de Firebase. */}
                  <div className="col-md-6">
                    <label
                      className="form-label fw-bold"
                      htmlFor="regNombre"
                    >
                      Nombre *
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-person" />
                      </span>

                      <input
                        id="regNombre"
                        type="text"
                        name="regNombre"
                        className="form-control"
                        placeholder="Ingresá tu nombre"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* CORREO ELECTRÓNICO: solicita el email que se utilizará para autenticar la cuenta. */}
                <div className="mb-3">
                  <label
                    className="form-label fw-bold"
                    htmlFor="regEmail"
                  >
                    Correo electrónico *
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope" />
                    </span>

                    <input
                      id="regEmail"
                      type="email"
                      name="regEmail"
                      className="form-control"
                      placeholder="Ingresá tu correo electrónico"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* CONTRASEÑAS: agrupa la contraseña nueva y su confirmación. */}
                <div className="row g-3 mb-3">

                  {/* CAMPO DE CONTRASEÑA: permite establecer la contraseña de la cuenta. */}
                  <div className="col-md-6">
                    <label
                      className="form-label fw-bold"
                      htmlFor="regPassword"
                    >
                      Contraseña *
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock" />
                      </span>

                      <input
                        id="regPassword"
                        type={mostrarPassword ? "text" : "password"}
                        name="regPassword"
                        className="form-control"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        autoComplete="new-password"
                        required
                      />

                      {/* Permite alternar la visibilidad de la contraseña. */}
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        aria-label={
                          mostrarPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        onClick={() =>
                          setMostrarPassword(!mostrarPassword)
                        }
                      >
                        <i
                          className={`bi ${
                            mostrarPassword ? "bi-eye" : "bi-eye-slash"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* CAMPO DE CONFIRMACIÓN: solicita repetir la contraseña anterior. */}
                  <div className="col-md-6">
                    <label
                      className="form-label fw-bold"
                      htmlFor="regConfirmPassword"
                    >
                      Repetir contraseña *
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock-fill" />
                      </span>

                      <input
                        id="regConfirmPassword"
                        type={
                          mostrarConfirmPassword ? "text" : "password"
                        }
                        name="regConfirmPassword"
                        className="form-control"
                        placeholder="Confirmá tu contraseña"
                        autoComplete="new-password"
                        required
                      />

                      {/* Permite mostrar u ocultar el campo de confirmación. */}
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        aria-label={
                          mostrarConfirmPassword
                            ? "Ocultar confirmación"
                            : "Mostrar confirmación"
                        }
                        onClick={() =>
                          setMostrarConfirmPassword(
                            !mostrarConfirmPassword
                          )
                        }
                      >
                        <i
                          className={`bi ${
                            mostrarConfirmPassword
                              ? "bi-eye"
                              : "bi-eye-slash"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* PAÍS Y TÉRMINOS: permite seleccionar un país y aceptar las condiciones de uso. */}
                <div className="row g-3 mb-3 align-items-center">

                  {/* SELECTOR DE PAÍS: genera sus opciones utilizando el arreglo PAISES. */}
                  <div className="col-md-6">
                    <label
                      className="form-label fw-bold"
                      htmlFor="regPais"
                    >
                      País
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-globe-americas" />
                      </span>

                      <select
                        id="regPais"
                        name="regPais"
                        className="form-select"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Seleccioná un país
                        </option>

                        {/* Recorre el arreglo y crea una opción por cada país. */}
                        {PAISES.map((pais) => (
                          <option key={pais} value={pais}>
                            {pais}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CASILLA DE TÉRMINOS: permite aceptar las condiciones para completar el registro. */}
                  <div className="col-md-6 acceso-opcion-check">
                    <span className="form-label fw-bold d-block">
                      Términos y condiciones
                    </span>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="regTerminos"
                        name="regTerminos"
                      />

                      <label
                        className="form-check-label"
                        htmlFor="regTerminos"
                      >
                        Acepto los términos y condiciones
                      </label>
                    </div>
                  </div>
                </div>

                {/* ROL Y NOTIFICACIONES: agrupa las opciones adicionales del registro. */}
                <div className="row g-3 mb-4 align-items-center">

                  {/* SELECTOR DE ROL: permite elegir entre usuario y administrador. */}
                  <div className="col-md-6">
                    <label
                      className="form-label fw-bold"
                      htmlFor="regRol"
                    >
                      Rol (solo en modo admin)
                    </label>

                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-gear" />
                      </span>

                      <select
                        id="regRol"
                        name="regRol"
                        className="form-select"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Seleccioná un rol
                        </option>

                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                  </div>

                  {/* NOTIFICACIONES: permite activar o desactivar la recepción de novedades por email. */}
                  <div className="col-md-6 acceso-opcion-check">
                    <span className="form-label fw-bold d-block">
                      Notificaciones por email
                    </span>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="regNotificaciones"
                        name="regNotificaciones"
                        defaultChecked
                      />

                      <label
                        className="form-check-label"
                        htmlFor="regNotificaciones"
                      >
                        Sí, quiero recibir novedades
                      </label>
                    </div>
                  </div>
                </div>

                {/* ACCIONES: contiene el botón de registro y el acceso al inicio de sesión. */}
                <div className="acceso-acciones">

                  {/* BOTÓN PRINCIPAL: envía los datos para crear una cuenta. */}
                  <button
                    type="submit"
                    className="btn btn-primary acceso-btn-submit"
                    disabled={cargando}
                  >

                    {/* Cambia el texto y muestra un indicador mientras se crea la cuenta. */}
                    {cargando ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2" />
                        Registrarse
                      </>
                    )}
                  </button>

                  {/* CAMBIO DE VISTA: permite volver al formulario de inicio de sesión. */}
                  <div className="acceso-cambio-vista">
                    <span>¿Ya tenés una cuenta?</span>

                    <button
                      type="button"
                      className="btn btn-outline-secondary acceso-btn-cambio"
                      onClick={() => cambiarVista("login")}
                    >
                      Iniciar sesión
                      <i className="bi bi-arrow-right ms-1" />
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}