import { useState } from "react";

import SelectorPermisos from "./SelectorPermisos";
import { crearUsuarioAdmin } from "../../services/crearAdmin";

// EXPRESIÓN DE EMAIL: comprueba que el texto tenga forma de correo (algo@algo.algo).
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// FORMULARIO CREAR ADMIN: formulario para dar de alta una cuenta de administrador nueva.
// PARA QUÉ SE USA: la página /admin/usuarios (pages/crearAdmin.jsx), solo para superadmin.
// QUÉ MUESTRA: campos de nombre de usuario, nombre, email y contraseña, el selector de
// permisos y un botón "Crear administrador". Debajo aparece un mensaje de éxito o de error.
// VALIDA: email válido, contraseña de 6 o más caracteres, nombre de usuario de 3 a 24
// caracteres y al menos una sección elegida.
// No recibe props: guarda la cuenta llamando a crearUsuarioAdmin (services/crearAdmin.js).
function FormularioCrearAdmin() {
    // CAMPOS: valores que el superadmin escribe en el formulario.
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [nombre, setNombre] = useState("");
    const [permisos, setPermisos] = useState([]);

    // ESTADO DEL ENVÍO: error y éxito se muestran debajo del botón.
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [guardando, setGuardando] = useState(false);

    // LIMPIAR FORMULARIO: deja todos los campos vacíos después de crear la cuenta.
    const limpiarFormulario = () => {
        setEmail("");
        setPassword("");
        setMostrarPassword(false);
        setNombreUsuario("");
        setNombre("");
        setPermisos([]);
    };

    // VALIDAR: revisa los datos antes de enviarlos.
    // Devuelve el texto del primer problema, o "" si todo está bien.
    const validar = () => {
        if (!FORMATO_EMAIL.test(email.trim())) {
            return "Escribí un email válido.";
        }

        if (password.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres.";
        }

        const largoUsuario = nombreUsuario.trim().length;

        if (largoUsuario < 3 || largoUsuario > 24) {
            return "El nombre de usuario debe tener entre 3 y 24 caracteres.";
        }

        if (permisos.length === 0) {
            return "Elegí al menos una sección para administrar.";
        }

        return "";
    };

    // ENVIAR: valida, crea la cuenta y muestra el resultado.
    const enviar = async (evento) => {
        evento.preventDefault();

        setError("");
        setExito("");

        const problema = validar();

        if (problema) {
            setError(problema);
            return;
        }

        setGuardando(true);

        try {
            await crearUsuarioAdmin({
                email,
                password,
                nombreUsuario,
                nombre,
                permisos,
            });

            setExito(
                `Se creó el administrador "${nombreUsuario.trim()}". Ya puede iniciar sesión con ese email.`
            );

            limpiarFormulario();
        } catch (err) {
            setError(err.message || "No se pudo crear el administrador.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <section
            className="crearadmin-tarjeta"
            aria-labelledby="crearadmin-form-titulo"
        >
            <div className="crearadmin-tarjeta-cabecera">
                <h2 id="crearadmin-form-titulo">Nuevo administrador</h2>
                <p>
                    Creá una cuenta con acceso al modo administrador de las
                    secciones que elijas.
                </p>
            </div>

            <form className="crearadmin-form" onSubmit={enviar} noValidate>

                {/* DATOS DE LA CUENTA: nombre de usuario y nombre. */}
                <div className="crearadmin-fila">
                    <div className="crearadmin-campo">
                        <label htmlFor="crearadmin-usuario">
                            Nombre de usuario *
                        </label>
                        <input
                            id="crearadmin-usuario"
                            type="text"
                            value={nombreUsuario}
                            onChange={(e) => setNombreUsuario(e.target.value)}
                            placeholder="Entre 3 y 24 caracteres"
                            maxLength={24}
                            autoComplete="off"
                            disabled={guardando}
                        />
                    </div>

                    <div className="crearadmin-campo">
                        <label htmlFor="crearadmin-nombre">Nombre</label>
                        <input
                            id="crearadmin-nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Opcional"
                            maxLength={50}
                            autoComplete="off"
                            disabled={guardando}
                        />
                    </div>
                </div>

                {/* ACCESO: email y contraseña con las que va a iniciar sesión. */}
                <div className="crearadmin-fila">
                    <div className="crearadmin-campo">
                        <label htmlFor="crearadmin-email">
                            Correo electrónico *
                        </label>
                        <input
                            id="crearadmin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@ejemplo.com"
                            autoComplete="off"
                            disabled={guardando}
                        />
                    </div>

                    <div className="crearadmin-campo">
                        <label htmlFor="crearadmin-password">
                            Contraseña *
                        </label>

                        <div className="crearadmin-password">
                            <input
                                id="crearadmin-password"
                                type={mostrarPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                                disabled={guardando}
                            />

                            <button
                                type="button"
                                className="crearadmin-ver-password"
                                onClick={() =>
                                    setMostrarPassword(!mostrarPassword)
                                }
                                aria-pressed={mostrarPassword}
                                disabled={guardando}
                            >
                                {mostrarPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PERMISOS: checkboxes de las secciones del sitio. */}
                <SelectorPermisos
                    permisos={permisos}
                    alCambiar={setPermisos}
                    deshabilitado={guardando}
                    prefijoId="nuevo-admin"
                />

                {/* MENSAJES: error de validación o de Firebase, y confirmación de éxito. */}
                {error && (
                    <p className="crearadmin-mensaje crearadmin-mensaje--error" role="alert">
                        {error}
                    </p>
                )}

                {exito && (
                    <p className="crearadmin-mensaje crearadmin-mensaje--exito" role="status">
                        {exito}
                    </p>
                )}

                <div className="crearadmin-acciones">
                    <button
                        type="submit"
                        className="crearadmin-boton"
                        disabled={guardando}
                    >
                        {guardando ? "Creando cuenta..." : "Crear administrador"}
                    </button>
                </div>
            </form>
        </section>
    );
}

export default FormularioCrearAdmin;
