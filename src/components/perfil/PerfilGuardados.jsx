import { Link } from "react-router-dom";

// Índice: Publicaciones y productos guardados.
// ----------------- Publicaciones y productos guardados -----------------
// Recibe los elementos guardados y la acción para quitarlos. Los agrupa por tipo y comunica cada cambio al perfil.

// BLOQUE GUARDADO PERFIL: lista de un tipo de contenido guardado (canciones, publicaciones o productos).
// PARA QUÉ SE USA: dentro de PerfilGuardados, una vez por cada tipo.
// QUÉ MUESTRA: título del bloque, una fila por elemento con botón "Quitar" o un mensaje si está vacío.
// Recibe: titulo, icono (clase bi), vacio (texto), items (lista {id, titulo, detalle, imagen, enlace})
// y onQuitar(id). Si enlace es null, el elemento ya no existe y solo se puede quitar.
function BloqueGuardado({ titulo, icono, vacio, items, onQuitar }) {
  return (
    <article className="perfil-bloque">
      <div className="perfil-bloque-cab">
        <h3><i className={`bi ${icono}`} /> {titulo}</h3>
        <small className="perfil-contador">{items.length}</small>
      </div>

      {items.length === 0 && <p className="perfil-vacio-chico">{vacio}</p>}

      {items.map((item) => (
        <div className="perfil-guardado-fila" key={item.id}>
          {item.imagen ? (
            <img className="perfil-guardado-img" src={item.imagen} alt="" />
          ) : (
            <span className="perfil-guardado-img perfil-guardado-img--vacia">
              <i className={`bi ${icono}`} />
            </span>
          )}

          <div className="perfil-guardado-texto">
            {item.enlace ? (
              <Link to={item.enlace}><strong>{item.titulo}</strong></Link>
            ) : (
              <strong>{item.titulo}</strong>
            )}
            <small>{item.detalle}</small>
          </div>

          <button
            type="button"
            className="perfil-btn-quitar"
            onClick={() => onQuitar(item.id)}
            aria-label={`Quitar ${item.titulo} de guardados`}
          >
            Quitar
          </button>
        </div>
      ))}
    </article>
  );
}

// GUARDADOS PERFIL: sección "Contenido guardado" del perfil.
// PARA QUÉ SE USA: ver y quitar las canciones, publicaciones y productos que el usuario guardó.
// QUÉ MUESTRA: tres bloques (canciones favoritas, publicaciones guardadas, productos favoritos).
// Cada bloque filtra la colección completa por los ids guardados.
// Recibe: idsCanciones, idsPublicaciones, idsProductos (ids guardados, como texto),
// canciones, publicaciones, productos (colecciones completas) y onQuitar(tipo, id)
// donde tipo es "cancion", "publicacion" o "producto".
export default function PerfilGuardados({
  idsCanciones,
  idsPublicaciones,
  idsProductos,
  canciones,
  publicaciones,
  productos,
  onQuitar,
}) {
  // ITEMS CANCIONES: por cada id guardado busca la canción. Si ya no existe, queda como "no disponible".
  const itemsCanciones = idsCanciones.map((id) => {
    const cancion = canciones.find((c) => String(c.id) === String(id));
    if (!cancion) {
      return { id, titulo: "Canción no disponible", detalle: "Ya no está en el catálogo", enlace: null };
    }
    return {
      id,
      titulo: cancion.title,
      detalle: "Canción",
      imagen: cancion.cover,
      enlace: `/musica/cancion/${cancion.id}`,
    };
  });

  // ITEMS PUBLICACIONES: por cada id guardado busca la publicación de Comunidad.
  const itemsPublicaciones = idsPublicaciones.map((id) => {
    const pub = publicaciones.find((p) => String(p.id) === String(id));
    if (!pub) {
      return { id, titulo: "Publicación no disponible", detalle: "Puede haberse eliminado", enlace: null };
    }
    const texto = pub.contenido || "Publicación sin texto";
    return {
      id,
      titulo: texto.length > 70 ? `${texto.slice(0, 70)}…` : texto,
      detalle: `De ${pub.autorNombre || "Usuario"} · ${pub.categoria || "General"}`,
      imagen: pub.imagen,
      enlace: `/publicacion/${pub.id}`,
    };
  });

  // ITEMS PRODUCTOS: por cada id guardado busca el producto de la Tienda.
  const itemsProductos = idsProductos.map((id) => {
    const producto = productos.find((p) => String(p.id) === String(id));
    if (!producto) {
      return { id, titulo: "Producto no disponible", detalle: "Ya no está en la tienda", enlace: null };
    }
    return {
      id,
      titulo: producto.nombre,
      detalle: `$${Number(producto.precio).toLocaleString("es-AR")}`,
      imagen: producto.imagen,
      enlace: `/tienda#producto=${producto.id}`,
    };
  });

  return (
    <div className="perfil-guardados">
      <BloqueGuardado
        titulo="Canciones favoritas"
        icono="bi-music-note-beamed"
        vacio="Todavía no marcaste canciones como favoritas."
        items={itemsCanciones}
        onQuitar={(id) => onQuitar("cancion", id)}
      />

      <BloqueGuardado
        titulo="Publicaciones guardadas"
        icono="bi-bookmark-heart"
        vacio="Todavía no guardaste publicaciones."
        items={itemsPublicaciones}
        onQuitar={(id) => onQuitar("publicacion", id)}
      />

      <BloqueGuardado
        titulo="Productos favoritos"
        icono="bi-bag-heart"
        vacio="Todavía no marcaste productos como favoritos."
        items={itemsProductos}
        onQuitar={(id) => onQuitar("producto", id)}
      />

      <div className="perfil-accesos">
        <Link to="/musica">Ir a música</Link>
        <Link to="/comunidad">Ir a la comunidad</Link>
        <Link to="/tienda">Ir a la tienda</Link>
      </div>
    </div>
  );
}
