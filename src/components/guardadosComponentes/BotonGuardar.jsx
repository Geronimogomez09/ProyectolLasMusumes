import "../../styles/botonGuardar.css";

// Índice: Guardar y quitar favoritos.
// ----------------- Guardar y quitar favoritos -----------------
// Recibe el tipo y el elemento que se puede guardar, junto con su estado y acción. Permite alternar el favorito y comunica el cambio al perfil o a la tienda.

// BOTON GUARDAR: botón para guardar o quitar un elemento (publicación o producto) de
// "Contenido guardado" del perfil. Muestra ♥/♡ (corazón) o ★/☆ (marcador) según esté
// guardado o no, y opcionalmente un texto al lado.
// Recibe: guardado (true/false), alAlternar (función), icono ("corazon" o "marcador"),
// variante ("normal", "flotante" sobre una tarjeta, o "ancho"), conTexto, textoActivo,
// textoInactivo y nombre (para el texto accesible).
// Se usa en comunidad.jsx, Publicacion.jsx, TarjetaProducto.jsx y DetalleProducto.jsx.
function BotonGuardar({
    guardado,
    alAlternar,
    icono = "corazon",
    variante = "normal",
    conTexto = false,
    textoActivo = "Guardado",
    textoInactivo = "Guardar",
    nombre = ""
}) {
    // SÍMBOLO DEL BOTÓN: elige el dibujo según el tipo de icono y si está guardado.
    const simbolos = {
        corazon: guardado ? "♥" : "♡",
        marcador: guardado ? "★" : "☆"
    };

    // CLICK DEL BOTÓN: evita que el clic abra la tarjeta que contiene al botón
    // (en la tienda, hacer clic en la tarjeta abre el detalle del producto).
    function manejarClick(evento) {
        evento.stopPropagation();
        alAlternar();
    }

    return (
        <button
            type="button"
            className={`boton-guardar boton-guardar--${icono} boton-guardar--${variante} ${
                guardado ? "boton-guardar--activo" : ""
            }`}
            onClick={manejarClick}
            aria-pressed={guardado}
            aria-label={`${guardado ? "Quitar de guardados" : "Guardar"} ${nombre}`.trim()}
            title={guardado ? "Quitar de guardados" : "Guardar"}
        >
            <span className="boton-guardar__icono" aria-hidden="true">
                {simbolos[icono]}
            </span>

            {conTexto && (
                <span className="boton-guardar__texto">
                    {guardado ? textoActivo : textoInactivo}
                </span>
            )}
        </button>
    );
}

export default BotonGuardar;