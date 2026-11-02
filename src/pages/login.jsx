
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { auth } from "../services/firebase";
import "../styles/login.css";

const PAISES = ["Argentina", "México", "Colombia", "España", "Chile", "Otro"];

// Traducción de errores de Firebase.
function traducirErrorFirebase(code) {
    switch (code) {
        case "auth/email-already-in-use":
            return "Ese email ya está registrado.";
        case "auth/invalid-email":
            return "El email no es válido.";
        case "auth/weak-password":
            return "La contraseña debe tener al menos 6 caracteres.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
            return "Email o contraseña incorrectos.";
        case "auth/too-many-requests":
            return "Demasiados intentos. Probá de nuevo en unos minutos.";
        default:
            return "Ocurrió un error. Intentá nuevamente.";
    }
}

export default function Login() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const [vista, setVista] = useState(
        pathname === "/registro" ? "registro" : "login"
    );

    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Iniciar sesión con Firebase.
    const entrar = async (evento) => {
        evento.preventDefault();
        setError("");

        const formulario = evento.currentTarget;
        const email = formulario.querySelector("#loginEmail").value.trim();
        const password = formulario.querySelector("#loginPassword").value;

        if (!email || !password) {
            setError("Completá todos los campos.");
            return;
        }

        setCargando(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (err) {
            setError(traducirErrorFirebase(err.code));
        } finally {
            setCargando(false);
        }
    };

    // Crear una cuenta normal con Firebase.
    const registrarse = async (evento) => {
        evento.preventDefault();
        setError("");

        const formulario = evento.currentTarget;

        const nombre = formulario.querySelector("#regName").value.trim();
        const email = formulario.querySelector("#regEmail").value.trim();
        const password = formulario.querySelector("#regPassword").value;
        const pais = formulario.querySelector("#regLocation").value;
        const fechaNacimiento =
            formulario.querySelector("#regBirthDate").value;

        if (!nombre || !email || !password || !pais || !fechaNacimiento) {
            setError("Completá todos los campos.");
            return;
        }

        setCargando(true);

        try {
            const credenciales = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            // Guardar el nombre como nombre de perfil de Firebase.
            await updateProfile(credenciales.user, {
                displayName: nombre
            });

            navigate("/");
        } catch (err) {
            setError(traducirErrorFirebase(err.code));
        } finally {
            setCargando(false);
        }
    };

    return (
        <main className="acceso">
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="row w-100 justify-content-center">
                    <div className="col-md-8 col-lg-6">

                        <div className="acceso-tarjeta">
                            <div className="row g-0">

                                {/* INICIAR SESIÓN */}
                                {vista === "login" && (
                                    <div
                                        id="loginSection"
                                        className="col-12 acceso-seccion"
                                        key="login"
                                    >
                                        <h1 className="acceso-titulo">
                                            Iniciar Sesión
                                        </h1>

                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <form onSubmit={entrar}>
                                            <div className="acceso-campo">
                                                <label htmlFor="loginEmail">
                                                    Gmail
                                                </label>
                                                <input
                                                    type="email"
                                                    className="acceso-input"
                                                    id="loginEmail"
                                                    required
                                                    placeholder="correo@gmail.com"
                                                />
                                            </div>

                                            <div className="acceso-campo">
                                                <label htmlFor="loginPassword">
                                                    Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    className="acceso-input"
                                                    id="loginPassword"
                                                    required
                                                    placeholder="****"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="acceso-btn"
                                                disabled={cargando}
                                            >
                                                {cargando
                                                    ? "Ingresando..."
                                                    : "Entrar"}
                                            </button>
                                        </form>

                                        <div className="acceso-cambio">
                                            <p>¿No tienes una cuenta?</p>
                                            <button
                                                type="button"
                                                id="btnShowRegister"
                                                className="acceso-btn-secundario"
                                                onClick={() => {
                                                    setError("");
                                                    setVista("registro");
                                                }}
                                            >
                                                Ir a Registrarse
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* REGISTRO */}
                                {vista === "registro" && (
                                    <div
                                        id="registerSection"
                                        className="col-12 acceso-seccion"
                                        key="registro"
                                    >
                                        <h1 className="acceso-titulo">
                                            Registrarse
                                        </h1>

                                        {error && (
                                            <div className="alert alert-danger" role="alert">
                                                {error}
                                            </div>
                                        )}

                                        <form onSubmit={registrarse}>
                                            <div className="acceso-campo">
                                                <label htmlFor="regName">
                                                    Nombre
                                                </label>
                                                <input
                                                    type="text"
                                                    className="acceso-input"
                                                    id="regName"
                                                    required
                                                    placeholder="Tu nombre completo"
                                                />
                                            </div>

                                            <div className="acceso-campo">
                                                <label htmlFor="regEmail">
                                                    Gmail
                                                </label>
                                                <input
                                                    type="email"
                                                    className="acceso-input"
                                                    id="regEmail"
                                                    required
                                                    placeholder="correo@gmail.com"
                                                />
                                            </div>

                                            <div className="acceso-campo">
                                                <label htmlFor="regPassword">
                                                    Contraseña
                                                </label>
                                                <input
                                                    type="password"
                                                    className="acceso-input"
                                                    id="regPassword"
                                                    required
                                                    minLength={6}
                                                    placeholder="Mínimo 6 caracteres"
                                                />
                                            </div>

                                            <div className="acceso-campo">
                                                <label htmlFor="regLocation">
                                                    Ubicación (País)
                                                </label>
                                                <select
                                                    className="acceso-input"
                                                    id="regLocation"
                                                    required
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>
                                                        Selecciona tu país
                                                    </option>
                                                    {PAISES.map((pais) => (
                                                        <option
                                                            key={pais}
                                                            value={pais}
                                                        >
                                                            {pais}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="acceso-campo">
                                                <label htmlFor="regBirthDate">
                                                    Fecha de Nacimiento
                                                </label>
                                                <input
                                                    type="date"
                                                    className="acceso-input"
                                                    id="regBirthDate"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="acceso-btn"
                                                disabled={cargando}
                                            >
                                                {cargando
                                                    ? "Creando cuenta..."
                                                    : "Crear Cuenta"}
                                            </button>
                                        </form>

                                        <div className="acceso-cambio">
                                            <p>¿Ya tienes cuenta?</p>
                                            <button
                                                type="button"
                                                id="btnShowLogin"
                                                className="acceso-btn-secundario"
                                                onClick={() => {
                                                    setError("");
                                                    setVista("login");
                                                }}
                                            >
                                                Ir a Iniciar Sesión
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}
