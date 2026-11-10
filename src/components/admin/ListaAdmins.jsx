import ItemAdmin from "./ItemAdmin";

// LISTA ADMINS: lista de todas las cuentas con rol "admin".
// PARA QUÉ SE USA: la página /admin/usuarios (pages/crearAdmin.jsx), debajo del formulario.
// QUÉ MUESTRA: una tarjeta ItemAdmin por cada administrador, con sus permisos y los botones
// "Editar permisos" y "Suspender". Si no hay admins muestra un aviso; mientras carga, un texto
// de espera; si falla la lectura, el mensaje de error.
// El superadmin NO aparece acá: su rol es "superadmin" y no se edita desde esta página.
// Recibe: admins (array de perfiles), cargando (true mientras se leen) y error (texto).
function ListaAdmins({ admins = [], cargando = false, error = "" }) {
    return (
        <section
            className="crearadmin-tarjeta"
            aria-labelledby="crearadmin-lista-titulo"
        >
            <div className="crearadmin-tarjeta-cabecera">
                <h2 id="crearadmin-lista-titulo">Administradores</h2>
                <p>
                    {cargando
                        ? "Cargando administradores..."
                        : `${admins.length} ${
                              admins.length === 1 ? "cuenta" : "cuentas"
                          } con rol de administrador.`}
                </p>
            </div>

            {error && (
                <p className="crearadmin-mensaje crearadmin-mensaje--error" role="alert">
                    {error}
                </p>
            )}

            {!cargando && !error && admins.length === 0 && (
                <p className="crearadmin-vacio">
                    Todavía no hay administradores. Creá el primero con el
                    formulario de arriba.
                </p>
            )}

            <div className="crearadmin-lista">
                {admins.map((admin) => (
                    <ItemAdmin key={String(admin.uid)} admin={admin} />
                ))}
            </div>
        </section>
    );
}

export default ListaAdmins;
