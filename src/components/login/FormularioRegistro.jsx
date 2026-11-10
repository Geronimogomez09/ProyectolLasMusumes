import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth } from "../../services/firebase";
import {
  guardarPerfilRegistro,
  traducirErrorFirebase,
} from "../../services/acceso";
import CampoPassword from "./CampoPassword";

// PAISES: opciones del selector de país del registro.
const PAISES = ["Argentina", "Chile", "Colombia", "España", "México", "Uruguay", "Otro"];

// FORMULARIO REGISTRO: formulario para crear una cuenta nueva.
// PARA QUÉ SE USA: login.jsx lo muestra cuando la vista es "registro" (ruta /registro).
// QUÉ MUESTRA: nombre de usuario (3 a 24), nombre, correo, contraseña y repetirla, país,
// términos, notificaciones por email, mensaje de error y botón "Registrarse".
// IMPORTANTE: no pide rol. El registro público siempre crea rol "usuario" y permisos [].
// Al terminar, login.jsx redirige al inicio (porque ya hay usuario).
// Recibe: onCambiarVista (función que recibe "login" para cambiar de formulario).
function FormularioRegistro({ onCambiarVista }) {
  // ERROR: mensaje de validación o error de Firebase.
  const [error, setError] = useState("");

  // CARGANDO: true mientras se crea la cuenta (deshabilita el botón).
  const [cargando, setCargando] = useState(false);

  // REGISTRARSE: valida los campos, crea la cuenta en Firebase Auth y guarda usuarios/{uid}.
  async function registrarse(evento) {
    evento.preventDefault();
    setError("");

    const formData = new FormData(evento.currentTarget);

    const nombreUsuario = formData.get("regUsername")?.trim();
    const nombre = formData.get("regNombre")?.trim();
    const email = formData.get("regEmail")?.trim();
    const password = formData.get("regPassword");
    const confirmPassword = formData.get("regConfirmPassword");
    const pais = formData.get("regPais") || "";

    // Un checkbox marcado llega como "on"; si no está marcado, no llega.
    const aceptaTerminos = formData.get("regTerminos") === "on";
    const notificaciones = formData.get("regNotificaciones") === "on";

    if (!nombreUsuario || !nombre || !email || !password || !confirmPassword) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    // Las reglas de Firestore exigen un nombre de usuario de 3 a 24 caracteres.
    if (nombreUsuario.length < 3 || nombreUsuario.length > 24) {
      setError("El nombre de usuario debe tener entre 3 y 24 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!aceptaTerminos) {
      setError("Debés aceptar los términos y condiciones.");
      return;
    }

    setCargando(true);

    try {
      // 1. Crea la cuenta en Firebase Authentication.
      const credenciales = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Guarda el nombre de usuario como displayName de la cuenta.
      await updateProfile(credenciales.user, { displayName: nombreUsuario });

      // 3. Escribe el perfil usuarios/{uid}. Si falla, la cuenta ya existe y AuthContext
      //    creó un perfil básico: se registra el error y el usuario puede completar sus datos en Perfil.
      try {
        await guardarPerfilRegistro(credenciales.user, {
          nombreUsuario,
          nombre,
          pais,
          notificaciones,
        });
      } catch (errorPerfil) {
        console.error("No se pudo guardar el perfil del registro:", errorPerfil);
      }
    } catch (err) {
      setError(traducirErrorFirebase(err.code));
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={registrarse} className="acceso-form">

      {/* MENSAJE DE ERROR: solo aparece si hay un error. */}
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      {/* USUARIO Y NOMBRE: nombre público (3 a 24) y nombre real. */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label fw-bold" htmlFor="regUsername">
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
              autoComplete="username"
              minLength={3}
              maxLength={24}
              required
            />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold" htmlFor="regNombre">
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

      {/* CORREO: email con el que se inicia sesión. */}
      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="regEmail">
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

      {/* CONTRASEÑAS: contraseña nueva y su confirmación. */}
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <CampoPassword
            id="regPassword"
            name="regPassword"
            etiqueta="Contraseña *"
            placeholder="Mínimo 6 caracteres"
            autoComplete="new-password"
            minLength={6}
          />
        </div>

        <div className="col-md-6">
          <CampoPassword
            id="regConfirmPassword"
            name="regConfirmPassword"
            etiqueta="Repetir contraseña *"
            placeholder="Confirmá tu contraseña"
            autoComplete="new-password"
            icono="bi-lock-fill"
          />
        </div>
      </div>

      {/* PAÍS Y TÉRMINOS: selector de país y aceptación de condiciones. */}
      <div className="row g-3 mb-3 align-items-center">
        <div className="col-md-6">
          <label className="form-label fw-bold" htmlFor="regPais">
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

              {PAISES.map((pais) => (
                <option key={pais} value={pais}>
                  {pais}
                </option>
              ))}
            </select>
          </div>
        </div>

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

            <label className="form-check-label" htmlFor="regTerminos">
              Acepto los términos y condiciones
            </label>
          </div>
        </div>
      </div>

      {/* NOTIFICACIONES: permite recibir novedades por email. */}
      <div className="row g-3 mb-4 align-items-center">
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

            <label className="form-check-label" htmlFor="regNotificaciones">
              Sí, quiero recibir novedades
            </label>
          </div>
        </div>
      </div>

      {/* ACCIONES: botón Registrarse y acceso al login. */}
      <div className="acceso-acciones">
        <button
          type="submit"
          className="btn btn-primary acceso-btn-submit"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Creando cuenta...
            </>
          ) : (
            <>
              <i className="bi bi-person-plus me-2" />
              Registrarse
            </>
          )}
        </button>

        <div className="acceso-cambio-vista">
          <span>¿Ya tenés una cuenta?</span>

          <button
            type="button"
            className="btn btn-outline-secondary acceso-btn-cambio"
            onClick={() => onCambiarVista("login")}
          >
            Iniciar sesión
            <i className="bi bi-arrow-right ms-1" />
          </button>
        </div>
      </div>
    </form>
  );
}

export default FormularioRegistro;