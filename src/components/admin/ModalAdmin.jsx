import { useEffect, useState } from "react";
import {
    CARPETA_ICONOS,
    ICONOS,
    SUGERENCIAS_IMAGEN,
    Icono,
    Imagen,
    buscarImagen,
    leerImagenSubida,
} from "../../utils/imagenes";
import "../../styles/admin.css";

/* ============================================================================
   VENTANAS DE ADMINISTRACIÓN
   ----------------------------------------------------------------------------
   Se usan en Inicio y en la página de cada publicación.

   <ModalFormulario  titulo campos datos textoGuardar onGuardar onCerrar />
   <ModalConfirmar   titulo mensaje textoConfirmar peligro onConfirmar onCerrar />

   Un campo es: { nombre, etiqueta, tipo, requerido?, ayuda?, limpiar? }
   Tipos disponibles: "texto", "area", "icono", "imagen" (ver CONTROLES más abajo).
   ========================================================================= */

/* ---------- Comportamiento común de las ventanas ---------- */

// Escape cierra la ventana y se bloquea el scroll de la página mientras está abierta.
function useVentana(onCerrar) {
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
}

// Deja los datos listos para guardar: sin espacios sobrantes y con cada "limpiar" aplicado.
function limpiarDatos(campos, datos) {
    const limpios = { ...datos };

    for (const campo of campos) {
        let valor = limpios[campo.nombre] ?? "";
        if (typeof valor === "string") valor = valor.trim();
        if (campo.limpiar) valor = campo.limpiar(valor);
        limpios[campo.nombre] = valor;
    }

    return limpios;
}

/* ---------- Controles del formulario ----------
   Todos reciben las mismas props: { id, valor, onCambiar, autoFocus }. */

function ControlTexto({ id, valor, onCambiar, autoFocus }) {
    return (
        <input
            id={id}
            className="admin-campo-control"
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
            className="admin-campo-control"
            rows={3}
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
        />
    );
}

// Elige un icono entre los archivos de la carpeta de iconos.
function ControlIcono({ id, valor, onCambiar }) {
    if (ICONOS.length === 0) {
        return (
            <small className="admin-campo-ayuda">
                No hay iconos todavía. Agregá imágenes en src/assets/{CARPETA_ICONOS}/.
            </small>
        );
    }

    return (
        <div id={id} className="admin-iconos" role="radiogroup" aria-label="Icono">
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
                        className={`admin-icono ${activo ? "activo" : ""}`}
                        onClick={() => onCambiar(icono)}
                    >
                        <Icono nombre={icono} loading="eager" />
                    </button>
                );
            })}
        </div>
    );
}

// Acepta un nombre, una ruta, una URL, o una imagen subida desde el dispositivo.
function ControlImagen({ id, valor, onCambiar }) {
    const [subiendo, setSubiendo] = useState(false);
    const [errorArchivo, setErrorArchivo] = useState("");

    const esSubida = valor.startsWith("data:") || valor.startsWith("blob:");
    const noEncontrada = Boolean(valor) && !buscarImagen(valor);

    const elegirArchivo = async (evento) => {
        const archivo = evento.target.files?.[0];
        evento.target.value = "";
        if (!archivo) return;

        setSubiendo(true);
        setErrorArchivo("");

        try {
            onCambiar(await leerImagenSubida(archivo));
        } catch (error) {
            setErrorArchivo(error.message);
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="admin-imagen">
            <Imagen nombre={valor} alt="Vista previa de la imagen" loading="eager" />

            <div className="admin-imagen-controles">
                <input
                    id={id}
                    className="admin-campo-control"
                    type="text"
                    list={`${id}-sugerencias`}
                    value={esSubida ? "" : valor}
                    placeholder={esSubida ? "Imagen subida" : "granja.jpg, https://… o /fotos/portada.png"}
                    onChange={(e) => onCambiar(e.target.value)}
                    autoComplete="off"
                />
                <datalist id={`${id}-sugerencias`}>
                    {SUGERENCIAS_IMAGEN.map((ruta) => (
                        <option key={ruta} value={ruta} />
                    ))}
                </datalist>

                <label className="admin-subir">
                    <i className="bi bi-upload"></i>
                    {subiendo ? "Subiendo…" : "Subir imagen"}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={elegirArchivo}
                        disabled={subiendo}
                        hidden
                    />
                </label>

                {noEncontrada && (
                    <small className="admin-campo-error">
                        No se encontró esa imagen en src/assets/. Revisá el nombre o usá una URL.
                    </small>
                )}
                {errorArchivo && <small className="admin-campo-error">{errorArchivo}</small>}
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

/* ---------- Ventana con formulario ---------- */

export function ModalFormulario({
    titulo,
    campos,
    datos: datosIniciales,
    textoGuardar = "Guardar cambios",
    onGuardar,
    onCerrar,
}) {
    const [datos, setDatos] = useState(datosIniciales);
    const [error, setError] = useState("");

    useVentana(onCerrar);

    const cambiarCampo = (nombre, valor) => {
        setDatos((anterior) => ({ ...anterior, [nombre]: valor }));
        setError("");
    };

    const enviar = (evento) => {
        evento.preventDefault();

        const faltante = campos.find(
            (campo) => campo.requerido && !String(datos[campo.nombre] ?? "").trim()
        );

        if (faltante) {
            setError(`Completá el campo “${faltante.etiqueta}”.`);
            return;
        }

        onGuardar(limpiarDatos(campos, datos));
    };

    const cerrarAlHacerClicFuera = (evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
    };

    return (
        <div className="admin-modal-fondo" onMouseDown={cerrarAlHacerClicFuera}>
            <form
                className="admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-modal-titulo"
                onSubmit={enviar}
                noValidate
            >
                <div className="admin-modal-encabezado">
                    <h2 id="admin-modal-titulo" className="admin-modal-titulo">{titulo}</h2>
                    <button
                        type="button"
                        className="admin-btn"
                        onClick={onCerrar}
                        aria-label="Cerrar"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="admin-modal-cuerpo">
                    {campos.map((campo, indice) => {
                        const id = `campo-${campo.nombre}`;
                        const Control = CONTROLES[campo.tipo];

                        return (
                            <div className="admin-campo" key={campo.nombre}>
                                <label htmlFor={id}>
                                    {campo.etiqueta}
                                    {campo.requerido && <span className="admin-campo-obligatorio"> *</span>}
                                </label>

                                <Control
                                    id={id}
                                    valor={datos[campo.nombre] ?? ""}
                                    onCambiar={(nuevo) => cambiarCampo(campo.nombre, nuevo)}
                                    autoFocus={indice === 0}
                                />

                                {campo.ayuda && <small className="admin-campo-ayuda">{campo.ayuda}</small>}
                            </div>
                        );
                    })}

                    {error && <p className="admin-campo-error" role="alert">{error}</p>}
                </div>

                <div className="admin-modal-pie">
                    <button type="button" className="admin-boton secundario" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button type="submit" className="admin-boton principal">
                        <i className="bi bi-check-lg"></i>
                        {textoGuardar}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ---------- Ventana de confirmación ---------- */

export function ModalConfirmar({
    titulo,
    mensaje,
    textoConfirmar = "Confirmar",
    peligro = false,
    onConfirmar,
    onCerrar,
}) {
    useVentana(onCerrar);

    const cerrarAlHacerClicFuera = (evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
    };

    return (
        <div className="admin-modal-fondo" onMouseDown={cerrarAlHacerClicFuera}>
            <div
                className="admin-modal admin-modal-chico"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="admin-modal-titulo"
            >
                <div className="admin-modal-cuerpo">
                    <h2 id="admin-modal-titulo" className="admin-modal-titulo">{titulo}</h2>
                    <p className="admin-modal-texto">{mensaje}</p>
                </div>

                <div className="admin-modal-pie">
                    <button type="button" className="admin-boton secundario" onClick={onCerrar}>
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className={`admin-boton ${peligro ? "peligro" : "principal"}`}
                        onClick={onConfirmar}
                        autoFocus
                    >
                        {peligro && <i className="bi bi-trash3-fill"></i>}
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}
