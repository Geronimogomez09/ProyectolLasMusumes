export default function Carrito({
    abierto,
    cerrarCarrito,
    carrito,
    quitarCarrito
}) {

    const total = carrito.reduce(
        (suma, producto) =>
            suma + Number(producto.precio),
        0
    );


    return (

        <aside
            className={
                `carrito ${
                    abierto ? "abierto" : ""
                }`
            }
        >

            <div className="carrito-header">

                <h2>
                    🛒 Carrito
                </h2>

                <button
                    className="cerrar-carrito"
                    onClick={cerrarCarrito}
                >
                    ×
                </button>

            </div>


            <div>

                {carrito.length === 0 ? (

                    <p>
                        El carrito está vacío.
                    </p>

                ) : (

                    carrito.map(
                        (producto, index) => (

                            <div
                                className="carrito-item"
                                key={`${producto.id}-${index}`}
                            >

                                <div>

                                    <strong>
                                        {producto.nombre}
                                    </strong>

                                    <br />

                                    $
                                    {Number(
                                        producto.precio
                                    ).toLocaleString("es-AR")}

                                </div>


                                <button
                                    className="quitar-btn"
                                    onClick={() =>
                                        quitarCarrito(index)
                                    }
                                >
                                    X
                                </button>

                            </div>

                        )
                    )

                )}

            </div>


            <div className="total">

                Total: $
                {total.toLocaleString("es-AR")}

            </div>


            <button className="finalizar-btn">
                FINALIZAR COMPRA
            </button>

        </aside>

    );
}