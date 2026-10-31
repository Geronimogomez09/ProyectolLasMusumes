
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RutaProtegida({ children, soloAdmin = false }) {
    const { usuario, cargando, esAdmin } = useAuth();

    // Espera a que Firebase verifique la sesión.
    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si no inició sesión, redirige al login.
    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // Si necesita permisos de administrador, los verifica.
    if (soloAdmin && !esAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RutaProtegida;
