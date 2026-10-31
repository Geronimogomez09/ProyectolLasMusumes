// comunidad.jsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ListaComentarios from '../components/comunidadComponentes/lista-comentarios';
import DenunciaModal from '../components/comunidadComponentes/denuncia-modal';
import NuevoPost from '../components/comunidadComponentes/nuevo-post';
import { EMOJIS_MINECRAFT } from '../components/comunidadComponentes/emojis-minecraft';
import Footer from '../components/Footer';
import Header from '../components/header';
import '../styles/Comunidad.css';
// ---------------------------------------------------------------------------
// DATOS MOCKEADOS (posts)
// Cuando exista backend, este array se va a reemplazar por props:
// function Comunidad({ posts }) { ... }
// Cada post trae su propio array de comentarios (en vez de un número suelto),
// para poder listarlos y agregar nuevos de verdad.
// ---------------------------------------------------------------------------
export const postsIniciales = [
  {
    id: 1,
    usuario: 'Vale_ObsidianaBUILDER',
    inicial: 'V',
    colorAvatar: '#2f8f5b',
    tiempo: 'hace 2 horas',
    contexto: 'Survival 14',
    categoria: 'construcciones',
    contenido:
      'Saben si el hierro aparece en capas negativas?, estoy hace media hora buscando y no encuentro',
    likes: 5,
    reacciones: [
      { emojiId: 'creeper', conteo: 8 },
      { emojiId: 'diamante', conteo: 3 },
    ],
    comentarios: [
      {
        id: 101,
        usuario: 'PicapiedraXd',
        inicial: 'P',
        colorAvatar: '#7a5c3e',
        texto: 'Sí, a partir de Y -8 más o menos, llevate un pico de :hierro: por las dudas',
      },
      {
        id: 102,
        usuario: 'Nether_Kaiser',
        inicial: 'N',
        colorAvatar: '#b3462c',
        texto: 'Yo encontré una veta gigante cerca del bedrock jajaja :diamante:',
      },
    ],
  },
  {
    id: 2,
    usuario: 'Nether_Kaiser',
    inicial: 'N',
    colorAvatar: '#b3462c',
    tiempo: 'hace 5 horas',
    contexto: 'Hardcore 3',
    categoria: 'pvps',
    contenido:
      'Le gané un 1v3 en el Nether usando solo tridente. Alguien más juega PVP en este server?',
    likes: 23,
    reacciones: [{ emojiId: 'diamante', conteo: 4 }],
    comentarios: [],
  },
  {
    id: 3,
    usuario: 'ModderaEterna',
    inicial: 'M',
    colorAvatar: '#4a6fa5',
    tiempo: 'hace 1 día',
    contexto: 'Java 1.21',
    categoria: 'Mods',
    contenido:
      'Actualicé el pack de shaders + Create para 1.21, ¿lo subo al canal de descargas?',
    likes: 34,
    reacciones: [{ emojiId: 'diamante', conteo: 2 }],
    comentarios: [],
  },
  {
    id: 4,
    usuario: 'StaffWikiCraft',
    inicial: 'S',
    colorAvatar: '#c9a227',
    tiempo: 'hace 2 días',
    contexto: 'Anuncio oficial',
    categoria: 'Anuncios',
    contenido:
      'Este sábado arrancamos el evento de construcción temática: Aldeas Medievales. Premios en la tienda.',
    likes: 61,
    reacciones: [{ emojiId: 'estrella', conteo: 3 }],
    comentarios: [],
  },
  {
    id: 5,
    usuario: 'PicapiedraXd',
    inicial: 'P',
    colorAvatar: '#7a5c3e',
    tiempo: 'hace 3 días',
    contexto: 'Survival 14',
    categoria: 'construcciones',
    contenido:
      'Terminé mi granja de aldeanos automática, rinde como 40 esmeraldas por hora.',
    likes: 18,
    reacciones: [{ emojiId: 'esmeralda', conteo: 1 }],
    comentarios: [],
  },
];

const CATEGORIAS_ETIQUETA = ['construcciones', 'Mods', 'Anuncios', 'pvps'];
const CATEGORIAS_FILTRO = ['Todas', ...CATEGORIAS_ETIQUETA];

// Datos del usuario actual (se reutilizan al crear posts y comentarios).
const USUARIO_ACTUAL = { id: 'usuario-actual-demo', usuario: 'Vos', inicial: 'V', colorAvatar: '#3d9970' };
const CLAVE_POSTS = 'wikicraft_comunidad_posts_v1';
const CLAVE_DENUNCIAS = 'wikicraft_comunidad_denuncias_v1';
function leerLocal(clave, alternativo) { try { const valor = localStorage.getItem(clave); return valor ? JSON.parse(valor) : alternativo; } catch { return alternativo; } }

// Índice de emojis por id: evita hacer .find() en cada render.
const EMOJIS_POR_ID = Object.fromEntries(EMOJIS_MINECRAFT.map((e) => [e.id, e]));

// Ícono de emoji con fallback: si la imagen falla, muestra el nombre en texto.
// Reemplaza la manipulación directa del DOM (e.target.style...) por estado de React.
function EmojiIcono({ emoji, claseFallback }) {
  const [fallo, setFallo] = useState(false);

  if (fallo) return <span className={claseFallback}>{emoji?.nombre}</span>;

  return <img src={emoji?.src} alt={emoji?.nombre} onError={() => setFallo(true)} />;
}

function Comunidad({ posts: postsProp }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState(() => postsProp || leerLocal(CLAVE_POSTS, postsIniciales));
  const [filtroActivo, setFiltroActivo] = useState('Todas');

  // Likes del usuario actual: { [postId]: true }
  const [likesUsuario, setLikesUsuario] = useState({});

  // Reacciones con emoji estilo Discord/WhatsApp: cada emoji acumula su propio
  // contador. Acá solo guardamos CUÁLES tiene activas el usuario actual; el
  // conteo "de base" (de otros usuarios) vive en post.reacciones.
  // Forma: { [postId]: { [emojiId]: true } }
  const [reaccionesUsuario, setReaccionesUsuario] = useState({});
  const [pickerReaccionAbierto, setPickerReaccionAbierto] = useState(null); // postId con el picker abierto

  // Comentarios: qué posts tienen la sección de comentarios abierta
  const [comentariosAbiertos, setComentariosAbiertos] = useState({});

  // Denuncias: qué post tiene el modal abierto, y el registro de las enviadas
  // Objetivo del modal: { tipo: 'publicacion' | 'comentario', postId, comentarioId? }
  const [denunciaAbiertaPost, setDenunciaAbiertaPost] = useState(null);
  const [reportados, setReportados] = useState({});
  const [denunciasEnviadas, setDenunciasEnviadas] = useState(() => leerLocal(CLAVE_DENUNCIAS, []));
  const [administradorAbierto, setAdministradorAbierto] = useState(() => searchParams.get('admin') === '1');
  const [adminSeccion, setAdminSeccion] = useState('denuncias');
  const [postEditando, setPostEditando] = useState(null);
  const [textoPostEditado, setTextoPostEditado] = useState('');
  const [postUsuarioEditando, setPostUsuarioEditando] = useState(null);
  const [textoPostUsuarioEditado, setTextoPostUsuarioEditado] = useState('');

  useEffect(() => { try { localStorage.setItem(CLAVE_POSTS, JSON.stringify(posts)); } catch (error) { console.warn('No se pudieron guardar las publicaciones.', error); } }, [posts]);
  useEffect(() => { try { localStorage.setItem(CLAVE_DENUNCIAS, JSON.stringify(denunciasEnviadas)); } catch (error) { console.warn('No se pudieron guardar las denuncias.', error); } }, [denunciasEnviadas]);
  useEffect(() => { setAdministradorAbierto(searchParams.get('admin') === '1'); }, [searchParams]);

  const postsFiltrados =
    filtroActivo === 'Todas' ? posts : posts.filter((p) => p.categoria === filtroActivo);

  // Recibe los datos ya validados desde <NuevoPost /> y arma el post completo.
  function handlePublicar({ contenido, categoria, imagen }) {
    const nuevoPost = {
      id: Date.now(),
      ...USUARIO_ACTUAL,
      autorId: USUARIO_ACTUAL.id,
      tiempo: 'Ahora',
      contexto: 'Tu partida',
      categoria,
      contenido,
      likes: 0,
      reacciones: [],
      comentarios: [],
      imagen,
    };

    setPosts((prev) => [nuevoPost, ...prev]);

    // TODO (sistema de logros): disparar acá el logro "Primera publicación"
    // cuando se implemente el sistema de logros global.
  }

  function toggleLike(postId) {
    setLikesUsuario((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function contarLikes(post) {
    return post.likes + (likesUsuario[post.id] ? 1 : 0);
  }

  // Toggle de UN emoji puntual en UN post: si ya lo tenías puesto, lo saca;
  // si no, lo suma. Cada emoji es independiente del resto.
  function toggleEmojiReaccion(postId, emojiId) {
    setReaccionesUsuario((prev) => {
      const { [emojiId]: yaActiva, ...resto } = prev[postId] || {};
      return { ...prev, [postId]: yaActiva ? resto : { ...resto, [emojiId]: true } };
    });
  }

  // Combina las reacciones "de base" del post (mock, simulan otros usuarios)
  // con las que el usuario actual fue activando, incluso si eligió un emoji
  // que el post todavía no tenía. Oculta las que queden en 0.
  function obtenerReaccionesVisibles(post) {
    const propias = reaccionesUsuario[post.id] || {};
    const conteos = new Map(post.reacciones.map((r) => [r.emojiId, r.conteo]));

    Object.keys(propias).forEach((emojiId) => {
      if (!conteos.has(emojiId)) conteos.set(emojiId, 0);
    });

    return [...conteos]
      .map(([emojiId, base]) => ({
        emojiId,
        total: base + (propias[emojiId] ? 1 : 0),
        activa: Boolean(propias[emojiId]),
      }))
      .filter((r) => r.total > 0);
  }

  function toggleComentarios(postId) {
    setComentariosAbiertos((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  function handleAgregarComentario(postId, comentario) {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comentarios: [
                ...p.comentarios,
                { id: Date.now(), ...USUARIO_ACTUAL, autorId: USUARIO_ACTUAL.id, texto: comentario.texto },
              ],
            }
          : p
      )
    );

    // TODO (sistema de logros): disparar acá el logro "Primer comentario"
    // cuando se implemente el sistema de logros global.
  }

  function handleConfirmarDenuncia(objetivo, datos) {
    // Compatibilidad con el formato anterior (solo postId).
    const destino = typeof objetivo === 'object' && objetivo !== null
      ? objetivo
      : { tipo: 'publicacion', postId: objetivo };
    const post = posts.find((p) => p.id === destino.postId);
    const comentario = destino.tipo === 'comentario'
      ? post?.comentarios.find((c) => c.id === destino.comentarioId)
      : null;

    setDenunciasEnviadas((prev) => [...prev, {
      id: Date.now(),
      tipoContenido: destino.tipo || 'publicacion',
      postId: destino.postId,
      comentarioId: destino.comentarioId ?? null,
      ...datos,
      usuarioPost: destino.tipo === 'comentario'
        ? (comentario?.usuario || 'Usuario desconocido')
        : (post?.usuario || 'Usuario desconocido'),
      contenidoPost: destino.tipo === 'comentario'
        ? (comentario?.texto || '')
        : (post?.contenido || ''),
      contextoPublicacion: post?.contenido || '',
      usuarioPublicacion: post?.usuario || 'Usuario desconocido',
      fecha: new Date().toLocaleString('es-AR'),
      estado: 'Pendiente',
    }]);

    if (destino.tipo !== 'comentario') {
      setReportados((prev) => ({ ...prev, [destino.postId]: true }));
    }
    setDenunciaAbiertaPost(null);
    // TODO backend: enviar tipoContenido, postId, comentarioId, motivo y detalle.
  }

  function comenzarEdicionPost(post) { setPostEditando(post.id); setTextoPostEditado(post.contenido); }
  function guardarEdicionPost(postId) {
    if (!textoPostEditado.trim()) { window.alert('El contenido no puede quedar vacío.'); return; }
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, contenido: textoPostEditado.trim() } : p));
    setPostEditando(null);
  }
  function eliminarPost(postId) {
    if (!window.confirm('¿Seguro que querés eliminar esta publicación?')) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setDenunciasEnviadas((prev) => prev.map((d) => d.postId === postId ? { ...d, estado: 'Publicación eliminada' } : d));
  }

  // En la maqueta se usa un ID de demostración. Cuando exista autenticación,
  // USUARIO_ACTUAL.id deberá venir de la sesión y autorId del backend.
  function esPublicacionPropia(post) {
    return post.autorId === USUARIO_ACTUAL.id || (!post.autorId && post.usuario === USUARIO_ACTUAL.usuario);
  }
  function comenzarEdicionPostUsuario(post) {
    setPostUsuarioEditando(post.id);
    setTextoPostUsuarioEditado(post.contenido);
  }
  function guardarEdicionPostUsuario(postId) {
    if (!textoPostUsuarioEditado.trim()) { window.alert('La publicación no puede quedar vacía.'); return; }
    setPosts((prev) => prev.map((p) => p.id === postId && esPublicacionPropia(p) ? { ...p, contenido: textoPostUsuarioEditado.trim(), editado: true } : p));
    setPostUsuarioEditando(null);
    setTextoPostUsuarioEditado('');
  }
  function eliminarPostUsuario(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post || !esPublicacionPropia(post)) return;
    if (!window.confirm('¿Querés eliminar tu publicación? Esta acción no se puede deshacer.')) return;
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setDenunciasEnviadas((prev) => prev.map((d) => d.postId === postId ? { ...d, estado: 'Publicación eliminada' } : d));
  }
  function cambiarEstadoDenuncia(id, estado) {
    setDenunciasEnviadas((prev) => prev.map((d) => d.id === id ? { ...d, estado } : d));
  }
  function editarComentario(postId, comentarioId, texto) {
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comentarios: p.comentarios.map((c) => c.id === comentarioId ? { ...c, texto, editado: true } : c) } : p));
  }
  function eliminarComentario(postId, comentarioId) {
    if (!window.confirm('¿Seguro que querés eliminar este comentario?')) return;
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comentarios: p.comentarios.filter((c) => c.id !== comentarioId) } : p));
  }
  function esComentarioPropio(comentario) {
    return comentario.autorId === USUARIO_ACTUAL.id || (!comentario.autorId && comentario.usuario === USUARIO_ACTUAL.usuario);
  }
  function editarComentarioPropio(postId, comentarioId, texto) {
    const post = posts.find((p) => p.id === postId);
    const comentario = post?.comentarios.find((c) => c.id === comentarioId);
    if (!comentario || !esComentarioPropio(comentario)) return;
    editarComentario(postId, comentarioId, texto);
  }
  function eliminarComentarioPropio(postId, comentarioId) {
    const post = posts.find((p) => p.id === postId);
    const comentario = post?.comentarios.find((c) => c.id === comentarioId);
    if (!comentario || !esComentarioPropio(comentario)) return;
    eliminarComentario(postId, comentarioId);
  }

  return (
    <>
      {!administradorAbierto && <Header />}
      {administradorAbierto ? (
        <main className="comunidad-admin-page">
          <div className="admin-page-fondo" aria-hidden="true"><span /><span /><span /></div>
          <header className="admin-topbar">
            <div className="admin-brand"><span className="admin-brand__icon">⚒</span><div><strong>WIKI-CRAFT</strong><small>Centro de moderación</small></div></div>
          </header>
          <section className="admin-dashboard">
            <div className="admin-welcome"><div><span className="admin-eyebrow">PANEL DE CONTROL / COMUNIDAD</span><h1>Administracion</h1><p>Gestioná el contenido y mantené la comunidad segura.</p></div><div className="admin-status"><span className="admin-status__dot" /> SISTEMA ACTIVO</div></div>
            <div className="admin-stats">
              <article className="admin-stat admin-stat--green"><span className="admin-stat__icon">▤</span><small>Publicaciones</small><strong>{posts.length}</strong><span>Contenido publicado</span></article>
              <article className="admin-stat admin-stat--gold"><span className="admin-stat__icon">⚑</span><small>Denuncias pendientes</small><strong>{denunciasEnviadas.filter((d) => d.estado === 'Pendiente').length}</strong><span>Requieren revisión</span></article>
              <article className="admin-stat admin-stat--blue"><span className="admin-stat__icon">☰</span><small>Comentarios</small><strong>{posts.reduce((total, p) => total + p.comentarios.length, 0)}</strong><span>En todas las publicaciones</span></article>
            </div>
            <div className="admin-workspace">
              <aside className="admin-sidebar"><span className="admin-sidebar__label">MODERACIÓN</span>
                <button className={adminSeccion === 'denuncias' ? 'seleccionado' : ''} onClick={() => setAdminSeccion('denuncias')}><span>⚑</span> Denuncias <b>{denunciasEnviadas.filter((d) => d.estado === 'Pendiente').length}</b></button>
                <button className={adminSeccion === 'publicaciones' ? 'seleccionado' : ''} onClick={() => setAdminSeccion('publicaciones')}><span>▤</span> Publicaciones <b>{posts.length}</b></button>
                <button className={adminSeccion === 'comentarios' ? 'seleccionado' : ''} onClick={() => setAdminSeccion('comentarios')}><span>☰</span> Comentarios</button>
                <div className="admin-sidebar__nota"><span>✦ Consejo</span><p>Revisá el contexto completo antes de tomar una decisión de moderación.</p></div>
              </aside>
              <section className="admin-content">
                {adminSeccion === 'denuncias' && <>
                  <div className="admin-section-heading"><div><span className="admin-eyebrow">BANDEJA DE ENTRADA</span><h2>Denuncias recibidas</h2><p>Revisá los reportes enviados por la comunidad.</p></div><span className="admin-count">{denunciasEnviadas.length} reportes</span></div>
                  {denunciasEnviadas.length === 0 ? <div className="admin-empty"><span>✓</span><h3>Todo tranquilo por acá</h3><p>Cuando alguien denuncie una publicación, aparecerá en esta bandeja.</p></div> : <div className="comunidad-admin-denuncias">{[...denunciasEnviadas].reverse().map((d) => <article className="comunidad-admin-denuncia" key={d.id}><div className="comunidad-admin-denuncia__top"><div><span className="admin-report-id">REPORTE #{String(d.id).slice(-5)}</span><strong>{d.tipoContenido === 'comentario' ? 'Comentario de' : 'Publicación de'} {d.usuarioPost}</strong></div><span className={`estado-${d.estado === 'Pendiente' ? 'pendiente' : 'resuelto'}`}>{d.estado}</span></div><p className="admin-report-content">{d.contenidoPost || (d.tipoContenido === 'comentario' ? 'El comentario ya no está disponible.' : 'La publicación ya no está disponible.')}</p>{d.tipoContenido === 'comentario' && <p className="admin-report-context"><strong>En la publicación de {d.usuarioPublicacion}:</strong> {d.contextoPublicacion}</p>}<div className="admin-report-meta"><span>Tipo: {d.tipoContenido === 'comentario' ? 'Comentario' : 'Publicación'}</span><span>⚑ {d.motivo}</span><span>◷ {d.fecha}</span></div>{d.detalle && <p className="admin-report-detail">“{d.detalle}”</p>}{d.estado === 'Pendiente' && <div className="admin-denuncia-acciones"><button className="admin-btn-primary" onClick={() => cambiarEstadoDenuncia(d.id, 'Revisada')}>✓ Marcar revisada</button><button className="admin-btn-danger" onClick={() => { if (window.confirm(d.tipoContenido === 'comentario' ? '¿Eliminar el comentario denunciado?' : '¿Eliminar la publicación denunciada?')) { if (d.tipoContenido === 'comentario') { setPosts((prev) => prev.map((p) => p.id === d.postId ? { ...p, comentarios: p.comentarios.filter((c) => c.id !== d.comentarioId) } : p)); cambiarEstadoDenuncia(d.id, 'Comentario eliminado'); } else { setPosts((prev) => prev.filter((p) => p.id !== d.postId)); cambiarEstadoDenuncia(d.id, 'Publicación eliminada'); } } }}>{d.tipoContenido === 'comentario' ? 'Eliminar comentario' : 'Eliminar publicación'}</button><button className="admin-btn-quiet" onClick={() => cambiarEstadoDenuncia(d.id, 'Descartada')}>Descartar</button></div>}</article>)}</div>}
                </>}
                {adminSeccion === 'publicaciones' && <>
                  <div className="admin-section-heading"><div><span className="admin-eyebrow">CONTENIDO</span><h2>Publicaciones</h2><p>Editá el texto o eliminá contenido de la comunidad.</p></div><span className="admin-count">{posts.length} publicaciones</span></div>
                  {posts.length === 0 ? <div className="admin-empty"><span>▤</span><h3>No hay publicaciones</h3><p>Las publicaciones nuevas aparecerán acá.</p></div> : <div className="admin-lista-posts">{posts.map((post) => <article className="admin-item" key={post.id}><div className="admin-item__avatar" style={{background: post.colorAvatar}}>{post.inicial}</div><div className="admin-item__main"><div className="admin-item__meta"><strong>{post.usuario}</strong><span>{post.categoria} · {post.comentarios.length} comentarios</span></div>{postEditando === post.id ? <div className="admin-edicion"><textarea value={textoPostEditado} onChange={(e) => setTextoPostEditado(e.target.value)} rows={4}/><div><button className="admin-btn-primary" onClick={() => guardarEdicionPost(post.id)}>Guardar cambios</button><button className="admin-btn-quiet" onClick={() => setPostEditando(null)}>Cancelar</button></div></div> : <p>{post.contenido}</p>}<div className="admin-item__actions">{postEditando !== post.id && <button className="admin-btn-secondary" onClick={() => comenzarEdicionPost(post)}>✎ Editar</button>}<button className="admin-btn-danger" onClick={() => eliminarPost(post.id)}>⌫ Eliminar</button></div></div></article>)}</div>}
                </>}
                {adminSeccion === 'comentarios' && <>
                  <div className="admin-section-heading"><div><span className="admin-eyebrow">CONVERSACIONES</span><h2>Comentarios</h2><p>Seleccioná una publicación para moderar sus comentarios.</p></div></div>
                  {posts.every((p) => p.comentarios.length === 0) ? <div className="admin-empty"><span>☰</span><h3>Todavía no hay comentarios</h3><p>Los comentarios aparecerán acá cuando existan.</p></div> : posts.filter((p) => p.comentarios.length > 0).map((post) => <article className="admin-comments-group" key={post.id}><div className="admin-comments-group__heading"><strong>{post.usuario}</strong><span>{post.contenido}</span></div><ListaComentarios comentarios={post.comentarios} modoAdministrador onAgregarComentario={() => {}} onEditarComentario={(comentarioId, texto) => editarComentario(post.id, comentarioId, texto)} onEliminarComentario={(comentarioId) => eliminarComentario(post.id, comentarioId)} /></article>)}
                </>}
              </section>
            </div>
            <footer className="admin-footer"><span>WIKI-CRAFT · MODERATION TOOLS</span><span>Los cambios de esta sesión se guardan localmente.</span></footer>
          </section>
        </main>
      ) : (
      <div className="comunidad-page">
        {/* ---------- HERO / ENCABEZADO ---------- */}
        <header className="comunidad-hero cascada-item">
          <div className="comunidad-hero__overlay" />
          <div className="comunidad-hero__contenido">
            <h1>Comunidad</h1>
            <p>Comparte experiencias, situaciones, historias, recomendaciones y mas</p>
          </div>
        </header>

        <main className="comunidad-main">
          {/* ---------- FILTROS ---------- */}
          <nav
            className="comunidad-filtros cascada-item"
            aria-label="Filtrar publicaciones por categoría"
          >
            {CATEGORIAS_FILTRO.map((cat) => (
              <button
                key={cat}
                className={`filtro-pill ${filtroActivo === cat ? 'filtro-pill--activo' : ''}`}
                onClick={() => setFiltroActivo(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* ---------- FORMULARIO NUEVO POST ---------- */}
          <NuevoPost
            usuario={USUARIO_ACTUAL}
            categorias={CATEGORIAS_ETIQUETA}
            onPublicar={handlePublicar}
          />

          {/* ---------- LISTA DE POSTS ---------- */}
          <section className="lista-posts">
            {postsFiltrados.length === 0 && (
              <p className="lista-posts__vacio">No hay publicaciones en esta categoría todavía.</p>
            )}

            {/* --delay: cada post aparece con más delay según su índice, generando
                el efecto de cascada. Math.min(index, 8) evita que el delay crezca
                sin límite si hay muchísimos posts. Es lo único que queda inline
                porque depende del índice. */}
            {postsFiltrados.map((post, index) => (
              <article
                key={post.id}
                className={`post-card cascada-item ${
                  reportados[post.id] ? 'post-card--reportado' : ''
                }`}
                style={{ '--delay': `${0.45 + Math.min(index, 8) * 0.15}s` }}
              >
                <div className="post-card__encabezado">
                  <div className="avatar" style={{ backgroundColor: post.colorAvatar }}>
                    {post.inicial}
                  </div>
                  <div className="post-card__meta">
                    <span className="post-card__usuario">{post.usuario}</span>
                    <span className="post-card__submeta">
                      {post.tiempo} · {post.contexto}
                    </span>
                  </div>
                  <span className="post-card__categoria-badge">{post.categoria}</span>

                  <button
                    className="btn-warning"
                    aria-label="Reportar publicación"
                    onClick={() => setDenunciaAbiertaPost({ tipo: 'publicacion', postId: post.id })}
                  >
                    ⚠
                  </button>
                </div>

                {reportados[post.id] && !administradorAbierto ? (
                  <p className="post-card__reportado-aviso">
                    Publicación reportada. Gracias por avisarnos.
                  </p>
                ) : (
                  <>
                    {postUsuarioEditando === post.id ? (
                      <div className="post-edicion-usuario">
                        <textarea aria-label="Editar publicación" value={textoPostUsuarioEditado} onChange={(e) => setTextoPostUsuarioEditado(e.target.value)} rows={4} />
                        <div className="post-edicion-usuario__acciones">
                          <button type="button" onClick={() => guardarEdicionPostUsuario(post.id)}>Guardar cambios</button>
                          <button type="button" className="post-edicion-usuario__cancelar" onClick={() => { setPostUsuarioEditando(null); setTextoPostUsuarioEditado(''); }}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Link
                          to={`/publicacion/${post.id}`}
                          className="post-card__contenido-link"
                          aria-label={`Abrir publicación de ${post.usuario}`}
                        >
                          <p className="post-card__contenido">
                            {post.contenido}
                            {post.editado && <span className="contenido-editado"> · editado</span>}
                          </p>
                        </Link>
                        <Link
                          to={`/publicacion/${post.id}`}
                          className="post-card__ver-publicacion"
                        >
                          Ver publicación completa <span aria-hidden="true">→</span>
                        </Link>
                      </>
                    )}
                    {esPublicacionPropia(post) && postUsuarioEditando !== post.id && (
                      <div className="post-usuario-acciones">
                        <span>Tu publicación</span>
                        <div>
                          <button type="button" onClick={() => comenzarEdicionPostUsuario(post)}>✎ Editar</button>
                          <button type="button" className="post-usuario-acciones__eliminar" onClick={() => eliminarPostUsuario(post.id)}>⌫ Eliminar</button>
                        </div>
                      </div>
                    )}

                    {post.imagen && (
                      <img
                        src={post.imagen}
                        alt="Imagen adjunta a la publicación"
                        className="post-card__imagen"
                      />
                    )}

                    <div className="post-card__reacciones">
                      <button
                        className={`reaccion ${likesUsuario[post.id] ? 'reaccion--activa' : ''}`}
                        onClick={() => toggleLike(post.id)}
                      >
                        <span>❤️</span>
                        <span>{contarLikes(post)}</span>
                      </button>

                      <div className="reacciones-emoji-grupo">
                        {obtenerReaccionesVisibles(post).map((r) => {
                          const emoji = EMOJIS_POR_ID[r.emojiId];
                          return (
                            <button
                              key={r.emojiId}
                              className={`reaccion-pill ${r.activa ? 'reaccion-pill--activa' : ''}`}
                              title={emoji?.nombre}
                              onClick={() => toggleEmojiReaccion(post.id, r.emojiId)}
                            >
                              <EmojiIcono emoji={emoji} claseFallback="reaccion-pill__fallback" />
                              <span className="reaccion-pill__conteo">{r.total}</span>
                            </button>
                          );
                        })}

                        <div className="reaccion-emoji-selector">
                          <button
                            className="btn-agregar-reaccion"
                            aria-label="Agregar reacción"
                            onClick={() =>
                              setPickerReaccionAbierto(
                                pickerReaccionAbierto === post.id ? null : post.id
                              )
                            }
                          >
                            🙂
                          </button>

                          {pickerReaccionAbierto === post.id && (
                            <div className="reaccion-emoji-picker">
                              {EMOJIS_MINECRAFT.map((emoji) => (
                                <button
                                  key={emoji.id}
                                  type="button"
                                  className="reaccion-emoji-picker__item"
                                  title={emoji.nombre}
                                  onClick={() => {
                                    toggleEmojiReaccion(post.id, emoji.id);
                                    setPickerReaccionAbierto(null);
                                  }}
                                >
                                  <EmojiIcono
                                    emoji={emoji}
                                    claseFallback="reaccion-emoji-picker__fallback"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button className="reaccion" onClick={() => toggleComentarios(post.id)}>
                        <span>💬</span>
                        <span>{post.comentarios.length}</span>
                      </button>
                    </div>

                    {comentariosAbiertos[post.id] && (
                      <ListaComentarios
                        comentarios={post.comentarios}
                        onAgregarComentario={(comentario) => handleAgregarComentario(post.id, comentario)}
                        modoUsuario
                        usuarioActualId={USUARIO_ACTUAL.id}
                        onEditarComentario={(comentarioId, texto) => editarComentarioPropio(post.id, comentarioId, texto)}
                        onEliminarComentario={(comentarioId) => eliminarComentarioPropio(post.id, comentarioId)}
                        onDenunciarComentario={(comentario) => setDenunciaAbiertaPost({ tipo: 'comentario', postId: post.id, comentarioId: comentario.id })}
                      />
                    )}
                  </>
                )}
              </article>
            ))}
          </section>
        </main>


         {denunciaAbiertaPost !== null && (
          <DenunciaModal
            tipoContenido={denunciaAbiertaPost.tipo === 'comentario' ? 'comentario' : 'publicacion'}
            onConfirmar={(datos) => handleConfirmarDenuncia(denunciaAbiertaPost, datos)}
            onCancelar={() => setDenunciaAbiertaPost(null)}
          />
        )}
      </div>
      )}
      <button
        type="button"
        className={`comunidad-admin-toggle ${administradorAbierto ? 'activo' : ''}`}
        onClick={() => {
          if (administradorAbierto) {
            setAdministradorAbierto(false);
            setSearchParams({});
          } else {
            setAdminSeccion('denuncias');
            setAdministradorAbierto(true);
            setSearchParams({ admin: '1' });
          }
        }}
        aria-label={administradorAbierto ? 'Volver al modo usuario' : 'Abrir panel de administración'}
      >
        <span className="admin-toggle-pulse" />
        {administradorAbierto ? 'Modo usuario' : 'Modo administrador'}
        <span aria-hidden="true">{administradorAbierto ? '↙' : '↗'}</span>
      </button>
      {!administradorAbierto && <Footer />}
    </>
  );
}

export default Comunidad;