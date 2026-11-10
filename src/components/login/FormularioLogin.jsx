import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "../../services/firebase";
import { traducirErrorFirebase } from "../../services/acceso";
import CampoPassword from "./CampoPassword";

// FORMULARIO LOGIN: formulario para iniciar sesión con email y contraseña.
// PARA QUÉ SE USA: login.jsx lo muestra cuando la vista es "login" (ruta /login).
// QUÉ MUESTRA: campos de correo y contraseña, mensaje de error, botón "Entrar" y botón
// para pasar al registro. Al entrar bien, login.jsx redirige al inicio (porque ya hay usuario).
// Recibe: onCambiarVista (función que recibe "registro" para cambiar de formulario).
function FormularioLogin({ onCambiarVista }) {
  // ERROR: mensaje de validación o error de Firebase.
  const [error, setError] = useState("");

  // CARGANDO: true mientras se consulta a Firebase (deshabilita el botón).
  const [cargando, setCargando] = useState(false);

  // ENTRAR: lee los campos, valida y consulta Firebase Authentication.
  async function entrar(evento) {
    evento.preventDefault();
    setError("");

    const formData = new FormData(evento.currentTarget);
    const email = formData.get("loginEmail")?.trim();
    const password = formData.get("loginPassword");

    if (!email || !password) {
      setError("Completá todos los campos.");
      return;
    }

    setCargando(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(traducirErrorFirebase(err.code));
    } finally {
      setCargando(false);
    }
  }

  return (
    <form onSubmit={entrar} className="acceso-form">

      {/* MENSAJE DE ERROR: solo aparece si hay un error. */}
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      {/* CAMPO CORREO: email con el que se registró la cuenta. */}
      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="loginEmail">
          Correo electrónico *
        </label>

        <div className="input-group">
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

      {/* CAMPO CONTRASEÑA: con botón para mostrarla. */}
      <div className="mb-4">
        <CampoPassword
          id="loginPassword"
          name="loginPassword"
          etiqueta="Contraseña *"
          placeholder="Ingresá tu contraseña"
          autoComplete="current-password"
        />
      </div>

      {/* ACCIONES: botón Entrar y acceso al registro. */}
      <div className="acceso-acciones">
        <button
          type="submit"
          className="btn btn-primary acceso-btn-submit"
          disabled={cargando}
        >
          {cargando ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              Ingresando...
            </>
          ) : (
            <>
              <i className="bi bi-box-arrow-in-right me-2" />
              Entrar
            </>
          )}
        </button>

        <div className="acceso-cambio-vista">
          <span>¿No tenés una cuenta?</span>

          <button
            type="button"
            className="btn btn-outline-secondary acceso-btn-cambio"
            onClick={() => onCambiarVista("registro")}
          >
            Registrarse
          </button>
        </div>
      </div>
    </form>
  );
}

export default FormularioLogin;