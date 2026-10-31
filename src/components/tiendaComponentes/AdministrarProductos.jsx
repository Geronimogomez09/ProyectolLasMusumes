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

export default function AdministrarProductos({
    productos,
    agregarProducto,
    modificarProducto,
    eliminarProducto
}) {

    const [form, setForm] = useState({
        nombre: "",
        categoria: "",
        precio: "",
        stock: "",
        imagenes: ["", "", "", ""],
        descripcion: ""
    });
    const [productoEditandoId, setProductoEditandoId] = useState(null);


    function cambiarCampo(e) {

        const { id, value } = e.target;

        setForm({
            ...form,
            [id]: value
        });

    }


    function enviarFormulario(e) {

        e.preventDefault();


        const imagenes = form.imagenes
            .map((imagen) => imagen.trim())
            .filter(Boolean);
        const datosProducto = {
            nombre: form.nombre,
            categoria: form.categoria,
            precio: Number(form.precio),
            stock: Number(form.stock),
            imagen: imagenes[0] || "",
            imagenes,
            descripcion: form.descripcion
        };

        if (productoEditandoId === null) {
            agregarProducto({
                id: Date.now(),
                ...datosProducto
            });
        } else {
            modificarProducto(productoEditandoId, datosProducto);
        }


        setForm({
            nombre: "",
            categoria: "",
            precio: "",
            stock: "",
            imagenes: ["", "", "", ""],
            descripcion: ""
        });
        setProductoEditandoId(null);


        alert(productoEditandoId === null
            ? "Producto agregado correctamente."
            : "Producto modificado correctamente.");

    }

    function editarProducto(producto) {
        const imagenesGuardadas = Array.isArray(producto.imagenes) && producto.imagenes.length > 0
            ? producto.imagenes
            : producto.imagen
                ? [producto.imagen]
                : [];
        const imagenes = Array.from({ length: 4 }, (_, indice) =>
            imagenesGuardadas[indice] || ""
        );

        setForm({
            nombre: producto.nombre || "",
            categoria: producto.categoria || "",
            precio: String(producto.precio ?? ""),
            stock: String(producto.stock ?? ""),
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
        setForm({
            nombre: "",
            categoria: "",
            precio: "",
            stock: "",
            imagenes: ["", "", "", ""],
            descripcion: ""
        });
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

        <section
            className="admin"
            id="administrar"
        >

            <h2>
                {productoEditandoId === null ? "Agregar producto" : "Modificar producto"}
            </h2>


            <p>
                Completá los datos del producto y
                automáticamente aparecerá en la tienda.
            </p>


            <form
                className="formulario"
                onSubmit={enviarFormulario}
            >

                <div className="campo">

                    <label htmlFor="nombre">
                        Nombre del producto
                    </label>

                    <input
                        id="nombre"
                        type="text"
                        placeholder="Ej: Remera Creeper"
                        value={form.nombre}
                        onChange={cambiarCampo}
                        required
                    />

                </div>


                <div className="campo">

                    <label htmlFor="categoria">
                        Categoría
                    </label>

                    <select
                        id="categoria"
                        value={form.categoria}
                        onChange={cambiarCampo}
                        required
                    >

                        <option value="">
                            Seleccionar categoría
                        </option>

                        {categoriasAdmin.map(
                            (categoria) => (

                                <option
                                    key={categoria}
                                    value={categoria}
                                >
                                    {categoria}
                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="campo">

                    <label htmlFor="precio">
                        Precio
                    </label>

                    <input
                        id="precio"
                        type="number"
                        placeholder="Ej: 20000"
                        min="0"
                        value={form.precio}
                        onChange={cambiarCampo}
                        required
                    />

                </div>


                <div className="campo">

                    <label htmlFor="stock">
                        Stock
                    </label>

                    <input
                        id="stock"
                        type="number"
                        placeholder="Ej: 10"
                        min="0"
                        value={form.stock}
                        onChange={cambiarCampo}
                        required
                    />

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
                                    type="text"
                                    placeholder="/img/remera-frente.jpg"
                                    value={imagen}
                                    onChange={(evento) => cambiarImagen(indice, evento.target.value)}
                                    aria-label={indice === 0
                                        ? "Ruta de la imagen principal"
                                        : `Ruta de la imagen adicional ${indice}`}
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

                    <label htmlFor="descripcion">
                        Descripción
                    </label>

                    <textarea
                        id="descripcion"
                        placeholder="Descripción del producto..."
                        value={form.descripcion}
                        onChange={cambiarCampo}
                    />

                </div>


                <button
                    type="submit"
                    className="agregar-producto-btn"
                >
                    {productoEditandoId === null ? "+ AGREGAR PRODUCTO" : "GUARDAR CAMBIOS"}
                </button>
                {productoEditandoId !== null && (
                    <button
                        type="button"
                        className="cancelar-edicion-producto-btn"
                        onClick={cancelarEdicion}
                    >
                        CANCELAR
                    </button>
                )}

            </form>


            <div className="lista-admin">

                <h3>
                    Productos cargados
                </h3>


                {productos.length === 0 ? (

                    <p>
                        No hay productos.
                    </p>

                ) : (

                    productos.map((producto) => (

                        <div
                            className="admin-producto"
                            key={producto.id}
                        >

                            <div className="admin-producto-info">

                                <strong>
                                    {producto.nombre}
                                </strong>

                                <small>
                                    {producto.categoria}
                                    {" - "}
                                    ${Number(producto.precio).toLocaleString("es-AR")}
                                    {" - "}
                                    Stock: {producto.stock}
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