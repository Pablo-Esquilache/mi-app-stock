// gestionar-usuarios.js
import { db, auth } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
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
    `;
    fila.addEventListener("click", () => {
      emailInput.value = data.email;
      rolSelect.value = data.rol;
      claveInput.value = "";
      usuarioSeleccionadoId = docSnap.id;
      btnCrear.classList.add("hidden");
      btnActualizar.classList.remove("hidden");
    });
    tabla.appendChild(fila);
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
