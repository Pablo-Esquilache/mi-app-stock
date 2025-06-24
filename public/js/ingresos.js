// ingresos.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const btnAgregar = document.getElementById("agregarFormulario");
const btnGuardar = document.getElementById("btnGuardarIngresos");
const contenedor = document.getElementById("formulariosIngreso");
const datalist = document.getElementById("listaProductosIngreso");

let productosDisponibles = [];
let formularios = [];

const obtenerProductos = async () => {
  const querySnapshot = await getDocs(collection(db, "productos"));
  productosDisponibles = [];
  datalist.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const nombreProducto = data.producto || data.nombre || `SIN NOMBRE (${docSnap.id})`;

    productosDisponibles.push({
      id: docSnap.id,
      producto: nombreProducto,
      stock: parseInt(data.stock_final) || 0,
      categoria: data.categoria || "Sin categoría"
    });

    const option = document.createElement("option");
    option.value = nombreProducto;
    datalist.appendChild(option);
  });
};

const crearFormulario = () => {
  const div = document.createElement("div");
  div.className = "formulario-ingreso";
  div.innerHTML = `
    <input type="text" placeholder="Buscar producto..." list="listaProductosIngreso" class="campo-producto" />
    <input type="number" placeholder="Cantidad" class="campo-cantidad" disabled />
    <button class="btn-eliminar">🗑</button>
  `;

  contenedor.appendChild(div);

  const inputProducto = div.querySelector(".campo-producto");
  const inputCantidad = div.querySelector(".campo-cantidad");
  const btnEliminar = div.querySelector(".btn-eliminar");

  inputProducto.addEventListener("change", () => {
    const valorBuscado = inputProducto.value.toLowerCase().trim();
    const seleccionado = productosDisponibles.find(
      (p) => p.producto.toLowerCase().trim() === valorBuscado
    );

    inputCantidad.disabled = !seleccionado;
    if (!seleccionado) inputCantidad.value = "";
  });

  btnEliminar.addEventListener("click", () => {
    contenedor.removeChild(div);
    formularios = formularios.filter((f) => f !== div);
  });

  formularios.push(div);
};

btnAgregar.addEventListener("click", crearFormulario);

btnGuardar.addEventListener("click", async () => {
  for (const div of formularios) {
    const inputProducto = div.querySelector(".campo-producto");
    const inputCantidad = div.querySelector(".campo-cantidad");

    const valorBuscado = inputProducto.value.toLowerCase().trim();
    const cantidad = parseInt(inputCantidad.value);
    const seleccionado = productosDisponibles.find(
      (p) => p.producto.toLowerCase().trim() === valorBuscado
    );

    if (seleccionado && !isNaN(cantidad)) {
      const nuevoStock = seleccionado.stock + cantidad;
      const productoRef = doc(db, "productos", seleccionado.id);

      try {
        await updateDoc(productoRef, { stock_final: nuevoStock });

        await addDoc(collection(db, "historial_ingresos"), {
          producto_id: seleccionado.id,
          producto: seleccionado.producto,
          categoria: seleccionado.categoria,
          cantidad,
          fecha: Timestamp.now() // siempre como Timestamp
        });

      } catch (e) {
        console.error("Error al actualizar stock:", e);
        alert("❌ Error al guardar el ingreso");
        return;
      }
    }
  }

  alert("✅ Ingresos guardados correctamente.");
  location.reload();
});

window.addEventListener("DOMContentLoaded", obtenerProductos);
