import React, { useState, useMemo } from 'react';
import {
  Player,
  Shot,
  ShotZoneId,
  ShotType,
  PlayerGameStats,
} from '../types';
import { ZONE_DEFINITIONS, ALL_ZONES, calculateShotDetails, getZoneRepresentativeCoords } from '../utils/courtGeometry';
import {
  Plus,
  Trash2,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Download,
  Layers,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Edit2,
  SlidersHorizontal,
} from 'lucide-react';

interface DataTableManagerProps {
  players: Player[];
  shots: Shot[];
  playerStats: Record<string, PlayerGameStats>;
  activePlayerId: string | 'all';
  onSelectPlayer: (id: string | 'all') => void;
  onAddShot: (shot: Shot) => void;
  onAddBatchShots: (shots: Shot[]) => void;
  onDeleteShot: (shotId: string) => void;
  onToggleShotResult: (shotId: string) => void;
  onUpdatePlayerStat: (playerId: string, statKey: 'rebounds' | 'assists' | 'turnovers', delta: number) => void;
  onClearShots: () => void;
}

export const DataTableManager: React.FC<DataTableManagerProps> = ({
  players,
  shots,
  playerStats,
  activePlayerId,
  onSelectPlayer,
  onAddShot,
  onAddBatchShots,
  onDeleteShot,
  onToggleShotResult,
  onUpdatePlayerStat,
  onClearShots,
}) => {
  // Mode: 'shot_table' (row by row shots) or 'boxscore_table' (full team box score)
  const [tableMode, setTableMode] = useState<'shot_table' | 'boxscore_table'>('shot_table');

  // New row form state
  const [newPlayerId, setNewPlayerId] = useState<string>(players[0]?.id || '');
  const [newZoneId, setNewZoneId] = useState<ShotZoneId>('restricted_area');
  const [newMade, setNewMade] = useState<boolean>(true);
  const [newShotType, setNewShotType] = useState<ShotType>('jump_shot');
  const [newQuarter, setNewQuarter] = useState<number>(1);

  // Batch adder state
  const [showBatchForm, setShowBatchForm] = useState<boolean>(false);
  const [batchAttempts, setBatchAttempts] = useState<number>(5);
  const [batchMade, setBatchMade] = useState<number>(3);

  // Table filters & search
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'made' | 'missed'>('all');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Handle adding a single shot from the table form
  const handleAddNewRow = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const effectivePlayerId = newPlayerId || players[0]?.id;
    if (!effectivePlayerId) return;

    const coords = getZoneRepresentativeCoords(newZoneId, true);
    const details = calculateShotDetails(coords.x, coords.y);

    const shot: Shot = {
      id: `shot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      playerId: effectivePlayerId,
      x: coords.x,
      y: coords.y,
      made: newMade,
      timestamp: Date.now(),
      zoneId: details.zoneId,
      zoneName: details.zoneName,
      isThree: details.isThree,
      distanceMeters: details.distanceMeters,
      shotType: newShotType,
      quarter: newQuarter,
    };

    onAddShot(shot);
  };

  // Handle batch adding (e.g. 5 attempts, 3 made)
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePlayerId = newPlayerId || players[0]?.id;
    if (!effectivePlayerId) return;

    const total = Math.max(1, Math.min(50, batchAttempts));
    const madeCount = Math.max(0, Math.min(total, batchMade));
    const missedCount = total - madeCount;

    const generatedShots: Shot[] = [];
    const baseTime = Date.now();

    // Generate made shots
    for (let i = 0; i < madeCount; i++) {
      const coords = getZoneRepresentativeCoords(newZoneId, true);
      const details = calculateShotDetails(coords.x, coords.y);
      generatedShots.push({
        id: `batch-${baseTime}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        playerId: effectivePlayerId,
        x: coords.x,
        y: coords.y,
        made: true,
        timestamp: baseTime + i * 10,
        zoneId: details.zoneId,
        zoneName: details.zoneName,
        isThree: details.isThree,
        distanceMeters: details.distanceMeters,
        shotType: newShotType,
        quarter: newQuarter,
      });
    }

    // Generate missed shots
    for (let i = 0; i < missedCount; i++) {
      const coords = getZoneRepresentativeCoords(newZoneId, true);
      const details = calculateShotDetails(coords.x, coords.y);
      generatedShots.push({
        id: `batch-${baseTime}-miss-${i}-${Math.random().toString(36).substring(2, 6)}`,
        playerId: effectivePlayerId,
        x: coords.x,
        y: coords.y,
        made: false,
        timestamp: baseTime + (madeCount + i) * 10,
        zoneId: details.zoneId,
        zoneName: details.zoneName,
        isThree: details.isThree,
        distanceMeters: details.distanceMeters,
        shotType: newShotType,
        quarter: newQuarter,
      });
    }

    onAddBatchShots(generatedShots);
    setShowBatchForm(false);
  };

  // Filtered and sorted shots for table
  const displayedShots = useMemo(() => {
    return shots
      .filter((s) => {
        if (activePlayerId !== 'all' && s.playerId !== activePlayerId) return false;
        if (zoneFilter !== 'all' && s.zoneId !== zoneFilter) return false;
        if (resultFilter === 'made' && !s.made) return false;
        if (resultFilter === 'missed' && s.made) return false;
        if (searchFilter) {
          const p = players.find((pl) => pl.id === s.playerId);
          const pName = p ? p.name.toLowerCase() : '';
          const pNum = p ? String(p.number) : '';
          const zName = s.zoneName.toLowerCase();
          const query = searchFilter.toLowerCase();
          if (!pName.includes(query) && !pNum.includes(query) && !zName.includes(query)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => (sortDirection === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp));
  }, [shots, activePlayerId, zoneFilter, resultFilter, searchFilter, sortDirection, players]);

  // Player box score data calculation
  const boxScoreData = useMemo(() => {
    return players.map((p) => {
      const pShots = shots.filter((s) => s.playerId === p.id);
      const twoShots = pShots.filter((s) => !s.isThree);
      const threeShots = pShots.filter((s) => s.isThree);

      const twoMade = twoShots.filter((s) => s.made).length;
      const twoAttempts = twoShots.length;

      const threeMade = threeShots.filter((s) => s.made).length;
      const threeAttempts = threeShots.length;

      const totalMade = twoMade + threeMade;
      const totalAttempts = twoAttempts + threeAttempts;
      const fgPct = totalAttempts > 0 ? (totalMade / totalAttempts) * 100 : 0;
      const threePct = threeAttempts > 0 ? (threeMade / threeAttempts) * 100 : 0;

      const stats = playerStats[p.id] || { rebounds: 0, assists: 0, turnovers: 0 };
      const points = twoMade * 2 + threeMade * 3;
      const astToRatio = stats.turnovers > 0 ? stats.assists / stats.turnovers : stats.assists;

      return {
        player: p,
        twoMade,
        twoAttempts,
        threeMade,
        threeAttempts,
        totalMade,
        totalAttempts,
        fgPct,
        threePct,
        rebounds: stats.rebounds || 0,
        assists: stats.assists || 0,
        turnovers: stats.turnovers || 0,
        points,
        astToRatio,
      };
    });
  }, [players, shots, playerStats]);

  // Overall totals for box score
  const teamTotals = useMemo(() => {
    return boxScoreData.reduce(
      (acc, cur) => {
        acc.twoMade += cur.twoMade;
        acc.twoAttempts += cur.twoAttempts;
        acc.threeMade += cur.threeMade;
        acc.threeAttempts += cur.threeAttempts;
        acc.totalMade += cur.totalMade;
        acc.totalAttempts += cur.totalAttempts;
        acc.rebounds += cur.rebounds;
        acc.assists += cur.assists;
        acc.turnovers += cur.turnovers;
        acc.points += cur.points;
        return acc;
      },
      {
        twoMade: 0,
        twoAttempts: 0,
        threeMade: 0,
        threeAttempts: 0,
        totalMade: 0,
        totalAttempts: 0,
        rebounds: 0,
        assists: 0,
        turnovers: 0,
        points: 0,
      }
    );
  }, [boxScoreData]);

  // Export table to CSV
  const handleExportCSV = () => {
    if (tableMode === 'shot_table') {
      const headers = ['ID', 'Jugador', 'Dorsal', 'Zona', 'Distancia_m', 'Triple', 'Resultado', 'Tipo_Tiro', 'Cuarto', 'Fecha_Hora'];
      const rows = displayedShots.map((s) => {
        const p = players.find((pl) => pl.id === s.playerId);
        return [
          s.id,
          `"${p?.name || 'Desconocido'}"`,
          p?.number ?? '',
          `"${s.zoneName}"`,
          s.distanceMeters,
          s.isThree ? 'SI' : 'NO',
          s.made ? 'ENCERTO' : 'FALLO',
          s.shotType || 'jump_shot',
          s.quarter || 1,
          new Date(s.timestamp).toLocaleString(),
        ].join(',');
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `registro_tiros_basketshot_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Dorsal', 'Jugador', 'Posicion', 'Puntos', '2P_Encestados', '2P_Intentados', '3P_Encestados', '3P_Intentados', 'TC_Total', 'TC_Porcentaje', '3P_Porcentaje', 'Rebotes', 'Asistencias', 'Perdidas', 'Ratio_AST_TO'];
      const rows = boxScoreData.map((d) => [
        d.player.number,
        `"${d.player.name}"`,
        d.player.position,
        d.points,
        d.twoMade,
        d.twoAttempts,
        d.threeMade,
        d.threeAttempts,
        `${d.totalMade}/${d.totalAttempts}`,
        d.fgPct.toFixed(1) + '%',
        d.threePct.toFixed(1) + '%',
        d.rebounds,
        d.assists,
        d.turnovers,
        d.astToRatio.toFixed(2),
      ].join(','));
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `planilla_boxscore_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Table Header and Mode Tabs */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Ingreso Manual por Tabla
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {shots.length} tiros registrados
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Registra tiros y estadísticas directamente en formato tabla con reflejo en la cancha
            </p>
          </div>
        </div>

        {/* View mode toggle: Shot-by-shot table or Box Score table */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTableMode('shot_table')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              tableMode === 'shot_table'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Registro de Tiros
          </button>
          <button
            onClick={() => setTableMode('boxscore_table')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              tableMode === 'boxscore_table'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Planilla Box Score
          </button>
        </div>
      </div>

      {/* MODE 1: ROW BY ROW SHOT ENTRY TABLE */}
      {tableMode === 'shot_table' && (
        <div className="p-4 space-y-4">
          {/* Quick Insert Form Container */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Ingresar Nuevo Tiro a la Tabla
              </span>
              <button
                type="button"
                onClick={() => setShowBatchForm(!showBatchForm)}
                className="text-xs text-slate-400 hover:text-amber-400 font-medium transition flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {showBatchForm ? 'Ocultar carga múltiple' : '⚡ Cargar en lote (varios tiros juntos)'}
              </button>
            </div>

            {/* Normal Single Row Form */}
            {!showBatchForm ? (
              <form onSubmit={handleAddNewRow} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 items-end">
                {/* 1. Player Select */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Jugador</label>
                  <select
                    value={newPlayerId || (players[0]?.id ?? '')}
                    onChange={(e) => setNewPlayerId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Zone on Court Select */}
                <div className="sm:col-span-2 md:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Zona de Cancha</label>
                  <select
                    value={newZoneId}
                    onChange={(e) => setNewZoneId(e.target.value as ShotZoneId)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <optgroup label="Tiros de 2 Puntos">
                      <option value="restricted_area">Bajo el Aro (Zona Restringida)</option>
                      <option value="paint">Pintura / Llave</option>
                      <option value="mid_left_corner">Media Distancia - Fondo Izquierdo</option>
                      <option value="mid_left_wing">Media Distancia - Codo Izquierdo</option>
                      <option value="mid_center">Media Distancia - Centro / TL</option>
                      <option value="mid_right_wing">Media Distancia - Codo Derecho</option>
                      <option value="mid_right_corner">Media Distancia - Fondo Derecho</option>
                    </optgroup>
                    <optgroup label="Tiros de 3 Puntos (Triples)">
                      <option value="three_left_corner">Triple - Esquina Izquierda (6.60m)</option>
                      <option value="three_left_wing">Triple - 45° Izquierda (6.75m)</option>
                      <option value="three_center">Triple - Cabecera / Frontal (6.75m)</option>
                      <option value="three_right_wing">Triple - 45° Derecha (6.75m)</option>
                      <option value="three_right_corner">Triple - Esquina Derecha (6.60m)</option>
                    </optgroup>
                  </select>
                </div>

                {/* 3. Result: Made or Missed */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Resultado</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setNewMade(true)}
                      className={`py-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                        newMade ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Encestó
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMade(false)}
                      className={`py-1 rounded text-xs font-bold transition flex items-center justify-center gap-1 ${
                        !newMade ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Falló
                    </button>
                  </div>
                </div>

                {/* 4. Quarter */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Cuarto</label>
                  <select
                    value={newQuarter}
                    onChange={(e) => setNewQuarter(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value={1}>1C (1° Cuarto)</option>
                    <option value={2}>2C (2° Cuarto)</option>
                    <option value={3}>3C (3° Cuarto)</option>
                    <option value={4}>4C (4° Cuarto)</option>
                    <option value={5}>PR (Prórroga)</option>
                  </select>
                </div>

                {/* 5. Add Button */}
                <div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    + Agregar Fila
                  </button>
                </div>
              </form>
            ) : (
              /* Batch Insert Form */
              <form onSubmit={handleAddBatch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 items-end bg-slate-900/80 p-3 rounded-lg border border-amber-500/30">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Jugador</label>
                  <select
                    value={newPlayerId || (players[0]?.id ?? '')}
                    onChange={(e) => setNewPlayerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.number} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Zona</label>
                  <select
                    value={newZoneId}
                    onChange={(e) => setNewZoneId(e.target.value as ShotZoneId)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    {ALL_ZONES.map((zid) => (
                      <option key={zid} value={zid}>
                        {ZONE_DEFINITIONS[zid].name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Total Intentos</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={batchAttempts}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBatchAttempts(val);
                      if (batchMade > val) setBatchMade(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Encestados</label>
                  <input
                    type="number"
                    min={0}
                    max={batchAttempts}
                    value={batchMade}
                    onChange={(e) => setBatchMade(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold rounded-lg px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-xs transition shadow flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Cargar {batchAttempts} Tiros
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Table Filters and Search Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              {/* Search box */}
              <div className="relative flex-1 min-w-[140px] max-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar jugador o zona..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Player Filter */}
              <select
                value={activePlayerId}
                onChange={(e) => onSelectPlayer(e.target.value as string | 'all')}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todos los jugadores</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    #{p.number} - {p.name}
                  </option>
                ))}
              </select>

              {/* Zone Filter */}
              <select
                value={zoneFilter}
                onChange={(e) => setZoneFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todas las zonas</option>
                {ALL_ZONES.map((zid) => (
                  <option key={zid} value={zid}>
                    {ZONE_DEFINITIONS[zid].name}
                  </option>
                ))}
              </select>

              {/* Result Filter */}
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value as 'all' | 'made' | 'missed')}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todos los resultados</option>
                <option value="made">Solo Encestados</option>
                <option value="missed">Solo Fallados</option>
              </select>
            </div>

            {/* Right actions: CSV download, clear, sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
                title="Cambiar orden cronológico"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{sortDirection === 'desc' ? 'Más recientes' : 'Más antiguos'}</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer font-medium"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Exportar CSV</span>
              </button>
              {shots.length > 0 && (
                <button
                  onClick={onClearShots}
                  className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                  title="Borrar todos los tiros"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* THE DATA TABLE */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto max-h-[460px] scrollbar-thin scrollbar-thumb-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
                  <tr className="text-slate-400 font-semibold">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Jugador</th>
                    <th className="py-2.5 px-3">Zona en Cancha</th>
                    <th className="py-2.5 px-3 text-center">Tipo</th>
                    <th className="py-2.5 px-3 text-center">Distancia</th>
                    <th className="py-2.5 px-3 text-center">Cuarto</th>
                    <th className="py-2.5 px-3 text-center">Resultado (Clic para cambiar)</th>
                    <th className="py-2.5 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-sans">
                  {displayedShots.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        No hay tiros registrados en la tabla con los filtros seleccionados.
                        <div className="mt-2 text-xs text-amber-500/80">
                          Usa el formulario superior para añadir tiros a la tabla.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedShots.map((shot, idx) => {
                      const p = players.find((pl) => pl.id === shot.playerId);
                      const is3 = shot.isThree;
                      return (
                        <tr
                          key={shot.id}
                          className="hover:bg-slate-800/40 transition group"
                        >
                          {/* Row Number */}
                          <td className="py-2 px-3 text-center font-mono text-slate-500">
                            {sortDirection === 'desc' ? displayedShots.length - idx : idx + 1}
                          </td>

                          {/* Player */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-sm"
                                style={{ backgroundColor: p?.avatarColor || '#F59E0B' }}
                              >
                                {p?.number ?? '?'}
                              </span>
                              <span className="font-semibold text-white truncate max-w-[120px]">
                                {p?.name || 'Jugador'}
                              </span>
                            </div>
                          </td>

                          {/* Zone */}
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  is3 ? 'bg-indigo-400' : 'bg-amber-400'
                                }`}
                              />
                              <span className="text-slate-300 font-medium">
                                {shot.zoneName}
                              </span>
                            </div>
                          </td>

                          {/* Type (2P or 3P) */}
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                                is3
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {is3 ? '3PT' : '2PT'}
                            </span>
                          </td>

                          {/* Distance */}
                          <td className="py-2 px-3 text-center font-mono text-slate-300">
                            {shot.distanceMeters.toFixed(1)}m
                          </td>

                          {/* Quarter */}
                          <td className="py-2 px-3 text-center font-mono text-slate-400">
                            {shot.quarter ? `${shot.quarter}C` : '1C'}
                          </td>

                          {/* Result with 1-click toggle */}
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onToggleShotResult(shot.id)}
                              title="Haz clic para alternar entre Encestó y Falló"
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition shadow-sm cursor-pointer ${
                                shot.made
                                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
                                  : 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40'
                              }`}
                            >
                              {shot.made ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  Encestó {is3 ? '(+3)' : '(+2)'}
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                  Falló (0)
                                </>
                              )}
                            </button>
                          </td>

                          {/* Delete Action */}
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteShot(shot.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition cursor-pointer"
                              title="Eliminar este tiro de la tabla y la cancha"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BOX SCORE MANUAL EDITABLE TABLE */}
      {tableMode === 'boxscore_table' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              Planilla General de Estadísticas por Jugador (Box Score)
            </span>
            <button
              onClick={handleExportCSV}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer font-medium"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              Descargar Planilla CSV
            </button>
          </div>

          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <div className="overflow-x-auto max-h-[480px] scrollbar-thin scrollbar-thumb-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 sticky top-0 z-10 border-b border-slate-800">
                  <tr className="text-slate-400 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Jugador</th>
                    <th className="py-2.5 px-3 text-center">PTS</th>
                    <th className="py-2.5 px-3 text-center">T2 (C/I)</th>
                    <th className="py-2.5 px-3 text-center">T3 (C/I)</th>
                    <th className="py-2.5 px-3 text-center">TC (Total)</th>
                    <th className="py-2.5 px-3 text-center">% TC</th>
                    <th className="py-2.5 px-3 text-center">% 3PT</th>
                    <th className="py-2.5 px-3 text-center">REB</th>
                    <th className="py-2.5 px-3 text-center">AST</th>
                    <th className="py-2.5 px-3 text-center">PER</th>
                    <th className="py-2.5 px-3 text-center">AST/PER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-sans">
                  {boxScoreData.map((row) => (
                    <tr
                      key={row.player.id}
                      className={`hover:bg-slate-800/40 transition ${
                        activePlayerId === row.player.id ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="py-2 px-3 font-mono text-slate-400">
                        #{row.player.number}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() =>
                            onSelectPlayer(activePlayerId === row.player.id ? 'all' : row.player.id)
                          }
                          className="flex items-center gap-2 hover:text-amber-400 transition text-left cursor-pointer"
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] text-white shrink-0"
                            style={{ backgroundColor: row.player.avatarColor }}
                          >
                            {row.player.number}
                          </span>
                          <span className="font-semibold text-white">
                            {row.player.name}
                          </span>
                        </button>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-amber-400 text-sm">
                        {row.points}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-300">
                        {row.twoMade}/{row.twoAttempts}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-indigo-300">
                        {row.threeMade}/{row.threeAttempts}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-200">
                        {row.totalMade}/{row.totalAttempts}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-emerald-400">
                        {row.fgPct.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-semibold text-indigo-400">
                        {row.threePct.toFixed(1)}%
                      </td>

                      {/* Rebounds with interactive + / - */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1 font-mono">
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(row.player.id, 'rebounds', -1)}
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-blue-400">
                            {row.rebounds}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(row.player.id, 'rebounds', 1)}
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Assists with interactive + / - */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1 font-mono">
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(row.player.id, 'assists', -1)}
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-emerald-400">
                            {row.assists}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(row.player.id, 'assists', 1)}
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Turnovers with interactive + / - */}
                      <td className="py-2 px-3 text-center">
                        <div className="inline-flex items-center gap-1 font-mono">
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(row.player.id, 'turnovers', -1)}
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-rose-400">
                            {row.turnovers}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdatePlayerStat(row.player.id, 'turnovers', 1)}
                            className="w-4 h-4 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* AST/TO Ratio */}
                      <td className="py-2 px-3 text-center font-mono text-slate-400">
                        {row.astToRatio.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Team Totals Footer */}
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white">
                  <tr>
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3 uppercase tracking-wider text-amber-400">
                      TOTAL EQUIPO
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-400 text-base font-black">
                      {teamTotals.points}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {teamTotals.twoMade}/{teamTotals.twoAttempts}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-indigo-300">
                      {teamTotals.threeMade}/{teamTotals.threeAttempts}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {teamTotals.totalMade}/{teamTotals.totalAttempts}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400">
                      {teamTotals.totalAttempts > 0
                        ? ((teamTotals.totalMade / teamTotals.totalAttempts) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-indigo-400">
                      {teamTotals.threeAttempts > 0
                        ? ((teamTotals.threeMade / teamTotals.threeAttempts) * 100).toFixed(1)
                        : '0.0'}
                      %
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-blue-400">
                      {teamTotals.rebounds}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400">
                      {teamTotals.assists}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-rose-400">
                      {teamTotals.turnovers}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-300">
                      {teamTotals.turnovers > 0
                        ? (teamTotals.assists / teamTotals.turnovers).toFixed(2)
                        : teamTotals.assists.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
