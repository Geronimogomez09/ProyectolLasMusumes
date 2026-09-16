import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/header';
import Footer from './components/Footer';
import Inicio from './pages/index';
import Registro from './pages/signup';
import Tienda from './pages/tienda';
import Login from './pages/login';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/tienda" element={<Tienda />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        <Footer />
    </BrowserRouter>
  )
}

export default App