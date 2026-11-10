import { useEffect, useState } from "react";
import { Icono, ICONOS, Imagen, SUGERENCIAS_IMAGEN, buscarImagen } from "./imagenesInicio";
import { TIPOS } from "./tiposInicio"; // Asumiendo archivo auxiliar de tipos existente

function ControlTexto({ id, valor, onCambiar, autoFocus }) {
    return (
        <input
            id={id}
            className="inicio-campo-control"
            type="text"
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
            autoFocus={autoFocus}
        />
    );
}

function ControlArea({ id, valor, onCambiar }) {
    return (
        <textarea
            id={id}
            className="inicio-campo-control"
            rows={3}
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
        />
    );
}

function ControlIcono({ id, valor, onCambiar }) {
    if (ICONOS.length === 0) {
        return <small className="inicio-campo-ayuda">No hay iconos en src/assets/iconos/.</small>;
    }
    return (
        <div id={id} className="inicio-admin-iconos" role="radiogroup">
            {ICONOS.map((icono) => {
                const activo = valor === icono;
                return (
                    <button
                        key={icono}
                        type="button"
                        className={`inicio-admin-icono ${activo ? "activo" : ""}`}
                        onClick={() => onCambiar(icono)}
                    >
                        <Icono nombre={icono} loading="eager" />
                    </button>
                );
            })}
        </div>
    );
}

function ControlImagen({ id, valor, onCambiar }) {
    const noEncontrada = Boolean(valor) && !buscarImagen(valor);
    return (
        <div className="inicio-admin-imagen">
            <Imagen nombre={valor} alt="Vista previa" loading="eager" />
            <div className="inicio-admin-imagen-controles">
                <input
                    id={id}
                    className="inicio-campo-control"
                    type="text"
                    list={`${id}-sugerencias`}
                    value={valor}
                    placeholder="granja.jpg o URL"
                    onChange={(e) => onCambiar(e.target.value)}
                />
                <datalist id={`${id}-sugerencias`}>
                    {SUGERENCIAS_IMAGEN.map((ruta) => (
                        <option key={ruta} value={ruta} />
                    ))}
                </datalist>
                {noEncontrada && (
                    <small className="inicio-campo-error">Imagen no encontrada en assets.</small>
                )}
            </div>
        </div>
    );
}

const CONTROLES = {
    texto: ControlTexto,
    area: ControlArea,
    icono: ControlIcono,
    imagen: ControlImagen,
};

export default function ModalAdminInicio({ modal, onGuardar, onCerrar }) {
    const config = TIPOS[modal.tipo];
    const [datos, setDatos] = useState(modal.datos);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const alPresionar = (e) => { if (e.key === "Escape") onCerrar(); };
        document.addEventListener("keydown", alPresionar);
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", alPresionar);
            document.body.style.overflow = overflow;
        };
    }, [onCerrar]);

    const cambiarCampo = (nombre, valor) => {
        setDatos((prev) => ({ ...prev, [nombre]: valor }));
        setError("");
    };

    const enviar = async (e) => {
        e.preventDefault();
        const faltante = config.campos.find(
            (c) => c.requerido && !String(datos[c.nombre] ?? "").trim()
        );
        if (faltante) {
            setError(`Completá el campo “${faltante.etiqueta}”.`);
            return;
        }
        setGuardando(true);
        await onGuardar(modal.tipo, modal.id, datos);
        setGuardando(false);
    };

    return (
        <div className="inicio-modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
            <form className="inicio-modal" onSubmit={enviar} noValidate>
                <div className="inicio-modal-encabezado">
                    <h2 className="inicio-modal-titulo">
                        {modal.id === null ? "Agregar" : "Editar"} {config.singular}
                    </h2>
                    <button type="button" className="inicio-admin-btn" onClick={onCerrar}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>
                <div className="inicio-modal-cuerpo">
                    {config.campos.map((campo, idx) => {
                        const Control = CONTROLES[campo.tipo];
                        return (
                            <div className="inicio-campo" key={campo.nombre}>
                                <label htmlFor={`campo-${campo.nombre}`}>{campo.etiqueta}</label>
                                <Control
                                    id={`campo-${campo.nombre}`}
                                    valor={datos[campo.nombre] ?? ""}
                                    onCambiar={(val) => cambiarCampo(campo.nombre, val)}
                                    autoFocus={idx === 0}
                                />
                            </div>
                        );
                    })}
                    {error && <p className="inicio-campo-error">{error}</p>}
                </div>
                <div className="inicio-modal-pie">
                    <button type="button" className="inicio-btn-secundario" onClick={onCerrar}>Cancelar</button>
                    <button type="submit" className="inicio-btn-principal" disabled={guardando}>
                        {guardando ? "Guardando..." : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
}