// menu-por-rol.js
import { auth, db } from "../firebase-config.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      // Buscamos el documento que tenga el uid del usuario
      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("uid", "==", user.uid));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn("No se encontró el rol del usuario.");
        return;
      }

      const data = snapshot.docs[0].data();
      const rol = data.rol;

      if (rol === "usuario") {
        // Ocultar botones que no corresponden al rol usuario
        const botones = document.querySelectorAll(".botonera button");
        botones.forEach((btn) => {
          const destino = btn.getAttribute("onclick");
          if (
            destino.includes("gestionar-usuarios.html") ||
            destino.includes("reportes.html")
          ) {
            btn.style.display = "none";
          }
        });
      }

    } catch (err) {
      console.error("❌ Error al verificar rol:", err);
    }
  }
});
