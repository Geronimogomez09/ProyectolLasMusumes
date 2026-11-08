import MinecraftIcon from "./MinecraftIcon";
import { normalizarCategoriaProducto } from "../../data/productos";

// Presenta un producto y recibe del catálogo las acciones para abrirlo o agregarlo.
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

            {/* El contenedor abre el detalle; el botón de agregar detiene ese clic en su manejador. */}
            {/* Usa la imagen cargada o un ícono genérico si todavía no hay una. */}
            <div className="producto-imagen">

                {producto.imagen ? (

                    <img
                        src={producto.imagen}
                        alt={producto.nombre}
                    />

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


            {/* Datos resumidos para decidir si abrir el detalle o agregar al carrito. */}
            <div className="producto-info">

                <div className="producto-categoria">
                    {normalizarCategoriaProducto(producto.categoria)}
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


                {/* Evita agregar productos que no tienen unidades disponibles. */}
                {producto.stock > 0 ? (

                    <button
                        className="agregar-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (normalizarCategoriaProducto(producto.categoria) === "Ropa") {
                                abrirProducto(producto.id);
                            } else {
                                agregarCarrito(producto);
                            }
                        }}
                    >
                        {normalizarCategoriaProducto(producto.categoria) === "Ropa"
                            ? "ELEGIR TALLE"
                            : "AGREGAR AL CARRITO"}
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