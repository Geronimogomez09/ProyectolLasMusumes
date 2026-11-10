// Índice: Decoración del perfil.
// ----------------- Decoración del perfil -----------------
// No recibe propiedades; presenta los elementos decorativos que acompañan la vista del perfil.

// DECORACIÓN PERFIL: bloques y flores de Minecraft que flotan detrás de la tarjeta del perfil.
// PARA QUÉ SE USA: ambientación de fondo de la página de perfil. No recibe props.
// QUÉ MUESTRA: imágenes decorativas de src/assets/iconos (si falta alguna, no se muestra).

// ICONOS: carga todos los PNG de src/assets/iconos y los guarda por nombre de archivo.
const ICONOS = Object.fromEntries(
  Object.entries(
    import.meta.glob("../../assets/iconos/*.png", { eager: true, import: "default" })
  ).map(([ruta, url]) => [ruta.split("/").pop(), url])
);

// DECORACIÓN: cada par es [archivo, clase CSS con su posición].
const DECORACION = [
  ["grass_block.png", "perfil-deco--1"],
  ["dirt.png", "perfil-deco--2"],
  ["diamond.png", "perfil-deco--3"],
  ["sunflower.png", "perfil-deco--4"],
  ["pink_petals.png", "perfil-deco--5"],
  ["wildflowers.png", "perfil-deco--6"],
];

export default function PerfilDecoracion() {
  return (
    <div className="perfil-decoracion" aria-hidden="true">
      {DECORACION.map(([archivo, clase]) =>
        ICONOS[archivo] ? (
          <img
            key={archivo}
            src={ICONOS[archivo]}
            className={`perfil-deco ${clase}`}
            alt=""
            draggable="false"
          />
        ) : null
      )}
    </div>
  );
}
