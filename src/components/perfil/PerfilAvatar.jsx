import { useEffect, useState } from "react";
import { iniciales } from "./perfilUtils";

// Índice: Avatar del perfil.
// ----------------- Avatar del perfil -----------------
// Recibe la foto, el nombre y una clase visual opcional. Muestra la imagen del perfil o sus iniciales si no hay foto disponible.

// AVATAR PERFIL: círculo con la foto del usuario o, si no hay foto (o no carga), sus iniciales.
// PARA QUÉ SE USA: panel izquierdo del perfil y vista previa dentro del formulario de datos.
// QUÉ MUESTRA: la imagen de fotoPerfil o las iniciales del nombre.
// Recibe: foto (URL o ""), nombre (texto) y className (opcional, ej: "perfil-avatar--grande").
export default function PerfilAvatar({ foto, nombre, className = "" }) {
  // FALLO: true cuando el navegador no pudo cargar la URL de la foto.
  const [fallo, setFallo] = useState(false);

  // Si cambia la URL de la foto, se vuelve a intentar cargarla.
  useEffect(() => {
    setFallo(false);
  }, [foto]);

  return (
    <div className={`perfil-avatar ${className}`}>
      {foto && !fallo ? (
        <img
          src={foto}
          alt={`Foto de ${nombre}`}
          onError={() => setFallo(true)}
        />
      ) : (
        <span>{iniciales(nombre)}</span>
      )}
    </div>
  );
}
