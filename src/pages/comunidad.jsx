import { useState, useRef } from 'react';
import ListaComentarios from '../components/comunidadComponentes/lista-comentarios';
import DenunciaModal from '../components/comunidadComponentes/denuncia-modal';
import { EMOJIS_MINECRAFT } from '../components/comunidadComponentes/emojis-minecraft';
import './Comunidad.css';
import Footer from '../components/Footer';
import Header from '../components/header';
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
    reaccionBase: { conteo: 11, icono: 'creeper' },
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
    reaccionBase: { conteo: 4, icono: 'espada' },
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
    reaccionBase: { conteo: 2, icono: 'diamante' },
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
    reaccionBase: { conteo: 3, icono: 'estrella' },
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
    reaccionBase: { conteo: 1, icono: 'esmeralda' },
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
  const [reaccionEmojiUsuario, setReaccionEmojiUsuario] = useState({}); // { [postId]: emojiId }
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
      reaccionBase: { conteo: 0, icono: 'diamante' },
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

  // Reacción con emoji de Minecraft en vez de la risa fija. Si tocás el mismo
  // emoji que ya tenías elegido, se saca (toggle); si tocás otro, lo reemplaza.
  function handleElegirReaccion(postId, emojiId) {
    setReaccionEmojiUsuario((prev) => ({
      ...prev,
      [postId]: prev[postId] === emojiId ? undefined : emojiId,
    }));
    setPickerReaccionAbierto(null);
  }

  function contarReaccionEmoji(post) {
    const tieneReaccionPropia = Boolean(reaccionEmojiUsuario[post.id]);
    return post.reaccionBase.conteo + (tieneReaccionPropia ? 1 : 0);
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
      <header className="comunidad-hero">
        <div className="comunidad-hero__overlay" />
        <div className="comunidad-hero__contenido">
          <h1>Comunidad</h1>
          <p>Comparte experiencias, situaciones, historias, recomendaciones y mas</p>
        </div>
      </header>

      <main className="comunidad-main">
        {/* ---------- FILTROS ---------- */}
        <nav className="comunidad-filtros" aria-label="Filtrar publicaciones por categoría">
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
        <section className="nuevo-post">
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

          {errorPublicacion && (
            <p className="nuevo-post__error">{errorPublicacion}</p>
          )}

          <div className="nuevo-post__acciones">
            <div className="nuevo-post__acciones-izquierda">
              <div className="etiqueta-selector">
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

            <button className="btn-publicar" onClick={handlePublicar}>
              Publicar
            </button>
          </div>
        </section>

        {/* ---------- LISTA DE POSTS ---------- */}
        <section className="lista-posts">
          {postsFiltrados.length === 0 && (
            <p className="lista-posts__vacio">
              No hay publicaciones en esta categoría todavía.
            </p>
          )}

          {postsFiltrados.map((post) => (
            <article
              key={post.id}
              className={`post-card ${reportados[post.id] ? 'post-card--reportado' : ''}`}
            >
              <div className="post-card__encabezado">
                <div
                  className="avatar"
                  style={{ backgroundColor: post.colorAvatar }}
                >
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

                  <div className="post-card__reacciones">
                    <button
                      className={`reaccion ${
                        reacciones[post.id]?.like ? 'reaccion--activa' : ''
                      }`}
                      onClick={() => toggleReaccion(post.id)}
                    >
                      ❤️ {contarLikes(post)}
                    </button>

                    <div className="reaccion-emoji-selector" style={{ position: 'relative' }}>
                      <button
                        className={`reaccion ${
                          reaccionEmojiUsuario[post.id] ? 'reaccion--activa' : ''
                        }`}
                        onClick={() =>
                          setPickerReaccionAbierto(
                            pickerReaccionAbierto === post.id ? null : post.id
                          )
                        }
                      >
                        <img
                          src={
                            obtenerEmoji(reaccionEmojiUsuario[post.id] || post.reaccionBase.icono)
                              ?.src
                          }
                          alt="Reaccionar con emoji"
                          className="reaccion-emoji__icono"
                          style={{ width: '18px', height: '18px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {contarReaccionEmoji(post)}
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
                              onClick={() => handleElegirReaccion(post.id, emoji.id)}
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
                              <span className="reaccion-emoji-picker__fallback">
                                {emoji.nombre}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      className="reaccion"
                      onClick={() => toggleComentarios(post.id)}
                    >
                      💬 {post.comentarios.length}
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
    <Footer/>
    </>
  );
}

export default Comunidad;
