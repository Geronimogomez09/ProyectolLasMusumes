import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { crearPerfilUsuario } from "../services/firestore";

const AuthContext = createContext(null);

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
  return (
    <AuthContext.Provider value={{
      usuario, perfil, esAdmin: perfil?.rol === "admin",
      suspendido, cargando, cerrarSesion
    }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() { return useContext(AuthContext); }
