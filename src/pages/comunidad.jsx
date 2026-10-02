import { useState, useRef, useEffect } from 'react';
import ListaComentarios from '../components/comunidadComponentes/lista-comentarios';
import DenunciaModal from '../components/comunidadComponentes/denuncia-modal';
import { EMOJIS_MINECRAFT } from '../components/comunidadComponentes/emojis-minecraft';
import Footer from '../components/footer';
import Header from '../components/header';
import './Comunidad.css';

// ---------------------------------------------------------------------------
// DATOS MOCKEADOS (posts)
// Cuando exista backend, este array se va a reemplazar por props:
// function Comunidad({ posts }) { ... }
// Cada post ahora trae su propio array de comentarios (en vez de un número
// suelto), para poder listarlos y agregar nuevos de verdad.
// ---------------------------------------------------------------------------
const postsIniciales = [
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

const CATEGORIAS_FILTRO = ['Todas', 'construcciones', 'Mods', 'Anuncios', 'pvps'];
const CATEGORIAS_ETIQUETA = ['construcciones', 'Mods', 'Anuncios', 'pvps'];

function Comunidad({ posts: postsProp }) {

  const [posts, setPosts] = useState(postsProp || postsIniciales);
  const [filtroActivo, setFiltroActivo] = useState('Todas');

  // Estado del formulario "nuevo post"
  const [textoNuevoPost, setTextoNuevoPost] = useState('');
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState('');
  const [mostrarSelectorEtiqueta, setMostrarSelectorEtiqueta] = useState(false);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errorPublicacion, setErrorPublicacion] = useState('');
  const inputImagenRef = useRef(null);

  // Estado de reacciones por post
  const [reacciones, setReacciones] = useState({}); // { [postId]: { like: bool } }

  // Reacciones con emoji estilo Discord/WhatsApp: cada emoji acumula su
  // propio contador. Acá solo guardamos CUÁLES tiene activas el usuario
  // actual; el conteo "de base" (de otros usuarios) vive en post.reacciones.
  // Forma: { [postId]: { [emojiId]: true } }
  const [reaccionesUsuario, setReaccionesUsuario] = useState({});
  const [pickerReaccionAbierto, setPickerReaccionAbierto] = useState(null); // postId con el picker abierto

  // Comentarios: qué post tiene la sección de comentarios abierta
  const [comentariosAbiertos, setComentariosAbiertos] = useState({});

  // Denuncias: qué post tiene el modal abierto, y el registro de las enviadas
  const [denunciaAbiertaPost, setDenunciaAbiertaPost] = useState(null);
  const [reportados, setReportados] = useState({});
  const [denunciasEnviadas, setDenunciasEnviadas] = useState([]);

  const postsFiltrados =
    filtroActivo === 'Todas'
      ? posts
      : posts.filter((p) => p.categoria === filtroActivo);
      
  function handleImagenSeleccionada(e) {
    const archivo = e.target.files[0];
    if (archivo) {
      setImagenPreview(URL.createObjectURL(archivo));
    }
  }

  function handlePublicar() {
    if (!textoNuevoPost.trim()) {
      setErrorPublicacion('Escribí algo antes de publicar.');
      return;
    }
    if (!etiquetaSeleccionada) {
      setErrorPublicacion('Elegí una etiqueta para tu publicación.');
      return;
    }

    const nuevoPost = {
      id: Date.now(),
      usuario: 'Vos',
      inicial: 'V',
      colorAvatar: '#3d9970',
      tiempo: 'Ahora',
      contexto: 'Tu partida',
      categoria: etiquetaSeleccionada,
      contenido: textoNuevoPost.trim(),
      likes: 0,
      reacciones: [],
      comentarios: [],
      imagen: imagenPreview,
    };

    setPosts([nuevoPost, ...posts]);

    // TODO (sistema de logros): disparar acá el logro "Primera publicación"
    // cuando se implemente el sistema de logros global.

    setTextoNuevoPost('');
    setEtiquetaSeleccionada('');
    setImagenPreview(null);
    setMostrarSelectorEtiqueta(false);
    setErrorPublicacion('');
  }

  function toggleReaccion(postId) {
    setReacciones((prev) => {
      const actual = prev[postId] || { like: false };
      return {
        ...prev,
        [postId]: { ...actual, like: !actual.like },
      };
    });
  }

  function contarLikes(post) {
    const activo = reacciones[post.id]?.like;
    return activo ? post.likes + 1 : post.likes;
  }

  function obtenerEmoji(id) {
    return EMOJIS_MINECRAFT.find((e) => e.id === id);
  }

  // Toggle de UN emoji puntual en UN post: si ya lo tenías puesto, lo saca;
  // si no, lo suma. Cada emoji es independiente del resto (como en Discord:
  // podés tener 👍 y 🎉 juntos en el mismo mensaje, cada uno con su cuenta).
  function toggleEmojiReaccion(postId, emojiId) {
    setReaccionesUsuario((prev) => {
      const actuales = prev[postId] || {};
      const yaActiva = Boolean(actuales[emojiId]);
      const nuevasDelPost = { ...actuales };

      if (yaActiva) {
        delete nuevasDelPost[emojiId];
      } else {
        nuevasDelPost[emojiId] = true;
      }

      return { ...prev, [postId]: nuevasDelPost };
    });
  }

  // Combina las reacciones "de base" del post (mock, simulan otros usuarios)
  // con las que el usuario actual fue activando, incluso si eligió un emoji
  // que el post todavía no tenía. Oculta las que queden en 0 (por ejemplo,
  // si sacás tu única reacción de un tipo que nadie más usó).
  function obtenerReaccionesVisibles(post) {
    const propias = reaccionesUsuario[post.id] || {};
    const mapa = new Map();

    post.reacciones.forEach((r) => mapa.set(r.emojiId, r.conteo));
    Object.keys(propias).forEach((emojiId) => {
      if (!mapa.has(emojiId)) mapa.set(emojiId, 0);
    });

    return Array.from(mapa.entries())
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
                {
                  id: Date.now(),
                  usuario: 'Vos',
                  inicial: 'V',
                  colorAvatar: '#3d9970',
                  texto: comentario.texto,
                },
              ],
            }
          : p
      )
    );

    // TODO (sistema de logros): disparar acá el logro "Primer comentario"
    // cuando se implemente el sistema de logros global.
  }

  function handleConfirmarDenuncia(postId, datos) {
    setDenunciasEnviadas((prev) => [...prev, { postId, ...datos }]);
    setReportados((prev) => ({ ...prev, [postId]: true }));
    setDenunciaAbiertaPost(null);

    // TODO (backend): enviar { postId, motivo, detalle } al endpoint de
    // moderación cuando exista. Por ahora queda solo en denunciasEnviadas.
  }

  return (
    <>
      <Header />
      <div className="comunidad-page">
        {/* ---------- HERO / ENCABEZADO ---------- */}
        {/* cascada-item: primero en aparecer (delay 0s) */}
        <header className="comunidad-hero cascada-item" style={{ animationDelay: '0s' }}>
          <div className="comunidad-hero__overlay" />
          <div className="comunidad-hero__contenido">
            <h1>Comunidad</h1>
            <p>Comparte experiencias, situaciones, historias, recomendaciones y mas</p>
          </div>
        </header>

        <main className="comunidad-main">
          {/* ---------- FILTROS ---------- */}
          {/* cascada-item: segundo en aparecer (delay 0.1s) */}
          <nav
            className="comunidad-filtros cascada-item"
            style={{ animationDelay: '0.15s' }}
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
          {/* cascada-item: tercero en aparecer (delay 0.2s) */}
          <section className="nuevo-post cascada-item" style={{ animationDelay: '0.3s' }}>
            <div className="nuevo-post__fila">
              <div className="avatar avatar--propio">V</div>
              <textarea
                className="nuevo-post__texto"
                placeholder="¿Que vas a escribir hoy?"
                value={textoNuevoPost}
                onChange={(e) => setTextoNuevoPost(e.target.value)}
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

            {errorPublicacion && <p className="nuevo-post__error">{errorPublicacion}</p>}

            <div className="nuevo-post__acciones">
              <div className="nuevo-post__acciones-izquierda">
                <div className="etiqueta-selector">
                  <div className="etiqueta-2">
                  <button
                    className="btn-etiqueta"
                    onClick={() => setMostrarSelectorEtiqueta((v) => !v)}
                  >
                    {etiquetaSeleccionada ? etiquetaSeleccionada : 'Etiqueta'}
                  </button>
                  {mostrarSelectorEtiqueta && (
                    <ul className="etiqueta-menu">
                      {CATEGORIAS_ETIQUETA.map((cat) => (
                        <li key={cat}>
                          <button
                            onClick={() => {
                              setEtiquetaSeleccionada(cat);
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

              </div>
              <button className="btn-publicar" onClick={handlePublicar}>
                Publicar
              </button>
            </div>
          </section>

          {/* ---------- LISTA DE POSTS ---------- */}
          <section className="lista-posts">
            {postsFiltrados.length === 0 && (
              <p className="lista-posts__vacio">No hay publicaciones en esta categoría todavía.</p>
            )}

            {/* cascada-item: cada post aparece con más delay según su índice
                (0.3s, 0.38s, 0.46s...), generando el efecto de cascada bajando
                por el feed. Math.min(index, 8) evita que el delay crezca sin
                límite si hay muchísimos posts. */}
            {postsFiltrados.map((post, index) => (
              <article
                key={post.id}
                className={`post-card cascada-item ${
                  reportados[post.id] ? 'post-card--reportado' : ''
                }`}
                style={{ animationDelay: `${0.45 + Math.min(index, 8) * 0.15}s` }}
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
                    onClick={() => setDenunciaAbiertaPost(post.id)}
                  >
                    ⚠
                  </button>
                </div>

                {reportados[post.id] ? (
                  <p className="post-card__reportado-aviso">
                    Publicación reportada. Gracias por avisarnos.
                  </p>
                ) : (
                  <>
                    <p className="post-card__contenido">{post.contenido}</p>

                    {post.imagen && (
                      <img
                        src={post.imagen}
                        alt="Imagen adjunta a la publicación"
                        className="post-card__imagen"
                      />
                    )}

                    <div
                      className="post-card__reacciones"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                      }}
                    >
                      <button
                        className={`reaccion ${
                          reacciones[post.id]?.like ? 'reaccion--activa' : ''
                        }`}
                        onClick={() => toggleReaccion(post.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          height: '30px',
                          padding: '0 8px',
                          border: 'none',
                          background: 'transparent',
                        }}
                      >
                        <span>❤️</span>
                        <span>{contarLikes(post)}</span>
                      </button>

                      <div
                        className="reacciones-emoji-grupo"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        {obtenerReaccionesVisibles(post).map((r) => {
                          const emoji = obtenerEmoji(r.emojiId);
                          return (
                            <button
                              key={r.emojiId}
                              className={`reaccion-pill ${
                                r.activa ? 'reaccion-pill--activa' : ''
                              }`}
                              title={emoji?.nombre}
                              onClick={() => toggleEmojiReaccion(post.id, r.emojiId)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                height: '28px',
                                boxSizing: 'border-box',
                                background: r.activa ? '#fdf6e0' : '#f4f4f2',
                                border: `1px solid ${r.activa ? '#e6c458' : '#e2e2e2'}`,
                                borderRadius: '999px',
                                padding: '0 10px',
                                fontSize: '0.8rem',
                                lineHeight: 1,
                                cursor: 'pointer',
                              }}
                            >
                              <img
                                src={emoji?.src}
                                alt={emoji?.nombre}
                                style={{ width: '15px', height: '15px', objectFit: 'contain' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'inline';
                                }}
                              />
                              {/* Oculto por defecto inline: solo aparece si la imagen falla */}
                              <span style={{ display: 'none', fontSize: '0.72rem' }}>
                                {emoji?.nombre}
                              </span>
                              <span style={{ fontWeight: r.activa ? 700 : 500 }}>{r.total}</span>
                            </button>
                          );
                        })}

                        <div className="reaccion-emoji-selector" style={{ position: 'relative' }}>
                          <button
                            className="btn-agregar-reaccion"
                            aria-label="Agregar reacción"
                            onClick={() =>
                              setPickerReaccionAbierto(
                                pickerReaccionAbierto === post.id ? null : post.id
                              )
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '28px',
                              width: '32px',
                              boxSizing: 'border-box',
                              background: '#f4f4f2',
                              border: '1px solid #e2e2e2',
                              borderRadius: '999px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                            }}
                          >
                            🙂
                          </button>

                          {pickerReaccionAbierto === post.id && (
                            <div
                              className="reaccion-emoji-picker"
                              style={{
                                position: 'absolute',
                                bottom: '130%',
                                left: 0,
                                background: '#fff',
                                border: '1px solid #dcdcdc',
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
                                  className="reaccion-emoji-picker__item"
                                  title={emoji.nombre}
                                  style={{
                                    width: '44px',
                                    height: '44px',
                                    overflow: 'hidden',
                                    padding: '2px',
                                  }}
                                  onClick={() => {
                                    toggleEmojiReaccion(post.id, emoji.id);
                                    setPickerReaccionAbierto(null);
                                  }}
                                >
                                  <img
                                    src={emoji.src}
                                    alt={emoji.nombre}
                                    style={{
                                      width: '26px',
                                      height: '26px',
                                      objectFit: 'contain',
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'inline';
                                    }}
                                  />
                                  <span style={{ display: 'none', fontSize: '0.55rem' }}>
                                    {emoji.nombre}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        className="reaccion"
                        onClick={() => toggleComentarios(post.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          height: '30px',
                          padding: '0 8px',
                          border: 'none',
                          background: 'transparent',
                        }}
                      >
                        <span>💬</span>
                        <span>{post.comentarios.length}</span>
                      </button>
                    </div>

                    {comentariosAbiertos[post.id] && (
                      <ListaComentarios
                        comentarios={post.comentarios}
                        onAgregarComentario={(comentario) =>
                          handleAgregarComentario(post.id, comentario)
                        }
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
            onConfirmar={(datos) => handleConfirmarDenuncia(denunciaAbiertaPost, datos)}
            onCancelar={() => setDenunciaAbiertaPost(null)}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

export default Comunidad;
