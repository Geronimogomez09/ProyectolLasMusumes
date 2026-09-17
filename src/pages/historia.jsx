import Header from '../components/header';
export default function Historia() {
  return (
    <>
      <Header />
    
    <div className="container my-5">
      <div className="jumbotron bg-light p-5 rounded-lg">
        <h1 className="display-4">Bienvenido a WikiCraft</h1>
        <p className="lead">Tu punto de inicio para explorar todo sobre Minecraft</p>
        <hr className="my-4" />
        <p>Guías, noticias, recursos y mucho más.</p>
        <a className="btn btn-primary btn-lg" href="#" role="button">
          Comenzar
        </a>
      </div>

      <div className="row mt-5">
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Historia</h5>
              <p className="card-text">Conoce la evolución de Minecraft</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Comunidad</h5>
              <p className="card-text">Conecta con otros jugadores</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Tienda</h5>
              <p className="card-text">Compra merchandising exclusivo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}