export const productosIniciales = [
    {
        id: 1,
        nombre: "Remera Creeper",
        categoria: "Ropa",
        precio: 20000,
        stock: 10,
        estado: "activo",
        imagen: "/fondos/banner-coleccion-abeja.png",
        imagenes: [
            "/fondos/banner-coleccion-abeja.png",
            "/fondos/banner-coleccion-diamante.png",
            "/fondos/banner-coleccion-oscura.png"
        ],
        descripcion: "Remera de algodón con diseño Creeper."
    },
    {
        id: 2,
        nombre: "Taza Pixel",
        categoria: "Tazas",
        precio: 12000,
        stock: 5,
        estado: "activo",
        imagen: "",
        imagenes: [],
        descripcion: "Taza de cerámica con diseño pixel art."
    },
    {
        id: 3,
        nombre: "Figura Steve",
        categoria: "Figuras",
        precio: 22000,
        stock: 4,
        estado: "activo",
        imagen: "",
        imagenes: [],
        descripcion: "Figura coleccionable."
    },
    {
        id: 4,
        nombre: "Juego de Sábanas",
        categoria: "Sábanas",
        precio: 45000,
        stock: 6,
        estado: "activo",
        imagen: "",
        imagenes: [],
        descripcion: "Juego de sábanas con diseño especial."
    }
];

export const categorias = [
    ["Todas", "Todos"],
    ["Ropa", "Ropa"],
    ["Tazas", "Tazas"],
    ["Sábanas", "Sábanas"],
    ["Figuras", "Figuras"],
    ["Accesorios", "Accesorios"],
    ["Decoración", "Decoración"],
    ["Otros", "Otros"]
];