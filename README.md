# 🏀 BasketShot - Control de Tiros de Baloncesto

Aplicación interactiva y autónoma para el registro y análisis estadístico de tiros, puntos, aciertos, fallos, rebotes, asistencias y pérdidas en baloncesto, organizada por jugadores y partidos con almacenamiento local persistente (`localStorage`).

---

## 🚀 Despliegue en GitHub Pages

El proyecto ya está configurado con rutas relativas (`base: './'`) para funcionar en cualquier repositorio o subdominio de GitHub Pages sin pantalla en blanco.

Tienes **3 opciones directas** para desplegarlo:

### Opción 1: GitHub Actions (Automático - Recomendado)
1. El repositorio incluye el flujo oficial `.github/workflows/deploy.yml`.
2. En tu repositorio en GitHub, ve a **Settings** > **Pages**.
3. En la sección **Build and deployment** > **Source**, selecciona: **GitHub Actions**.
4. ¡Listo! Cada vez que hagas `git push` a `main`, GitHub compilará el código y desplegará la versión de producción automáticamente.

---

### Opción 2: Carpeta `/docs` (Sin necesidad de Actions)
1. Ejecuta localmente:
   ```bash
   npm run build
   ```
   Esto generará automáticamente la carpeta `/docs` con el archivo `index.html` empaquetado y `.nojekyll`.
2. Haz commit y push de la carpeta `docs/` a tu repositorio:
   ```bash
   git add docs
   git commit -m "Compilar para GitHub Pages"
   git push origin main
   ```
3. En GitHub, ve a **Settings** > **Pages**.
4. En **Source**, selecciona **Deploy from a branch**.
5. Selecciona rama **main** y en la carpeta elige **/docs**. Haz clic en **Save**.

---

### Opción 3: Despliegue con comando `npm run deploy`
1. Ejecuta:
   ```bash
   npm run deploy
   ```
   Esto compila el proyecto y sube la carpeta `dist` automáticamente a la rama `gh-pages` de tu repositorio.
2. En GitHub, ve a **Settings** > **Pages** y selecciona la rama **gh-pages** / (root).

---

## 🛠️ Scripts disponibles

- `npm run dev`: Inicia el servidor de desarrollo local con Vite.
- `npm run build`: Compila el proyecto con rutas relativas (`./`), empaqueta el HTML y genera los archivos en `dist/`, `docs/` y el archivo autónomo `shot_tracker_local.html`.
- `npm run deploy`: Compila y publica directamente en la rama `gh-pages`.
- `npm run preview`: Previsualiza localmente el build de producción.
- `npm run lint`: Comprueba tipos de TypeScript sin emitir código.

---

## 📦 Archivo Autónomo (Offline)
El proyecto también genera un archivo único 100% autónomo llamado `shot_tracker_local.html` que puedes descargar directamente desde la aplicación o abrir haciendo doble clic en tu computadora sin necesidad de conexión ni servidor web.
