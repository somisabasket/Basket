import React, { useRef, useState, useEffect } from 'react';
import { Player, Shot, PlayerGameStats } from '../types';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Share2,
  SlidersHorizontal,
  Flame,
  CheckCircle,
  Users,
  UserPlus,
  Maximize,
  Minimize,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

interface HeaderProps {
  shots: Shot[];
  players: Player[];
  playerStats?: Record<string, PlayerGameStats>;
  shotTypeFilter: 'all' | 'two' | 'three' | 'makes' | 'misses';
  onChangeShotTypeFilter: (filter: 'all' | 'two' | 'three' | 'makes' | 'misses') => void;
  onResetSampleData: () => void;
  onClearAllShots: () => void;
  onImportData: (data: { players: Player[]; shots: Shot[]; playerStats?: Record<string, PlayerGameStats> }) => void;
  onOpenRosterManager: () => void;
  onOpenNewPlayerModal?: () => void;
  onOpenNewGameModal: () => void;
  onOpenDownloadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  shots,
  players,
  playerStats = {},
  shotTypeFilter,
  onChangeShotTypeFilter,
  onResetSampleData,
  onClearAllShots,
  onImportData,
  onOpenRosterManager,
  onOpenNewPlayerModal,
  onOpenNewGameModal,
  onOpenDownloadModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFs);
    return () => document.removeEventListener('fullscreenchange', handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleExportJson = () => {
    const dataToExport = {
      appName: 'BasketShot Tracker',
      exportDate: new Date().toISOString(),
      players,
      shots,
      playerStats,
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basket_tiros_y_estadisticas_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.shots && parsed.players) {
          onImportData({
            players: parsed.players,
            shots: parsed.shots,
            playerStats: parsed.playerStats || {},
          });
          alert('¡Datos de tiros, jugadores y estadísticas importados con éxito!');
        } else if (Array.isArray(parsed) && parsed[0]?.position) {
          // It's a player list JSON
          onImportData({
            players: parsed,
            shots,
            playerStats,
          });
          alert('¡Plantilla de jugadores importada con éxito!');
        } else {
          alert('El archivo no tiene el formato esperado.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="flex flex-col gap-3 w-full bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-3.5 sm:py-4 select-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-orange-950/40 ring-2 ring-amber-400/30 shrink-0">
            <span className="text-xl">🏀</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-white tracking-tight flex items-center gap-2">
              BasketShot
              <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Tablet & Web
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">
              Control táctico de tiros, posiciones y acierto
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Main "Mis Jugadores" Button */}
          <button
            type="button"
            id="header-roster-btn"
            onClick={onOpenRosterManager}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/30 transition-all hover:scale-102 active:scale-98 min-h-[40px]"
            title="Cargar tus propios jugadores o editar plantilla"
          >
            <Users className="w-4 h-4" />
            <span>Mis Jugadores</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-950/20 text-slate-950 font-mono text-[11px]">
              {players.length}
            </span>
          </button>

          {/* Quick Add Player Button */}
          {onOpenNewPlayerModal && (
            <button
              type="button"
              id="header-add-player-btn"
              onClick={onOpenNewPlayerModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400 font-bold text-xs shadow-sm transition-all hover:scale-102 active:scale-98 min-h-[40px]"
              title="Añadir un nuevo jugador directamente"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Jugador</span>
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            type="button"
            id="header-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla Completa (Tablet)'}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-amber-400 hover:text-white hover:border-slate-700 transition-colors min-h-[40px]"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>

          {/* Standalone HTML App with Local DB */}
          <button
            type="button"
            id="header-download-html-btn"
            onClick={onOpenDownloadModal}
            title="Descargar la app en un solo archivo HTML para usarla sin conexión con base de datos local"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-md shadow-emerald-950/40 min-h-[40px] hover:scale-105 active:scale-95 ring-2 ring-emerald-400/40"
          >
            <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span className="font-extrabold">Descargar HTML</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            id="export-data-btn"
            onClick={handleExportJson}
            title="Exportar archivo de datos (tiros y plantilla)"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors min-h-[40px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            id="import-data-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Importar archivo de datos o jugadores"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors min-h-[40px]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Importar</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* New Game / Reset Session Button */}
          <button
            type="button"
            id="header-new-game-btn"
            onClick={onOpenNewGameModal}
            title="Iniciar un nuevo partido o reiniciar sesión de tiro"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all shadow hover:scale-102 active:scale-98 min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nuevo Partido</span>
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            id="reset-demo-btn"
            onClick={() => {
              if (confirm('¿Restaurar los datos de ejemplo iniciales (Curry, Doncic, Giannis)?')) {
                onResetSampleData();
              }
            }}
            title="Restaurar tiros y jugadores de ejemplo"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors min-h-[40px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Ejemplos</span>
          </button>

          {/* Clear All Shots */}
          <button
            type="button"
            id="clear-all-shots-btn"
            onClick={onOpenNewGameModal}
            title="Limpiar tiros o reiniciar sesión"
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors min-h-[40px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Borrar / Reiniciar</span>
          </button>

        </div>
      </div>

      {/* Subheader Filters: Filter by 2PT, 3PT, Makes, Misses */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none touch-pan-x">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">
            Filtro:
          </span>
          <button
            type="button"
            onClick={() => onChangeShotTypeFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[36px] ${
              shotTypeFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            Todos ({shots.length})
          </button>
          <button
            type="button"
            onClick={() => onChangeShotTypeFilter('two')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[36px] ${
              shotTypeFilter === 'two'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            Solo 2PT ({shots.filter((s) => !s.isThree).length})
          </button>
          <button
            type="button"
            onClick={() => onChangeShotTypeFilter('three')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[36px] ${
              shotTypeFilter === 'three'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            Solo 3PT ({shots.filter((s) => s.isThree).length})
          </button>
          <button
            type="button"
            onClick={() => onChangeShotTypeFilter('makes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[36px] ${
              shotTypeFilter === 'makes'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            Aciertos ({shots.filter((s) => s.made).length})
          </button>
          <button
            type="button"
            onClick={() => onChangeShotTypeFilter('misses')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all min-h-[36px] ${
              shotTypeFilter === 'misses'
                ? 'bg-rose-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            Fallos ({shots.filter((s) => !s.made).length})
          </button>
        </div>

        <div className="text-[11px] text-slate-500 hidden xl:block font-medium">
          Toca la cancha para registrar tiro • Atajos de teclado: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">1/A</kbd> Anotó, <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">2/F</kbd> Falló
        </div>
      </div>
    </header>
  );
};
