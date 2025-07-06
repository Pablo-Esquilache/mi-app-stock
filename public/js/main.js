// js/main.js
import { auth } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔒 Cerrar sesión apenas se carga el login (prevención de sesión persistente)
signOut(auth).then(() => {
  // Limpiar campos al forzar logout
  const emailInput = document.getElementById("email");
  const passInput = document.getElementById("password");
  if (emailInput) emailInput.value = "";
  if (passInput) passInput.value = "";
});

// Función de login
async function login(event) {
  event.preventDefault(); // Previene recarga de formulario

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const sessionId = Date.now().toString();
    localStorage.setItem("sessionId", sessionId);

    const res = await fetch("https://mi-app-stock-backend.onrender.com/registrar-sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, sessionId })
    });

    if (res.status === 403) {
      alert("Esta cuenta ya está en uso en otro dispositivo.");
      await signOut(auth);
      localStorage.removeItem("sessionId");
      window.location.href = "/index.html";
    } else {
      window.location.href = "pages/dashboard.html";
    }
  } catch (error) {
    const loginError = document.getElementById("loginError");
    if (loginError) loginError.textContent = "Credenciales incorrectas";
    console.error("Error en login:", error);
  }
}

// Función de logout
async function logout() {
  const user = auth.currentUser;
  const sessionId = localStorage.getItem("sessionId");

  try {
    if (user && sessionId) {
      await fetch("https://mi-app-stock-backend.onrender.com/cerrar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid })
      });
    }
  } catch (err) {
    console.error("Error al cerrar sesión en backend:", err);
  }

  await signOut(auth);
  localStorage.removeItem("sessionId");
  window.location.href = "/index.html";
}

window.logout = logout;

// Asociar el login al submit del formulario
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", login);
  }
});

// ✅ Registrar el Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ SW registrado", reg))
      .catch((err) => console.error("❌ Error al registrar el SW:", err));
  });
}
