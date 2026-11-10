// Índice: Tipos y rutas del inicio.
// ----------------- Tipos y rutas del inicio -----------------
// Reúne valores y funciones para normalizar tipos de contenido y convertirlos en rutas internas. Recibe datos del inicio y devuelve valores listos para navegar o mostrar.

// TIPOS INICIO (components/inicio/tiposInicio.js): describe qué campos tiene cada tipo de
// contenido editable del inicio (sección y construcción).
// PARA QUÉ SE USA: ModalAdminInicio arma el formulario con estos campos, y pages/index.jsx
// y los controles de edición usan nuevo() y nombreDe().

import { ICONOS } from "./imagenesInicio";

// A RUTA INTERNA: convierte "comunidad" o "/comunidad" en "/comunidad".
const aRutaInterna = (valor) => `/${valor.replace(/^\/+/, "")}`;

// CAMPO ENLACE: campo de enlace interno que usan las secciones.
const CAMPO_ENLACE = {
    nombre: "enlace",
    etiqueta: "Enlace",
    tipo: "texto",
    ayuda: "Ruta interna, por ejemplo /comunidad",
    limpiar: aRutaInterna,
};

// TIPOS: un elemento por cada tipo de contenido editable.
//   campos   -> lista de campos del formulario (tipo: texto, area, icono o imagen)
//   nuevo()  -> datos iniciales de un elemento nuevo
//   nombreDe -> texto que identifica al elemento en los mensajes
export const TIPOS = {
    seccion: {
        singular: "sección",
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            CAMPO_ENLACE,
            { nombre: "icono", etiqueta: "Icono", tipo: "icono" },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({
            titulo: "",
            descripcion: "",
            imagen: "",
            enlace: "/comunidad",
            icono: ICONOS[0] ?? "",
        }),
        nombreDe: (item) => item.titulo,
    },

    construccion: {
        singular: "construcción",
        campos: [
            { nombre: "nombre", etiqueta: "Nombre", tipo: "texto", requerido: true },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ nombre: "", imagen: "" }),
        nombreDe: (item) => item.nombre,
    },
};

// LIMPIAR DATOS: antes de guardar, quita espacios de los textos y aplica la limpieza
// propia de cada campo (por ejemplo, dejar el enlace como ruta interna).
export function limpiarDatos(tipo, datos) {
    const limpios = { ...datos };

    for (const campo of TIPOS[tipo].campos) {
        let valor = limpios[campo.nombre] ?? "";
        if (typeof valor === "string") valor = valor.trim();
        if (campo.limpiar) valor = campo.limpiar(valor);
        limpios[campo.nombre] = valor;
    }

    return limpios;
}
