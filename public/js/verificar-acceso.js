import { auth, db } from "../firebase-config.js";
import {
  doc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    // Si no está logueado, redirigir al login
    window.location.href = "login.html";
    return;
  }

  // Traer rol desde Firestore
  const q = query(collection(db, "usuarios"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    alert("❌ No se encontró el usuario en la base de datos.");
    auth.signOut();
    return;
  }

  const datos = snap.docs[0].data();
  const rol = datos.rol;

  // Página actual
  const ruta = window.location.pathname;

  // Restricciones si es "usuario"
  const permitidasUsuario = [
    "/reposicion.html",
    "/productos.html",
    "/ingresos.html"
  ];

  if (rol === "usuario" && !permitidasUsuario.includes(ruta)) {
    alert("⛔ No tenés permiso para acceder a esta sección.");
    window.location.href = "reposicion.html";
  }
});
