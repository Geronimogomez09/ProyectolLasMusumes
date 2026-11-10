import MinecraftIcon from "./MinecraftIcon";
import BotonGuardar from "../guardadosComponentes/BotonGuardar";
import useGuardados from "../../hooks/useGuardados";
import { normalizarCategoriaProducto } from "../../data/productos";

// Índice: Tarjeta de producto.
// ----------------- Tarjeta de producto -----------------
// Recibe un producto y las acciones asociadas a la tienda. Muestra su información resumida y ofrece acceso al detalle o a las acciones disponibles.

// TARJETA PRODUCTO: muestra un producto (imagen, categoría, nombre, descripción, precio y stock)
// en la grilla de la tienda, con un corazón arriba a la derecha para guardarlo en favoritos
// y un botón para agregarlo al carrito.
// Recibe: producto, abrirProducto, agregarCarrito. Se usa en tienda.jsx.
export default function TarjetaProducto({
    producto,
    abrirProducto,
    agregarCarrito
}) {

    // PRODUCTOS FAVORITOS: ids de los productos que el usuario guardó. Se usa en el corazón.
    const favoritos = useGuardados("producto");

    return (

        <article
            className="producto guardar-padre"
            onClick={() => abrirProducto(producto.id)}
        >

            {/* CORAZÓN FAVORITO PRODUCTO: guarda o quita este producto de "Contenido guardado".
                El botón detiene el clic, así que no abre el detalle del producto. */}
            <BotonGuardar
                guardado={favoritos.estaGuardado(producto.id)}
                alAlternar={() => favoritos.alternar(producto.id)}
                variante="flotante"
                nombre={producto.nombre}
            />

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