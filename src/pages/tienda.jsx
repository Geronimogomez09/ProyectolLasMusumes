
import { useEffect, useMemo, useState } from "react";

import Header from '../components/header';
import Footer from "../components/Footer";
import TarjetaProducto from "../components/tiendaComponentes/TarjetaProducto";
import ControlesTienda from "../components/tiendaComponentes/ControlesTienda";
import CategoriasTienda from "../components/tiendaComponentes/CategoriasTienda";
import AdministrarProductos from "../components/tiendaComponentes/AdministrarProductos";
import Carrito from "../components/tiendaComponentes/Carrito";
import BotonAdmin from '../components/botonAdmin';
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";
import DetalleProducto from "../components/tiendaComponentes/DetalleProducto";

import {
    productosIniciales,
    normalizarCategoriaProducto
} from "../data/productos";
import {
    crearProducto,
    actualizarProducto,
    eliminarProducto as eliminarProductoFirebase,
    escucharProductos,
    crearHero,
    actualizarHero,
    eliminarHero,
    escucharHeroes,
    inicializarTiendaSiVacia,
    guardarProductosPredeterminadosActuales,
    restaurarProductosPredeterminados
} from "../services/firestore"

import "../styles/tienda.css";

// Contenido inicial del carrusel; Firestore puede reemplazar estos valores en ejecución.
const slidesBanner = [
    {
        subtitulo: "NUEVA COLECCIÓN",
        titulo: "EDICIÓN ABEJA",
        descripcion: "Descubrí prendas inspiradas en el mundo de Minecraft.",
        boton: "VER PRODUCTOS",
        imagen: "/fondos/banner-coleccion-abeja.png"
    },
    {
        subtitulo: "ESTILO Y AVENTURA",
        titulo: "COLECCIÓN OSCURA",
        descripcion: "Explorá la nueva colección inspirada en Minecraft.",
        boton: "VER PRODUCTOS",
        imagen: "/fondos/banner-coleccion-oscura.png"
    },
    {
        subtitulo: "NUEVO LANZAMIENTO",
        titulo: "COLECCIÓN DIAMANTE",
        descripcion: "Prendas con detalles inspirados en los bloques del juego.",
        boton: "COMPRAR AHORA",
        imagen: "/fondos/banner-coleccion-diamante.png"
    }
];

// Normaliza una ruta local o una URL para mostrarla en el formulario de administración.
function imagenComoUrl(imagen) {
    return imagen ? new URL(imagen, window.location.origin).href : "";
}

function BannerTienda({ irProductos, abrirProducto, slidesBanner, productos }) {
    // Las copias del primer y último banner permiten simular un carrusel infinito.
    const [slideActual, setSlideActual] = useState(1);
    const [transicionActiva, setTransicionActiva] = useState(true);
    const slidesCarrusel = [
        slidesBanner[slidesBanner.length - 1],
        ...slidesBanner,
        slidesBanner[0]
    ];

    // Avanza automáticamente y limpia el temporizador al desmontar el carrusel.
    // Si cambia la sesión y se pierde el permiso, se cierra el panel de administración.
    useEffect(() => {
        const interval = setInterval(() => {
            setSlideActual((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Reactiva la animación después de reubicar el índice entre copias y banners reales.
    // Escucha actualizaciones de Firestore e inicializa datos si la tienda está vacía.
    useEffect(() => {
        if (transicionActiva) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransicionActiva(true));
        });

        return () => cancelAnimationFrame(frame);
    }, [transicionActiva]);

    // Recoloca el índice al llegar a uno de los extremos clonados del carrusel.
    // Sincroniza el producto de detalle con el hash para soportar enlaces e historial del navegador.
    useEffect(() => {
        if (slideActual !== 0 && slideActual !== slidesBanner.length + 1) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            setTransicionActiva(false);
            setSlideActual(slideActual === 0 ? slidesBanner.length : 1);
        }, 1600);

        return () => clearTimeout(timeout);
    }, [slideActual, slidesBanner.length]);

    function moverSlide(direccion) {
        // Limita el movimiento al intervalo que incluye las copias de ambos extremos.
        setSlideActual((actual) =>
            Math.min(slidesBanner.length + 1, Math.max(0, actual + direccion))
        );
    }

    function finalizarTransicion(event) {
        // Solo procesa el fin de transición de la pista, no el de elementos internos.
        if (event.target !== event.currentTarget) {
            return;
        }

        if (slideActual === 0 || slideActual === slidesBanner.length + 1) {
            setTransicionActiva(false);
            setSlideActual(slideActual === 0 ? slidesBanner.length : 1);
        }
    }

    return (
        <section className="banner">
            <button
                className="carrusel-flecha flecha-izq"
                onClick={() => moverSlide(-1)}
                type="button"
                aria-label="Ver banner anterior"
            >
                &#10094;
            </button>

            <div
                className={`banner-pista ${transicionActiva ? "" : "sin-transicion"}`}
                style={{
                    "--cantidad-slides": slidesCarrusel.length,
                    transform: `translateX(-${(slideActual / slidesCarrusel.length) * 100}%)`
                }}
                onTransitionEnd={finalizarTransicion}
            >
                {slidesCarrusel.map((slide, indice) => (
                    <div className="banner-contenido" key={`${slide.titulo}-${indice}`}>
                        <div className="banner-text">
                            <small>{slide.subtitulo}</small>
                            <h1>{slide.titulo}</h1>
                            <p>{slide.descripcion}</p>
                            <button
                                className="banner-btn"
                                onClick={() => {
                                    const destino = productos.find(
                                        (producto) =>
                                            String(producto.id) === String(slide.productoId)
                                    );

                                    if (destino) {
                                        abrirProducto(destino.id);
                                    } else {
                                        irProductos();
                                    }
                                }}
                                type="button"
                            >
                                {slide.boton}
                            </button>
                        </div>

                        <div className="banner-imagen-container">
                            <img
                                src={slide.imagen}
                                alt={slide.titulo}
                                className="banner-img"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="carrusel-flecha flecha-der"
                onClick={() => moverSlide(1)}
                type="button"
                aria-label="Ver banner siguiente"
            >
                &#10095;
            </button>

            <div className="franja-verde-pixel">
                <div className="pixeles-decoracion">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </section>
    );
}

function AdministrarBanners({
    banners,
    agregarBanner,
    modificarBanner,
    eliminarBanner,
    productos
}) {
    // Estructura inicial compartida por el formulario de creación y edición.
    const formularioInicial = {
        subtitulo: "",
        titulo: "",
        descripcion: "",
        boton: "",
        imagen: "",
        productoId: ""
    };

    const [form, setForm] = useState(formularioInicial);
    const [bannerEditando, setBannerEditando] = useState(null);
    const [busquedaProducto, setBusquedaProducto] = useState("");
    const [guardando, setGuardando] = useState(false);

    // Productos que coinciden con el texto ingresado para elegir destino del banner.
    const productosCoincidentes = productos.filter((producto) =>
        (producto.nombre || "")
            .toLocaleLowerCase("es")
            .includes(busquedaProducto.trim().toLocaleLowerCase("es"))
    );

    const productoSeleccionado = productos.find(
        (producto) => String(producto.id) === String(form.productoId)
    );

    // Actualiza el dato cuyo atributo name coincide con la clave del formulario.
    function cambiarCampo(event) {
        const { name, value } = event.target;
        setForm((actual) => ({ ...actual, [name]: value }));
    }

    async function guardarBanner(event) {
        event.preventDefault();
        setGuardando(true);

        try {
            // Persiste el producto asociado con un identificador de tipo texto.
            const datos = {
                ...form,
                productoId: form.productoId ? String(form.productoId) : ""
            };

            if (bannerEditando === null) {
                await agregarBanner(datos);
                window.alert("Hero agregado correctamente.");
            } else {
                await modificarBanner(bannerEditando, datos);
                window.alert("Hero modificado correctamente.");
            }

            setForm(formularioInicial);
            setBannerEditando(null);
            setBusquedaProducto("");
        } catch (error) {
            console.error("Error al guardar Hero:", error);
            window.alert(error.message || "No se pudo guardar el Hero.");
        } finally {
            setGuardando(false);
        }
    }

    function editarBanner(banner) {
        // Recupera el nombre del producto elegido para completar el buscador al editar.
        const destino = productos.find(
            (producto) => String(producto.id) === String(banner.productoId)
        );

        setForm({
            ...formularioInicial,
            ...banner,
            imagen: imagenComoUrl(banner.imagen)
        });
        setBannerEditando(banner.id);
        setBusquedaProducto(destino?.nombre ?? "");
    }

    async function borrarBanner(banner) {
        // La tienda debe conservar al menos un banner visible en la portada.
        if (banners.length <= 1) {
            window.alert("Debe quedar al menos un banner en la tienda.");
            return;
        }

        const confirmar = window.confirm(
            `¿Querés eliminar el banner "${banner.titulo}"? Esta acción no se puede deshacer.`
        );
        if (!confirmar) return;

        try {
            await eliminarBanner(banner.id);
            if (bannerEditando === banner.id) {
                setForm(formularioInicial);
                setBannerEditando(null);
                setBusquedaProducto("");
            }
        } catch (error) {
            console.error("Error al eliminar Hero:", error);
            window.alert(error.message || "No se pudo eliminar el Hero.");
        }
    }

    function cancelarEdicion() {
        setForm(formularioInicial);
        setBannerEditando(null);
        setBusquedaProducto("");
    }

    // La lista y el formulario se mantienen juntos para facilitar la edición de banners.
    return (
        <section className="admin-banners">
            <h2>Administrar banners</h2>
            <p>Agregá o modificá las imágenes y los textos del carrusel.</p>

            {/* Resumen de los banners guardados y botones para editar o quitar cada uno. */}
            <div className="admin-banners-lista">
                {banners.map((banner) => (
                    <article className="admin-banner-tarjeta" key={banner.id}>
                        <img src={banner.imagen} alt={banner.titulo || "Banner de tienda"} />
                        <div className="admin-banner-textos">
                            <strong>{banner.titulo || "Sin título"}</strong>
                            <span>{banner.subtitulo}</span>
                            <p>{banner.descripcion}</p>
                            <small>Botón: {banner.boton}</small>
                            <small>
                                Destino: {productos.find(
                                    (producto) => String(producto.id) === String(banner.productoId)
                                )?.nombre || "Todos los productos"}
                            </small>
                        </div>
                        <div className="admin-banner-acciones">
                            <button type="button" onClick={() => editarBanner(banner)}>
                                Modificar
                            </button>
                            <button
                                className="eliminar-btn"
                                type="button"
                                onClick={() => borrarBanner(banner)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {/* Formulario controlado para crear un banner o guardar cambios del seleccionado. */}
            <form className="admin-banner-formulario" onSubmit={guardarBanner}>
                <h3>{bannerEditando === null ? "Agregar banner" : "Modificar banner"}</h3>
                <label>
                    Título
                    <input name="titulo" value={form.titulo} onChange={cambiarCampo} required />
                </label>
                <label>
                    Subtítulo
                    <input name="subtitulo" value={form.subtitulo} onChange={cambiarCampo} required />
                </label>
                <label>
                    Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={cambiarCampo} required />
                </label>
                <label>
                    Texto del botón
                    <input name="boton" value={form.boton} onChange={cambiarCampo} required />
                </label>
                <label className="admin-banner-campo-completo">
                    URL de la imagen
                    <input
                        name="imagen"
                        type="url"
                        value={form.imagen}
                        onChange={cambiarCampo}
                        placeholder="https://ejemplo.com/banner.jpg"
                        pattern="https?://.+"
                        required
                    />
                </label>
                <div className="admin-banner-producto admin-banner-campo-completo">
                    <label htmlFor="banner-buscar-producto">
                        Producto al que llevará el botón
                    </label>
                    <input
                        id="banner-buscar-producto"
                        type="search"
                        value={busquedaProducto}
                        onChange={(event) => {
                            setBusquedaProducto(event.target.value);
                            setForm((actual) => ({ ...actual, productoId: "" }));
                        }}
                        placeholder="Buscar producto por nombre"
                        aria-controls="banner-productos-coincidentes"
                    />
                    {productoSeleccionado && (
                        <p className="admin-banner-producto-seleccionado">
                            Seleccionado: {productoSeleccionado.nombre}
                        </p>
                    )}
                    {/* Opciones de producto para vincular el botón del banner con un destino. */}
                    {busquedaProducto.trim() && !productoSeleccionado && (
                        <div
                            className="admin-banner-producto-resultados"
                            id="banner-productos-coincidentes"
                            role="listbox"
                        >
                            {productosCoincidentes.length > 0 ? (
                                productosCoincidentes.map((producto) => (
                                    <button
                                        key={producto.id}
                                        type="button"
                                        role="option"
                                        aria-selected="false"
                                        onClick={() => {
                                            setForm((actual) => ({
                                                ...actual,
                                                productoId: String(producto.id)
                                            }));
                                            setBusquedaProducto(producto.nombre);
                                        }}
                                    >
                                        {producto.imagen && <img src={producto.imagen} alt="" />}
                                        <span>{producto.nombre}</span>
                                    </button>
                                ))
                            ) : (
                                <p>No se encontraron productos.</p>
                            )}
                        </div>
                    )}
                    {productoSeleccionado && (
                        <button
                            className="admin-banner-producto-quitar"
                            type="button"
                            onClick={() => {
                                setForm((actual) => ({ ...actual, productoId: "" }));
                                setBusquedaProducto("");
                            }}
                        >
                            Quitar producto seleccionado
                        </button>
                    )}
                </div>
                {/* La vista previa permite revisar la URL antes de guardar el banner. */}
                {form.imagen && (
                    <img className="admin-banner-vista-previa" src={form.imagen} alt="Vista previa del banner" />
                )}
                <div className="admin-banner-form-acciones">
                    <button className="agregar-producto-btn" type="submit" disabled={guardando}>
                        {guardando ? "Guardando..." : bannerEditando === null ? "Agregar banner" : "Guardar cambios"}
                    </button>
                    {bannerEditando !== null && (
                        <button type="button" onClick={cancelarEdicion} disabled={guardando}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

// Lee los productos locales para usarlos como valores iniciales al migrar la tienda.
function cargarProductos() {

    const guardados =
        localStorage.getItem(
            "productosTienda"
        );


    if (guardados) {

        let productosGuardados = [];
        try {
            productosGuardados = JSON.parse(guardados);
        } catch (error) {
            console.error("No se pudieron leer los productos locales:", error);
        }

        const remeraInicial = productosIniciales.find(
            (producto) => String(producto.id) === "1"
        );

        // Completa la imagen histórica de la remera cuando un guardado antiguo no la tenía.
        return productosGuardados.map((producto) => {
            if (
                remeraInicial
                && String(producto.id) === String(remeraInicial.id)
                && !Array.isArray(producto.imagenes)
                && !producto.imagen
            ) {
                return {
                    ...producto,
                    imagen: remeraInicial.imagen,
                    imagenes: remeraInicial.imagenes
                };
            }

            return producto;
        });

    }


    return productosIniciales;
}

// Carga los banners locales y completa los que falten durante la migración inicial.
function cargarBanners() {
    const guardados = localStorage.getItem("bannersTienda");
    const migracionRealizada = localStorage.getItem("bannersTiendaDefaultsRestaurados");

    if (!guardados) {
        localStorage.setItem("bannersTiendaDefaultsRestaurados", "true");
        return slidesBanner;
    }

    let bannersGuardados = [];
    try {
        bannersGuardados = JSON.parse(guardados);
    } catch (error) {
        console.error("No se pudieron leer los banners locales:", error);
    }

    if (migracionRealizada === "true") {
        return bannersGuardados;
    }

    const bannersCompletos = [...bannersGuardados];

    slidesBanner.forEach((bannerPredeterminado) => {
        const yaExiste = bannersCompletos.some(
            (banner) => banner.imagen === bannerPredeterminado.imagen
        );

        if (!yaExiste) {
            bannersCompletos.push(bannerPredeterminado);
        }
    });

    localStorage.setItem("bannersTienda", JSON.stringify(bannersCompletos));
    localStorage.setItem("bannersTiendaDefaultsRestaurados", "true");
    return bannersCompletos;
}

export default function Tienda() {

    // El permiso define el acceso al panel y a las operaciones administrativas.
    const { perfil } = useAuth();
    const puedeAdministrar = tienePermiso(perfil, "tienda");

    const [productos, setProductos] = useState([]);
    const [banners, setBanners] = useState([]);
    const [restaurandoTienda, setRestaurandoTienda] = useState(false);

    const [administradorAbierto, setAdministradorAbierto] =
        useState(false);

    useEffect(() => {
        if (!puedeAdministrar) setAdministradorAbierto(false);
    }, [puedeAdministrar]);

    const modoAdmin = administradorAbierto && puedeAdministrar;

    // Estado compartido entre catálogo, detalle, búsqueda, filtros y carrito.
    const [carrito, setCarrito] =
        useState([]);


    const [busqueda, setBusqueda] =
        useState("");


    const [categoriaActiva, setCategoriaActiva] =
        useState("Todas");


    const [carritoAbierto, setCarritoAbierto] =
        useState(false);


    const [productoDetalleId, setProductoDetalleId] =
        useState(null);


    // Firebase es la fuente principal de productos y banners.
    // Los datos locales/iniciales se migran solamente si Firestore está vacío.
    useEffect(() => {
        const cancelarProductos = escucharProductos(
            setProductos,
            (error) => console.error("Error al escuchar productos:", error)
        );
        const cancelarHeroes = escucharHeroes(
            setBanners,
            (error) => console.error("Error al escuchar banners:", error)
        );

        if (puedeAdministrar) {
            inicializarTiendaSiVacia(cargarProductos(), cargarBanners()).catch((error) => {
                console.error("Error al inicializar la tienda en Firestore:", error);
            });
        }

        return () => {
            cancelarProductos();
            cancelarHeroes();
        };
    }, [puedeAdministrar]);


    /*
    ==========================================
    DETECTAR PRODUCTO DE LA URL
    ==========================================
    */

    useEffect(() => {

        function leerHash() {

            const hash =
                window.location.hash;


            if (
                hash.startsWith(
                    "#producto="
                )
            ) {

                const id = hash.slice("#producto=".length).trim();
                setProductoDetalleId(id || null);

            } else {

                setProductoDetalleId(null);

            }

        }


        leerHash();


        window.addEventListener(
            "hashchange",
            leerHash
        );


        return () => {

            window.removeEventListener(
                "hashchange",
                leerHash
            );

        };

    }, []);


    /*
    ==========================================
    PRODUCTO ACTUAL
    ==========================================
    */

    // Busca el registro correspondiente al identificador de producto de la URL.
    const productoDetalle =
        productos.find(
            (producto) =>
                String(producto.id) === String(productoDetalleId)
        ) || null;


    /*
    ==========================================
    FILTRAR PRODUCTOS
    ==========================================
    */

    // Lista para la grilla: excluye productos inactivos y aplica la categoría seleccionada.
    const productosFiltrados =
        useMemo(() => {

            let resultado = productos.filter(
                (producto) => producto.estado !== "inactivo"
            );


            if (
                categoriaActiva !==
                "Todas"
            ) {

                resultado =
                    resultado.filter(
                        (producto) =>
                            normalizarCategoriaProducto(producto.categoria) ===
                            categoriaActiva
                    );

            }


            return resultado;

        }, [
            productos,
            categoriaActiva
        ]);

    // Resultados rápidos del buscador, independientes del filtro de categoría activo.
    const productosEncontrados =
        useMemo(() => {
            const texto = busqueda.trim().toLocaleLowerCase("es");

            if (!texto) {
                return [];
            }

            return productos.filter((producto) =>
                producto.estado !== "inactivo" &&
                (producto.nombre || "")
                    .toLocaleLowerCase("es")
                    .includes(texto)
            );
        }, [productos, busqueda]);


    /*
    ==========================================
    ABRIR PRODUCTO
    ==========================================
    */

    // Cambia el hash y lleva la página arriba al abrir un producto.
    function abrirProducto(id) {
        const idProducto = String(id);

        window.location.hash = `producto=${idProducto}`;
        setProductoDetalleId(idProducto);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function abrirPelucheCreeper() {
        const peluche = productos.find((producto) =>
            /peluche.*creeper|creeper.*peluche/i.test(producto.nombre || "")
        );

        if (peluche) {
            abrirProducto(peluche.id);
        } else {
            irProductos();
        }
    }


    /*
    ==========================================
    VOLVER A PRODUCTOS
    ==========================================
    */

    // Limpia la URL del detalle y desplaza de vuelta al inicio del catálogo.
    function volverProductos() {

        window.location.hash = "";
        setProductoDetalleId(null);


        setTimeout(() => {

            document
                .getElementById("productos")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }, 50);

    }


    /*
    ==========================================
    AGREGAR AL CARRITO
    ==========================================
    */

    // Agrega una unidad desde una tarjeta y confirma la acción a la persona usuaria.
    function agregarCarrito(producto) {

        setCarrito(
            (actual) => [
                ...actual,
                producto
            ]
        );


         alert(
            `${producto.nombre} fue agregado al carrito.`
         );

    }


    /*
    ==========================================
    AGREGAR DESDE DETALLE
    ==========================================
    */

    // Agrega la cantidad elegida en el detalle y abre el carrito para revisarla.
    function agregarDesdeDetalle(
        producto,
        cantidad,
        talle
    ) {

        setCarrito(
            (actual) => [

                ...actual,

                ...Array.from(
                    {
                        length: cantidad
                    },
                        () => ({
                            ...producto,
                            ...(talle ? { talle } : {})
                        })
                    )

            ]
        );


        alert(
            `${producto.nombre} fue agregado al carrito.`
        );


        setCarritoAbierto(true);

    }


    /*
    ==========================================
    QUITAR DEL CARRITO
    ==========================================
    */

    // El índice permite quitar una unidad específica aunque haya productos repetidos.
    function quitarCarrito(index) {

        setCarrito(
            (actual) =>
                actual.filter(
                    (_, i) =>
                        i !== index
                )
        );

    }


    // ==========================================
    // PRODUCTOS: OPERACIONES EN FIRESTORE
    // ==========================================

    // Operaciones de productos en Firestore; cada escritura vuelve a verificar permisos.
    async function agregarProducto(nuevoProducto) {
        if (!puedeAdministrar) return;
        return crearProducto(nuevoProducto);
    }

    async function modificarProducto(id, datosActualizados) {
        if (!puedeAdministrar) return;
        return actualizarProducto(id, datosActualizados);
    }

    async function eliminarProducto(id) {
        if (!puedeAdministrar) return;

        const confirmar = window.confirm("¿Querés eliminar este producto?");
        if (!confirmar) return;

        try {
            await eliminarProductoFirebase(id);
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            window.alert(error.message || "No se pudo eliminar el producto.");
        }
    }

    // ==========================================
    // HERO: OPERACIONES EN FIRESTORE
    // ==========================================

    // Operaciones equivalentes para los banners del carrusel.
    async function agregarBanner(datos) {
        if (!puedeAdministrar) return;
        return crearHero(datos);
    }

    async function modificarBanner(id, datos) {
        if (!puedeAdministrar) return;
        return actualizarHero(id, datos);
    }

    async function borrarBanner(id) {
        if (!puedeAdministrar) return;
        return eliminarHero(id);
    }

    async function guardarProductosActuales() {
        if (!puedeAdministrar || restaurandoTienda) return;
        const confirmar = window.confirm(
            "Se reemplazará la copia predeterminada guardada por los productos que están actualmente en la tienda. ¿Continuar?"
        );
        if (!confirmar) return;

        setRestaurandoTienda(true);
        try {
            await guardarProductosPredeterminadosActuales();
            window.alert("Se guardaron los productos actuales como copia predeterminada.");
        } catch (error) {
            console.error("Error al guardar la copia de productos:", error);
            window.alert(error.message || "No se pudo guardar la copia de productos.");
        } finally {
            setRestaurandoTienda(false);
        }
    }

    async function restaurarProductosGuardados() {
        if (!puedeAdministrar || restaurandoTienda) return;
        const confirmar = window.confirm(
            "El catálogo actual será reemplazado por los productos de la copia guardada. Los cambios posteriores a esa copia se perderán. ¿Continuar?"
        );
        if (!confirmar) return;

        setRestaurandoTienda(true);
        try {
            await restaurarProductosPredeterminados();
            window.alert("Se restauró el catálogo desde la copia guardada.");
        } catch (error) {
            console.error("Error al restaurar la copia de productos:", error);
            window.alert(error.message || "No se pudo restaurar la copia de productos.");
        } finally {
            setRestaurandoTienda(false);
        }
    }


    /*
    ==========================================
    IR A PRODUCTOS
    ==========================================
    */

    // Desplazamiento reutilizado por las acciones del banner y la promoción.
    function irProductos() {

        document
            .getElementById("productos")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }


    /*
    ==========================================
    SI ESTAMOS EN DETALLE
    ==========================================
    */

    // Alterna entre el catálogo y el detalle según el producto que resolvió el hash.
    const mostrandoDetalle =
        Boolean(productoDetalle);


    return (

        <div className="tienda">

            <Header />


            {/* La búsqueda y el acceso al carrito solo aparecen en la vista del catálogo. */}
            {!mostrandoDetalle ? (

                <main className="tienda-main">


                    {/* =========================
                        CONTROLES FIJOS
                    ========================== */}

                    {/* Buscador rápido, resultados coincidentes y acceso al carrito. */}
                    <ControlesTienda
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        productosEncontrados={productosEncontrados}
                        abrirProducto={abrirProducto}
                        abrirCarrito={() =>
                            setCarritoAbierto(true)
                        }
                        cantidadCarrito={
                            carrito.length
                        }
                    />


                    {/* =========================
                        BANNER
                    ========================== */}
                    {/* Prioriza los banners de Firestore y usa los iniciales mientras cargan. */}
                    <BannerTienda
                        key={banners.length}
                        irProductos={irProductos}
                        abrirProducto={abrirProducto}
                        slidesBanner={banners.length > 0 ? banners : slidesBanner}
                        productos={productos}
                    />

                    {/* =========================
                        TITULO
                    ========================== */}

                    <div className="tienda-catalogo">
                        <div
                            className="titulo-productos"
                            id="productos"
                        >
                            TODOS LOS PRODUCTOS
                        </div>


                    {/* =========================
                        CATEGORIAS
                    ========================== */}

                        {/* El valor interno filtra; el texto mostrado puede ser distinto. */}
                        <CategoriasTienda
                            categoriaActiva={
                                categoriaActiva
                            }
                            setCategoriaActiva={
                                setCategoriaActiva
                            }
                        />


                    {/* =========================
                        PRODUCTOS
                    ========================== */}

                        {/* Grilla de productos filtrados o aviso cuando no hay coincidencias. */}
                        <section className="productos">

                        {productosFiltrados.length === 0 ? (

                            <div className="sin-productos">

                                <h2>
                                    No se encontraron productos
                                </h2>

                                <p>
                                    Probá con otra búsqueda.
                                </p>

                            </div>

                        ) : (

                            productosFiltrados.map(
                                (producto) => (

                                    <TarjetaProducto
                                        key={producto.id}
                                        producto={producto}
                                        abrirProducto={
                                            abrirProducto
                                        }
                                        agregarCarrito={
                                            agregarCarrito
                                        }
                                    />

                                )
                            )

                        )}

                        </section>

                        <section
                            className="tienda-promo"
                            aria-label="Promoción del peluche Creeper"
                        >
                            <button
                                className="tienda-promo__imagen-link"
                                type="button"
                                aria-label="Ver el producto Peluche Creeper"
                                onClick={abrirPelucheCreeper}
                            />
                            <div className="tienda-promo__contenido">
                                <h2>Peluche Creeper</h2>
                                <p>Un compañero para cada ocasión</p>
                                <button
                                    className="tienda-promo__boton"
                                    type="button"
                                    onClick={abrirPelucheCreeper}
                                >
                                    Ver peluche
                                </button>
                            </div>
                        </section>


                    {/* =========================
                        ADMINISTRADOR
                    ========================== */}

                        {/* Herramientas disponibles solo cuando la cuenta tiene permiso. */}
                        {modoAdmin && (
                            <div className="tienda-administrador">
                                <div className="acciones-productos-predeterminados">
                                    <button
                                        className="restaurar-tienda-btn"
                                        type="button"
                                        onClick={guardarProductosActuales}
                                        disabled={restaurandoTienda}
                                    >
                                        {restaurandoTienda
                                            ? "PROCESANDO..."
                                            : "GUARDAR PRODUCTOS ACTUALES"}
                                    </button>
                                    <button
                                        className="restaurar-tienda-btn restaurar-tienda-btn-secundario"
                                        type="button"
                                        onClick={restaurarProductosGuardados}
                                        disabled={restaurandoTienda}
                                    >
                                        RESTAURAR COPIA GUARDADA
                                    </button>
                                </div>
                                <AdministrarProductos
                                    productos={productos}
                                    agregarProducto={agregarProducto}
                                    modificarProducto={modificarProducto}
                                    eliminarProducto={eliminarProducto}
                                />
                                <AdministrarBanners
                                    banners={banners}
                                    agregarBanner={agregarBanner}
                                    modificarBanner={modificarBanner}
                                    eliminarBanner={borrarBanner}
                                    productos={productos}
                                />
                            </div>
                        )}

                    </div>

                </main>

            ) : (

                <main className="tienda-main tienda-main-detalle">

                    {/* El detalle comparte catálogo y acciones con la vista principal. */}
                    <DetalleProducto
                        producto={productoDetalle}
                        productos={productos}
                        carrito={carrito}
                        volverProductos={
                            volverProductos
                        }
                        agregarDesdeDetalle={
                            agregarDesdeDetalle
                        }
                        abrirProducto={
                            abrirProducto
                        }
                    />

                </main>

            )}

            <Footer />

            {!mostrandoDetalle && puedeAdministrar && (
                <BotonAdmin
                    permiso="tienda"
                    activo={modoAdmin}
                    alAlternar={() => setAdministradorAbierto((abierto) => !abierto)}
                    aviso="Los cambios se guardan en Firebase."
                />
            )}

            {/* =========================
                CARRITO
            ========================== */}

         {/* Panel del carrito y su flujo de pago, montados fuera del catálogo. */}
         <Carrito
             abierto={carritoAbierto}
             cerrarCarrito={() => setCarritoAbierto(false)}
             carrito={carrito}
             quitarCarrito={quitarCarrito}
             vaciarCarrito={() => setCarrito([])}
         />

        </div>

    );
    

}