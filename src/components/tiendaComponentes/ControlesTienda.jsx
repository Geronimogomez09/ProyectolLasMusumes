import MinecraftIcon from "./MinecraftIcon";

// Índice: Búsqueda y filtros de tienda.
// ----------------- Búsqueda y filtros de tienda -----------------
// Recibe los valores y acciones de b?squeda, orden y filtros. Permite acotar el catálogo y comunica cada cambio a la página de tienda.

// Agrupa el buscador con sus coincidencias y el acceso al panel del carrito.
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

            {/* Los resultados aparecen mientras haya texto de búsqueda. */}
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
                        {/* Cada resultado abre el detalle; si no hay coincidencias se informa. */}
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

            {/* El contador refleja la cantidad de unidades, no la de productos distintos. */}
            <button
                className="carrito-btn"
                type="button"
                onClick={abrirCarrito}
            >
                <MinecraftIcon
                    name="carrito"
                    alt="Carrito"
                    className="carrito-btn-icono"
                />
                <span>
                    {cantidadCarrito}
                </span>
            </button>

        </div>
    );
}