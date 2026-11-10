import { useState } from "react";
import {
    categorias,
    crearStockPorTalle,
    normalizarCategoriaProducto,
    normalizarTallesRopa,
    TALLES_ROPA,
    totalStockPorTalle
} from "../../data/productos";

// Índice: Administraci?n de productos.
// ----------------- Administraci?n de productos -----------------
// Recibe el catálogo y las acciones para agregar, editar o eliminar productos. Valida y normaliza los campos del formulario antes de enviar los cambios al componente padre.

// Categorías disponibles en el selector del panel administrativo.
const categoriasAdmin = categorias
    .filter(([valor]) => valor !== "Todas")
    .map(([valor]) => valor);

// Estado vacío que se usa al crear un producto o limpiar el formulario.
const formularioInicial = {
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
    talles: crearStockPorTalle(),
    estado: "activo",
    imagenes: ["", "", "", ""],
    descripcion: ""
};

export default function AdministrarProductos({
    productos,
    agregarProducto,
    modificarProducto,
    eliminarProducto
}) {
    // Guarda los campos, el producto en edición y el estado de la operación asíncrona.
    const [form, setForm] = useState(formularioInicial);
    const [productoEditandoId, setProductoEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // Los identificadores de los controles coinciden con las propiedades del producto.
    function cambiarCampo(event) {
        const { id, value } = event.target;
        setForm((actual) => ({
            ...actual,
            [id]: value,
            ...(id === "categoria" && value === "Ropa" && actual.categoria !== "Ropa"
                ? {
                    talles: totalStockPorTalle(actual.talles) > 0
                        ? actual.talles
                        : normalizarTallesRopa(null, actual.stock)
                }
                : {})
        }));
    }

    async function enviarFormulario(event) {
        event.preventDefault();
        setGuardando(true);

        // Descarta espacios y campos vacíos antes de enviar las imágenes a Firestore.
        const imagenes = form.imagenes
            .map((imagen) => imagen.trim())
            .filter(Boolean);

        // Normaliza los campos numéricos y usa la primera imagen como portada.
        const datosProducto = {
            nombre: form.nombre.trim(),
            categoria: normalizarCategoriaProducto(form.categoria),
            precio: Number(form.precio),
            stock: form.categoria === "Ropa"
                ? totalStockPorTalle(form.talles)
                : Number(form.stock),
            ...(form.categoria === "Ropa" ? { talles: form.talles } : {}),
            estado: form.estado,
            imagen: imagenes[0] || "",
            imagenes,
            descripcion: form.descripcion.trim()
        };

        try {
            if (productoEditandoId === null) {
                await agregarProducto(datosProducto);
                window.alert("Producto agregado correctamente.");
            } else {
                await modificarProducto(productoEditandoId, datosProducto);
                window.alert("Producto modificado correctamente.");
            }

            setForm({ ...formularioInicial, talles: crearStockPorTalle() });
            setProductoEditandoId(null);
        } catch (error) {
            console.error("Error al guardar producto:", error);
            window.alert(error.message || "No se pudo guardar el producto.");
        } finally {
            setGuardando(false);
        }
    }

    // Carga un producto existente y adapta sus imágenes al formato de cuatro campos.
    function editarProducto(producto) {
        const imagenesGuardadas = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
            ? producto.imagenes
            : producto.imagen
                ? [producto.imagen]
                : [];

        const imagenes = Array.from({ length: 4 }, (_, indice) =>
            imagenesGuardadas[indice]
                ? new URL(imagenesGuardadas[indice], window.location.origin).href
                : ""
        );

        setForm({
            nombre: producto.nombre || "",
            categoria: normalizarCategoriaProducto(producto.categoria || ""),
            precio: String(producto.precio ?? ""),
            stock: String(producto.stock ?? ""),
            talles: normalizarTallesRopa(producto.talles, producto.stock),
            estado: producto.estado || "activo",
            imagenes,
            descripcion: producto.descripcion || ""
        });
        setProductoEditandoId(producto.id);
        document.getElementById("administrar")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    // Abandona la edición sin guardar y vuelve al formulario vacío.
    function cancelarEdicion() {
        setForm({ ...formularioInicial, talles: crearStockPorTalle() });
        setProductoEditandoId(null);
    }

    function cambiarTalle(talle, valor) {
        setForm((actual) => {
            const talles = {
                ...actual.talles,
                [talle]: valor === "" ? "" : Number(valor)
            };

            return {
                ...actual,
                talles,
                stock: String(totalStockPorTalle(talles))
            };
        });
    }

    // Actualiza solo la URL de imagen seleccionada dentro de la lista del formulario.
    function cambiarImagen(indice, value) {
        setForm((actual) => ({
            ...actual,
            imagenes: actual.imagenes.map((imagen, posicion) =>
                posicion === indice ? value : imagen
            )
        }));
    }

    return (
        // Formulario de alta/edición, previsualizaciones y listado de productos administrables.
        <section className="admin" id="administrar">
            <h2>
                {productoEditandoId === null ? "Agregar producto" : "Modificar producto"}
            </h2>

            <p>
                Completá los datos del producto y automáticamente aparecerá en la tienda.
            </p>

            {/* Los valores están controlados por React para reflejar cada cambio al instante. */}
            <form className="formulario" onSubmit={enviarFormulario}>
                <div className="campo">
                    <label htmlFor="nombre">Nombre del producto</label>
                    <input
                        id="nombre"
                        type="text"
                        placeholder="Ej: Remera Creeper"
                        value={form.nombre}
                        onChange={cambiarCampo}
                        maxLength={100}
                        required
                    />
                </div>

                <div className="campo">
                    <label htmlFor="categoria">Categoría</label>
                    <select
                        id="categoria"
                        value={form.categoria}
                        onChange={cambiarCampo}
                        required
                    >
                        <option value="">Seleccionar categoría</option>
                        {categoriasAdmin.map((categoria) => (
                            <option key={categoria} value={categoria}>
                                {categoria}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="campo">
                    <label htmlFor="precio">Precio</label>
                    <input
                        id="precio"
                        type="number"
                        placeholder="Ej: 20000"
                        min="0.01"
                        step="0.01"
                        value={form.precio}
                        onChange={cambiarCampo}
                        required
                    />
                </div>

                <div className="campo">
                    {form.categoria === "Ropa" ? (
                        <>
                            <span className="campo-label">Stock por talle</span>
                            <div className="admin-talles-stock">
                                {TALLES_ROPA.map((talle) => (
                                    <label className="admin-talle-campo" key={talle}>
                                        <span>Talle {talle}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={form.talles[talle]}
                                            onChange={(evento) => cambiarTalle(talle, evento.target.value)}
                                            aria-label={`Unidades disponibles del talle ${talle}`}
                                            required
                                        />
                                    </label>
                                ))}
                            </div>
                            <small>
                                Stock total: {totalStockPorTalle(form.talles)}
                            </small>
                        </>
                    ) : (
                        <>
                            <label htmlFor="stock">Stock</label>
                            <input
                                id="stock"
                                type="number"
                                placeholder="Ej: 10"
                                min="0"
                                step="1"
                                value={form.stock}
                                onChange={cambiarCampo}
                                required
                            />
                        </>
                    )}
                </div>

                <div className="campo">
                    <label htmlFor="estado">Estado del producto</label>
                    <select id="estado" value={form.estado} onChange={cambiarCampo} required>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>

                <div className="campo campo-completo">
                    <span className="campo-label">Imágenes del producto</span>
                    {/* Ofrece una imagen principal y tres adicionales con vista previa inmediata. */}
                    {/* Previsualiza cada URL antes de guardar el producto. */}
                    <div className="admin-imagenes-grid">
                        {form.imagenes.map((imagen, indice) => (
                            <label className="admin-imagen-campo" key={indice}>
                                <span>
                                    {indice === 0 ? "Imagen principal" : `Imagen adicional ${indice}`}
                                </span>
                                <input
                                    type="url"
                                    placeholder="https://ejemplo.com/imagen.jpg"
                                    value={imagen}
                                    onChange={(evento) => cambiarImagen(indice, evento.target.value)}
                                    pattern="https?://.+"
                                    aria-label={indice === 0
                                        ? "URL de la imagen principal"
                                        : `URL de la imagen adicional ${indice}`}
                                />
                                <span className="admin-imagen-vista">
                                    {imagen.trim()
                                        ? <img src={imagen.trim()} alt={`Vista previa ${indice + 1}`} />
                                        : "Vista previa"}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="campo campo-completo">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        placeholder="Descripción del producto..."
                        value={form.descripcion}
                        onChange={cambiarCampo}
                        maxLength={2000}
                    />
                </div>

                <button type="submit" className="agregar-producto-btn" disabled={guardando}>
                    {guardando
                        ? "GUARDANDO..."
                        : productoEditandoId === null
                            ? "+ AGREGAR PRODUCTO"
                            : "GUARDAR CAMBIOS"}
                </button>

                {productoEditandoId !== null && (
                    <button
                        type="button"
                        className="cancelar-edicion-producto-btn"
                        onClick={cancelarEdicion}
                        disabled={guardando}
                    >
                        CANCELAR
                    </button>
                )}
            </form>

            {/* Listado compacto que permite modificar o eliminar cada registro. */}
            {/* Lista de registros actuales para editar o eliminar desde el panel. */}
            <div className="lista-admin">
                <h3>Productos cargados</h3>

                {productos.length === 0 ? (
                    <p>No hay productos.</p>
                ) : (
                    productos.map((producto) => (
                        <div className="admin-producto" key={producto.id}>
                            <div className="admin-producto-info">
                                <strong>{producto.nombre}</strong>
                                <small>
                                    {normalizarCategoriaProducto(producto.categoria)}
                                    {" - "}
                                    ${Number(producto.precio).toLocaleString("es-AR")}
                                    {" - "}
                                    Stock: {producto.stock}
                                    {normalizarCategoriaProducto(producto.categoria) === "Ropa" &&
                                        producto.talles && (
                                            <>
                                                {" - "}
                                                {TALLES_ROPA.map((talle) =>
                                                    `${talle}: ${producto.talles[talle] ?? 0}`
                                                ).join(" · ")}
                                            </>
                                        )}
                                    {" - Estado: "}
                                    {producto.estado || "activo"}
                                </small>
                            </div>

                            <div className="admin-producto-acciones">
                                <button
                                    type="button"
                                    className="modificar-producto-btn"
                                    onClick={() => editarProducto(producto)}
                                >
                                    MODIFICAR
                                </button>
                                <button
                                    type="button"
                                    className="eliminar-btn"
                                    onClick={() => eliminarProducto(producto.id)}
                                >
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
