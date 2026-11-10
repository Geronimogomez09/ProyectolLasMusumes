import ImagenAcceso from "./ImagenAcceso";

// PANEL INFORMATIVO: columna izquierda de la tarjeta de acceso.
// PARA QUÉ SE USA: login.jsx, al lado de FormularioLogin y FormularioRegistro.
// QUÉ MUESTRA: etiqueta "UN MUNDO POR DESCUBRIR", un título y una descripción que cambian
// según la vista, y las actividades Explorar, Crear y Compartir.
// Recibe: vista ("login" o "registro").
function PanelInformativo({ vista }) {
  const esLogin = vista === "login";

  return (
    <div className="col-md-4 border-end d-flex flex-column justify-content-center p-4 acceso-panel-izq">

      {/* ETIQUETA: texto decorativo que identifica la sección. */}
      <span className="acceso-panel-etiqueta">
        <i className="bi bi-flower1" />
        UN MUNDO POR DESCUBRIR
      </span>

      {/* TÍTULO Y DESCRIPCIÓN: cambian entre login y registro. */}
      <h2 className="fw-bold">
        {esLogin ? "¡Que bueno verte!" : "Creá tu aventura"}
      </h2>

      <p>
        {esLogin
          ? "Ingresá a tu cuenta y seguí explorando todo lo que la comunidad tiene para compartir."
          : "Unite a Wiki-Craft, compartí tus ideas y empezá a formar parte de nuestra comunidad."}
      </p>

      {/* PUNTOS DESTACADOS: actividades que ofrece el sitio. */}
      <div className="acceso-panel-puntos" aria-hidden="true">
        <span>
          <ImagenAcceso nombre="cartography_table.png" className="img-span" />
          Explorar
        </span>

        <span>
          <ImagenAcceso nombre="knowledge_book.png" className="img-span" /> Crear
        </span>

        <span>
          <ImagenAcceso nombre="AllayPixel.png" className="img-span" /> Compartir
        </span>
      </div>
    </div>
  );
}

export default PanelInformativo;