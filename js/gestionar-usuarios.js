import { db, auth } from "../firebase-config.js";
import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const emailInput = document.getElementById("emailUsuario");
const claveInput = document.getElementById("claveUsuario");
const rolSelect = document.getElementById("rolUsuario");
const btnCrear = document.getElementById("btnCrearUsuario");
const tabla = document.getElementById("tablaUsuarios");

const cargarUsuarios = async () => {
  const snapshot = await getDocs(collection(db, "usuarios"));
  tabla.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${data.email}</td>
      <td>${data.rol}</td>
    `;
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
    // 1. Crear usuario en Firebase Authentication
    const cred = await createUserWithEmailAndPassword(auth, email, clave);

    // 2. Agregar usuario en Firestore (con su rol)
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

window.addEventListener("DOMContentLoaded", cargarUsuarios);
