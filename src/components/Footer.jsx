export default function Footer() {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>WikiCraft</h5>
            <p>Tu enciclopedia de Minecraft</p>
          </div>
          <div className="col-md-4">
            <h5>Contacto</h5>
            <p>Email: info@wikicraft.com</p>
            <p>Teléfono: +54 299 4123456</p>
          </div>
          <div className="col-md-4">
            <h5>Enlaces</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-white text-decoration-none">Términos</a></li>
              <li><a href="#" className="text-white text-decoration-none">Privacidad</a></li>
              <li><a href="#" className="text-white text-decoration-none">Contacto</a></li>
            </ul>
          </div>
        </div>
        <hr className="bg-white" />
        <p className="text-center mb-0">&copy; 2024 WikiCraft. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}