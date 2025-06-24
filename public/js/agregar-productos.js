// js/agregar-productos.js
import { db } from "../firebase-config.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.getElementById("formCargaArchivo").addEventListener("submit", async (e) => {
  e.preventDefault();

  const archivoInput = document.getElementById("archivoProductos");
  const archivo = archivoInput.files[0];
  const mensaje = document.getElementById("mensajeCarga");
  const boton = e.target.querySelector("button");

  if (!archivo) {
    alert("Por favor seleccioná un archivo CSV.");
    return;
  }

  // Deshabilitar botón y mostrar mensaje de carga
  boton.disabled = true;
  mensaje.textContent = "⏳ Cargando productos...";
  mensaje.style.color = "blue";

  const lector = new FileReader();
  lector.onload = async function (event) {
    const contenido = event.target.result;
    const filas = contenido.split("\n").map(f => f.trim()).filter(f => f);
    const encabezados = filas[0].split(",");

    for (let i = 1; i < filas.length; i++) {
      const valores = filas[i].split(",");
      const producto = {};

      encabezados.forEach((clave, idx) => {
        producto[clave.trim()] = valores[idx]?.trim();
      });

      try {
        await addDoc(collection(db, "productos"), producto);
      } catch (error) {
        console.error("Error al guardar producto:", error);
        mensaje.textContent = "❌ Error al cargar productos.";
        mensaje.style.color = "red";
        boton.disabled = false;
        return;
      }
    }

    mensaje.textContent = "✅ Productos cargados correctamente.";
    mensaje.style.color = "green";
    archivoInput.value = "";
    boton.disabled = false;
  };

  lector.readAsText(archivo);
});
