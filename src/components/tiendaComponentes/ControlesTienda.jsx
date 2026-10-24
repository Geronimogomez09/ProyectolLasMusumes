export default function ControlesTienda({
    busqueda,
    setBusqueda,
    abrirCarrito,
    cantidadCarrito
}) {
    return (
        <div className="controles-tienda">

            <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
            />

            <button
                className="carrito-btn"
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