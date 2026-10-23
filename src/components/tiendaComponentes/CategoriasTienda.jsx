import { categorias } from "../../data/productos";

const iconosCategoria = {
    Ropa: "/iconos/categoria-ropa.png",
    Tazas: "/iconos/categoria-tazas.png",
    "Sábanas": "/iconos/categoria-sabanas.png",
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