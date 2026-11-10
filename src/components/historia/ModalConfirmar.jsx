import { useModal } from './ayudasHistoria';

// Índice: Confirmación de acción histórica.
// ----------------- Confirmación de acción histórica -----------------
// Recibe un título, un mensaje, el texto del bot?n y las acciones de confirmar o cerrar. Muestra una decisión clara antes de completar una acción.

// MODAL CONFIRMAR: ventana de confirmación del modo administrador de Historia. Muestra un título,
// un texto de aviso y los botones "Cancelar" y el de confirmar (por ejemplo "Eliminar" o
// "Restaurar"). Se usa para eliminar un hito y para restaurar los hitos originales.
// Recibe: titulo, texto, textoBoton, onConfirmar, onCerrar. Se usa en historia.jsx.
function ModalConfirmar({ titulo, texto, textoBoton, error, onConfirmar, onCerrar }) {
    // Cierra con Escape y bloquea el scroll de la página.
    useModal(onCerrar);

    return (
        <div
            className="inicio-modal-fondo"
            onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onCerrar(); }}
        >
            <div
                className="inicio-modal inicio-modal-chico"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modal-confirmar-titulo"
            >
                <div className="inicio-modal-encabezado">
                    <h2 className="inicio-modal-titulo" id="modal-confirmar-titulo">{titulo}</h2>
                </div>
                <div className="inicio-modal-cuerpo">
                    <p className="inicio-modal-texto">{texto}</p>
                    {error && <p className="inicio-campo-error" role="alert">{error}</p>}
                </div>
                <div className="inicio-modal-pie">
                    <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>Cancelar</button>
                    <button type="button" className="inicio-btn-peligro" onClick={onConfirmar}>{textoBoton}</button>
                </div>
            </div>
        </div>
    );
}

export default ModalConfirmar;