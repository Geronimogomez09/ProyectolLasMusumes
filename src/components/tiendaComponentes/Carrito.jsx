
import { useState } from "react";
import Pago from "./Pago";
import MinecraftIcon from "./MinecraftIcon";

// ÍNDICE GENERAL
// 1. Datos y acciones recibidos de la tienda
// 2. Estado que abre el flujo de pago
// 3. Cálculo del total
// 4. Lista de unidades, eliminación y confirmación

// CARRITO LATERAL
// carrito es un array donde cada entrada representa una unidad elegida, incluso si dos
// entradas corresponden al mismo producto pero con talles diferentes. Por eso quitarCarrito
// recibe el índice de la unidad y la key combina id e índice. La página Tienda es dueña del
// estado y entrega los callbacks; Carrito solamente solicita los cambios necesarios.

export default function Carrito({
    abierto,
    cerrarCarrito,
    carrito,
    quitarCarrito,
    vaciarCarrito
}) {
    // pagoAbierto no significa que la compra esté pagada: solo indica que se debe montar
    // el componente Pago. Al cerrarlo, el resumen del carrito sigue disponible.
    const [pagoAbierto, setPagoAbierto] = useState(false);

    // reduce recorre cada unidad y acumula su precio. Number cubre precios que lleguen
    // como texto desde los datos; el valor inicial 0 permite calcular correctamente un
    // carrito vacío. No modifica carrito ni los productos contenidos en él.
    const total = carrito.reduce(
        (suma, producto) => suma + Number(producto.precio),
        0
    );

    return (
        <>
            {/* Panel lateral: lista, eliminación de unidades y acceso al pago. */}
            <aside className={`carrito ${abierto ? "abierto" : ""}`}>
                <div className="carrito-header">
                    <h2>
                        <MinecraftIcon
                            name="carrito"
                            alt="Carrito"
                            className="carrito-header-icono"
                        />
                        Carrito
                    </h2>
                    <button
                        className="cerrar-carrito"
                        onClick={cerrarCarrito}
                    >
                        ×
                    </button>
                </div>

                <div>
                    {/* El ternario diferencia un carrito sin elementos de una fila por
                        unidad. toLocaleString aplica el formato monetario argentino solo
                        para mostrar; el cálculo conserva el número sin redondearlo aquí. */}
                    {carrito.length === 0 ? (
                        <p>El carrito está vacío.</p>
                    ) : (
                        carrito.map((producto, index) => (
                            <div
                                className="carrito-item"
                                key={`${producto.id}-${index}`}
                            >
                                <div>
                                    <strong>{producto.nombre}</strong>
                                    {producto.talle && (
                                        <>
                                            <br />
                                            <small>Talle: {producto.talle}</small>
                                        </>
                                    )}
                                    <br />
                                    ${Number(producto.precio).toLocaleString("es-AR")}
                                </div>

                                <button
                                    className="quitar-btn"
                                    onClick={() => quitarCarrito(index)}
                                >
                                    X
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="total">
                    Total: ${total.toLocaleString("es-AR")}
                </div>

                <button
                    className="finalizar-btn"
                    disabled={carrito.length === 0}
                    onClick={() => setPagoAbierto(true)}
                >
                    FINALIZAR COMPRA
                </button>
            </aside>

            {/* Pago recibe el mismo carrito como resumen y un callback para vaciarlo al
                completar el flujo. Si pagoAbierto es false, React no lo monta. */}
            {pagoAbierto && (
                <Pago
                    carrito={carrito}
                    cerrarPago={() => setPagoAbierto(false)}
                    vaciarCarrito={vaciarCarrito}
                />
            )}
        </>
    );
}
