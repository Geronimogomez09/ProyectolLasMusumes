import { useState } from 'react';
import { renderizarTextoConEmojis } from './emojis-minecraft';
import ComentarioForm from './comentario-form';
import '../../styles/lista-comentarios.css';

function ListaComentarios({
  comentarios,
  onAgregarComentario,
  modoAdministrador = false,
  modoUsuario = false,
  usuarioActualId,
  onEditarComentario,
  onEliminarComentario,
  onDenunciarComentario,
}) {
  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  function comenzarEdicion(comentario) {
    setComentarioEditando(comentario.id);
    setTextoEditado(comentario.texto);
  }

  function guardarEdicion(id) {
    if (!textoEditado.trim()) {
      window.alert('El comentario no puede quedar vacío.');
      return;
    }
    onEditarComentario?.(id, textoEditado.trim());
    setComentarioEditando(null);
    setTextoEditado('');
  }

  return (
    <div className="lista-comentarios">
      {comentarios.length === 0 && (
        <p className="lista-comentarios__vacio">Todavía no hay comentarios. Sé el primero.</p>
      )}
      {comentarios.map((c) => (
        <div key={c.id} className="comentario">
          <div className="avatar avatar--comentario" style={{ backgroundColor: c.colorAvatar }}>{c.inicial}</div>
          <div className="comentario__cuerpo">
            <span className="comentario__usuario">{c.usuario}</span>
            {comentarioEditando === c.id ? (
              <div className="comentario-edicion">
                <textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} rows={3} />
                <button type="button" onClick={() => guardarEdicion(c.id)}>Guardar</button>
                <button type="button" onClick={() => setComentarioEditando(null)}>Cancelar</button>
              </div>
            ) : <p className="comentario__texto">{renderizarTextoConEmojis(c.texto)}</p>}
            {(modoAdministrador || (modoUsuario && (c.autorId === usuarioActualId || (!c.autorId && c.usuario === 'Vos')))) && comentarioEditando !== c.id && (
              <div className="admin-comentario-acciones">
                <button type="button" onClick={() => comenzarEdicion(c)}>✎ Editar</button>
                <button type="button" className="admin-eliminar" onClick={() => onEliminarComentario?.(c.id)}>⌫ Eliminar</button>
              </div>
            )}
            {typeof onDenunciarComentario === 'function' && comentarioEditando !== c.id && (
              <button
                type="button"
                className="comentario__denunciar"
                onClick={() => onDenunciarComentario(c)}
                aria-label={`Denunciar comentario de ${c.usuario}`}
              >⚑ Denunciar comentario</button>
            )}
          </div>
        </div>
      ))}
      <ComentarioForm onEnviar={onAgregarComentario} />
    </div>
  );
}

export default ListaComentarios;
