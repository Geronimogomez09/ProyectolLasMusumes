import { renderizarTextoConEmojis } from './emojis-minecraft';
import ComentarioForm from './comentario-form';
import './lista-comentarios.css';

// comentarios: array de { id, usuario, inicial, colorAvatar, texto }
// onAgregarComentario: (comentario) => void — lo dispara ComentarioForm
function ListaComentarios({ comentarios, onAgregarComentario }) {
  return (
    <div className="lista-comentarios">
      {comentarios.length === 0 && (
        <p className="lista-comentarios__vacio">Todavía no hay comentarios. Sé el primero.</p>
      )}

      {comentarios.map((c) => (
        <div key={c.id} className="comentario">
          <div className="avatar avatar--comentario" style={{ backgroundColor: c.colorAvatar }}>
            {c.inicial}
          </div>
          <div className="comentario__cuerpo">
            <span className="comentario__usuario">{c.usuario}</span>
            <p className="comentario__texto">{renderizarTextoConEmojis(c.texto)}</p>
          </div>
        </div>
      ))}

      <ComentarioForm onEnviar={onAgregarComentario} />
    </div>
  );
}

export default ListaComentarios;
