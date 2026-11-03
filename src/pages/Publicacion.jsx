import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { escucharDocumento, actualizarPublicacion, eliminarPublicacion, crearDenuncia } from "../services/firestore";
import DenunciaModal from "../components/comunidadComponentes/denuncia-modal";
import "../styles/Publicacion.css";

export default function Publicacion() {
  const { id } = useParams();
  const { usuario, perfil, esAdmin } = useAuth();
  const navigate = useNavigate();
  const [post,setPost] = useState(null);
  const [modal,setModal] = useState(false);
  const [error,setError] = useState("");
  useEffect(()=>escucharDocumento("publicaciones",id,setPost,(e)=>{console.error(e);setError("No se pudo cargar la publicación.");}),[id]);
  async function editar(){
    const contenido=window.prompt("Editar publicación:",post.contenido);
    if(contenido===null || !contenido.trim()) return;
    try{await actualizarPublicacion(id,{contenido:contenido.trim()});}catch(e){console.error(e);setError("No se pudo editar.");}
  }
  async function borrar(){
    if(!window.confirm("¿Eliminar esta publicación?")) return;
    try{await eliminarPublicacion(id);navigate("/comunidad");}catch(e){console.error(e);setError("No se pudo eliminar.");}
  }
  async function denunciar(datos){
    try{await crearDenuncia({publicacionId:id,autorId:post.autorId,autorNombre:post.autorNombre,contenido:post.contenido,motivo:datos.motivo,detalle:datos.detalle,tipoContenido:"publicacion"},usuario,perfil);setModal(false);}
    catch(e){console.error(e);setError("No se pudo enviar la denuncia.");}
  }
  return <><Header/><main className="publicacion-main">{error&&<p role="alert">{error}</p>}{!post?<section className="publicacion-no-encontrada"><h1>Publicación no encontrada</h1><Link to="/comunidad">← Volver a Comunidad</Link></section>:<article className="post-card">
    <div className="post-card__encabezado"><div className="avatar">{(post.autorNombre||"U").slice(0,1).toUpperCase()}</div><div className="post-card__meta"><span className="post-card__usuario">{post.autorNombre}</span><span className="post-card__submeta">{post.categoria}</span></div></div>
    <p className="post-card__contenido">{post.contenido}</p>{post.imagen&&<img className="post-card__imagen" src={post.imagen} alt="Imagen adjunta"/>}
    <div className="post-usuario-acciones"><button onClick={()=>setModal(true)}>Denunciar</button>{(post.autorId===usuario.uid)&&<button onClick={editar}>Editar</button>}{(post.autorId===usuario.uid||esAdmin)&&<button onClick={borrar}>Eliminar</button>}</div>
    <Link to="/comunidad">← Volver a Comunidad</Link>
  </article>}</main>{modal&&<DenunciaModal onConfirmar={denunciar} onCancelar={()=>setModal(false)}/>}<Footer/></>;
}
