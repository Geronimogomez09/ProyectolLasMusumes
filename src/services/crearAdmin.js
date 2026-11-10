// SERVICIO CREAR ADMIN (services/crearAdmin.js): crea cuentas de administrador y las gestiona.
// PARA QUÉ SE USA: la página /admin/usuarios (pages/crearAdmin.jsx) y sus componentes
// de components/admin/. Solo la usa el superadmin.
// QUÉ HACE: crear un admin nuevo, escuchar la lista de admins, cambiar sus permisos
// y suspender o reactivar su cuenta.
// REGLA: este archivo no modifica firebase.js ni firestore.js. Las reglas de Firestore
// son las que realmente impiden que otra persona use estas funciones.

import { deleteApp, getApps, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "./firebase";
import { SECCIONES_ADMIN } from "../utils/permisos";

// CONFIGURACIÓN SECUNDARIA: son los mismos datos VITE_FIREBASE_* que usa firebase.js.
// Se repiten acá porque firebase.js no exporta su configuración y no se puede modificar.
const CONFIG_FIREBASE = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// NOMBRE DE LA APP SECUNDARIA: Firebase permite varias apps si tienen nombres distintos.
const NOMBRE_APP_SECUNDARIA = "secundaria";

// COLECCIÓN DE USUARIOS: donde vive cada perfil usuarios/{uid}.
const COLECCION_USUARIOS = "usuarios";

// IDS DE SECCIONES: lista de ids válidos para el campo permisos (inicio, historia, etc.).
const IDS_SECCIONES = SECCIONES_ADMIN.map((seccion) => seccion.id);

// LIMPIAR PERMISOS: se queda solo con ids de secciones que existen, sin repetidos.
// Recibe: permisos (array). Devuelve: array limpio.
function limpiarPermisos(permisos) {
  const lista = Array.isArray(permisos) ? permisos : [];
  return IDS_SECCIONES.filter((id) => lista.includes(id));
}

// TRADUCIR ERROR CREAR ADMIN: convierte códigos de Firebase en mensajes para el superadmin.
// Recibe: el código del error. Devuelve: el texto a mostrar.
function traducirErrorCrearAdmin(codigo) {
  switch (codigo) {
    case "auth/email-already-in-use":
      return "Ese email ya está registrado.";

    case "auth/invalid-email":
      return "El email no es válido.";

    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";

    case "auth/operation-not-allowed":
      return "El registro con email y contraseña no está habilitado en Firebase.";

    case "auth/network-request-failed":
      return "No hay conexión. Revisá tu internet e intentá de nuevo.";

    case "permission-denied":
      return "Las reglas de Firestore rechazaron la operación. Revisá que tu cuenta sea superadmin.";

    default:
      return "Ocurrió un error. Intentá nuevamente.";
  }
}

// CREAR USUARIO ADMIN: crea una cuenta nueva con rol "admin" y los permisos elegidos.
// PARA QUÉ SE USA: el formulario FormularioCrearAdmin.
// CÓMO FUNCIONA:
//   1) Crea la cuenta en Firebase Auth usando una SEGUNDA app. Así la sesión del superadmin
//      no se cierra (createUserWithEmailAndPassword inicia sesión con la cuenta nueva).
//   2) Guarda usuarios/{uid} con la base de datos principal, que sigue con la sesión del
//      superadmin. Las reglas permiten crear admins solo a un superadmin.
//   3) Si falla el paso 2, borra la cuenta de Auth para no dejar una cuenta sin perfil.
//   4) Siempre cierra la sesión secundaria y borra la app secundaria.
// Recibe: { email, password, nombreUsuario, nombre, permisos }.
// Devuelve: el uid de la cuenta creada. Si algo falla, lanza un Error con mensaje legible.
export async function crearUsuarioAdmin({
  email,
  password,
  nombreUsuario,
  nombre = "",
  permisos,
}) {
  const emailLimpio = String(email || "").trim();
  const nombreUsuarioLimpio = String(nombreUsuario || "").trim();
  const nombreLimpio = String(nombre || "").trim();
  const permisosLimpios = limpiarPermisos(permisos);

  // Validaciones básicas (las reglas de Firestore vuelven a controlar lo importante).
  if (!emailLimpio) throw new Error("Escribí un email.");
  if (!password || String(password).length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }
  if (nombreUsuarioLimpio.length < 3 || nombreUsuarioLimpio.length > 24) {
    throw new Error("El nombre de usuario debe tener entre 3 y 24 caracteres.");
  }
  if (permisosLimpios.length === 0) {
    throw new Error("Elegí al menos una sección para administrar.");
  }

  // Reutiliza la app secundaria si quedó abierta, o crea una nueva.
  const appSecundaria =
    getApps().find((app) => app.name === NOMBRE_APP_SECUNDARIA) ||
    initializeApp(CONFIG_FIREBASE, NOMBRE_APP_SECUNDARIA);

  const authSecundaria = getAuth(appSecundaria);

  let credenciales = null;

  try {
    // PASO 1: crea la cuenta en Auth sin tocar la sesión del superadmin.
    credenciales = await createUserWithEmailAndPassword(
      authSecundaria,
      emailLimpio,
      password
    );

    const uid = credenciales.user.uid;

    await updateProfile(credenciales.user, { displayName: nombreUsuarioLimpio });

    // PASO 2: guarda el perfil con SOLO los campos del contrato de usuarios.
    await setDoc(doc(db, COLECCION_USUARIOS, uid), {
      uid,
      email: emailLimpio,
      nombreUsuario: nombreUsuarioLimpio,
      nombre: nombreLimpio,
      apellido: "",
      fotoPerfil: "",
      biografia: "",
      ubicacion: "",
      sitioWeb: "",
      fechaNacimiento: "",
      pais: "",
      notificaciones: true,
      rol: "admin",
      permisos: permisosLimpios,
      estado: "activo",
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp(),
    });

    return uid;
  } catch (error) {
    // PASO 3: si la cuenta de Auth ya existía, se borra para no dejarla sin perfil de admin.
    if (credenciales?.user) {
      try {
        await deleteUser(credenciales.user);
      } catch (errorBorrado) {
        console.error("No se pudo deshacer la cuenta creada:", errorBorrado);
      }
    }

    console.error("Error al crear el administrador:", error);

    // Los errores de Firebase traen code; los nuestros (new Error) no.
    if (error?.code) {
      throw new Error(traducirErrorCrearAdmin(error.code));
    }

    throw error;
  } finally {
    // PASO 4: limpieza. Se hace siempre, haya salido bien o mal.
    try {
      await signOut(authSecundaria);
    } catch (errorSalida) {
      console.error("No se pudo cerrar la sesión secundaria:", errorSalida);
    }

    try {
      await deleteApp(appSecundaria);
    } catch (errorApp) {
      console.error("No se pudo cerrar la app secundaria:", errorApp);
    }
  }
}

// ESCUCHAR ADMINS: avisa cada vez que cambia la lista de cuentas con rol "admin".
// PARA QUÉ SE USA: ListaAdmins. El superadmin no aparece porque su rol es "superadmin".
// Recibe: callback (recibe un array de perfiles) y alError (opcional).
// Devuelve: la función para dejar de escuchar.
export function escucharAdmins(callback, alError = console.error) {
  const consulta = query(
    collection(db, COLECCION_USUARIOS),
    where("rol", "==", "admin")
  );

  return onSnapshot(
    consulta,
    (resultado) => {
      const admins = resultado.docs
        .map((documento) => ({ ...documento.data(), uid: documento.id }))
        .sort((a, b) =>
          String(a.nombreUsuario || a.email || "").localeCompare(
            String(b.nombreUsuario || b.email || ""),
            "es"
          )
        );

      callback(admins);
    },
    alError
  );
}

// ACTUALIZAR PERMISOS ADMIN: cambia las secciones que puede administrar un admin.
// PARA QUÉ SE USA: el botón "Editar permisos" de ItemAdmin.
// Recibe: uid del admin y permisos (array de ids de SECCIONES_ADMIN).
export async function actualizarPermisosAdmin(uid, permisos) {
  const permisosLimpios = limpiarPermisos(permisos);

  if (permisosLimpios.length === 0) {
    throw new Error("Elegí al menos una sección para administrar.");
  }

  try {
    await updateDoc(doc(db, COLECCION_USUARIOS, String(uid)), {
      permisos: permisosLimpios,
      fechaActualizacion: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al actualizar los permisos:", error);
    throw new Error(traducirErrorCrearAdmin(error?.code));
  }
}

// CAMBIAR SUSPENSIÓN ADMIN: suspende o reactiva la cuenta de un admin.
// PARA QUÉ SE USA: el botón "Suspender" / "Reactivar" de ItemAdmin.
// Una cuenta suspendida no puede entrar al sitio (RutaProtegida) ni administrar nada.
// Recibe: uid del admin y suspendida (true para suspender, false para reactivar).
export async function cambiarSuspensionAdmin(uid, suspendida) {
  try {
    await updateDoc(doc(db, COLECCION_USUARIOS, String(uid)), {
      estado: suspendida ? "suspendido" : "activo",
      fechaActualizacion: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al cambiar el estado de la cuenta:", error);
    throw new Error(traducirErrorCrearAdmin(error?.code));
  }
}
