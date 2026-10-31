export default function TarjetaProducto({
    producto,
    abrirProducto,
    agregarCarrito
}) {

    return (

        <article
            className="producto"
            onClick={() => abrirProducto(producto.id)}
        >

            <div className="producto-imagen">

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


            <div className="producto-info">

                <div className="producto-categoria">
                    {producto.categoria}
                </div>


                <h3>
                    {producto.nombre}
                </h3>


                <p className="producto-descripcion">
                    {producto.descripcion}
                </p>


                <div className="producto-precio">
                    ${Number(producto.precio).toLocaleString("es-AR")}
                </div>


                <div className="producto-stock">
                    Stock: {producto.stock}
                </div>


                {producto.stock > 0 ? (

                    <button
                        className="agregar-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            agregarCarrito(producto);
                        }}
                    >
                        AGREGAR AL CARRITO
                    </button>

                ) : (

                    <button
                        className="agregar-btn"
                        disabled
                    >
                        SIN STOCK
                    </button>

                )}

            </div>

        </article>

    );
}