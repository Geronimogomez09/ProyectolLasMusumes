import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ÍNDICE
// - Montaje de React: busca el elemento raíz del HTML y renderiza la aplicación.

// ----------------- Montaje de la aplicación -----------------
// StrictMode ayuda a detectar efectos secundarios problemáticos durante el desarrollo.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
