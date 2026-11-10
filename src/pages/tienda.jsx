/*
Este archivo contiene la pantalla principal de la tienda de Wiki-Craft. No es
solamente una lista de productos: coordina el catálogo público, el carrusel de
banners, el detalle de cada producto, el carrito y las herramientas de
administración.

CÓMO SE ORGANIZA EL ARCHIVO
---------------------------
1. IMPORTACIONES
   React aporta useState, useEffect y useMemo:
   - useState conserva información que puede cambiar mientras se usa la página.
   - useEffect ejecuta tareas relacionadas con el ciclo de vida: escuchar Firebase,
     iniciar temporizadores y registrar eventos del navegador.
   - useMemo conserva un resultado calculado y lo vuelve a calcular cuando cambian
     sus dependencias.

   Los componentes Header, Footer, TarjetaProducto, ControlesTienda,
   CategoriasTienda, AdministrarProductos, Carrito, BotonAdmin y DetalleProducto
   separan partes de la interfaz. Tienda les pasa información y funciones mediante
   props; los componentes hijos no necesitan duplicar toda la lógica de esta página.

   useAuth obtiene el perfil de la sesión. tienePermiso comprueba si ese perfil
   puede administrar la tienda. useGuardados administra los productos favoritos.
   Las funciones importadas desde firestore.js son la conexión entre esta pantalla
   y la base de datos Firestore.

2. BANNERS PREDETERMINADOS
   slidesBanner es el contenido de respaldo del carrusel. Cada elemento es un objeto
   con textos e imagen. Se usa cuando todavía no llegaron banners desde Firestore
   o cuando se inicializa una tienda vacía.

3. BANNERTIENDA
   Es un componente independiente que muestra el carrusel público.
   - slideActual indica qué posición se está mostrando.
   - transicionActiva decide si el movimiento tiene animación CSS.
   - slidesCarrusel agrega una copia del último banner al principio y una copia del
     primero al final. Esas copias permiten simular un carrusel infinito.
   - setInterval cambia de banner cada cinco segundos.
   - setTimeout y requestAnimationFrame permiten saltar de las copias a los banners
     reales sin que el salto técnico se vea animado.
   - moverSlide responde a las flechas y limita el índice para que no se salga del
     rango disponible.
   - finalizarTransicion es una segunda protección para corregir el índice cuando
     termina una transición en uno de los extremos.

4. ADMINISTRARBANNERS
   Es el panel que permite crear, modificar y eliminar banners.
   - formularioInicial define la forma de los datos que se editan.
   - form conserva los valores escritos en los campos.
   - bannerEditando guarda el ID del banner que se está modificando. Si vale null,
     el formulario está creando uno nuevo.
   - busquedaProducto permite buscar un producto para asociarlo al botón del banner.
   - guardando evita presentar el formulario como disponible mientras se guarda.
   - cambiarCampo actualiza una propiedad del formulario según el atributo name
     del input o textarea.
   - guardarBanner decide entre crear y modificar, y después limpia el formulario.
   - editarBanner carga los datos de un banner existente en el formulario.
   - borrarBanner pide confirmación y evita que la lista quede sin ningún banner.

5. MIGRACIÓN DE DATOS LOCALES
   cargarProductos y cargarBanners leen respaldos antiguos de localStorage.
   localStorage guarda texto en el navegador, por eso JSON.parse convierte ese texto
   en arrays u objetos de JavaScript. JSON.stringify realiza el proceso inverso.
   Estas funciones sirven como compatibilidad con datos de una versión anterior;
   no reemplazan la sincronización normal con Firestore.

6. COMPONENTE TIENDA Y ESTADOS
   Tienda es el componente principal. Sus estados son la memoria de trabajo de esta
   pantalla:
   - productos: catálogo recibido desde Firestore.
   - banners: banners recibidos desde Firestore.
   - restaurandoTienda: indica que se está guardando o restaurando una copia.
   - administradorAbierto: indica si el panel administrativo está desplegado.
   - carrito: array de unidades agregadas por la persona.
   - busqueda: texto escrito en el buscador.
   - categoriaActiva: categoría seleccionada.
   - carritoAbierto: controla la visibilidad del carrito.
   - productoDetalleId: ID del producto solicitado en la URL.

   Un estado no es una variable común: al cambiar mediante su función set..., React
   vuelve a renderizar el componente para reflejar el nuevo valor en la pantalla.

7. PERMISOS Y FIRESTORE
   useAuth entrega perfil. tienePermiso(perfil, "tienda") produce puedeAdministrar.
   El efecto de sincronización llama a escucharProductos y escucharHeroes. Estas
   funciones mantienen la pantalla actualizada cuando cambian documentos remotos.
   Devuelven funciones canceladoras, que se ejecutan al desmontar el componente o
   cuando cambia puedeAdministrar. La inicialización de una tienda vacía solo se
   intenta desde una sesión con permiso de administración.

8. DETALLE MEDIANTE HASH
   El hash es la parte de la URL que aparece después de #. Esta pantalla usa
   #producto=ID para abrir un producto sin crear una ruta nueva.
   hashchange es un evento del navegador que se dispara cuando cambia ese fragmento.
   leerHash interpreta el ID y lo guarda en productoDetalleId. Después, find busca
   el objeto completo dentro del array productos.

9. BÚSQUEDA Y FILTROS
   productosFiltrados parte de los productos activos y aplica la categoría elegida.
   productosEncontrados busca por nombre y se usa para las sugerencias rápidas.
   filter devuelve un array nuevo con los elementos que cumplen una condición.
   find devuelve el primer elemento que coincide.
   includes comprueba si un texto contiene otro texto.
   useMemo evita repetir estos cálculos mientras sus datos de entrada no cambien.

10. CARRITO
    agregarCarrito agrega una unidad al array.
    agregarDesdeDetalle agrega tantas copias del producto como indique cantidad y,
    si se eligió un talle, agrega esa propiedad a cada unidad.
    quitarCarrito usa filter y el índice para eliminar una sola unidad, incluso si
    hay varias unidades del mismo producto.
    El carrito vive en el estado de Tienda y se pasa al componente Carrito mediante
    props. En este archivo no se está persistiendo el carrito en Firestore.

11. OPERACIONES ADMINISTRATIVAS
    agregarProducto, modificarProducto y eliminarProducto delegan las escrituras
    en las funciones importadas desde firestore.js. Antes verifican puedeAdministrar.
    Las funciones de banners hacen lo mismo con crearHero, actualizarHero y eliminarHero.
    guardarProductosActuales crea/actualiza la copia predeterminada con el catálogo
    actual. restaurarProductosGuardados reemplaza el catálogo por esa copia.
    Ambas operaciones usan confirmaciones, try/catch/finally y el estado
    restaurandoTienda para evitar acciones repetidas y comunicar errores.

12. RENDERIZADO FINAL
    Si mostrandoDetalle es false, se dibuja el catálogo, el banner, las categorías,
    las tarjetas y, si corresponde, el administrador.
    Si mostrandoDetalle es true, se dibuja DetalleProducto.
    Header y Footer permanecen en ambas vistas.
    BotonAdmin solo aparece si el usuario tiene permiso y no está en la vista detalle.
    Carrito se monta al final del componente y recibe el estado y las funciones para
    abrirlo, cerrarlo, quitar unidades o vaciarlo.

OPERADORES Y EXPRESIONES IMPORTANTES
------------------------------------
- === compara igualdad estricta: compara valor y tipo sin convertirlos.
- !== significa "distinto de".
- && significa AND lógico: ambas condiciones deben ser verdaderas.
- || significa OR lógico: alcanza con que una condición sea verdadera.
- ! niega una condición booleana.
- ?. accede a una propiedad o método solo si el valor anterior no es null ni undefined.
- ?? usa el valor de la derecha solamente cuando el de la izquierda es null o undefined.
- ... copia o expande elementos de un array/objeto (spread).
- => crea una función flecha.
- async permite usar await dentro de una función.
- await espera el resultado de una operación asíncrona antes de continuar.
- return entrega un resultado o termina la función.
- map transforma cada elemento de un array en otro resultado.
- filter conserva solamente los elementos que cumplen una condición.
- find busca y devuelve el primer elemento coincidente.
- some devuelve true si al menos un elemento cumple la condición.
- trim elimina espacios al principio y al final de un texto.
- toLocaleLowerCase("es") convierte texto a minúsculas usando reglas del español.

IMPORTANTE
----------
Los comentarios explican el código; no cambian su ejecución. Se conserva el código
original debajo de esta guía para que puedas consultarlo y compararlo sin que se
haya modificado su comportamiento.
================================================================================
*/


import { useEffect, useMemo, useState } from "react";

import Header from '../components/header';
import Footer from "../components/Footer";
import TarjetaProducto from "../components/tiendaComponentes/TarjetaProducto";
import ControlesTienda from "../components/tiendaComponentes/ControlesTienda";
import CategoriasTienda from "../components/tiendaComponentes/CategoriasTienda";
import AdministrarProductos from "../components/tiendaComponentes/AdministrarProductos";
import Carrito from "../components/tiendaComponentes/Carrito";
import BotonAdmin from '../components/botonAdmin';
import { useAuth } from "../context/AuthContext";
import { tienePermiso } from "../utils/permisos";
import DetalleProducto from "../components/tiendaComponentes/DetalleProducto";
import useGuardados from "../hooks/useGuardados";

import {
    productosIniciales,
    normalizarCategoriaProducto
} from "../data/productos";
import {
    crearProducto,
    actualizarProducto,
    eliminarProducto as eliminarProductoFirebase,
    escucharProductos,
    crearHero,
    actualizarHero,
    eliminarHero,
    escucharHeroes,
    inicializarTiendaSiVacia,
    guardarProductosPredeterminadosActuales,
    restaurarProductosPredeterminados
} from "../services/firestore"

import "../styles/tienda.css";

// ÍNDICE GENERAL
// 1. Banners predeterminados y conversión de imágenes
// 2. Carrusel público de la tienda
// 3. Administración de banners
// 4. Recuperación de datos locales para la migración inicial
// 5. Sesión, permisos y estado global de la tienda
// 6. Sincronización de productos y banners con Firestore
// 7. Producto seleccionado desde la URL
// 8. Filtros, búsqueda, detalle y carrito
// 9. Administración de productos y restauración del catálogo

// 1. BANNERS PREDETERMINADOS
// Este array funciona como catálogo inicial del carrusel. Se utiliza solamente cuando
// Firestore todavía no tiene banners o durante una migración desde una versión local.
// Una vez que existen documentos remotos, la interfaz usa esos documentos y no modifica
// estos valores. Cada objeto describe el texto visible, la imagen y, opcionalmente, el
// producto que debe abrirse al pulsar su botón.
const slidesBanner = [
    {
        subtitulo: "NUEVA COLECCIÓN",
        titulo: "EDICIÓN ABEJA",
        descripcion: "Descubrí prendas inspiradas en el mundo de Minecraft.",
        boton: "VER PRODUCTOS",
        imagen: "/fondos/banner-coleccion-abeja.png"
    },
    {
        subtitulo: "ESTILO Y AVENTURA",
        titulo: "COLECCIÓN OSCURA",
        descripcion: "Explorá la nueva colección inspirada en Minecraft.",
        boton: "VER PRODUCTOS",
        imagen: "/fondos/banner-coleccion-oscura.png"
    },
    {
        subtitulo: "NUEVO LANZAMIENTO",
        titulo: "COLECCIÓN DIAMANTE",
        descripcion: "Prendas con detalles inspirados en los bloques del juego.",
        boton: "COMPRAR AHORA",
        imagen: "/fondos/banner-coleccion-diamante.png"
    }
];

// CONVERTIR IMAGEN EN URL: el formulario de administración necesita una URL absoluta
// para mostrar una previsualización coherente. new URL resuelve una ruta relativa con
// respecto al origen actual (protocolo, dominio y puerto). Si no hay imagen devuelve
// una cadena vacía; de ese modo el atributo src no recibe el texto "undefined".
function imagenComoUrl(imagen) {
    return imagen ? new URL(imagen, window.location.origin).href : "";
}

function BannerTienda({ irProductos, abrirProducto, slidesBanner, productos }) {
    // 2. CARRUSEL PÚBLICO
    // Recibe los banners ya disponibles y tres acciones del componente Tienda. irProductos
    // desplaza al catálogo; abrirProducto cambia el hash de la URL para abrir un detalle;
    // productos permite comprobar si el producto referido por un banner aún existe.
    //
    // slidesCarrusel agrega dos copias: la última al inicio y la primera al final. El
    // usuario ve esas copias durante una transición, y después el estado salta sin
    // animación al banner real equivalente. Así parece que el carrusel es infinito sin
    // requerir duplicar documentos en Firestore.
    const [slideActual, setSlideActual] = useState(1);
    const [transicionActiva, setTransicionActiva] = useState(true);
    const slidesCarrusel = [
        slidesBanner[slidesBanner.length - 1],
        ...slidesBanner,
        slidesBanner[0]
    ];

    // El intervalo avanza cada cinco segundos. La limpieza evita que un temporizador
    // continúe intentando actualizar estado si el carrusel ya fue desmontado.
    useEffect(() => {
        const interval = setInterval(() => {
            setSlideActual((prev) => prev + 1);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Después de un salto técnico se desactiva transicionActiva. Dos animation frames
    // permiten que el navegador aplique primero la posición nueva y recién después
    // reactive la transición CSS; sin esta espera se podría animar el salto visible.
    useEffect(() => {
        if (transicionActiva) {
            return undefined;
        }

        const frame = requestAnimationFrame(() => {
            requestAnimationFrame(() => setTransicionActiva(true));
        });

        return () => cancelAnimationFrame(frame);
    }, [transicionActiva]);

    // Al llegar a una copia extrema espera la duración visual de la transición y se
    // recoloca en el banner real. La condición evita crear temporizadores cuando el
    // índice está dentro del rango normal.
    useEffect(() => {
        if (slideActual !== 0 && slideActual !== slidesBanner.length + 1) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            setTransicionActiva(false);
            setSlideActual(slideActual === 0 ? slidesBanner.length : 1);
        }, 1600);

        return () => clearTimeout(timeout);
    }, [slideActual, slidesBanner.length]);

    // moverSlide recibe -1 o 1. Math.max/Math.min mantiene el índice dentro del intervalo
    // que incluye ambas copias, por eso un clic rápido no puede producir un índice inválido.
    function moverSlide(direccion) {
        setSlideActual((actual) =>
            Math.min(slidesBanner.length + 1, Math.max(0, actual + direccion))
        );
    }

    // finalizarTransicion trata el mismo borde como respaldo del temporizador anterior.
    // event.target === event.currentTarget distingue la transición de la pista de las
    // transiciones que puedan emitir sus elementos hijos.
    function finalizarTransicion(event) {
        if (event.target !== event.currentTarget) {
            return;
        }

        if (slideActual === 0 || slideActual === slidesBanner.length + 1) {
            setTransicionActiva(false);
            setSlideActual(slideActual === 0 ? slidesBanner.length : 1);
        }
    }

    return (
        <section className="banner">
            <button
                className="carrusel-flecha flecha-izq"
                onClick={() => moverSlide(-1)}
                type="button"
                aria-label="Ver banner anterior"
            >
                &#10094;
            </button>

            <div
                className={`banner-pista ${transicionActiva ? "" : "sin-transicion"}`}
                style={{
                    "--cantidad-slides": slidesCarrusel.length,
                    transform: `translateX(-${(slideActual / slidesCarrusel.length) * 100}%)`
                }}
                onTransitionEnd={finalizarTransicion}
            >
                {slidesCarrusel.map((slide, indice) => (
                    <div className="banner-contenido" key={`${slide.titulo}-${indice}`}>
                        <div className="banner-text">
                            <small>{slide.subtitulo}</small>
                            <h1>{slide.titulo}</h1>
                            <p>{slide.descripcion}</p>
                            <button
                                className="banner-btn"
                                onClick={() => {
                                    const destino = productos.find(
                                        (producto) =>
                                            String(producto.id) === String(slide.productoId)
                                    );

                                    if (destino) {
                                        abrirProducto(destino.id);
                                    } else {
                                        irProductos();
                                    }
                                }}
                                type="button"
                            >
                                {slide.boton}
                            </button>
                        </div>

                        <div className="banner-imagen-container">
                            <img
                                src={slide.imagen}
                                alt={slide.titulo}
                                className="banner-img"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="carrusel-flecha flecha-der"
                onClick={() => moverSlide(1)}
                type="button"
                aria-label="Ver banner siguiente"
            >
                &#10095;
            </button>

            <div className="franja-verde-pixel">
                <div className="pixeles-decoracion">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </section>
    );
}

function AdministrarBanners({
    banners,
    agregarBanner,
    modificarBanner,
    eliminarBanner,
    productos
}) {
    // Estructura inicial compartida por el formulario de creación y edición.
    const formularioInicial = {
        subtitulo: "",
        titulo: "",
        descripcion: "",
        boton: "",
        imagen: "",
        productoId: ""
    };

    const [form, setForm] = useState(formularioInicial);
    const [bannerEditando, setBannerEditando] = useState(null);
    const [busquedaProducto, setBusquedaProducto] = useState("");
    const [guardando, setGuardando] = useState(false);

    // Productos que coinciden con el texto ingresado para elegir destino del banner.
    const productosCoincidentes = productos.filter((producto) =>
        (producto.nombre || "")
            .toLocaleLowerCase("es")
            .includes(busquedaProducto.trim().toLocaleLowerCase("es"))
    );

    const productoSeleccionado = productos.find(
        (producto) => String(producto.id) === String(form.productoId)
    );

    // Actualiza el dato cuyo atributo name coincide con la clave del formulario.
    function cambiarCampo(event) {
        const { name, value } = event.target;
        setForm((actual) => ({ ...actual, [name]: value }));
    }

    async function guardarBanner(event) {
        event.preventDefault();
        setGuardando(true);

        try {
            // Persiste el producto asociado con un identificador de tipo texto.
            const datos = {
                ...form,
                productoId: form.productoId ? String(form.productoId) : ""
            };

            if (bannerEditando === null) {
                await agregarBanner(datos);
                window.alert("Hero agregado correctamente.");
            } else {
                await modificarBanner(bannerEditando, datos);
                window.alert("Hero modificado correctamente.");
            }

            setForm(formularioInicial);
            setBannerEditando(null);
            setBusquedaProducto("");
        } catch (error) {
            console.error("Error al guardar Hero:", error);
            window.alert(error.message || "No se pudo guardar el Hero.");
        } finally {
            setGuardando(false);
        }
    }

    function editarBanner(banner) {
        // Recupera el nombre del producto elegido para completar el buscador al editar.
        const destino = productos.find(
            (producto) => String(producto.id) === String(banner.productoId)
        );

        setForm({
            ...formularioInicial,
            ...banner,
            imagen: imagenComoUrl(banner.imagen)
        });
        setBannerEditando(banner.id);
        setBusquedaProducto(destino?.nombre ?? "");
    }

    async function borrarBanner(banner) {
        // La tienda debe conservar al menos un banner visible en la portada.
        if (banners.length <= 1) {
            window.alert("Debe quedar al menos un banner en la tienda.");
            return;
        }

        const confirmar = window.confirm(
            `¿Querés eliminar el banner "${banner.titulo}"? Esta acción no se puede deshacer.`
        );
        if (!confirmar) return;

        try {
            await eliminarBanner(banner.id);
            if (bannerEditando === banner.id) {
                setForm(formularioInicial);
                setBannerEditando(null);
                setBusquedaProducto("");
            }
        } catch (error) {
            console.error("Error al eliminar Hero:", error);
            window.alert(error.message || "No se pudo eliminar el Hero.");
        }
    }

    function cancelarEdicion() {
        setForm(formularioInicial);
        setBannerEditando(null);
        setBusquedaProducto("");
    }

    // La lista y el formulario se mantienen juntos para facilitar la edición de banners.
    return (
        <section className="admin-banners">
            <h2>Administrar banners</h2>
            <p>Agregá o modificá las imágenes y los textos del carrusel.</p>

            {/* Resumen de los banners guardados y botones para editar o quitar cada uno. */}
            <div className="admin-banners-lista">
                {banners.map((banner) => (
                    <article className="admin-banner-tarjeta" key={banner.id}>
                        <img src={banner.imagen} alt={banner.titulo || "Banner de tienda"} />
                        <div className="admin-banner-textos">
                            <strong>{banner.titulo || "Sin título"}</strong>
                            <span>{banner.subtitulo}</span>
                            <p>{banner.descripcion}</p>
                            <small>Botón: {banner.boton}</small>
                            <small>
                                Destino: {productos.find(
                                    (producto) => String(producto.id) === String(banner.productoId)
                                )?.nombre || "Todos los productos"}
                            </small>
                        </div>
                        <div className="admin-banner-acciones">
                            <button type="button" onClick={() => editarBanner(banner)}>
                                Modificar
                            </button>
                            <button
                                className="eliminar-btn"
                                type="button"
                                onClick={() => borrarBanner(banner)}
                            >
                                Eliminar
                            </button>
                        </div>
                    </article>
                ))}
            </div>

            {/* Formulario controlado para crear un banner o guardar cambios del seleccionado. */}
            <form className="admin-banner-formulario" onSubmit={guardarBanner}>
                <h3>{bannerEditando === null ? "Agregar banner" : "Modificar banner"}</h3>
                <label>
                    Título
                    <input name="titulo" value={form.titulo} onChange={cambiarCampo} required />
                </label>
                <label>
                    Subtítulo
                    <input name="subtitulo" value={form.subtitulo} onChange={cambiarCampo} required />
                </label>
                <label>
                    Descripción
                    <textarea name="descripcion" value={form.descripcion} onChange={cambiarCampo} required />
                </label>
                <label>
                    Texto del botón
                    <input name="boton" value={form.boton} onChange={cambiarCampo} required />
                </label>
                <label className="admin-banner-campo-completo">
                    URL de la imagen
                    <input
                        name="imagen"
                        type="url"
                        value={form.imagen}
                        onChange={cambiarCampo}
                        placeholder="https://ejemplo.com/banner.jpg"
                        pattern="https?://.+"
                        required
                    />
                </label>
                <div className="admin-banner-producto admin-banner-campo-completo">
                    <label htmlFor="banner-buscar-producto">
                        Producto al que llevará el botón
                    </label>
                    <input
                        id="banner-buscar-producto"
                        type="search"
                        value={busquedaProducto}
                        onChange={(event) => {
                            setBusquedaProducto(event.target.value);
                            setForm((actual) => ({ ...actual, productoId: "" }));
                        }}
                        placeholder="Buscar producto por nombre"
                        aria-controls="banner-productos-coincidentes"
                    />
                    {productoSeleccionado && (
                        <p className="admin-banner-producto-seleccionado">
                            Seleccionado: {productoSeleccionado.nombre}
                        </p>
                    )}
                    {/* Opciones de producto para vincular el botón del banner con un destino. */}
                    {busquedaProducto.trim() && !productoSeleccionado && (
                        <div
                            className="admin-banner-producto-resultados"
                            id="banner-productos-coincidentes"
                            role="listbox"
                        >
                            {productosCoincidentes.length > 0 ? (
                                productosCoincidentes.map((producto) => (
                                    <button
                                        key={producto.id}
                                        type="button"
                                        role="option"
                                        aria-selected="false"
                                        onClick={() => {
                                            setForm((actual) => ({
                                                ...actual,
                                                productoId: String(producto.id)
                                            }));
                                            setBusquedaProducto(producto.nombre);
                                        }}
                                    >
                                        {producto.imagen && <img src={producto.imagen} alt="" />}
                                        <span>{producto.nombre}</span>
                                    </button>
                                ))
                            ) : (
                                <p>No se encontraron productos.</p>
                            )}
                        </div>
                    )}
                    {productoSeleccionado && (
                        <button
                            className="admin-banner-producto-quitar"
                            type="button"
                            onClick={() => {
                                setForm((actual) => ({ ...actual, productoId: "" }));
                                setBusquedaProducto("");
                            }}
                        >
                            Quitar producto seleccionado
                        </button>
                    )}
                </div>
                {/* La vista previa permite revisar la URL antes de guardar el banner. */}
                {form.imagen && (
                    <img className="admin-banner-vista-previa" src={form.imagen} alt="Vista previa del banner" />
                )}
                <div className="admin-banner-form-acciones">
                    <button className="agregar-producto-btn" type="submit" disabled={guardando}>
                        {guardando ? "Guardando..." : bannerEditando === null ? "Agregar banner" : "Guardar cambios"}
                    </button>
                    {bannerEditando !== null && (
                        <button type="button" onClick={cancelarEdicion} disabled={guardando}>
                            Cancelar
                        </button>
                    )}
                </div>
            </form>
        </section>
    );
}

// 4. LEER PRODUCTOS LOCALES PARA LA MIGRACIÓN
// Antes de usar Firestore, una versión anterior guardaba el catálogo en localStorage.
// Esta función intenta recuperar ese respaldo y devolverlo como datos iniciales. JSON
// puede fallar si el navegador conserva un texto inválido: catch registra el problema y
// deja que la función continúe con un array vacío. Si no hay respaldo, usa los productos
// predeterminados importados. El caso especial de la remera conserva la compatibilidad
// con guardados antiguos que no tenían campos de imagen.
function cargarProductos() {

    const guardados =
        localStorage.getItem(
            "productosTienda"
        );


    if (guardados) {

        let productosGuardados = [];
        try {
            productosGuardados = JSON.parse(guardados);
        } catch (error) {
            console.error("No se pudieron leer los productos locales:", error);
        }

        const remeraInicial = productosIniciales.find(
            (producto) => String(producto.id) === "1"
        );

        // Completa la imagen histórica de la remera cuando un guardado antiguo no la tenía.
        return productosGuardados.map((producto) => {
            if (
                remeraInicial
                && String(producto.id) === String(remeraInicial.id)
                && !Array.isArray(producto.imagenes)
                && !producto.imagen
            ) {
                return {
                    ...producto,
                    imagen: remeraInicial.imagen,
                    imagenes: remeraInicial.imagenes
                };
            }

            return producto;
        });

    }


    return productosIniciales;
}

// LEER BANNERS LOCALES: aplica el mismo principio a los banners y agrega solo los
// predeterminados que no existan todavía. La marca bannersTiendaDefaultsRestaurados
// impide repetir esta fusión en futuras cargas. Esta función no se ejecuta en cada
// renderizado: se entrega a la inicialización de Firestore cuando corresponde.
function cargarBanners() {
    const guardados = localStorage.getItem("bannersTienda");
    const migracionRealizada = localStorage.getItem("bannersTiendaDefaultsRestaurados");

    if (!guardados) {
        localStorage.setItem("bannersTiendaDefaultsRestaurados", "true");
        return slidesBanner;
    }

    let bannersGuardados = [];
    try {
        bannersGuardados = JSON.parse(guardados);
    } catch (error) {
        console.error("No se pudieron leer los banners locales:", error);
    }

    if (migracionRealizada === "true") {
        return bannersGuardados;
    }

    const bannersCompletos = [...bannersGuardados];

    slidesBanner.forEach((bannerPredeterminado) => {
        const yaExiste = bannersCompletos.some(
            (banner) => banner.imagen === bannerPredeterminado.imagen
        );

        if (!yaExiste) {
            bannersCompletos.push(bannerPredeterminado);
        }
    });

    localStorage.setItem("bannersTienda", JSON.stringify(bannersCompletos));
    localStorage.setItem("bannersTiendaDefaultsRestaurados", "true");
    return bannersCompletos;
}

export default function Tienda() {
    // 5. COMPONENTE PRINCIPAL Y ESTADO COMPARTIDO
    // Tienda reúne catálogo, filtros, detalle y carrito para que todos trabajen sobre
    // el mismo conjunto de productos. perfil decide el acceso administrativo; los
    // elementos guardados son una preferencia personal y no cambian el catálogo global.
    const { perfil } = useAuth();
    const puedeAdministrar = tienePermiso(perfil, "tienda");
    const guardadosProductos = useGuardados("producto");

    const [productos, setProductos] = useState([]);
    const [banners, setBanners] = useState([]);
    const [restaurandoTienda, setRestaurandoTienda] = useState(false);

    const [administradorAbierto, setAdministradorAbierto] =
        useState(false);

    useEffect(() => {
        if (!puedeAdministrar) setAdministradorAbierto(false);
    }, [puedeAdministrar]);

    const modoAdmin = administradorAbierto && puedeAdministrar;

    // productos y banners comienzan vacíos hasta que las suscripciones respondan.
    // restaurandoTienda bloquea acciones repetidas durante una restauración. El modo
    // administrador exige dos condiciones: que la persona lo haya abierto y que aún
    // posea permiso. carrito guarda cantidades elegidas; búsqueda/categoría construyen
    // la vista derivada del catálogo; productoDetalleId conecta el hash con el modal.
    const [carrito, setCarrito] =
        useState([]);


    const [busqueda, setBusqueda] =
        useState("");


    const [categoriaActiva, setCategoriaActiva] =
        useState("Todas");


    const [carritoAbierto, setCarritoAbierto] =
        useState(false);


    const [productoDetalleId, setProductoDetalleId] =
        useState(null);


    // 6. SINCRONIZACIÓN CON FIRESTORE
    // escucharProductos y escucharHeroes notifican cada cambio remoto y entregan sus
    // canceladores. Solo un administrador intenta inicializar una base vacía: así una
    // visita pública jamás crea datos. Al salir o cambiar el permiso, la limpieza cancela
    // ambas escuchas. Los posibles errores se registran para no ocultar el fallo de red.
    useEffect(() => {
        const cancelarProductos = escucharProductos(
            setProductos,
            (error) => console.error("Error al escuchar productos:", error)
        );
        const cancelarHeroes = escucharHeroes(
            setBanners,
            (error) => console.error("Error al escuchar banners:", error)
        );

        if (puedeAdministrar) {
            inicializarTiendaSiVacia(cargarProductos(), cargarBanners()).catch((error) => {
                console.error("Error al inicializar la tienda en Firestore:", error);
            });
        }

        return () => {
            cancelarProductos();
            cancelarHeroes();
        };
    }, [puedeAdministrar]);


    // 7. PRODUCTO SOLICITADO EN LA URL
    // El hash #producto=<id> permite abrir y compartir un detalle sin añadir otra ruta.
    // leerHash se ejecuta una vez y ante cada hashchange. Si el hash no coincide, deja
    // productoDetalleId en null. La limpieza elimina el listener global al desmontar.

    useEffect(() => {

        function leerHash() {

            const hash =
                window.location.hash;


            if (
                hash.startsWith(
                    "#producto="
                )
            ) {

                const id = hash.slice("#producto=".length).trim();
                setProductoDetalleId(id || null);

            } else {

                setProductoDetalleId(null);

            }

        }


        leerHash();


        window.addEventListener(
            "hashchange",
            leerHash
        );


        return () => {

            window.removeEventListener(
                "hashchange",
                leerHash
            );

        };

    }, []);


    // productoDetalle busca el objeto completo para pasar al componente de detalle.
    // String normaliza IDs numéricos y de texto; || null representa que no se encontró.
    const productoDetalle =
        productos.find(
            (producto) =>
                String(producto.id) === String(productoDetalleId)
        ) || null;


    // 8. FILTRAR, BUSCAR Y MOSTRAR PRODUCTOS
    // useMemo calcula la grilla solo cuando cambian sus datos de entrada. Primero excluye
    // productos inactivos. Luego aplica la categoría y el texto de búsqueda según las
    // condiciones siguientes. Cada filter produce un array nuevo, de manera que productos
    // sigue siendo la copia fiel recibida desde Firestore.
    const productosFiltrados =
        useMemo(() => {

            let resultado = productos.filter(
                (producto) => producto.estado !== "inactivo"
            );


            if (
                categoriaActiva !==
                "Todas"
            ) {

                resultado =
                    resultado.filter(
                        (producto) =>
                            normalizarCategoriaProducto(producto.categoria) ===
                            categoriaActiva
                    );

            }


            return resultado;

        }, [
            productos,
            categoriaActiva
        ]);

    // Resultados rápidos del buscador, independientes del filtro de categoría activo.
    const productosEncontrados =
        useMemo(() => {
            const texto = busqueda.trim().toLocaleLowerCase("es");

            if (!texto) {
                return [];
            }

            return productos.filter((producto) =>
                producto.estado !== "inactivo" &&
                (producto.nombre || "")
                    .toLocaleLowerCase("es")
                    .includes(texto)
            );
        }, [productos, busqueda]);


    /*
    ==========================================
    ABRIR PRODUCTO
    ==========================================
    */

    // Cambia el hash y lleva la página arriba al abrir un producto.
    function abrirProducto(id) {
        const idProducto = String(id);

        window.location.hash = `producto=${idProducto}`;
        setProductoDetalleId(idProducto);


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function abrirPelucheCreeper() {
        const peluche = productos.find((producto) =>
            /peluche.*creeper|creeper.*peluche/i.test(producto.nombre || "")
        );

        if (peluche) {
            abrirProducto(peluche.id);
        } else {
            irProductos();
        }
    }


    /*
    ==========================================
    VOLVER A PRODUCTOS
    ==========================================
    */

    // Limpia la URL del detalle y desplaza de vuelta al inicio del catálogo.
    function volverProductos() {

        window.location.hash = "";
        setProductoDetalleId(null);


        setTimeout(() => {

            document
                .getElementById("productos")
                ?.scrollIntoView({
                    behavior: "smooth"
                });

        }, 50);

    }


    /*
    ==========================================
    AGREGAR AL CARRITO
    ==========================================
    */

    // Agrega una unidad desde una tarjeta y confirma la acción a la persona usuaria.
    function agregarCarrito(producto) {

        setCarrito(
            (actual) => [
                ...actual,
                producto
            ]
        );


         alert(
            `${producto.nombre} fue agregado al carrito.`
         );

    }


    /*
    ==========================================
    AGREGAR DESDE DETALLE
    ==========================================
    */

    // Agrega la cantidad elegida en el detalle y abre el carrito para revisarla.
    function agregarDesdeDetalle(
        producto,
        cantidad,
        talle
    ) {

        setCarrito(
            (actual) => [

                ...actual,

                ...Array.from(
                    {
                        length: cantidad
                    },
                        () => ({
                            ...producto,
                            ...(talle ? { talle } : {})
                        })
                    )

            ]
        );


        alert(
            `${producto.nombre} fue agregado al carrito.`
        );


        setCarritoAbierto(true);

    }


    /*
    ==========================================
    QUITAR DEL CARRITO
    ==========================================
    */

    // El índice permite quitar una unidad específica aunque haya productos repetidos.
    function quitarCarrito(index) {

        setCarrito(
            (actual) =>
                actual.filter(
                    (_, i) =>
                        i !== index
                )
        );

    }


    // ==========================================
    // PRODUCTOS: OPERACIONES EN FIRESTORE
    // ==========================================

    // Operaciones de productos en Firestore; cada escritura vuelve a verificar permisos.
    async function agregarProducto(nuevoProducto) {
        if (!puedeAdministrar) return;
        return crearProducto(nuevoProducto);
    }

    async function modificarProducto(id, datosActualizados) {
        if (!puedeAdministrar) return;
        return actualizarProducto(id, datosActualizados);
    }

    async function eliminarProducto(id) {
        if (!puedeAdministrar) return;

        const confirmar = window.confirm("¿Querés eliminar este producto?");
        if (!confirmar) return;

        try {
            await eliminarProductoFirebase(id);
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            window.alert(error.message || "No se pudo eliminar el producto.");
        }
    }

    // ==========================================
    // HERO: OPERACIONES EN FIRESTORE
    // ==========================================

    // Operaciones equivalentes para los banners del carrusel.
    async function agregarBanner(datos) {
        if (!puedeAdministrar) return;
        return crearHero(datos);
    }

    async function modificarBanner(id, datos) {
        if (!puedeAdministrar) return;
        return actualizarHero(id, datos);
    }

    async function borrarBanner(id) {
        if (!puedeAdministrar) return;
        return eliminarHero(id);
    }

    async function guardarProductosActuales() {
        if (!puedeAdministrar || restaurandoTienda) return;
        const confirmar = window.confirm(
            "Se reemplazará la copia predeterminada guardada por los productos que están actualmente en la tienda. ¿Continuar?"
        );
        if (!confirmar) return;

        setRestaurandoTienda(true);
        try {
            await guardarProductosPredeterminadosActuales();
            window.alert("Se guardaron los productos actuales como copia predeterminada.");
        } catch (error) {
            console.error("Error al guardar la copia de productos:", error);
            window.alert(error.message || "No se pudo guardar la copia de productos.");
        } finally {
            setRestaurandoTienda(false);
        }
    }

    async function restaurarProductosGuardados() {
        if (!puedeAdministrar || restaurandoTienda) return;
        const confirmar = window.confirm(
            "El catálogo actual será reemplazado por los productos de la copia guardada. Los cambios posteriores a esa copia se perderán. ¿Continuar?"
        );
        if (!confirmar) return;

        setRestaurandoTienda(true);
        try {
            await restaurarProductosPredeterminados();
            window.alert("Se restauró el catálogo desde la copia guardada.");
        } catch (error) {
            console.error("Error al restaurar la copia de productos:", error);
            window.alert(error.message || "No se pudo restaurar la copia de productos.");
        } finally {
            setRestaurandoTienda(false);
        }
    }


    /*
    ==========================================
    IR A PRODUCTOS
    ==========================================
    */

    // Desplazamiento reutilizado por las acciones del banner y la promoción.
    function irProductos() {

        document
            .getElementById("productos")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }


    /*
    ==========================================
    SI ESTAMOS EN DETALLE
    ==========================================
    */

    // Alterna entre el catálogo y el detalle según el producto que resolvió el hash.
    const mostrandoDetalle =
        Boolean(productoDetalle);


    return (

        <div className="tienda">

            <Header />


            {/* La búsqueda y el acceso al carrito solo aparecen en la vista del catálogo. */}
            {!mostrandoDetalle ? (

                <main className="tienda-main">


                    {/* =========================
                        CONTROLES FIJOS
                    ========================== */}

                    {/* Buscador rápido, resultados coincidentes y acceso al carrito. */}
                    <ControlesTienda
                        busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        productosEncontrados={productosEncontrados}
                        abrirProducto={abrirProducto}
                        abrirCarrito={() =>
                            setCarritoAbierto(true)
                        }
                        cantidadCarrito={
                            carrito.length
                        }
                    />


                    {/* =========================
                        BANNER
                    ========================== */}
                    {/* Prioriza los banners de Firestore y usa los iniciales mientras cargan. */}
                    <BannerTienda
                        key={banners.length}
                        irProductos={irProductos}
                        abrirProducto={abrirProducto}
                        slidesBanner={banners.length > 0 ? banners : slidesBanner}
                        productos={productos}
                    />

                    {/* =========================
                        TITULO
                    ========================== */}

                    <div className="tienda-catalogo">
                        <div
                            className="titulo-productos"
                            id="productos"
                        >
                            TODOS LOS PRODUCTOS
                        </div>


                    {/* =========================
                        CATEGORIAS
                    ========================== */}

                        {/* El valor interno filtra; el texto mostrado puede ser distinto. */}
                        <CategoriasTienda
                            categoriaActiva={
                                categoriaActiva
                            }
                            setCategoriaActiva={
                                setCategoriaActiva
                            }
                        />


                    {/* =========================
                        PRODUCTOS
                    ========================== */}

                        {/* Grilla de productos filtrados o aviso cuando no hay coincidencias. */}
                        <section className="productos">

                        {productosFiltrados.length === 0 ? (

                            <div className="sin-productos">

                                <h2>
                                    No se encontraron productos
                                </h2>

                                <p>
                                    Probá con otra búsqueda.
                                </p>

                            </div>

                        ) : (

                            productosFiltrados.map(
                                (producto) => (

                                    <TarjetaProducto
                                        key={producto.id}
                                        producto={producto}
                                        guardado={guardadosProductos.estaGuardado(producto.id)}
                                        alAlternarGuardado={() => guardadosProductos.alternar(producto.id)}
                                        abrirProducto={
                                            abrirProducto
                                        }
                                        agregarCarrito={
                                            agregarCarrito
                                        }
                                    />

                                )
                            )

                        )}

                        </section>

                        <section
                            className="tienda-promo"
                            aria-label="Promoción del peluche Creeper"
                        >
                            <button
                                className="tienda-promo__imagen-link"
                                type="button"
                                aria-label="Ver el producto Peluche Creeper"
                                onClick={abrirPelucheCreeper}
                            />
                            <div className="tienda-promo__contenido">
                                <h2>Peluche Creeper</h2>
                                <p>Un compañero para cada ocasión</p>
                                <button
                                    className="tienda-promo__boton"
                                    type="button"
                                    onClick={abrirPelucheCreeper}
                                >
                                    Ver peluche
                                </button>
                            </div>
                        </section>


                    {/* =========================
                        ADMINISTRADOR
                    ========================== */}

                        {/* Herramientas disponibles solo cuando la cuenta tiene permiso. */}
                        {modoAdmin && (
                            <div className="tienda-administrador">
                                <div className="acciones-productos-predeterminados">
                                    <button
                                        className="restaurar-tienda-btn"
                                        type="button"
                                        onClick={guardarProductosActuales}
                                        disabled={restaurandoTienda}
                                    >
                                        {restaurandoTienda
                                            ? "PROCESANDO..."
                                            : "GUARDAR PRODUCTOS ACTUALES"}
                                    </button>
                                    <button
                                        className="restaurar-tienda-btn restaurar-tienda-btn-secundario"
                                        type="button"
                                        onClick={restaurarProductosGuardados}
                                        disabled={restaurandoTienda}
                                    >
                                        RESTAURAR COPIA GUARDADA
                                    </button>
                                </div>
                                <AdministrarProductos
                                    productos={productos}
                                    agregarProducto={agregarProducto}
                                    modificarProducto={modificarProducto}
                                    eliminarProducto={eliminarProducto}
                                />
                                <AdministrarBanners
                                    banners={banners}
                                    agregarBanner={agregarBanner}
                                    modificarBanner={modificarBanner}
                                    eliminarBanner={borrarBanner}
                                    productos={productos}
                                />
                            </div>
                        )}

                    </div>

                </main>

            ) : (

                <main className="tienda-main tienda-main-detalle">

                    {/* El detalle comparte catálogo y acciones con la vista principal. */}
                    <DetalleProducto
                        producto={productoDetalle}
                        productos={productos}
                        carrito={carrito}
                        guardado={guardadosProductos.estaGuardado(productoDetalle?.id)}
                        alAlternarGuardado={() => guardadosProductos.alternar(productoDetalle?.id)}
                        volverProductos={
                            volverProductos
                        }
                        agregarDesdeDetalle={
                            agregarDesdeDetalle
                        }
                        abrirProducto={
                            abrirProducto
                        }
                    />

                </main>

            )}

            <Footer />

            {!mostrandoDetalle && puedeAdministrar && (
                <BotonAdmin
                    permiso="tienda"
                    activo={modoAdmin}
                    alAlternar={() => setAdministradorAbierto((abierto) => !abierto)}
                    aviso="Los cambios se guardan en Firebase."
                />
            )}

            {/* =========================
                CARRITO
            ========================== */}

         {/* Panel del carrito y su flujo de pago, montados fuera del catálogo. */}
         <Carrito
             abierto={carritoAbierto}
             cerrarCarrito={() => setCarritoAbierto(false)}
             carrito={carrito}
             quitarCarrito={quitarCarrito}
             vaciarCarrito={() => setCarrito([])}
         />

        </div>

    );
    

}
