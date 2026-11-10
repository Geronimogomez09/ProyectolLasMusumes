// ÍNDICE GENERAL
// 1. IMPORTACIONES Y DEPENDENCIAS
// 2. CONSTANTES Y PERSISTENCIA LOCAL
// 3. COMPONENTE PRINCIPAL: HISTORIA
// 4. ESTADOS LOCALES Y PERMISOS
// 5. EFECTOS: PROTECCIÓN DE RUTAS Y GUARDADO LOCAL
// 6. PROCESAMIENTO DE DATOS: AGRUPACIÓN Y MAPEO
// 7. CÁLCULO DE POSICIÓN ACTIVA
// 8. EFECTOS VISUALES: DETECCIÓN DE SCROLL (SCROLLSPY)
// 9. EFECTOS VISUALES: ANIMACIÓN DE ENTRADA SUAVE
// 10. EFECTOS VISUALES: CÁLCULO DE BARRA DE PROGRESO
// 11. FUNCIONES DE INTERACCIÓN: MODALES Y EDICIÓN
// 12. INTERFAZ VISUAL (JSX): ESTRUCTURA PRINCIPAL Y PORTADA
// 13. INTERFAZ VISUAL: BARRA LATERAL Y LÍNEA DE TIEMPO
// 14. INTERFAZ VISUAL: MODO ADMINISTRADOR Y VENTANAS FLOTANTES

// 1. IMPORTACIONES Y DEPENDENCIAS

// Importamos los hooks fundamentales de React[cite: 13].
// - useState: Maneja las variables que al cambiar actualizan la interfaz[cite: 13].
// - useEffect: Ejecuta código en segundo plano, como guardar datos o escuchar el scroll[cite: 13].
// - useMemo: Memoriza cálculos pesados (como agrupar hitos) para no repetirlos innecesariamente[cite: 13].
// - useRef: Mantiene referencias directas a elementos HTML reales en la pantalla[cite: 13].
// - useCallback: Memoriza funciones para evitar que se recreen en cada renderizado[cite: 13].
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';

// Importamos los componentes visuales compartidos de la aplicación[cite: 13].
import Header from '../components/header';
import Footer from '../components/Footer';
import BotonAdmin from '../components/botonAdmin';

// Importamos los componentes específicos de la sección de Historia[cite: 13].
import HeroHistoria from '../components/historia/HeroHistoria';
import AsideLinea from '../components/historia/AsideLinea';
import EraHistoria from '../components/historia/EraHistoria';
import ModalEvento from '../components/historia/ModalEvento';
import ModalConfirmar from '../components/historia/ModalConfirmar';

// Importamos utilidades y datos iniciales predefinidos[cite: 13].
import { porFecha, desplazarA } from '../components/historia/ayudasHistoria';
import { ERAS, EVENTOS_INICIALES } from '../data/historiaData';
import {
    COLECCIONES,
    crearDocumento,
    eliminarDocumento,
    escucharDocumentos,
    inicializarDocumentosSiVacia,
    reemplazarDocumentos,
} from '../services/firestore';

// Importamos el contexto de autenticación para verificar permisos de usuario[cite: 13].
import { useAuth } from '../context/AuthContext';
import { tienePermiso } from '../utils/permisos';

// Importamos las hojas de estilo[cite: 13].
import '../styles/index.css';    
import '../styles/historia.css'; 

// 2. CONSTANTES Y PERSISTENCIA LOCAL

// Definimos la clave exacta bajo la cual se guardarán los hitos en el navegador del usuario[cite: 13].
const CLAVE_GUARDADO = 'historia-minecraft-v1';

// Propósito: Leer el almacenamiento local (localStorage) del navegador al entrar a la página[cite: 13].
// Si existen datos previos y son válidos, los devuelve para inicializar el estado[cite: 13].
// Si hay algún error o no hay datos, devuelve null[cite: 13].
function leerGuardado() {
    try {
        const crudo = window.localStorage.getItem(CLAVE_GUARDADO);
        const datos = crudo ? JSON.parse(crudo) : null;
        return Array.isArray(datos) && datos.length ? datos : null;
    } catch {
        return null;
    }
}

// 3. COMPONENTE PRINCIPAL: HISTORIA

// Define la estructura central de la línea de tiempo interactiva[cite: 13].
function Historia({ eventos: eventosProp }) {
    
    // 4. ESTADOS LOCALES Y PERMISOS
    
    // Inicializa la lista de eventos con una jerarquía de prioridades:
    // 1. Propiedades recibidas (eventosProp), 2. Datos locales (leerGuardado), 3. Datos duros (EVENTOS_INICIALES)[cite: 13].
    const [eventos, setEventos] = useState(() => eventosProp || leerGuardado() || EVENTOS_INICIALES);
    const [errorPersistencia, setErrorPersistencia] = useState('');
    const inicializacionEnCursoRef = useRef(false);
    
    // Obtiene el perfil del usuario activo para evaluar sus capacidades[cite: 13].
    const { perfil } = useAuth();
    
    // Verifica si la cuenta tiene el permiso explícito 'historia'[cite: 13].
    const puedeAdministrar = tienePermiso(perfil, 'historia');
    
    // Controla si el usuario decidió desplegar las herramientas de edición[cite: 13].
    const [modoAdminAbierto, setModoAdmin] = useState(false);
    
    // Combina el estado visual con el permiso real para evitar vulnerabilidades visuales[cite: 13].
    const modoAdmin = modoAdminAbierto && puedeAdministrar;

    // Controla qué ventana modal está abierta (ej: 'form' para editar, 'borrar' para eliminar)[cite: 13].
    const [modal, setModal] = useState(null);
    
    // Diccionario que guarda qué hitos tienen su texto de detalle desplegado[cite: 13].
    const [abiertos, setAbiertos] = useState({});
    
    // Rastrea en qué parte exacta de la página se encuentra el usuario al hacer scroll[cite: 13].
    const [zona, setZona] = useState({ era: null, evento: null });

    // Referencias directas a contenedores HTML para cálculos matemáticos de scroll[cite: 13].
    const raizRef = useRef(null);
    const lineaRef = useRef(null);
    const pctRef = useRef(null);
    
    // Memoriza la función de cierre para no recrearla innecesariamente en la memoria[cite: 13].
    const cerrarModal = useCallback(() => setModal(null), []);

    // 5. EFECTOS: PROTECCIÓN DE RUTAS Y SINCRONIZACIÓN CON FIREBASE

    // Efecto de seguridad: Si mientras está navegando el usuario pierde el permiso, 
    // se le cierra forzosamente el modo administrador y cualquier modal abierto[cite: 13].
    useEffect(() => {
        if (!puedeAdministrar) {
            setModoAdmin(false);
            setModal(null);
        }
    }, [puedeAdministrar]);

    useEffect(() => {
        if (eventosProp) return undefined;

        return escucharDocumentos(
            COLECCIONES.historia,
            (documentos) => {
                if (documentos.length === 0) {
                    setEventos(leerGuardado() || EVENTOS_INICIALES);

                    if (puedeAdministrar && !inicializacionEnCursoRef.current) {
                        inicializacionEnCursoRef.current = true;
                        inicializarDocumentosSiVacia(
                            COLECCIONES.historia,
                            leerGuardado() || EVENTOS_INICIALES
                        ).catch((error) => {
                            console.error('No se pudo inicializar la historia en Firestore:', error);
                            setErrorPersistencia('No se pudieron inicializar los hitos en Firebase.');
                        });
                    }
                    return;
                }

                setErrorPersistencia('');
                setEventos(documentos.map((evento) => {
                    const idNumerico = Number(evento.id);
                    return {
                        ...evento,
                        id: Number.isSafeInteger(idNumerico) ? idNumerico : evento.id,
                    };
                }));
            },
            {},
            (error) => {
                console.error('No se pudieron cargar los hitos desde Firestore:', error);
                setErrorPersistencia('No se pudo cargar la historia desde Firebase.');
            }
        );
    }, [eventosProp, puedeAdministrar]);

    // Guarda una copia local para conservar la historia visible si Firebase no está disponible.
    useEffect(() => {
        try { window.localStorage.setItem(CLAVE_GUARDADO, JSON.stringify(eventos)); } catch { /* sin storage */ }
    }, [eventos]);

    // 6. PROCESAMIENTO DE DATOS: AGRUPACIÓN Y MAPEO

    // useMemo organiza los eventos crudos distribuyéndolos dentro de sus "Eras" correspondientes[cite: 13].
    // Si el usuario no es administrador, oculta completamente las Eras que no tengan eventos[cite: 13].
    const grupos = useMemo(
        () =>
            ERAS.map((era) => ({ era, eventos: eventos.filter((e) => e.era === era.id).sort(porFecha) }))
                .filter((g) => modoAdmin || g.eventos.length > 0),
        [eventos, modoAdmin]
    );
    
    // Crea una lista plana (sin subdivisiones por Era) de todos los eventos ordenados[cite: 13].
    const planos = useMemo(() => grupos.flatMap((g) => g.eventos), [grupos]);
    
    // Crea un Mapa de JavaScript para buscar instantáneamente la posición (índice) de cualquier evento mediante su ID[cite: 13].
    const indicePorId = useMemo(() => new Map(planos.map((e, i) => [e.id, i])), [planos]);

    // 7. CÁLCULO DE POSICIÓN ACTIVA

    // Determina matemáticamente en qué punto del progreso general se encuentra el usuario[cite: 13].
    let indiceActivo = -1;
    if (zona.evento != null) {
        // Si hay un evento en foco, busca su índice exacto[cite: 13].
        indiceActivo = planos.findIndex((e) => e.id === zona.evento);
    } else if (zona.era) {
        // Si está en el título de una Era, calcula una posición intermedia (-0.5) antes del primer evento[cite: 13].
        const primero = planos.findIndex((e) => e.era === zona.era);
        indiceActivo = primero >= 0 ? primero - 0.5 : -1;
    }

    // 8. EFECTOS VISUALES: DETECCIÓN DE SCROLL (SCROLLSPY)

    // Efecto que utiliza IntersectionObserver para saber exactamente qué bloque 
    // está pasando por el centro de la pantalla del usuario[cite: 13].
    useEffect(() => {
        const linea = lineaRef.current;
        if (!linea || !('IntersectionObserver' in window)) return undefined;
        
        // Configura el observador para dispararse solo en un margen vertical muy estrecho (zona central)[cite: 13].
        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((en) => {
                    if (!en.isIntersecting) return;
                    // Extrae los atributos de datos HTML (data-era y data-evento) del nodo visible[cite: 13].
                    const era = en.target.dataset.era;
                    const eventoDato = en.target.dataset.evento;
                    const eventoNumero = Number(eventoDato);
                    const evento = eventoDato
                        ? (Number.isSafeInteger(eventoNumero) ? eventoNumero : eventoDato)
                        : null;
                    // Actualiza el estado de la zona actual[cite: 13].
                    setZona((previa) => (previa.era === era && previa.evento === evento ? previa : { era, evento }));
                });
            },
            { rootMargin: '-38% 0px -58% 0px' }
        );
        
        // Ordena al observador vigilar todos los elementos marcados con el atributo [data-era][cite: 13].
        linea.querySelectorAll('[data-era]').forEach((n) => observador.observe(n));
        return () => observador.disconnect();
    }, [grupos]);

    // 9. EFECTOS VISUALES: ANIMACIÓN DE ENTRADA SUAVE

    // Efecto que aplica el atributo CSS "data-visible" gradualmente a los elementos 
    // a medida que el usuario baja por la página, creando una animación de aparición[cite: 13].
    useEffect(() => {
        const nodos = lineaRef.current?.querySelectorAll('.historia-revelar:not([data-visible])');
        if (!nodos || nodos.length === 0) return undefined;
        
        // Fallback de seguridad: Si el navegador es antiguo y no soporta IntersectionObserver, los hace visibles a todos[cite: 13].
        if (!('IntersectionObserver' in window)) {
            nodos.forEach((n) => n.setAttribute('data-visible', ''));
            return undefined;
        }
        
        const observador = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((en) => {
                    if (!en.isIntersecting) return;
                    en.target.setAttribute('data-visible', '');
                    // Una vez que aparece, se deja de observar para mejorar el rendimiento[cite: 13].
                    observador.unobserve(en.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
        );
        nodos.forEach((n) => observador.observe(n));
        return () => observador.disconnect();
    }, [grupos]);

    // 10. EFECTOS VISUALES: CÁLCULO DE BARRA DE PROGRESO

    // Calcula de forma hiperveloz el llenado de la barra de progreso sin depender de los ciclos lentos de React[cite: 13].
    useEffect(() => {
        const raiz = raizRef.current;
        const linea = lineaRef.current;
        if (!raiz || !linea) return undefined;
        let pendiente = false;

        // Función matemática que determina qué porcentaje de la línea de tiempo se ha cruzado[cite: 13].
        const calcular = () => {
            pendiente = false;
            const caja = linea.getBoundingClientRect();
            const ancla = window.innerHeight * 0.4;
            // Delimita el valor de progreso estrictamente entre 0 y 1[cite: 13].
            const p = Math.min(1, Math.max(0, (ancla - caja.top) / caja.height));
            // Inyecta el valor como variable CSS nativa (--progreso) directamente al nodo HTML[cite: 13].
            raiz.style.setProperty('--progreso', p.toFixed(4));
            if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`;
        };
        
        // Estrategia de optimización con requestAnimationFrame para no sobrecargar el navegador al scrollear[cite: 13].
        const alMover = () => {
            if (!pendiente) { pendiente = true; requestAnimationFrame(calcular); }
        };

        calcular();
        window.addEventListener('scroll', alMover, { passive: true });
        window.addEventListener('resize', alMover);
        return () => {
            window.removeEventListener('scroll', alMover);
            window.removeEventListener('resize', alMover);
        };
    }, [grupos]);

    // 11. FUNCIONES DE INTERACCIÓN: MODALES Y EDICIÓN

    // Alterna el diccionario de visibilidad de detalles para un evento específico[cite: 13].
    const alternarDetalle = (id) => setAbiertos((previo) => ({ ...previo, [id]: !previo[id] }));

    // Guarda un evento nuevo o actualizado en Firestore.
    async function guardarEvento(datos) {
        if (!puedeAdministrar) return;
        const { id, ...datosGuardados } = datos;
        const idGuardado = id == null
            ? await crearDocumento(COLECCIONES.historia, datosGuardados)
            : await crearDocumento(COLECCIONES.historia, datosGuardados, id);

        setErrorPersistencia('');
        setModal(null);
        setTimeout(() => desplazarA(`evento-${idGuardado}`), 150);
    }

    async function eliminarEvento(id) {
        if (!puedeAdministrar) return;
        try {
            await eliminarDocumento(COLECCIONES.historia, id);
            setErrorPersistencia('');
            setModal(null);
        } catch (error) {
            console.error('No se pudo eliminar el hito de Firestore:', error);
            setErrorPersistencia('No se pudo eliminar el hito en Firebase. Revisá tu conexión e intentá de nuevo.');
        }
    }

    async function restaurarOriginales() {
        if (!puedeAdministrar) return;
        try {
            await reemplazarDocumentos(COLECCIONES.historia, EVENTOS_INICIALES);
            setErrorPersistencia('');
            setModal(null);
        } catch (error) {
            console.error('No se pudieron restaurar los hitos originales en Firestore:', error);
            setErrorPersistencia('No se pudieron restaurar los hitos originales en Firebase.');
        }
    }

    // Pre-cálculos para la portada de presentación[cite: 13].
    const idxEraActiva = grupos.findIndex((g) => g.era.id === zona.era);
    const eraActiva = idxEraActiva >= 0 ? grupos[idxEraActiva].era : null;
    const anios = new Date().getFullYear() - 2009;

    // 12. INTERFAZ VISUAL (JSX): ESTRUCTURA PRINCIPAL Y PORTADA
    return (
        <>
            <Header />
            <div ref={raizRef} className={`inicio historia${modoAdmin ? ' inicio-modo-admin' : ''}`}>
                {errorPersistencia && <p className="inicio-campo-error" role="alert">{errorPersistencia}</p>}
                <HeroHistoria
                    anios={anios}
                    cantidadEventos={eventos.length}
                    hayEras={grupos.length > 0}
                    // Al apretar Empezar, se desliza automáticamente a la primera Era disponible[cite: 13].
                    onEmpezar={() => desplazarA(`era-${grupos[0].era.id}`, 'start')}
                />

                <div className="historia-mini" aria-hidden="true">
                    <strong>{eraActiva ? eraActiva.nombre : 'El comienzo del viaje'}</strong>
                    <div className="historia-aside-barra"><span /></div>
                </div>

                {/* 13. INTERFAZ VISUAL: BARRA LATERAL Y LÍNEA DE TIEMPO */}
                <div className="historia-layout">
                    
                    {/* Componente del panel lateral fijo que dibuja los puntos de navegación[cite: 13]. */}
                    <AsideLinea
                        grupos={grupos}
                        zona={zona}
                        indiceActivo={indiceActivo}
                        indicePorId={indicePorId}
                        pctRef={pctRef}
                        onIrEra={(id) => desplazarA(`era-${id}`, 'start')}
                        onIrEvento={(id) => desplazarA(`evento-${id}`, 'center')}
                    />

                    {/* Contenedor principal donde se inyectan dinámicamente los bloques de las Eras[cite: 13]. */}
                    <main className="historia-linea" ref={lineaRef}>
                        {grupos.length === 0 && (
                            <p className="inicio-vacio">
                                Todavía no hay hitos. Activá el modo administrador para agregar el primero.
                            </p>
                        )}

                        {grupos.map((g, gi) => (
                            <EraHistoria
                                key={g.era.id}
                                grupo={g}
                                numero={gi + 1}
                                indicePorId={indicePorId}
                                indiceActivo={indiceActivo}
                                abiertos={abiertos}
                                modoAdmin={modoAdmin}
                                onToggle={alternarDetalle}
                                onEditar={(e) => setModal({ tipo: 'form', evento: e })}
                                onEliminar={(e) => setModal({ tipo: 'borrar', evento: e })}
                                onAgregar={(eraId) => setModal({ tipo: 'form', evento: null, era: eraId })}
                            />
                        ))}
                    </main>
                </div>

                {/* 14. INTERFAZ VISUAL: MODO ADMINISTRADOR Y VENTANAS FLOTANTES */}
                {puedeAdministrar && (
                    <BotonAdmin
                        permiso="historia"
                        activo={modoAdmin}
                        alAlternar={() => setModoAdmin((v) => !v)}
                        aviso="Editá, agregá o eliminá hitos."
                    >
                        <button
                            type="button"
                            className="boton-admin-toggle"
                            onClick={() => setModal({ tipo: 'restaurar' })}
                        >
                            Restaurar originales
                        </button>
                    </BotonAdmin>
                )}

                {/* Operador de encadenamiento opcional para renderizar modales con seguridad[cite: 13]. */}
                {modal?.tipo === 'form' && (
                    <ModalEvento
                        inicial={modal.evento}
                        eraInicial={modal.era}
                        onGuardar={guardarEvento}
                        onCerrar={cerrarModal}
                    />
                )}
                {modal?.tipo === 'borrar' && (
                    <ModalConfirmar
                        titulo="Eliminar hito"
                        texto={`¿Estás seguro de que querés eliminar «${modal.evento.titulo}»? Esta acción no se puede deshacer.`}
                        textoBoton="Eliminar"
                        error={errorPersistencia}
                        onConfirmar={() => eliminarEvento(modal.evento.id)}
                        onCerrar={cerrarModal}
                    />
                )}
                {modal?.tipo === 'restaurar' && (
                    <ModalConfirmar
                        titulo="Restaurar originales"
                        texto="Se van a perder los cambios que hiciste y la línea de tiempo vuelve a los hitos originales."
                        textoBoton="Restaurar"
                        error={errorPersistencia}
                        onConfirmar={restaurarOriginales}
                        onCerrar={cerrarModal}
                    />
                )}
            </div>
            <Footer />
        </>
    );
}

export default Historia;