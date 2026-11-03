import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, perfil, cargando, esAdmin, suspendido } = useAuth();
  if (cargando) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (!perfil) return <Navigate to="/login" replace />;  if (suspendido && !esAdmin) return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,textAlign:"center"}}><section><h1>Cuenta suspendida</h1><p>Tu cuenta no puede acceder a Wiki-Craft. Contactá con la administración.</p></section></main>;
  if (soloAdmin && !esAdmin) return <Navigate to="/" replace />;
  return children;
}
export default RutaProtegida;
