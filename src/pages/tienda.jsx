import { useEffect, useMemo, useState } from "react";

import Header from '../components/header';
import Footer from "../components/Footer";
import TarjetaProducto from "../components/tiendaComponentes/TarjetaProducto";
import ControlesTienda from "../components/tiendaComponentes/ControlesTienda";
import CategoriasTienda from "../components/tiendaComponentes/CategoriasTienda";
import AdministrarProductos from "../components/tiendaComponentes/AdministrarProductos";
import Carrito from "../components/tiendaComponentes/Carrito";
import BotonAdmin from '../components/botonAdmin';
import DetalleProducto from "../components/tiendaComponentes/DetalleProducto";

import { productosIniciales } from "../data/productos";

import "../styles/tienda.css";

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

function BannerTienda({ irProductos, abrirProducto, slidesBanner, productos }) {
    const [slideActual, setSlideActual] = useState(1);
    const [transicionActiva, setTransicionActiva] = useState(true);
    const slidesCarrusel = [
        slidesBanner[slidesBanner.length - 1],
        ...slidesBanner,
        slidesBanner[0]
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setSlideActual((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (transicionActiva) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransicionActiva(true));
        });

        return () => cancelAnimationFrame(frame);
    }, [transicionActiva]);

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
        setSlideActual((actual) =>
            Math.min(slidesBanner.length + 1, Math.max(0, actual + direccion))
        );
    }

    function finalizarTransicion(event) {
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
                                            Number(producto.id) === Number(slide.productoId)
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

function AdministrarBanners({ banners, setBanners, productos }) {
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

    const productosCoincidentes = productos.filter((producto) =>
        producto.nombre
            .toLocaleLowerCase("es")
            .includes(busquedaProducto.trim().toLocaleLowerCase("es"))
    );
    const productoSeleccionado = productos.find(
        (producto) => Number(producto.id) === Number(form.productoId)
    );

    function cambiarCampo(event) {
        const { name, value } = event.target;
        setForm((actual) => ({ ...actual, [name]: value }));
    }

    function guardarBanner(event) {
        event.preventDefault();

        if (bannerEditando === null) {
            setBanners((actuales) => [...actuales, form]);
        } else {
            setBanners((actuales) =>
                actuales.map((banner, indice) =>
                    indice === bannerEditando ? form : banner
                )
            );
        }

        setForm(formularioInicial);
        setBannerEditando(null);
        setBusquedaProducto("");
    }

    function editarBanner(indice) {
        const banner = banners[indice];
        const destino = productos.find(
            (producto) => Number(producto.id) === Number(banner.productoId)
        );

        setForm({ ...formularioInicial, ...banner });
        setBannerEditando(indice);
        setBusquedaProducto(destino?.nombre ?? "");
    }

    function eliminarBanner(indice) {
        if (banners.length <= 1) {
            window.alert("Debe quedar al menos un banner en la tienda.");
            return;
        }

        const confirmar = window.confirm(
            `¿Querés eliminar el banner "${banners[indice].titulo}"? Esta acción no se puede deshacer.`
        );

        if (!confirmar) {
            return;
        }

        setBanners((actuales) =>
            actuales.filter((_, posicion) => posicion !== indice)
        );

        if (bannerEditando === indice) {
            setForm(formularioInicial);
            setBannerEditando(null);
        } else if (bannerEditando !== null && bannerEditando > indice) {
            setBannerEditando((actual) => actual - 1);
        }
    }

    return (
        <section className="admin-banners">
            <h2>Administrar banners</h2>
            <p>Agregá o modificá las imágenes y los textos del carrusel.</p>

            <div className="admin-banners-lista">
                {banners.map((banner, indice) => (
                    <article className="admin-banner-tarjeta" key={`${banner.titulo}-${indice}`}>
                        <img src={banner.imagen} alt={banner.titulo} />
                        <div className="admin-banner-textos">
                            <strong>{banner.titulo || "Sin título"}</strong>
                            <span>{banner.subtitulo}</span>
                            <p>{banner.descripcion}</p>
                            <small>Botón: {banner.boton}</small>
                            <small>
                                Destino: {productos.find(
                                    (producto) => Number(producto.id) === Number(banner.productoId)
                                )?.nombre || "Todos los productos"}
                            </small>
                        </div>
                        <div className="admin-banner-acciones">
                            <button type="button" onClick={() => editarBanner(indice)}>
                                Modificar
                            </button>
                            <button
                                className="eliminar-btn"
                                type="button"
                                onClick={() => eliminarBanner(indice)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </article>
                ))}
            </div>

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
                    Ruta de la imagen
                    <input
                        name="imagen"
                        value={form.imagen}
                        onChange={cambiarCampo}
                        placeholder="/fondos/mi-banner.png"
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
                                                productoId: producto.id
                                            }));
                                            setBusquedaProducto(producto.nombre);
                                        }}
                                    >
                                        {producto.imagen && (
                                            <img src={producto.imagen} alt="" />
                                        )}
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
                {form.imagen && (
                    <img className="admin-banner-vista-previa" src={form.imagen} alt="Vista previa del banner" />
                )}
                <div className="admin-banner-form-acciones">
                    <button className="agregar-producto-btn" type="submit">
                        {bannerEditando === null ? "Agregar banner" : "Guardar cambios"}
                    </button>
                    {bannerEditando !== null && (
                        <button
                            type="button"
                            onClick={() => {
                                setForm(formularioInicial);
                                setBannerEditando(null);
                                setBusquedaProducto("");
                            }}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

function cargarProductos() {

    const guardados =
        localStorage.getItem(
            "productosTienda"
        );


    if (guardados) {

        const productosGuardados = JSON.parse(guardados);
        const remeraInicial = productosIniciales.find(
            (producto) => producto.id === 1
        );

        return productosGuardados.map((producto) => {
            if (
                Number(producto.id) === Number(remeraInicial.id)
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

function cargarBanners() {
    const guardados = localStorage.getItem("bannersTienda");
    const migracionRealizada = localStorage.getItem("bannersTiendaDefaultsRestaurados");

    if (!guardados) {
        localStorage.setItem("bannersTiendaDefaultsRestaurados", "true");
        return slidesBanner;
    }

    const bannersGuardados = JSON.parse(guardados);

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


    const [productos, setProductos] =
        useState(cargarProductos);

    const [banners, setBanners] =
        useState(cargarBanners);

    const [administradorAbierto, setAdministradorAbierto] =
        useState(false);

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


    /*
    ==========================================
    GUARDAR PRODUCTOS
    ==========================================
    */

    useEffect(() => {

        localStorage.setItem(
            "productosTienda",
            JSON.stringify(productos)
        );

    }, [productos]);

    useEffect(() => {
        localStorage.setItem("bannersTienda", JSON.stringify(banners));
    }, [banners]);


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

                const id = Number(hash.slice("#producto=".length));

                setProductoDetalleId(
                    Number.isFinite(id) ? id : null
                );

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

    const productoDetalle =
        productos.find(
            (producto) =>
                Number(producto.id) ===
                productoDetalleId
        ) || null;


    /*
    ==========================================
    FILTRAR PRODUCTOS
    ==========================================
    */

    const productosFiltrados =
        useMemo(() => {

            let resultado =
                [...productos];


            if (
                categoriaActiva !==
                "Todas"
            ) {

                resultado =
                    resultado.filter(
                        (producto) =>
                            producto.categoria ===
                            categoriaActiva
                    );

            }


            return resultado;

        }, [
            productos,
            categoriaActiva
        ]);

    const productosEncontrados =
        useMemo(() => {
            const texto = busqueda.trim().toLocaleLowerCase("es");

            if (!texto) {
                return [];
            }

            return productos.filter((producto) =>
                producto.nombre
                    .toLocaleLowerCase("es")
                    .includes(texto)
            );
        }, [productos, busqueda]);


    /*
    ==========================================
    ABRIR PRODUCTO
    ==========================================
    */

    function abrirProducto(id) {
        const idProducto = Number(id);

        window.location.hash =
            `producto=${idProducto}`;

        setProductoDetalleId(idProducto);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /*
    ==========================================
    VOLVER A PRODUCTOS
    ==========================================
    */

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

    function agregarDesdeDetalle(
        producto,
        cantidad
    ) {

        setCarrito(
            (actual) => [

                ...actual,

                ...Array.from(
                    {
                        length: cantidad
                    },
                    () => producto
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

    function quitarCarrito(index) {

        setCarrito(
            (actual) =>
                actual.filter(
                    (_, i) =>
                        i !== index
                )
        );

    }


    /*
    ==========================================
    AGREGAR PRODUCTO
    ==========================================
    */

    function agregarProducto(
        nuevoProducto
    ) {

        setProductos(
            (actual) => [
                ...actual,
                nuevoProducto
            ]
        );

    }

    function modificarProducto(id, datosActualizados) {
        setProductos((actuales) =>
            actuales.map((producto) =>
                producto.id === id
                    ? { ...producto, ...datosActualizados }
                    : producto
            )
        );
    }


    /*
    ==========================================
    ELIMINAR PRODUCTO
    ==========================================
    */

    function eliminarProducto(id) {

        const confirmar =
            window.confirm(
                "¿Querés eliminar este producto?"
            );


        if (!confirmar) {
            return;
        }


        setProductos(
            (actual) =>
                actual.filter(
                    (producto) =>
                        producto.id !== id
                )
        );

    }


    /*
    ==========================================
    IR A PRODUCTOS
    ==========================================
    */

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

    const mostrandoDetalle =
        Boolean(productoDetalle);


    return (

        <div className="tienda">

            <Header />


            {!mostrandoDetalle ? (

                <main className="tienda-main">


                    {/* =========================
                        CONTROLES FIJOS
                    ========================== */}

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
                    <BannerTienda
                        key={banners.length}
                        irProductos={irProductos}
                        abrirProducto={abrirProducto}
                        slidesBanner={banners}
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
                            <div className="tienda-promo__contenido">
                                <h2>Peluche Creeper</h2>
                                <p>Un compañero para cada ocasión</p>
                                <button
                                    className="tienda-promo__boton"
                                    type="button"
                                    onClick={irProductos}
                                >
                                    Ver productos
                                </button>
                            </div>
                        </section>


                    {/* =========================
                        ADMINISTRADOR
                    ========================== */}

                        {administradorAbierto && (
                            <div className="tienda-administrador">
                                <AdministrarProductos
                                    productos={productos}
                                    agregarProducto={agregarProducto}
                                    modificarProducto={modificarProducto}
                                    eliminarProducto={eliminarProducto}
                                />
                                <AdministrarBanners
                                    banners={banners}
                                    setBanners={setBanners}
                                    productos={productos}
                                />
                            </div>
                        )}

                    </div>

                </main>

            ) : (

                <main className="tienda-main tienda-main-detalle">

                    <DetalleProducto
                        producto={productoDetalle}
                        productos={productos}
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

            {!mostrandoDetalle && (
                <BotonAdmin
                    activo={administradorAbierto}
                    alAlternar={() => setAdministradorAbierto((abierto) => !abierto)}
                    aviso="Los cambios se guardan en Firebase."
                />
            )}

            {/* =========================
                CARRITO
            ========================== */}

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