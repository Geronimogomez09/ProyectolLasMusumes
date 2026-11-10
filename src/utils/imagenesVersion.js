import { buscarImagen } from "../components/inicio/imagenesInicio";

export function resolverImagenVersion(valor) {
  const imagen = String(valor || "").trim();
  if (!imagen) return "";

  if (/^(https?:\/\/|\/\/|blob:|data:)/i.test(imagen)) {
    return imagen;
  }

  const rutaAssets = imagen.replace(
    /^\/?(?:(?:\.\.\/)|(?:\.\/))*src\/assets\//,
    ""
  );
  const imagenAsset = buscarImagen(rutaAssets);
  if (imagenAsset) return imagenAsset;

  const rutaPublica = imagen.replace(
    /^(?:(?:\.\.\/)|(?:\.\/))*public\//,
    "/"
  );
  if (rutaPublica.startsWith("/")) {
    return rutaPublica;
  }

  const rutaRelativa = rutaPublica.replace(/^(?:\.\.\/|\.\/)+/, "");
  return `/${rutaRelativa}`;
}
