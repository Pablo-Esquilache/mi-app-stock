// js/productos.js
import { db } from "../firebase-config.js";
import {
  collection,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 👉 Normalizar campos del producto
function normalizarProducto(data) {
  return {
    codigo: data.codigo || "",
    categoria: data.categoria || "",
    producto: data.producto || "",
    stock_inicial: data.stock_inicial ?? "",
    stock_final: data.stock_final ?? 0
  };
}

// 👉 Crear una fila HTML para un producto
function crearFila(producto) {
  const fila = document.createElement("tr");
  fila.id = `producto-${producto.id}`;
  fila.innerHTML = `
    <td>${producto.codigo}</td>
    <td>${producto.categoria}</td>
    <td>${producto.producto}</td>
    <td>${producto.stock_inicial}</td>
    <td>${producto.stock_final}</td>
    <td>
      <button class="accion" onclick="editarProducto('${producto.id}')">✏️</button>
      <button class="accion eliminar" onclick="eliminarProducto('${producto.id}')">🗑️</button>
    </td>
  `;
  return fila;
}

// Mostrar productos y escuchar en tiempo real
document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tablaProductos");
  const buscador = document.getElementById("buscador");

  let productos = [];

  onSnapshot(collection(db, "productos"), (snapshot) => {
    productos = [];

    // Limpiar tabla
    tabla.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = normalizarProducto(docSnap.data());
      data.id = docSnap.id;
      productos.push(data);
    });

    // Ordenar alfabéticamente
    productos.sort((a, b) => a.categoria.localeCompare(b.categoria));
    mostrarProductos(productos);
  });

  // Buscador
  buscador.addEventListener("input", () => {
    const texto = buscador.value.toLowerCase();
    const filtrados = productos.filter(p =>
      p.categoria.toLowerCase().includes(texto) ||
      p.producto.toLowerCase().includes(texto) ||
      p.codigo.toLowerCase().includes(texto)
    );
    mostrarProductos(filtrados);
  });

  function mostrarProductos(lista) {
    tabla.innerHTML = "";
    lista.forEach((p) => {
      tabla.appendChild(crearFila(p));
    });
  }
});

// Función para eliminar producto
window.eliminarProducto = async (id) => {
  if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
    try {
      await deleteDoc(doc(db, "productos", id));
      alert("Producto eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

// Función para editar producto
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
          // No hace falta recargar: onSnapshot lo actualiza en vivo
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
