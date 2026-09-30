import React, { useEffect, useState } from 'react';
import { Player, ShotType, ShotZoneId } from '../types';
import { calculateShotDetails } from '../utils/courtGeometry';
import { Check, X, Shield, Crosshair } from 'lucide-react';

interface ShotModalProps {
  coords: { x: number; y: number } | null;
  players: Player[];
  activePlayerId: string | 'all';
  onConfirmShot: (shotData: {
    x: number;
    y: number;
    made: boolean;
    playerId: string;
    shotType?: ShotType;
  }) => void;
  onClose: () => void;
}

const SHOT_TYPES: { id: ShotType; label: string }[] = [
  { id: 'jump_shot', label: 'Tiro en Suspensión' },
  { id: 'catch_and_shoot', label: 'Catch & Shoot' },
  { id: 'pull_up', label: 'Pull-Up Jumper' },
  { id: 'step_back', label: 'Step Back' },
  { id: 'layup', label: 'Bandeja' },
  { id: 'floater', label: 'Flotadora / Bomba' },
  { id: 'dunk', label: 'Volcada / Mate' },
  { id: 'hook', label: 'Gancho' },
];

export const ShotModal: React.FC<ShotModalProps> = ({
  coords,
  players,
  activePlayerId,
  onConfirmShot,
  onClose,
}) => {
  if (!coords) return null;

  const details = calculateShotDetails(coords.x, coords.y);
  const defaultPlayerId = activePlayerId !== 'all' ? activePlayerId : (players[0]?.id || '');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(defaultPlayerId);
  const [selectedShotType, setSelectedShotType] = useState<ShotType>(
    details.distanceMeters <= 2.2 ? 'layup' : 'jump_shot'
  );

  useEffect(() => {
    setSelectedPlayerId(defaultPlayerId);
  }, [defaultPlayerId]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        handleShot(true);
      } else if (e.key === '2' || e.key === 'f' || e.key === 'F') {
        handleShot(false);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [coords, selectedPlayerId, selectedShotType]);

  const handleShot = (made: boolean) => {
    if (!coords) return;
    onConfirmShot({
      x: coords.x,
      y: coords.y,
      made,
      playerId: selectedPlayerId,
      shotType: selectedShotType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Registrar Tiro</h3>
              <p className="text-xs text-slate-400">
                {details.zoneName} •{' '}
                <span className="font-mono text-amber-400 font-semibold">{details.distanceMeters}m</span>{' '}
                ({details.isThree ? 'Triple • 3 pts' : 'Doble • 2 pts'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Jugador Lanzador
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {players.map((player) => {
              const isSelected = selectedPlayerId === player.id;
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(player.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 text-slate-950"
                    style={{ backgroundColor: player.avatarColor }}
                  >
                    #{player.number}
                  </span>
                  <span className="text-xs font-medium truncate">{player.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shot Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Tipo de Tiro (Opcional)
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {SHOT_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedShotType(type.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  selectedShotType === type.id
                    ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons: Made / Miss */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            id="shot-modal-make-btn"
            onClick={() => handleShot(true)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>¡ANOTÓ! 🏀</span>
            <span className="hidden sm:inline text-xs opacity-75 font-mono">(A / 1)</span>
          </button>

          <button
            type="button"
            id="shot-modal-miss-btn"
            onClick={() => handleShot(false)}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
            <span>FALLÓ ❌</span>
            <span className="hidden sm:inline text-xs opacity-75 font-mono">(F / 2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
