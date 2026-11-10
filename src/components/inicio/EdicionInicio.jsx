import { createContext, useContext } from "react";
import { Link } from "react-router-dom";

export const EdicionContext = createContext({
    editando: false,
    puedeEditar: false,
    abrirNuevo: () => {},
    abrirEditar: () => {},
    onCambiarEstado: () => {},
});

export const useEdicionInicio = () => useContext(EdicionContext);

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

export function ControlesAdminInicio({ tipo, item }) {
    const { editando, abrirEditar, onCambiarEstado } = useEdicionInicio();

    if (!editando) return null;

    const activo = item.activo !== false;

    return (
        <div className="inicio-admin-acciones d-flex gap-1 align-items-center">
            <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`}>
                {activo ? 'Activo' : 'Inactivo'}
            </span>

            <button
                type="button"
                className="inicio-admin-btn"
                onClick={() => abrirEditar(tipo, item)}
                title="Editar"
            >
                <i className="bi bi-pencil-fill"></i>
            </button>

            <button
                type="button"
                className={`inicio-admin-btn inicio-admin-btn-estado ${activo ? 'text-warning' : 'text-success'}`}
                onClick={() => onCambiarEstado(tipo, item.id, activo)}
                aria-label={activo ? `Deshabilitar ${tipo}` : `Habilitar ${tipo}`}
            >
                <i className={`bi ${activo ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                <span>{activo ? "Deshabilitar" : "Habilitar"}</span>
            </button>
        </div>
    );
}

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