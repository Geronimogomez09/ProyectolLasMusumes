// IMAGEN ACCESO: muestra una imagen decorativa de src/assets (bloques, flores, animales, iconos)
// en las páginas de login y registro.
// PARA QUÉ SE USA: DecoracionAcceso, PanelInformativo, CampoPassword y la cabecera de login.jsx.
// Recibe: nombre (archivo, ej "FoxPixel.png") y className (clase CSS). Si no encuentra
// el archivo, no muestra nada.

// RECURSOS ACCESO: carga todas las imágenes de src/assets (incluidas las subcarpetas)
// y las guarda por ruta relativa y por nombre de archivo, para buscarlas de cualquiera de las dos formas.
const RECURSOS_ACCESO = Object.entries(
  import.meta.glob("../../assets/**/*.{png,jpg,jpeg,webp,gif,avif,svg}", {
    eager: true,
    import: "default",
  })
).reduce((recursos, [ruta, url]) => {
  const relativa = ruta.replace("../../assets/", "");
  const nombre = relativa.split("/").pop();

  recursos[relativa] = url;
  recursos[nombre] = url;

  return recursos;
}, {});

function ImagenAcceso({ nombre, className }) {
  // Busca por nombre y, si no está, dentro de la carpeta iconos.
  const src = RECURSOS_ACCESO[nombre] ?? RECURSOS_ACCESO[`iconos/${nombre}`];

  if (!src) return null;

  return (
    <img
      src={src}
      className={className}
      alt=""
      aria-hidden="true"
      draggable="false"
    />
  );
}

export default ImagenAcceso;