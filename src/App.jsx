
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inicio from "./pages/index";
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
import { AuthProvider, useAuth } from "./context/AuthContext";
import RutaProtegida from "./components/RutaProtegida";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./styles/App.css";

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

function AppRoutes() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/tienda" element={<Tienda />} />
                <Route path="/login" element={<Login />} />
                <Route path="/comunidad" element={<Comunidad />} />
                <Route path="/publicacion/:id" element={<Publicacion />} />
                <Route path="/versiones" element={<Versiones />} />
                <Route path="/historia" element={<Historia />} />
                <Route path="/musica" element={<Musica />} />
                <Route path="/musica/cancion/:id" element={<Cancion />} />
                <Route path="/musica/playlist/:id" element={<Playlist />} />
                <Route path="/musica/album/:id" element={<Album />} />
                <Route path="/musica/compositor/:id" element={<Compositor />} />
                <Route path="/musica/maestro" element={<RutaProtegida soloAdmin><MaestroMelodias /></RutaProtegida>}/>
                <Route path="/nosotros" element={<Nosotros />} />
            </Routes>

            <GlobalMusicPlayer />
        </>
    );
}

// Componente principal de la aplicación.
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

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
