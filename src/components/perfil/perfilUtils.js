// Índice: Iniciales del perfil.
// ----------------- Iniciales del perfil -----------------
// Recibe un nombre y devuelve sus iniciales para usarlas en el avatar cuando no se dispone de una foto.

// UTILIDADES PERFIL (components/perfil/perfilUtils.js): funciones chicas que comparten
// los componentes de la página de perfil.
// PARA QUÉ SE USA: sacar las iniciales de un nombre (avatar) y mostrar fechas legibles.

// INICIALES: devuelve las primeras letras de un nombre (máximo 2) para el avatar.
// Recibe: nombre (texto). Si no hay nombre usa "Jugador".
export function iniciales(nombre = "Jugador") {
  return (nombre || "Jugador")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

// FECHA LEGIBLE: convierte una fecha de Firestore (Timestamp) o un texto en "7 de junio de 2022".
// Recibe: valor (Timestamp, Date o texto). Si no hay fecha devuelve "Todavía no disponible".
export function fechaLegible(valor) {
  if (!valor) return "Todavía no disponible";

  const fecha = valor?.toDate ? valor.toDate() : new Date(valor);

  if (Number.isNaN(fecha.getTime())) return "Todavía no disponible";

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}
