// components/comunidadComponentes/nuevo-post.jsx
import { useState, useRef } from 'react';

function NuevoPost({ usuario, categorias, onPublicar }) {
  const [texto, setTexto] = useState('');
  const [etiqueta, setEtiqueta] = useState('');
  const [mostrarSelectorEtiqueta, setMostrarSelectorEtiqueta] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [error, setError] = useState('');
  const inputImagenRef = useRef(null);

  function handleImagenSeleccionada(e) {
    const archivo = e.target.files[0];
    if (archivo) setImagenPreview(URL.createObjectURL(archivo));
  }

  function handlePublicar() {
    if (!texto.trim()) {
      setError('Escribí algo antes de publicar.');
      return;
    }
    if (!etiqueta) {
      setError('Elegí una etiqueta para tu publicación.');
      return;
    }

    onPublicar({ contenido: texto.trim(), categoria: etiqueta, imagen: imagenPreview });

    setTexto('');
    setEtiqueta('');
    setImagenPreview(null);
    setMostrarSelectorEtiqueta(false);
    setError('');
  }

  return (
    <section className="nuevo-post cascada-item">
      <div className="nuevo-post__fila">
        <div className="avatar avatar--propio">{usuario.inicial}</div>
        <textarea
          className="nuevo-post__texto"
          placeholder="¿Que vas a escribir hoy?"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={2}
        />
      </div>

      {imagenPreview && (
        <div className="nuevo-post__preview">
          <img src={imagenPreview} alt="Vista previa de la imagen a publicar" />
          <button
            className="nuevo-post__quitar-imagen"
            onClick={() => setImagenPreview(null)}
            aria-label="Quitar imagen"
          >
            ×
          </button>
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

          <button
            className="btn-imagen"
            onClick={() => inputImagenRef.current.click()}
            aria-label="Adjuntar imagen"
          >
            🖼
          </button>
          <input
            type="file"
            accept="image/*"
            ref={inputImagenRef}
            onChange={handleImagenSeleccionada}
            hidden
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