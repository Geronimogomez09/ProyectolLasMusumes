// SERVICIO ACCESO (services/acceso.js): funciones de apoyo para el login y el registro.
// PARA QUÉ SE USA: FormularioLogin y FormularioRegistro (components/login/).
// QUÉ CONTIENE: traducirErrorFirebase (mensajes para el usuario) y guardarPerfilRegistro
// (escribe usuarios/{uid} al registrarse, solo con campos del contrato).

import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "./firebase";

// TRADUCIR ERROR FIREBASE: convierte el código de error de Firebase en un mensaje
// comprensible. Recibe: code (ej: "auth/email-already-in-use"). Devuelve: texto.
export function traducirErrorFirebase(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese email ya está registrado.";

    case "auth/invalid-email":
      return "El email no es válido.";

    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";

    // Problemas con las credenciales ingresadas.
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email o contraseña incorrectos.";

    case "auth/too-many-requests":
      return "Demasiados intentos. Probá de nuevo en unos minutos.";

    case "auth/network-request-failed":
      return "No hay conexión. Revisá tu internet e intentá de nuevo.";

    default:
      return "Ocurrió un error. Intentá nuevamente.";
  }
}

// GUARDAR PERFIL REGISTRO: escribe usuarios/{uid} después de crear la cuenta en Firebase Auth.
// Usa setDoc con merge, así funciona aunque AuthContext ya haya creado un perfil básico.
// Los campos son SOLO los del contrato de usuarios. El rol siempre es "usuario",
// permisos siempre es [] y estado siempre es "activo": el registro público nunca crea admins.
// Recibe: usuario (el de Firebase Auth) y datos ({ nombreUsuario, nombre, pais, notificaciones }).
export async function guardarPerfilRegistro(usuario, datos) {
  const referencia = doc(db, "usuarios", usuario.uid);

  // Campos que se escriben siempre.
  const perfil = {
    uid: usuario.uid,
    email: usuario.email,
    nombreUsuario: datos.nombreUsuario,
    nombre: datos.nombre,
    pais: datos.pais,
    notificaciones: datos.notificaciones,
    rol: "usuario",
    permisos: [],
    estado: "activo",
    fechaActualizacion: serverTimestamp(),
  };

  try {
    // Caso 1: el perfil todavía no existe (se crea completo, con fechaRegistro).
    await setDoc(
      referencia,
      { ...perfil, fechaRegistro: serverTimestamp() },
      { merge: true }
    );
  } catch (error) {
    if (error.code !== "permission-denied") throw error;

    // Caso 2: AuthContext ya creó el perfil. Las reglas no dejan cambiar fechaRegistro
    // en una actualización, así que se reintenta sin ese campo.
    await setDoc(referencia, perfil, { merge: true });
  }
}