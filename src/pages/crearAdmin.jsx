import { useEffect, useState } from "react";

import Header from "../components/header";
import Footer from "../components/Footer";
import FormularioCrearAdmin from "../components/admin/FormularioCrearAdmin";
import ListaAdmins from "../components/admin/ListaAdmins";

import { useAuth } from "../context/AuthContext";
import { esSuperAdmin } from "../utils/permisos";
import { escucharAdmins } from "../services/crearAdmin";

import "../styles/crearAdmin.css";

// PÁGINA CREAR ADMIN (ruta /admin/usuarios): pantalla del superadmin para gestionar administradores.
// PARA QUÉ SE USA: crear cuentas de admin, cambiarles los permisos y suspenderlas o reactivarlas.
// QUÉ MUESTRA: el título, el formulario "Nuevo administrador" (FormularioCrearAdmin) y la lista
// de administradores (ListaAdmins). Si la cuenta no es superadmin muestra un aviso de acceso.
// La ruta ya está protegida en App.jsx con soloSuperAdmin; esta página lo vuelve a comprobar.
export default function CrearAdmin() {
    const { perfil } = useAuth();

    // PERMISO: solo el superadmin con la cuenta activa puede usar esta página.
    const puedeEntrar = esSuperAdmin(perfil);

    // LISTA DE ADMINS: se actualiza sola cuando cambia algo en Firestore.
    const [admins, setAdmins] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // ESCUCHAR ADMINS: abre la lectura en vivo solo si es superadmin y la cierra al salir.
    useEffect(() => {
        if (!puedeEntrar) return undefined;

        const dejarDeEscuchar = escucharAdmins(
            (lista) => {
                setAdmins(lista);
                setCargando(false);
                setError("");
            },
            (err) => {
                console.error("No se pudieron cargar los administradores:", err);
                setError("No se pudieron cargar los administradores.");
                setCargando(false);
            }
        );

        return () => dejarDeEscuchar();
    }, [puedeEntrar]);

    // SIN ACCESO: aviso para cuentas que no son superadmin.
    if (!puedeEntrar) {
        return (
            <>
                <Header />

                <main className="crearadmin-page">
                    <div className="crearadmin-contenedor">
                        <section className="crearadmin-tarjeta">
                            <h1 className="crearadmin-titulo">Acceso restringido</h1>
                            <p className="crearadmin-texto">
                                Esta página es solo para el superadmin.
                            </p>
                        </section>
                    </div>
                </main>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <main className="crearadmin-page">
                <div className="crearadmin-contenedor">

                    {/* TÍTULO DE LA PÁGINA */}
                    <header className="crearadmin-encabezado">
                        <span className="crearadmin-etiqueta">Wiki-Craft · Superadmin</span>
                        <h1 className="crearadmin-titulo">Administradores</h1>
                        <p className="crearadmin-texto">
                            Creá cuentas de administrador y elegí qué secciones
                            del sitio puede modificar cada una.
                        </p>
                    </header>

                    <FormularioCrearAdmin />

                    <ListaAdmins admins={admins} cargando={cargando} error={error} />
                </div>
            </main>

            <Footer />
        </>
    );
}
