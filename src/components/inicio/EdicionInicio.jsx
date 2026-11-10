import { createContext, useContext } from "react";
import { Link } from "react-router-dom";
import { TIPOS } from "./tiposInicio";

// Índice: Enlaces de edición del inicio.
// ----------------- Enlaces de edición del inicio -----------------
// Recibe una acción de clic y las propiedades restantes del enlace. Reutiliza el enlace de inicio para ejecutar una acción sin perder su presentación y atributos.

// EDICIÓN INICIO (components/inicio/EdicionInicio.jsx): reúne lo que comparten todos los
// componentes del inicio para el modo administrador.
// PARA QUÉ SE USA: que TarjetaSeccion, SeccionesInicio, ConstruccionesInicio y los enlaces
// sepan si se está editando y puedan abrir el modal, sin pasar props por todos lados.
// pages/index.jsx crea el contexto (EdicionContext.Provider) y lo llena con sus funciones.

// CONTEXTO DE EDICIÓN: guarda editando (true si el admin activó el modo administrador)
// y las funciones para abrir el modal de agregar, editar o eliminar.
export const EdicionContext = createContext({
    editando: false,
    abrirNuevo: () => {},
    abrirEditar: () => {},
    abrirEliminar: () => {},
});

// USAR EDICIÓN INICIO: devuelve el contexto de edición dentro de cualquier componente del inicio.
export const useEdicionInicio = () => useContext(EdicionContext);

// ENLACE INICIO: enlace interno que NO navega mientras el admin está editando,
// así un clic sobre una tarjeta no lo saca de la página.
// Recibe: los mismos props que <Link> de react-router.
export function EnlaceInicio({ onClick, ...props }) {
    const { editando } = useEdicionInicio();

    return (
        <Link
            {...props}
            onClick={(evento) => {
                if (editando) evento.preventDefault();
                onClick?.(evento);
            }}
        />
    );
}

// CONTROLES ADMIN INICIO: botones de lápiz (editar) y papelera (eliminar) que aparecen
// sobre una tarjeta solo en modo administrador.
// Recibe: tipo ("seccion" | "construccion") e item (el documento).
export function ControlesAdminInicio({ tipo, item }) {
    const { editando, abrirEditar, abrirEliminar } = useEdicionInicio();

    if (!editando) return null;

    const nombre = TIPOS[tipo].nombreDe(item);

    return (
        <div className="inicio-admin-acciones">
            <button
                type="button"
                className="inicio-admin-btn"
                onClick={() => abrirEditar(tipo, item)}
                aria-label={`Editar ${nombre}`}
                title="Editar"
            >
                <i className="bi bi-pencil-fill"></i>
            </button>

            <button
                type="button"
                className="inicio-admin-btn peligro"
                onClick={() => abrirEliminar(tipo, item)}
                aria-label={`Eliminar ${nombre}`}
                title="Eliminar"
            >
                <i className="bi bi-trash3-fill"></i>
            </button>
        </div>
    );
}

// BOTÓN AGREGAR INICIO: recuadro "+ Agregar ..." que abre el modal para crear un elemento nuevo.
// Solo aparece en modo administrador.
// Recibe: tipo, texto (lo que dice el botón), columna (clases de la columna) y compacto.
export function BotonAgregarInicio({ tipo, texto, columna, compacto = false }) {
    const { editando, abrirNuevo } = useEdicionInicio();

    if (!editando) return null;

    return (
        <div className={columna}>
            <button
                type="button"
                className={`inicio-admin-agregar ${compacto ? "compacto" : ""}`}
                onClick={() => abrirNuevo(tipo)}
            >
                <i className="bi bi-plus-lg"></i>
                {texto}
            </button>
        </div>
    );
}
