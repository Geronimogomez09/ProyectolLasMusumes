import { categorias } from "../../data/productos";

// Índice: Categorías de productos.
// ----------------- Categorías de productos -----------------
// Recibe la categoría activa y la acción para cambiarla. Presenta los filtros que permiten explorar productos por categoría.

// Relaciona el valor interno de cada categoría con el ícono que usa la interfaz.
const iconosCategoria = {
    Ropa: "/iconos/categoria-ropa.png",
    Objetos: "/iconos/categoria-tazas.png",
    Dormitorio: "/iconos/categoria-sabanas.png",
    Figuras: "/iconos/categoria-figuras.png",
    Accesorios: "/iconos/categoria-accesorios.png",
    "Decoración": "/iconos/categoria-decoracion.png",
    Otros: "/iconos/categoria-otros.png"
};

export default function CategoriasTienda({
    categoriaActiva,
    setCategoriaActiva
}) {

    return (

        <section className="categorias">

            {/* Separa el valor usado para filtrar de la etiqueta que ve la persona. */}
            {categorias.map(([valor, texto]) => (

                <button
                    key={valor}
                    className={
                        `categoria-btn ${
                            categoriaActiva === valor
                                ? "activa"
                                : ""
                        }`
                    }
                    onClick={() =>
                        setCategoriaActiva(valor)
                    }
                >
                    {iconosCategoria[valor] && (
                        <img
                            src={iconosCategoria[valor]}
                            alt=""
                            aria-hidden="true"
                            className="categoria-icono"
                        />
                    )}
                    {texto}
                </button>

            ))}

        </section>

    );
}