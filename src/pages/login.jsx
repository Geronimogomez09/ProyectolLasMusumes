import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import DecoracionAcceso from "../components/login/DecoracionAcceso";
import ImagenAcceso from "../components/login/ImagenAcceso";
import PanelInformativo from "../components/login/PanelInformativo";
import FormularioLogin from "../components/login/FormularioLogin";
import FormularioRegistro from "../components/login/FormularioRegistro";

import "../styles/login.css";

// PÁGINA LOGIN: página de acceso. Muestra el inicio de sesión (/login) o el registro (/registro)
// dentro de una tarjeta con un panel informativo a la izquierda.
// La vista se decide con la URL: /registro abre el registro y cualquier otra ruta abre el login.
export default function Login() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { usuario, perfil } = useAuth();

  // VISTA: "registro" si la URL es /registro; en otro caso "login".
  const vista = pathname === "/registro" ? "registro" : "login";

  // CAMBIAR VISTA: pasa de login a registro (y al revés) cambiando la URL.
  function cambiarVista(nuevaVista) {
    navigate(nuevaVista === "registro" ? "/registro" : "/login");
  }

  // USUARIO YA LOGUEADO: si hay sesión y perfil, va al inicio. Es lo que lleva al usuario
  // al inicio después de entrar o registrarse (AuthContext vuelve a montar la app al cambiar la sesión).
  if (usuario && perfil) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="acceso-page">

      {/* FONDO DECORATIVO: bloques, flores, animales y partículas. */}
      <DecoracionAcceso />

      <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5 acceso-contenedor">

        {/* TARJETA: panel informativo a la izquierda y formulario a la derecha. */}
        <div className="row border rounded p-4 w-100 acceso-card g-0">

          <PanelInformativo vista={vista} />

          <div className="col-md-8 p-4 acceso-panel-form">

            {/* CABECERA: marca del sitio y mensaje de bienvenida. */}
            <div className="acceso-form-cabecera">
              <span className="acceso-form-etiqueta">
                <ImagenAcceso nombre="glint.png" className="img-wiki" />
                WIKI-CRAFT
              </span>

              <span className="acceso-form-nota">
                <i className="bi bi-sun" />
                Tu próxima aventura empieza acá
              </span>
            </div>

            {/* FORMULARIO: login o registro según la vista. */}
            {vista === "login" ? (
              <FormularioLogin key="login" onCambiarVista={cambiarVista} />
            ) : (
              <FormularioRegistro key="registro" onCambiarVista={cambiarVista} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}