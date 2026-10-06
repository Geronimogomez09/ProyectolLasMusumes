import { Link, useLocation } from "react-router-dom";

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

  return (
    <header className="">
      <div className="header-container navbar navbar-expand-lg navbar-light bg-light">
        <div className="header-title">
          <h1>
            WIKI<span className="h-bar">-</span>
            <span className="text-">CRAFT</span>
          </h1>
        </div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="search">
            <form className="d-flex">
              <input
                className="form-control me-2"
                type="search"
                placeholder="Search"
                aria-label="Search"
              ></input>
              <button className="btn btn-outline-success" type="submit">
                Search
              </button>
            </form>
          </div>
          <div className="container-fluid">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to="/">
                  Principal
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/comunidad">
                  Comunidad
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/tienda">
                  Tienda
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/musica">
                  Musica
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/historia">
                  Historia
                </Link>
              </li>
            </ul>
          </div>
          <li className="nav-item dropdown">
            <a
              className="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="navbarDropdownUser"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span>img xd</span>
              <span>Mi Perfil</span>
            </a>
            <ul
              className="dropdown-menu dropdown-menu-end"
              aria-labelledby="navbarDropdownUser"
            >
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
                  publicaciones
                </Link>
              </li>
              <li>
                <Link className="dropdown-item text-danger" >
                  Cerrar sesión
                </Link>
              </li>
            </ul>
          </li>
        </nav>
      </div>
    </header>
  );
}
