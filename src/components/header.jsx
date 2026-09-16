import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
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
  )
}