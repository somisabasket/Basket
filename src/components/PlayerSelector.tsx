import React from 'react';
import { Player, Shot, PlayerGameStats } from '../types';
import { Users, UserPlus, Edit2, Settings2, Sparkles, Shield, Compass, AlertCircle } from 'lucide-react';

interface PlayerSelectorProps {
  players: Player[];
  shots: Shot[];
  playerStats?: Record<string, PlayerGameStats>;
  activePlayerId: string | 'all';
  onSelectPlayer: (id: string | 'all') => void;
  onOpenNewPlayerModal: () => void;
  onOpenRosterManager: () => void;
  onEditPlayer: (player: Player) => void;
  onUpdatePlayerStat?: (playerId: string, statKey: 'rebounds' | 'assists' | 'turnovers', delta: number) => void;
}

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  players,
  shots,
  playerStats = {},
  activePlayerId,
  onSelectPlayer,
  onOpenNewPlayerModal,
  onOpenRosterManager,
  onEditPlayer,
  onUpdatePlayerStat,
}) => {
  const totalTeamAttempts = shots.length;
  const totalTeamMade = shots.filter((s) => s.made).length;
  const teamFgPct = totalTeamAttempts > 0 ? Math.round((totalTeamMade / totalTeamAttempts) * 100) : 0;

  // Aggregate team stats
  let teamRebounds = 0;
  let teamAssists = 0;
  let teamTurnovers = 0;
  Object.values(playerStats).forEach((ps) => {
    const stat = ps as PlayerGameStats | undefined;
    teamRebounds += stat?.rebounds || 0;
    teamAssists += stat?.assists || 0;
    teamTurnovers += stat?.turnovers || 0;
  });

  const activePlayer = activePlayerId !== 'all' ? players.find((p) => p.id === activePlayerId) : null;
  const activeStats = activePlayerId !== 'all' ? playerStats[activePlayerId] : null;

  const currentRebounds = activePlayerId === 'all' ? teamRebounds : (activeStats?.rebounds || 0);
  const currentAssists = activePlayerId === 'all' ? teamAssists : (activeStats?.assists || 0);
  const currentTurnovers = activePlayerId === 'all' ? teamTurnovers : (activeStats?.turnovers || 0);

  const handleStatChange = (statKey: 'rebounds' | 'assists' | 'turnovers', delta: number) => {
    if (!onUpdatePlayerStat) return;
    if (activePlayerId !== 'all') {
      onUpdatePlayerStat(activePlayerId, statKey, delta);
    } else if (players.length > 0) {
      // Default to first player if in 'all' mode
      onUpdatePlayerStat(players[0].id, statKey, delta);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Users className="w-4 h-4 text-amber-400" />
          <span>Jugador Activo en Cancha:</span>
          {activePlayerId !== 'all' ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 normal-case">
              #{activePlayer?.number} {activePlayer?.name}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 normal-case">
              Todo el Equipo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Main Roster Manager button */}
          <button
            type="button"
            id="manage-roster-btn"
            onClick={onOpenRosterManager}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl shadow-sm transition-all hover:scale-102 active:scale-98 min-h-[38px]"
            title="Administrar o cargar la lista de jugadores de tu equipo"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Gestionar Mis Jugadores</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px]">
              {players.length}
            </span>
          </button>

          {/* Quick single player button */}
          <button
            type="button"
            id="add-player-btn"
            onClick={onOpenNewPlayerModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-all hover:scale-102 active:scale-98 min-h-[38px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nuevo Jugador</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>

      {/* If no players exist */}
      {players.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg shrink-0">
              🏀
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">No tienes jugadores cargados</h4>
              <p className="text-[11px] text-slate-400">
                Carga los jugadores de tu club, escuela o entrenamiento para empezar a registrar tiros.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenRosterManager}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow min-h-[44px] shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Cargar Mis Jugadores Ahora</span>
          </button>
        </div>
      ) : (
        /* Horizontal Scrollable list of players */
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800 touch-pan-x">
          {/* All Players (Team) Option */}
          <button
            type="button"
            id="select-all-players-btn"
            onClick={() => onSelectPlayer('all')}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all min-h-[52px] ${
              activePlayerId === 'all'
                ? 'bg-amber-500/20 border-amber-500 text-white ring-1 ring-amber-500'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 border border-slate-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Todo el Equipo</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {totalTeamMade}/{totalTeamAttempts} • <span className="text-amber-400 font-semibold">{teamFgPct}%</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="text-sky-400 font-semibold">{teamRebounds}R</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{teamAssists}A</span>
                <span>•</span>
                <span className="text-rose-400 font-semibold">{teamTurnovers}TO</span>
              </div>
            </div>
          </button>

          {/* Individual Player Cards */}
          {players.map((player) => {
            const isSelected = activePlayerId === player.id;
            const pShots = shots.filter((s) => s.playerId === player.id);
            const pAttempts = pShots.length;
            const pMade = pShots.filter((s) => s.made).length;
            const pPct = pAttempts > 0 ? Math.round((pMade / pAttempts) * 100) : 0;
            const pStats = playerStats[player.id];
            const pReb = pStats?.rebounds || 0;
            const pAst = pStats?.assists || 0;
            const pTo = pStats?.turnovers || 0;

            return (
              <div
                key={player.id}
                className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left shrink-0 transition-all cursor-pointer min-h-[52px] ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500 text-white ring-1 ring-amber-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
                onClick={() => onSelectPlayer(player.id)}
              >
                {/* Jersey Number Avatar */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 text-slate-950 shadow-inner"
                  style={{ backgroundColor: player.avatarColor }}
                >
                  #{player.number}
                </div>

                {/* Player Info */}
                <div className="pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">
                      {player.name}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-slate-400">
                      {player.position}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                    <span>
                      {pMade}/{pAttempts} • <span className="text-amber-400 font-semibold">{pPct}%</span>
                    </span>
                  </div>
                  {/* Rebounds, Assists, Turnovers summary badge */}
                  <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5">
                    <span className="text-sky-400 font-semibold" title="Rebotes">{pReb}R</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 font-semibold" title="Asistencias">{pAst}A</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400 font-semibold" title="Pérdidas">{pTo}TO</span>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  type="button"
                  title={`Editar datos de ${player.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPlayer(player);
                  }}
                  className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-opacity"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK IN-GAME ACTIONS STRIP: REBOTES, ASISTENCIAS, PÉRDIDAS */}
      {players.length > 0 && onUpdatePlayerStat && (
        <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/40 -mx-1 px-3 py-2 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span className="text-amber-400">⚡</span>
              Acciones en Cancha:
            </span>
            {activePlayer ? (
              <span className="text-xs font-black text-amber-300">
                #{activePlayer.number} {activePlayer.name.split(' ')[0]}
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-300">
                (Selecciona un jugador o anota al equipo)
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* REBOTES */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                disabled={currentRebounds <= 0}
                onClick={() => handleStatChange('rebounds', -1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 text-xs font-bold transition-colors"
                title="Restar 1 rebote (-1)"
              >
                -
              </button>
              <div className="px-2 flex items-center gap-1 text-xs font-bold text-sky-400 font-mono">
                <span className="text-xs">🛡️</span>
                <span className="text-sm font-black">{currentRebounds}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Reb</span>
              </div>
              <button
                type="button"
                onClick={() => handleStatChange('rebounds', 1)}
                className="px-2.5 py-1 flex items-center gap-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                title={`Sumar 1 rebote (+1 REB) a ${activePlayer ? activePlayer.name : 'jugador'}`}
              >
                <span>+1 Reb</span>
              </button>
            </div>

            {/* ASISTENCIAS */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                disabled={currentAssists <= 0}
                onClick={() => handleStatChange('assists', -1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 text-xs font-bold transition-colors"
                title="Restar 1 asistencia (-1)"
              >
                -
              </button>
              <div className="px-2 flex items-center gap-1 text-xs font-bold text-emerald-400 font-mono">
                <span className="text-xs">🎯</span>
                <span className="text-sm font-black">{currentAssists}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Ast</span>
              </div>
              <button
                type="button"
                onClick={() => handleStatChange('assists', 1)}
                className="px-2.5 py-1 flex items-center gap-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                title={`Sumar 1 asistencia (+1 AST) a ${activePlayer ? activePlayer.name : 'jugador'}`}
              >
                <span>+1 Ast</span>
              </button>
            </div>

            {/* PÉRDIDAS */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
              <button
                type="button"
                disabled={currentTurnovers <= 0}
                onClick={() => handleStatChange('turnovers', -1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 text-xs font-bold transition-colors"
                title="Restar 1 pérdida (-1)"
              >
                -
              </button>
              <div className="px-2 flex items-center gap-1 text-xs font-bold text-rose-400 font-mono">
                <span className="text-xs">⚠️</span>
                <span className="text-sm font-black">{currentTurnovers}</span>
                <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">Pérd</span>
              </div>
              <button
                type="button"
                onClick={() => handleStatChange('turnovers', 1)}
                className="px-2.5 py-1 flex items-center gap-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold shadow-sm transition-transform active:scale-95 cursor-pointer"
                title={`Sumar 1 pérdida de balón (+1 PÉR) a ${activePlayer ? activePlayer.name : 'jugador'}`}
              >
                <span>+1 Pérd</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
