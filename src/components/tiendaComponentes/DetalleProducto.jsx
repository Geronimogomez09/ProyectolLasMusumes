import { useEffect, useState } from "react";

export default function DetalleProducto({
    producto,
    productos,
    volverProductos,
    agregarDesdeDetalle,
    abrirProducto
}) {

    const [cantidad, setCantidad] = useState(1);


    useEffect(() => {

        setCantidad(1);

    }, [producto?.id]);


    if (!producto) {
        return null;
    }


    const relacionados = productos
        .filter((p) => p.id !== producto.id)
        .slice(0, 4);


    function disminuir() {

        setCantidad(
            (actual) =>
                Math.max(1, actual - 1)
        );

    }


    function aumentar() {

        if (cantidad < producto.stock) {

            setCantidad(
                (actual) => actual + 1
            );

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

                    </div>

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

                    )}

                </div>

            </div>

        </section>

    );
}