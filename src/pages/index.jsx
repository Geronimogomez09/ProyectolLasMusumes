import { createContext, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import { ModalConfirmar, ModalFormulario } from "../components/admin/ModalAdmin.jsx";
import { cargarInicio, crearId, fechaHoy, guardarInicio } from "../data/inicio.js";
import { HERO_URL, ICONOS, Icono, Imagen } from "../utils/imagenes";
import "../styles/index.css";
import "../styles/admin.css";

/* ============================================================================
   1. TIPOS DE CONTENIDO
   ----------------------------------------------------------------------------
   Para agregar un CAMPO nuevo: una línea en "campos".
   Para agregar un TIPO nuevo: una entrada acá + su sección en la página.
   "activable: true" agrega el interruptor Visible / Oculta a las tarjetas.

   Cada campo puede tener "limpiar": una función que normaliza el valor al guardar.
   Los tipos de control (texto, area, icono, imagen) están en components/admin/ModalAdmin.jsx.
   ========================================================================= */

const aRutaInterna = (valor) => `/${valor.replace(/^\/+/, "")}`;
const aMayusculas = (valor) => valor.toUpperCase();

const CAMPO_ENLACE = {
    nombre: "enlace",
    etiqueta: "Enlace",
    tipo: "texto",
    ayuda: "Ruta interna, por ejemplo /comunidad",
    limpiar: aRutaInterna,
};

const TIPOS = {
    seccion: {
        clave: "secciones",
        singular: "sección",
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            CAMPO_ENLACE,
            { nombre: "icono", etiqueta: "Icono", tipo: "icono" },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ titulo: "", descripcion: "", imagen: "", enlace: "/comunidad", icono: ICONOS[0] ?? "" }),
        nombreDe: (item) => item.titulo,
    },
    novedad: {
        clave: "novedades",
        singular: "novedad",
        activable: true,
        campos: [
            { nombre: "titulo", etiqueta: "Título", tipo: "texto", requerido: true },
            { nombre: "categoria", etiqueta: "Categoría", tipo: "texto", ayuda: "Se muestra en mayúsculas", limpiar: aMayusculas },
            { nombre: "autor", etiqueta: "Autor", tipo: "texto" },
            { nombre: "fecha", etiqueta: "Fecha", tipo: "texto" },
            { nombre: "descripcion", etiqueta: "Descripción", tipo: "area" },
            CAMPO_ENLACE,
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ activa: true, categoria: "", titulo: "", fecha: fechaHoy(), autor: "", descripcion: "", imagen: "", enlace: "/comunidad" }),
        nombreDe: (item) => item.titulo,
    },
    construccion: {
        clave: "construcciones",
        singular: "construcción",
        campos: [
            { nombre: "nombre", etiqueta: "Nombre", tipo: "texto", requerido: true },
            { nombre: "imagen", etiqueta: "Imagen", tipo: "imagen" },
        ],
        nuevo: () => ({ nombre: "", imagen: "" }),
        nombreDe: (item) => item.nombre,
    },
};

// Las novedades que no tienen el campo "activa" cuentan como activas.
const estaActiva = (item) => item.activa !== false;

/* ============================================================================
   2. CONTEXTO DE EDICIÓN
   ----------------------------------------------------------------------------
   Reparte el modo administrador y las acciones a toda la página, así cada
   elemento solo escribe <Controles /> o <Agregar /> y no repite condiciones.
   ========================================================================= */

const EdicionContext = createContext({
    admin: false,
    abrirNuevo: () => {},
    abrirEditar: () => {},
    abrirEliminar: () => {},
    alternarActiva: () => {},
});

const useEdicion = () => useContext(EdicionContext);

// Link que no navega mientras se está editando, para no perder cambios sin guardar.
function Enlace({ onClick, ...props }) {
    const { admin } = useEdicion();

    return (
        <Link
            {...props}
            onClick={(evento) => {
                if (admin) evento.preventDefault();
                onClick?.(evento);
            }}
        />
    );
}

// Botones sobre cada elemento (solo en modo administrador):
// arriba a la izquierda el interruptor Visible / Oculta, arriba a la derecha editar y eliminar.
function Controles({ tipo, item }) {
    const { admin, abrirEditar, abrirEliminar, alternarActiva } = useEdicion();

    if (!admin) return null;

    const nombre = TIPOS[tipo].nombreDe(item);
    const activa = estaActiva(item);

    return (
        <>
            {TIPOS[tipo].activable && (
                <div className="admin-estado">
                    <button
                        type="button"
                        role="switch"
                        aria-checked={activa}
                        aria-label={`Mostrar “${nombre}” en Inicio`}
                        title={activa ? "Visible en Inicio. Tocá para ocultarla" : "Oculta. Tocá para mostrarla en Inicio"}
                        className={`admin-switch ${activa ? "activo" : ""}`}
                        onClick={() => alternarActiva(tipo, item)}
                    >
                        <span className="admin-switch-pista" aria-hidden="true"></span>
                        {activa ? "Visible" : "Oculta"}
                    </button>
                </div>
            )}

            <div className="admin-acciones">
                <button
                    type="button"
                    className="admin-btn"
                    onClick={() => abrirEditar(tipo, item)}
                    aria-label={`Editar ${nombre}`}
                    title="Editar"
                >
                    <i className="bi bi-pencil-fill"></i>
                </button>
                <button
                    type="button"
                    className="admin-btn peligro"
                    onClick={() => abrirEliminar(tipo, item)}
                    aria-label={`Eliminar ${nombre}`}
                    title="Eliminar"
                >
                    <i className="bi bi-trash3-fill"></i>
                </button>
            </div>
        </>
    );
}

// Recuadro punteado para agregar un elemento nuevo (solo en modo administrador).
// "columna" es la clase de la columna de Bootstrap que lo envuelve.
function Agregar({ tipo, texto, columna, compacto = false }) {
    const { admin, abrirNuevo } = useEdicion();

    if (!admin) return null;

    return (
        <div className={columna}>
            <button
                type="button"
                className={`admin-agregar ${compacto ? "compacto" : ""}`}
                onClick={() => abrirNuevo(tipo)}
            >
                <i className="bi bi-plus-lg"></i>
                {texto}
            </button>
        </div>
    );
}

/* ============================================================================
   3. PÁGINA
   ========================================================================= */

export default function Inicio() {
    // Por ahora el modo administrador es solo un botón.
    // Cuando exista el login, "admin" saldrá del usuario y el botón desaparece.
    const [admin, setAdmin] = useState(false);

    // El contenido se lee del navegador (data/inicio.js) y se vuelve a guardar en cada cambio.
    // Así aparecen acá las tarjetas que se crean desde la página de una publicación.
    const [contenido, setContenido] = useState(cargarInicio);

    // Ventana abierta: { modo: "editar" | "eliminar", tipo, id, datos } o null.
    const [modal, setModal] = useState(null);

    useEffect(() => {
        if (!guardarInicio(contenido)) {
            window.alert("No se pudo guardar: el navegador se quedó sin espacio. Probá con una imagen más chica.");
        }
    }, [contenido]);

    const cerrarModal = () => setModal(null);

    const abrirNuevo = (tipo) =>
        setModal({ modo: "editar", tipo, id: null, datos: TIPOS[tipo].nuevo() });

    const abrirEditar = (tipo, item) =>
        setModal({ modo: "editar", tipo, id: item.id, datos: { ...item } });

    const abrirEliminar = (tipo, item) =>
        setModal({ modo: "eliminar", tipo, id: item.id, datos: item });

    // Cuando haya backend, es en estas tres funciones donde va la llamada a la API.
    const guardar = (tipo, id, datos) => {
        const { clave } = TIPOS[tipo];

        setContenido((anterior) => ({
            ...anterior,
            [clave]: id === null
                ? [...anterior[clave], { ...datos, id: crearId(clave) }]
                : anterior[clave].map((item) => (item.id === id ? { ...item, ...datos } : item)),
        }));
        setModal(null);
    };

    const eliminar = (tipo, id) => {
        const { clave } = TIPOS[tipo];

        setContenido((anterior) => ({
            ...anterior,
            [clave]: anterior[clave].filter((item) => item.id !== id),
        }));
        setModal(null);
    };

    const alternarActiva = (tipo, item) => {
        const { clave } = TIPOS[tipo];

        setContenido((anterior) => ({
            ...anterior,
            [clave]: anterior[clave].map((otro) =>
                otro.id === item.id ? { ...otro, activa: !estaActiva(otro) } : otro
            ),
        }));
    };

    const alternarAdmin = () => {
        setAdmin((activo) => !activo);
        setModal(null);
    };

    const { secciones, novedades, construcciones } = contenido;

    // Los visitantes solo ven las novedades activas; el administrador ve todas.
    const novedadesVisibles = admin ? novedades : novedades.filter(estaActiva);

    return (
        <EdicionContext.Provider
            value={{ admin, abrirNuevo, abrirEditar, abrirEliminar, alternarActiva }}
        >
            <Header />

            <main className={`inicio ${admin ? "inicio-modo-admin" : ""}`}>
                <section
                    className="inicio-hero"
                    style={HERO_URL ? { "--inicio-hero-imagen": `url("${HERO_URL}")` } : undefined}
                >
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
                                <Enlace to="/versiones" className="btn inicio-btn-principal">
                                    <i className="bi bi-compass-fill me-2"></i>
                                    Explorar el mundo
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Enlace>

                                <Enlace to="/comunidad" className="btn inicio-btn-secundario">
                                    <i className="bi bi-people-fill me-2"></i>
                                    Unirme a la comunidad
                                </Enlace>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container inicio-contenido">
                    {/* ---------- Secciones ---------- */}
                    {(admin || secciones.length > 0) && (
                        <section className="inicio-seccion">
                            <h2 className="inicio-titulo">
                                <span></span>
                                Explorá Wiki-Craft
                            </h2>

                            <div className="row g-3">
                                {secciones.map((seccion) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={seccion.id}>
                                        <article className="card inicio-card-seccion h-100">
                                            <Controles tipo="seccion" item={seccion} />

                                            <Enlace
                                                to={seccion.enlace}
                                                className="inicio-imagen-link"
                                                aria-label={`Explorar ${seccion.titulo}`}
                                            >
                                                <Imagen nombre={seccion.imagen} className="inicio-card-imagen" />
                                            </Enlace>

                                            <div className="card-body">
                                                <div className="seccion-titulo d-flex">
                                                    <div className="d-flex icono-container">
                                                        <Icono nombre={seccion.icono} className="inicio-icono" />
                                                    </div>
                                                    <h3>
                                                        {seccion.titulo}
                                                    </h3>
                                                </div>
                                                <p>{seccion.descripcion}</p>

                                                <Enlace to={seccion.enlace} className="inicio-enlace">
                                                    Descubrir
                                                    <i className="bi bi-arrow-right ms-2"></i>
                                                </Enlace>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                <Agregar tipo="seccion" texto="Agregar sección" columna="col-12 col-md-6 col-lg-4" />
                            </div>
                        </section>
                    )}

                    {/* ---------- Novedades ---------- */}
                    {(admin || novedadesVisibles.length > 0) && (
                        <section className="inicio-seccion">
                            <div className="inicio-titulo-fila">
                                <h2 className="inicio-titulo">
                                    <span></span>
                                    Novedades de la comunidad
                                </h2>

                                <Enlace to="/comunidad" className="inicio-ver-todo">
                                    Ver todas
                                    <i className="bi bi-arrow-right ms-1"></i>
                                </Enlace>
                            </div>

                            <div className="row g-3">
                                {novedadesVisibles.map((novedad) => (
                                    <div className="col-12 col-md-6 col-lg-4" key={novedad.id}>
                                        <article
                                            className={`card inicio-card-novedad h-100 ${estaActiva(novedad) ? "" : "inactiva"}`}
                                        >
                                            <Controles tipo="novedad" item={novedad} />

                                            <Enlace to={novedad.enlace} className="inicio-novedad-imagen">
                                                <Imagen nombre={novedad.imagen} alt={novedad.titulo} />
                                            </Enlace>

                                            <div className="card-body">
                                                <span className="inicio-categoria">{novedad.categoria}</span>

                                                <h3>
                                                    <Enlace to={novedad.enlace}>{novedad.titulo}</Enlace>
                                                </h3>

                                                <div className="inicio-metadata">
                                                    <span>
                                                        <i className="bi bi-calendar3 me-1"></i>
                                                        {novedad.fecha}
                                                    </span>
                                                    <span>
                                                        <i className="bi bi-person me-1"></i>
                                                        {novedad.autor}
                                                    </span>
                                                </div>

                                                <p>{novedad.descripcion}</p>

                                                <Enlace to={novedad.enlace} className="inicio-leer-mas">
                                                    Leer publicación
                                                    <i className="bi bi-arrow-up-right ms-1"></i>
                                                </Enlace>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                <Agregar tipo="novedad" texto="Agregar novedad" columna="col-12 col-md-6 col-lg-4" />
                            </div>
                        </section>
                    )}

                    {/* ---------- Publicación destacada y construcciones ---------- */}
                    <section className="row g-3 inicio-inferior">
                        <div className="col-12 col-lg-5">
                            <article className="inicio-publicacion h-100">
                                <div className="inicio-avatar">
                                    <Imagen nombre="avatar.png" alt="Avatar de la comunidad" />
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

                                    <Enlace to="/comunidad" className="inicio-enlace">
                                        Ver publicaciones
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Enlace>
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

                                    <Enlace to="/comunidad" className="inicio-ver-todo">
                                        Ver más
                                        <i className="bi bi-arrow-right ms-1"></i>
                                    </Enlace>
                                </div>

                                {construcciones.length === 0 && !admin && (
                                    <p className="inicio-vacio">Todavía no hay construcciones para mostrar.</p>
                                )}

                                <div className="row g-2">
                                    {construcciones.map((construccion) => (
                                        <div className="col-4" key={construccion.id}>
                                            <div className="inicio-construccion-item">
                                                <Controles tipo="construccion" item={construccion} />

                                                <Enlace
                                                    to="/comunidad"
                                                    className="inicio-construccion"
                                                    title={construccion.nombre}
                                                >
                                                    <Imagen nombre={construccion.imagen} alt={construccion.nombre} />
                                                    <span>{construccion.nombre}</span>
                                                </Enlace>
                                            </div>
                                        </div>
                                    ))}

                                    <Agregar tipo="construccion" texto="Agregar" columna="col-4" compacto />
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

                        <Enlace to="/tienda" className="btn inicio-btn-principal">
                            Explorar la tienda
                            <i className="bi bi-arrow-right ms-2"></i>
                        </Enlace>
                    </section>
                </div>

                {/* ---------- Botón del modo administrador ---------- */}
                <div className="admin-panel">
                    {admin && (
                        <p className="admin-aviso">
                            <i className="bi bi-info-circle-fill"></i>
                            Modo de ejemplo: los cambios se guardan solo en este navegador.
                        </p>
                    )}

                    <button
                        type="button"
                        className={`admin-toggle ${admin ? "activo" : ""}`}
                        aria-pressed={admin}
                        onClick={alternarAdmin}
                    >
                        <i className={`bi ${admin ? "bi-shield-check" : "bi-shield-lock"}`}></i>
                        {admin ? "Salir del modo administrador" : "Modo administrador"}
                    </button>
                </div>

                {modal && modal.modo === "eliminar" && (
                    <ModalConfirmar
                        key={`eliminar-${modal.id}`}
                        titulo={`Eliminar ${TIPOS[modal.tipo].singular}`}
                        mensaje={
                            `¿Seguro que querés eliminar “${TIPOS[modal.tipo].nombreDe(modal.datos)}”? ` +
                            "Esta acción no se puede deshacer." +
                            (modal.datos.origenId
                                ? " La publicación original no se borra: podés volver a destacarla cuando quieras."
                                : "")
                        }
                        textoConfirmar="Eliminar"
                        peligro
                        onConfirmar={() => eliminar(modal.tipo, modal.id)}
                        onCerrar={cerrarModal}
                    />
                )}

                {modal && modal.modo === "editar" && (
                    <ModalFormulario
                        key={`editar-${modal.tipo}-${modal.id ?? "nuevo"}`}
                        titulo={`${modal.id === null ? "Agregar" : "Editar"} ${TIPOS[modal.tipo].singular}`}
                        campos={TIPOS[modal.tipo].campos}
                        datos={modal.datos}
                        textoGuardar={modal.id === null ? "Agregar" : "Guardar cambios"}
                        onGuardar={(datos) => guardar(modal.tipo, modal.id, datos)}
                        onCerrar={cerrarModal}
                    />
                )}
            </main>

            <Footer />
        </EdicionContext.Provider>
    );
}