import { useState } from 'react';
import './denuncia-modal.css';

const MOTIVOS_DENUNCIA = [
  'Spam o publicidad',
  'Contenido ofensivo o discriminatorio',
  'Información falsa o engañosa',
  'Acoso a otro usuario',
  'Otro motivo',
];

// onConfirmar: ({ motivo, detalle }) => void
// onCancelar: () => void
function DenunciaModal({ onConfirmar, onCancelar }) {
  const [motivo, setMotivo] = useState('');
  const [detalle, setDetalle] = useState('');
  const [error, setError] = useState('');

  function handleEnviar() {
    if (!motivo) {
      setError('Elegí un motivo para la denuncia.');
      return;
    }
    if (motivo === 'Otro motivo' && !detalle.trim()) {
      setError('Contános brevemente el motivo en el campo de texto.');
      return;
    }
    onConfirmar({ motivo, detalle: detalle.trim() });
  }

  return (
    <div className="denuncia-overlay" role="dialog" aria-modal="true">
      <div className="denuncia-modal">
        <h3>Reportar publicación</h3>
        <p className="denuncia-modal__ayuda">
          Contános por qué esta publicación no cumple las normas de la comunidad.
        </p>

        <ul className="denuncia-modal__motivos">
          {MOTIVOS_DENUNCIA.map((m) => (
            <li key={m}>
              <label>
                <input
                  type="radio"
                  name="motivo-denuncia"
                  checked={motivo === m}
                  onChange={() => setMotivo(m)}
                />
                {m}
              </label>
            </li>
          ))}
        </ul>

        <textarea
          className="denuncia-modal__detalle"
          placeholder="Detalles adicionales (obligatorio si elegís 'Otro motivo')"
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          rows={3}
        />

        {error && <p className="denuncia-modal__error">{error}</p>}

        <div className="denuncia-modal__acciones">
          <button className="btn-cancelar-denuncia" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn-enviar-denuncia" onClick={handleEnviar}>
            Enviar denuncia
          </button>
        </div>
      </div>
    </div>
  );
}

export default DenunciaModal;
