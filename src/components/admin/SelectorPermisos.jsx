import { SECCIONES_ADMIN } from "../../utils/permisos";

// SELECTOR PERMISOS: muestra un checkbox por cada sección que se puede administrar
// (Inicio, Historia, Versiones, Comunidad, Música, Tienda).
// PARA QUÉ SE USA: elegir los permisos de un admin, tanto al crearlo (FormularioCrearAdmin)
// como al editarlo (ItemAdmin).
// QUÉ MUESTRA: una grilla de casillas; las marcadas son las secciones con permiso.
// Recibe: permisos (array de ids marcados), alCambiar (recibe el array nuevo),
// deshabilitado (bloquea las casillas mientras se guarda) y prefijoId (evita ids repetidos
// cuando hay varios selectores en la misma página).
function SelectorPermisos({
    permisos = [],
    alCambiar,
    deshabilitado = false,
    prefijoId = "permiso",
}) {
    // ALTERNAR PERMISO: marca o desmarca una sección y avisa la lista nueva.
    const alternarPermiso = (idSeccion) => {
        const nuevaLista = permisos.includes(idSeccion)
            ? permisos.filter((id) => id !== idSeccion)
            : [...permisos, idSeccion];

        alCambiar(nuevaLista);
    };

    return (
        <fieldset className="crearadmin-permisos" disabled={deshabilitado}>
            <legend>Secciones que va a administrar</legend>

            <div className="crearadmin-permisos-grilla">
                {SECCIONES_ADMIN.map((seccion) => {
                    const idCampo = `${prefijoId}-${seccion.id}`;
                    const marcado = permisos.includes(seccion.id);

                    return (
                        <label
                            key={seccion.id}
                            htmlFor={idCampo}
                            className={`crearadmin-permiso ${
                                marcado ? "marcado" : ""
                            }`}
                        >
                            <input
                                id={idCampo}
                                type="checkbox"
                                checked={marcado}
                                onChange={() => alternarPermiso(seccion.id)}
                            />
                            <span>{seccion.nombre}</span>
                        </label>
                    );
                })}
            </div>
        </fieldset>
    );
}

export default SelectorPermisos;
