import { Player, Shot, ShotZoneId, MatchPeriod, PlayerGameStats } from '../types';
import { calculateShotDetails } from './courtGeometry';

export const STORAGE_KEYS = {
  PLAYERS: 'basket_shot_players_v1',
  SHOTS: 'basket_shot_shots_v1',
  PLAYER_STATS: 'basket_shot_player_stats_v1',
  ACTIVE_PLAYER: 'basket_shot_active_player_v1',
  FAST_MODE: 'basket_shot_fast_mode_v1',
  FAST_RESULT: 'basket_shot_fast_result_v1',
  SOUND_ENABLED: 'basket_shot_sound_enabled_v1',
  COURT_THEME: 'basket_shot_court_theme_v1',
  VIEW_MODE: 'basket_shot_view_mode_v1',
  ON_COURT_PLAYERS: 'basket_shot_on_court_v1',
  PLAYER_MINUTES: 'basket_shot_player_minutes_v1',
  MATCH_CLOCK: 'basket_shot_match_clock_v1',
  MATCH_PERIOD: 'basket_shot_match_period_v1',
};

export const INITIAL_PLAYER_STATS: Record<string, PlayerGameStats> = {
  'player-1': { rebounds: 4, assists: 8, turnovers: 2 }, // Curry
  'player-2': { rebounds: 9, assists: 11, turnovers: 4 }, // Luka
  'player-3': { rebounds: 13, assists: 6, turnovers: 3 }, // Giannis
  'player-4': { rebounds: 8, assists: 9, turnovers: 3 }, // LeBron
  'player-5': { rebounds: 14, assists: 12, turnovers: 2 }, // Jokic
  'player-6': { rebounds: 8, assists: 4, turnovers: 2 }, // Tatum
  'player-7': { rebounds: 6, assists: 5, turnovers: 1 }, // Butler
};

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'player-1',
    name: 'Stephen Curry',
    number: 30,
    position: 'Escolta',
    avatarColor: '#F59E0B', // Amber
    handedness: 'Diestro',
    createdAt: Date.now() - 1000000,
  },
  {
    id: 'player-2',
    name: 'Luka Doncic',
    number: 77,
    position: 'Base',
    avatarColor: '#3B82F6', // Blue
    handedness: 'Diestro',
    createdAt: Date.now() - 900000,
  },
  {
    id: 'player-3',
    name: 'Giannis Antetokounmpo',
    number: 34,
    position: 'Ala-Pívot',
    avatarColor: '#10B981', // Emerald
    handedness: 'Diestro',
    createdAt: Date.now() - 800000,
  },
  {
    id: 'player-4',
    name: 'LeBron James',
    number: 23,
    position: 'Alero',
    avatarColor: '#8B5CF6', // Purple
    handedness: 'Diestro',
    createdAt: Date.now() - 700000,
  },
  {
    id: 'player-5',
    name: 'Nikola Jokic',
    number: 15,
    position: 'Pívot',
    avatarColor: '#EC4899', // Pink
    handedness: 'Diestro',
    createdAt: Date.now() - 600000,
  },
  {
    id: 'player-6',
    name: 'Jayson Tatum',
    number: 0,
    position: 'Alero',
    avatarColor: '#14B8A6', // Teal
    handedness: 'Diestro',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'player-7',
    name: 'Jimmy Butler',
    number: 22,
    position: 'Escolta',
    avatarColor: '#F97316', // Orange
    handedness: 'Diestro',
    createdAt: Date.now() - 400000,
  },
];


// Helper to generate a shot with proper zone metadata
function createMockShot(
  id: string,
  playerId: string,
  x: number,
  y: number,
  made: boolean,
  offsetMinutes: number
): Shot {
  const details = calculateShotDetails(x, y);
  return {
    id,
    playerId,
    x,
    y,
    made,
    timestamp: Date.now() - offsetMinutes * 60 * 1000,
    zoneId: details.zoneId,
    zoneName: details.zoneName,
    isThree: details.isThree,
    distanceMeters: details.distanceMeters,
  };
}

export const INITIAL_SHOTS: Shot[] = [
  // Stephen Curry (#30) - high volume 3PT and elite accuracy
  createMockShot('s-1', 'player-1', 4.5, 14, true, 45), // 3PT Left Corner (made)
  createMockShot('s-2', 'player-1', 5.2, 19, true, 44), // 3PT Left Corner (made)
  createMockShot('s-3', 'player-1', 4.8, 12, false, 43), // 3PT Left Corner (miss)
  createMockShot('s-4', 'player-1', 22, 54, true, 41), // 3PT Left Wing (made)
  createMockShot('s-5', 'player-1', 25, 52, true, 40), // 3PT Left Wing (made)
  createMockShot('s-6', 'player-1', 20, 56, true, 39), // 3PT Left Wing (made)
  createMockShot('s-7', 'player-1', 24, 50, false, 38), // 3PT Left Wing (miss)
  createMockShot('s-8', 'player-1', 49, 65, true, 36), // 3PT Center (made)
  createMockShot('s-9', 'player-1', 51, 68, true, 35), // 3PT Center deep (made)
  createMockShot('s-10', 'player-1', 47, 62, false, 34), // 3PT Center (miss)
  createMockShot('s-11', 'player-1', 76, 52, true, 32), // 3PT Right Wing (made)
  createMockShot('s-12', 'player-1', 78, 55, false, 30), // 3PT Right Wing (miss)
  createMockShot('s-13', 'player-1', 95.5, 15, true, 28), // 3PT Right Corner (made)
  createMockShot('s-14', 'player-1', 94.8, 18, true, 26), // 3PT Right Corner (made)
  createMockShot('s-15', 'player-1', 50, 14, true, 25), // Rim layup (made)
  createMockShot('s-16', 'player-1', 51, 16, true, 24), // Rim layup (made)
  createMockShot('s-17', 'player-1', 48, 38, true, 22), // Floater in paint (made)
  createMockShot('s-18', 'player-1', 52, 40, false, 20), // Free throw mid (miss)
  createMockShot('s-19', 'player-1', 34, 30, true, 18), // Mid left elbow (made)

  // Luka Doncic (#77) - Step backs, floaters in paint, mid-range
  createMockShot('s-20', 'player-2', 50, 13, true, 50), // Under rim
  createMockShot('s-21', 'player-2', 52, 14, true, 48), // Under rim
  createMockShot('s-22', 'player-2', 48, 12, false, 46), // Under rim contested
  createMockShot('s-23', 'player-2', 49, 28, true, 44), // Floater paint
  createMockShot('s-24', 'player-2', 51, 32, true, 42), // Floater paint
  createMockShot('s-25', 'player-2', 43, 26, false, 40), // Paint
  createMockShot('s-26', 'player-2', 26, 38, true, 38), // Mid left elbow
  createMockShot('s-27', 'player-2', 30, 35, true, 36), // Mid left elbow
  createMockShot('s-28', 'player-2', 68, 36, false, 34), // Mid right elbow
  createMockShot('s-29', 'player-2', 50, 42, true, 32), // Free throw line
  createMockShot('s-30', 'player-2', 21, 56, true, 29), // Stepback 3PT left wing
  createMockShot('s-31', 'player-2', 19, 58, false, 27), // 3PT left wing
  createMockShot('s-32', 'player-2', 52, 64, true, 25), // 3PT center
  createMockShot('s-33', 'player-2', 48, 66, false, 22), // 3PT center
  createMockShot('s-34', 'player-2', 79, 53, true, 20), // 3PT right wing

  // Giannis Antetokounmpo (#34) - Dominant in restricted area & paint, few 3s
  createMockShot('s-35', 'player-3', 50, 11, true, 45), // Dunk rim
  createMockShot('s-36', 'player-3', 49, 12, true, 43), // Dunk rim
  createMockShot('s-37', 'player-3', 51, 13, true, 41), // Layup rim
  createMockShot('s-38', 'player-3', 52, 10, true, 39), // Dunk rim
  createMockShot('s-39', 'player-3', 48, 14, true, 37), // Hook rim
  createMockShot('s-40', 'player-3', 50, 15, false, 35), // Rim miss
  createMockShot('s-41', 'player-3', 46, 25, true, 33), // Paint layup
  createMockShot('s-42', 'player-3', 54, 30, false, 31), // Paint short hook
  createMockShot('s-43', 'player-3', 50, 42, true, 28), // Free throw line jumper
  createMockShot('s-44', 'player-3', 48, 41, false, 25), // Free throw line
  createMockShot('s-45', 'player-3', 50, 65, false, 20), // 3PT center miss
  createMockShot('s-46', 'player-3', 25, 55, false, 18), // 3PT left wing miss
];

export const PLAYER_COLORS = [
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#EAB308', // Yellow
  '#84CC16', // Lime
];

export function loadSavedPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (raw === null) return INITIAL_PLAYERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PLAYERS;
  } catch {
    return INITIAL_PLAYERS;
  }
}

export function savePlayers(players: Player[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
  } catch (err) {
    console.error('Failed to save players', err);
  }
}

export function loadSavedShots(): Shot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOTS);
    if (raw === null) return INITIAL_SHOTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SHOTS;
  } catch {
    return INITIAL_SHOTS;
  }
}

export function saveShots(shots: Shot[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOTS, JSON.stringify(shots));
  } catch (err) {
    console.error('Failed to save shots', err);
  }
}

export function loadSavedPlayerStats(): Record<string, PlayerGameStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (raw === null) return INITIAL_PLAYER_STATS;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
    return INITIAL_PLAYER_STATS;
  } catch {
    return INITIAL_PLAYER_STATS;
  }
}

export function savePlayerStats(stats: Record<string, PlayerGameStats>) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save player stats', err);
  }
}

export function clearAllPlayerStats(): Record<string, PlayerGameStats> {
  savePlayerStats({});
  return {};
}

export function resetToDefaultData(): {
  players: Player[];
  shots: Shot[];
  playerStats: Record<string, PlayerGameStats>;
} {
  savePlayers(INITIAL_PLAYERS);
  saveShots(INITIAL_SHOTS);
  savePlayerStats(INITIAL_PLAYER_STATS);
  return {
    players: INITIAL_PLAYERS,
    shots: INITIAL_SHOTS,
    playerStats: INITIAL_PLAYER_STATS,
  };
}

export function clearAllShots(): Shot[] {
  saveShots([]);
  return [];
}

export function clearAllPlayers(): Player[] {
  savePlayers([]);
  return [];
}

export function loadSavedOnCourtPlayers(allPlayers?: Player[]): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ON_COURT_PLAYERS);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (allPlayers && allPlayers.length > 0) {
          const valid = parsed.filter((id) => allPlayers.some((p) => p.id === id));
          if (valid.length > 0) return valid.slice(0, 5);
        } else {
          return parsed.slice(0, 5);
        }
      }
    }
  } catch {
    // fallback
  }
  // Default to first 5 players if available
  if (allPlayers && allPlayers.length > 0) {
    return allPlayers.slice(0, 5).map((p) => p.id);
  }
  return [];
}


export function saveOnCourtPlayers(playerIds: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ON_COURT_PLAYERS, JSON.stringify(playerIds));
  } catch (err) {
    console.error('Failed to save on-court players', err);
  }
}

export function loadSavedPlayerMinutes(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYER_MINUTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {}
  return {};
}

export function savePlayerMinutes(minutes: Record<string, number>) {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_MINUTES, JSON.stringify(minutes));
  } catch (err) {
    console.error('Failed to save player minutes', err);
  }
}

export function loadSavedMatchClock(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_CLOCK);
    if (raw !== null) {
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= 0) return num;
    }
  } catch {}
  return 0;
}

export function saveMatchClock(seconds: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCH_CLOCK, String(seconds));
  } catch (err) {
    console.error('Failed to save match clock', err);
  }
}

export function loadSavedMatchPeriod(): MatchPeriod {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCH_PERIOD);
    if (raw && ['1C', '2C', '3C', '4C', 'PR', 'ENT'].includes(raw)) {
      return raw as MatchPeriod;
    }
  } catch {}
  return '1C';
}

export function saveMatchPeriod(period: MatchPeriod) {
  try {
    localStorage.setItem(STORAGE_KEYS.MATCH_PERIOD, period);
  } catch (err) {
    console.error('Failed to save match period', err);
  }
}

export function formatGameTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Parses freeform multiline text into players.
 * Supports lines like:
 * "10 Stephen Curry Base"
 * "7, Luka Doncic, Base"
 * "#23 LeBron James"
 * "Manu Ginobili 20 Escolta"
 * "Juan Perez"
 */
export function parseBulkPlayersText(text: string, existingCount = 0): Player[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const parsedPlayers: Player[] = [];
  const knownPositions = ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'];

  lines.forEach((line, index) => {
    // Clean commas, tabs, semicolons or dashes
    const tokens = line.split(/[,;\t|]+/).map((t) => t.trim()).filter(Boolean);
    let name = '';
    let number = index + 1;
    let position: any = 'Base';

    if (tokens.length >= 2) {
      // Check if token 0 or 1 is a number
      const numMatch0 = tokens[0].match(/#?(\d+)/);
      const numMatch1 = tokens[1].match(/#?(\d+)/);

      if (numMatch0 && !tokens[0].replace(/#?\d+/, '').trim()) {
        number = parseInt(numMatch0[1], 10);
        name = tokens[1];
        if (tokens[2]) {
          const matchPos = knownPositions.find((p) =>
            tokens[2].toLowerCase().includes(p.toLowerCase()) ||
            (tokens[2].toLowerCase().includes('pivot') && p.includes('Pívot')) ||
            (tokens[2].toLowerCase().includes('ala') && p.includes('Ala'))
          );
          if (matchPos) position = matchPos;
        }
      } else if (numMatch1 && !tokens[1].replace(/#?\d+/, '').trim()) {
        name = tokens[0];
        number = parseInt(numMatch1[1], 10);
        if (tokens[2]) {
          const matchPos = knownPositions.find((p) =>
            tokens[2].toLowerCase().includes(p.toLowerCase()) ||
            (tokens[2].toLowerCase().includes('pivot') && p.includes('Pívot'))
          );
          if (matchPos) position = matchPos;
        }
      } else {
        name = tokens[0];
      }
    } else {
      // Single line space separated
      const lineTokens = line.split(/\s+/);
      const numMatch = line.match(/(?:#|^|\s)(\d{1,2})(?:\s|$|-)/);
      if (numMatch) {
        number = parseInt(numMatch[1], 10);
      }
      // Remove the number from line to get name & position
      let cleaned = line.replace(/#?\b\d{1,2}\b/, '').trim();
      // Check position in line
      for (const pos of knownPositions) {
        const regex = new RegExp(`\\b${pos}\\b`, 'i');
        if (regex.test(cleaned)) {
          position = pos;
          cleaned = cleaned.replace(regex, '').trim();
          break;
        }
      }
      name = cleaned.replace(/^[-–—:]+/, '').replace(/[-–—:]+$/, '').trim() || `Jugador ${number}`;
    }

    if (!name) {
      name = `Jugador ${number}`;
    }

    const color = PLAYER_COLORS[(existingCount + index) % PLAYER_COLORS.length];
    parsedPlayers.push({
      id: `player-custom-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
      name,
      number: isNaN(number) ? index + 1 : number,
      position: knownPositions.includes(position) ? position : 'Base',
      avatarColor: color,
      handedness: 'Diestro',
      createdAt: Date.now() + index,
    });
  });

  return parsedPlayers;
}

export function exportPlayersToCsv(players: Player[]): string {
  const headers = ['Dorsal', 'Nombre', 'Posicion', 'ManoHabil', 'Color'];
  const rows = players.map((p) => [
    p.number,
    `"${p.name.replace(/"/g, '""')}"`,
    p.position,
    p.handedness || 'Diestro',
    p.avatarColor,
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function importPlayersFromCsv(csvText: string): Player[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length <= 1) return [];

  // Check if first line is header
  const startIndex = lines[0].toLowerCase().includes('dorsal') || lines[0].toLowerCase().includes('nombre') ? 1 : 0;
  const imported: Player[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const rawTokens = lines[i].split(',').map((t) => t.trim().replace(/^"|"$/g, ''));
    if (rawTokens.length < 2) continue;

    const num = parseInt(rawTokens[0], 10);
    const name = rawTokens[1];
    const pos = (rawTokens[2] as any) || 'Base';
    const hand = (rawTokens[3] as any) || 'Diestro';
    const color = rawTokens[4] || PLAYER_COLORS[imported.length % PLAYER_COLORS.length];

    if (name) {
      imported.push({
        id: `player-csv-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        name,
        number: isNaN(num) ? i + 1 : num,
        position: ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'].includes(pos) ? pos : 'Base',
        avatarColor: color,
        handedness: ['Diestro', 'Zurdo', 'Ambidiestro'].includes(hand) ? hand : 'Diestro',
        createdAt: Date.now() + i,
      });
    }
  }

  return imported;
}
