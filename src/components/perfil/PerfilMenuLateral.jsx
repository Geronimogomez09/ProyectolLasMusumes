import PerfilAvatar from "./PerfilAvatar";

// Índice: Menú lateral del perfil.
// ----------------- Menú lateral del perfil -----------------
// Recibe la sección activa y las acciones de navegación. Presenta accesos a las partes del perfil y permite cambiar de sección.

// MENÚ LATERAL PERFIL: panel izquierdo de la tarjeta del perfil.
// PARA QUÉ SE USA: mostrar quién es el usuario y cambiar entre las secciones del perfil.
// QUÉ MUESTRA: avatar, nombre, etiqueta de rol ("Superadmin", "Administrador de ..." o
// "Explorador"), botones de sección y el estado de la cuenta.
// Recibe: foto, nombre, rolTexto (texto de la etiqueta), rolAdmin (true si es admin o superadmin),
// secciones (lista {id, nombre, icono}), seccionActual (id) y onCambiar(id).
export default function PerfilMenuLateral({
  foto,
  nombre,
  rolTexto,
  rolAdmin,
  secciones,
  seccionActual,
  onCambiar,
}) {
  return (
    <aside className="perfil-panel-izq">
      {/* AVATAR GRANDE: foto o iniciales del usuario. */}
      <PerfilAvatar foto={foto} nombre={nombre} className="perfil-avatar--grande" />

      <h1 className="perfil-nombre">{nombre}</h1>

      {/* ETIQUETA DE ROL: cambia de color si la cuenta administra alguna sección. */}
      <span className={`perfil-rol ${rolAdmin ? "perfil-rol--admin" : ""}`}>
        <i className={`bi ${rolAdmin ? "bi-shield-check" : "bi-compass"}`} />
        {rolTexto}
      </span>

      {/* BOTONES DE SECCIÓN: uno por cada apartado del perfil. */}
      <nav className="perfil-nav" aria-label="Secciones del perfil">
        {secciones.map((item) => (
          <button
            key={item.id}
            type="button"
            className={seccionActual === item.id ? "activo" : ""}
            aria-current={seccionActual === item.id ? "page" : undefined}
            onClick={() => onCambiar(item.id)}
          >
            <i className={`bi ${item.icono}`} aria-hidden="true" />
            {item.nombre}
          </button>
        ))}
      </nav>

      <p className="perfil-estado">
        <span className="perfil-punto" /> Cuenta activa
      </p>
    </aside>
  );
}
