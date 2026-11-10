import { useState } from "react";

import ImagenAcceso from "./ImagenAcceso";

// CAMPO PASSWORD: campo de contraseña con botón para mostrarla u ocultarla (ojo de Ender).
// PARA QUÉ SE USA: FormularioLogin (1 campo) y FormularioRegistro (2 campos: contraseña y repetir).
// QUÉ MUESTRA: etiqueta, ícono de candado, input y botón de visibilidad. Recuerda por sí solo
// si la contraseña está visible. Se pone dentro de un <div> del formulario.
// Recibe: id, name, etiqueta, placeholder, autoComplete, minLength (opcional),
// icono (clase bootstrap-icons, opcional).
function CampoPassword({
  id,
  name,
  etiqueta,
  placeholder,
  autoComplete,
  minLength,
  icono = "bi-lock",
}) {
  // VISIBLE: true cuando la contraseña se ve como texto normal.
  const [visible, setVisible] = useState(false);

  return (
    <>
      <label className="form-label fw-bold" htmlFor={id}>
        {etiqueta}
      </label>

      <div className="input-group">
        <span className="input-group-text">
          <i className={`bi ${icono}`} />
        </span>

        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          className="form-control"
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />

        {/* BOTÓN DE VISIBILIDAD: alterna entre mostrar y ocultar. */}
        <button
          className="btn btn-outline-secondary btn-password"
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setVisible(!visible)}
        >
          <ImagenAcceso
            nombre={visible ? "ender_eye.png" : "ender_pearl.png"}
            className="img-password"
          />
        </button>
      </div>
    </>
  );
}

export default CampoPassword;