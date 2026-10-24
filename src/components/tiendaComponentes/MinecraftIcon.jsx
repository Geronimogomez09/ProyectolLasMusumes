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

export default function MinecraftIcon({ name, alt = "", className = "", size }) {
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

    if (!src) {
        return null;
    }

    return (
        <img
            src={src}
            alt={alt || name}
            className={`minecraft-icon ${className}`.trim()}
            style={size ? { width: size, height: size } : undefined}
        />
    );
}
