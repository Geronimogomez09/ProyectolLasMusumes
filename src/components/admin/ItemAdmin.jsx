import { useState } from "react";

import SelectorPermisos from "./SelectorPermisos";
import {
    actualizarPermisosAdmin,
    cambiarSuspensionAdmin,
} from "../../services/crearAdmin";
import { SECCIONES_ADMIN } from "../../utils/permisos";

// NOMBRE DE SECCIÓN: busca el texto visible de una sección a partir de su id.
// Recibe: id (ej: "comunidad"). Devuelve: el nombre (ej: "Comunidad").
const nombreSeccion = (id) =>
    SECCIONES_ADMIN.find((seccion) => seccion.id === id)?.nombre || id;

// ITEM ADMIN: tarjeta de un administrador dentro de la lista de admins.
// PARA QUÉ SE USA: ListaAdmins (components/admin/ListaAdmins.jsx).
// QUÉ MUESTRA: nombre de usuario, email, estado (Activa / Suspendida) y las secciones que
// administra. Tiene los botones "Editar permisos" y "Suspender" / "Reactivar".
// Al tocar "Editar permisos" se abre el SelectorPermisos con "Guardar permisos" y "Cancelar".
// Recibe: admin (el perfil usuarios/{uid} del administrador).
function ItemAdmin({ admin }) {
    // Un usuario viejo puede no tener el campo permisos: se trata como lista vacía.
    const permisosActuales = Array.isArray(admin.permisos) ? admin.permisos : [];
    const suspendida = admin.estado === "suspendido";

    // ESTADO DE EDICIÓN: si el selector está abierto y qué permisos están marcados.
    const [editando, setEditando] = useState(false);
    const [permisosEditados, setPermisosEditados] = useState(permisosActuales);

    // ESTADO DE LA OPERACIÓN: bloquea los botones y muestra errores.
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    // EMPEZAR EDICIÓN: abre el selector con los permisos que ya tiene el admin.
    const empezarEdicion = () => {
        setPermisosEditados(permisosActuales);
        setError("");
        setEditando(true);
    };

    // CANCELAR EDICIÓN: cierra el selector sin guardar.
    const cancelarEdicion = () => {
        setError("");
        setEditando(false);
    };

    // GUARDAR PERMISOS: valida que quede al menos una sección y actualiza Firestore.
    const guardarPermisos = async () => {
        setError("");

        if (permisosEditados.length === 0) {
            setError("Elegí al menos una sección para administrar.");
            return;
        }

        setGuardando(true);

        try {
            await actualizarPermisosAdmin(admin.uid, permisosEditados);
            setEditando(false);
        } catch (err) {
            setError(err.message || "No se pudieron guardar los permisos.");
        } finally {
            setGuardando(false);
        }
    };

    // ALTERNAR SUSPENSIÓN: suspende la cuenta si estaba activa, o la reactiva.
    const alternarSuspension = async () => {
        setError("");

        const nombre = admin.nombreUsuario || admin.email || "este administrador";

        const confirmar = window.confirm(
            suspendida
                ? `¿Reactivar la cuenta de ${nombre}?`
                : `¿Suspender la cuenta de ${nombre}? No va a poder entrar al sitio.`
        );

        if (!confirmar) return;

        setGuardando(true);

        try {
            await cambiarSuspensionAdmin(admin.uid, !suspendida);
        } catch (err) {
            setError(err.message || "No se pudo cambiar el estado de la cuenta.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <article className={`crearadmin-admin ${suspendida ? "suspendido" : ""}`}>

            {/* ENCABEZADO: avatar con inicial, nombres y estado de la cuenta. */}
            <div className="crearadmin-admin-cabecera">
                <div className="crearadmin-admin-avatar" aria-hidden="true">
                    {(admin.nombreUsuario || admin.email || "A")
                        .slice(0, 1)
                        .toUpperCase()}
                </div>

                <div className="crearadmin-admin-datos">
                    <strong>{admin.nombreUsuario || "Sin nombre de usuario"}</strong>
                    <span>{admin.email || "Sin correo"}</span>
                </div>

                <span
                    className={`crearadmin-estado ${
                        suspendida ? "crearadmin-estado--suspendida" : ""
                    }`}
                >
                    {suspendida ? "Suspendida" : "Activa"}
                </span>
            </div>

            {/* PERMISOS: lista de secciones o selector si se está editando. */}
            {editando ? (
                <div className="crearadmin-admin-edicion">
                    <SelectorPermisos
                        permisos={permisosEditados}
                        alCambiar={setPermisosEditados}
                        deshabilitado={guardando}
                        prefijoId={`admin-${admin.uid}`}
                    />

                    <div className="crearadmin-acciones">
                        <button
                            type="button"
                            className="crearadmin-boton crearadmin-boton--chico"
                            onClick={guardarPermisos}
                            disabled={guardando}
                        >
                            {guardando ? "Guardando..." : "Guardar permisos"}
                        </button>

                        <button
                            type="button"
                            className="crearadmin-boton crearadmin-boton--suave crearadmin-boton--chico"
                            onClick={cancelarEdicion}
                            disabled={guardando}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <ul className="crearadmin-admin-secciones" aria-label="Secciones que administra">
                        {permisosActuales.length > 0 ? (
                            permisosActuales.map((id) => (
                                <li key={id}>{nombreSeccion(id)}</li>
                            ))
                        ) : (
                            <li className="vacio">Sin permisos asignados</li>
                        )}
                    </ul>

                    <div className="crearadmin-acciones">
                        <button
                            type="button"
                            className="crearadmin-boton crearadmin-boton--suave crearadmin-boton--chico"
                            onClick={empezarEdicion}
                            disabled={guardando}
                        >
                            Editar permisos
                        </button>

                        <button
                            type="button"
                            className={`crearadmin-boton crearadmin-boton--chico ${
                                suspendida ? "" : "crearadmin-boton--peligro"
                            }`}
                            onClick={alternarSuspension}
                            disabled={guardando}
                        >
                            {suspendida ? "Reactivar" : "Suspender"}
                        </button>
                    </div>
                </>
            )}

            {error && (
                <p className="crearadmin-mensaje crearadmin-mensaje--error" role="alert">
                    {error}
                </p>
            )}
        </article>
    );
}

export default ItemAdmin;
