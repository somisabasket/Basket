import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Player,
  Shot,
  ShotZoneId,
  CourtViewMode,
  CourtTheme,
  ShotType,
  PlayerGameStats,
} from './types';
import {
  loadSavedPlayers,
  savePlayers,
  loadSavedShots,
  saveShots,
  loadSavedPlayerStats,
  savePlayerStats,
  resetToDefaultData,
  clearAllShots,
  STORAGE_KEYS,
} from './utils/storage';
import { calculateShotDetails } from './utils/courtGeometry';
import { calculateOverallStats, calculateZoneStats } from './utils/statsCalculator';
import { playSound } from './utils/sound';
import { Court } from './components/Court';
import { ShotModal } from './components/ShotModal';
import { PlayerSelector } from './components/PlayerSelector';
import { StatsDashboard } from './components/StatsDashboard';
import { PlayerModal } from './components/PlayerModal';
import { RosterManagerModal } from './components/RosterManagerModal';
import { Header } from './components/Header';
import { NewGameModal } from './components/NewGameModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { DataTableManager } from './components/DataTableManager';
import { FileSpreadsheet, Target, Layers } from 'lucide-react';

export default function App() {
  // Persistence state
  const [players, setPlayers] = useState<Player[]>(() => loadSavedPlayers());
  const [shots, setShots] = useState<Shot[]>(() => loadSavedShots());
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerGameStats>>(() => loadSavedPlayerStats());

  // Main UI View Mode: 'table_and_court' | 'court_first' | 'table_only'
  const [mainView, setMainView] = useState<'table_and_court' | 'court_first' | 'table_only'>('table_and_court');

  // Active filters and selectors
  const [activePlayerId, setActivePlayerId] = useState<string | 'all'>('all');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<ShotZoneId | null>(null);
  const [shotTypeFilter, setShotTypeFilter] = useState<'all' | 'two' | 'three' | 'makes' | 'misses'>('all');

  // UI preferences
  const [viewMode, setViewMode] = useState<CourtViewMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as CourtViewMode) || 'markers';
  });
  const [courtTheme, setCourtTheme] = useState<CourtTheme>(() => {
    return (localStorage.getItem(STORAGE_KEYS.COURT_THEME) as CourtTheme) || 'hardwood';
  });
  const [fastMode, setFastMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.FAST_MODE) === 'true';
  });
  const [fastModeResult, setFastModeResult] = useState<boolean>(() => {
    const val = localStorage.getItem(STORAGE_KEYS.FAST_RESULT);
    return val !== null ? val === 'true' : true;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';
  });

  // Modals state
  const [pendingCoords, setPendingCoords] = useState<{ x: number; y: number } | null>(null);
  const [playerModalOpen, setPlayerModalOpen] = useState<boolean>(false);
  const [rosterManagerOpen, setRosterManagerOpen] = useState<boolean>(false);
  const [newGameModalOpen, setNewGameModalOpen] = useState<boolean>(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState<boolean>(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);

  // Synchronize storage
  useEffect(() => {
    savePlayers(players);
  }, [players]);

  useEffect(() => {
    saveShots(shots);
  }, [shots]);

  useEffect(() => {
    savePlayerStats(playerStats);
  }, [playerStats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COURT_THEME, courtTheme);
  }, [courtTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAST_MODE, String(fastMode));
  }, [fastMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAST_RESULT, String(fastModeResult));
  }, [fastModeResult]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(soundEnabled));
  }, [soundEnabled]);

  // Handler for updating non-shot player game stats (rebounds, assists, turnovers)
  const handleUpdatePlayerStat = (
    playerId: string,
    statKey: 'rebounds' | 'assists' | 'turnovers',
    delta: number
  ) => {
    setPlayerStats((prev) => {
      const current = prev[playerId] || { rebounds: 0, assists: 0, turnovers: 0 };
      const currentVal = current[statKey] || 0;
      const nextVal = Math.max(0, currentVal + delta);
      if (soundEnabled) {
        playSound('stat');
      }
      return {
        ...prev,
        [playerId]: {
          ...current,
          [statKey]: nextVal,
        },
      };
    });
  };

  // Shots filtered by the sub-header filter (all, two, three, makes, misses)
  const filteredShots = useMemo(() => {
    return shots.filter((s) => {
      if (shotTypeFilter === 'two' && s.isThree) return false;
      if (shotTypeFilter === 'three' && !s.isThree) return false;
      if (shotTypeFilter === 'makes' && !s.made) return false;
      if (shotTypeFilter === 'misses' && s.made) return false;
      return true;
    });
  }, [shots, shotTypeFilter]);

  // Calculate statistics for active player/all and zone stats
  const overallStats = useMemo(() => {
    return calculateOverallStats(filteredShots, players, activePlayerId, playerStats);
  }, [filteredShots, players, activePlayerId, playerStats]);

  const zoneStats = useMemo(() => {
    const playerShots =
      activePlayerId === 'all'
        ? filteredShots
        : filteredShots.filter((s) => s.playerId === activePlayerId);
    return calculateZoneStats(playerShots);
  }, [filteredShots, activePlayerId]);

  // Sound and visual feedback trigger
  const handleShotFeedback = (made: boolean, isThree: boolean) => {
    if (soundEnabled) {
      playSound(made ? 'make' : 'miss');
    }
    if (made && isThree) {
      try {
        confetti({
          particleCount: 25,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#38BDF8'],
        });
      } catch {
        // ignore
      }
    }
  };

  // Court Click Handler
  const handleCourtClick = (coords: { x: number; y: number; clientX: number; clientY: number }) => {
    if (fastMode) {
      const defaultPlayerId =
        activePlayerId !== 'all'
          ? activePlayerId
          : (players[0]?.id || 'player-1');
      const details = calculateShotDetails(coords.x, coords.y);
      const newShot: Shot = {
        id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: defaultPlayerId,
        x: coords.x,
        y: coords.y,
        made: fastModeResult,
        timestamp: Date.now(),
        zoneId: details.zoneId,
        zoneName: details.zoneName,
        isThree: details.isThree,
        distanceMeters: details.distanceMeters,
      };

      setShots((prev) => [...prev, newShot]);
      handleShotFeedback(fastModeResult, details.isThree);
    } else {
      setPendingCoords({ x: coords.x, y: coords.y });
    }
  };

  // Confirm shot from modal
  const handleConfirmModalShot = (data: {
    x: number;
    y: number;
    made: boolean;
    playerId: string;
    shotType?: ShotType;
  }) => {
    const details = calculateShotDetails(data.x, data.y);
    const newShot: Shot = {
      id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      playerId: data.playerId,
      x: data.x,
      y: data.y,
      made: data.made,
      timestamp: Date.now(),
      zoneId: details.zoneId,
      zoneName: details.zoneName,
      isThree: details.isThree,
      distanceMeters: details.distanceMeters,
      shotType: data.shotType,
    };

    setShots((prev) => [...prev, newShot]);
    handleShotFeedback(data.made, details.isThree);
    setPendingCoords(null);
  };

  // Undo last shot
  const handleUndoLastShot = () => {
    if (shots.length === 0) return;
    setShots((prev) => prev.slice(0, prev.length - 1));
  };

  // Toggle shot result (invert made/missed)
  const handleToggleShotResult = (shotId: string) => {
    setShots((prev) =>
      prev.map((s) => {
        if (s.id === shotId) {
          const updated = !s.made;
          if (soundEnabled) {
            playSound(updated ? 'make' : 'miss');
          }
          return { ...s, made: updated };
        }
        return s;
      })
    );
  };

  // Delete individual shot
  const handleDeleteShot = (shotId: string) => {
    setShots((prev) => prev.filter((s) => s.id !== shotId));
  };

  // Add single shot from data table
  const handleAddTableShot = (shot: Shot) => {
    setShots((prev) => [...prev, shot]);
    handleShotFeedback(shot.made, shot.isThree);
  };

  // Add multiple shots in batch from data table
  const handleAddBatchShots = (newShots: Shot[]) => {
    setShots((prev) => [...prev, ...newShots]);
    if (soundEnabled) {
      playSound('stat');
    }
  };

  // Clear all shots from table
  const handleClearTableShots = () => {
    if (shots.length === 0) return;
    if (window.confirm('¿Seguro que deseas eliminar todos los tiros registrados en la tabla y la cancha?')) {
      clearAllShots();
      setShots([]);
    }
  };

  // New Game / Reset confirmation
  const handleConfirmNewGame = () => {
    setShots([]);
    setPlayerStats({});
    setSelectedZoneFilter(null);
    if (soundEnabled) {
      playSound('whistle');
    }
    setNewGameModalOpen(false);
  };

  // Save/Update player
  const handleSavePlayer = (playerData: Omit<Player, 'createdAt'> & { id?: string }) => {
    if (playerData.id) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerData.id ? { ...p, ...playerData } : p))
      );
    } else {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: playerData.name,
        number: playerData.number,
        position: playerData.position,
        avatarColor: playerData.avatarColor,
        handedness: playerData.handedness,
        createdAt: Date.now(),
      };
      setPlayers((prev) => [...prev, newPlayer]);
      setActivePlayerId(newPlayer.id);
    }
  };

  // Delete player
  const handleDeletePlayer = (playerId: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    if (activePlayerId === playerId) {
      setActivePlayerId('all');
    }
  };

  // Reset sample data
  const handleResetSampleData = () => {
    const data = resetToDefaultData();
    setPlayers(data.players);
    setShots(data.shots);
    setPlayerStats(data.playerStats);
    setActivePlayerId('all');
    setSelectedZoneFilter(null);
  };

  // Clear all shots
  const handleClearAllShots = () => {
    const cleared = clearAllShots();
    setShots(cleared);
    setSelectedZoneFilter(null);
  };

  // Save full players list from Roster Manager
  const handleSavePlayersList = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    if (activePlayerId !== 'all' && !newPlayers.some((p) => p.id === activePlayerId)) {
      setActivePlayerId('all');
    }
  };

  // Import external JSON
  const handleImportData = (data: {
    players: Player[];
    shots: Shot[];
    playerStats?: Record<string, PlayerGameStats>;
  }) => {
    setPlayers(data.players);
    setShots(data.shots);
    if (data.playerStats) {
      setPlayerStats(data.playerStats);
    }
    setActivePlayerId('all');
    setSelectedZoneFilter(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with quick filters & export/import tools */}
      <Header
        shots={shots}
        players={players}
        playerStats={playerStats}
        shotTypeFilter={shotTypeFilter}
        onChangeShotTypeFilter={setShotTypeFilter}
        onResetSampleData={handleResetSampleData}
        onClearAllShots={handleClearAllShots}
        onImportData={handleImportData}
        onOpenRosterManager={() => setRosterManagerOpen(true)}
        onOpenNewPlayerModal={() => {
          setPlayerToEdit(null);
          setPlayerModalOpen(true);
        }}
        onOpenNewGameModal={() => setNewGameModalOpen(true)}
        onOpenDownloadModal={() => setDownloadModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 space-y-4">
        {/* Player Selector Bar */}
        <PlayerSelector
          players={players}
          shots={shots}
          playerStats={playerStats}
          onUpdatePlayerStat={handleUpdatePlayerStat}
          activePlayerId={activePlayerId}
          onSelectPlayer={setActivePlayerId}
          onOpenNewPlayerModal={() => {
            setPlayerToEdit(null);
            setPlayerModalOpen(true);
          }}
          onOpenRosterManager={() => setRosterManagerOpen(true)}
          onEditPlayer={(player) => {
            setPlayerToEdit(player);
            setPlayerModalOpen(true);
          }}
        />

        {/* Navigation Bar: View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-md">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMainView('table_and_court')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                mainView === 'table_and_court'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Tabla de Ingreso + Cancha
            </button>
            <button
              onClick={() => setMainView('court_first')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                mainView === 'court_first'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Target className="w-4 h-4" />
              Cancha + Estadísticas
            </button>
            <button
              onClick={() => setMainView('table_only')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                mainView === 'table_only'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Solo Planilla / Tabla
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            {mainView === 'table_and_court' && 'Ingresa filas a mano en la tabla y observa el mapa y estadísticas en tiempo real'}
            {mainView === 'court_first' && 'Modo táctico de cancha interactiva y desglose estadístico'}
            {mainView === 'table_only' && 'Planilla completa a ancho extendido para carga masiva'}
          </div>
        </div>

        {/* VIEW 1: TABLE AND COURT (Primary mode requested by user) */}
        {mainView === 'table_and_court' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Interactive Data Table */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <DataTableManager
                players={players}
                shots={shots}
                playerStats={playerStats}
                activePlayerId={activePlayerId}
                onSelectPlayer={setActivePlayerId}
                onAddShot={handleAddTableShot}
                onAddBatchShots={handleAddBatchShots}
                onDeleteShot={handleDeleteShot}
                onToggleShotResult={handleToggleShotResult}
                onUpdatePlayerStat={handleUpdatePlayerStat}
                onClearShots={handleClearTableShots}
              />
            </div>

            {/* Right Column: Court visualization + Live Stats */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              <Court
                shots={filteredShots}
                players={players}
                playerStats={playerStats}
                activePlayerId={activePlayerId}
                onSelectPlayer={setActivePlayerId}
                onOpenRosterManager={() => setRosterManagerOpen(true)}
                onOpenNewPlayerModal={() => {
                  setPlayerToEdit(null);
                  setPlayerModalOpen(true);
                }}
                selectedZoneFilter={selectedZoneFilter}
                onSelectZoneFilter={setSelectedZoneFilter}
                onCourtClick={handleCourtClick}
                onDeleteShot={handleDeleteShot}
                onToggleShotResult={handleToggleShotResult}
                courtTheme={courtTheme}
                onToggleTheme={() =>
                  setCourtTheme((prev) => (prev === 'hardwood' ? 'tactical' : 'hardwood'))
                }
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                zoneStats={zoneStats}
                fastMode={fastMode}
                fastModeResult={fastModeResult}
                onToggleFastModeResult={() => setFastModeResult((prev) => !prev)}
                onToggleFastMode={() => setFastMode((prev) => !prev)}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((prev) => !prev)}
                onUndoLastShot={handleUndoLastShot}
                canUndo={shots.length > 0}
                onUpdatePlayerStat={handleUpdatePlayerStat}
              />

              <StatsDashboard
                overallStats={overallStats}
                zoneStats={zoneStats}
                players={players}
                shots={filteredShots}
                playerStats={playerStats}
                onUpdatePlayerStat={handleUpdatePlayerStat}
                activePlayerId={activePlayerId}
                selectedZoneFilter={selectedZoneFilter}
                onSelectZoneFilter={setSelectedZoneFilter}
                onDeleteShot={handleDeleteShot}
                onToggleShotResult={handleToggleShotResult}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: COURT FIRST */}
        {mainView === 'court_first' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-7 flex flex-col space-y-3">
                <Court
                  shots={filteredShots}
                  players={players}
                  playerStats={playerStats}
                  activePlayerId={activePlayerId}
                  onSelectPlayer={setActivePlayerId}
                  onOpenRosterManager={() => setRosterManagerOpen(true)}
                  onOpenNewPlayerModal={() => {
                    setPlayerToEdit(null);
                    setPlayerModalOpen(true);
                  }}
                  selectedZoneFilter={selectedZoneFilter}
                  onSelectZoneFilter={setSelectedZoneFilter}
                  onCourtClick={handleCourtClick}
                  onDeleteShot={handleDeleteShot}
                  onToggleShotResult={handleToggleShotResult}
                  courtTheme={courtTheme}
                  onToggleTheme={() =>
                    setCourtTheme((prev) => (prev === 'hardwood' ? 'tactical' : 'hardwood'))
                  }
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  zoneStats={zoneStats}
                  fastMode={fastMode}
                  fastModeResult={fastModeResult}
                  onToggleFastModeResult={() => setFastModeResult((prev) => !prev)}
                  onToggleFastMode={() => setFastMode((prev) => !prev)}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled((prev) => !prev)}
                  onUndoLastShot={handleUndoLastShot}
                  canUndo={shots.length > 0}
                  onUpdatePlayerStat={handleUpdatePlayerStat}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col space-y-3">
                <StatsDashboard
                  overallStats={overallStats}
                  zoneStats={zoneStats}
                  players={players}
                  shots={filteredShots}
                  playerStats={playerStats}
                  onUpdatePlayerStat={handleUpdatePlayerStat}
                  activePlayerId={activePlayerId}
                  selectedZoneFilter={selectedZoneFilter}
                  onSelectZoneFilter={setSelectedZoneFilter}
                  onDeleteShot={handleDeleteShot}
                  onToggleShotResult={handleToggleShotResult}
                />
              </div>
            </div>

            <DataTableManager
              players={players}
              shots={shots}
              playerStats={playerStats}
              activePlayerId={activePlayerId}
              onSelectPlayer={setActivePlayerId}
              onAddShot={handleAddTableShot}
              onAddBatchShots={handleAddBatchShots}
              onDeleteShot={handleDeleteShot}
              onToggleShotResult={handleToggleShotResult}
              onUpdatePlayerStat={handleUpdatePlayerStat}
              onClearShots={handleClearTableShots}
            />
          </div>
        )}

        {/* VIEW 3: TABLE ONLY */}
        {mainView === 'table_only' && (
          <div className="space-y-4">
            <DataTableManager
              players={players}
              shots={shots}
              playerStats={playerStats}
              activePlayerId={activePlayerId}
              onSelectPlayer={setActivePlayerId}
              onAddShot={handleAddTableShot}
              onAddBatchShots={handleAddBatchShots}
              onDeleteShot={handleDeleteShot}
              onToggleShotResult={handleToggleShotResult}
              onUpdatePlayerStat={handleUpdatePlayerStat}
              onClearShots={handleClearTableShots}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-6">
                <Court
                  shots={filteredShots}
                  players={players}
                  playerStats={playerStats}
                  activePlayerId={activePlayerId}
                  onSelectPlayer={setActivePlayerId}
                  onOpenRosterManager={() => setRosterManagerOpen(true)}
                  onOpenNewPlayerModal={() => {
                    setPlayerToEdit(null);
                    setPlayerModalOpen(true);
                  }}
                  selectedZoneFilter={selectedZoneFilter}
                  onSelectZoneFilter={setSelectedZoneFilter}
                  onCourtClick={handleCourtClick}
                  onDeleteShot={handleDeleteShot}
                  onToggleShotResult={handleToggleShotResult}
                  courtTheme={courtTheme}
                  onToggleTheme={() =>
                    setCourtTheme((prev) => (prev === 'hardwood' ? 'tactical' : 'hardwood'))
                  }
                  viewMode={viewMode}
                  onChangeViewMode={setViewMode}
                  zoneStats={zoneStats}
                  fastMode={fastMode}
                  fastModeResult={fastModeResult}
                  onToggleFastModeResult={() => setFastModeResult((prev) => !prev)}
                  onToggleFastMode={() => setFastMode((prev) => !prev)}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled((prev) => !prev)}
                  onUndoLastShot={handleUndoLastShot}
                  canUndo={shots.length > 0}
                  onUpdatePlayerStat={handleUpdatePlayerStat}
                />
              </div>
              <div className="lg:col-span-6">
                <StatsDashboard
                  overallStats={overallStats}
                  zoneStats={zoneStats}
                  players={players}
                  shots={filteredShots}
                  playerStats={playerStats}
                  onUpdatePlayerStat={handleUpdatePlayerStat}
                  activePlayerId={activePlayerId}
                  selectedZoneFilter={selectedZoneFilter}
                  onSelectZoneFilter={setSelectedZoneFilter}
                  onDeleteShot={handleDeleteShot}
                  onToggleShotResult={handleToggleShotResult}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Manual Shot Confirmation Modal */}
      {pendingCoords && (
        <ShotModal
          coords={pendingCoords}
          players={players}
          activePlayerId={activePlayerId}
          onConfirmShot={handleConfirmModalShot}
          onClose={() => setPendingCoords(null)}
        />
      )}

      {/* Roster Manager Modal (Bulk text paste, CSV import/export, full list) */}
      {rosterManagerOpen && (
        <RosterManagerModal
          isOpen={rosterManagerOpen}
          onClose={() => setRosterManagerOpen(false)}
          players={players}
          onSavePlayers={handleSavePlayersList}
          onAddNewPlayer={() => {
            setPlayerToEdit(null);
            setPlayerModalOpen(true);
          }}
        />
      )}

      {/* Player Add/Edit Modal */}
      {playerModalOpen && (
        <PlayerModal
          isOpen={playerModalOpen}
          onClose={() => setPlayerModalOpen(false)}
          onSave={handleSavePlayer}
          onDelete={handleDeletePlayer}
          playerToEdit={playerToEdit}
        />
      )}

      {/* New Game / Reset Confirmation Modal */}
      {newGameModalOpen && (
        <NewGameModal
          isOpen={newGameModalOpen}
          onClose={() => setNewGameModalOpen(false)}
          onConfirmNewGame={handleConfirmNewGame}
          onResetFactoryData={handleResetSampleData}
          shotsCount={shots.length}
          playersCount={players.length}
        />
      )}

      {/* Download Single-File Portable HTML App Modal */}
      {downloadModalOpen && (
        <DownloadAppModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          players={players}
          shots={shots}
          playerStats={playerStats}
        />
      )}
    </div>
  );
}

