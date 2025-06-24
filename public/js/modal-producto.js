import { db } from "../firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos
const modal = document.getElementById("modalProducto");
const btnAbrir = document.getElementById("btnAbrirModal");
const btnCerrar = document.getElementById("cerrarModal");
const inputCodigo = document.getElementById("codigo");

// Mostrar y ocultar modal
btnAbrir.addEventListener("click", async () => {
  modal.classList.remove("hidden");
  await generarCodigoAutomatico(); // Generar automáticamente al abrir
});
btnCerrar.addEventListener("click", () => modal.classList.add("hidden"));

// Generar código automáticamente
async function generarCodigoAutomatico() {
  const productosRef = collection(db, "productos");
  const q = query(productosRef, orderBy("codigo", "desc"), limit(1));
  const snapshot = await getDocs(q);

  let nuevoCodigo = 1;
  if (!snapshot.empty) {
    const ultimo = snapshot.docs[0].data().codigo;
    const numero = parseInt(ultimo.replace(/\D/g, "")) || 0;
    nuevoCodigo = numero + 1;
  }

  inputCodigo.value = `P${nuevoCodigo.toString().padStart(4, "0")}`; // Ej: P0001
}

// Agregar producto
document.getElementById("formNuevoProducto").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nuevoProducto = {
    codigo: inputCodigo.value.trim(),
    categoria: document.getElementById("categoria").value.trim(),
    producto: document.getElementById("producto").value.trim(),
    stock_inicial: parseInt(document.getElementById("stock_inicial").value),
    stock_final: parseInt(document.getElementById("stock_inicial").value), // stock_final = stock_inicial por ahora
  };

  try {
    await addDoc(collection(db, "productos"), nuevoProducto);
    alert("✅ Producto agregado correctamente");
    modal.classList.add("hidden");
    document.getElementById("formNuevoProducto").reset();
    window.location.reload();
  } catch (error) {
    console.error("Error al agregar producto:", error);
    alert("❌ Error al agregar producto");
  }
});
