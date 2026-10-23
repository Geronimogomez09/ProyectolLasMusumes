import { categorias } from "../../data/productos";

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
                    {texto}
                </button>

            ))}

        </section>

    );
}