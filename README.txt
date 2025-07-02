
# Guía de Actualización y Deploy para la App de Stock (PWA)

Esta guía explica cómo manejar las actualizaciones, el deploy en GitHub y la estrategia de versiones para que tu aplicación se actualice correctamente en los dispositivos de los usuarios.

---

## 🧱 Estructura general del proyecto

- `/public/`: Contiene archivos visibles por el navegador (HTML, CSS, JS).
- `/public/sw.js`: Archivo del Service Worker.
- `/public/js/dashboard.js`: Script del Dashboard, donde se muestra la alerta de actualización.

---

## 🚀 ¿Cómo se actualiza la aplicación PWA?

Tu app usa un **Service Worker** para funcionar offline y comportarse como PWA. Cuando detecta una nueva versión cacheada, muestra un cartel en el Dashboard para actualizar.

### Qué se detecta como "nueva versión":

- Cambios en archivos JS, CSS, HTML o imágenes que están cacheados por el SW.
- Cambios en la lógica del Service Worker (`sw.js`).
- Cambios en el nombre del caché (por ejemplo: 'stock-app-v1' → 'stock-app-v2').

---

## 🧠 Flujo de actualización automática

1. El Service Worker se registra en `dashboard.js`.
2. Si detecta un nuevo SW con archivos modificados:
   - Muestra un `confirm()` al usuario.
   - Si acepta, se llama a `skipWaiting()` y la página se recarga.

---

## 🛠️ ¿Qué tenés que hacer para subir una nueva versión?

### Paso a paso:

1. **Modificá los archivos que quieras actualizar**:
   - Ejemplo: `dashboard.js`, `styles.css`, etc.

2. **Modificá el archivo `/public/sw.js`**:
   - Cambiá el nombre de la caché:
     ```js
     const CACHE_NAME = 'stock-app-v4';  // ¡Cambiá esto en cada versión!
     ```

3. **Hacé commit y push a GitHub**:
   ```bash
   git add .
   git commit -m "Versión nueva: stock-app-v4"
   git push origin main
   ```

4. **Deploy en Firebase Hosting o tu servicio**:
   - Si usás Firebase:
     ```bash
     firebase deploy
     ```

5. ✅ ¡Listo! Los usuarios verán la alerta de actualización en el Dashboard.

---

## 💡 Consejos útiles

- Si usás herramientas de build (Webpack, Vite, etc.), habilitá el versionado automático de archivos.
- Mantené tu `sw.js` lo más liviano posible.
- Podés agregar un mensaje visual más lindo en lugar del `confirm()` si querés una mejor experiencia.

---

## 📂 Archivos importantes

- `public/sw.js`: Controla el caché y detecta actualizaciones.
- `public/js/dashboard.js`: Muestra la alerta de actualización.
- `index.html`: Entrada principal de la app.

---

Cualquier duda o mejora, actualizá esta guía para mantenerla como referencia del proyecto.
