// Índice: Formato y ayudas de historia.
// ----------------- Formato y ayudas de historia -----------------
// Agrupa funciones pequeñas para normalizar datos de eventos, como fechas y valores de la línea de tiempo. Recibe datos simples y devuelve su versión lista para mostrar o procesar.

// AYUDAS HISTORIA: funciones chicas que comparten la página Historia y sus componentes
// (formatear fecha, ordenar hitos por fecha, desplazar la página a un hito y bloquear el
// scroll cuando hay una ventana abierta). No muestra nada en pantalla.
import { useEffect } from 'react';

// FORMATEAR FECHA: convierte una fecha ISO ("2009-05-17") en texto legible ("17 de mayo de 2009").
// Se usa en ModalEvento para armar el texto de la fecha cuando el administrador lo deja vacío.
export function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// POR FECHA: función para ordenar hitos de más viejo a más nuevo (si la fecha es igual, por id).
// Se usa en historia.jsx al agrupar los hitos por era.
export const porFecha = (a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.id - b.id);

// DESPLAZAR A: lleva la pantalla hasta el elemento con ese id, con scroll suave
// (salvo que la persona haya pedido "reducir movimiento"). Se usa en el botón
// "Empezar el recorrido", en el aside y al guardar un hito.
export function desplazarA(id, alineacion = 'center') {
  const el = document.getElementById(id);
  if (!el) return;
  const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: alineacion });
}

// USE MODAL: hook para las ventanas (ModalEvento y ModalConfirmar). Cierra la ventana con la
// tecla Escape y bloquea el scroll de la página mientras la ventana está abierta.
export function useModal(onCerrar) {
  useEffect(() => {
    const alTeclear = (ev) => { if (ev.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);
}