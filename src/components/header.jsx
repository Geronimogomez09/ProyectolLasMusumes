import { Link, useLocation } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  const location = useLocation();

  const rutasSinNavbar = [
    "/login",
    "/registro",
    "/tienda",
    "/versiones",
    "/historia",
  ];

  if (rutasSinNavbar.includes(location.pathname)) {
    return null;
  }

  const enlaces = [
    { nombre: "Principal", ruta: "/" },
    { nombre: "Comunidad", ruta: "/comunidad" },
    { nombre: "Música", ruta: "/musica" },
    { nombre: "Tienda", ruta: "/tienda" },
    { nombre: "Historia", ruta: "/historia" },
    { nombre: "Versiones", ruta: "/versiones" },
  ];

  return (
    <header className="header">
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid header-container">
          <Link
            className="navbar-brand header-logo"
            to="/"
            style={{ color: "#1db53c" }}
          >
            WIKI<span className="header-logo-separator">-</span>
            <span className="h1-craft">CRAFT</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarPrincipal"
            aria-controls="navbarPrincipal"
            aria-expanded="false"
            aria-label="Abrir menú"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarPrincipal">
            <div className="header-search">
              <form className="d-flex" role="search">
                <input
                  className=" form-input"
                  type="search"
                  placeholder="Buscar algo nuevo..."
                  aria-label="Buscar"
                />
                <button className="btn-search" type="submit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                  </svg>
                </button>
              </form>
            </div>

            <ul className="navbar-nav header-nav">
              {enlaces.map((enlace) => {
                const activo =
                  enlace.ruta === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(enlace.ruta);

                return (
                  <li className="nav-item" key={enlace.ruta}>
                    <Link
                      className={`nav-link ${activo ? "active" : ""}`}
                      to={enlace.ruta}
                    >
                      {enlace.nombre}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="dropdown header-profile">
              <button
                className="btn profile-button dropdown-toggle"
                type="button"
                id="navbarDropdownUser"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span className="profile-avatar">P</span>
                <span className="profile-text">Perfil</span>
              </button>

              <ul
                className="dropdown-menu dropdown-menu-end profile-menu"
                aria-labelledby="navbarDropdownUser"
              >
                <li>
                  <h6 className="dropdown-header">Mi cuenta</h6>
                </li>
                <li>
                  <Link className="dropdown-item" to="/configuracion">
                    Configuración
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/carrito">
                    Carrito
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/canciones-guardadas">
                    Canciones guardadas
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/publicaciones/creadas">
                    Mis publicaciones
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    className="dropdown-item profile-logout"
                    type="button"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
