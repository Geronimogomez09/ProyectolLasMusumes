import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { crearPerfilUsuario } from "../services/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, async (usuarioFirebase) => {
      setCargando(true);
      try {
        if (!usuarioFirebase) {
          setUsuario(null);
          setPerfil(null);
          return;
        }

        setUsuario(usuarioFirebase);
        const referencia = doc(db, "usuarios", usuarioFirebase.uid);
        let resultado = await getDoc(referencia);

        // Crea el perfil para cuentas existentes que aún no tengan documento.
        if (!resultado.exists()) {
          await crearPerfilUsuario(usuarioFirebase);
          resultado = await getDoc(referencia);
        }

        setPerfil(resultado.exists() ? resultado.data() : null);
      } catch (error) {
        console.error("No se pudo cargar el perfil de usuario:", error);
        setPerfil(null);
      } finally {
        setCargando(false);
      }
    });

    return () => desuscribir();
  }, []);

  const cerrarSesion = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        perfil,
        esAdmin: perfil?.rol === "admin",
        cargando,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
