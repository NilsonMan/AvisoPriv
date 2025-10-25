// PDFViewerHighQuality.jsx
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Configura el worker de PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PDFViewer({ pdfUrl = process.env.PUBLIC_URL + "/aviso_privacidad.pdf" }) {
  const containerRef = useRef(null);
  const [pdf, setPdf] = useState(null);

  // Cargar PDF
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const loaded = await loadingTask.promise;
        if (cancelled) return;
        setPdf(loaded);
      } catch (err) {
        console.error("Error loading PDF:", err);
      }
    })();
    return () => (cancelled = true);
  }, [pdfUrl]);

  // Renderizar páginas
  useEffect(() => {
    if (!pdf) return;

    const container = containerRef.current;
    container.innerHTML = ""; // limpiar contenido previo

    const renderPages = async () => {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Calculamos la escala según el ancho del contenedor y la resolución original de la página
        const viewportOriginal = page.getViewport({ scale: 1 });
        const containerWidth = container.clientWidth - 24; // margen
        const scale = containerWidth / viewportOriginal.width;

        const viewport = page.getViewport({ scale: Math.max(scale, 2) }); // al menos 2x para alta calidad

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.display = "block";
        canvas.style.margin = "12px auto";
        canvas.style.boxShadow = "0 2px 10px rgba(0,0,0,0.08)";
        canvas.style.borderRadius = "6px";
        canvas.style.background = "#fff";
        canvas.style.maxWidth = "100%"; // responsivo

        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    };

    renderPages();
  }, [pdf]);

  return (
    <div
      style={{
        height: "100vh",
        overflowY: "auto",
        background: "#f2f4f7",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <div ref={containerRef} />
    </div>
  );
}
