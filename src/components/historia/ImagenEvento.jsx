import { useEffect, useState } from 'react';

// Índice: Imagen de evento histórico.
// ----------------- Imagen de evento histórico -----------------
// Recibe la dirección y el texto alternativo de una imagen. Muestra el recurso del evento y ofrece una presentación alternativa si la imagen no puede mostrarse.

// IMAGEN EVENTO: muestra la imagen de un hito (traída de internet) en la tarjeta del hito y en
// la vista previa del formulario de administrador. Si la imagen falla o no existe, dibuja un
// bloque de respaldo con CSS para que el diseño no se rompa.
// Recibe: src, alt. Se usa en TarjetaEvento y ModalEvento.
function ImagenEvento({ src, alt }) {
    const [fallo, setFallo] = useState(false);

    // Cuando cambia la dirección de la imagen, vuelve a intentar cargarla.
    useEffect(() => {
        setFallo(false);
    }, [src]);

    if (!src || fallo) {
        return <span className="historia-media-vacia" role="img" aria-label="Imagen no disponible" />;
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFallo(true)}
        />
    );
}

export default ImagenEvento;