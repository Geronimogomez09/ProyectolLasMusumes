import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ListaComentarios from '../components/comunidadComponentes/lista-comentarios';
import DenunciaModal from '../components/comunidadComponentes/denuncia-modal';
import { EMOJIS_MINECRAFT, renderizarTextoConEmojis } from '../components/comunidadComponentes/emojis-minecraft';
import Header from '../components/header';
import Footer from '../components/Footer';
import BotonAdmin from '../components/botonAdmin';
import '../styles/Publicacion.css';
import { postsIniciales } from './comunidad';

const CLAVE_POSTS = 'wikicraft_comunidad_posts_v1';
const CLAVE_DENUNCIAS = 'wikicraft_comunidad_denuncias_v1';
const USUARIO_ACTUAL = { id: 'usuario-actual-demo', usuario: 'Vos', inicial: 'V', colorAvatar: '#2f9e50' };

function leerLocal(clave, alternativo = []) {
  try {
    const dato = localStorage.getItem(clave);
    return dato ? JSON.parse(dato) : alternativo;
  } catch {
    return alternativo;
  }
}

function EmojiIcono({ emoji, className = '' }) {
  const [fallo, setFallo] = useState(false);
  if (!emoji) return <span className={`${className} publicacion-emoji-fallback`} role="img" aria-label="Reacción">🙂</span>;
  // Los src relativos fallan en rutas anidadas como /publicacion/2. Resolverlos
  // desde la raíz del sitio evita que el navegador busque /publicacion/assets/...
  const src = emoji.src ? new URL(emoji.src, window.location.origin + '/').href : '';
  if (fallo || !src) {
    const respaldo = ({ creeper: '🟩', diamante: '💎', esmeralda: '💚', estrella: '⭐', hierro: '⛏️', oro: '🪙', netherita: '🟪' })[emoji.id] || '🎮';
    return <span className={`${className} publicacion-emoji-fallback`} role="img" aria-label={emoji.nombre} title={emoji.nombre}>{respaldo}</span>;
  }
  return <img className={className} src={src} alt={emoji.nombre} title={emoji.nombre} onError={() => setFallo(true)} />;
}

function Publicacion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState(() => leerLocal(CLAVE_POSTS, postsIniciales));
  const [denuncias, setDenuncias] = useState(() => leerLocal(CLAVE_DENUNCIAS));
  
  const [denunciaObjetivo, setDenunciaObjetivo] = useState(null);
  const [editandoPost, setEditandoPost] = useState(false);
  const [textoPost, setTextoPost] = useState('');
  const [likes, setLikes] = useState(false);
  const [reaccionesUsuario, setReaccionesUsuario] = useState({});
  const [pickerReaccionAbierto, setPickerReaccionAbierto] = useState(false);

  const post = posts.find((item) => String(item.id) === String(id));
  const emojisPorId = useMemo(() => Object.fromEntries(EMOJIS_MINECRAFT.map((emoji) => [emoji.id, emoji])), []);
  const reaccionesVisibles = useMemo(() => {
    if (!post) return [];
    const propias = reaccionesUsuario;
    const conteos = new Map((post.reacciones || []).map((r) => [r.emojiId, Number(r.conteo) || 0]));
    Object.keys(propias).forEach((emojiId) => {
      if (!conteos.has(emojiId)) conteos.set(emojiId, 0);
    });
    return [...conteos.entries()]
      .map(([emojiId, conteo]) => ({ emojiId, total: conteo + (propias[emojiId] ? 1 : 0), activa: Boolean(propias[emojiId]) }))
      .filter((r) => r.total > 0);
  }, [post, reaccionesUsuario]);

  useEffect(() => {
    try { localStorage.setItem(CLAVE_POSTS, JSON.stringify(posts)); } catch (error) { console.warn('No se pudieron guardar las publicaciones.', error); }
  }, [posts]);

  useEffect(() => {
    try { localStorage.setItem(CLAVE_DENUNCIAS, JSON.stringify(denuncias)); } catch (error) { console.warn('No se pudieron guardar las denuncias.', error); }
  }, [denuncias]);

  function esPropia(elemento) {
    return elemento?.autorId === USUARIO_ACTUAL.id || (!elemento?.autorId && elemento?.usuario === USUARIO_ACTUAL.usuario);
  }

  function actualizarPost(actualizado) {
    setPosts((prev) => prev.map((p) => String(p.id) === String(id) ? actualizado(p) : p));
  }

  function toggleEmojiReaccion(emojiId) {
    setReaccionesUsuario((prev) => ({ ...prev, [emojiId]: !prev[emojiId] }));
    setPickerReaccionAbierto(false);
  }

  function agregarComentario({ texto }) {
    actualizarPost((p) => ({
      ...p,
      comentarios: [...(p.comentarios || []), { id: Date.now(), ...USUARIO_ACTUAL, autorId: USUARIO_ACTUAL.id, texto }],
    }));
  }

  function editarComentario(comentarioId, texto) {
    actualizarPost((p) => ({
      ...p,
      comentarios: (p.comentarios || []).map((c) => c.id === comentarioId ? { ...c, texto, editado: true } : c),
    }));
  }

  function eliminarComentario(comentarioId) {
    const comentario = post?.comentarios?.find((c) => c.id === comentarioId);
    if (!esPropia(comentario)) return;
    if (!window.confirm('¿Querés eliminar este comentario?')) return;
    actualizarPost((p) => ({ ...p, comentarios: (p.comentarios || []).filter((c) => c.id !== comentarioId) }));
  }

  function confirmarDenuncia(datos) {
    const destino = denunciaObjetivo;
    const comentario = destino?.tipo === 'comentario' ? post?.comentarios?.find((c) => c.id === destino.comentarioId) : null;
    if (!post) return;
    setDenuncias((prev) => [...prev, {
      id: Date.now(),
      tipoContenido: destino?.tipo || 'publicacion',
      postId: post.id,
      comentarioId: destino?.comentarioId ?? null,
      ...datos,
      usuarioPost: comentario?.usuario || post.usuario,
      contenidoPost: comentario?.texto || post.contenido,
      contextoPublicacion: post.contenido,
      usuarioPublicacion: post.usuario,
      fecha: new Date().toLocaleString('es-AR'),
      estado: 'Pendiente',
    }]);
    setDenunciaObjetivo(null);
    window.alert('Gracias. La denuncia quedó registrada para revisión.');
  }

  function borrarPublicacion() {
    if (!esPropia(post)) return;
    if (!window.confirm('¿Seguro que querés eliminar esta publicación?')) return;
    setPosts((prev) => prev.filter((p) => String(p.id) !== String(id)));
    setDenuncias((prev) => prev.map((d) => String(d.postId) === String(id) ? { ...d, estado: 'Publicación eliminada' } : d));
    navigate('/comunidad');
  }

  if (!post) {
    return (
      <>
        <Header />
        <main className="publicacion-main">
          <section className="publicacion-no-encontrada">
            <span className="publicacion-no-encontrada__icono">⛏</span>
            <p className="publicacion-eyebrow">WIKI-CRAFT / COMUNIDAD</p>
            <h1>Publicación no encontrada</h1>
            <p>Puede que se haya eliminado o que el enlace no sea válido.</p>
            <Link to="/comunidad" className="publicacion-volver">← Volver a Comunidad</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  const comentarios = post.comentarios || [];

  return (
    <>
      <Header />
      <main className="publicacion-main">
        <div className="publicacion-page-header">
          <div className="publicacion-breadcrumb"><Link to="/comunidad">Comunidad</Link><span>/</span><span>Publicación #{post.id}</span></div>
          <p className="publicacion-eyebrow">CENTRO DE COMUNIDAD / DETALLE</p>
          <h1>Publicacion</h1>
          <p className="publicacion-page-subtitulo">Conversá, compartí reacciones y seguí la charla con la comunidad.</p>
        </div>

        <article className="publicacion-detalle">
          <div className="publicacion-autor">
            <div className="publicacion-avatar" style={{ backgroundColor: post.colorAvatar || '#4a6fa5' }}>{post.inicial || post.usuario?.charAt(0) || '?'}</div>
            <div className="publicacion-autor__datos">
              <strong>{post.usuario}</strong>
              <span>{post.tiempo || 'Publicación de la comunidad'}{post.contexto ? ` · ${post.contexto}` : ''}</span>
            </div>
            <span className="publicacion-categoria">{post.categoria || 'Comunidad'}</span>
            <button className="publicacion-icon-action publicacion-denunciar" type="button" onClick={() => setDenunciaObjetivo({ tipo: 'publicacion' })} aria-label="Denunciar publicación" title="Denunciar publicación">⚑</button>
          </div>

          {editandoPost ? (
            <div className="publicacion-edicion">
              <textarea aria-label="Editar publicación" value={textoPost} onChange={(e) => setTextoPost(e.target.value)} rows={5} />
              <div>
                <button onClick={() => { if (!textoPost.trim()) return; actualizarPost((p) => ({ ...p, contenido: textoPost.trim(), editado: true })); setEditandoPost(false); }}>Guardar cambios</button>
                <button className="secundario" onClick={() => setEditandoPost(false)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="publicacion-contenido">{renderizarTextoConEmojis(post.contenido)}{post.editado && <small> · editado</small>}</div>
          )}

          {post.imagen && <img className="publicacion-imagen" src={post.imagen} alt="Imagen adjunta a la publicación" />}

          {esPropia(post) && !editandoPost && (
            <div className="publicacion-acciones-propias">
              <span>Tu publicación</span>
              <button onClick={() => { setTextoPost(post.contenido); setEditandoPost(true); }}>✎ Editar</button>
              <button className="peligro" onClick={borrarPublicacion}>⌫ Eliminar</button>
            </div>
          )}

          <div className="publicacion-interacciones">
            <div className="publicacion-reacciones">
              <button className={`publicacion-like ${likes ? 'activa' : ''}`} onClick={() => setLikes((v) => !v)} aria-pressed={likes}>
                <span aria-hidden="true">❤️</span><span>{Number(post.likes || 0) + (likes ? 1 : 0)}</span>
              </button>
              {reaccionesVisibles.map((r) => (
                <button key={r.emojiId} className={`publicacion-reaccion ${r.activa ? 'activa' : ''}`} onClick={() => toggleEmojiReaccion(r.emojiId)} title={emojisPorId[r.emojiId]?.nombre || r.emojiId} aria-pressed={r.activa}>
                  <EmojiIcono emoji={emojisPorId[r.emojiId]} /><span>{r.total}</span>
                </button>
              ))}
              <div className="publicacion-reaccion-picker-wrap">
                <button className={`publicacion-agregar-reaccion ${pickerReaccionAbierto ? 'activa' : ''}`} type="button" onClick={() => setPickerReaccionAbierto((v) => !v)} aria-label="Agregar reacción" aria-expanded={pickerReaccionAbierto}>＋ <span>Reaccionar</span></button>
                {pickerReaccionAbierto && (
                  <div className="publicacion-reaccion-picker" role="listbox" aria-label="Elegir reacción">
                    {EMOJIS_MINECRAFT.map((emoji) => (
                      <button key={emoji.id} type="button" className="publicacion-reaccion-picker__item" title={emoji.nombre} onClick={() => toggleEmojiReaccion(emoji.id)}>
                        <EmojiIcono emoji={emoji} /><span>{emoji.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span className="publicacion-interacciones__nota">Las reacciones ayudan a destacar el contenido de la comunidad.</span>
          </div>

          <section className="publicacion-comentarios">
            <div className="publicacion-comentarios__titulo">
              <div><span>CONVERSACIÓN</span><h2>Comentarios</h2><p>Compartí tu opinión con respeto.</p></div>
              <b>{comentarios.length}</b>
            </div>
            <ListaComentarios
              comentarios={comentarios}
              onAgregarComentario={agregarComentario}
              modoUsuario={true}
              usuarioActualId={USUARIO_ACTUAL.id}
              onEditarComentario={(comentarioId, texto) => {
                const c = comentarios.find((item) => item.id === comentarioId);
                if (esPropia(c)) editarComentario(comentarioId, texto);
              }}
              onEliminarComentario={eliminarComentario}
              onDenunciarComentario={(comentario) => setDenunciaObjetivo({ tipo: 'comentario', comentarioId: comentario.id })}
            />
          </section>
        </article>
      </main>

      <BotonAdmin alAlternar={() => navigate('/comunidad?admin=1')} />
      {denunciaObjetivo && <DenunciaModal tipoContenido={denunciaObjetivo.tipo} onConfirmar={confirmarDenuncia} onCancelar={() => setDenunciaObjetivo(null)} />}
      <Footer />
    </>
  );
}

export default Publicacion;
