import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function mountBasketShot() {
  try {
    let rootEl = document.getElementById('root');
    if (!rootEl) {
      if (document.body) {
        rootEl = document.createElement('div');
        rootEl.id = 'root';
        document.body.appendChild(rootEl);
      } else {
        return false;
      }
    }

    // Check if already mounted
    if (rootEl.hasChildNodes()) {
      return true;
    }

    const root = createRoot(rootEl);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    return true;
  } catch (err) {
    console.error('Error mounting BasketShot application:', err);
    return false;
  }
}

// Try mounting immediately; if DOM is still parsing, attach listeners
if (!mountBasketShot()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      mountBasketShot();
    });
  }
  window.addEventListener('load', () => {
    mountBasketShot();
  });
}

