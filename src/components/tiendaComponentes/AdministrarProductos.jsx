import { useState } from "react";

const categoriasAdmin = [
    "Ropa",
    "Tazas",
    "Sábanas",
    "Figuras",
    "Accesorios",
    "Decoración",
    "Otros"
];

const formularioInicial = {
    nombre: "",
    categoria: "",
    precio: "",
    stock: "",
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
    const [form, setForm] = useState(formularioInicial);
    const [productoEditandoId, setProductoEditandoId] = useState(null);
    const [guardando, setGuardando] = useState(false);

    function cambiarCampo(event) {
        const { id, value } = event.target;
        setForm((actual) => ({ ...actual, [id]: value }));
    }

    async function enviarFormulario(event) {
        event.preventDefault();
        setGuardando(true);

        const imagenes = form.imagenes
            .map((imagen) => imagen.trim())
            .filter(Boolean);

        const datosProducto = {
            nombre: form.nombre.trim(),
            categoria: form.categoria,
            precio: Number(form.precio),
            stock: Number(form.stock),
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

            setForm(formularioInicial);
            setProductoEditandoId(null);
        } catch (error) {
            console.error("Error al guardar producto:", error);
            window.alert(error.message || "No se pudo guardar el producto.");
        } finally {
            setGuardando(false);
        }
    }

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
            categoria: producto.categoria || "",
            precio: String(producto.precio ?? ""),
            stock: String(producto.stock ?? ""),
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

    function cancelarEdicion() {
        setForm(formularioInicial);
        setProductoEditandoId(null);
    }

    function cambiarImagen(indice, value) {
        setForm((actual) => ({
            ...actual,
            imagenes: actual.imagenes.map((imagen, posicion) =>
                posicion === indice ? value : imagen
            )
        }));
    }

    return (
        <section className="admin" id="administrar">
            <h2>
                {productoEditandoId === null ? "Agregar producto" : "Modificar producto"}
            </h2>

            <p>
                Completá los datos del producto y automáticamente aparecerá en la tienda.
            </p>

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
                                    {producto.categoria}
                                    {" - "}
                                    ${Number(producto.precio).toLocaleString("es-AR")}
                                    {" - "}
                                    Stock: {producto.stock}
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
