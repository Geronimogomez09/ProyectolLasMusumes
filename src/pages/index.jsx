import { useCallback, useEffect, useState } from "react";
import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import BotonAdmin from "../components/botonAdmin";
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos.js";
import {
    inicializarInicioIdempotente,
    suscribirseAInicio,
    crearItemFirestore,
    editarItemFirestore,
    cambiarEstadoActivoFirestore,
} from "../services/inicio.js";

import HeroInicio from "../components/inicio/HeroInicio.jsx";
import SeccionesInicio from "../components/inicio/SeccionesInicio.jsx";
import NovedadesInicio from "../components/inicio/NovedadesInicio.jsx";
import ConstruccionesInicio from "../components/inicio/ConstruccionesInicio.jsx";
import ModalAdminInicio from "../components/inicio/ModalAdminInicio.jsx";
import { EdicionContext, EnlaceInicio } from "../components/inicio/EdicionInicio.jsx";
import { HERO_URL, Imagen } from "../components/inicio/imagenesInicio.jsx";
import { limpiarDatos, TIPOS } from "../components/inicio/tiposInicio.js";
import "../styles/index.css";

export default function Inicio() {
    const { perfil } = useAuth();
    const esAdminAutorizado = tienePermiso(perfil, "inicio");

    const [modoAdminAbierto, setModoAdmin] = useState(false);
    const editando = esAdminAutorizado && modoAdminAbierto;

    const [datos, setDatos] = useState({
        secciones: [],
        novedades: [],
        construcciones: []
    });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [modal, setModal] = useState(null);

    useEffect(() => {
        let cancelarSuscripcion = () => {};
        let sigueMontado = true;
        const tiposCargados = new Set();
        let huboError = false;

        async function iniciar() {
            try {
                if (esAdminAutorizado) {
                    await inicializarInicioIdempotente();
                }
                if (!sigueMontado) return;

                cancelarSuscripcion = suscribirseAInicio(
                    (tipo, nuevosDatos) => {
                        if (!sigueMontado) return;
                        setDatos((prev) => ({ ...prev, [tipo]: nuevosDatos }));
                        tiposCargados.add(tipo);
                        if (tiposCargados.size === 3 && !huboError) {
                            setError(null);
                            setCargando(false);
                        }
                    },
                    (err) => {
                        console.error("Error en Firestore:", err);
                        if (sigueMontado) {
                            huboError = true;
                            setError("No se pudo cargar el contenido de inicio.");
                            setCargando(false);
                        }
                    },
                    esAdminAutorizado
                );
            } catch (err) {
                console.error("Error al iniciar:", err);
                if (sigueMontado) {
                    huboError = true;
                    setError("Error de conexión con la base de datos.");
                    setCargando(false);
                }
            }
        }

        iniciar();
        return () => {
            sigueMontado = false;
            cancelarSuscripcion();
        };
    }, [esAdminAutorizado]);

    // Cerrar modo admin si pierde permisos
    useEffect(() => {
        if (!esAdminAutorizado) {
            setModoAdmin(false);
            setModal(null);
        }
    }, [esAdminAutorizado]);

    const abrirNuevo = (tipo) => {
        if (!esAdminAutorizado) return;
        setModal({
            modo: "editar",
            tipo,
            id: null,
            datos: TIPOS[tipo].nuevo(),
        });
    };

    const abrirEditar = (tipo, item) => {
        if (!esAdminAutorizado) return;
        setModal({
            modo: "editar",
            tipo,
            id: item.id,
            datos: { ...item },
        });
    };

    const cambiarEstado = async (tipo, id, estadoActual) => {
        if (!esAdminAutorizado) return;
        try {
            await cambiarEstadoActivoFirestore(tipo, id, estadoActual);
        } catch (err) {
            console.error("Error al cambiar estado activo:", err);
            alert("No se pudo actualizar el estado del elemento.");
        }
    };

    const guardar = async (tipo, id, valores) => {
        if (!esAdminAutorizado) return;
        try {
            const datosLimpios = limpiarDatos(tipo, valores);
            if (id === null) {
                await crearItemFirestore(tipo, datosLimpios);
            } else {
                await editarItemFirestore(tipo, id, datosLimpios);
            }
            setModal(null);
        } catch (err) {
            console.error("Error al guardar en Firestore:", err);
            const codigo = err?.code ? ` (${err.code})` : "";
            const detalle = err?.message || "Firebase no devolvió detalles.";
            const sugerencia = err?.code === "permission-denied"
                ? "\n\nRevisá que las reglas actualizadas estén desplegadas y que tu perfil tenga el permiso de Inicio."
                : "";
            alert(`No se pudieron guardar los cambios${codigo}.\n${detalle}${sugerencia}`);
        }
    };

    const cerrarModal = useCallback(() => setModal(null), []);

    const { secciones, novedades, construcciones } = datos;

    return (
        <EdicionContext.Provider
            value={{
                editando,
                puedeEditar: esAdminAutorizado,
                abrirNuevo,
                abrirEditar,
                onCambiarEstado: cambiarEstado,
            }}
        >
            <Header />

            <main className={`inicio ${editando ? "inicio-modo-admin" : ""}`}>
                <HeroInicio imagenFondo={HERO_URL} />

                <div className="container inicio-contenido">
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}

                    <SeccionesInicio secciones={secciones} />

                    <NovedadesInicio novedades={novedades} cargando={cargando} />

                    <section className="row g-3 inicio-inferior">
                        <div className="col-12 col-lg-5">
                            <article className="inicio-publicacion h-100">
                                <div className="inicio-avatar">
                                    <Imagen nombre="avatar.png" alt="Avatar" />
                                </div>
                                <div className="inicio-publicacion-contenido">
                                    <h3>Destacado de la comunidad</h3>
                                    <p>Compartí tus construcciones y mostrá lo que podés crear.</p>
                                    <span className="inicio-publicacion-autor">Comunidad Wiki-Craft</span>
                                    <EnlaceInicio to="/comunidad" className="inicio-enlace">
                                        Ver publicaciones <i className="bi bi-arrow-right ms-2"></i>
                                    </EnlaceInicio>
                                </div>
                            </article>
                        </div>

                        <div className="col-12 col-lg-7">
                            <ConstruccionesInicio construcciones={construcciones} />
                        </div>
                    </section>

                    <section className="inicio-tienda">
                        <div>
                            <span className="inicio-categoria">TIENDA WIKI-CRAFT</span>
                            <h2>Equipate para tu próxima aventura</h2>
                            <p>Explorá los productos disponibles en nuestra tienda oficial.</p>
                        </div>
                        <EnlaceInicio to="/tienda" className="btn inicio-btn-principal">
                            Explorar la tienda <i className="bi bi-arrow-right ms-2"></i>
                        </EnlaceInicio>
                    </section>
                </div>

                {esAdminAutorizado && (
                    <BotonAdmin
                        activo={editando}
                        alAlternar={() => {
                            setModoAdmin((actual) => !actual);
                            setModal(null);
                        }}
                        aviso="Administrá secciones, novedades y construcciones del inicio."
                    />
                )}

                {modal && editando && (
                    <ModalAdminInicio
                        modal={modal}
                        onGuardar={guardar}
                        onCerrar={cerrarModal}
                    />
                )}
            </main>

            <Footer />
        </EdicionContext.Provider>
    );
}