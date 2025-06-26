import { db } from "../firebase-config.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const emailInput = document.getElementById("emailUsuario");
const claveInput = document.getElementById("claveUsuario");
const rolSelect = document.getElementById("rolUsuario");
const btnCrear = document.getElementById("btnCrearUsuario");
const btnActualizar = document.getElementById("btnActualizarRol");
const tabla = document.getElementById("tablaUsuarios");

let usuarioSeleccionadoId = null;

const API_URL = "https://mi-app-stock-backend.onrender.com";

const cargarUsuarios = async () => {
  const snapshot = await getDocs(collection(db, "usuarios"));
  tabla.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${data.email}</td>
      <td>${data.rol}</td>
      <td>
        <button class="btn-editar"
                data-id="${docSnap.id}"
                data-email="${data.email}"
                data-rol="${data.rol}">✏️</button>
        <button class="btn-eliminar"
                data-id="${docSnap.id}"
                data-uid="${data.uid}">🗑️</button>
      </td>
    `;

    tabla.appendChild(fila);
  });

  document.querySelectorAll(".btn-editar").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      const email = e.currentTarget.getAttribute("data-email");
      const rol = e.currentTarget.getAttribute("data-rol");

      emailInput.value = email;
      rolSelect.value = rol;
      claveInput.value = "";
      usuarioSeleccionadoId = id;

      btnCrear.classList.add("hidden");
      btnActualizar.classList.remove("hidden");
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const uid = e.currentTarget.getAttribute("data-uid");

      const confirmar = confirm("¿Estás seguro que querés eliminar este usuario?");
      if (!confirmar) return;

      try {
        const res = await fetch(`${API_URL}/eliminar-usuario/${uid}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (res.ok) {
          alert("✅ Usuario eliminado correctamente.");
          cargarUsuarios();
        } else {
          alert("❌ No se pudo eliminar el usuario.");
          console.error(data.error);
        }
      } catch (err) {
        console.error("❌ Error al conectar con el backend:", err);
        alert("❌ Error al eliminar el usuario.");
      }
    });
  });
};

btnCrear.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const clave = claveInput.value.trim();
  const rol = rolSelect.value;

  if (!email || !clave || !rol) {
    return alert("Por favor, completá todos los campos.");
  }

  try {
    const res = await fetch(`${API_URL}/crear-usuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: clave, rol })
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Usuario creado exitosamente.");
      emailInput.value = "";
      claveInput.value = "";
      rolSelect.value = "usuario";
      cargarUsuarios();
    } else {
      alert("❌ No se pudo crear el usuario.");
      console.error(data.error);
    }
  } catch (err) {
    console.error("❌ Error al conectar con el backend:", err);
    alert("❌ Error al crear el usuario.");
  }
});

btnActualizar.addEventListener("click", async () => {
  if (!usuarioSeleccionadoId) return;

  const nuevoRol = rolSelect.value;
  try {
    const ref = doc(db, "usuarios", usuarioSeleccionadoId);
    await updateDoc(ref, { rol: nuevoRol });
    alert("✅ Rol actualizado.");
    emailInput.value = "";
    claveInput.value = "";
    rolSelect.value = "usuario";
    usuarioSeleccionadoId = null;
    btnCrear.classList.remove("hidden");
    btnActualizar.classList.add("hidden");
    cargarUsuarios();
  } catch (err) {
    console.error("❌ Error al actualizar el rol:", err);
    alert("❌ No se pudo actualizar el rol.");
  }
});

window.addEventListener("DOMContentLoaded", cargarUsuarios);
