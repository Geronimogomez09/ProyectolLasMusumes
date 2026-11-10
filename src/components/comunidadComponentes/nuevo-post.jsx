// Índice: Formulario para crear una publicación.
// ----------------- Formulario para crear una publicación -----------------
// Recibe los datos del usuario, las categorías y la acción para publicar. Reúne el contenido del post y lo entrega al componente de Comunidad para guardarlo.

// components/comunidadComponentes/nuevo-post.jsx
import { useState } from 'react';
import AvatarComunidad from './avatar-comunidad';

function NuevoPost({ usuario, categorias, onPublicar }) {
  const [texto, setTexto] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [mostrarSelectorEtiqueta, setMostrarSelectorEtiqueta] = useState(false);
  const [imagen, setImagen] = useState('');
  const [error, setError] = useState('');

  function handlePublicar() {
    if (!texto.trim()) {
      setError('Escribí algo antes de publicar.');
      return;
    }
    if (!etiqueta) {
      setError('Elegí una etiqueta para tu publicación.');
      return;
    }

    onPublicar({ contenido: texto.trim(), categoria: etiqueta, imagen: imagen.trim() });

    setTexto('');
    setEtiqueta('');
    setImagen('');
    setMostrarSelectorEtiqueta(false);
    setError('');
  }

  return (
    <section className="nuevo-post cascada-item">
      <div className="nuevo-post__fila">
        <AvatarComunidad
          className="avatar avatar--propio"
          foto={usuario.foto}
          nombre={usuario.nombre}
        />
        <textarea
          className="nuevo-post__texto"
          placeholder="¿Que vas a escribir hoy?"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
        />
      </div>

      {imagen.trim() && (
        <div className="nuevo-post__preview">
          <img src={imagen.trim()} alt="Vista previa de la imagen a publicar" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <button className="nuevo-post__quitar-imagen" onClick={() => setImagen('')} aria-label="Quitar imagen">×</button>
        </div>
      )}

      {error && <p className="nuevo-post__error">{error}</p>}

      <div className="nuevo-post__acciones">
        <div className="nuevo-post__acciones-izquierda">
          <div className="etiqueta-selector">
            <button
              className="btn-etiqueta"
              onClick={() => setMostrarSelectorEtiqueta((v) => !v)}
            >
              {etiqueta || 'Etiqueta'}
            </button>
            {mostrarSelectorEtiqueta && (
              <ul className="etiqueta-menu">
                {categorias.map((cat) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setEtiqueta(cat);
                        setMostrarSelectorEtiqueta(false);
                      }}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            className="nuevo-post__url-imagen"
            type="url"
            placeholder="URL de imagen (opcional)"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            aria-label="URL de imagen"
          />
        </div>

        <button className="btn-publicar" onClick={handlePublicar}>
          Publicar
        </button>
      </div>
    </section>
  );
}

export default NuevoPost;