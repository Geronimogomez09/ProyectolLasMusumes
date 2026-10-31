import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const desuscribir = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUsuario(usuarioFirebase);
      setCargando(false);
    });

    // Al desmontar, dejamos de escuchar los cambios
    return () => desuscribir();
  }, []);

  const cerrarSesion = () => {
    return signOut(auth);
  };

  const valor = {
    usuario,
    cargando,
    cerrarSesion,
  };

  return (
    <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}