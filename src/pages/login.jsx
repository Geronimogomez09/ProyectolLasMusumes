export default function Login() {
  return (
    <>
<main className="flex-grow-1 d-flex align-items-center py-5">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6 col-xl-5">

          {/* Tarjeta del Formulario */}
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-4 p-sm-5">
              
              <div className="text-center mb-4">
                <i className="bi bi-person-plus-fill text-primary display-4"></i>
                <h2 className="fw-bold mt-2">iniciar Sesion</h2>
                <p className="text-muted small">Ingresa tus datos para iniciar sesion</p>
              </div>

              <form>
                {/* Correo Electrónico con icono */}
                <div className="mb-3">
                  <label for="email" className="form-label">Correo Electrónico</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                    <input type="email" className="form-control" id="email" placeholder="ejemplo@correo.com" required/>
                  </div>
                </div>

                {/* Contraseña con icono */}
                <div className="mb-3">
                  <label for="password" className="form-label">Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-lock"></i></span>
                    <input type="password" className="form-control" id="password" placeholder="Mínimo 8 caracteres" required/>
                  </div>
                </div>

                {/* Botón de Iniciar Sesión */}
                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">Iniciar Sesión</button>
              </form>

              <hr className="my-4 text-muted"/>

              {/* Enlace a Iniciar Sesión */}
              <div className="text-center">
                <span className="small text-muted">¿No tienes una cuenta? </span>
                <a href="/registro" className="small text-decoration-none fw-bold">Crear Cuenta</a>
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