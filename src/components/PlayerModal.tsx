import React, { useState, useEffect } from 'react';
import { Player, PlayerPosition, Handedness } from '../types';
import { X, UserPlus, Trash2 } from 'lucide-react';

interface PlayerModalProps {
  playerToEdit?: Player | null;
  onSavePlayer: (playerData: Omit<Player, 'createdAt'> & { id?: string }) => void;
  onDeletePlayer?: (playerId: string) => void;
  onClose: () => void;
}

const POSITIONS: PlayerPosition[] = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];
const HANDS: Handedness[] = ['Diestro', 'Zurdo', 'Ambidiestro'];
const COLOR_OPTIONS = [
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const PlayerModal: React.FC<PlayerModalProps> = ({
  playerToEdit,
  onSavePlayer,
  onDeletePlayer,
  onClose,
}) => {
  const [name, setName] = useState(playerToEdit?.name || '');
  const [numberStr, setNumberStr] = useState<string>(
    playerToEdit ? String(playerToEdit.number) : ''
  );
  const [position, setPosition] = useState<PlayerPosition>(playerToEdit?.position || 'Base');
  const [handedness, setHandedness] = useState<Handedness>(playerToEdit?.handedness || 'Diestro');
  const [avatarColor, setAvatarColor] = useState(
    playerToEdit?.avatarColor || COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]
  );

  // Sync state whenever playerToEdit changes or when opening modal in create mode
  useEffect(() => {
    if (playerToEdit) {
      setName(playerToEdit.name);
      setNumberStr(String(playerToEdit.number));
      setPosition(playerToEdit.position);
      setHandedness(playerToEdit.handedness || 'Diestro');
      setAvatarColor(playerToEdit.avatarColor);
    } else {
      setName('');
      setNumberStr('');
      setPosition('Base');
      setHandedness('Diestro');
      setAvatarColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
    }
  }, [playerToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;

    const parsedNumber = parseInt(numberStr.trim(), 10);
    const finalNumber = isNaN(parsedNumber) ? 0 : Math.min(99, Math.max(0, parsedNumber));

    onSavePlayer({
      id: playerToEdit?.id,
      name: cleanName,
      number: finalNumber,
      position,
      handedness,
      avatarColor,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {playerToEdit ? 'Editar Jugador' : 'Agregar Nuevo Jugador'}
              </h3>
              <p className="text-xs text-slate-400">
                {playerToEdit ? 'Modifica los datos del jugador' : 'Añade un jugador a tu equipo'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name & Number row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Completo <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ej. Stephen Curry"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dorsal #</label>
              <input
                type="number"
                min="0"
                max="99"
                placeholder="Ej. 30"
                value={numberStr}
                onChange={(e) => setNumberStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm text-center font-mono focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Posición en Cancha</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => setPosition(pos)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    position === pos
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Handedness */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Mano Hábil</label>
            <div className="grid grid-cols-3 gap-2">
              {HANDS.map((hand) => (
                <button
                  key={hand}
                  type="button"
                  onClick={() => setHandedness(hand)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    handedness === hand
                      ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {hand}
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Color */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Color del Jugador</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    avatarColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {playerToEdit && onDeletePlayer ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Eliminar al jugador ${playerToEdit.name}?`)) {
                    onDeletePlayer(playerToEdit.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-500/10 font-semibold"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-950/40"
              >
                {playerToEdit ? 'Guardar Cambios' : 'Crear Jugador'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
