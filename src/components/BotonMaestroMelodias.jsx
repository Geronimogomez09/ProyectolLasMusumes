import "../styles/botonMaestroMelodias.css";

// ==========================================================
// BOTÓN FLOTANTE DE MAESTRO DE MELODÍAS
// Componente independiente de BotonAdmin.
// La autorización se comprueba desde la página y la ruta.
// ==========================================================

export default function BotonMaestroMelodias({
    activo = false,
    alAlternar,
    aviso,
    children,
}) {
    return (
        <div
            className={`boton-maestro-panel ${
                activo ? "modo-activo" : ""
            }`}
        >
            {activo && aviso && (
                <p className="boton-maestro-aviso">
                    <i className="bi bi-info-circle-fill"></i>
                    {aviso}
                </p>
            )}

            {activo && children}

            <button
                type="button"
                className="boton-maestro-toggle"
                onClick={alAlternar}
                aria-pressed={activo}
                aria-label={
                    activo
                        ? "Salir del modo administrador"
                        : "Activar modo administrador"
                }
                title={
                    activo
                        ? "Salir del modo administrador"
                        : "Modo administrador"
                }
            >
                <img
                    src="/music/iconos/tocadiscos.png"
                    alt=""
                    className="boton-maestro-imagen"
                />

                <span className="boton-maestro-texto">
                    {activo
                        ? "Salir del modo administrador"
                        : "Maestro de Melodías"}
                </span>
            </button>
        </div>
    );
}