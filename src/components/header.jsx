
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/variables.css";
import "../styles/header.css";

// Distancia de scroll necesaria para activar el header compacto.
const LIMITE_SCROLL = 300;

// Rutas en las que no se muestra el header.
const RUTAS_SIN_NAVBAR = [
    "/login",
    "/registro",
];

// Enlaces que se muestran en la navegación principal.
const ENLACES = [
    { nombre: "Principal", ruta: "/" },
    { nombre: "Comunidad", ruta: "/comunidad" },
    { nombre: "Música", ruta: "/musica" },
    { nombre: "Tienda", ruta: "/tienda" },
    { nombre: "Historia", ruta: "/historia" },
    { nombre: "Nosotros", ruta: "/nosotros" },
    { nombre: "Versiones", ruta: "/versiones" },
];

function Header() {
    const location = useLocation();

    // Datos de autenticación.
    const { usuario, cerrarSesion } = useAuth();

    // Estados del header y sus menús.
    const [encogido, setEncogido] = useState(false);
    const [hoverActivo, setHoverActivo] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);

    // Detecta el desplazamiento.
    useEffect(() => {
        const actualizarHeader = () => {
            setEncogido(window.scrollY > LIMITE_SCROLL);
        };

        actualizarHeader();

        window.addEventListener("scroll", actualizarHeader, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", actualizarHeader);
        };
    }, []);

    // Cierra los menús cuando cambia la ruta.
    useEffect(() => {
        setMenuAbierto(false);
        setPerfilAbierto(false);
    }, [location.pathname]);

    // Comprueba si se debe ocultar el header.
    const ocultarNavbar = RUTAS_SIN_NAVBAR.some(
        (ruta) =>
            location.pathname === ruta ||
            location.pathname.startsWith(`${ruta}/`)
    );

    if (ocultarNavbar) return null;

    // Control del header compacto.
    const headerCompacto =
        encogido && !menuAbierto && !perfilAbierto && !hoverActivo;

    // Cierra el menú de navegación.
    const cerrarMenu = () => {
        setMenuAbierto(false);
    };

    // Cierra la sesión del usuario.
    const manejarCerrarSesion = async () => {
        try {
            await cerrarSesion();
            setPerfilAbierto(false);
            setMenuAbierto(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <header
            className={`header ${headerCompacto ? "shrink" : ""} ${
                menuAbierto ? "menu-open" : ""
            }`}
            onMouseEnter={() => setHoverActivo(true)}
            onMouseLeave={() => setHoverActivo(false)}
        >
            <nav className="header-bar" aria-label="Navegación principal">
                <div className="header-container">

                    {/* Logo y botón del menú móvil. */}
                    <div className="header-top-row">
                        <Link
                            className="header-logo"
                            to="/"
                            aria-label="Wiki-Craft, página principal"
                            onClick={() => {
                                cerrarMenu();
                                setPerfilAbierto(false);
                            }}
                        >
                            WIKI<span className="header-logo-separator">-</span>
                            <span className="h1-craft">CRAFT</span>
                        </Link>

                        <button
                            className="header-toggler"
                            type="button"
                            aria-controls="navbarPrincipal"
                            aria-expanded={menuAbierto}
                            aria-label={
                                menuAbierto ? "Cerrar menú" : "Abrir menú"
                            }
                            onClick={() =>
                                setMenuAbierto((abierto) => !abierto)
                            }
                        >
                            <span
                                className="header-toggler-icon"
                                aria-hidden="true"
                            />
                        </button>
                    </div>

                    {/* Contenido del header. */}
                    <div
                        className={`header-content ${
                            menuAbierto ? "show" : ""
                        }`}
                        id="navbarPrincipal"
                    >
                        <div className="header-content-inner">

                            {/* Buscador. */}
                            <form
                                className="header-search"
                                role="search"
                                onSubmit={(event) => event.preventDefault()}
                            >
                                <input
                                    className="header-search-input"
                                    type="search"
                                    placeholder="Buscar algo nuevo..."
                                    aria-label="Buscar en Wiki-Craft"
                                />

                                <button
                                    className="header-search-btn"
                                    type="submit"
                                    aria-label="Buscar"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                        aria-hidden="true"
                                    >
                                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
                                    </svg>
                                </button>
                            </form>

                            {/* Navegación principal. */}
                            <ul className="header-nav">
                                {ENLACES.map((enlace) => {
                                    const activo =
                                        enlace.ruta === "/"
                                            ? location.pathname === "/"
                                            : location.pathname === enlace.ruta ||
                                              location.pathname.startsWith(
                                                  `${enlace.ruta}/`
                                              );

                                    return (
                                        <li key={enlace.ruta}>
                                            <Link
                                                className={`header-link ${
                                                    activo ? "active" : ""
                                                }`}
                                                to={enlace.ruta}
                                                aria-current={
                                                    activo ? "page" : undefined
                                                }
                                                onClick={cerrarMenu}
                                            >
                                                {enlace.nombre}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Perfil y autenticación. */}
                            <div
                                className={`header-profile ${
                                    perfilAbierto ? "profile-open" : ""
                                }`}
                            >
                                <button
                                    className="profile-button"
                                    type="button"
                                    aria-label="Mostrar menú de perfil"
                                    aria-expanded={perfilAbierto}
                                    aria-controls="menuPerfil"
                                    onClick={() =>
                                        setPerfilAbierto(
                                            (abierto) => !abierto
                                        )
                                    }
                                >
                                    <span
                                        className="profile-avatar"
                                        aria-hidden="true"
                                    >
                                        {usuario?.email
                                            ?.charAt(0)
                                            .toUpperCase() || "P"}
                                    </span>

                                    <span className="profile-text">
                                        {usuario ? "Mi perfil" : "Perfil"}
                                    </span>

                                    <svg
                                        className="profile-chevron"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M3 6l5 5 5-5" />
                                    </svg>
                                </button>

                                <ul
                                    className={`profile-menu ${
                                        perfilAbierto ? "show" : ""
                                    }`}
                                    id="menuPerfil"
                                    aria-label="Opciones del perfil"
                                >
                                    {usuario ? (
                                        <>
                                            <li>
                                                <span className="profile-menu-title">
                                                    {usuario.email}
                                                </span>
                                            </li>

                                            <li>
                                                <span className="profile-menu-item">
                                                    Configuración
                                                </span>
                                            </li>

                                            <li>
                                                <Link
                                                    to="/"
                                                    className="profile-menu-item"
                                                    onClick={cerrarMenu}
                                                >
                                                    Mi perfil
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    to="/"
                                                    className="profile-menu-item"
                                                    onClick={cerrarMenu}
                                                >
                                                    Carrito
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    to="/"
                                                    className="profile-menu-item"
                                                    onClick={cerrarMenu}
                                                >
                                                    Canciones favoritas
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    to=""
                                                    className="profile-menu-item"
                                                    onClick={cerrarMenu}
                                                >
                                                    Mis publicaciones
                                                </Link>
                                            </li>

                                            <li>
                                                <hr className="profile-menu-divider" />
                                            </li>

                                            <li>
                                                <button
                                                    type="button"
                                                    className="profile-menu-item profile-logout"
                                                    onClick={manejarCerrarSesion}
                                                >
                                                    Cerrar sesión
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        <>
                                            <li>
                                                <Link
                                                    to="/login"
                                                    className="profile-menu-item"
                                                    onClick={cerrarMenu}
                                                >
                                                    Iniciar sesión
                                                </Link>
                                            </li>

                                            <li>
                                                <Link
                                                    to="/login"
                                                    className="profile-menu-item"
                                                    onClick={cerrarMenu}
                                                >
                                                    Crear cuenta
                                                </Link>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
