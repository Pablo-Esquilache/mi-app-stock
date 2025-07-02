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
    .then(async (userCredential) => {
      const user = userCredential.user;
      const sessionId = Date.now().toString(); // o usar UUID si preferís
      localStorage.setItem("sessionId", sessionId);

      try {
        const res = await fetch("https://mi-app-stock-backend.onrender.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            sessionId
          })
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
        console.error("Error al registrar sesión:", error);
        alert("Error al conectar con el servidor. Intentalo de nuevo.");
        await signOut(auth);
        localStorage.removeItem("sessionId");
        window.location.href = "/index.html";
      }
    })
    .catch(() => {
      const loginError = document.getElementById("loginError");
      if (loginError) loginError.textContent = "Credenciales incorrectas";
    });
}

function logout() {
  const user = auth.currentUser;
  const sessionId = localStorage.getItem("sessionId");

  if (user) {
    fetch("https://mi-app-stock-backend.onrender.com/cerrar-sesion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid })
    }).catch((err) => console.error("Error al cerrar sesión en backend:", err));
  }

  signOut(auth).then(() => {
    localStorage.removeItem("sessionId");
    window.location.href = "/index.html";
  });
}


window.logout = logout;
window.login = login;

// ✅ Registrar el Service Worker con ruta absoluta
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ SW registrado", reg))
      .catch((err) => console.error("❌ Error al registrar el SW:", err));
  });
}
