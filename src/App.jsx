import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/Footer';
import Inicio from './pages/index';
import Registro from './pages/signup';
import Tienda from './pages/tienda';
import Login from './pages/login';
import Comunidad from './pages/comunidad'
import Versiones from './pages/versiones';
import Historia from './pages/historia';
import Musica from './pages/musica';
import Cancion from './pages/cancion';
import Playlist from './pages/playlist';
import Album from './pages/album';
import Compositor from './pages/compositor';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';

import Inicio from "./pages/index";
import Registro from "./pages/signup";
import Tienda from "./pages/tienda";
import Login from "./pages/login";
import Comunidad from "./pages/comunidad";
import Publicacion from "./pages/publicacion";
import Versiones from "./pages/versiones";
import Historia from "./pages/historia";
import Musica from "./pages/musica";
import Cancion from "./pages/cancion";
import Playlist from "./pages/playlist";
import Album from "./pages/album";
import Compositor from "./pages/compositor";
import MaestroMelodias from "./pages/MaestroMelodias";
import Nosotros from "./pages/nosotros";

import MusicPlayer from "./components/music/MusicPlayer";
import { MusicProvider, useMusic } from "./context/MusicContext";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/App.css";

function GlobalMusicPlayer() {
  const music = useMusic();
  if (!music.currentSong) return null;
  const composer = music.getComposer(music.currentSong);
  return (
    <MusicPlayer
      currentSong={{ ...music.currentSong, composerName: composer?.name || music.currentSong.composerName || "Compositor desconocido" }}
      onClose={() => music.setCurrentSong(null)}
      onNext={music.playNext}
      onPrevious={music.playPrevious}
      isShuffle={music.isShuffle}
      setIsShuffle={music.setIsShuffle}
      repeatMode={music.repeatMode}
      setRepeatMode={music.setRepeatMode}
      isDetailsOpen={music.isSongDetailsOpen}
      onDurationChange={(songId, duration) => music.setSongDurations((previous) => ({ ...previous, [songId]: duration }))}
    />
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/login" element={<Login />} />
            <Route path="/comunidad" element={<Comunidad />} />
            <Route path="/versiones" element={<Versiones />} />
            <Route path="/historia" element={<Historia />} />
            <Route path="/musica" element={<Musica />} />
            <Route path="/musica/cancion/:id" element={<Cancion />} />
            <Route path="/musica/playlist/:id" element={<Playlist />} />
            <Route path="/musica/album/:id" element={<Album />} />
            <Route path="/musica/compositor/:id" element={<Compositor />} />
          </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return <BrowserRouter><MusicProvider><AppRoutes /></MusicProvider></BrowserRouter>;
}
