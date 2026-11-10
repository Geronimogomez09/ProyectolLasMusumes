import { useState } from "react";
import PerfilAvatar from "./PerfilAvatar";

// Índice: Formulario para editar el perfil.
// ----------------- Formulario para editar el perfil -----------------
// Recibe los datos de perfil y las acciones para guardar o cancelar. Permite modificar la información personal y entrega los cambios al componente padre.

// PAISES: opciones del selector de país (las mismas que el registro).
const PAISES = ["Argentina", "Chile", "Colombia", "España", "México", "Uruguay", "Otro"];

// FORMULARIO PERFIL: formulario para editar los datos personales.
// PARA QUÉ SE USA: sección "Datos personales" en modo edición.
// QUÉ MUESTRA: foto con vista previa, usuario, nombre, apellido, biografía, ubicación,
// fecha de nacimiento, país, sitio web, notificaciones y el correo (no editable).
// Solo entrega campos permitidos por las reglas de Firestore; nunca rol, permisos ni estado.
// Recibe: perfil, email, nombreMostrar, guardando (true mientras se guarda),
// onGuardar(datos) y onCancelar().
export default function PerfilFormulario({
  perfil,
  email,
  nombreMostrar,
  guardando,
  onGuardar,
  onCancelar,
}) {
  // FORMULARIO: copia editable de los datos actuales del perfil.
  const [formulario, setFormulario] = useState({
    nombreUsuario: perfil.nombreUsuario || "",
    nombre: perfil.nombre || "",
    apellido: perfil.apellido || "",
    biografia: perfil.biografia || "",
    ubicacion: perfil.ubicacion || "",
    sitioWeb: perfil.sitioWeb || "",
    fechaNacimiento: perfil.fechaNacimiento || "",
    fotoPerfil: perfil.fotoPerfil || "",
    pais: perfil.pais || "",
    notificaciones: perfil.notificaciones !== false,
  });

  // ERROR: mensaje de validación que se muestra arriba de los botones.
  const [error, setError] = useState("");

  // CAMBIAR CAMPO: actualiza el campo que el usuario está escribiendo.
  // Los checkbox guardan true/false; el resto guarda texto.
  function cambiarCampo(evento) {
    const { name, value, type, checked } = evento.target;
    setFormulario((actual) => ({
      ...actual,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // ENVIAR: valida los datos y los entrega a la página con onGuardar.
  function enviar(evento) {
    evento.preventDefault();
    setError("");

    const nombreUsuario = formulario.nombreUsuario.trim();
    const foto = formulario.fotoPerfil.trim();

    if (nombreUsuario.length < 3 || nombreUsuario.length > 24) {
      setError("El nombre de usuario tiene que tener entre 3 y 24 caracteres.");
      return;
    }

    if (foto && !/^https?:\/\//i.test(foto)) {
      setError("El enlace de la foto tiene que empezar con http:// o https://");
      return;
    }

    onGuardar({
      nombreUsuario,
      nombre: formulario.nombre.trim(),
      apellido: formulario.apellido.trim(),
      biografia: formulario.biografia.trim(),
      ubicacion: formulario.ubicacion.trim(),
      sitioWeb: formulario.sitioWeb.trim(),
      fechaNacimiento: formulario.fechaNacimiento,
      fotoPerfil: foto,
      pais: formulario.pais,
      notificaciones: Boolean(formulario.notificaciones),
    });
  }

  return (
    <form className="perfil-form" onSubmit={enviar}>
      {/* FOTO DE PERFIL: vista previa y campo para pegar el enlace de la imagen. */}
      <div className="perfil-form-foto">
        <PerfilAvatar foto={formulario.fotoPerfil.trim()} nombre={nombreMostrar} />

        <label>
          Foto de perfil (enlace)
          <input
            name="fotoPerfil"
            value={formulario.fotoPerfil}
            onChange={cambiarCampo}
            placeholder="https://..."
          />
          <small>Pegá el enlace de una imagen. Si lo dejás vacío se muestran tus iniciales.</small>
        </label>
      </div>

      <label>
        Nombre de usuario *
        <input
          name="nombreUsuario"
          value={formulario.nombreUsuario}
          onChange={cambiarCampo}
          required
          minLength={3}
          maxLength={24}
        />
      </label>

      <div className="perfil-form-fila">
        <label>
          Nombre
          <input name="nombre" value={formulario.nombre} onChange={cambiarCampo} maxLength={50} />
        </label>
        <label>
          Apellido
          <input name="apellido" value={formulario.apellido} onChange={cambiarCampo} maxLength={50} />
        </label>
      </div>

      <label>
        Biografía
        <textarea
          name="biografia"
          value={formulario.biografia}
          onChange={cambiarCampo}
          rows={4}
          maxLength={300}
          placeholder="Contá algo sobre vos..."
        />
        <small>{formulario.biografia.length}/300</small>
      </label>

      <div className="perfil-form-fila">
        <label>
          Ubicación
          <input
            name="ubicacion"
            value={formulario.ubicacion}
            onChange={cambiarCampo}
            maxLength={80}
            placeholder="Ciudad, provincia"
          />
        </label>
        <label>
          País
          <select name="pais" value={formulario.pais} onChange={cambiarCampo}>
            <option value="">Seleccioná un país</option>
            {PAISES.map((pais) => (
              <option key={pais} value={pais}>{pais}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="perfil-form-fila">
        <label>
          Fecha de nacimiento
          <input
            type="date"
            name="fechaNacimiento"
            value={formulario.fechaNacimiento}
            onChange={cambiarCampo}
          />
        </label>
        <label>
          Sitio web
          <input
            type="url"
            name="sitioWeb"
            value={formulario.sitioWeb}
            onChange={cambiarCampo}
            placeholder="https://..."
          />
        </label>
      </div>

      {/* NOTIFICACIONES: casilla para recibir novedades por email. */}
      <label className="perfil-check">
        <input
          type="checkbox"
          name="notificaciones"
          checked={formulario.notificaciones}
          onChange={cambiarCampo}
        />
        Quiero recibir novedades por email
      </label>

      {/* CORREO: se muestra pero no se puede cambiar desde acá. */}
      <label>
        Correo electrónico
        <input value={email || ""} disabled />
        <small>El correo no se puede cambiar desde acá.</small>
      </label>

      {error && (
        <div className="perfil-alerta perfil-alerta--error" role="alert">{error}</div>
      )}

      <div className="perfil-acciones">
        <button type="button" className="perfil-btn perfil-btn--suave" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="perfil-btn" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
