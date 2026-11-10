import { useEffect, useState } from "react";
import { Icono, ICONOS, Imagen, SUGERENCIAS_IMAGEN, buscarImagen } from "./imagenesInicio";
import { TIPOS, limpiarDatos } from "./tiposInicio";

// CONTROL TEXTO MODAL INICIO: campo de una línea del formulario del modal.
// Recibe: id, valor, onCambiar (recibe el texto nuevo) y autoFocus.
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

// CONTROL ÁREA MODAL INICIO: campo de varias líneas (por ejemplo, la descripción).
// Recibe: id, valor y onCambiar.
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

// CONTROL ICONO MODAL INICIO: selector con los iconos de src/assets/iconos.
// El icono elegido queda marcado. Recibe: id, valor (nombre del icono) y onCambiar.
function ControlIcono({ id, valor, onCambiar }) {
    if (ICONOS.length === 0) {
        return (
            <small className="inicio-campo-ayuda">
                No hay iconos todavía. Agregá imágenes en src/assets/iconos/.
            </small>
        );
    }

    return (
        <div
            id={id}
            className="inicio-admin-iconos"
            role="radiogroup"
            aria-label="Icono"
        >
            {ICONOS.map((icono) => {
                const nombre = icono.replace(/\.[^.]+$/, "");
                const activo = valor === icono;

                return (
                    <button
                        key={icono}
                        type="button"
                        role="radio"
                        aria-checked={activo}
                        aria-label={nombre}
                        title={nombre}
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

// CONTROL IMAGEN MODAL INICIO: campo para escribir una imagen (nombre de archivo de
// src/assets o una URL https://...) con vista previa. NO sube archivos: solo URL o nombre.
// Recibe: id, valor y onCambiar.
function ControlImagen({ id, valor, onCambiar }) {
    const noEncontrada = Boolean(valor) && !buscarImagen(valor);

    return (
        <div className="inicio-admin-imagen">
            <Imagen
                nombre={valor}
                alt="Vista previa de la imagen"
                loading="eager"
            />

            <div className="inicio-admin-imagen-controles">
                <input
                    id={id}
                    className="inicio-campo-control"
                    type="text"
                    list={`${id}-sugerencias`}
                    value={valor}
                    placeholder="granja.jpg, https://… o /fotos/portada.png"
                    onChange={(e) => onCambiar(e.target.value)}
                    autoComplete="off"
                />

                <datalist id={`${id}-sugerencias`}>
                    {SUGERENCIAS_IMAGEN.map((ruta) => (
                        <option key={ruta} value={ruta} />
                    ))}
                </datalist>

                {noEncontrada && (
                    <small className="inicio-campo-error">
                        No se encontró esa imagen en src/assets/. Revisá el nombre o usá una URL.
                    </small>
                )}
            </div>
        </div>
    );
}

// CONTROLES POR TIPO DE CAMPO: relaciona el tipo de campo de TIPOS (tiposInicio.js)
// con el componente que lo dibuja.
const CONTROLES = {
    texto: ControlTexto,
    area: ControlArea,
    icono: ControlIcono,
    imagen: ControlImagen,
};

// MODAL ADMIN INICIO: ventana del modo administrador del inicio. Tiene dos formas:
//   modo "editar"   -> formulario para agregar o editar una sección o construcción
//   modo "eliminar" -> confirmación para eliminar
// Se cierra con Escape, con la X, con Cancelar o haciendo clic afuera.
// Recibe: modal ({ modo, tipo, id, datos }), onGuardar(tipo, id, datos),
// onEliminar(tipo, id) y onCerrar().
export default function ModalAdminInicio({ modal, onGuardar, onEliminar, onCerrar }) {
    const config = TIPOS[modal.tipo];

    const [datos, setDatos] = useState(modal.datos);
    const [error, setError] = useState("");
    const [guardando, setGuardando] = useState(false);

    // CERRAR CON ESCAPE Y BLOQUEAR SCROLL: mientras el modal está abierto, la página
    // de atrás no se desplaza.
    useEffect(() => {
        const alPresionar = (evento) => {
            if (evento.key === "Escape") onCerrar();
        };

        const overflowPrevio = document.body.style.overflow;

        document.addEventListener("keydown", alPresionar);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", alPresionar);
            document.body.style.overflow = overflowPrevio;
        };
    }, [onCerrar]);

    // CAMBIAR CAMPO: guarda lo que escribe el admin en un campo del formulario.
    const cambiarCampo = (nombre, valor) => {
        setDatos((anterior) => ({
            ...anterior,
            [nombre]: valor,
        }));

        setError("");
    };

    // ENVIAR FORMULARIO: revisa los campos obligatorios y guarda los datos limpios.
    const enviar = async (evento) => {
        evento.preventDefault();

        const faltante = config.campos.find(
            (campo) =>
                campo.requerido &&
                !String(datos[campo.nombre] ?? "").trim()
        );

        if (faltante) {
            setError(`Completá el campo “${faltante.etiqueta}”.`);
            return;
        }

        setGuardando(true);
        await onGuardar(modal.tipo, modal.id, limpiarDatos(modal.tipo, datos));
        setGuardando(false);
    };

    // CERRAR AL HACER CLIC AFUERA: cierra solo si el clic fue sobre el fondo oscuro.
    const cerrarAlHacerClicFuera = (evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
    };

    // MODO ELIMINAR: pregunta si se quiere eliminar el elemento.
    if (modal.modo === "eliminar") {
        return (
            <div
                className="inicio-modal-fondo"
                onMouseDown={cerrarAlHacerClicFuera}
            >
                <div
                    className="inicio-modal inicio-modal-chico"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="inicio-modal-titulo"
                >
                    <div className="inicio-modal-cuerpo">
                        <h2 id="inicio-modal-titulo" className="inicio-modal-titulo">
                            Eliminar {config.singular}
                        </h2>

                        <p className="inicio-modal-texto">
                            ¿Seguro que querés eliminar “{config.nombreDe(modal.datos)}”?
                            Se borra de Firestore y deja de verse para todos los usuarios.
                        </p>
                    </div>

                    <div className="inicio-modal-pie">
                        <button
                            type="button"
                            className="inicio-btn-secundario"
                            onClick={onCerrar}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="inicio-btn-peligro"
                            onClick={() => onEliminar(modal.tipo, modal.id)}
                            autoFocus
                        >
                            <i className="bi bi-trash3-fill me-2"></i>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const esNuevo = modal.id === null;

    // MODO EDITAR: formulario con los campos del tipo (ver TIPOS en tiposInicio.js).
    return (
        <div
            className="inicio-modal-fondo"
            onMouseDown={cerrarAlHacerClicFuera}
        >
            <form
                className="inicio-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="inicio-modal-titulo"
                onSubmit={enviar}
                noValidate
            >
                <div className="inicio-modal-encabezado">
                    <h2 id="inicio-modal-titulo" className="inicio-modal-titulo">
                        {esNuevo ? "Agregar" : "Editar"} {config.singular}
                    </h2>

                    <button
                        type="button"
                        className="inicio-admin-btn"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="inicio-modal-cuerpo">
                    {config.campos.map((campo, indice) => {
                        const id = `campo-${campo.nombre}`;
                        const Control = CONTROLES[campo.tipo];

                        return (
                            <div className="inicio-campo" key={campo.nombre}>
                                <label htmlFor={id}>
                                    {campo.etiqueta}
                                </label>

                                <Control
                                    id={id}
                                    valor={datos[campo.nombre] ?? ""}
                                    onCambiar={(nuevo) => cambiarCampo(campo.nombre, nuevo)}
                                    autoFocus={indice === 0}
                                />

                                {campo.ayuda && (
                                    <small className="inicio-campo-ayuda">
                                        {campo.ayuda}
                                    </small>
                                )}
                            </div>
                        );
                    })}

                    {error && (
                        <p className="inicio-campo-error" role="alert">
                            {error}
                        </p>
                    )}
                </div>

                <div className="inicio-modal-pie">
                    <button
                        type="button"
                        className="inicio-btn-secundario"
                        onClick={onCerrar}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="inicio-btn-principal"
                        disabled={guardando}
                    >
                        <i className="bi bi-check-lg me-2"></i>
                        {guardando
                            ? "Guardando..."
                            : esNuevo ? "Agregar" : "Guardar cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
}
