// PERMISOS ADMIN (utils/permisos.js): único lugar donde se decide quién es superadmin
// y quién puede administrar cada sección del sitio.
// PARA QUÉ SE USA: botones de "Modo administrador", rutas protegidas y paneles admin.
// REGLA: nunca comparar perfil.rol a mano en otros archivos; usar estas funciones.
//
// ÍNDICE
// - Secciones: ids que se pueden asignar a una cuenta administradora.
// - Superadmin y permisos: comprobaciones centralizadas que devuelven true o false.

// ----------------- Secciones administrables -----------------
// SECCIONES ADMIN: lista de secciones que se pueden asignar a un administrador.
// Cada elemento tiene id (el valor que se guarda en perfil.permisos) y nombre (el texto visible).
export const SECCIONES_ADMIN = [
  { id: "inicio", nombre: "Inicio" },
  { id: "historia", nombre: "Historia" },
  { id: "versiones", nombre: "Versiones" },
  { id: "comunidad", nombre: "Comunidad" },
  { id: "musica", nombre: "Música" },
  { id: "tienda", nombre: "Tienda" },
];

// ----------------- Comprobaciones de acceso -----------------
// ES SUPERADMIN: devuelve true si la cuenta es superadmin y no está suspendida.
// PARA QUÉ SE USA: proteger la página /admin/usuarios y la creación de administradores.
// Recibe: perfil (el documento usuarios/{uid}).
export function esSuperAdmin(perfil) {
  if (!perfil) return false;
  return perfil.rol === "superadmin" && perfil.estado !== "suspendido";
}

// TIENE PERMISO: devuelve true si la cuenta puede administrar una sección.
// - Sin perfil o con cuenta suspendida: false.
// - Superadmin: true siempre.
// - Si el rol no es "admin": false.
// - Admin sin sección (seccion = null): true si tiene al menos un permiso.
// - Admin con sección: true si su lista permisos incluye esa sección.
// Un usuario viejo puede no tener el campo permisos: se trata como lista vacía.
// Recibe: perfil y, opcionalmente, el id de la sección (ej: "comunidad").
export function tienePermiso(perfil, seccion = null) {
  if (!perfil) return false;
  if (perfil.estado === "suspendido") return false;
  if (esSuperAdmin(perfil)) return true;
  if (perfil.rol !== "admin") return false;

  const permisos = Array.isArray(perfil.permisos) ? perfil.permisos : [];

  if (seccion === null) return permisos.length > 0;
  return permisos.includes(seccion);
}
