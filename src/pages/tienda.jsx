import { useEffect, useMemo, useState } from "react";

import Header from "../components/header";
import Footer from "../components/Footer";
import TarjetaProducto from "../components/tiendaComponentes/TarjetaProducto";
import ControlesTienda from "../components/tiendaComponentes/ControlesTienda";
import CategoriasTienda from "../components/tiendaComponentes/CategoriasTienda";
import AdministrarProductos from "../components/tiendaComponentes/AdministrarProductos";
import Carrito from "../components/tiendaComponentes/Carrito";
import DetalleProducto from "../components/tiendaComponentes/DetalleProducto";

import { productosIniciales } from "../data/productos";

import "../styles/tienda.css";


function cargarProductos() {

    const guardados =
        localStorage.getItem(
            "productosTienda"
        );


    if (guardados) {

        return JSON.parse(guardados);

    }


    return productosIniciales;
}


export default function Tienda() {


    const [productos, setProductos] =
        useState(cargarProductos);


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

                const id =
                    Number(
                        hash.replace(
                            "#producto=",
                            ""
                        )
                    );


                setProductoDetalleId(id);

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
                producto.id ===
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


            const texto =
                busqueda
                    .trim()
                    .toLowerCase();


            if (texto) {

                resultado =
                    resultado.filter(
                        (producto) =>

                            producto.nombre
                                .toLowerCase()
                                .includes(texto)

                            ||

                            producto.categoria
                                .toLowerCase()
                                .includes(texto)

                            ||

                            (
                                producto.descripcion ||
                                ""
                            )
                                .toLowerCase()
                                .includes(texto)
                    );

            }


            return resultado;

        }, [
            productos,
            categoriaActiva,
            busqueda
        ]);


    /*
    ==========================================
    ABRIR PRODUCTO
    ==========================================
    */

    function abrirProducto(id) {

        window.location.hash =
            `producto=${id}`;


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

                    <section className="banner">

                        <div className="banner-text">

                            <small>
                                NUEVA COLECCIÓN
                            </small>

                            <h1>
                                Productos que
                                <br />
                                se mueven con vos
                            </h1>

                            <p>
                                Ropa, tazas, sábanas,
                                figuras, accesorios,
                                decoración y mucho más.
                            </p>

                            <button
                                className="banner-btn"
                                onClick={irProductos}
                            >
                                VER PRODUCTOS
                            </button>

                        </div>

                    </section>


                    {/* =========================
                        TITULO
                    ========================== */}

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


                    {/* =========================
                        ADMINISTRADOR
                    ========================== */}

                    <AdministrarProductos
                        productos={productos}
                        agregarProducto={
                            agregarProducto
                        }
                        eliminarProducto={
                            eliminarProducto
                        }
                    />


                    <Footer />

                </main>

            ) : (

                <main className="tienda-main">

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


            {/* =========================
                CARRITO
            ========================== */}

            <Carrito
                abierto={carritoAbierto}
                cerrarCarrito={() =>
                    setCarritoAbierto(false)
                }
                carrito={carrito}
                quitarCarrito={
                    quitarCarrito
                }
            />

        </div>

    );

}