import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/variables.css";
import "../styles/header.css";

// Distancia de scroll necesaria para activar el header compacto.
const LIMITE_SCROLL = 300;

// Rutas en las que no se muestra el header.
const RUTAS_SIN_NAVBAR = [
    "/login",
    "/registro",
    "/historia",
];

// Enlaces que se muestran en la navegación principal.
const ENLACES = [
    { nombre: "Principal", ruta: "/" },
    { nombre: "Comunidad", ruta: "/comunidad" },
    { nombre: "Música", ruta: "/musica" },
    { nombre: "Tienda", ruta: "/tienda" },
    { nombre: "Historia", ruta: "/historia" },
    { nombre: "Versiones", ruta: "/versiones" },
];

function Header() {
    // Obtiene la ruta actual para detectar enlaces activos y controlar
    // cuándo se debe ocultar el header.
    const location = useLocation();

    // Estados que controlan el tamaño del header, el hover y los menús.
    const [encogido, setEncogido] = useState(false);
    const [hoverActivo, setHoverActivo] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [perfilAbierto, setPerfilAbierto] = useState(false);

    // Detecta el desplazamiento y actualiza el estado del header.
    useEffect(() => {
        const actualizarHeader = () => {
            setEncogido(window.scrollY > LIMITE_SCROLL);
        };

        actualizarHeader();
        window.addEventListener("scroll", actualizarHeader, { passive: true });

        // Elimina el evento cuando el componente deja de utilizarse.
        return () => window.removeEventListener("scroll", actualizarHeader);
    }, []);

    // Cierra ambos menús cuando cambia la ruta.
    useEffect(() => {
        setMenuAbierto(false);
        setPerfilAbierto(false);
    }, [location.pathname]);

    // Comprueba si la ruta actual coincide con alguna de las rutas excluidas.
    // También contempla las páginas que se encuentran dentro de esas rutas.
    const ocultarNavbar = RUTAS_SIN_NAVBAR.some(
        (ruta) => location.pathname === ruta || location.pathname.startsWith(`${ruta}/`)
    );

    // Oculta completamente el header en las páginas excluidas.
    if (ocultarNavbar) return null;

    // El header se compacta al hacer scroll, excepto cuando el cursor está
    // encima o alguno de los menús permanece abierto.
    const headerCompacto = encogido && !menuAbierto && !perfilAbierto;

    // Cierra el menú de navegación cuando se selecciona un enlace.
    const cerrarMenu = () => {
        setMenuAbierto(false);
    };

    return (
        <header
            className={`header ${headerCompacto ? "shrink" : ""} ${menuAbierto ? "menu-open" : ""}`}
        >
            <nav className="header-bar" aria-label="Navegación principal">
                <div className="header-container">

                    {/* Fila superior que contiene el logo y el botón del menú móvil. */}
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
                            <span className="h1-craft" >CRAFT</span>
                        </Link>

                        {/* Botón hamburguesa que abre o cierra la navegación en móvil.
                            El icono (tres líneas -> X) se dibuja con CSS. */}
                        <button
                            className="header-toggler"
                            type="button"
                            aria-controls="navbarPrincipal"
                            aria-expanded={menuAbierto}
                            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                            onClick={() => setMenuAbierto((abierto) => !abierto)}
                        >
                            <span className="header-toggler-icon" aria-hidden="true" />
                        </button>
                    </div>

                    {/* Contenido desplegable del header.
                        La clase show controla su visibilidad en el menú responsive.
                        header-content-inner es necesario para animar la altura en móvil. */}
                    <div
                        className={`header-content ${menuAbierto ? "show" : ""}`}
                        id="navbarPrincipal"
                    >
                        <div className="header-content-inner">

                            {/* Buscador visual que, por ahora, evita el envío del formulario
                                y no realiza búsquedas. */}
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

                            {/* Enlaces principales de navegación.
                                El enlace correspondiente a la ruta actual recibe la clase active. */}
                            <ul className="header-nav">
                                {ENLACES.map((enlace) => {
                                    const activo = enlace.ruta === "/"
                                        ? location.pathname === "/"
                                        : location.pathname === enlace.ruta || location.pathname.startsWith(`${enlace.ruta}/`);

                                    return (
                                        <li key={enlace.ruta}>
                                            <Link
                                                className={`header-link ${activo ? "active" : ""}`}
                                                to={enlace.ruta}
                                                aria-current={activo ? "page" : undefined}
                                                onClick={cerrarMenu}
                                            >
                                                {enlace.nombre}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Perfil con menú desplegable controlado por React.
                                En escritorio solo se ve el avatar y la flecha;
                                en móvil también se muestra el texto "Perfil". */}
                            <div className={`header-profile ${perfilAbierto ? "profile-open" : ""}`}>
                                <button
                                    className="profile-button"
                                    type="button"
                                    aria-label="Mostrar menú visual del perfil"
                                    aria-expanded={perfilAbierto}
                                    aria-controls="menuPerfil"
                                    title="Menú de perfil (solo diseño visual)"
                                    onClick={() => setPerfilAbierto((abierto) => !abierto)}
                                >
                                    {/* Para usar una imagen: <img src={...} alt="" /> dentro del avatar. */}
                                    <span className="profile-avatar" aria-hidden="true">P</span>
                                    <span className="profile-text">Perfil</span>
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

                                {/* Opciones visuales del perfil.
                                    La clase show controla la visibilidad del menú. */}
                                <ul
                                    className={`profile-menu ${perfilAbierto ? "show" : ""}`}
                                    id="menuPerfil"
                                    aria-label="Opciones visuales del perfil"
                                >
                                    <li>
                                        <span className="profile-menu-title">Mi cuenta</span>
                                    </li>
                                    <li>
                                        <span className="profile-menu-item">Configuración</span>
                                    </li>
                                    <li>
                                        <span className="profile-menu-item">Carrito</span>
                                    </li>
                                    <li>
                                        <span className="profile-menu-item">Canciones guardadas</span>
                                    </li>
                                    <li>
                                        <span className="profile-menu-item">Mis publicaciones</span>
                                    </li>
                                    <li>
                                        <hr className="profile-menu-divider" />
                                    </li>
                                    <li>
                                        <span className="profile-menu-item profile-logout">Cerrar sesión</span>
                                    </li>
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