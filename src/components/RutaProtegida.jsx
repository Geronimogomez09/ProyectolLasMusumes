
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { esSuperAdmin, tienePermiso } from "../utils/permisos";

// Índice: Protección de rutas.
// ----------------- Protección de rutas -----------------
// Comprueba la sesión y los permisos antes de mostrar una página. Recibe el contenido y las reglas de acceso; devuelve ese contenido o redirige al usuario según su perfil.

function RutaProtegida({
    children,
    permiso = null,
    soloAdmin = false,
    soloSuperAdmin = false
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

    // RUTA SOLO SUPERADMIN: páginas como /admin/usuarios. Quien no es superadmin vuelve al inicio.
    if (soloSuperAdmin && !esSuperAdmin(perfil)) {
        return <Navigate to="/" replace />;
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
