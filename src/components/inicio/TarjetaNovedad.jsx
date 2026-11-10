import { ControlesAdminInicio, EnlaceInicio } from "./EdicionInicio";
import { Imagen } from "./imagenesInicio";

// Índice: Tarjeta de novedad.
// ----------------- Tarjeta de novedad -----------------
// Recibe una novedad y presenta sus datos principales. Sus enlaces permiten abrir el contenido relacionado.

// TEXTO DEL ENLACE: lo que dice el enlace de la tarjeta según el tipo de novedad.
const TEXTO_ENLACE = {
    Comunidad: "Leer publicación",
    Versiones: "Ver versión",
    Tienda: "Ver producto",
    "Música": "Escuchar canción",
};

// TARJETA NOVEDAD INICIO: muestra una novedad automática en "Novedades" del inicio
// (imagen, tipo, título, fecha, autor, descripción y enlace).
// Recibe: novedad ({ tipo, titulo, descripcion, fecha, autor, imagen, enlace }),
// armada por cargarNovedadesInicio en services/inicio.js.
export default function TarjetaNovedad({ novedad }) {
    const categoria = novedad.categoria ?? novedad.tipo ?? "Novedad";

    return (
        <article className="card inicio-card-novedad h-100 position-relative">
            <ControlesAdminInicio tipo="novedad" item={novedad} />

            {/* Imagen de la novedad: también es un enlace. */}
            <EnlaceInicio to={novedad.enlace} className="inicio-novedad-imagen">
                <Imagen nombre={novedad.imagen} alt={novedad.titulo} />
            </EnlaceInicio>

            <div className="card-body">

                {/* Tipo de novedad: COMUNIDAD, VERSIONES, TIENDA o MÚSICA. */}
                <span className="inicio-categoria">
                    {categoria.toUpperCase()}
                </span>

                <h3>
                    <EnlaceInicio to={novedad.enlace}>
                        {novedad.titulo}
                    </EnlaceInicio>
                </h3>

                {/* Fecha y autor: solo se muestran si la novedad los tiene. */}
                <div className="inicio-metadata">
                    {novedad.fecha && (
                        <span>
                            <i className="bi bi-calendar3 me-1"></i>
                            {novedad.fecha}
                        </span>
                    )}

                    {novedad.autor && (
                        <span>
                            <i className="bi bi-person me-1"></i>
                            {novedad.autor}
                        </span>
                    )}
                </div>

                <p>{novedad.descripcion}</p>

                <EnlaceInicio to={novedad.enlace} className="inicio-leer-mas">
                    {TEXTO_ENLACE[novedad.tipo] || "Ver más"}
                    <i className="bi bi-arrow-up-right ms-1"></i>
                </EnlaceInicio>
            </div>
        </article>
    );
}
