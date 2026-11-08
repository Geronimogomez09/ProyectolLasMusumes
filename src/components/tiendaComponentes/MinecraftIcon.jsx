// Rutas de los recursos pixelados reutilizados por los componentes de la tienda.
const ICONOS_MINECRAFT = {
    carrito: "/iconos/carrito.png",
    producto: "/iconos/diamond.png",
    envio: "/iconos/gold_ingot.png",
    tarjeta: "/iconos/tarjeta.png",
    transferencia: "/iconos/transferencia.png",
    efectivo: "/iconos/efectivo.png",
    resumen: "/iconos/carrito.png",
    entrega: "/iconos/grass_block.png",
    seguro: "/iconos/candado.png",
    bloqueo: "/iconos/stone.png"
};

// Renderiza una tilde de texto o un recurso gráfico según el nombre solicitado.
export default function MinecraftIcon({ name, alt = "", className = "", size }) {
    // Los pasos del pago usan una tilde para indicar que una etapa ya se completó.
    if (name === "check") {
        return (
            <span
                className={`minecraft-check ${className}`.trim()}
                aria-label={alt || "Completado"}
                title={alt || "Completado"}
                style={size ? { width: size, height: size, fontSize: `calc(${size} * 0.7)` } : undefined}
            >
                ✓
            </span>
        );
    }

    const src = ICONOS_MINECRAFT[name];

    // No muestra una etiqueta vacía cuando se solicita un nombre sin recurso asociado.
    if (!src) {
        return null;
    }

    // El tamaño es opcional; si no se indica, los estilos de la clase controlan el ícono.
    return (
        <img
            src={src}
            alt={alt || name}
            className={`minecraft-icon ${className}`.trim()}
            style={size ? { width: size, height: size } : undefined}
        />
    );
}
