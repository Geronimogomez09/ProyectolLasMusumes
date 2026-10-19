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
                <div className="container inicio-contenido">
                                    {/* ---------- Secciones ---------- */}
                                        <section className="inicio-seccion">
                                            <h2 className="inicio-titulo">
                                                <span></span>
                                                Explorá Wiki-Craft
                                            </h2>
                
                                            <div className="row g-3">
                                                    <div className="col-12 col-md-6 col-lg-4">
                                                        <article className="card inicio-card-seccion h-100">
                                                            <Link
                                                                to="/"
                                                                className="inicio-imagen-link"
                                                                
                                                            >
                                                                
                                                            </Link>
                
                                                            <div className="card-body">
                                                                <h3>
                                                                    <i className="icono"></i>
                                                                    titulo
                                                                </h3>
                
                                                                <p>descripcion</p>
                
                                                                <Link to="/" className="inicio-enlace" >
                                                                    Descubrir
                                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                                </Link>
                                                            </div>
                                                        </article>
                                                    </div>
                                            </div>
                                        </section>
                                    {/* ---------- Novedades ---------- */}
                                        <section className="inicio-seccion">
                                            <div className="inicio-titulo-fila">
                                                <h2 className="inicio-titulo">
                                                    <span></span>
                                                    Novedades de la comunidad
                                                </h2>
                
                                                <Link to="/comunidad" className="inicio-ver-todo" >
                                                    Ver todas
                                                    <i className="bi bi-arrow-right ms-1"></i>
                                                </Link>
                                            </div>
                
                                            <div className="row g-3">
                                                    <div className="col-12 col-md-6 col-lg-4">
                                                        <article className="card inicio-card-novedad h-100">
                
                                                            <Link to="/" className="inicio-novedad-imagen" >
                                                                
                                                            </Link>
                
                                                            <div className="card-body">
                                                                <span className="inicio-categoria"></span>
                
                                                                <h3>
                                                                    <Link to="/" >
                                                                        titulo
                                                                    </Link>
                                                                </h3>
                
                                                                <div className="inicio-metadata">
                                                                    <span>
                                                                        <i className="bi bi-calendar3 me-1"></i>
                                                                        fecha
                                                                    </span>
                                                                    <span>
                                                                        <i className="bi bi-person me-1"></i>
                                                                        autor
                                                                    </span>
                                                                </div>
                
                                                                <p>descripcion</p>
                
                                                                <Link to="/" className="inicio-leer-mas" >
                                                                    Leer publicación
                                                                    <i className="bi bi-arrow-up-right ms-1"></i>
                                                                </Link>
                                                            </div>
                                                        </article>
                                                    </div>
                                            </div>
                                        </section>
                                    {/* ---------- Publicación destacada y construcciones ---------- */}
                                    <section className="row g-3 inicio-inferior">
                                        <div className="col-12 col-lg-5">
                                            <article className="inicio-publicacion h-100">
                                                <div className="inicio-avatar">
                                                    <i className="bi bi-person-fill"></i>
                                                </div>
                
                                                <div className="inicio-publicacion-contenido">
                                                    <h3>Destacado de la comunidad</h3>
                
                                                    <p>
                                                        ¿Terminaste una construcción increíble? Compartila
                                                        con otros jugadores y mostrá lo que podés crear.
                                                    </p>
                
                                                    <span className="inicio-publicacion-autor">
                                                        Comunidad Wiki-Craft
                                                    </span>
                
                                                    <Link to="/comunidad" className="inicio-enlace" >
                                                        Ver publicaciones
                                                        <i className="bi bi-arrow-right ms-2"></i>
                                                    </Link>
                                                </div>
                                            </article>
                                        </div>
                
                                        <div className="col-12 col-lg-7">
                                            <section className="inicio-construcciones h-100">
                                                <div className="inicio-titulo-fila">
                                                    <h2 className="inicio-titulo">
                                                        <span></span>
                                                        Conocé las construcciones
                                                    </h2>
                
                                                    <Link to="/comunidad" className="inicio-ver-todo">
                                                        Ver más
                                                        <i className="bi bi-arrow-right ms-1"></i>
                                                    </Link>
                                                </div>
                
                                                    <p className="inicio-vacio">Todavía no hay construcciones para mostrar.</p>
                
                                                <div className="row g-2">
                                                        <div className="col-4">
                                                            <div className="inicio-construccion-item">
                                                                <Link
                                                                    to="/comunidad"
                                                                    className="inicio-construccion"
                                                                    title=""
                                                                    onClick=""
                                                                >
                                                                    
                                                                    <span>nombre</span>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                            </section>
                                        </div>
                                    </section>
                
                                    {/* ---------- Tienda ---------- */}
                                    <section className="inicio-tienda">
                                        <div>
                                            <span className="inicio-categoria">TIENDA WIKI-CRAFT</span>
                                            <h2>Equipate para tu próxima aventura</h2>
                                            <p>
                                                Explorá los productos disponibles y encontrá algo para
                                                vos o para regalarle a otro jugador.
                                            </p>
                                        </div>
                
                                        <Link to="/tienda" className="btn inicio-btn-principal">
                                            Explorar la tienda
                                            <i className="bi bi-arrow-right ms-2"></i>
                                        </Link>
                                    </section>
                </div>
            </main>

            <Footer />
        </>
    );
}
