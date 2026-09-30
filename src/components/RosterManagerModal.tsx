import React, { useState, useRef } from 'react';
import { Player, PlayerPosition, Handedness } from '../types';
import {
  X,
  Users,
  UserPlus,
  Plus,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  PLAYER_COLORS,
  parseBulkPlayersText,
  exportPlayersToCsv,
  importPlayersFromCsv,
  INITIAL_PLAYERS,
} from '../utils/storage';

interface RosterManagerModalProps {
  players: Player[];
  onSavePlayers: (players: Player[]) => void;
  onClose: () => void;
  onEditIndividualPlayer?: (player: Player) => void;
  onAddNewPlayer?: () => void;
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

export const RosterManagerModal: React.FC<RosterManagerModalProps> = ({
  players,
  onSavePlayers,
  onClose,
  onEditIndividualPlayer,
  onAddNewPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'bulk' | 'import_export'>('roster');
  const [bulkText, setBulkText] = useState<string>('');
  const [bulkMode, setBulkMode] = useState<'append' | 'replace'>('append');
  const [previewBulk, setPreviewBulk] = useState<Player[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const fileInputCsvRef = useRef<HTMLInputElement>(null);

  // Quick inline add state
  const [quickName, setQuickName] = useState<string>('');
  const [quickNumber, setQuickNumber] = useState<string>('');
  const [quickPos, setQuickPos] = useState<PlayerPosition>('Base');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleQuickAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = quickName.trim();
    if (!cleanName) return;

    const parsedNum = parseInt(quickNumber.trim(), 10);
    const validNum = isNaN(parsedNum) ? 0 : Math.min(99, Math.max(0, parsedNum));

    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: cleanName,
      number: validNum,
      position: quickPos,
      avatarColor: COLOR_OPTIONS[players.length % COLOR_OPTIONS.length] || '#F59E0B',
      createdAt: Date.now(),
    };

    onSavePlayers([...players, newPlayer]);
    showNotification(`¡Jugador "${newPlayer.name}" (#${newPlayer.number}) añadido a la plantilla!`);
    setQuickName('');
    setQuickNumber('');
  };

  // Preview bulk input on text change
  const handleBulkTextChange = (text: string) => {
    setBulkText(text);
    if (text.trim().length > 0) {
      const parsed = parseBulkPlayersText(text, players.length);
      setPreviewBulk(parsed);
    } else {
      setPreviewBulk([]);
    }
  };

  // Execute bulk load
  const handleApplyBulk = () => {
    if (previewBulk.length === 0) return;

    if (bulkMode === 'replace') {
      if (
        confirm(
          `¿Reemplazar los ${players.length} jugadores actuales con los ${previewBulk.length} nuevos?`
        )
      ) {
        onSavePlayers(previewBulk);
        showNotification(`¡Se cargaron ${previewBulk.length} jugadores en tu plantilla!`);
        setBulkText('');
        setPreviewBulk([]);
        setActiveTab('roster');
      }
    } else {
      const merged = [...players, ...previewBulk];
      onSavePlayers(merged);
      showNotification(`¡Se añadieron ${previewBulk.length} jugadores a tu plantilla!`);
      setBulkText('');
      setPreviewBulk([]);
      setActiveTab('roster');
    }
  };

  // Delete individual player
  const handleDeletePlayer = (id: string, name: string) => {
    if (confirm(`¿Eliminar al jugador "${name}" de la plantilla?`)) {
      const updated = players.filter((p) => p.id !== id);
      onSavePlayers(updated);
      showNotification(`Jugador "${name}" eliminado.`);
    }
  };

  // Clear all players
  const handleClearAll = () => {
    if (
      confirm(
        '¿Deseas vaciar toda la plantilla para comenzar a cargar tus propios jugadores desde cero?'
      )
    ) {
      onSavePlayers([]);
      showNotification('Plantilla vaciada. Ahora puedes cargar tus propios jugadores.');
    }
  };

  // Reset to default sample
  const handleResetToSample = () => {
    if (confirm('¿Cargar los jugadores de ejemplo (Curry, Doncic, Giannis)?')) {
      onSavePlayers(INITIAL_PLAYERS);
      showNotification('Plantilla de ejemplo cargada.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const csvData = exportPlayersToCsv(players);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plantilla_jugadores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Plantilla descargada en archivo CSV.');
  };

  // Import CSV
  const handleImportCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importPlayersFromCsv(text);
        if (imported.length > 0) {
          const mode = confirm(
            `Se encontraron ${imported.length} jugadores en el archivo CSV.\n\n¿Deseas reemplazar la plantilla actual? (Aceptar = Reemplazar, Cancelar = Añadir a los existentes)`
          );
          if (mode) {
            onSavePlayers(imported);
          } else {
            onSavePlayers([...players, ...imported]);
          }
          showNotification(`¡${imported.length} jugadores importados exitosamente!`);
          setActiveTab('roster');
        } else {
          alert('No se pudieron encontrar jugadores válidos en el archivo CSV.');
        }
      } catch {
        alert('Error al leer el archivo CSV.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load sample bulk template
  const handleLoadSampleTemplate = () => {
    const sample = `#4 Facundo Campazzo - Base
#7 Nicolás Laprovíttola - Escolta
#8 Patricio Garino - Alero
#12 Marcos Delía - Pívot
#29 Gabriel Deck - Ala-Pívot
#11 José Vildoza - Base
#14 Luca Vildoza - Escolta`;
    handleBulkTextChange(sample);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Gestionar Mis Jugadores
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Carga, edita o importa tu plantilla para registrar tiros
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all min-h-[40px] ${
              activeTab === 'roster'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mi Plantilla ({players.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bulk')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all min-h-[40px] ${
              activeTab === 'bulk'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Carga Rápida / Masiva</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import_export')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all min-h-[40px] ${
              activeTab === 'import_export'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel / CSV</span>
          </button>
        </div>

        {/* Notification Pill */}
        {notification && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ROSTER LIST */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                {onAddNewPlayer && (
                  <button
                    type="button"
                    onClick={onAddNewPlayer}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all active:scale-95 min-h-[44px]"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Agregar Jugador Individual</span>
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bulk')}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors min-h-[44px]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pegar Lista Completa</span>
                  </button>

                  {players.length > 0 ? (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl transition-colors min-h-[44px]"
                      title="Borrar todos para cargar tus propios jugadores"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Vaciar Plantilla</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetToSample}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors min-h-[44px]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span>Cargar Jugadores de Prueba</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Quick Add Form - Instant addition without extra modal */}
              <form
                onSubmit={handleQuickAddPlayer}
                className="bg-slate-950/80 p-3 sm:p-3.5 rounded-xl border border-amber-500/30 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Jugador Rápido</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="Nombre y Apellido (ej. Luka Doncic)"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      placeholder="Dorsal #"
                      value={quickNumber}
                      onChange={(e) => setQuickNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs text-center font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={quickPos}
                      onChange={(e) => setQuickPos(e.target.value as PlayerPosition)}
                      className="w-full px-2 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={!quickName.trim()}
                      className="w-full px-3 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-1 min-h-[34px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Player list */}
              {players.length === 0 ? (
                <div className="text-center py-10 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-xl">
                    🏀
                  </div>
                  <h4 className="text-sm font-bold text-white">Tu plantilla está vacía</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Puedes agregar tus jugadores uno a uno, pegar la lista completa de tu equipo o importar desde un archivo Excel/CSV.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {onAddNewPlayer && (
                      <button
                        type="button"
                        onClick={onAddNewPlayer}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow min-h-[44px]"
                      >
                        + Crear Primer Jugador
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveTab('bulk')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 min-h-[44px]"
                    >
                      Pegar Lista de Mi Equipo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shrink-0 shadow-inner"
                          style={{ backgroundColor: player.avatarColor }}
                        >
                          #{player.number}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{player.name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                              {player.position}
                            </span>
                            <span>• {player.handedness || 'Diestro'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => onEditIndividualPlayer(player)}
                          title="Editar jugador"
                          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlayer(player.id, player.name)}
                          title="Eliminar jugador"
                          className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BULK LOAD */}
          {activeTab === 'bulk' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Carga Rápida de Plantilla Completa
                  </h4>
                  <button
                    type="button"
                    onClick={handleLoadSampleTemplate}
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                  >
                    Ver ejemplo de formato
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Escribe o pega la lista de jugadores de tu equipo (un jugador por línea). El sistema detecta automáticamente el dorsal, nombre y posición.
                </p>
                <div className="text-[11px] font-mono text-slate-500 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  Formatos válidos: <span className="text-slate-300">#10 Stephen Curry - Base</span> ó{' '}
                  <span className="text-slate-300">23 LeBron James</span> ó{' '}
                  <span className="text-slate-300">Juan Pérez, 7, Escolta</span>
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pega aquí la lista de tu equipo:
                </label>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => handleBulkTextChange(e.target.value)}
                  placeholder={`#4 Facundo Campazzo - Base\n#7 Nicolás Laprovíttola - Escolta\n#8 Patricio Garino - Alero\n#12 Marcos Delía - Pívot\n#29 Gabriel Deck - Ala-Pívot`}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
              </div>

              {/* Mode: Append or Replace */}
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Modo de guardado:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="bulkMode"
                    checked={bulkMode === 'append'}
                    onChange={() => setBulkMode('append')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>Añadir a la plantilla existente</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="bulkMode"
                    checked={bulkMode === 'replace'}
                    onChange={() => setBulkMode('replace')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-rose-300">Reemplazar plantilla actual</span>
                </label>
              </div>

              {/* Preview of Parsed Players */}
              {previewBulk.length > 0 && (
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Se detectaron {previewBulk.length} jugadores:
                    </span>
                  </div>

                  <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                    {previewBulk.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-slate-950 shrink-0"
                          style={{ backgroundColor: p.avatarColor }}
                        >
                          #{p.number}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.position}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyBulk}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-98 min-h-[44px]"
                  >
                    Confirmar y Guardar {previewBulk.length} Jugadores en Mi Plantilla
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: IMPORT / EXPORT EXCEL & CSV */}
          {activeTab === 'import_export' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" /> Compatibilidad con Excel y Hojas de Cálculo
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Puedes exportar la lista de jugadores a un archivo CSV para editarla en Microsoft Excel o Google Sheets, y luego volver a importarla cuando quieras.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Export Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Exportar a CSV / Excel</h5>
                      <span className="text-[11px] text-slate-400">{players.length} jugadores</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Descarga un archivo .csv con los dorsales, nombres y posiciones de tu plantilla.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={players.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-colors min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar Plantilla (.csv)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">Importar desde CSV</h5>
                      <span className="text-[11px] text-slate-400">Desde tu computadora o tablet</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Carga un archivo .csv previamente guardado o creado en Excel con tu lista de jugadores.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputCsvRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors min-h-[44px]"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo CSV</span>
                  </button>
                  <input
                    ref={fileInputCsvRef}
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleImportCsvFile}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Plantilla guardada automáticamente en tu dispositivo
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow min-h-[44px] transition-all"
          >
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
