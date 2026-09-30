import React, { useState, useRef, useEffect } from 'react';
import { Shot, Player, ShotZoneId, CourtViewMode, CourtTheme, ZoneStat, PlayerGameStats } from '../types';
import { calculateShotDetails, ZONE_DEFINITIONS } from '../utils/courtGeometry';
import {
  Trash2,
  RotateCcw,
  Volume2,
  VolumeX,
  Eye,
  Info,
  Check,
  X,
  Flame,
  Snowflake,
  Maximize,
  Minimize,
  Users,
  UserPlus,
  Settings2,
} from 'lucide-react';

interface CourtProps {
  shots: Shot[];
  players: Player[];
  playerStats?: Record<string, PlayerGameStats>;
  activePlayerId: string | 'all';
  onSelectPlayer?: (id: string | 'all') => void;
  onOpenRosterManager?: () => void;
  onOpenNewPlayerModal?: () => void;
  onCourtPlayerIds?: string[];
  playerMinutes?: Record<string, number>;
  selectedZoneFilter: ShotZoneId | null;
  onSelectZoneFilter: (zone: ShotZoneId | null) => void;
  onCourtClick: (coords: { x: number; y: number; clientX: number; clientY: number }) => void;
  onDeleteShot: (shotId: string) => void;
  onToggleShotResult: (shotId: string) => void;
  courtTheme: CourtTheme;
  onToggleTheme: () => void;
  viewMode: CourtViewMode;
  onChangeViewMode: (mode: CourtViewMode) => void;
  zoneStats: ZoneStat[];
  fastMode: boolean;
  fastModeResult: boolean;
  onToggleFastModeResult: () => void;
  onToggleFastMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onUndoLastShot: () => void;
  canUndo: boolean;
  onUpdatePlayerStat?: (playerId: string, statKey: 'rebounds' | 'assists' | 'turnovers', delta: number) => void;
}

export const Court: React.FC<CourtProps> = ({
  shots,
  players,
  playerStats = {},
  activePlayerId,
  onSelectPlayer,
  onOpenRosterManager,
  onOpenNewPlayerModal,
  onCourtPlayerIds,
  playerMinutes,
  selectedZoneFilter,
  onSelectZoneFilter,
  onCourtClick,
  onDeleteShot,
  onToggleShotResult,
  courtTheme,
  onToggleTheme,
  viewMode,
  onChangeViewMode,
  zoneStats,
  fastMode,
  fastModeResult,
  onToggleFastModeResult,
  onToggleFastMode,
  soundEnabled,
  onToggleSound,
  onUndoLastShot,
  canUndo,
  onUpdatePlayerStat,
}) => {
  const courtContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredShot, setHoveredShot] = useState<Shot | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number; distance: number; isThree: boolean } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Active player stats for in-court boxscore logging
  const currentShooter = activePlayerId !== 'all' ? players.find((p) => p.id === activePlayerId) : null;
  const currentShooterStats = currentShooter ? playerStats[currentShooter.id] : null;

  const handleInCourtStat = (statKey: 'rebounds' | 'assists' | 'turnovers', delta: number) => {
    if (!onUpdatePlayerStat) return;
    if (currentShooter) {
      onUpdatePlayerStat(currentShooter.id, statKey, delta);
    } else if (players.length > 0) {
      onUpdatePlayerStat(players[0].id, statKey, delta);
    }
  };

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

  // Filter shots by active player and zone filter
  const displayedShots = shots.filter((shot) => {
    if (activePlayerId !== 'all' && shot.playerId !== activePlayerId) return false;
    if (selectedZoneFilter && shot.zoneId !== selectedZoneFilter) return false;
    return true;
  });

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!courtContainerRef.current) return;
    const rect = courtContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    const details = calculateShotDetails(xPct, yPct);
    setHoverCoords({
      x: xPct,
      y: yPct,
      distance: details.distanceMeters,
      isThree: details.isThree,
    });
  };

  const handlePointerLeave = () => {
    setHoverCoords(null);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If clicked on a shot circle itself, do not register a new shot
    if ((e.target as HTMLElement).closest('.shot-marker')) {
      return;
    }
    if (!courtContainerRef.current) return;
    const rect = courtContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    onCourtClick({
      x: Math.round(xPct * 10) / 10,
      y: Math.round(yPct * 10) / 10,
      clientX: e.clientX,
      clientY: e.clientY,
    });
  };

  const getPlayerById = (id: string) => players.find((p) => p.id === id);

  // Color theme palettes
  const isWood = courtTheme === 'hardwood';

  return (
    <div className="flex flex-col w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-950/80 border-b border-slate-800/80">
        {/* Left: View Mode Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            id="view-mode-markers-btn"
            onClick={() => onChangeViewMode('markers')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              viewMode === 'markers'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Tiros ({displayedShots.length})
          </button>
          <button
            type="button"
            id="view-mode-zones-btn"
            onClick={() => onChangeViewMode('zones')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              viewMode === 'zones'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Zonas y %
          </button>
          <button
            type="button"
            id="view-mode-heatmap-btn"
            onClick={() => onChangeViewMode('heatmap')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              viewMode === 'heatmap'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Mapa de Calor
          </button>
        </div>

        {/* Center: Fast Input Mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              id="fast-mode-toggle-btn"
              onClick={onToggleFastMode}
              title="Registra el tiro inmediatamente al tocar la cancha sin abrir ventana"
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                fastMode ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modo Rápido: {fastMode ? 'Activo' : 'Manual'}
            </button>

            {fastMode && (
              <button
                type="button"
                id="fast-result-toggle-btn"
                onClick={onToggleFastModeResult}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-transform active:scale-95 ${
                  fastModeResult
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                {fastModeResult ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Anota
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" /> Falla
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Theme, Sound, Fullscreen, Undo Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen Button for Tablet */}
          <button
            type="button"
            id="toggle-fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Modo Pantalla Completa para Tablet / Pizarra'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-amber-400 hover:text-white hover:bg-slate-800 transition-all min-h-[36px]"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Salir' : 'Pantalla Completa'}</span>
          </button>

          <button
            type="button"
            id="undo-shot-btn"
            onClick={onUndoLastShot}
            disabled={!canUndo}
            title="Deshacer último tiro registrado"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[36px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Deshacer</span>
          </button>

          <button
            type="button"
            id="toggle-sound-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Silenciar sonidos de tiro' : 'Activar sonido de tiros'}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all min-h-[36px]"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            type="button"
            id="toggle-court-theme-btn"
            onClick={onToggleTheme}
            title="Alternar entre Duela de Madera y Pizarra Táctica"
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all min-h-[36px]"
          >
            {isWood ? '🪵 Duela' : '📋 Pizarra'}
          </button>
        </div>
      </div>

      {/* Quick Shooter Selector Strip for Tablet / Rapid Coaching */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800/80 overflow-x-auto scrollbar-none touch-pan-x">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          Tirador:
        </span>

        {/* All players chip */}
        <button
          type="button"
          onClick={() => onSelectPlayer?.('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all min-h-[34px] flex items-center gap-1.5 ${
            activePlayerId === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span>Equipo</span>
        </button>

        {/* Individual player chips */}
        {players.map((p) => {
          const isSelected = activePlayerId === p.id;
          const playerShots = shots.filter((s) => s.playerId === p.id);
          const pMade = playerShots.filter((s) => s.made).length;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlayer?.(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all min-h-[34px] flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-800 text-white border-2 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title={`${p.name} (#${p.number}) - ${p.position} - ${pMade}/${playerShots.length} tiros`}
            >
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-black text-slate-950"
                style={{ backgroundColor: p.avatarColor }}
              >
                #{p.number}
              </span>
              <span className="truncate max-w-[90px]">{p.name.split(' ')[0]}</span>
              {playerShots.length > 0 && (
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  {pMade}/{playerShots.length}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick add player shortcut chip */}
        {onOpenNewPlayerModal && (
          <button
            type="button"
            onClick={onOpenNewPlayerModal}
            title="Agregar un nuevo jugador"
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:bg-slate-900 border border-dashed border-amber-500/50 shrink-0 flex items-center gap-1 min-h-[34px] transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Jugador</span>
          </button>
        )}

        {/* Quick manage button */}
        {onOpenRosterManager && (
          <button
            type="button"
            onClick={onOpenRosterManager}
            title="Gestionar o cargar jugadores"
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 shrink-0 ml-auto flex items-center gap-1 min-h-[34px]"
          >
            <Settings2 className="w-3 h-3" />
            <span>Plantilla</span>
          </button>
        )}
      </div>

      {/* Live In-Court Box Score Stat Logging Strip */}
      {players.length > 0 && onUpdatePlayerStat && (
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/90 border-b border-slate-800/80 text-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-amber-400 font-bold">⚡ Acciones en vivo:</span>
            {currentShooter ? (
              <span className="font-bold text-white truncate max-w-[150px]">
                #{currentShooter.number} {currentShooter.name.split(' ')[0]}
              </span>
            ) : (
              <span className="text-slate-400 text-[11px] truncate">
                (Toca un jugador arriba para asignarle)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* REBOUNDS */}
            <button
              type="button"
              onClick={() => handleInCourtStat('rebounds', 1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
              title={`+1 Rebote para ${currentShooter ? currentShooter.name : 'jugador'}`}
            >
              <span>🛡️ +1 REB</span>
              <span className="px-1 py-0.2 rounded bg-sky-500/30 text-[10px] font-mono">
                {currentShooterStats?.rebounds || 0}
              </span>
            </button>

            {/* ASSISTS */}
            <button
              type="button"
              onClick={() => handleInCourtStat('assists', 1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
              title={`+1 Asistencia para ${currentShooter ? currentShooter.name : 'jugador'}`}
            >
              <span>🎯 +1 AST</span>
              <span className="px-1 py-0.2 rounded bg-emerald-500/30 text-[10px] font-mono">
                {currentShooterStats?.assists || 0}
              </span>
            </button>

            {/* TURNOVERS */}
            <button
              type="button"
              onClick={() => handleInCourtStat('turnovers', 1)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer"
              title={`+1 Pérdida de balón para ${currentShooter ? currentShooter.name : 'jugador'}`}
            >
              <span>⚠️ +1 PÉR</span>
              <span className="px-1 py-0.2 rounded bg-rose-500/30 text-[10px] font-mono">
                {currentShooterStats?.turnovers || 0}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Active Zone Filter pill if active */}
      {selectedZoneFilter && (
        <div className="flex items-center justify-between px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/30 text-amber-300 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <Info className="w-3.5 h-3.5" /> Filtrando por zona:{' '}
            <strong className="text-white">{ZONE_DEFINITIONS[selectedZoneFilter]?.name}</strong>
          </span>
          <button
            type="button"
            id="clear-zone-filter-btn"
            onClick={() => onSelectZoneFilter(null)}
            className="text-amber-400 hover:text-amber-200 underline font-semibold text-xs ml-2 cursor-pointer"
          >
            Mostrar todas
          </button>
        </div>
      )}

      {/* Main Interactive Basketball Court */}
      <div
        ref={courtContainerRef}
        className="relative w-full aspect-[15/14] select-none overflow-hidden touch-manipulation cursor-crosshair group"
      >
        <svg
          viewBox="0 0 1000 933"
          className="w-full h-full"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          onClick={handleSvgClick}
        >
          <defs>
            {/* Hardwood floor wood plank patterns */}
            <pattern id="woodPattern" width="100" height="24" patternUnits="userSpaceOnUse">
              <rect width="100" height="24" fill="#C28D52" />
              <line x1="0" y1="0" x2="100" y2="0" stroke="#B27B42" strokeWidth="0.75" />
              <line x1="0" y1="24" x2="100" y2="24" stroke="#B27B42" strokeWidth="0.75" />
              <line x1="45" y1="0" x2="45" y2="24" stroke="#A7723B" strokeWidth="0.75" opacity="0.6" />
              <line x1="95" y1="0" x2="95" y2="24" stroke="#A7723B" strokeWidth="0.75" opacity="0.6" />
              <rect x="0" y="0" width="100" height="24" fill="url(#subtleGlow)" opacity="0.1" />
            </pattern>

            <linearGradient id="hardwoodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DFAC6C" />
              <stop offset="50%" stopColor="#D29B58" />
              <stop offset="100%" stopColor="#C48C4B" />
            </linearGradient>

            <linearGradient id="tacticalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#1C2541" />
            </linearGradient>

            <radialGradient id="netGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFA000" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
            </radialGradient>

            {/* Drop shadow for markers */}
            <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Court Floor Background */}
          {isWood ? (
            <>
              <rect width="1000" height="933" fill="url(#hardwoodGrad)" />
              <rect width="1000" height="933" fill="url(#woodPattern)" opacity="0.45" />
              {/* Outer perimeter dark wood apron */}
              <rect x="0" y="0" width="1000" height="933" fill="none" stroke="#935B23" strokeWidth="8" />
            </>
          ) : (
            <>
              <rect width="1000" height="933" fill="url(#tacticalGrad)" />
              {/* Tactical grid background */}
              <line x1="0" y1="0" x2="1000" y2="933" stroke="#253252" strokeWidth="0.5" strokeDasharray="6 6" opacity="0.3" />
            </>
          )}

          {/* Court Markings Style Parameters */}
          {(() => {
            const lineStroke = isWood ? '#FFFFFF' : '#38BDF8';
            const lineWidth = 3.2;
            const paintFill = isWood ? '#9A461A' : '#1E293B';
            const paintFillOpacity = isWood ? 0.35 : 0.6;
            const hoopColor = '#EA580C';

            // Coordinates in SVG (court width 1000, court length 933):
            // 15m = 1000px => 1m = 66.67px
            // Hoop center: x = 500, y = 1.575m * 66.67 = 105
            // Key width: 4.9m * 66.67 = 326.7px (x = 336.6 to 663.4)
            // Key depth: 5.8m * 66.67 = 386.7px
            // Free throw circle radius: 1.8m * 66.67 = 120px
            // 3PT line radius: 6.75m * 66.67 = 450px
            // Corner straight line cutoff: 0.9m from sideline = 60px (x = 60 and x = 940)
            // Corner straight line length: from y = 0 to y = 199.3px
            // Restricted area radius: 1.25m * 66.67 = 83.3px
            // Center circle at half court: center at (500, 933), radius = 120px

            return (
              <g id="court-markings">
                {/* Paint / Key Area Filled */}
                <rect
                  x="336.6"
                  y="0"
                  width="326.8"
                  height="386.7"
                  fill={paintFill}
                  fillOpacity={paintFillOpacity}
                />

                {/* Free Throw Circle - Top Half Solid, Bottom Half Dashed */}
                <circle
                  cx="500"
                  cy="386.7"
                  r="120"
                  fill="none"
                  stroke={lineStroke}
                  strokeWidth={lineWidth}
                />
                {/* Dashed lower portion inside the key */}
                <path
                  d="M 380 386.7 A 120 120 0 0 0 620 386.7"
                  fill="none"
                  stroke={lineStroke}
                  strokeWidth={lineWidth}
                  strokeDasharray="9 9"
                />

                {/* Paint Border lines */}
                <rect
                  x="336.6"
                  y="0"
                  width="326.8"
                  height="386.7"
                  fill="none"
                  stroke={lineStroke}
                  strokeWidth={lineWidth}
                />

                {/* Low Post Blocks / Hash Marks */}
                <line x1="326" y1="175" x2="336.6" y2="175" stroke={lineStroke} strokeWidth={4} />
                <line x1="663.4" y1="175" x2="674" y2="175" stroke={lineStroke} strokeWidth={4} />

                <line x1="326" y1="235" x2="336.6" y2="235" stroke={lineStroke} strokeWidth={3} />
                <line x1="663.4" y1="235" x2="674" y2="235" stroke={lineStroke} strokeWidth={3} />

                <line x1="326" y1="295" x2="336.6" y2="295" stroke={lineStroke} strokeWidth={3} />
                <line x1="663.4" y1="295" x2="674" y2="295" stroke={lineStroke} strokeWidth={3} />

                {/* Restricted Area Arc (1.25m from rim center) */}
                <path
                  d="M 416.7 105 A 83.3 83.3 0 0 0 583.3 105"
                  fill="none"
                  stroke={lineStroke}
                  strokeWidth={lineWidth}
                />
                <line x1="416.7" y1="80" x2="416.7" y2="105" stroke={lineStroke} strokeWidth={lineWidth} />
                <line x1="583.3" y1="80" x2="583.3" y2="105" stroke={lineStroke} strokeWidth={lineWidth} />

                {/* Three-Point Line (FIBA 6.75m, corner straight lines at 60px from sidelines) */}
                {/* Left straight line: (60, 0) to (60, 199.3) */}
                {/* Right straight line: (940, 0) to (940, 199.3) */}
                {/* Arc from (60, 199.3) to (940, 199.3) with radius 450 centered at (500, 105) */}
                <path
                  d="M 60 0 L 60 199.3 A 450 450 0 0 0 940 199.3 L 940 0"
                  fill="none"
                  stroke={lineStroke}
                  strokeWidth={lineWidth}
                />

                {/* Half Court Line and Center Circle */}
                <line x1="0" y1="930" x2="1000" y2="930" stroke={lineStroke} strokeWidth={lineWidth + 1} />
                <path
                  d="M 380 930 A 120 120 0 0 1 620 930"
                  fill="none"
                  stroke={lineStroke}
                  strokeWidth={lineWidth}
                />

                {/* Backboard: 1.8m wide = 120px, located at y = 80 (1.2m from baseline) */}
                <line x1="440" y1="80" x2="560" y2="80" stroke={isWood ? '#1E293B' : '#FFFFFF'} strokeWidth="5.5" />
                <line x1="440" y1="80" x2="560" y2="80" stroke="#FFFFFF" strokeWidth="2.5" />

                {/* Rim Connector & Hoop Rim */}
                <line x1="500" y1="80" x2="500" y2="90" stroke={hoopColor} strokeWidth="5" />
                <circle cx="500" cy="105" r="15" fill="none" stroke={hoopColor} strokeWidth="4.5" />
                {/* Net subtle graphic */}
                <path
                  d="M 488 107 Q 500 130 512 107 M 491 114 Q 500 135 509 114"
                  stroke="#E2E8F0"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.8"
                />
              </g>
            );
          })()}

          {/* VIEW MODE: Zones & Accuracy Overlay */}
          {viewMode === 'zones' && (
            <g id="zone-polygons" className="cursor-pointer">
              {zoneStats.map((stat) => {
                const isSelected = selectedZoneFilter === stat.zoneId;

                // Determine zone fill color based on efficiency
                let fillColor = '#64748B'; // slate
                let textColor = '#FFFFFF';
                let strokeColor = 'rgba(255, 255, 255, 0.4)';

                if (stat.attempts > 0) {
                  if (stat.efficiencyRating === 'hot') {
                    fillColor = '#10B981'; // green hot
                    strokeColor = '#059669';
                  } else if (stat.efficiencyRating === 'neutral') {
                    fillColor = '#F59E0B'; // amber
                    strokeColor = '#D97706';
                  } else {
                    fillColor = '#3B82F6'; // blue cold
                    strokeColor = '#2563EB';
                  }
                }

                // Coordinates for zone badges
                const zoneBadgePositions: Record<ShotZoneId, { cx: number; cy: number }> = {
                  restricted_area: { cx: 500, cy: 110 },
                  paint: { cx: 500, cy: 260 },
                  mid_left_corner: { cx: 190, cy: 90 },
                  mid_left_wing: { cx: 210, cy: 280 },
                  mid_center: { cx: 500, cy: 450 },
                  mid_right_wing: { cx: 790, cy: 280 },
                  mid_right_corner: { cx: 810, cy: 90 },
                  three_left_corner: { cx: 30, cy: 100 },
                  three_left_wing: { cx: 160, cy: 590 },
                  three_center: { cx: 500, cy: 710 },
                  three_right_wing: { cx: 840, cy: 590 },
                  three_right_corner: { cx: 970, cy: 100 },
                };

                const pos = zoneBadgePositions[stat.zoneId];

                return (
                  <g
                    key={`zone-overlay-${stat.zoneId}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectZoneFilter(isSelected ? null : stat.zoneId);
                    }}
                    className="transition-all hover:opacity-100"
                  >
                    {/* Zone Badge Container */}
                    <g
                      transform={`translate(${pos.cx}, ${pos.cy})`}
                      className="cursor-pointer transition-transform hover:scale-105"
                    >
                      <rect
                        x="-70"
                        y="-30"
                        width="140"
                        height="60"
                        rx="12"
                        fill="#0F172A"
                        fillOpacity="0.9"
                        stroke={isSelected ? '#F59E0B' : strokeColor}
                        strokeWidth={isSelected ? 3 : 1.5}
                        filter="url(#markerShadow)"
                      />

                      {/* Zone Short Name */}
                      <text
                        x="0"
                        y="-12"
                        textAnchor="middle"
                        fill="#CBD5E1"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {stat.shortName}
                      </text>

                      {/* Percentage & Makes / Total */}
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fill={fillColor}
                        fontSize="17"
                        fontWeight="800"
                      >
                        {stat.attempts > 0 ? `${stat.percentage}%` : '-'}
                      </text>

                      <text
                        x="0"
                        y="23"
                        textAnchor="middle"
                        fill="#94A3B8"
                        fontSize="10"
                        fontWeight="500"
                      >
                        {stat.made}/{stat.attempts} tiros
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* VIEW MODE: Heatmap (Radial heat density around shots) */}
          {viewMode === 'heatmap' && (
            <g id="shot-heatmap" opacity="0.75" style={{ mixBlendMode: 'screen' }}>
              {displayedShots.map((shot) => {
                const cx = (shot.x / 100) * 1000;
                const cy = (shot.y / 100) * 933;
                return (
                  <circle
                    key={`heat-${shot.id}`}
                    cx={cx}
                    cy={cy}
                    r={shot.made ? 48 : 36}
                    fill={shot.made ? '#10B981' : '#EF4444'}
                    opacity={shot.made ? 0.38 : 0.25}
                    filter="blur(16px)"
                  />
                );
              })}
            </g>
          )}

          {/* VIEW MODE: Individual Shot Markers */}
          <g id="shot-markers">
            {displayedShots.map((shot, idx) => {
              const cx = (shot.x / 100) * 1000;
              const cy = (shot.y / 100) * 933;
              const isRecent = idx === displayedShots.length - 1;
              const player = getPlayerById(shot.playerId);

              return (
                <g
                  key={shot.id}
                  className="shot-marker cursor-pointer transition-transform hover:scale-125"
                  onMouseEnter={() => setHoveredShot(shot)}
                  onMouseLeave={() => setHoveredShot(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShotResult(shot.id);
                  }}
                >
                  {/* Subtle ring pulse for very last shot */}
                  {isRecent && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r="16"
                      fill="none"
                      stroke={shot.made ? '#34D399' : '#F87171'}
                      strokeWidth="1.5"
                      opacity="0.8"
                      className="animate-ping"
                    />
                  )}

                  {shot.made ? (
                    // Made shot marker: Vibrant emerald green circle with white check
                    <g filter="url(#markerShadow)">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9.5"
                        fill="#10B981"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      {/* Checkmark icon inside */}
                      <path
                        d={`M ${cx - 3.5} ${cy} L ${cx - 1} ${cy + 3} L ${cx + 4} ${cy - 3}`}
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  ) : (
                    // Missed shot marker: Bold Red 'X'
                    <g filter="url(#markerShadow)">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9.5"
                        fill="#EF4444"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                      <line
                        x1={cx - 3.5}
                        y1={cy - 3.5}
                        x2={cx + 3.5}
                        y2={cy + 3.5}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1={cx + 3.5}
                        y1={cy - 3.5}
                        x2={cx - 3.5}
                        y2={cy + 3.5}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Hover Crosshair & Distance live preview */}
          {hoverCoords && (
            <g id="crosshair-preview" pointerEvents="none">
              <circle
                cx={(hoverCoords.x / 100) * 1000}
                cy={(hoverCoords.y / 100) * 933}
                r="12"
                fill="none"
                stroke={hoverCoords.isThree ? '#38BDF8' : '#F59E0B'}
                strokeWidth="2"
                strokeDasharray="4 3"
                opacity="0.85"
              />
              <circle
                cx={(hoverCoords.x / 100) * 1000}
                cy={(hoverCoords.y / 100) * 933}
                r="3"
                fill="#FFFFFF"
              />
            </g>
          )}
        </svg>

        {/* Floating Shot Tooltip when hovering over a marker */}
        {hoveredShot && (
          <div
            className="absolute z-20 pointer-events-auto bg-slate-950/95 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs shadow-2xl backdrop-blur-md transition-all -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${hoveredShot.x}%`,
              top: `${hoveredShot.y}%`,
            }}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${hoveredShot.made ? 'bg-emerald-400' : 'bg-rose-500'}`}
              />
              <span>{hoveredShot.made ? '¡Anotado!' : 'Fallado'}</span>
              <span className="text-slate-400 font-normal">
                {getPlayerById(hoveredShot.playerId)?.name || 'Jugador'}
              </span>
            </div>
            <div className="text-slate-300 text-[11px] space-y-0.5">
              <p>
                Zona: <strong className="text-amber-400">{hoveredShot.zoneName}</strong>
              </p>
              <p>
                Distancia: <span className="text-white font-mono">{hoveredShot.distanceMeters}m</span>{' '}
                ({hoveredShot.isThree ? 'Triple • 3 pts' : 'Doble • 2 pts'})
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleShotResult(hoveredShot.id);
                }}
                className="text-amber-400 hover:text-amber-300 text-[10px] font-semibold underline"
              >
                Cambiar a {hoveredShot.made ? 'Fallo' : 'Acierto'}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteShot(hoveredShot.id);
                  setHoveredShot(null);
                }}
                className="text-rose-400 hover:text-rose-300 text-[10px] font-semibold flex items-center gap-0.5 ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Borrar
              </button>
            </div>
          </div>
        )}

        {/* Live Cursor Distance Badge in Bottom Corner */}
        {hoverCoords && (
          <div className="absolute bottom-3 right-3 pointer-events-none bg-slate-950/90 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs font-mono shadow-lg flex items-center gap-2">
            <span className={hoverCoords.isThree ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
              {hoverCoords.isThree ? '3PT' : '2PT'}
            </span>
            <span className="text-slate-300">{hoverCoords.distance}m</span>
          </div>
        )}
      </div>

      {/* Legend & Quick Instructions Bottom Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">
              ✓
            </span>
            <span className="text-slate-300">Acierto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 flex items-center justify-center text-[8px] text-white font-bold">
              ✕
            </span>
            <span className="text-slate-300">Fallo</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 hidden sm:inline">
            Toca la cancha para registrar un tiro • Clic en marcador para invertir resultado
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
              <Flame className="w-3 h-3" /> Zona Caliente
            </span>
            <span className="flex items-center gap-1 text-blue-400 text-[11px] font-medium">
              <Snowflake className="w-3 h-3" /> Fría
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
