// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAgtVulPxRcPdJ464dXwpSEZTEF-TL7yyc",
  authDomain: "control-stock-app-5c73b.firebaseapp.com",
  projectId: "control-stock-app-5c73b",
  storageBucket: "control-stock-app-5c73b.firebasestorage.app",
  messagingSenderId: "183225226359",
  appId: "1:183225226359:web:d1cec7f2b0850f51c42272"
};

// Inicialización y exportación
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
