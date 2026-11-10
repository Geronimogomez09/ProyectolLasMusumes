// HOOK GUARDADOS (hooks/useGuardados.js): da a cualquier componente la lista de elementos
// guardados por el usuario actual y una función para guardar o quitar.
// PARA QUÉ SE USA: botón de favorito en canciones, publicaciones y productos, y el perfil.
// Se importa de las dos formas: import useGuardados from ... o import { useGuardados } from ...
//
// Uso:
//   const { ids, estaGuardado, alternar } = useGuardados("publicacion");
//   estaGuardado(post.id)  -> true o false
//   alternar(post.id)      -> guarda o quita
// tipo: "cancion" | "publicacion" | "producto"

import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { alternarGuardado, escucharGuardados } from "../services/guardados";

// ÍNDICE
// - Escucha: carga los ids del tipo elegido y limpia la lista si no hay sesión.
// - Consulta y cambio: comprueba si un id está guardado y alterna su estado.
// Entradas: tipo ("cancion", "publicacion" o "producto"); salida: ids y funciones.

// ----------------- Escucha de elementos guardados -----------------
// Firestore notifica cambios en tiempo real; al desmontarse el hook cancela la escucha.
export function useGuardados(tipo) {
  const auth = useAuth();
  const uid = auth?.usuario?.uid;

  // ids contiene strings para comparar de manera uniforme con distintos tipos de id.
  const [ids, setIds] = useState([]);

  // ESCUCHAR: se conecta a Firestore mientras haya usuario y se desconecta al salir.
  useEffect(() => {
    if (!uid) {
      setIds([]);
      return undefined;
    }

    const dejarDeEscuchar = escucharGuardados(uid, tipo, setIds, (error) =>
      console.error(`No se pudieron cargar los guardados (${tipo}):`, error)
    );

    return () => dejarDeEscuchar();
  }, [uid, tipo]);

  // ESTÁ GUARDADO: true si el elemento ya está en la lista. Compara siempre como string.
  function estaGuardado(id) {
    return ids.includes(String(id));
  }

  // ALTERNAR: guarda el elemento si no estaba guardado, o lo quita si ya lo estaba.
  async function alternar(id) {
    if (!uid) return;

    try {
      await alternarGuardado(uid, tipo, id, estaGuardado(id));
    } catch (error) {
      console.error(`No se pudo actualizar el guardado (${tipo}):`, error);
    }
  }

  return { ids, estaGuardado, alternar };
}

export default useGuardados;
