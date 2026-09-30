const fs = require('fs');
const path = require('path');

const distHtmlPath = path.join(__dirname, '..', 'dist', 'index.html');
if (!fs.existsSync(distHtmlPath)) {
  console.error('dist/index.html not found!');
  process.exit(1);
}

let html = fs.readFileSync(distHtmlPath, 'utf8');

// Find any inline script tags
const scriptRegex = /<script(?:\s+[^>]*?)?>([\s\S]*?)<\/script>/gi;
const scripts = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  // Only collect non-empty scripts
  if (match[1] && match[1].trim().length > 0) {
    scripts.push(match[1]);
  }
}

// Remove original script tags
html = html.replace(scriptRegex, '');

// Ensure <div id="root"></div> is inside <body>
if (!html.includes('id="root"')) {
  html = html.replace('<body>', '<body>\n    <div id="root"></div>');
}

// Prepare combined scripts
const combinedScript = scripts.join('\n;\n');

// Clean script tag to place right before </body>
const injectedScript = `
    <script>
      (function() {
        var lastErr = null;
        window.addEventListener('error', function(e) {
          lastErr = (e && (e.error || e.message)) || 'Error desconocido';
          console.error('BasketShot runtime error:', lastErr);
        });
        setTimeout(function() {
          var root = document.getElementById('root');
          if (root && (!root.hasChildNodes() || root.innerHTML.trim() === '')) {
            var msg = lastErr ? (lastErr.stack || lastErr) : 'No se pudo iniciar la interfaz.';
            root.innerHTML = '<div style="font-family:system-ui,-apple-system,sans-serif;background:#090d16;color:#f8fafc;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">' +
              '<div style="max-width:540px;background:#131d2e;padding:28px;border-radius:20px;border:1px solid #1e293b;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);">' +
              '<h2 style="color:#f59e0b;margin-top:0;font-size:22px;font-weight:900;">BasketShot - Modo Seguro</h2>' +
              '<p style="color:#94a3b8;font-size:14px;line-height:1.5;">La aplicación detectó una inconsistencia en el almacenamiento local.</p>' +
              '<pre style="text-align:left;background:#0b111e;padding:12px;border-radius:10px;font-size:11px;color:#f87171;overflow:auto;max-height:140px;border:1px solid #1e293b;">' + String(msg).replace(/</g, '&lt;') + '</pre>' +
              '<button onclick="localStorage.clear();location.reload();" style="margin-top:20px;background:#f59e0b;color:#0f172a;border:none;padding:12px 24px;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;">Restablecer Datos Locales y Recargar</button>' +
              '</div></div>';
          }
        }, 1200);
      })();
    </script>
    <script>
${combinedScript}
    </script>
  </body>`;

html = html.replace('</body>', injectedScript);

// Save to dist/index.html, dist/404.html, and dist/.nojekyll
fs.writeFileSync(distHtmlPath, html, 'utf8');

const distDir = path.dirname(distHtmlPath);
fs.writeFileSync(path.join(distDir, '404.html'), html, 'utf8');
fs.writeFileSync(path.join(distDir, '.nojekyll'), '', 'utf8');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const publicTarget = path.join(publicDir, 'shot_tracker_local.html');
fs.writeFileSync(publicTarget, html, 'utf8');

const rootTarget = path.join(__dirname, '..', 'shot_tracker_local.html');
fs.writeFileSync(rootTarget, html, 'utf8');

// Also output to docs/ for direct GitHub Pages repository deployment
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}
fs.writeFileSync(path.join(docsDir, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(docsDir, '404.html'), html, 'utf8');
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '', 'utf8');

console.log('Successfully generated production build compatible with GitHub Pages:');
console.log(' - ' + distHtmlPath + ' (' + Math.round(html.length / 1024) + ' KB)');
console.log(' - ' + path.join(distDir, '404.html'));
console.log(' - ' + path.join(distDir, '.nojekyll'));
console.log(' - ' + path.join(docsDir, 'index.html'));
console.log(' - ' + publicTarget);
console.log(' - ' + rootTarget);
