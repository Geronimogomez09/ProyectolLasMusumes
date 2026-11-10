import { useEffect, useState } from "react";

export default function AvatarComunidad({ foto, nombre, className = "", style }) {
  const [fallo, setFallo] = useState(false);
  const fotoValida = typeof foto === "string" && foto.trim();
  const inicial = String(nombre || "Usuario").trim().charAt(0).toLocaleUpperCase("es") || "U";

  useEffect(() => {
    setFallo(false);
  }, [foto]);

  return (
    <div
      className={className}
      style={style}
      role="img"
      aria-label={`Avatar de ${nombre || "Usuario"}`}
    >
      {fotoValida && !fallo ? (
        <img src={foto.trim()} alt="" onError={() => setFallo(true)} />
      ) : (
        <span aria-hidden="true">{inicial}</span>
      )}
    </div>
  );
}
