// gestionar-usuarios.js
import { db, auth } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const emailInput = document.getElementById("emailUsuario");
const claveInput = document.getElementById("claveUsuario");
const rolSelect = document.getElementById("rolUsuario");
const btnCrear = document.getElementById("btnCrearUsuario");
const btnActualizar = document.getElementById("btnActualizarRol");
const tabla = document.getElementById("tablaUsuarios");

let usuarioSeleccionadoId = null;

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

  // Botón editar
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

  // Botón eliminar (envía al backend)
  document.querySelectorAll(".btn-eliminar").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const uid = e.currentTarget.getAttribute("data-uid");

      const confirmar = confirm("¿Estás seguro que querés eliminar este usuario?");
      if (!confirmar) return;

      try {
        const res = await fetch(`http://localhost:3000/eliminar-usuario/${uid}`, {
          method: "DELETE"
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


document.querySelectorAll(".btn-eliminar").forEach((btn) => {
  btn.addEventListener("click"), async (e) => {
    const confirmacion = confirm("¿Estás seguro de que querés eliminar este usuario?");
    if (!confirmacion) return;

    const uid = e.target.getAttribute("data-uid");

    try {
      const respuesta = await fetch(`http://localhost:3000/eliminar-usuario/${uid}`, {
        method: "DELETE"
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        alert("✅ Usuario eliminado correctamente.");
        cargarUsuarios(); // Refrescar tabla
      } else {
        console.error("❌ Error:", data.error);
        alert("❌ No se pudo eliminar el usuario.");
      }
    } catch (err) {
      console.error("❌ Error al conectar con backend:", err);
      alert("❌ Error al eliminar usuario.");
    }
  }
});


btnCrear.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const clave = claveInput.value.trim();
  const rol = rolSelect.value;

  if (!email || !clave || !rol) {
    return alert("Por favor, completá todos los campos.");
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, clave);
    await addDoc(collection(db, "usuarios"), {
      email,
      rol,
      uid: cred.user.uid
    });

    alert("✅ Usuario creado exitosamente.");
    emailInput.value = "";
    claveInput.value = "";
    rolSelect.value = "usuario";
    cargarUsuarios();
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    if (error.code === "auth/email-already-in-use") {
      alert("❌ El correo ya está en uso.");
    } else if (error.code === "auth/weak-password") {
      alert("❌ La contraseña debe tener al menos 6 caracteres.");
    } else {
      alert("❌ Ocurrió un error al crear el usuario.");
    }
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
