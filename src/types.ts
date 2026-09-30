export type PlayerPosition = 'Base' | 'Escolta' | 'Alero' | 'Ala-Pívot' | 'Pívot';

export type Handedness = 'Diestro' | 'Zurdo' | 'Ambidiestro';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: PlayerPosition;
  avatarColor: string;
  handedness?: Handedness;
  createdAt: number;
}

export type ShotZoneId =
  | 'restricted_area'
  | 'paint'
  | 'mid_left_corner'
  | 'mid_left_wing'
  | 'mid_center'
  | 'mid_right_wing'
  | 'mid_right_corner'
  | 'three_left_corner'
  | 'three_left_wing'
  | 'three_center'
  | 'three_right_wing'
  | 'three_right_corner';

export type ShotType =
  | 'jump_shot'
  | 'catch_and_shoot'
  | 'layup'
  | 'dunk'
  | 'floater'
  | 'hook'
  | 'pull_up'
  | 'step_back';

export interface Shot {
  id: string;
  playerId: string;
  x: number; // 0 to 100 percentage of half-court width
  y: number; // 0 to 100 percentage of half-court depth (0 is baseline, 100 is half-court)
  made: boolean;
  timestamp: number;
  zoneId: ShotZoneId;
  zoneName: string;
  isThree: boolean;
  distanceMeters: number;
  shotType?: ShotType;
  quarter?: number;
  notes?: string;
}

export interface ZoneDefinition {
  id: ShotZoneId;
  name: string;
  shortName: string;
  isThree: boolean;
  description: string;
}

export interface ZoneStat {
  zoneId: ShotZoneId;
  name: string;
  shortName: string;
  isThree: boolean;
  attempts: number;
  made: number;
  percentage: number;
  points: number;
  pctOfTotalAttempts: number;
  efficiencyRating: 'hot' | 'neutral' | 'cold';
}

export type MatchPeriod = '1C' | '2C' | '3C' | '4C' | 'PR' | 'ENT';

export interface PlayerGameStats {
  rebounds: number;  // Rebotes
  assists: number;   // Asistencias
  turnovers: number; // Pérdidas
}

export interface PlayerOverallStats {
  playerId: string;
  playerName: string;
  playerNumber: number;
  secondsPlayed?: number;
  totalAttempts: number;
  totalMade: number;
  totalPercentage: number;
  twoAttempts: number;
  twoMade: number;
  twoPercentage: number;
  threeAttempts: number;
  threeMade: number;
  threePercentage: number;
  totalPoints: number;
  effectiveFgPercentage: number; // (FG + 0.5 * 3P) / FGA
  bestZone?: { name: string; percentage: number; attempts: number };
  coldZone?: { name: string; percentage: number; attempts: number };
  streak: number; // positive for consecutive makes, negative for consecutive misses
  rebounds: number;  // Rebotes
  assists: number;   // Asistencias
  turnovers: number; // Pérdidas
  astToRatio: number; // Ratio Asistencias / Pérdidas
}

export type CourtViewMode = 'markers' | 'zones' | 'heatmap';
export type CourtTheme = 'hardwood' | 'tactical';
