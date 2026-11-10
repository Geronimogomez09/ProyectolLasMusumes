
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Índice: Desplazamiento al inicio.
// ----------------- Desplazamiento al inicio -----------------
// Observa los cambios de ruta y lleva la página al comienzo. No recibe propiedades; sincroniza la posición de desplazamiento con la navegación.

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
    }, [pathname]);

    return null;
}
