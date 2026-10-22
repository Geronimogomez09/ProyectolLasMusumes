
import { useState } from "react";
import "../../styles/tienda.css";

export default function Pago({
    carrito,
    cerrarPago,
    vaciarCarrito
}) {
    const [paso, setPaso] = useState(1);
    const [metodoPago, setMetodoPago] = useState("tarjeta");
    const [pedidoId, setPedidoId] = useState("");
    const [datos, setDatos] = useState({
        nombre: "",
        email: "",
        telefono: "",
        direccion: "",
        ciudad: "",
        codigoPostal: ""
    });
    const [tarjeta, setTarjeta] = useState({
        numero: "",
        titular: "",
        vencimiento: "",
        cvv: ""
    });

    const totalProductos = carrito.reduce(
        (suma, producto) => suma + Number(producto.precio || 0),
        0
    );

    const envio = 3500;
    const totalFinal = totalProductos + envio;

    const formatoPrecio = (precio) =>
        Number(precio).toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        });

    function cambiarDato(evento) {
        const { name, value } = evento.target;
        setDatos((actual) => ({ ...actual, [name]: value }));
    }

    function cambiarTarjeta(evento) {
        const { name, value } = evento.target;

        if (name === "numero") {
            const numero = value.replace(/\D/g, "").slice(0, 16);
            setTarjeta((actual) => ({
                ...actual,
                numero: numero.replace(/(.{4})/g, "$1 ").trim()
            }));
            return;
        }

        if (name === "vencimiento") {
            let valor = value.replace(/\D/g, "").slice(0, 4);
            if (valor.length > 2) {
                valor = `${valor.slice(0, 2)}/${valor.slice(2)}`;
            }
            setTarjeta((actual) => ({ ...actual, vencimiento: valor }));
            return;
        }

        if (name === "cvv") {
            setTarjeta((actual) => ({
                ...actual,
                cvv: value.replace(/\D/g, "").slice(0, 4)
            }));
            return;
        }

        setTarjeta((actual) => ({ ...actual, [name]: value }));
    }

    function continuarDatos(evento) {
        evento.preventDefault();
        setPaso(2);
    }

    function confirmarCompra() {
        if (metodoPago === "tarjeta") {
            const numero = tarjeta.numero.replace(/\s/g, "");

            if (numero.length !== 16) {
                alert("Ingresá un número de tarjeta de 16 dígitos.");
                return;
            }

            if (tarjeta.titular.trim().length < 3) {
                alert("Ingresá el nombre del titular.");
                return;
            }

            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(tarjeta.vencimiento)) {
                alert("Ingresá el vencimiento en formato MM/AA.");
                return;
            }

            if (tarjeta.cvv.length < 3) {
                alert("Ingresá un CVV válido.");
                return;
            }

            
            return;
        }

        setPedidoId(`PED-${Date.now().toString().slice(-8)}`);
        setPaso(3);
    }

    function finalizarCompra() {
        vaciarCarrito();
        cerrarPago();
    }

    const pasos = ["Entrega", "Pago", "Confirmación"];

    return (
        <div className="pago-overlay">
            <div className="pago-pagina">
                <header className="pago-header">
                    <button
                        className="pago-volver"
                        onClick={cerrarPago}
                        type="button"
                    >
                        ← Volver a la tienda
                    </button>

                    <div className="pago-marca">FINALIZAR COMPRA</div>

                    <span className="pago-seguro">
                        🔒 Compra protegida
                    </span>
                </header>

                <div className="pago-contenido">
                    <div className="pago-principal">
                        <div className="pago-titulo">
                            <span>ESTÁS A UN PASO</span>
                            <h1>
                                {paso === 1 && "Datos de entrega"}
                                {paso === 2 && "Método de pago"}
                                {paso === 3 && "¡Pedido confirmado!"}
                            </h1>
                            <p>
                                {paso === 1 &&
                                    "Completá tus datos para preparar tu pedido."}
                                {paso === 2 &&
                                    "Elegí cómo querés pagar tu compra."}
                                {paso === 3 &&
                                    "Tu pedido quedó registrado."}
                            </p>
                        </div>

                        <div className="pago-pasos">
                            {pasos.map((nombre, index) => {
                                const numero = index + 1;
                                return (
                                    <div
                                        key={nombre}
                                        className={`pago-paso ${
                                            paso === numero ? "activo" : ""
                                        } ${paso > numero ? "completo" : ""}`}
                                    >
                                        <span>
                                            {paso > numero ? "✓" : numero}
                                        </span>
                                        {nombre}
                                    </div>
                                );
                            })}
                        </div>

                        {paso === 1 && (
                            <form
                                className="pago-panel"
                                onSubmit={continuarDatos}
                            >
                                <h2>Información personal</h2>

                                <div className="pago-campos">
                                    <label className="pago-campo ancho-completo">
                                        Nombre y apellido
                                        <input
                                            name="nombre"
                                            value={datos.nombre}
                                            onChange={cambiarDato}
                                            placeholder="Ej. Juan Pérez"
                                            autoComplete="name"
                                            required
                                        />
                                    </label>

                                    <label className="pago-campo">
                                        Correo electrónico
                                        <input
                                            type="email"
                                            name="email"
                                            value={datos.email}
                                            onChange={cambiarDato}
                                            placeholder="tu@email.com"
                                            autoComplete="email"
                                            required
                                        />
                                    </label>

                                    <label className="pago-campo">
                                        Teléfono
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={datos.telefono}
                                            onChange={cambiarDato}
                                            placeholder="Tu teléfono"
                                            autoComplete="tel"
                                            required
                                        />
                                    </label>
                                </div>

                                <div className="pago-separador" />

                                <h2>Dirección de entrega</h2>

                                <div className="pago-campos">
                                    <label className="pago-campo ancho-completo">
                                        Calle y número
                                        <input
                                            name="direccion"
                                            value={datos.direccion}
                                            onChange={cambiarDato}
                                            placeholder="Ej. Av. Siempre Viva 123"
                                            autoComplete="street-address"
                                            required
                                        />
                                    </label>

                                    <label className="pago-campo">
                                        Ciudad
                                        <input
                                            name="ciudad"
                                            value={datos.ciudad}
                                            onChange={cambiarDato}
                                            placeholder="Tu ciudad"
                                            autoComplete="address-level2"
                                            required
                                        />
                                    </label>

                                    <label className="pago-campo">
                                        Código postal
                                        <input
                                            name="codigoPostal"
                                            value={datos.codigoPostal}
                                            onChange={cambiarDato}
                                            placeholder="Ej. 8300"
                                            autoComplete="postal-code"
                                            required
                                        />
                                    </label>
                                </div>

                                <button
                                    className="pago-boton"
                                    type="submit"
                                >
                                    CONTINUAR AL PAGO →
                                </button>
                            </form>
                        )}

                        {paso === 2 && (
                            <div className="pago-panel">
                                <h2>Seleccioná un medio de pago</h2>
                                <p className="pago-ayuda">
                                    Elegí una de las opciones disponibles.
                                </p>

                                <div className="pago-metodos">
                                    <label
                                        className={`pago-metodo ${
                                            metodoPago === "tarjeta"
                                                ? "seleccionado"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="tarjeta"
                                            checked={metodoPago === "tarjeta"}
                                            onChange={(e) =>
                                                setMetodoPago(e.target.value)
                                            }
                                        />
                                        <span className="pago-metodo-icono">
                                            💳
                                        </span>
                                        <span className="pago-metodo-texto">
                                            <strong>Tarjeta</strong>
                                            <small>
                                                Crédito o débito
                                            </small>
                                        </span>
                                        <span className="pago-radio" />
                                    </label>

                                    <label
                                        className={`pago-metodo ${
                                            metodoPago === "transferencia"
                                                ? "seleccionado"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="transferencia"
                                            checked={
                                                metodoPago === "transferencia"
                                            }
                                            onChange={(e) =>
                                                setMetodoPago(e.target.value)
                                            }
                                        />
                                        <span className="pago-metodo-icono">
                                            🏦
                                        </span>
                                        <span className="pago-metodo-texto">
                                            <strong>Transferencia</strong>
                                            <small>
                                                Desde tu banco o billetera
                                            </small>
                                        </span>
                                        <span className="pago-radio" />
                                    </label>

                                    <label
                                        className={`pago-metodo ${
                                            metodoPago === "efectivo"
                                                ? "seleccionado"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="efectivo"
                                            checked={metodoPago === "efectivo"}
                                            onChange={(e) =>
                                                setMetodoPago(e.target.value)
                                            }
                                        />
                                        <span className="pago-metodo-icono">
                                            💵
                                        </span>
                                        <span className="pago-metodo-texto">
                                            <strong>Efectivo</strong>
                                            <small>
                                                Al retirar o recibir el pedido
                                            </small>
                                        </span>
                                        <span className="pago-radio" />
                                    </label>
                                </div>

                                {metodoPago === "tarjeta" && (
                                    <div className="pago-tarjeta-demo">
                                        <div className="pago-tarjeta-visual">
                                            <div className="pago-tarjeta-arriba">
                                                <span>MI TARJETA</span>
                                               
                                            </div>
                                            <div className="pago-chip" />
                                            <div className="pago-numero-preview">
                                                {tarjeta.numero ||
                                                    "•••• •••• •••• ••••"}
                                            </div>
                                            <div className="pago-tarjeta-abajo">
                                                <span>
                                                    {tarjeta.titular.toUpperCase() ||
                                                        "NOMBRE DEL TITULAR"}
                                                </span>
                                                <span>
                                                    {tarjeta.vencimiento ||
                                                        "MM/AA"}
                                                </span>
                                            </div>
                                        </div>

                                        <label className="pago-campo">
                                            Número de tarjeta 
                                            <input
                                                name="numero"
                                                value={tarjeta.numero}
                                                onChange={cambiarTarjeta}
                                                placeholder="1234 5678 9012 3456"
                                                inputMode="numeric"
                                                
                                            />
                                        </label>

                                        <label className="pago-campo">
                                            Nombre del titular
                                            <input
                                                name="titular"
                                                value={tarjeta.titular}
                                                onChange={cambiarTarjeta}
                                                placeholder="Como aparece en la tarjeta"
                                                
                                            />
                                        </label>

                                        <div className="pago-campos">
                                            <label className="pago-campo">
                                                Vencimiento
                                                <input
                                                    name="vencimiento"
                                                    value={tarjeta.vencimiento}
                                                    onChange={cambiarTarjeta}
                                                    placeholder="MM/AA"
                                                    
                                                />
                                            </label>
                                            <label className="pago-campo">
                                                CVV
                                                <input
                                                    name="cvv"
                                                    type="password"
                                                    value={tarjeta.cvv}
                                                    onChange={cambiarTarjeta}
                                                    placeholder="123"
                                                    
                                                />
                                            </label>
                                        </div>

                                    </div>
                                )}

                                {metodoPago === "transferencia" && (
                                    <div className="pago-info">
                                        <strong>Transferencia bancaria</strong>
                                        <p>
                                            Alias: las.musumes.mp
                                        </p>
                                        <p>
                                             CVU:00000031000257127636245
                                        </p>
                                        <img src="" alt="" />
                                    </div>
                                )}

                                {metodoPago === "efectivo" && (
                                    <div className="pago-info">
                                        <strong>Pago en efectivo</strong>
                                        <p>
                                            Se debera coordinar el pago al retirar
                                            o recibir tu pedido.
                                        </p>
                                    </div>
                                )}

                                <button
                                    className="pago-boton"
                                    type="button"
                                    onClick={confirmarCompra}
                                >
                                    CONFIRMAR PEDIDO ·{" "}
                                    {formatoPrecio(totalFinal)}
                                </button>

                                <button
                                    className="pago-boton-secundario"
                                    type="button"
                                    onClick={() => setPaso(1)}
                                >
                                    ← VOLVER A LOS DATOS
                                </button>
                            </div>
                        )}

                        {paso === 3 && (
                            <div className="pago-panel pago-exito">
                                <div className="pago-exito-icono">✓</div>
                                <h2>¡Pedido registrado!</h2>
                                <p>
                                    Gracias, {datos.nombre}. Registramos los
                                    datos de tu pedido en esta demostración.
                                </p>

                                <div className="pago-numero-pedido">
                                    Pedido #{pedidoId}
                                </div>

                                <p>
                                    <strong>Medio elegido:</strong>{" "}
                                    {metodoPago === "tarjeta"
                                        ? "Tarjeta (demostración)"
                                        : metodoPago === "mercadopago"
                                        ? "Mercado Pago (sin cobro)"
                                        : metodoPago === "transferencia"
                                        ? "Transferencia pendiente"
                                        : "Efectivo"}
                                </p>


                                <button
                                    className="pago-boton"
                                    type="button"
                                    onClick={finalizarCompra}
                                >
                                    VOLVER A LA TIENDA
                                </button>
                            </div>
                        )}
                    </div>

                    <aside className="pago-lateral">
                        <div className="pago-resumen">
                            <h2>🛍️ Resumen de tu pedido</h2>

                            <div className="pago-productos">
                                {carrito.map((producto, index) => (
                                    <div
                                        className="pago-producto"
                                        key={`${producto.id}-${index}`}
                                    >
                                        <div className="pago-producto-imagen">
                                            {producto.imagen ? (
                                                <img
                                                    src={producto.imagen}
                                                    alt={producto.nombre}
                                                />
                                            ) : (
                                                <span>🛍️</span>
                                            )}
                                        </div>
                                        <div className="pago-producto-info">
                                            <strong>{producto.nombre}</strong>
                                            <small>1 unidad</small>
                                        </div>
                                        <strong>
                                            {formatoPrecio(producto.precio)}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="pago-total-linea">
                                <span>Subtotal</span>
                                <span>{formatoPrecio(totalProductos)}</span>
                            </div>
                            <div className="pago-total-linea">
                                <span>Envío</span>
                                <span>{formatoPrecio(envio)}</span>
                            </div>
                            <div className="pago-total-final">
                                <span>Total</span>
                                <strong>{formatoPrecio(totalFinal)}</strong>
                            </div>
                            <p className="pago-envio-nota">
                                Tendremos en cuenta tu localidad para generar el precio del envio.
                            </p>
                        </div>

                        <div className="pago-protegido">
                            <span>🔒</span>
                            <div>
                                <strong>Tus datos, protegidos</strong>
                                <p>
                                    Completá los campos necesarios para
                                    preparar tu pedido.
                                </p>
                            </div>
                        </div>

                        <div className="pago-medios-aceptados">
                            <span>MEDIOS DE PAGO</span>
                            <div className="pago-logos">
                                <b className="logo-naranja">Naranja X</b>
                                <b className="logo-visa">VISA</b>
                                <b className="logo-master">
                                    <i /> <i /> <small>mastercard</small>
                                </b>
                            </div>
                        </div>
                    </aside>
                </div>

                <footer className="pago-footer">
                    <span>Proceso de compra</span>
                </footer>
            </div>
        </div>
    );
}
