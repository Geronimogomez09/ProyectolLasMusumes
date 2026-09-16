import Header from '../components/header';
export default function Tienda() {
  return (
    <>
    <Header />
    {/* Banner Promocional */}
  <section class="bg-primary text-white text-center py-5 shadow-sm">
    <div class="container">
      <h1 class="display-5 fw-bold">Ofertas de la Semana</h1>
      <p class="lead">Descuentos de hasta el 40% en artículos seleccionados con envío gratis.</p>
      <a href="#productos" class="btn btn-light btn-lg fw-semibold mt-2">Ver Catálogo</a>
    </div>
  </section>

  {/* Catálogo de Productos */}
  <main class="flex-grow-1 py-5" id="productos">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="h3 fw-bold mb-0">Productos Destacados</h2>
        <span class="text-muted">Mostrando 4 de 12 productos</span>
      </div>

      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">

        {/* Producto 1 */}
        <div class="col">
          <div class="card h-100 border-0 shadow-sm rounded-3">
            <span class="badge bg-danger position-absolute top-0 end-0 m-3">-20%</span>
            <img src="https://via.placeholder.com/300x200" class="card-img-top rounded-top-3" alt="Producto 1"/>
            <div class="card-body d-flex flex-column">
              <span class="text-muted small mb-1">Tecnología</span>
              <h5 class="card-title h6 fw-bold">Auriculares Inalámbricos</h5>
              <div class="mt-auto pt-2">
                <div class="d-flex align-items-center mb-2">
                  <span class="h5 fw-bold mb-0 me-2">$39.99</span>
                  <span class="text-decoration-line-through text-muted small">$49.99</span>
                </div>
                <button class="btn btn-outline-primary w-100 btn-sm"><i class="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

        {/* Producto 2 */}
        <div class="col">
          <div class="card h-100 border-0 shadow-sm rounded-3">
            <img src="https://via.placeholder.com/300x200" class="card-img-top rounded-top-3" alt="Producto 2"/>
            <div class="card-body d-flex flex-column">
              <span class="text-muted small mb-1">Calzado</span>
              <h5 class="card-title h6 fw-bold">Zapatillas Deportivas</h5>
              <div class="mt-auto pt-2">
                <div class="mb-2">
                  <span class="h5 fw-bold mb-0">$75.00</span>
                </div>
                <button class="btn btn-outline-primary w-100 btn-sm"><i class="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

        {/* Producto 3 */}
        <div class="col">
          <div class="card h-100 border-0 shadow-sm rounded-3">
            <span class="badge bg-success position-absolute top-0 end-0 m-3">Nuevo</span>
            <img src="https://via.placeholder.com/300x200" class="card-img-top rounded-top-3" alt="Producto 3"/>
            <div class="card-body d-flex flex-column">
              <span class="text-muted small mb-1">Accesorios</span>
              <h5 class="card-title h6 fw-bold">Reloj Inteligente Fit</h5>
              <div class="mt-auto pt-2">
                <div class="mb-2">
                  <span class="h5 fw-bold mb-0">$120.00</span>
                </div>
                <button class="btn btn-outline-primary w-100 btn-sm"><i class="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

        {/* Producto 4 */}
        <div class="col">
          <div class="card h-100 border-0 shadow-sm rounded-3">
            <img src="https://via.placeholder.com/300x200" class="card-img-top rounded-top-3" alt="Producto 4"/>
            <div class="card-body d-flex flex-column">
              <span class="text-muted small mb-1">Hogar</span>
              <h5 class="card-title h6 fw-bold">Mochila Impermeable</h5>
              <div class="mt-auto pt-2">
                <div class="mb-2">
                  <span class="h5 fw-bold mb-0">$29.90</span>
                </div>
                <button class="btn btn-outline-primary w-100 btn-sm"><i class="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
    </>
  )
}