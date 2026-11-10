import { useEffect, useRef, useState } from "react";
import MinecraftIcon from "./MinecraftIcon";
import BotonGuardar from "../guardadosComponentes/BotonGuardar";
import useGuardados from "../../hooks/useGuardados";
import {
    crearStockPorTalle,
    normalizarCategoriaProducto,
    normalizarTallesRopa,
    TALLES_ROPA
} from "../../data/productos";

// Índice: Detalle de producto y carrito.
// ----------------- Detalle de producto y carrito -----------------
// Recibe el producto, el catálogo, el carrito y las acciones para volver, agregar o abrir otro producto. Muestra galería, talles, stock, favoritos y productos relacionados.

// DETALLE PRODUCTO: página de detalle de un producto de la tienda. Muestra la galería, el precio,
// el stock, el talle, la cantidad, el botón de agregar al carrito, un botón para guardar el producto
// en favoritos, la información adicional y los productos relacionados.
// Recibe: producto, productos, carrito, volverProductos, agregarDesdeDetalle, abrirProducto.
// Se usa en tienda.jsx.
export default function DetalleProducto({
    producto,
    productos,
    carrito,
    volverProductos,
    agregarDesdeDetalle,
    abrirProducto
}) {

    // PRODUCTOS FAVORITOS: ids de los productos que el usuario guardó. Se usa en el botón de favorito.
    // Va arriba de todo porque los hooks no pueden ir después del "return null" de más abajo.
    const favoritos = useGuardados("producto");

    // Guarda cantidad e imagen con el ID del producto para no reutilizar estado entre detalles.
    const [cantidadSeleccionada, setCantidadSeleccionada] = useState({
        productoId: producto?.id,
        valor: 1
    });
    const [imagenActiva, setImagenActiva] = useState(null);
    const [imagenAmpliada, setImagenAmpliada] = useState(false);
    const [zoomImagen, setZoomImagen] = useState(false);
    const [talleSeleccionado, setTalleSeleccionado] = useState({
        productoId: producto?.id,
        valor: ""
    });
    const relacionadosRef = useRef(null);
    const esRopa = normalizarCategoriaProducto(producto?.categoria) === "Ropa";
    const tallesDisponibles = esRopa
        ? normalizarTallesRopa(producto?.talles, producto?.stock)
        : crearStockPorTalle();
    const talleActual = talleSeleccionado.productoId === producto?.id
        ? talleSeleccionado.valor
        : "";
    function disponiblesDelTalle(talle) {
        const stockDelTalle = Number(tallesDisponibles[talle] || 0);
        const unidadesEnCarrito = carrito.filter((item) =>
            String(item.id) === String(producto?.id) && item.talle === talle
        ).length;

        return Math.max(0, stockDelTalle - unidadesEnCarrito);
    }

    const stockDisponible = esRopa
        ? disponiblesDelTalle(talleActual)
        : producto?.stock || 0;
    // Si cambia el producto, la cantidad vuelve visualmente a una unidad.
    const cantidad = cantidadSeleccionada.productoId === producto?.id
        ? Math.min(cantidadSeleccionada.valor, Math.max(stockDisponible, 1))
        : 1;

    // Une las imágenes adicionales con la principal y elimina vacíos y duplicados.
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

    // Permite cerrar la ampliación con Escape y retira el listener al cerrar/desmontar.
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

    // Restablece a la vez el estado del visor y el nivel de zoom.
    function cerrarImagen() {
        setImagenAmpliada(false);
        setZoomImagen(false);
    }

    // Desplaza automáticamente el carrusel de relacionados y vuelve al inicio al llegar al final.
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


    // Limita la lista a cuatro artículos y duplica las tarjetas para un desplazamiento continuo.
    const relacionados = productos
        .filter((p) => p.id !== producto.id)
        .slice(0, 4);
    const relacionadosCarrusel = [...relacionados, ...relacionados];

    function moverRelacionados(direccion) {
        // Avanza exactamente el ancho de una tarjeta más el espacio entre tarjetas.
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
        // La cantidad nunca puede bajar de una unidad.
        setCantidadSeleccionada((actual) => ({
            productoId: producto.id,
            valor: Math.max(
                1,
                (actual.productoId === producto.id ? actual.valor : 1) - 1
            )
        }));

    }


    function aumentar() {
        // No permite elegir más unidades de las que hay disponibles en stock.
        if (cantidad < stockDisponible) {

            setCantidadSeleccionada((actual) => ({
                productoId: producto.id,
                valor: (actual.productoId === producto.id ? actual.valor : 1) + 1
            }));

        }

    }


    return (

        <section className="detalle-pagina">

            {/* Detalle completo: galería, compra, información adicional y sugerencias. */}
            <button
                className="detalle-volver"
                onClick={volverProductos}
            >
                ← Volver a todos los productos
            </button>


            <div className="detalle-contenido">


                {/* Imagen principal y miniaturas si el producto tiene más de una foto. */}
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
                                <MinecraftIcon
                                    name="producto"
                                    alt="Producto"
                                    className="imagen-vacia-icono"
                                />
                            </div>

                        )}

                    </div>


                    {imagenesProducto.length > 1 && (
                        <div className="detalle-miniaturas">
                            {imagenesProducto.map((imagen, indice) => (
                                <button
                                    className={`detalle-miniatura ${imagen === imagenPrincipal ? "activa" : ""}`}
                                    key={`${imagen}-${indice}`}
                                    type="button"
                                    onClick={() => setImagenActiva({
                                        productoId: producto.id,
                                        src: imagen
                                    })}
                                    aria-label={`Ver imagen ${indice + 1} de ${producto.nombre}`}
                                    aria-pressed={imagen === imagenPrincipal}
                                >
                                    <img src={imagen} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                </div>


                {/* Precio, disponibilidad y acciones de compra para el producto seleccionado. */}
                <div className="detalle-info">

                    <div className="detalle-categoria">
                        {normalizarCategoriaProducto(producto.categoria)}
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
                        {esRopa
                            ? `● ${producto.stock > 0 ? `${producto.stock} unidades en total` : "Sin stock"}`
                            : producto.stock > 0
                                ? `● En stock — ${producto.stock} unidades disponibles`
                                : "● Sin stock"}
                    </div>

                    {esRopa && (
                        <div className="detalle-talle">
                            <label htmlFor="producto-talle">Talle</label>
                            <select
                                id="producto-talle"
                                value={talleActual}
                                onChange={(evento) => {
                                    setTalleSeleccionado({
                                        productoId: producto.id,
                                        valor: evento.target.value
                                    });
                                    setCantidadSeleccionada({
                                        productoId: producto.id,
                                        valor: 1
                                    });
                                }}
                            >
                                <option value="">Elegí un talle</option>
                                {TALLES_ROPA.map((talle) => (
                                    <option
                                        key={talle}
                                        value={talle}
                                        disabled={disponiblesDelTalle(talle) <= 0}
                                    >
                                        {talle} — {disponiblesDelTalle(talle)} disponibles
                                    </option>
                                ))}
                            </select>
                            {talleActual && (
                                <small>
                                    {stockDisponible > 0
                                        ? `${stockDisponible} disponibles de este talle`
                                        : "No quedan unidades disponibles de este talle"}
                                </small>
                            )}
                        </div>
                    )}

                    {stockDisponible > 0 && (!esRopa || talleActual) && (
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
                        disabled={stockDisponible <= 0 || (esRopa && !talleActual)}
                        onClick={() => {
                            agregarDesdeDetalle(
                                producto,
                                cantidad,
                                talleActual || null
                            );
                            setCantidadSeleccionada({
                                productoId: producto.id,
                                valor: 1
                            });
                        }}
                    >

                        {esRopa && !talleActual ? (
                            "ELEGÍ UN TALLE"
                        ) : stockDisponible > 0 ? (
                            <>
                                <MinecraftIcon
                                    name="carrito"
                                    alt="Agregar al carrito"
                                    className="detalle-agregar-icono"
                                />
                                AGREGAR AL CARRITO
                            </>
                        ) : (
                            "SIN STOCK"
                        )}

                    </button>

                    {/* BOTÓN FAVORITO PRODUCTO: guarda o quita este producto de "Contenido guardado"
                        del perfil. Muestra un corazón y el texto "Agregar a favoritos" / "En favoritos". */}
                    <BotonGuardar
                        guardado={favoritos.estaGuardado(producto.id)}
                        alAlternar={() => favoritos.alternar(producto.id)}
                        variante="ancho"
                        conTexto
                        textoActivo="En favoritos"
                        textoInactivo="Agregar a favoritos"
                        nombre={producto.nombre}
                    />


                    <div className="detalle-beneficios">

                        <div className="detalle-beneficio">
                            <span className="detalle-beneficio-icono-wrap">
                                <svg
                                    className="detalle-beneficio-check"
                                    viewBox="0 0 28 28"
                                    role="img"
                                    aria-label="Disponible"
                                >
                                    <circle cx="14" cy="14" r="13" />
                                    <path d="m7.5 14.5 4.2 4.2 8.8-9" />
                                </svg>
                            </span>
                            <span>
                                Producto disponible
                            </span>
                        </div>

                        <div className="detalle-beneficio">
                            <span className="detalle-beneficio-icono-wrap">
                                <svg
                                    className="detalle-beneficio-icono detalle-envio-icono"
                                    viewBox="0 0 24 24"
                                    role="img"
                                    aria-label="Envíos disponibles"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M3 5h11a1 1 0 0 1 1 1v2h3.2a2 2 0 0 1 1.6.8l2.2 2.9V18h-2.1a3 3 0 0 1-5.8 0H9.9a3 3 0 0 1-5.8 0H2V6a1 1 0 0 1 1-1Zm1 2v9h.2a3 3 0 0 1 5.6 0H13V7H4Zm11 3v6h.2a3 3 0 0 1 5.6 0h.2v-2.6L18.6 10H15Zm-9 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z"
                                    />
                                </svg>
                            </span>
                            <span>
                                Envíos disponibles
                            </span>
                        </div>

                        <div className="detalle-beneficio">
                            <span>
                                <MinecraftIcon
                                    name="seguro"
                                    alt="Compra segura"
                                    className="detalle-beneficio-icono"
                                />
                            </span>
                            <span>
                                Compra segura
                            </span>
                        </div>

                    </div>

                </div>

            </div>


            {/* Visor superpuesto; tocar la imagen alterna entre tamaño normal y zoom. */}
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


            {/* Resumen de atributos normalizados del producto. */}
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
                            {normalizarCategoriaProducto(producto.categoria)}
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


            {/* Carrusel de otros productos con controles laterales. */}
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

                    <div
                        className="detalle-relacionados-grid"
                        ref={relacionadosRef}
                    >
                        {relacionados.length === 0 ? (
                            <p style={{ color: "#777" }}>
                                No hay otros productos disponibles.
                            </p>
                        ) : (
                            relacionadosCarrusel.map((p, indice) => (
                                <article
                                    className="detalle-relacionado"
                                    key={`${p.id}-${indice}`}
                                    onClick={() => abrirProducto(p.id)}
                                >
                                    <div className="detalle-relacionado-imagen">
                                        {p.imagen ? (
                                            <img src={p.imagen} alt={p.nombre} />
                                        ) : (
                                            <div className="imagen-vacia">
                                                <MinecraftIcon
                                                    name="producto"
                                                    alt="Producto"
                                                    className="imagen-vacia-icono"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="detalle-relacionado-info">
                                        <small>{p.categoria}</small>
                                        <h3>{p.nombre}</h3>
                                        <strong>
                                            ${Number(p.precio).toLocaleString("es-AR")}
                                        </strong>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>

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