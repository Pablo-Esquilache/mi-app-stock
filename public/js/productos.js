// js/productos.js
import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 👉 Función para normalizar campos del producto
function normalizarProducto(data) {
  return {
    codigo: data.codigo || "",
    categoria: data.categoria || "",
    producto: data.producto || "",
    stock_inicial: data.stock_inicial ?? "",
    stock_final: data.stock_final ?? 0
  };
}

// Mostrar productos en tabla
document.addEventListener("DOMContentLoaded", async () => {
  const tabla = document.getElementById("tablaProductos");
  const buscador = document.getElementById("buscador");

  let productos = [];

  try {
    const querySnapshot = await getDocs(collection(db, "productos"));
    querySnapshot.forEach((docSnap) => {
      const data = normalizarProducto(docSnap.data());
      data.id = docSnap.id; // Guardamos el ID del doc
      productos.push(data);
    });

    // Ordenar por categoría alfabéticamente
    productos.sort((a, b) => a.categoria.localeCompare(b.categoria));

    mostrarProductos(productos);

    buscador.addEventListener("input", () => {
      const texto = buscador.value.toLowerCase();
      const filtrados = productos.filter(p =>
        p.categoria.toLowerCase().includes(texto) ||
        p.producto.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto)
      );
      mostrarProductos(filtrados);
    });

  } catch (error) {
    console.error("Error al obtener los productos:", error);
  }

  function mostrarProductos(lista) {
    tabla.innerHTML = ""; // Limpiar tabla
    lista.forEach((p) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${p.codigo}</td>
        <td>${p.categoria}</td>
        <td>${p.producto}</td>
        <td>${p.stock_inicial}</td>
        <td>${p.stock_final}</td>
        <td>
          <button class="accion" onclick="editarProducto('${p.id}')">✏️</button>
          <button class="accion eliminar" onclick="eliminarProducto('${p.id}')">🗑️</button>
        </td>
      `;
      tabla.appendChild(fila);
    });
  }
});

// Función para eliminar producto
window.eliminarProducto = async (id) => {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    try {
      await deleteDoc(doc(db, "productos", id));
      alert("Producto eliminado correctamente.");
      location.reload();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

// Función para abrir el modal de edición
window.editarProducto = async (id) => {
  const modal = document.getElementById("modalEditarProducto");
  const form = document.getElementById("formEditarProducto");

  try {
    const productoSnap = await getDoc(doc(db, "productos", id));
    if (productoSnap.exists()) {
      const data = productoSnap.data();
      document.getElementById("edit_codigo").value = data.codigo;
      document.getElementById("edit_categoria").value = data.categoria;
      document.getElementById("edit_producto").value = data.producto;
      document.getElementById("edit_stock_inicial").value = data.stock_inicial;

      modal.classList.remove("hidden");

      form.onsubmit = async (e) => {
        e.preventDefault();
        const nuevosDatos = {
          categoria: document.getElementById("edit_categoria").value,
          producto: document.getElementById("edit_producto").value,
          stock_inicial: parseInt(document.getElementById("edit_stock_inicial").value)
        };

        try {
          await updateDoc(doc(db, "productos", id), nuevosDatos);
          alert("Producto actualizado correctamente.");
          modal.classList.add("hidden");
          location.reload();
        } catch (error) {
          console.error("Error al actualizar:", error);
        }
      };
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error);
  }

  document.getElementById("cerrarModalEditar").onclick = () => {
    modal.classList.add("hidden");
  };
};
