// js/main.js
import { auth } from "../firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔒 Forzar cierre de sesión al abrir (solo en index)
signOut(auth);

// Función de login
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "./pages/dashboard.html";
    })
    .catch(() => {
      const loginError = document.getElementById("loginError");
      if (loginError) loginError.textContent = "Credenciales incorrectas";
    });
}

function logout() {
  signOut(auth).then(() => {
    window.location.href = "../index.html";
  });
}

window.logout = logout;

window.login = login;

signOut(auth);
