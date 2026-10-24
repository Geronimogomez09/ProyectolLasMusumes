import { Link } from "react-router-dom";
import "../styles/variables.css";
import "../styles/Footer.css";

function Footer() {
    const anioActual = new Date().getFullYear();
    
    return (
        <footer className="site-footer">
            <div className="container footer-container">
                <div className="footer-main row g-4 g-xl-5">
                    <div className="col-12 col-lg-5">
                        <div className="footer-brand">
                            <Link className="footer-logo" to="/" aria-label="Wiki-Craft, página principal">
                                <span>WIKI</span><i>-</i><strong>CRAFT</strong>
                            </Link>
                            <p>
                                Un espacio para explorar el mundo de Wiki-Craft, descubrir contenido y compartir la experiencia con la comunidad.
                            </p>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <div className="footer-column">
                            <h2>Explorar</h2>
                            <Link to="/">Principal</Link>
                            <Link to="/historia">Historia</Link>
                            <Link to="/nosotros">Nosotros</Link>
                            <Link to="/versiones">Versiones</Link>
                        </div>
                    </div>

                    <div className="col-6 col-md-4 col-lg-2">
                        <div className="footer-column">
                            <h2>Contenido</h2>
                            <Link to="/comunidad">Comunidad</Link>
                            <Link to="/musica">Música</Link>
                            <Link to="/tienda">Tienda</Link>
                        </div>
                    </div>

                    <div className="col-12 col-md-4 col-lg-3">
                        <div className="footer-column footer-help">
                            <h2>¿Necesitás ayuda?</h2>
                            <p>Podés acercarte a la comunidad para compartir consultas, ideas y sugerencias.</p>
                        </div>
                    </div>
                </div>

                <div className="footer-divider" />

                <div className="footer-bottom">
                    <p>© {anioActual} <strong>WIKI-CRAFT</strong>. Todos los derechos reservados.</p>
                    <a className="footer-back-top" href="#top">
                        Volver al inicio <span aria-hidden="true">↑</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
