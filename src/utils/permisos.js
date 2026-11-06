export function tienePermiso(perfil, permiso = null) {
    if (!perfil || perfil.estado === "suspendido") {
        return false;
    }

    if (perfil.rol === "superadmin") {
        return true;
    }

    if (perfil.rol !== "admin") {
        return false;
    }

    // Compatibilidad con administradores antiguos
    if (perfil.permisos === undefined) {
        return true;
    }

    // Si el campo existe, debe ser un arreglo válido
    if (!Array.isArray(perfil.permisos)) {
        return false;
    }

    if (perfil.permisos.includes("todos")) {
        return true;
    }

    if (!permiso) {
        return perfil.permisos.length > 0;
    }

    return perfil.permisos.includes(permiso);
}