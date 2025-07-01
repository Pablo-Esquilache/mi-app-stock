// reposicion.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const btnAgregar = document.getElementById("agregarFormulario");
const btnGuardar = document.getElementById("guardarReposiciones");
const contenedor = document.getElementById("formulariosReposicion");
const datalist = document.getElementById("listaProductosGlobal");

let productosDisponibles = [];

const obtenerProductos = async () => {
  const querySnapshot = await getDocs(collection(db, "productos"));
  productosDisponibles = [];
  datalist.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const nombreProducto =
      data.producto || data.nombre || `SIN NOMBRE (${docSnap.id})`;
    const stockFinal = parseInt(data.stock_final);

    if (!isNaN(stockFinal) && stockFinal > 0) {
      productosDisponibles.push({
        id: docSnap.id,
        producto: nombreProducto,
        stock: stockFinal,
        categoria: data.categoria || "Sin categoría",
      });

      const option = document.createElement("option");
      option.value = nombreProducto;
      datalist.appendChild(option);
    }
  });
};

const crearFormulario = () => {
  const div = document.createElement("div");
  div.className = "formulario-reposicion";
  div.innerHTML = `
    <input type="text" placeholder="Buscar producto..." list="listaProductosGlobal" class="campo-producto" />
    <input type="number" placeholder="Cantidad" class="campo-cantidad" disabled />
     <input type="checkbox" class="campo-confirmar" disabled />
    <button class="btn-eliminar">🗑</button>
  `;

  contenedor.appendChild(div);

  const inputProducto = div.querySelector(".campo-producto");
  const inputCantidad = div.querySelector(".campo-cantidad");
  const checkbox = div.querySelector(".campo-confirmar");
  const btnEliminar = div.querySelector(".btn-eliminar");

  inputProducto.addEventListener("change", () => {
    const valorBuscado = inputProducto.value.toLowerCase().trim();
    const seleccionado = productosDisponibles.find(
      (p) => p.producto.toLowerCase().trim() === valorBuscado
    );

    if (seleccionado) {
      inputCantidad.disabled = false;
      checkbox.disabled = false;
      inputCantidad.max = seleccionado.stock;
    } else {
      inputCantidad.disabled = true;
      checkbox.disabled = true;
      inputCantidad.value = "";
    }
  });

  btnEliminar.addEventListener("click", () => {
    contenedor.removeChild(div);
  });
};

const guardarReposiciones = async () => {
  const formularios = contenedor.querySelectorAll(".formulario-reposicion");

  for (const form of formularios) {
    const inputProducto = form.querySelector(".campo-producto");
    const inputCantidad = form.querySelector(".campo-cantidad");
    const checkbox = form.querySelector(".campo-confirmar");

    if (!checkbox.checked) continue;

    const valorBuscado = inputProducto.value.toLowerCase().trim();
    const seleccionado = productosDisponibles.find(
      (p) => p.producto.toLowerCase().trim() === valorBuscado
    );

    const cantidad = parseInt(inputCantidad.value);

    if (seleccionado && !isNaN(cantidad)) {
      const nuevoStock = seleccionado.stock - cantidad;
      const productoRef = doc(db, "productos", seleccionado.id);

      try {
        await updateDoc(productoRef, { stock_final: nuevoStock });

        await addDoc(collection(db, "historial_reposiciones"), {
          producto_id: seleccionado.id,
          producto: seleccionado.producto,
          categoria: seleccionado.categoria,
          cantidad,
          fecha: Timestamp.now(), // siempre como Timestamp
        });
      } catch (error) {
        console.error("Error al guardar reposición:", error);
      }
    }
  }

  contenedor.innerHTML = "";
  alert("✅ Reposiciones registradas y guardadas correctamente.");
};

btnAgregar.addEventListener("click", crearFormulario);
btnGuardar.addEventListener("click", guardarReposiciones);
window.addEventListener("DOMContentLoaded", obtenerProductos);
