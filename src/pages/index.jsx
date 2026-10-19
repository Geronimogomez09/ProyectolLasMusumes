import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import "../styles/variables.css";
import "../styles/index.css";

export default function Inicio() {
return (
        <>
            <Header />

            <main className="">
                <section className="inicio-hero">
                    <div className="container inicio-hero-contenido">
                        <div className="inicio-hero-texto">
                            <span className="inicio-etiqueta">
                                <i className="bi bi-tree-fill me-2"></i>
                                Una wiki hecha por jugadores
                            </span>

                            <h1>
                                Tu mundo. Tu aventura.
                                <span>Tu comunidad.</span>
                            </h1>

                            <p>
                                Descubrí Minecraft, explorá sus versiones y compartí
                                tus construcciones con otros jugadores.
                            </p>

                            <div className="d-flex flex-wrap gap-3">
                                <Link to="/versiones" className="btn inicio-btn-principal">
                                    <i className="bi bi-compass-fill me-2"></i>
                                    Explorar el mundo
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Link>

                                <Link to="/comunidad" className="btn inicio-btn-secundario" >
                                    <i className="bi bi-people-fill me-2"></i>
                                    Unirme a la comunidad
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}
