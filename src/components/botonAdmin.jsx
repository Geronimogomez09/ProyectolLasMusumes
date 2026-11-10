
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";

import "../styles/botonAdmin.css";

// Índice: Botón de administración.
// ----------------- Botón de administración -----------------
// Muestra un acceso de administración solo cuando el perfil tiene permiso para esa sección. Recibe el nombre de la sección y su destino; al activarlo, permite navegar a la herramienta correspondiente.

export default function BotonAdmin({
    activo = false,
    alAlternar,
    aviso,
    children,
    permiso
}) {
    const { perfil } = useAuth();

    // Si no tiene permiso para esta sección,
    // no se muestra el botón.
    if (!tienePermiso(perfil, permiso)) {
        return null;
    }

    return (
        <div className="boton-admin-panel">

            {activo && aviso && (
                <p className="boton-admin-aviso">
                    <i className="bi bi-info-circle-fill"></i>
                    {aviso}
                </p>
            )}

            {activo && children}

            <button
                type="button"
                className={`boton-admin-toggle ${
                    activo ? "activo" : ""
                }`}
                aria-pressed={activo}
                onClick={alAlternar}
            >
                <i
                    className={`bi ${
                        activo
                            ? "bi-shield-check"
                            : "bi-shield-lock"
                    }`}
                ></i>

                {activo
                    ? "Salir del modo administrador"
                    : "Modo administrador"}
            </button>

        </div>
    );
}
