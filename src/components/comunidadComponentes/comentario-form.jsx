import { useState, useRef } from 'react';
import { EMOJIS_MINECRAFT } from './emojis-minecraft';
import './comentario-form.css';

// Formulario reutilizable para escribir un comentario. No sabe nada del post
// al que pertenece: recibe onEnviar y devuelve { texto } cuando el usuario
// confirma. Así se puede reusar en Comunidad, y en otras páginas si hace falta.
function ComentarioForm({ onEnviar, placeholder = '¿Qué opinás?' }) {
  const [texto, setTexto] = useState('');
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const textareaRef = useRef(null);

  function insertarEmoji(id) {
    const textarea = textareaRef.current;
    const inicio = textarea.selectionStart;
    const fin = textarea.selectionEnd;
    const token = `:${id}:`;
    const nuevoTexto = texto.slice(0, inicio) + token + texto.slice(fin);

    setTexto(nuevoTexto);
    setMostrarPicker(false);

    // Vuelve a poner el cursor justo después del emoji insertado
    requestAnimationFrame(() => {
      textarea.focus();
      const nuevaPosicion = inicio + token.length;
      textarea.setSelectionRange(nuevaPosicion, nuevaPosicion);
    });
  }

  function handleEnviar() {
    if (!texto.trim()) return;
    onEnviar({ texto: texto.trim() });
    setTexto('');
  }

  return (
    <div className="comentario-form">
      <textarea
        ref={textareaRef}
        className="comentario-form__texto"
        placeholder={placeholder}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={2}
      />

      <div className="comentario-form__acciones">
        <div className="emoji-selector" style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn-emoji"
            onClick={() => setMostrarPicker((v) => !v)}
            aria-label="Elegir emoji"
          >
            🙂
          </button>

          {mostrarPicker && (
            <div
              className="emoji-picker"
              style={{
                position: 'absolute',
                bottom: '115%',
                left: 0,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '10px',
                boxShadow: '0 8px 22px rgba(0,0,0,0.15)',
                padding: '8px',
                zIndex: 20,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 44px)',
                gap: '6px',
              }}
            >
              {EMOJIS_MINECRAFT.map((emoji) => (
                <button
                  key={emoji.id}
                  type="button"
                  className="emoji-picker__item"
                  title={emoji.nombre}
                  style={{
                    width: '44px',
                    height: '44px',
                    overflow: 'hidden',
                    padding: '2px',
                  }}
                  onClick={() => insertarEmoji(emoji.id)}
                >
                  {/* Si la imagen todavía no existe en /assets, se ve el
                      texto de respaldo en vez de un ícono roto */}
                  <img
                    src={emoji.src}
                    alt={emoji.nombre}
                    style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'inline';
                    }}
                  />
                  <span className="emoji-picker__fallback">{emoji.nombre}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="btn-enviar-comentario" onClick={handleEnviar}>
          Comentar
        </button>
      </div>
    </div>
  );
}

export default ComentarioForm;
