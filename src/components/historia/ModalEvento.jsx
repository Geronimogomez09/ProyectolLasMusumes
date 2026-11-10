import { useEffect, useRef, useState } from 'react';
import ImagenEvento from './ImagenEvento';
import { formatearFecha, useModal } from './ayudasHistoria';
import { ERAS, TIPOS, TEXTURAS_SUGERIDAS, VACIO } from '../../data/historiaData';

// Índice: Crear y editar eventos históricos.
// ----------------- Crear y editar eventos históricos -----------------
// Recibe los datos iniciales del evento y de su era, además de las acciones para guardar o cerrar. Permite editar los campos y devuelve el evento al componente de historia.

// MODAL EVENTO: ventana del modo administrador para agregar o editar un hito de Historia.
// Muestra el formulario con título, fecha, tipo, era, versión, descripción, puntos clave,
// imagen (con vista previa y texturas sugeridas) y la casilla "hito clave". Valida los datos
// antes de guardar.
// Recibe: inicial (hito a editar, o null si es nuevo), eraInicial, onGuardar, onCerrar.
// Se usa en historia.jsx.
function ModalEvento({ inicial, eraInicial, onGuardar, onCerrar }) {
    // Datos del formulario: si se edita, parte del hito (los puntos pasan a texto, uno por línea).
    const [d, setD] = useState(() =>
        inicial
            ? { ...VACIO, ...inicial, puntosTexto: (inicial.puntos || []).join('\n') }
            : { ...VACIO, era: eraInicial || ERAS[0].id }
    );
    const [error, setError] = useState('');
    const primerCampo = useRef(null);

    // Cierra con Escape y bloquea el scroll de la página.
    useModal(onCerrar);

    // Pone el cursor en el campo "Título" al abrir.
    useEffect(() => { primerCampo.current?.focus(); }, []);

    // CAMBIAR: devuelve la función que actualiza un campo del formulario.
    const cambiar = (campo) => (ev) => {
        const valor = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value;
        setD((previo) => ({ ...previo, [campo]: valor }));
    };

    // ENVIAR: valida los campos y, si está todo bien, entrega el hito a la página.
    function enviar(ev) {
        ev.preventDefault();
        if (!d.titulo.trim()) return setError('Escribí un título para el hito.');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) return setError('Elegí una fecha válida.');
        if (!d.descripcion.trim()) return setError('Agregá una descripción.');
        if (d.imagen.trim() && !/^https?:\/\//i.test(d.imagen.trim())) {
            return setError('La imagen tiene que ser un enlace que empiece con http:// o https://');
        }

        onGuardar({
            id: inicial?.id,
            era: d.era,
            fecha: d.fecha,
            fechaTexto: d.fechaTexto.trim() || formatearFecha(d.fecha),
            tipo: d.tipo,
            version: d.version.trim(),
            titulo: d.titulo.trim(),
            descripcion: d.descripcion.trim(),
            puntos: d.puntosTexto.split('\n').map((p) => p.trim()).filter(Boolean),
            imagen: d.imagen.trim(),
            ajuste: d.ajuste,
            destacada: d.destacada,
        });
    }

    return (
        <div
            className="inicio-modal-fondo"
            onMouseDown={(ev) => { if (ev.target === ev.currentTarget) onCerrar(); }}
        >
            <form
                className="inicio-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-evento-titulo"
                onSubmit={enviar}
                noValidate
            >
                <div className="inicio-modal-encabezado">
                    <h2 className="inicio-modal-titulo" id="modal-evento-titulo">
                        {inicial ? 'Editar hito' : 'Agregar hito'}
                    </h2>
                    <button type="button" className="inicio-admin-btn" aria-label="Cerrar" onClick={onCerrar}>×</button>
                </div>

                <div className="inicio-modal-cuerpo">
                    {/* TÍTULO */}
                    <div className="inicio-campo">
                        <label htmlFor="h-titulo">Título</label>
                        <input
                            id="h-titulo"
                            ref={primerCampo}
                            className="inicio-campo-control"
                            value={d.titulo}
                            onChange={cambiar('titulo')}
                            maxLength={80}
                        />
                    </div>

                    {/* FECHA Y TIPO */}
                    <div className="historia-form-fila">
                        <div className="inicio-campo">
                            <label htmlFor="h-fecha">Fecha</label>
                            <input
                                id="h-fecha"
                                type="date"
                                className="inicio-campo-control"
                                value={d.fecha}
                                onChange={cambiar('fecha')}
                            />
                        </div>
                        <div className="inicio-campo">
                            <label htmlFor="h-tipo">Tipo</label>
                            <select id="h-tipo" className="inicio-campo-control" value={d.tipo} onChange={cambiar('tipo')}>
                                {TIPOS.map((t) => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* TEXTO DE LA FECHA (opcional) */}
                    <div className="inicio-campo">
                        <label htmlFor="h-fecha-texto">Texto de la fecha (opcional)</label>
                        <input
                            id="h-fecha-texto"
                            className="inicio-campo-control"
                            value={d.fechaTexto}
                            onChange={cambiar('fechaTexto')}
                            placeholder="Ej.: Fines de junio de 2010"
                        />
                        <span className="inicio-campo-ayuda">
                            Si lo dejás vacío se arma solo a partir de la fecha, por ejemplo «17 de mayo de 2009».
                        </span>
                    </div>

                    {/* ERA Y VERSIÓN */}
                    <div className="historia-form-fila">
                        <div className="inicio-campo">
                            <label htmlFor="h-era">Era</label>
                            <select id="h-era" className="inicio-campo-control" value={d.era} onChange={cambiar('era')}>
                                {ERAS.map((era) => <option key={era.id} value={era.id}>{era.nombre}</option>)}
                            </select>
                        </div>
                        <div className="inicio-campo">
                            <label htmlFor="h-version">Versión (opcional)</label>
                            <input
                                id="h-version"
                                className="inicio-campo-control"
                                value={d.version}
                                onChange={cambiar('version')}
                                placeholder="Ej.: 1.21"
                                maxLength={40}
                            />
                        </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="inicio-campo">
                        <label htmlFor="h-desc">Descripción</label>
                        <textarea
                            id="h-desc"
                            rows={4}
                            className="inicio-campo-control"
                            value={d.descripcion}
                            onChange={cambiar('descripcion')}
                        />
                    </div>

                    {/* PUNTOS CLAVE (opcional) */}
                    <div className="inicio-campo">
                        <label htmlFor="h-puntos">Puntos clave (opcional)</label>
                        <textarea
                            id="h-puntos"
                            rows={4}
                            className="inicio-campo-control"
                            value={d.puntosTexto}
                            onChange={cambiar('puntosTexto')}
                        />
                        <span className="inicio-campo-ayuda">Uno por línea. Se ven al tocar «Ver detalles».</span>
                    </div>

                    {/* IMAGEN: enlace, estilo, vista previa y texturas sugeridas */}
                    <div className="inicio-campo">
                        <label>Imagen</label>
                        <div className="inicio-admin-imagen">
                            <div className="historia-preview" data-ajuste={d.ajuste}>
                                <ImagenEvento src={d.imagen.trim()} alt="Vista previa" />
                            </div>
                            <div className="inicio-admin-imagen-controles">
                                <input
                                    className="inicio-campo-control"
                                    value={d.imagen}
                                    onChange={cambiar('imagen')}
                                    placeholder="https://..."
                                    aria-label="Enlace de la imagen"
                                />
                                <select
                                    className="inicio-campo-control"
                                    value={d.ajuste}
                                    onChange={cambiar('ajuste')}
                                    aria-label="Estilo de la imagen"
                                >
                                    <option value="pixel">Pixel art / textura (se agranda sin suavizar)</option>
                                    <option value="foto">Captura o foto (ocupa todo el recuadro)</option>
                                </select>
                            </div>
                        </div>
                        <span className="inicio-campo-ayuda">Pegá un enlace o elegí una textura:</span>
                        <div className="inicio-admin-iconos">
                            {TEXTURAS_SUGERIDAS.map(([nombre, url]) => (
                                <button
                                    key={url}
                                    type="button"
                                    title={nombre}
                                    aria-label={nombre}
                                    className={`inicio-admin-icono${d.imagen === url ? ' activo' : ''}`}
                                    onClick={() => setD((p) => ({ ...p, imagen: url, ajuste: 'pixel' }))}
                                >
                                    <img src={url} alt="" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* HITO CLAVE */}
                    <label className="historia-check">
                        <input type="checkbox" checked={d.destacada} onChange={cambiar('destacada')} />
                        Marcar como hito clave
                    </label>

                    {error && <p className="inicio-campo-error" role="alert">{error}</p>}
                </div>

                <div className="inicio-modal-pie">
                    <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>Cancelar</button>
                    <button type="submit" className="inicio-btn-principal">
                        {inicial ? 'Guardar cambios' : 'Agregar hito'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ModalEvento;