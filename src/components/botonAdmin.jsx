import { useAuth } from "../context/AuthContext";

import "../styles/botonAdmin.css";

// Botón flotante de administrador, igual al de la página de inicio.
// Solo se muestra si el usuario tiene rol "admin".
//
// Props:
// - activo: si el modo administrador está abierto.
// - alAlternar: se ejecuta al hacer clic.
// - aviso: texto opcional sobre el botón mientras está activo.
// - children: botones extra que van arriba (por ejemplo "Restaurar originales").
export default function BotonAdmin({ activo = false, alAlternar, aviso, children }) {
    const { esAdmin } = useAuth();

    if (!esAdmin) return null;

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
                className={`boton-admin-toggle ${activo ? "activo" : ""}`}
                aria-pressed={activo}
                onClick={alAlternar}
            >
                <i className={`bi ${activo ? "bi-shield-check" : "bi-shield-lock"}`}></i>
                {activo ? "Salir del modo administrador" : "Modo administrador"}
            </button>
        </div>
    );
}
