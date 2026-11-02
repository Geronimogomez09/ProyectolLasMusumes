import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

import {
  songs,
  albums,
  composers,
  playlists,
} from "../data/musicData";

const catalogo = [
  { nombre: "canciones", datos: songs },
  { nombre: "albumes", datos: albums },
  { nombre: "compositores", datos: composers },
  { nombre: "playlists", datos: playlists },
];

async function importarColeccion(nombre, datos) {
  const referencia = collection(db, nombre);
  const existentes = await getDocs(referencia);

  const idsExistentes = new Set(
    existentes.docs.map((documento) => documento.id)
  );

  const pendientes = datos.filter(
    (item) => !idsExistentes.has(String(item.id))
  );

  if (pendientes.length === 0) {
    return {
      coleccion: nombre,
      importados: 0,
      omitidos: datos.length,
    };
  }

  let importados = 0;

  // Firestore admite hasta 500 operaciones por lote.
  // Usamos lotes de 450 para mantener un margen.
  for (let i = 0; i < pendientes.length; i += 450) {
    const lote = writeBatch(db);
    const grupo = pendientes.slice(i, i + 450);

    grupo.forEach(({ id, ...datosDocumento }) => {
      const documento = doc(db, nombre, String(id));

      lote.set(documento, {
        ...datosDocumento,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      });
    });

    await lote.commit();
    importados += grupo.length;
  }

  return {
    coleccion: nombre,
    importados,
    omitidos: datos.length - importados,
  };
}

export async function importarCatalogoMusical() {
  const resultados = [];

  for (const grupo of catalogo) {
    const resultado = await importarColeccion(
      grupo.nombre,
      grupo.datos
    );

    resultados.push(resultado);
  }

  return resultados;
}