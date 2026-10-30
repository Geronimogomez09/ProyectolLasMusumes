import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { buscarNovedadDePublicacion, destacarPublicacion } from "../../data/inicio";
import { ModalFormulario } from "./ModalAdmin";
import "../../styles/admin.css";

/* ============================================================================
   BOTÓN "DESTACAR EN INICIO"
   ----------------------------------------------------------------------------
   Va en la página de una publicación. Al apretarlo pide título, descripción e
   imagen y guarda una tarjeta nueva en los datos de Inicio (data/inicio.js).
   El resto se completa solo:

     autor      -> publicacion.autor (o "Comunidad Wiki-Craft")
     categoría  -> publicacion.categoria (o "COMUNIDAD")
     fecha      -> la de hoy
     enlace     -> publicacion.enlace (o la dirección de la página actual)

   La tarjeta queda oculta: se activa desde Inicio, en modo administrador.

   Uso:
     <DestacarEnInicio
        publicacion={{ id, descripcion, imagen, autor, categoria, enlace }}
     />
   (titulo es opcional: si falta, se arma con el comienzo de la descripción.)
   ========================================================================= */

const CAMPOS = [
    {
        nombre: "titulo",
        etiqueta: "Título",
        tipo: "texto",
        requerido: true,
        ayuda: "Es el título que se verá en la tarjeta de Inicio.",
    },
    {
        nombre: "descripcion",
        etiqueta: "Descripción",
        tipo: "area",
        requerido: true,
        ayuda: "Un resumen corto, de una o dos frases.",
    },
    {
        nombre: "imagen",
        etiqueta: "Imagen",
        tipo: "imagen",
        requerido: true,
    },
];

// Acorta un texto largo sin cortar palabras a la mitad.
function resumir(texto = "", max = 140) {
    const limpio = String(texto).replace(/\s+/g, " ").trim();
    if (limpio.length <= max) return limpio;

    const corte = limpio.slice(0, max);
    const ultimoEspacio = corte.lastIndexOf(" ");
    return `${corte.slice(0, ultimoEspacio > 30 ? ultimoEspacio : max)}…`;
}

export default function DestacarEnInicio({ publicacion = {} }) {
    const { pathname } = useLocation();

    // Si la publicación no trae id, se usa la dirección de la página.
    const origenId = String(publicacion.id ?? pathname);

    const [abierto, setAbierto] = useState(false);
    const [error, setError] = useState("");
    const [tarjeta, setTarjeta] = useState(() => buscarNovedadDePublicacion(origenId));

    const guardar = (datos) => {
        const novedad = destacarPublicacion({
            origenId,
            ...datos,
            autor: publicacion.autor,
            categoria: publicacion.categoria,
            enlace: publicacion.enlace ?? pathname,
        });

        if (!novedad) {
            setAbierto(false);
            setError("No se pudo guardar: el navegador se quedó sin espacio. Probá con una imagen más chica.");
            return;
        }

        setError("");
        setTarjeta(novedad);
        setAbierto(false);
    };

    return (
        <div className="admin-destacar">
            {tarjeta ? (
                <>
                    <span className="admin-chip activa">
                        <i className="bi bi-star-fill"></i>
                        Tarjeta creada en Inicio
                    </span>

                    <Link to="/" className="admin-enlace">
                        Activarla desde Inicio
                        <i className="bi bi-arrow-right"></i>
                    </Link>
                </>
            ) : (
                <>
                    <button
                        type="button"
                        className="admin-boton principal"
                        onClick={() => setAbierto(true)}
                    >
                        <i className="bi bi-star-fill"></i>
                        Destacar en Inicio
                    </button>

                    <small className="admin-campo-ayuda">
                        Crea una tarjeta en Inicio. Queda oculta hasta que la actives desde ahí.
                    </small>
                </>
            )}

            {error && <p className="admin-campo-error" role="alert">{error}</p>}

            {abierto && (
                <ModalFormulario
                    titulo="Destacar en Inicio"
                    campos={CAMPOS}
                    datos={{
                        titulo: publicacion.titulo ?? resumir(publicacion.descripcion, 60),
                        descripcion: resumir(publicacion.descripcion),
                        imagen: publicacion.imagen ?? "",
                    }}
                    textoGuardar="Crear tarjeta"
                    onGuardar={guardar}
                    onCerrar={() => setAbierto(false)}
                />
            )}
        </div>
    );
}
