// Índice: Datos del perfil.
// ----------------- Datos del perfil -----------------
// Recibe el perfil y el correo de la cuenta. Presenta los datos personales que se muestran en la página de perfil.

// DATOS PERFIL: vista de solo lectura de la sección "Datos personales".
// PARA QUÉ SE USA: mostrar la información guardada cuando el formulario de edición está cerrado.
// QUÉ MUESTRA: una fila por dato (usuario, nombre, apellido, correo, país, ubicación,
// fecha de nacimiento, sitio web, notificaciones y biografía).
// Recibe: perfil (documento usuarios/{uid}) y email (texto).
export default function PerfilDatos({ perfil, email }) {
  const filas = [
    ["Nombre de usuario", perfil.nombreUsuario],
    ["Nombre", perfil.nombre],
    ["Apellido", perfil.apellido],
    ["Correo electrónico", email],
    ["País", perfil.pais],
    ["Ubicación", perfil.ubicacion],
    ["Fecha de nacimiento", perfil.fechaNacimiento],
    ["Sitio web", perfil.sitioWeb],
    ["Notificaciones por email", perfil.notificaciones === false ? "Desactivadas" : "Activadas"],
    ["Biografía", perfil.biografia],
  ];

  return (
    <div className="perfil-datos">
      {filas.map(([etiqueta, valor]) => (
        <div key={etiqueta}>
          <small>{etiqueta}</small>
          <strong>{valor || "Sin especificar"}</strong>
        </div>
      ))}
    </div>
  );
}
