
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";

function RutaProtegida({
    children,
    permiso = null,
    soloAdmin = false
}) {
    const { usuario, perfil, cargando } = useAuth();

    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">
                        Cargando...
                    </span>
                </div>
            </div>
        );
    }

    if (!usuario || !perfil) {
        return <Navigate to="/login" replace />;
    }

    if (perfil.estado === "suspendido") {
        return (
            <main style={{
                minHeight: "100vh",
                display: "grid",
                placeItems: "center",
                padding: 24,
                textAlign: "center"
            }}>
                <section>
                    <h1>Cuenta suspendida</h1>
                    <p>
                        Tu cuenta no puede acceder a Wiki-Craft.
                        Contactá con la administración.
                    </p>
                </section>
            </main>
        );
    }

    // Compatibilidad con rutas antiguas.
    if (soloAdmin && !tienePermiso(perfil)) {
        return <Navigate to="/" replace />;
    }

    // Protección por departamento.
    if (permiso && !tienePermiso(perfil, permiso)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RutaProtegida;
