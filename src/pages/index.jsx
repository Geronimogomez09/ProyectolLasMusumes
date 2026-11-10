import { useCallback, useEffect, useState } from "react";

import Header from "../components/header.jsx";
import Footer from "../components/Footer.jsx";
import BotonAdmin from "../components/botonAdmin";

import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";

import {
    cargarContenidoInicialInicio,
    cargarNovedadesInicio,
    eliminarContenidoInicio,
    escucharContenidoInicio,
    guardarContenidoInicio,
} from "../services/inicio";

import { EdicionContext } from "../components/inicio/EdicionInicio";
import { HERO_URL } from "../components/inicio/imagenesInicio";
import { TIPOS } from "../components/inicio/tiposInicio";
import HeroInicio from "../components/inicio/HeroInicio";
import SeccionesInicio from "../components/inicio/SeccionesInicio";
import NovedadesInicio from "../components/inicio/NovedadesInicio";
import DestacadoInicio from "../components/inicio/DestacadoInicio";
import ConstruccionesInicio from "../components/inicio/ConstruccionesInicio";
import TiendaInicio from "../components/inicio/TiendaInicio";
import ModalAdminInicio from "../components/inicio/ModalAdminInicio";

import "../styles/index.css";

// PÁGINA INICIO (pages/index.jsx): arma la portada del sitio con los componentes de
// components/inicio. Lee de Firestore las secciones y construcciones (colección "inicio"),
// calcula las novedades automáticas y maneja el modo administrador (permiso "inicio").
export default function Inicio() {
    const { perfil } = useAuth();

    // PERMISO: solo quien puede administrar "inicio" ve el botón y puede editar.
    const puedeAdministrar = tienePermiso(perfil, "inicio");

    // MODO ADMINISTRADOR: activo solo si el usuario tiene el permiso y lo encendió.
    const [modoAdminAbierto, setModoAdmin] = useState(false);
    const editando = puedeAdministrar && modoAdminAbierto;

    // CONTENIDO: secciones y construcciones que vienen de Firestore.
    const [contenido, setContenido] = useState({ secciones: [], construcciones: [] });
    const [cargandoContenido, setCargandoContenido] = useState(true);

    // NOVEDADES: tarjetas automáticas (última publicación, versión, producto y canción).
    const [novedades, setNovedades] = useState([]);
    const [cargandoNovedades, setCargandoNovedades] = useState(true);

    // MODAL: ventana de agregar, editar o eliminar (null = cerrada).
    const [modal, setModal] = useState(null);

    // MENSAJE: aviso de error o de resultado de la carga inicial.
    const [mensaje, setMensaje] = useState("");
    const [cargandoInicial, setCargandoInicial] = useState(false);

    const cerrarModal = useCallback(() => setModal(null), []);

    // ESCUCHAR CONTENIDO: se suscribe a la colección "inicio" mientras la página está abierta.
    useEffect(() => {
        const dejarDeEscuchar = escucharContenidoInicio(
            (datos) => {
                setContenido(datos);
                setCargandoContenido(false);
            },
            (error) => {
                console.error("No se pudo cargar el contenido del inicio:", error);
                setMensaje("No se pudo cargar el contenido del inicio.");
                setCargandoContenido(false);
            }
        );

        return () => dejarDeEscuchar();
    }, []);

    // CARGAR NOVEDADES: busca una sola vez la última publicación, versión, producto y canción.
    useEffect(() => {
        let cancelado = false;

        cargarNovedadesInicio().then((lista) => {
            if (cancelado) return;
            setNovedades(lista);
            setCargandoNovedades(false);
        });

        return () => {
            cancelado = true;
        };
    }, []);

    // PERDER PERMISO: si el usuario deja de administrar "inicio", se cierra la edición.
    useEffect(() => {
        if (!puedeAdministrar) {
            setModoAdmin(false);
            setModal(null);
        }
    }, [puedeAdministrar]);

    // ABRIR NUEVO: abre el modal para crear una sección o construcción.
    const abrirNuevo = (tipo) => {
        if (!puedeAdministrar) return;

        setModal({ modo: "editar", tipo, id: null, datos: TIPOS[tipo].nuevo() });
    };

    // ABRIR EDITAR: abre el modal con los datos de un elemento existente.
    const abrirEditar = (tipo, item) => {
        if (!puedeAdministrar) return;

        setModal({ modo: "editar", tipo, id: String(item.id), datos: { ...item } });
    };

    // ABRIR ELIMINAR: abre la confirmación para eliminar un elemento.
    const abrirEliminar = (tipo, item) => {
        if (!puedeAdministrar) return;

        setModal({ modo: "eliminar", tipo, id: String(item.id), datos: item });
    };

    // GUARDAR: crea o actualiza en Firestore. La lista se actualiza sola al escuchar.
    const guardar = async (tipo, id, datos) => {
        if (!puedeAdministrar) return;

        try {
            await guardarContenidoInicio(tipo, id, datos);
            setModal(null);
        } catch (error) {
            console.error("No se pudo guardar en el inicio:", error);
            setMensaje("No se pudo guardar. Revisá tu conexión y tus permisos.");
        }
    };

    // ELIMINAR: borra el elemento de Firestore.
    const eliminar = async (tipo, id) => {
        if (!puedeAdministrar) return;

        try {
            await eliminarContenidoInicio(id);
            setModal(null);
        } catch (error) {
            console.error("No se pudo eliminar del inicio:", error);
            setMensaje("No se pudo eliminar. Revisá tu conexión y tus permisos.");
            setModal(null);
        }
    };

    // CARGAR CONTENIDO INICIAL: copia las secciones y construcciones originales a Firestore
    // (sin pisar lo que ya exista). Se usa la primera vez o para recuperar las originales.
    const cargarContenidoInicial = async () => {
        if (!puedeAdministrar || cargandoInicial) return;

        const confirmar = window.confirm(
            "Se van a agregar las secciones y construcciones originales que falten. Lo que ya existe no se modifica. ¿Continuar?"
        );

        if (!confirmar) return;

        setCargandoInicial(true);
        setMensaje("");

        try {
            const { importados, omitidos } = await cargarContenidoInicialInicio();
            setMensaje(`Carga terminada: ${importados} agregados, ${omitidos} ya existían.`);
        } catch (error) {
            console.error("No se pudo cargar el contenido inicial:", error);
            setMensaje("No se pudo cargar el contenido inicial. Revisá tus permisos.");
        } finally {
            setCargandoInicial(false);
        }
    };

    return (
        <EdicionContext.Provider
            value={{ editando, abrirNuevo, abrirEditar, abrirEliminar }}
        >
            <Header />

            <main className={`inicio ${editando ? "inicio-modo-admin" : ""}`}>
                <HeroInicio imagenFondo={HERO_URL} />

                <div className="container inicio-contenido">

                    {/* Avisos de error o de resultado. */}
                    {mensaje && (
                        <p className="inicio-campo-error" role="alert">
                            {mensaje}
                        </p>
                    )}

                    {/* Aviso para el admin cuando todavía no hay nada guardado. */}
                    {editando && !cargandoContenido && contenido.secciones.length === 0 && (
                        <p className="inicio-vacio">
                            Todavía no hay secciones guardadas. Usá «Cargar contenido inicial» o agregá una.
                        </p>
                    )}

                    <SeccionesInicio secciones={contenido.secciones} />

                    <NovedadesInicio novedades={novedades} cargando={cargandoNovedades} />

                    <section className="row g-3 inicio-inferior">
                        <div className="col-12 col-lg-5">
                            <DestacadoInicio />
                        </div>

                        <div className="col-12 col-lg-7">
                            <ConstruccionesInicio construcciones={contenido.construcciones} />
                        </div>
                    </section>

                    <TiendaInicio />
                </div>

                {/* Botón "Modo administrador" (solo con permiso "inicio"). */}
                {puedeAdministrar && (
                    <BotonAdmin
                        permiso="inicio"
                        activo={editando}
                        alAlternar={() => {
                            setModoAdmin((actual) => !actual);
                            setModal(null);
                        }}
                        aviso="Editá, agregá o eliminá secciones y construcciones del inicio."
                    >
                        <button
                            type="button"
                            className="boton-admin-toggle"
                            onClick={cargarContenidoInicial}
                            disabled={cargandoInicial}
                        >
                            {cargandoInicial ? "Cargando..." : "Cargar contenido inicial"}
                        </button>
                    </BotonAdmin>
                )}

                {modal && editando && (
                    <ModalAdminInicio
                        key={`${modal.modo}-${modal.tipo}-${modal.id ?? "nuevo"}`}
                        modal={modal}
                        onGuardar={guardar}
                        onEliminar={eliminar}
                        onCerrar={cerrarModal}
                    />
                )}
            </main>

            <Footer />
        </EdicionContext.Provider>
    );
}
