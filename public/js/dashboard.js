    import { auth } from "../firebase-config.js";
    import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

    // Si no hay usuario autenticado, redirigir a login
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "../index.html";
      }
    });

    // Cerrar sesión
    function logout() {
      signOut(auth).then(() => {
        window.location.href = "../index.html";
      });
    }

    // Registro y actualización del Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          const actualizar = confirm("Hay una nueva versión de la app. ¿Querés actualizar ahora?");
          if (actualizar) {
            newWorker.postMessage({ action: 'skipWaiting' });
          }
        }
      });
    });
  });

  let refreshing;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}


    window.logout = logout;