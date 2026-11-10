
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollToTop from "./components/ScrollToTop";

import Inicio from "./pages/index";
import Tienda from "./pages/tienda";
import Login from "./pages/login";
import Comunidad from "./pages/comunidad";
import Publicacion from "./pages/Publicacion";
import Versiones from "./pages/versiones";
import Historia from "./pages/historia";
import Musica from "./pages/musica";
import Cancion from "./pages/cancion";
import Playlist from "./pages/playlist";
import Album from "./pages/album";
import Compositor from "./pages/compositor";
import MaestroMelodias from "./pages/MaestroMelodias";
import Nosotros from "./pages/nosotros";
import Perfil from "./pages/perfil";
import CrearAdmin from "./pages/crearAdmin";
import Busqueda from "./pages/busqueda";

import MusicPlayer from "./components/music/MusicPlayer";
import { MusicProvider, useMusic } from "./context/MusicContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/App.css";

// ÍNDICE
// - Reproductor global: mantiene disponible la canción activa al cambiar de página.
// - Rutas de la aplicación: relaciona cada URL con su pantalla y sus permisos.
// - Inicio de la aplicación: espera la sesión y conecta los contextos compartidos.

// ----------------- Reproductor global de música -----------------
// Usa el estado compartido de MusicContext para que la reproducción continúe al navegar.
function GlobalMusicPlayer() {
    const music = useMusic();

    if (!music.currentSong) return null;

    const composer = music.getComposer(music.currentSong);

    return (
        <MusicPlayer
            currentSong={{
                ...music.currentSong,
                composerName:
                    composer?.name ||
                    music.currentSong.composerName ||
                    "Compositor desconocido"
            }}
            onClose={() => music.setCurrentSong(null)}
            onNext={music.playNext}
            onPrevious={music.playPrevious}
            isShuffle={music.isShuffle}
            setIsShuffle={music.setIsShuffle}
            repeatMode={music.repeatMode}
            setRepeatMode={music.setRepeatMode}
            isDetailsOpen={music.isSongDetailsOpen}
            onDurationChange={(songId, duration) =>
                music.setSongDurations((previous) => ({
                    ...previous,
                    [songId]: duration
                }))
            }
        />
    );
}

// ----------------- Rutas y acceso a las páginas -----------------
// Define las URLs de la aplicación. Las páginas privadas pasan por RutaProtegida;
// las páginas públicas de acceso permiten iniciar sesión o crear una cuenta.
function AppRoutes() {
    return (
        <>
        <ScrollToTop />
            <Routes>
                <Route path="/" element={<RutaProtegida><Inicio /></RutaProtegida>} />
                <Route path="/tienda" element={<RutaProtegida><Tienda /></RutaProtegida>} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Login />} />
                <Route path="/comunidad" element={<RutaProtegida><Comunidad /></RutaProtegida>} />
                <Route path="/publicacion/:id" element={<RutaProtegida><Publicacion /></RutaProtegida>} />
                <Route path="/versiones" element={<RutaProtegida><Versiones /></RutaProtegida>} />
                <Route path="/historia" element={<RutaProtegida><Historia /></RutaProtegida>} />
                <Route path="/musica" element={<RutaProtegida><Musica /></RutaProtegida>} />
                <Route path="/musica/cancion/:id" element={<RutaProtegida><Cancion /></RutaProtegida>} />
                <Route path="/musica/playlist/:id" element={<RutaProtegida><Playlist /></RutaProtegida>} />
                <Route path="/musica/album/:id" element={<RutaProtegida><Album /></RutaProtegida>} />
                <Route path="/musica/compositor/:id" element={<RutaProtegida><Compositor /></RutaProtegida>} />
                <Route path="/musica/maestro" element={<RutaProtegida permiso="musica"><MaestroMelodias /></RutaProtegida>}/>
                <Route path="/nosotros" element={<RutaProtegida><Nosotros /></RutaProtegida>} />
                <Route path="/buscar" element={<RutaProtegida><Busqueda /></RutaProtegida>} />
                <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
                <Route path="/admin/usuarios" element={<RutaProtegida soloSuperAdmin><CrearAdmin /></RutaProtegida>} />
            </Routes>
            <GlobalMusicPlayer />
        </>
    );
}

// ----------------- Carga de sesión y contextos -----------------
// Espera a que AuthContext termine de comprobar la sesión antes de montar las rutas.
function AppContent() {
    const { cargando } = useAuth();

    // Espera a que Firebase compruebe la sesión.
    if (cargando) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div
                    className="spinner-border text-primary"
                    role="status"
                >
                    <span className="visually-hidden">
                        Cargando...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <MusicProvider>
                <AppRoutes />
            </MusicProvider>
        </BrowserRouter>
    );
}

// ----------------- Punto de entrada de la aplicación -----------------
// AuthProvider envuelve toda la aplicación para compartir la sesión en cada pantalla.
export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
