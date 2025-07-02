import { auth } from "../firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Validar sesión activa única
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
  } else {
    const sessionId = localStorage.getItem("sessionId");

    try {
      const res = await fetch("https://mi-app-stock-backend.onrender.com/registrar-sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          sessionId
        })
      });

      if (res.status === 403) {
        alert("Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.");
        await signOut(auth);
        localStorage.removeItem("sessionId");
        window.location.href = "/index.html";
      }
    } catch (error) {
      console.error("Error al verificar la sesión activa:", error);
    }
  }
});

// Cerrar sesión
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

// Registro y actualización del Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then((registration) => {
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          const actualizar = confirm("Hay una nueva versión de la app. ¿Querés actualizar ahora?");
          if (actualizar) {
            newWorker.postMessage({ action: "skipWaiting" });
          }
        }
      });
    });
  });

  let refreshing;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
