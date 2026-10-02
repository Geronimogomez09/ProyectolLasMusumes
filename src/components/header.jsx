import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const rutasSinNavbar = ['/login', '/registro', '/tienda', '/versiones', '/historia'];

  if (rutasSinNavbar.includes(location.pathname)) {
    return null;
  }

  return (
    <header class="">
      <div class="header-container navbar navbar-expand-lg navbar-light bg-light">
        <div class="header-title">
          <h1>
            WIKI<span class="h-bar">-</span><span class="text-">CRAFT</span>
          </h1>
        </div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
          <div class="search">
          <form class="d-flex">
            <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"></input>
            <button class="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
          <div class="container-fluid">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" aria-current="page" href="#">Principal</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Comunidad</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Tienda</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="#">Música</a>
              </li>
            </ul>
          </div>
          <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdownUser" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <span>img xd</span>
            <span>Mi Perfil</span>
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownUser">
            <li><a class="dropdown-item" href="#">Ver Perfil</a></li>
            <li><a class="dropdown-item" href="#">Configuración</a></li>
            <li><a class="dropdown-item text-danger" href="#">Cerrar sesión</a></li>
          </ul>
        </li>
        </nav>
      </div>
    </header>
    /*<nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          WikiCraft
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarToggleDemo01"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarToggleDemo01">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/historia">
                Historia
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/versiones">
                Versiones
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/musica">
                Musica
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
              <Link className="nav-link" to="/registro">
                sign up
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                login
              </Link>
            </li>
          </ul>
          <form className="d-flex ms-3">
            <input 
              className="form-control me-2" 
              type="search" 
              placeholder="Buscar..." 
            />
            <button className="btn btn-outline-success" type="submit">
              Buscar
            </button>
          </form>
        </div>
      </div>
    </nav>
    */
  )
}