import { useEffect, useState } from "react";

export default function DetalleProducto({
    producto,
    productos,
    volverProductos,
    agregarDesdeDetalle,
    abrirProducto
}) {

    const [cantidadSeleccionada, setCantidadSeleccionada] = useState({
        productoId: producto?.id,
        valor: 1
    });
    const [imagenActiva, setImagenActiva] = useState(null);
    const [imagenAmpliada, setImagenAmpliada] = useState(false);
    const [zoomImagen, setZoomImagen] = useState(false);
    const relacionadosRef = useRef(null);
    const cantidad = cantidadSeleccionada.productoId === producto?.id
        ? cantidadSeleccionada.valor
        : 1;

    const imagenesProducto = producto
        ? [...new Set([
            ...(Array.isArray(producto.imagenes) ? producto.imagenes : []),
            producto.imagen
        ].filter((imagen) => typeof imagen === "string" && imagen.trim()))]
        : [];
    const imagenPrincipal = imagenActiva?.productoId === producto?.id
        && imagenesProducto.includes(imagenActiva.src)
        ? imagenActiva.src
        : imagenesProducto[0];

    useEffect(() => {
        if (!imagenAmpliada) {
            return undefined;
        }

        function cerrarConEscape(evento) {
            if (evento.key === "Escape") {
                cerrarImagen();
            }
        }

        window.addEventListener("keydown", cerrarConEscape);
        return () => window.removeEventListener("keydown", cerrarConEscape);
    }, [imagenAmpliada]);

    function cerrarImagen() {
        setImagenAmpliada(false);
        setZoomImagen(false);
    }

    useEffect(() => {
        if (productos.length < 3) {
            return undefined;
        }

        const interval = setInterval(() => {
            const carrusel = relacionadosRef.current;
            const tarjeta = carrusel?.querySelector(".detalle-relacionado");

            if (!carrusel || !tarjeta) {
                return;
            }

            const paso = tarjeta.getBoundingClientRect().width + 20;
            const final = carrusel.scrollWidth - carrusel.clientWidth;

            if (carrusel.scrollLeft + paso >= final - 1) {
                carrusel.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                carrusel.scrollBy({ left: paso, behavior: "smooth" });
            }
        }, 3500);

        return () => clearInterval(interval);
    }, [productos.length, producto?.id]);


    if (!producto) {
        return null;
    }


    const relacionados = productos
        .filter((p) => p.id !== producto.id)
        .slice(0, 4);
    const relacionadosCarrusel = [...relacionados, ...relacionados];

    function moverRelacionados(direccion) {
        const carrusel = relacionadosRef.current;
        const tarjeta = carrusel?.querySelector(".detalle-relacionado");

        if (!carrusel || !tarjeta) {
            return;
        }

        carrusel.scrollBy({
            left: direccion * (tarjeta.getBoundingClientRect().width + 20),
            behavior: "smooth"
        });
    }


    function disminuir() {

        setCantidadSeleccionada((actual) => ({
            productoId: producto.id,
            valor: Math.max(
                1,
                (actual.productoId === producto.id ? actual.valor : 1) - 1
            )
        }));

    }


    function aumentar() {

        if (cantidad < producto.stock) {

            setCantidadSeleccionada((actual) => ({
                productoId: producto.id,
                valor: (actual.productoId === producto.id ? actual.valor : 1) + 1
            }));

        }

    }


    return (

        <section className="detalle-pagina">

            <button
                className="detalle-volver"
                onClick={volverProductos}
            >
                ← Volver a todos los productos
            </button>


            <div className="detalle-contenido">


                <div className="detalle-galeria">

                    <div className="detalle-imagen-principal">

                        {imagenPrincipal ? (

                            <button
                                type="button"
                                className="detalle-imagen-ampliar"
                                onClick={() => {
                                    setZoomImagen(false);
                                    setImagenAmpliada(true);
                                }}
                                aria-label={`Ampliar imagen de ${producto.nombre}`}
                            >
                                <img
                                    src={imagenPrincipal}
                                    alt={producto.nombre}
                                />
                            </button>

                        ) : (

                            <div className="imagen-vacia">
                                🛍️
                            </div>

                        )}

                    </div>


                    <div className="detalle-miniaturas">

                        <div className="detalle-miniatura activa">

                            {producto.imagen ? (

                                <img
                                    src={producto.imagen}
                                    alt={producto.nombre}
                                />

                            ) : (

                                <div className="imagen-vacia">
                                    🛍️
                                </div>

                            )}

                        </div>
                    )}

                </div>


                <div className="detalle-info">

                    <div className="detalle-categoria">
                        {producto.categoria}
                    </div>


                    <h1>
                        {producto.nombre}
                    </h1>


                    <p className="detalle-descripcion">

                        {producto.descripcion ||
                            "Producto disponible en nuestra tienda."}

                    </p>


                    <div className="detalle-precio">

                        $
                        {Number(
                            producto.precio
                        ).toLocaleString("es-AR")}

                    </div>


                    <div className="detalle-stock">

                        {producto.stock > 0
                            ? `● En stock — ${producto.stock} unidades disponibles`
                            : "● Sin stock"}

                    </div>


                    {producto.stock > 0 && (

                        <>

                            <div className="detalle-cantidad-titulo">
                                Cantidad
                            </div>


                            <div className="detalle-cantidad">

                                <button
                                    onClick={disminuir}
                                >
                                    −
                                </button>


                                <span>
                                    {cantidad}
                                </span>


                                <button
                                    onClick={aumentar}
                                >
                                    +
                                </button>

                            </div>

                        </>

                    )}


                    <button
                        className="detalle-agregar"
                        disabled={producto.stock <= 0}
                        onClick={() =>
                            agregarDesdeDetalle(
                                producto,
                                cantidad
                            )
                        }
                    >

                        {producto.stock > 0
                            ? "🛒 AGREGAR AL CARRITO"
                            : "SIN STOCK"}

                    </button>


                    <div className="detalle-beneficios">

                        <div className="detalle-beneficio">
                            <span>✓</span>
                            <span>
                                Producto disponible
                            </span>
                        </div>

                        <div className="detalle-beneficio">
                            <span>🚚</span>
                            <span>
                                Envíos disponibles
                            </span>
                        </div>

                        <div className="detalle-beneficio">
                            <span>🔒</span>
                            <span>
                                Compra segura
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            {imagenAmpliada && imagenPrincipal && (
                <div
                    className="detalle-lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Imagen ampliada de ${producto.nombre}`}
                    onClick={cerrarImagen}
                >
                    <button
                        type="button"
                        className="detalle-lightbox-cerrar"
                        onClick={cerrarImagen}
                        aria-label="Cerrar imagen ampliada"
                    >
                        ×
                    </button>
                    <img
                        src={imagenPrincipal}
                        alt={producto.nombre}
                        className={zoomImagen ? "con-zoom" : ""}
                        onClick={(evento) => {
                            evento.stopPropagation();
                            setZoomImagen((zoomActual) => !zoomActual);
                        }}
                        aria-label={zoomImagen
                            ? "Reducir imagen"
                            : "Acercar imagen"}
                    />
                </div>
            )}


            <div className="detalle-extra">

                <h2>
                    Información del producto
                </h2>


                <div className="detalle-datos">

                    <div className="detalle-dato">
                        <strong>
                            Categoría
                        </strong>

                        <span>
                            {producto.categoria}
                        </span>
                    </div>


                    <div className="detalle-dato">
                        <strong>
                            Precio
                        </strong>

                        <span>
                            $
                            {Number(
                                producto.precio
                            ).toLocaleString("es-AR")}
                        </span>
                    </div>


                    <div className="detalle-dato">
                        <strong>
                            Stock
                        </strong>

                        <span>
                            {producto.stock} unidades
                        </span>
                    </div>


                    <div className="detalle-dato">
                        <strong>
                            Estado
                        </strong>

                        <span>
                            {producto.stock > 0
                                ? "Disponible"
                                : "Sin stock"}
                        </span>
                    </div>

                </div>

            </div>


            <div className="detalle-relacionados">

                <h2>
                    También te puede interesar
                </h2>

                <div className="detalle-relacionados-carrusel">
                    {relacionados.length > 0 && (
                        <button
                            className="detalle-relacionados-flecha"
                            type="button"
                            onClick={() => moverRelacionados(-1)}
                            aria-label="Ver productos relacionados anteriores"
                        >
                            &#10094;
                        </button>
                    )}

                <div className="detalle-relacionados-grid">

                    {relacionados.length === 0 ? (

                        <p style={{ color: "#777" }}>
                            No hay otros productos disponibles.
                        </p>

                    ) : (

                        relacionados.map((p) => (

                            <article
                                className="detalle-relacionado"
                                key={p.id}
                                onClick={() =>
                                    abrirProducto(p.id)
                                }
                            >

                                <div className="detalle-relacionado-imagen">

                                    {p.imagen ? (

                                        <img
                                            src={p.imagen}
                                            alt={p.nombre}
                                        />

                                    ) : (

                                        <div className="imagen-vacia">
                                            🛍️
                                        </div>

                                    )}

                                </div>


                                <div className="detalle-relacionado-info">

                                    <small>
                                        {p.categoria}
                                    </small>

                                    <h3>
                                        {p.nombre}
                                    </h3>

                                    <strong>
                                        $
                                        {Number(
                                            p.precio
                                        ).toLocaleString("es-AR")}
                                    </strong>

                                </div>

                            </article>

                        ))

                    {relacionados.length > 0 && (
                        <button
                            className="detalle-relacionados-flecha"
                            type="button"
                            onClick={() => moverRelacionados(1)}
                            aria-label="Ver productos relacionados siguientes"
                        >
                            &#10095;
                        </button>
                    )}
                </div>

            </div>

        </section>

    );
}