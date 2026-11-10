import { useState } from 'react';
import { renderizarTextoConEmojis } from './emojis-minecraft';
import ComentarioForm from './comentario-form';
import AvatarComunidad from './avatar-comunidad';
import '../../styles/lista-comentarios.css';

// ÍNDICE GENERAL
// 1. Propiedades de datos, identidad y moderación
// 2. Estado local de edición
// 3. Validación y envío de un comentario editado
// 4. Renderizado de permisos, denuncias y formulario nuevo

// LISTA REUTILIZABLE DE COMENTARIOS
// El componente recibe comentarios y callbacks; no escribe directamente en Firestore.
// Así puede mostrarse tanto dentro del muro como en el detalle de publicación. El padre
// conoce el id de la publicación y decide cómo crear, actualizar o borrar, mientras esta
// lista controla únicamente qué comentario se edita y cómo se presenta cada acción.

function ListaComentarios({
  comentarios,
  onAgregarComentario,
  modoAdministrador = false,
  modoUsuario = false,
  usuarioActualId,
  fotoUsuarioActual = '',
  onEditarComentario,
  onEliminarComentario,
  onDenunciarComentario,
}) {
  // comentarioEditando guarda un id o null. textoEditado guarda una copia temporal del
  // texto, por lo que escribir no cambia el comentario mostrado hasta pulsar Guardar.
  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [textoEditado, setTextoEditado] = useState('');

  function comenzarEdicion(comentario) {
    // Copia el texto actual y registra su id. La siguiente renderización reemplaza solo
    // esa fila por un textarea controlado.
    setComentarioEditando(comentario.id);
    setTextoEditado(comentario.texto);
  }

  function guardarEdicion(id) {
    // trim evita guardar un comentario compuesto solo de espacios. El callback opcional
    // ?. permite reutilizar una lista de solo lectura sin provocar un error por faltar la
    // función de edición. Tras enviar, se limpia el estado aunque el guardado remoto se
    // complete en el componente padre mediante una suscripción.
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
      {/* Una lista vacía no necesita map(): muestra un mensaje que explica el estado. */}
      {comentarios.length === 0 && (
        <p className="lista-comentarios__vacio">Todavía no hay comentarios. Sé el primero.</p>
      )}
      {comentarios.map((c) => (
        <div key={c.id} className="comentario">
          <AvatarComunidad
            className="avatar avatar--comentario"
            style={{ backgroundColor: c.colorAvatar }}
            foto={
              c.autorFoto ||
              c.fotoPerfil ||
              (c.autorId === usuarioActualId ? fotoUsuarioActual : '')
            }
            nombre={c.autorNombre || c.usuario}
          />
          <div className="comentario__cuerpo">
            <span className="comentario__usuario">{c.usuario}</span>
            {comentarioEditando === c.id ? (
              <div className="comentario-edicion">
                <textarea value={textoEditado} onChange={(e) => setTextoEditado(e.target.value)} rows={3} />
                <button type="button" onClick={() => guardarEdicion(c.id)}>Guardar</button>
                <button type="button" onClick={() => setComentarioEditando(null)}>Cancelar</button>
              </div>
            ) : <p className="comentario__texto">{renderizarTextoConEmojis(c.texto)}</p>}
            {/* Los permisos se evalúan por fila. Un moderador puede eliminar cualquier
                comentario; un usuario normal solo actúa sobre su propio autorId. */}
            {comentarioEditando !== c.id && (
              (modoAdministrador || (modoUsuario && (c.autorId === usuarioActualId || (!c.autorId && c.usuario === 'Vos')))) && (
                <div className="admin-comentario-acciones">
                  {!modoAdministrador && (modoUsuario && (c.autorId === usuarioActualId || (!c.autorId && c.usuario === 'Vos'))) && (
                    <button type="button" onClick={() => comenzarEdicion(c)}>✎ Editar</button>
                  )}
                  <button type="button" className="admin-eliminar" onClick={() => onEliminarComentario?.(c.id)}>⌫ Eliminar</button>
                </div>
              )
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
