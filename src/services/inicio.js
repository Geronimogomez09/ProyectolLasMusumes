import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    serverTimestamp,
    runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

export const CONTENIDO_INICIAL = {
    secciones: [
        {
            id: "seccion-comunidad",
            titulo: "Comunidad",
            descripcion: "Conocé a otros jugadores, compartí tus ideas, mostrá tus construcciones y participá en eventos.",
            imagen: "comunidad.png",
            enlace: "/comunidad",
            icono: "dirt.png",
            activo: true,
        },
        {
            id: "seccion-versiones",
            titulo: "Versiones",
            descripcion: "Reviví la historia de Minecraft, explorá cada versión y descubrí todo lo que cambió con el tiempo.",
            imagen: "versiones.png",
            enlace: "/versiones",
            icono: "brush.png",
            activo: true,
        },
        {
            id: "seccion-musica",
            titulo: "Música",
            descripcion: "Disfrutá de las mejores bandas sonoras, listas y música creada por la comunidad.",
            imagen: "musica-2.jpg",
            enlace: "/musica",
            icono: "note_block.png",
            activo: true,
        },
    ],
    novedades: [
        {
            id: "novedad-granja",
            categoria: "TUTORIALES",
            titulo: "Granja automática de aldeanos",
            fecha: "12 abr 2026",
            autor: "NovaBuild",
            descripcion: "Paso a paso para construir una granja de aldeanos eficiente y fácil de replicar.",
            imagen: "granja.jpg",
            enlace: "/comunidad",
            activo: true,
        },
        {
            id: "novedad-version",
            categoria: "VERSIONES",
            titulo: "La versión que cambió todo",
            fecha: "8 abr 2026",
            autor: "ZetaCraft",
            descripcion: "Recordamos la actualización que transformó la forma de jugar Minecraft.",
            imagen: "versioncambio.png",
            enlace: "/versiones",
            activo: true,
        },
        {
            id: "novedad-playlist",
            categoria: "MÚSICA",
            titulo: "Nueva playlist: sonidos del Overworld",
            fecha: "5 abr 2026",
            autor: "Luma",
            descripcion: "Una selección de los mejores temas del mundo principal, ideal para tus construcciones.",
            imagen: "musica.png",
            enlace: "/musica",
            activo: true,
        },
    ],
    construcciones: [
        { id: "construccion-castillo", nombre: "Castillo medieval", imagen: "castillo.png", activo: true },
        { id: "construccion-casa", nombre: "Casa moderna", imagen: "casamoderna.jpg", activo: true },
        { id: "construccion-portal", nombre: "Portal del Nether", imagen: "portal.jpg", activo: true },
    ],
};

const COLECCIONES = {
    secciones: "secciones",
    novedades: "novedades",
    construcciones: "construcciones",
};

const COLECCION_POR_TIPO = {
    seccion: COLECCIONES.secciones,
    novedad: COLECCIONES.novedades,
    construccion: COLECCIONES.construcciones,
};

// Carga inicial idempotente: si las colecciones están vacías, inserta el contenido inicial.
export async function inicializarInicioIdempotente() {
    const documentosIniciales = Object.entries(CONTENIDO_INICIAL).flatMap(
        ([tipo, items]) => items.map(({ id, ...datos }) => ({
            referencia: doc(db, COLECCIONES[tipo], id),
            datos,
        }))
    );

    await runTransaction(db, async (transaccion) => {
        const existentes = await Promise.all(
            documentosIniciales.map(({ referencia }) => transaccion.get(referencia))
        );

        existentes.forEach((snapshot, indice) => {
            if (!snapshot.exists()) {
                transaccion.set(documentosIniciales[indice].referencia, {
                    ...documentosIniciales[indice].datos,
                    activo: true,
                    createdAt: serverTimestamp(),
                    fechaActualizacion: serverTimestamp(),
                });
            }
        });
    });
}

// Los visitantes consultan solo contenido activo; administradores también reciben los inactivos.
export function suscribirseAInicio(onDatosActualizados, onError, incluirInactivos = false) {
    const escucharColeccion = (tipo) => {
        const referencia = collection(db, COLECCIONES[tipo]);
        const consulta = incluirInactivos
            ? referencia
            : query(referencia, where("activo", "==", true));

        return onSnapshot(
            consulta,
            (snapshot) => {
                const items = snapshot.docs.map((documento) => ({
                    id: documento.id,
                    ...documento.data(),
                }));
                onDatosActualizados(tipo, items);
            },
            onError
        );
    };

    const unsubSecciones = escucharColeccion("secciones");
    const unsubNovedades = escucharColeccion("novedades");
    const unsubConstrucciones = escucharColeccion("construcciones");

    return () => {
        unsubSecciones();
        unsubNovedades();
        unsubConstrucciones();
    };
}

export async function crearItemFirestore(tipo, datos) {
    const nombreCol = COLECCION_POR_TIPO[tipo];
    if (!nombreCol) throw new Error("Tipo de contenido inválido");

    const nuevoDoc = {
        ...datos,
        activo: true,
        fechaActualizacion: new Date().toISOString(),
    };

    await addDoc(collection(db, nombreCol), nuevoDoc);
}

export async function editarItemFirestore(tipo, id, datos) {
    const nombreCol = COLECCION_POR_TIPO[tipo];
    if (!nombreCol) throw new Error("Tipo de contenido inválido");

    const datosActualizables = { ...datos };
    delete datosActualizables.id;

    const docRef = doc(db, nombreCol, id);
    await updateDoc(docRef, {
        ...datosActualizables,
        activo: datos.activo !== false,
        fechaActualizacion: new Date().toISOString(),
    });
}

// Deshabilitar en vez de borrar: actualiza únicamente el campo booleano 'activo'
export async function cambiarEstadoActivoFirestore(tipo, id, estadoActual) {
    const nombreCol = COLECCION_POR_TIPO[tipo];
    if (!nombreCol) throw new Error("Tipo de contenido inválido");

    const docRef = doc(db, nombreCol, id);
    await updateDoc(docRef, {
        activo: !estadoActual,
        fechaActualizacion: new Date().toISOString(),
    });
}