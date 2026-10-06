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
    eliminarProducto
}) {

    const [form, setForm] = useState({
        nombre: "",
        categoria: "",
        precio: "",
        stock: "",
        imagen: "",
        descripcion: ""
    });


    function cambiarCampo(e) {

        const { id, value } = e.target;

        setForm({
            ...form,
            [id]: value
        });

    }


    function enviarFormulario(e) {

        e.preventDefault();


        const nuevoProducto = {

            id: Date.now(),

            nombre: form.nombre,

            categoria: form.categoria,

            precio: Number(form.precio),

            stock: Number(form.stock),

            imagen: form.imagen,

            descripcion: form.descripcion

        };


        agregarProducto(nuevoProducto);


        setForm({
            nombre: "",
            categoria: "",
            precio: "",
            stock: "",
            imagen: "",
            descripcion: ""
        });


        alert(
            "Producto agregado correctamente."
        );

    }


    return (

        <section
            className="admin"
            id="administrar"
        >

            <h2>
                Agregar producto
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

                    <label htmlFor="imagen">
                        Imagen
                    </label>

                    <input
                        id="imagen"
                        type="text"
                        placeholder="Ej: img/remera.jpg"
                        value={form.imagen}
                        onChange={cambiarCampo}
                    />

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
                    + AGREGAR PRODUCTO
                </button>

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


                            <button
                                className="eliminar-btn"
                                onClick={() =>
                                    eliminarProducto(producto.id)
                                }
                            >
                                ELIMINAR
                            </button>

                        </div>

                    ))

                )}

            </div>

        </section>

    );
}