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

    window.logout = logout;