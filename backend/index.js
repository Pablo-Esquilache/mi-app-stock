import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Eliminar usuario
app.delete("/eliminar-usuario/:uid", async (req, res) => {
  const uid = req.params.uid;

  try {
    await admin.auth().deleteUser(uid);

    const usuariosRef = db.collection("usuarios");
    const snapshot = await usuariosRef.where("uid", "==", uid).get();

    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    res.status(200).json({ mensaje: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("❌ Error eliminando usuario:", error);
    res.status(500).json({ error: "Error eliminando usuario." });
  }
});

// Crear usuario
app.post("/crear-usuario", async (req, res) => {
  const { email, password, rol } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await db.collection("usuarios").add({
      email,
      rol,
      uid: userRecord.uid,
    });

    res.status(201).json({ mensaje: "Usuario creado correctamente." });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(500).json({ error: "Error al crear el usuario." });
  }
});

app.post('/registrar-sesion', async (req, res) => {
  try {
    const { uid, sessionId } = req.body;
    if (!uid || !sessionId) {
      return res.status(400).send({ error: 'Faltan datos' });
    }

    console.log("Recibiendo sesión:", { uid, sessionId });


    const ref = db.collection('sesiones').doc(uid);
    const doc = await ref.get();

    // Si ya hay una sesión activa distinta
    if (doc.exists && doc.data().sessionId !== sessionId) {
      return res.status(403).send({ error: 'Este usuario ya tiene una sesión activa en otro dispositivo.' });
    }

    // Registrar o actualizar la sesión
    await ref.set({
      sessionId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).send({ status: 'ok' });
  } catch (error) {
    console.error("Error al registrar sesión:", error);
    res.status(500).send({ error: 'Error del servidor' });
  }
});

app.post('/cerrar-sesion', async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).send({ error: 'Falta el UID' });
    }

    await db.collection('sesiones').doc(uid).delete();

    res.status(200).send({ status: 'Sesión cerrada y eliminada correctamente' });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).send({ error: 'Error del servidor al cerrar sesión' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
