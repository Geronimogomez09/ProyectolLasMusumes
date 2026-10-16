import { useState } from 'react';
import '../../styles/agregar-version.css';

const EDICIONES = ['Java', 'Bedrock'];

// Misma ruta que usás en los datos de ejemplo; cambiala por tu imagen real.
const IMAGEN_POR_DEFECTO = '../public/fondos/fondo2.png';

const FORM_VACIO = {
  numero: '',
  nombre: '',
  edicion: ['Java', 'Bedrock'],
  fecha: '',
  descripcion: '',
  nuevasFunciones: '',
  correcciones: '',
  cambios: '',
  nuevosBloques: '',
  nuevasCriaturas: '',
  nuevosBiomas: '',
  destacada: false,
};

// "a, b, c" -> ['a', 'b', 'c'] (descarta vacíos)
function aLista(texto) {
  return texto
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

// "2026-06-16" -> "16 de junio de 2026".
// Se arma con T00:00:00 para que se interprete en hora local; sin eso,
// en Argentina (UTC-3) la fecha se corre un día para atrás.
function formatearFecha(fechaISO) {
  return new Date(`${fechaISO}T00:00:00`).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function AgregarVersion({ onAgregar }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);
  const [vistaPrevia, setVistaPrevia] = useState('');
  const [error, setError] = useState('');

  // Un solo handler para los inputs de texto, usa el atributo "name".
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function toggleEdicion(ed) {
    setForm((prev) => ({
      ...prev,
      edicion: prev.edicion.includes(ed)
        ? prev.edicion.filter((e) => e !== ed)
        : [...prev.edicion, ed],
    }));
  }

  function handleImagen(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      setError('El archivo seleccionado no es una imagen.');
      return;
    }
    setError('');
    setVistaPrevia(URL.createObjectURL(archivo));
  }

  function cerrar() {
    setForm(FORM_VACIO);
    setVistaPrevia('');
    setError('');
    setAbierto(false);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!form.numero.trim() || !form.nombre.trim() || !form.fecha || !form.descripcion.trim()) {
      setError('Número, nombre, fecha y descripción son obligatorios.');
      return;
    }
    if (form.edicion.length === 0) {
      setError('Elegí al menos una edición.');
      return;
    }

    // El id y el array de comentarios los completa Versiones.jsx.
    onAgregar({
      numero: form.numero.trim(),
      nombre: form.nombre.trim(),
      edicion: form.edicion,
      fecha: form.fecha,
      fechaLegible: formatearFecha(form.fecha),
      // Con backend: subir el archivo con FormData y guardar la URL devuelta.
      imagen: vistaPrevia || IMAGEN_POR_DEFECTO,
      descripcion: form.descripcion.trim(),
      nuevasFunciones: aLista(form.nuevasFunciones),
      correcciones: aLista(form.correcciones),
      cambios: aLista(form.cambios),
      nuevosBloques: aLista(form.nuevosBloques),
      nuevasCriaturas: aLista(form.nuevasCriaturas),
      nuevosBiomas: aLista(form.nuevosBiomas),
      destacada: form.destacada,
    });

    cerrar();
  }

  if (!abierto) {
    return (
      <div className="agregar-version-barra">
        <button className="agregar-version-abrir" onClick={() => setAbierto(true)}>
          + Agregar versión
        </button>
      </div>
    );
  }

  return (
    <form className="agregar-version-form" onSubmit={handleSubmit}>
      <h2>Nueva version</h2>

      <div className="agregar-version-fila">
        <label className="agregar-version-campo agregar-version-chico">
          Número *
          <input
            type="text"
            name="numero"
            placeholder="1.21.5"
            value={form.numero}
            onChange={handleChange}
          />
        </label>
        <label className="agregar-version-campo agregar-version-grande">
          Nombre *
          <input
            type="text"
            name="nombre"
            placeholder="Nombre de la actualización"
            value={form.nombre}
            onChange={handleChange}
          />
        </label>
        <label className="agregar-version-campo agregar-version-medio">
          Fecha de lanzamiento *
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} />
        </label>
      </div>

      <div className="agregar-version-campo">
        Edición *
        <div className="agregar-version-pills">
          {EDICIONES.map((ed) => (
            <button
              key={ed}
              type="button"
              className={`filtro-pill ${form.edicion.includes(ed) ? 'filtro-pill--activo' : ''}`}
              onClick={() => toggleEdicion(ed)}
            >
              {ed}
            </button>
          ))}
        </div>
      </div>

      <label className="agregar-version-campo">
        Descripción general *
        <textarea
          name="descripcion"
          rows="3"
          value={form.descripcion}
          onChange={handleChange}
        />
      </label>

      <label className="agregar-version-campo">
        Imagen
        <input type="file" accept="image/*" onChange={handleImagen} />
      </label>
      {vistaPrevia && (
        <img src={vistaPrevia} alt="Vista previa" className="agregar-version-preview" />
      )}

      <p className="agregar-version-ayuda">
        En los campos siguientes separá los elementos con comas.
      </p>

      <div className="agregar-version-fila">
        <label className="agregar-version-campo">
          Nuevas funciones
          <input type="text" name="nuevasFunciones" value={form.nuevasFunciones} onChange={handleChange} />
        </label>
        <label className="agregar-version-campo">
          Correcciones
          <input type="text" name="correcciones" value={form.correcciones} onChange={handleChange} />
        </label>
        <label className="agregar-version-campo">
          Cambios
          <input type="text" name="cambios" value={form.cambios} onChange={handleChange} />
        </label>
      </div>

      <div className="agregar-version-fila">
        <label className="agregar-version-campo">
          Nuevos bloques
          <input type="text" name="nuevosBloques" value={form.nuevosBloques} onChange={handleChange} />
        </label>
        <label className="agregar-version-campo">
          Nuevas criaturas
          <input type="text" name="nuevasCriaturas" value={form.nuevasCriaturas} onChange={handleChange} />
        </label>
        <label className="agregar-version-campo">
          Nuevos biomas
          <input type="text" name="nuevosBiomas" value={form.nuevosBiomas} onChange={handleChange} />
        </label>
      </div>

      <label className="agregar-version-check">
        <input
          type="checkbox"
          checked={form.destacada}
          onChange={(e) => setForm((prev) => ({ ...prev, destacada: e.target.checked }))}
        />
        Destacar visualmente (versión reciente)
      </label>

      {error && <p className="agregar-version-error">{error}</p>}

      <div className="agregar-version-acciones">
        <button type="button" className="agregar-version-cancelar" onClick={cerrar}>
          Cancelar
        </button>
        <button type="submit" className="agregar-version-guardar">
          Guardar versión
        </button>
      </div>
    </form>
  );
}

export default AgregarVersion;
