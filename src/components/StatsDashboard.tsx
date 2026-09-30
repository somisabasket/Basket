import React, { useState } from 'react';
import { Player, Shot, ShotZoneId, ZoneStat, PlayerOverallStats, PlayerGameStats } from '../types';
import { calculatePlayerLeaderboard } from '../utils/statsCalculator';
import {
  Activity,
  Flame,
  Snowflake,
  Crosshair,
  BarChart3,
  ListOrdered,
  History,
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Shield,
  Target,
  AlertTriangle,
  Award,
} from 'lucide-react';

interface StatsDashboardProps {
  overallStats: PlayerOverallStats;
  zoneStats: ZoneStat[];
  players: Player[];
  shots: Shot[];
  playerStats?: Record<string, PlayerGameStats>;
  activePlayerId: string | 'all';
  selectedZoneFilter: ShotZoneId | null;
  onSelectZoneFilter: (zone: ShotZoneId | null) => void;
  onDeleteShot: (shotId: string) => void;
  onToggleShotResult: (shotId: string) => void;
  onUpdatePlayerStat?: (playerId: string, statKey: 'rebounds' | 'assists' | 'turnovers', delta: number) => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  overallStats,
  zoneStats,
  players,
  shots,
  playerStats = {},
  activePlayerId,
  selectedZoneFilter,
  onSelectZoneFilter,
  onDeleteShot,
  onToggleShotResult,
  onUpdatePlayerStat,
}) => {
  const [activeTab, setActiveTab] = useState<'zones' | 'ranking' | 'history'>('zones');
  const leaderboard = calculatePlayerLeaderboard(shots, players, playerStats);

  const filteredRecentShots = shots
    .filter((s) => {
      if (activePlayerId !== 'all' && s.playerId !== activePlayerId) return false;
      if (selectedZoneFilter && s.zoneId !== selectedZoneFilter) return false;
      return true;
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  const getPlayerName = (id: string) => {
    return players.find((p) => p.id === id)?.name || 'Jugador';
  };

  const handleQuickStat = (statKey: 'rebounds' | 'assists' | 'turnovers', delta: number, targetPlayerId?: string) => {
    if (!onUpdatePlayerStat) return;
    const target = targetPlayerId || (activePlayerId !== 'all' ? activePlayerId : players[0]?.id);
    if (target) {
      onUpdatePlayerStat(target, statKey, delta);
    }
  };

  return (
    <div className="flex flex-col w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* KPI Cards Grid */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {overallStats.playerName}
              </h2>
              {overallStats.playerNumber > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono font-bold">
                  #{overallStats.playerNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Estadísticas integrales de tiros, rebotes, asistencias y control de balón
            </p>
          </div>

          {/* Current streak badge */}
          <div className="flex items-center gap-2 flex-wrap">
            {overallStats.streak !== 0 && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  overallStats.streak > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {overallStats.streak > 0 ? (
                  <>
                    <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>Racha: {overallStats.streak} anotados</span>
                  </>
                ) : (
                  <>
                    <Snowflake className="w-4 h-4 text-rose-400" />
                    <span>Racha: {Math.abs(overallStats.streak)} fallos</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Box Score Stats: REBOTES, ASISTENCIAS, PÉRDIDAS, RATIO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
          {/* REBOTES */}
          <div className="p-3 bg-gradient-to-b from-sky-950/40 to-slate-900 border border-sky-500/30 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Rebotes (REB)
              </span>
              {onUpdatePlayerStat && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={overallStats.rebounds <= 0}
                    onClick={() => handleQuickStat('rebounds', -1)}
                    className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 text-xs font-bold transition-colors"
                    title="Restar 1 rebote"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStat('rebounds', 1)}
                    className="px-1.5 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[10px] font-bold transition-all active:scale-95"
                    title="Sumar 1 rebote (+1)"
                  >
                    +1
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-white font-mono">
                {overallStats.rebounds}
              </span>
              <span className="text-xs text-sky-300/80 font-medium">capturas</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Control en la pintura
            </span>
          </div>

          {/* ASISTENCIAS */}
          <div className="p-3 bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5" /> Asistencias (AST)
              </span>
              {onUpdatePlayerStat && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={overallStats.assists <= 0}
                    onClick={() => handleQuickStat('assists', -1)}
                    className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 text-xs font-bold transition-colors"
                    title="Restar 1 asistencia"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStat('assists', 1)}
                    className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold transition-all active:scale-95"
                    title="Sumar 1 asistencia (+1)"
                  >
                    +1
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-white font-mono">
                {overallStats.assists}
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">pases clave</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Creación de juego
            </span>
          </div>

          {/* PÉRDIDAS */}
          <div className="p-3 bg-gradient-to-b from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-xl relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Pérdidas (PÉR)
              </span>
              {onUpdatePlayerStat && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={overallStats.turnovers <= 0}
                    onClick={() => handleQuickStat('turnovers', -1)}
                    className="w-5 h-5 rounded flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 text-xs font-bold transition-colors"
                    title="Restar 1 pérdida"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickStat('turnovers', 1)}
                    className="px-1.5 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold transition-all active:scale-95"
                    title="Sumar 1 pérdida (+1)"
                  >
                    +1
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-3xl font-black text-white font-mono">
                {overallStats.turnovers}
              </span>
              <span className="text-xs text-rose-300/80 font-medium">turnovers</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Control de posesión
            </span>
          </div>

          {/* RATIO AST / TO */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Ratio AST / PÉR
            </span>
            <div className="flex items-baseline gap-1.5 mt-1.5">
              <span className="text-3xl font-black text-amber-300 font-mono">
                {overallStats.astToRatio}
              </span>
              <span className="text-xs text-slate-400 font-medium">x</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {overallStats.turnovers === 0
                ? '0 pérdidas (impecable)'
                : overallStats.astToRatio >= 2
                ? 'Excelente balance'
                : overallStats.astToRatio >= 1
                ? 'Balance positivo'
                : 'Cuidar posesión'}
            </span>
          </div>
        </div>

        {/* 5 KPI Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* FG% */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Tiros de Campo (FG%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono">
                {overallStats.totalPercentage}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {overallStats.totalMade}/{overallStats.totalAttempts}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, overallStats.totalPercentage)}%` }}
              />
            </div>
          </div>

          {/* 2PT% */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Tiros de 2 (2PT%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {overallStats.twoPercentage}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {overallStats.twoMade}/{overallStats.twoAttempts}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, overallStats.twoPercentage)}%` }}
              />
            </div>
          </div>

          {/* 3PT% */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Triples (3PT%)
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {overallStats.threePercentage}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {overallStats.threeMade}/{overallStats.threeAttempts}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, overallStats.threePercentage)}%` }}
              />
            </div>
          </div>

          {/* Points */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Puntos Generados
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {overallStats.totalPoints}
              </span>
              <span className="text-xs text-slate-400 font-medium">pts</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              {(overallStats.twoMade * 2)}p en 2PT + {(overallStats.threeMade * 3)}p en 3PT
            </span>
          </div>

          {/* eFG% */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
              Efectividad eFG%
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-indigo-400 font-mono">
                {overallStats.effectiveFgPercentage}%
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Ponderación de triples
            </span>
          </div>
        </div>

        {/* Hot & Cold Zone highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Flame className="w-4 h-4 fill-emerald-400" />
            </div>
            <div>
              <span className="text-emerald-400 font-bold block">Zona Más Efectiva</span>
              <span className="text-slate-200">
                {overallStats.bestZone
                  ? `${overallStats.bestZone.name} (${overallStats.bestZone.percentage}% con ${overallStats.bestZone.attempts} tiros)`
                  : 'Registra al menos 2 tiros en una zona'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Snowflake className="w-4 h-4" />
            </div>
            <div>
              <span className="text-blue-400 font-bold block">Zona a Mejorar</span>
              <span className="text-slate-200">
                {overallStats.coldZone
                  ? `${overallStats.coldZone.name} (${overallStats.coldZone.percentage}% con ${overallStats.coldZone.attempts} tiros)`
                  : 'Sin suficientes datos de fallo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar: Zones Breakdown vs Ranking vs Shot History */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('zones')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'zones'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Por Zonas ({zoneStats.filter((z) => z.attempts > 0).length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ranking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ranking'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Ranking de Jugadores</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({filteredRecentShots.length})</span>
          </button>
        </div>

        {selectedZoneFilter && (
          <button
            type="button"
            onClick={() => onSelectZoneFilter(null)}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
          >
            <Filter className="w-3 h-3" /> Quitar filtro
          </button>
        )}
      </div>

      {/* TAB 1: Zones Breakdown */}
      {activeTab === 'zones' && (
        <div className="p-4 space-y-2 max-h-96 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {zoneStats.map((stat) => {
              const isSelected = selectedZoneFilter === stat.zoneId;

              let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
              let barColor = 'bg-slate-600';

              if (stat.attempts > 0) {
                if (stat.efficiencyRating === 'hot') {
                  badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                  barColor = 'bg-emerald-500';
                } else if (stat.efficiencyRating === 'neutral') {
                  badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                  barColor = 'bg-amber-500';
                } else {
                  badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                  barColor = 'bg-blue-500';
                }
              }

              return (
                <div
                  key={stat.zoneId}
                  onClick={() => onSelectZoneFilter(isSelected ? null : stat.zoneId)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          stat.isThree ? 'bg-cyan-500/20 text-cyan-400' : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {stat.isThree ? '3PT' : '2PT'}
                      </span>
                      <span className="text-xs font-bold text-white truncate">{stat.name}</span>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-lg border text-xs font-mono font-bold shrink-0 ${badgeColor}`}
                    >
                      {stat.attempts > 0 ? `${stat.percentage}%` : '0%'}
                    </div>
                  </div>

                  {/* Progress bar and details */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {stat.made} anotados / {stat.attempts} tiros
                    </span>
                    <span>
                      {stat.points} pts • {stat.pctOfTotalAttempts}% vol.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Player Leaderboard / Ranking */}
      {activeTab === 'ranking' && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Jugador</th>
                  <th className="py-2.5 px-2 text-right">PTS</th>
                  <th className="py-2.5 px-2 text-center text-sky-400 font-bold">REB</th>
                  <th className="py-2.5 px-2 text-center text-emerald-400 font-bold">AST</th>
                  <th className="py-2.5 px-2 text-center text-rose-400 font-bold">PÉR</th>
                  <th className="py-2.5 px-2 text-center text-amber-300 font-bold">AST/TO</th>
                  <th className="py-2.5 px-2 text-center">FG%</th>
                  <th className="py-2.5 px-2 text-center">Tiros</th>
                  <th className="py-2.5 px-2 text-center">3PT%</th>
                  <th className="py-2.5 px-2 text-center">eFG%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {leaderboard.map((item, index) => (
                  <tr
                    key={item.player.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono font-bold w-4">{index + 1}.</span>
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-slate-950 shrink-0"
                          style={{ backgroundColor: item.player.avatarColor }}
                        >
                          #{item.player.number}
                        </div>
                        <span className="font-bold text-white truncate max-w-[110px]">
                          {item.player.name}
                        </span>
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-2.5 px-2 text-right font-bold text-amber-400 font-mono text-sm">
                      {item.points}
                    </td>

                    {/* REB */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-bold text-sky-400">{item.rebounds}</span>
                        {onUpdatePlayerStat && (
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(item.player.id, 'rebounds', 1)}
                            className="w-4 h-4 rounded bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                            title={`+1 Rebote a ${item.player.name}`}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </td>

                    {/* AST */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-bold text-emerald-400">{item.assists}</span>
                        {onUpdatePlayerStat && (
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(item.player.id, 'assists', 1)}
                            className="w-4 h-4 rounded bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                            title={`+1 Asistencia a ${item.player.name}`}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </td>

                    {/* TO */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span className="font-bold text-rose-400">{item.turnovers}</span>
                        {onUpdatePlayerStat && (
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(item.player.id, 'turnovers', 1)}
                            className="w-4 h-4 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 flex items-center justify-center text-[10px] font-bold cursor-pointer"
                            title={`+1 Pérdida a ${item.player.name}`}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </td>

                    {/* AST/TO */}
                    <td className="py-2.5 px-2 text-center text-amber-300 font-semibold">
                      {item.astToRatio}
                    </td>

                    {/* FG% */}
                    <td className="py-2.5 px-2 text-center">
                      <span className="font-bold text-white">{item.percentage}%</span>
                    </td>

                    {/* Tiros */}
                    <td className="py-2.5 px-2 text-center text-slate-400 text-[11px]">
                      {item.made}/{item.attempts}
                    </td>

                    {/* 3PT% */}
                    <td className="py-2.5 px-2 text-center">
                      <span className="text-cyan-400 font-medium">{item.threePercentage}%</span>
                    </td>

                    {/* eFG% */}
                    <td className="py-2.5 px-2 text-center text-indigo-300 font-medium">
                      {item.eFG}%
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Shot History / Log */}
      {activeTab === 'history' && (
        <div className="p-4 max-h-96 overflow-y-auto space-y-2">
          {filteredRecentShots.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No hay tiros registrados con los filtros actuales.
            </div>
          ) : (
            filteredRecentShots.map((shot) => (
              <div
                key={shot.id}
                className="flex items-center justify-between gap-3 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {shot.made ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{getPlayerName(shot.playerId)}</span>
                      <span
                        className={`font-semibold ${shot.made ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        {shot.made ? 'Anotado' : 'Fallado'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {shot.zoneName} • {shot.distanceMeters}m ({shot.isThree ? '3PT' : '2PT'})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleShotResult(shot.id)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800"
                  >
                    Invertir
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteShot(shot.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800"
                    title="Eliminar tiro"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
