import React from 'react';
import Inicio from './paginas/inicio';
import Registro from './paginas/registro';
import { BrowserRouter, Route, Routes }  from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/paginas/inicio" element={<Inicio />} />
        <Route path="/paginas/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  )

}

export default App
