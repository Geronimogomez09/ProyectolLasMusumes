import { EnlaceInicio } from "./EdicionInicio";

// Índice: Productos de tienda en el inicio.
// ----------------- Productos de tienda en el inicio -----------------
// No recibe propiedades; obtiene y presenta el bloque de productos destacados dentro de la página principal.

// TIENDA INICIO: banner al final del inicio ("Equipate para tu próxima aventura")
// con el botón "Explorar la tienda". Es texto fijo, no se edita.
export default function TiendaInicio() {
    return (
        <section className="inicio-tienda">
            <div>
                <span className="inicio-categoria">
                    TIENDA WIKI-CRAFT
                </span>

                <h2>Equipate para tu próxima aventura</h2>

                <p>
                    Explorá los productos disponibles y encontrá algo para
                    vos o para regalarle a otro jugador.
                </p>
            </div>

            <EnlaceInicio to="/tienda" className="btn inicio-btn-principal">
                Explorar la tienda
                <i className="bi bi-arrow-right ms-2"></i>
            </EnlaceInicio>
        </section>
    );
}
