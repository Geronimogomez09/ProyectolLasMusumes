import ImagenAcceso from "./ImagenAcceso";

// DECORACION ACCESO: fondo decorativo con bloques, flores, animales y partículas
// inspirado en los biomas de Minecraft.
// PARA QUÉ SE USA: login.jsx lo pone detrás de la tarjeta de login y registro.
// QUÉ MUESTRA: imágenes flotantes que no se pueden tocar (aria-hidden). No recibe props.
function DecoracionAcceso() {
  return (
    <div className="acceso-decoracion" aria-hidden="true">

      {/* BLOQUES: tres imágenes grandes en los costados. */}
      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-uno">
        <ImagenAcceso nombre="wildflowers.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-dos">
        <ImagenAcceso nombre="BeePixel.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-recurso--bloque acceso-recurso--bloque-tres">
        <ImagenAcceso nombre="MoobloomPixel.png" className="acceso-recurso-imagen" />
      </span>

      {/* FLORES: vegetación que complementa el fondo. */}
      <span className="acceso-recurso acceso-flor acceso-flor--uno">
        <ImagenAcceso nombre="wildflowers.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-flor acceso-flor--dos">
        <ImagenAcceso nombre="pink_petals.png" className="acceso-recurso-imagen" />
      </span>

      <span className="acceso-recurso acceso-flor acceso-flor--tres">
        <ImagenAcceso nombre="sunflower.png" className="acceso-recurso-imagen" />
      </span>

      {/* ANIMALES: personajes del mundo de Minecraft. */}
      <span className="acceso-animal acceso-animal--zorro">
        <ImagenAcceso nombre="FoxPixel.png" className="acceso-animal-img" />
      </span>

      <span className="acceso-animal acceso-animal--abeja">
        <ImagenAcceso nombre="BeePixel.png" className="acceso-animal-img" />
      </span>

      <span className="acceso-animal acceso-animal--rana">
        <ImagenAcceso nombre="BeePixel.png" className="acceso-animal-img" />
      </span>

      <span className="acceso-animal acceso-animal--moobloom">
        <ImagenAcceso nombre="MoobloomPixel.png" className="acceso-animal-img" />
      </span>

      {/* PARTÍCULAS: pequeños cuadrados de luz. */}
      <span className="acceso-particula acceso-particula--uno" />
      <span className="acceso-particula acceso-particula--dos" />
      <span className="acceso-particula acceso-particula--tres" />
    </div>
  );
}

export default DecoracionAcceso;