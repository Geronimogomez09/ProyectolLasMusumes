// PRODUCTOS DE MUESTRA: datos de respaldo para migrar o restaurar la tienda.
//
// ÍNDICE
// - Talles y stock: crea, normaliza y suma existencias por talle.
// - Productos y categorías: contenido inicial y nombres válidos para mostrar o filtrar.

// ----------------- Talles y stock -----------------
// Las funciones reciben las cantidades existentes y devuelven un stock compatible por talle.
export const TALLES_ROPA = ["S", "M", "L", "XL", "XXL"];

export function crearStockPorTalle(stockInicial = 0) {
    return Object.fromEntries(TALLES_ROPA.map((talle) => [talle, stockInicial]));
}

export function normalizarTallesRopa(talles, stockAnterior = 0) {
    if (!talles || typeof talles !== "object" || Array.isArray(talles)) {
        return {
            ...crearStockPorTalle(),
            M: Number(stockAnterior) || 0
        };
    }

    return Object.fromEntries(
        TALLES_ROPA.map((talle) => [talle, Number(talles[talle] ?? 0)])
    );
}

export function totalStockPorTalle(talles) {
    return TALLES_ROPA.reduce((total, talle) => total + Number(talles[talle] || 0), 0);
}

// ----------------- Productos iniciales -----------------
// Registros de ejemplo que se usan cuando se carga o restaura el catálogo.
export const productosIniciales = [
    {
        id: 1,
        nombre: "Remera Creeper",
        categoria: "Ropa",
        precio: 20000,
        stock: 10,
        talles: { S: 2, M: 2, L: 2, XL: 2, XXL: 2 },
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
        categoria: "Objetos",
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
        categoria: "Dormitorio",
        precio: 45000,
        stock: 6,
        estado: "activo",
        imagen: "",
        imagenes: [],
        descripcion: "Juego de sábanas con diseño especial."
    }
];

// ----------------- Categorías -----------------
// Cada par contiene [valor guardado y usado para filtrar, etiqueta visible].
export const categorias = [
    ["Todas", "Todos"],
    ["Ropa", "Ropa"],
    ["Objetos", "Objetos"],
    ["Dormitorio", "Dormitorio"],
    ["Figuras", "Figuras"],
    ["Accesorios", "Accesorios"],
    ["Decoración", "Decoración"],
    ["Otros", "Otros"]
];

// Acepta nombres antiguos de Firebase y devuelve la categoría actual equivalente.
export function normalizarCategoriaProducto(categoria) {
    const equivalencias = {
        Tazas: "Objetos",
        "Sábanas": "Dormitorio"
    };

    return equivalencias[categoria] || categoria;
}