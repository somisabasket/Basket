import React from 'react';
import { PlayCircle, RotateCcw, Trash2, AlertTriangle, X, Check, Users } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmNewGame: () => void;
  onResetFactoryData: () => void;
  shotsCount: number;
  playersCount: number;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onConfirmNewGame,
  onResetFactoryData,
  shotsCount,
  playersCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold border border-amber-500/30">
              🏀
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Nuevo Partido / Empezar de Nuevo
              </h3>
              <p className="text-xs text-slate-400">
                Limpia la cancha para comenzar a registrar un nuevo juego o entrenamiento
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary Pill */}
        <div className="px-5 py-3 bg-slate-950 border-b border-slate-800/80 flex items-center justify-around text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>{playersCount} Jugadores en plantilla</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-orange-400 font-bold">●</span>
            <span>{shotsCount} Tiros registrados</span>
          </div>
        </div>

        {/* Action Options */}
        <div className="p-4 sm:p-5 space-y-3">
          {/* Main Action: New Match (Keep Players) */}
          <button
            type="button"
            id="modal-confirm-new-game-btn"
            onClick={() => {
              onConfirmNewGame();
              onClose();
            }}
            className="w-full text-left p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-2 border-amber-500 hover:border-amber-400 hover:bg-amber-500/20 transition-all group flex items-start gap-3.5 shadow-md"
          >
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black shrink-0 group-hover:scale-105 transition-transform mt-0.5">
              <PlayCircle className="w-5 h-5 fill-slate-950 text-amber-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                  Iniciar Nuevo Partido (Limpiar Tiros)
                </span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  Recomendado
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Borra todos los tiros de la cancha y reinicia las estadísticas de tiro, rebotes, asistencias y pérdidas a cero.
                <strong className="text-amber-400 block mt-0.5">✓ Mantiene tu lista de jugadores intacta para el nuevo partido.</strong>
              </p>
            </div>
          </button>

          {/* Danger Zone: Factory Reset */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Restablecer todo a los datos iniciales de fábrica (Curry, Doncic, Giannis)? Perderás los jugadores que hayas añadido.')) {
                  onResetFactoryData();
                  onClose();
                }
              }}
              className="w-full text-left p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-300 text-xs flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold">Restablecer Todo a Valores de Demostración</span>
              </div>
              <span className="text-[10px] text-rose-400/80 font-mono">Borrar todo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
