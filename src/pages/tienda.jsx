import Header from '../components/header';
export default function Tienda() {
  return (
    <>
    <Header />
    {/* Banner Promocional */}
  <section className="bg-primary text-white text-center py-5 shadow-sm">
    <div className="container">
      <h1 className="display-5 fw-bold">Ofertas de la Semana</h1>
      <p className="lead">Descuentos de hasta el 40% en artículos seleccionados con envío gratis.</p>
      <a href="#productos" className="btn btn-light btn-lg fw-semibold mt-2">Ver Catálogo</a>
    </div>
  </section>

  {/* Catálogo de Productos */}
  <main className="flex-grow-1 py-5" id="productos">
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold mb-0">Productos Destacados</h2>
        <span className="text-muted">Mostrando 4 de 12 productos</span>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">

        {/* Producto 1 */}
        <div className="col">
          <div className="card h-100 border-0 shadow-sm rounded-3">
            <span className="badge bg-danger position-absolute top-0 end-0 m-3">-20%</span>
            <img src="https://via.placeholder.com/300x200" className="card-img-top rounded-top-3" alt="Producto 1"/>
            <div className="card-body d-flex flex-column">
              <span className="text-muted small mb-1">Tecnología</span>
              <h5 className="card-title h6 fw-bold">Auriculares Inalámbricos</h5>
              <div className="mt-auto pt-2">
                <div className="d-flex align-items-center mb-2">
                  <span className="h5 fw-bold mb-0 me-2">$39.99</span>
                  <span className="text-decoration-line-through text-muted small">$49.99</span>
                </div>
                <button className="btn btn-outline-primary w-100 btn-sm"><i className="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

        {/* Producto 2 */}
        <div className="col">
          <div className="card h-100 border-0 shadow-sm rounded-3">
            <img src="https://via.placeholder.com/300x200" className="card-img-top rounded-top-3" alt="Producto 2"/>
            <div className="card-body d-flex flex-column">
              <span className="text-muted small mb-1">Calzado</span>
              <h5 className="card-title h6 fw-bold">Zapatillas Deportivas</h5>
              <div className="mt-auto pt-2">
                <div className="mb-2">
                  <span className="h5 fw-bold mb-0">$75.00</span>
                </div>
                <button className="btn btn-outline-primary w-100 btn-sm"><i className="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

        {/* Producto 3 */}
        <div className="col">
          <div className="card h-100 border-0 shadow-sm rounded-3">
            <span className="badge bg-success position-absolute top-0 end-0 m-3">Nuevo</span>
            <img src="https://via.placeholder.com/300x200" className="card-img-top rounded-top-3" alt="Producto 3"/>
            <div className="card-body d-flex flex-column">
              <span className="text-muted small mb-1">Accesorios</span>
              <h5 className="card-title h6 fw-bold">Reloj Inteligente Fit</h5>
              <div className="mt-auto pt-2">
                <div className="mb-2">
                  <span className="h5 fw-bold mb-0">$120.00</span>
                </div>
                <button className="btn btn-outline-primary w-100 btn-sm"><i className="bi bi-cart-plus me-1"></i> Añadir</button>
              </div>
            </div>
          </div>
        </div>

        {/* Producto 4 */}
        <div className="col">
          <div className="card h-100 border-0 shadow-sm rounded-3">
            <img src="https://via.placeholder.com/300x200" className="card-img-top rounded-top-3" alt="Producto 4"/>
            <div className="card-body d-flex flex-column">
              <span className="text-muted small mb-1">Hogar</span>
              <h5 className="card-title h6 fw-bold">Mochila Impermeable</h5>
              <div className="mt-auto pt-2">
                <div className="mb-2">
                  <span className="h5 fw-bold mb-0">$29.90</span>
                </div>
                <button className="btn btn-outline-primary w-100 btn-sm"><i className="bi bi-cart-plus me-1"></i> Añadir</button>
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