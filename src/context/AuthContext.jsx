import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { crearPerfilUsuario } from "../services/firestore";
import { esSuperAdmin, tienePermiso } from "../utils/permisos";

// ÍNDICE
// - Sesión y perfil: sincroniza el inicio/cierre de sesión con el documento de usuario.
// - Permisos: expone los indicadores de administración calculados por utils/permisos.js.
// - Errores: registra fallos de lectura y deja el perfil vacío para no bloquear la app.

const AuthContext = createContext(null);

// ----------------- Sesión y perfil -----------------
// La entrada es la sesión de Firebase Auth; la salida es el usuario y su perfil actualizado.
// Al desmontarse el proveedor, se cancelan las escuchas de sesión y de perfil.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelarPerfil = null;
    const desuscribirAuth = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (cancelarPerfil) { cancelarPerfil(); cancelarPerfil = null; }
      setCargando(true);
      setUsuario(usuarioFirebase || null);
      setPerfil(null);
      if (!usuarioFirebase) { setCargando(false); return; }

      try {
        const referencia = doc(db, "usuarios", usuarioFirebase.uid);
        let resultado = await getDoc(referencia);
        if (!resultado.exists()) {
          await crearPerfilUsuario(usuarioFirebase);
          resultado = await getDoc(referencia);
        }
        if (resultado.exists()) setPerfil({ uid: resultado.id, ...resultado.data() });

        cancelarPerfil = onSnapshot(referencia, (snapshot) => {
          setPerfil(snapshot.exists() ? { uid: snapshot.id, ...snapshot.data() } : null);
          setCargando(false);
        }, (error) => {
          console.error("Error escuchando el perfil:", error);
          setCargando(false);
        });
      } catch (error) {
        console.error("No se pudo cargar el perfil:", error);
        setPerfil(null);
        setCargando(false);
      }
    });
    return () => { desuscribirAuth(); if (cancelarPerfil) cancelarPerfil(); };
  }, []);

  const cerrarSesion = () => signOut(auth);
  const suspendido = perfil?.estado === "suspendido";

  // ----------------- Permisos de administración -----------------
  // Los permisos se calculan desde el perfil; no se guardan ni modifican en este proveedor.
  const esAdmin = tienePermiso(perfil);
  const superAdmin = esSuperAdmin(perfil);

  return (
    <AuthContext.Provider value={{
      usuario, perfil, esAdmin, esSuperAdmin: superAdmin,
      suspendido, cargando, cerrarSesion
    }}>
      {children}
    </AuthContext.Provider>
  );
}
// ----------------- Acceso al contexto -----------------
export function useAuth() { return useContext(AuthContext); }
