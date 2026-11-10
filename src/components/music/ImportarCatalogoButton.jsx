import React, { useState } from "react";
import { importarCatalogoMusical } from "../../services/ImportarCatalogoMusical";

// Índice: Importar catálogo musical.
// ----------------- Importar catálogo musical -----------------
// No recibe propiedades. Solicita confirmaci?n, inicia la importación del catálogo y muestra el estado y el resumen del resultado.

function ImportarCatalogoButton() {
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const importar = async () => {
    const confirmar = window.confirm(
      "¿Querés importar el catálogo musical inicial a Firestore? Los documentos existentes no se sobrescribirán."
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      setMensaje("");

      const resultados = await importarCatalogoMusical();

      const resumen = resultados
        .map(
          (resultado) =>
            `${resultado.coleccion}: ${resultado.importados} importados, ${resultado.omitidos} omitidos`
        )
        .join(" | ");

      setMensaje(`Importación finalizada. ${resumen}`);
    } catch (error) {
      console.error("Error al importar el catálogo:", error);

      setMensaje(
        error.code === "permission-denied"
          ? "No tenés permisos para importar. Revisá tu rol de administrador en Firebase."
          : `Error al importar: ${error.message}`
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="maestro-secondary-button"
        onClick={importar}
        disabled={cargando}
      >
        <img
          src="/music/iconos/enderpearl.png"
          alt=""
          className="maestro-button-icon"
        />

        {cargando ? "Importando catálogo..." : "Importar catálogo a Firebase"}
      </button>

      {mensaje && (
        <p role="status" className="maestro-message">
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default ImportarCatalogoButton;