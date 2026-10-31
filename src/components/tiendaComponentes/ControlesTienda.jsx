export default function ControlesTienda({
    busqueda,
    setBusqueda,
    abrirCarrito,
    cantidadCarrito,
    productosEncontrados,
    abrirProducto
}) {
    return (
        <div className="controles-tienda">

            <div className="busqueda-tienda">
                <input
                    type="search"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    aria-label="Buscar productos"
                    aria-controls="resultados-busqueda-tienda"
                />

                {busqueda.trim() && (
                    <div
                        className="resultados-busqueda-tienda"
                        id="resultados-busqueda-tienda"
                        aria-live="polite"
                    >
                        {productosEncontrados.length > 0 ? (
                            productosEncontrados.map((producto) => (
                                <button
                                    className="resultado-busqueda-tienda"
                                    key={producto.id}
                                    type="button"
                                    onClick={() => abrirProducto(producto.id)}
                                >
                                    {producto.imagen ? (
                                        <img
                                            src={producto.imagen}
                                            alt=""
                                        />
                                    ) : (
                                        <MinecraftIcon
                                            name="producto"
                                            alt=""
                                            className="resultado-busqueda-imagen-vacia"
                                        />
                                    )}
                                    <span className="resultado-busqueda-info">
                                        <span className="resultado-busqueda-nombre">
                                            {producto.nombre}
                                        </span>
                                        <span className="resultado-busqueda-precio">
                                            ${Number(producto.precio).toLocaleString("es-AR")}
                                        </span>
                                    </span>
                                </button>
                            ))
                        ) : (
                            <p className="sin-resultados-busqueda">
                                No se encontraron productos
                            </p>
                        )}
                    </div>
                )}
            </div>

            <button
                className="carrito-btn"
                type="button"
                onClick={abrirCarrito}
            >
                🛒
                <span>
                    {cantidadCarrito}
                </span>
            </button>

        </div>
    );
}