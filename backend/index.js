// backend/index.js
import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

// Cargar variables del archivo .env
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configurar credenciales usando las variables de entorno
const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_CERT_URL,
};

// Inicializar Firebase Admin con las credenciales del .env
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Ruta para eliminar un usuario
app.delete("/eliminar-usuario/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    // 1. Eliminar del Auth de Firebase
    await admin.auth().deleteUser(uid);

    // 2. Eliminar también de Firestore
    const usuariosRef = db.collection("usuarios");
    const snapshot = await usuariosRef.where("uid", "==", uid).get();

    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    res.status(200).json({ mensaje: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({ error: "Error eliminando usuario." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
