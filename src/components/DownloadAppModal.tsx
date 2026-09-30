import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  Database,
  Copy,
  Check,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { Player, Shot, PlayerGameStats } from '../types';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  players?: Player[];
  shots?: Shot[];
  playerStats?: Record<string, PlayerGameStats>;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  players = [],
  shots = [],
  playerStats = {},
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [includeCurrentData, setIncludeCurrentData] = useState(true);

  if (!isOpen) return null;

  const directFileUrl = `${window.location.origin}/shot_tracker_local.html`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/shot_tracker_local.html');
      if (!response.ok) {
        throw new Error('No se pudo obtener el archivo desde el servidor');
      }
      let htmlContent = await response.text();

      // If user wants to embed their current data so it loads automatically on any new device
      if (includeCurrentData && (players.length > 0 || shots.length > 0)) {
        const preloadedScript = `
    <!-- Datos actuales inyectados al descargar -->
    <script>
      (function() {
        try {
          var players = ${JSON.stringify(players)};
          var shots = ${JSON.stringify(shots)};
          var stats = ${JSON.stringify(playerStats)};
          if (!localStorage.getItem('basket_shot_players_v1') || localStorage.getItem('basket_shot_players_v1') === '[]') {
            localStorage.setItem('basket_shot_players_v1', JSON.stringify(players));
          }
          if (!localStorage.getItem('basket_shot_data_v1') || localStorage.getItem('basket_shot_data_v1') === '[]') {
            localStorage.setItem('basket_shot_data_v1', JSON.stringify(shots));
          }
          if (!localStorage.getItem('basket_shot_player_stats_v1')) {
            localStorage.setItem('basket_shot_player_stats_v1', JSON.stringify(stats));
          }
        } catch(e) {
          console.warn('Preload initialization warning:', e);
        }
      })();
    </script>
        `;
        htmlContent = htmlContent.replace('</head>', `${preloadedScript}\n  </head>`);
      }

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BasketShot_Control_Tiros.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 8000);
    } catch (err) {
      console.error('Error al descargar archivo HTML:', err);
      // Fallback: abrir directamente en nueva pestaña para que el usuario pueda guardarlo con Ctrl+S
      window.open('/shot_tracker_local.html', '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directFileUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    } catch {
      // Fallback si clipboard API no está disponible
      const input = document.createElement('input');
      input.value = directFileUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    }
  };

  return (
    <div
      id="download-app-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="download-app-modal-card"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Download className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Descargar Aplicación HTML
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                  1 Archivo
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                100% autónomo con base de datos local para usar en cualquier dispositivo sin internet
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-download-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-300">
          {/* Main Action Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 border-2 border-emerald-500/40 shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Archivo Único Portátil (.HTML)
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  BasketShot_Control_Tiros.html
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Todo el sistema de tiros, cancha, estadísticas, rebotes, asistencias y pérdidas está empacado dentro de este único archivo.
                </p>
              </div>
            </div>

            {/* Checkbox: Embed current data */}
            <label className="flex items-center gap-2.5 pt-2 border-t border-emerald-500/20 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeCurrentData}
                onChange={(e) => setIncludeCurrentData(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-400"
              />
              <span className="text-xs text-emerald-300 font-medium">
                Incluir mis datos actuales ({players.length} jugadores, {shots.length} tiros) precargados en el archivo
              </span>
            </label>

            {/* Big Download Button */}
            <button
              type="button"
              id="confirm-download-html-btn"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>{downloading ? 'Generando archivo...' : 'DESCARGAR ARCHIVO HTML (.HTML)'}</span>
            </button>
          </div>

          {/* Success Notification */}
          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-emerald-300 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span>¡Descarga iniciada! Revisa tu carpeta de <strong>Descargas</strong>.</span>
                <p className="text-[11px] text-emerald-400/80 font-normal mt-0.5">
                  El archivo se llama <strong>BasketShot_Control_Tiros.html</strong>.
                </p>
              </div>
            </div>
          )}

          {/* How it works info */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 flex items-start gap-3">
            <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-300 font-bold block mb-0.5">
                Base de Datos Local Automática
              </strong>
              Al abrir el archivo en cualquier computadora, tablet o celular, se guarda todo en la memoria local de tu navegador (<code className="text-amber-300 font-mono">localStorage</code>). No necesitas crear cuentas ni depender de un servidor externo.
            </div>
          </div>

          {/* Simple Steps */}
          <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              ¿Cómo usar el archivo descargado?
            </h4>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Haz clic en el botón verde superior <strong>«DESCARGAR ARCHIVO HTML»</strong>.</li>
              <li>Abre tu carpeta de <strong>Descargas</strong> en tu computadora o dispositivo.</li>
              <li>
                Haz doble clic sobre el archivo <strong className="text-slate-200">BasketShot_Control_Tiros.html</strong>: se abrirá instantáneamente en Chrome, Edge, Safari o Firefox.
              </li>
              <li>
                ¡Listo! Puedes usarlo sin conexión a internet y llevarlo en un pendrive o enviarlo por WhatsApp/email.
              </li>
            </ol>
          </div>

          {/* Alternative options: Open in new tab & copy URL */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
            <a
              id="open-html-new-tab-link"
              href="/shot_tracker_local.html"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors p-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir HTML en nueva pestaña</span>
            </a>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors p-1"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? '¡Enlace copiado!' : 'Copiar enlace al HTML'}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            type="button"
            id="cancel-download-modal-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
