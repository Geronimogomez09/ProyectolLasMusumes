export default function signup() {
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
                <h2 className="fw-bold mt-2">Crear Cuenta</h2>
                <p className="text-muted small">Ingresa tus datos para registrarte</p>
              </div>

              <form>
                {/* Nombre y Apellidos (Organizado en grid) */}
                <div className="row g-2 mb-3">
                  <div className="col-sm-6">
                    <label for="nombre" className="form-label">Nombre</label>
                    <input type="text" className="form-control" id="nombre" placeholder="Juan" required/>
                  </div>
                  <div className="col-sm-6">
                    <label for="apellido" className="form-label">Apellido</label>
                    <input type="text" className="form-control" id="apellido" placeholder="Pérez" required/>
                  </div>
                </div>

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

                {/* Confirmar Contraseña */}
                <div className="mb-3">
                  <label for="confirmPassword" className="form-label">Confirmar Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><i className="bi bi-check-circle"></i></span>
                    <input type="password" className="form-control" id="confirmPassword" placeholder="Repite tu contraseña" required/>
                  </div>
                </div>

                {/* Términos y Condiciones */}
                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" value="" id="terminos" required/>
                  <label className="form-check-label small" for="terminos">
                    Acepto los <a href="#" className="text-decoration-none">Términos y Condiciones</a> y la <a href="#" className="text-decoration-none">Política de Privacidad</a>.
                  </label>
                </div>

                {/* Botón de Registro */}
                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">Registrarse</button>
              </form>

              <hr className="my-4 text-muted"/>

              {/* Enlace a Iniciar Sesión */}
              <div className="text-center">
                <span className="small text-muted">¿Ya tienes una cuenta? </span>
                <a href="/login" className="small text-decoration-none fw-bold">Iniciar Sesión</a>
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