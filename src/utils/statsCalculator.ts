import { Player, Shot, ShotZoneId, ZoneStat, PlayerOverallStats, PlayerGameStats } from '../types';
import { ALL_ZONES, ZONE_DEFINITIONS, getEfficiencyLevel } from './courtGeometry';

export function calculateZoneStats(shots: Shot[]): ZoneStat[] {
  const totalAttempts = shots.length;

  return ALL_ZONES.map((zoneId) => {
    const zoneDef = ZONE_DEFINITIONS[zoneId];
    const zoneShots = shots.filter((s) => s.zoneId === zoneId);
    const attempts = zoneShots.length;
    const made = zoneShots.filter((s) => s.made).length;
    const percentage = attempts > 0 ? Math.round((made / attempts) * 100) : 0;
    const points = made * (zoneDef.isThree ? 3 : 2);
    const pctOfTotalAttempts = totalAttempts > 0 ? Math.round((attempts / totalAttempts) * 100) : 0;
    const efficiencyRating = attempts > 0 ? getEfficiencyLevel(percentage, zoneDef.isThree) : 'neutral';

    return {
      zoneId,
      name: zoneDef.name,
      shortName: zoneDef.shortName,
      isThree: zoneDef.isThree,
      attempts,
      made,
      percentage,
      points,
      pctOfTotalAttempts,
      efficiencyRating,
    };
  });
}

export function calculateOverallStats(
  shots: Shot[],
  players: Player[],
  selectedPlayerId: string | 'all',
  playerStats?: Record<string, PlayerGameStats>,
  playerMinutes?: Record<string, number>
): PlayerOverallStats {
  const filteredShots = selectedPlayerId === 'all'
    ? shots
    : shots.filter((s) => s.playerId === selectedPlayerId);

  const activePlayer = players.find((p) => p.id === selectedPlayerId);
  const playerName = activePlayer ? activePlayer.name : 'Todos los Jugadores';
  const playerNumber = activePlayer ? activePlayer.number : 0;
  const secondsPlayed = selectedPlayerId !== 'all' ? (playerMinutes?.[selectedPlayerId] || 0) : undefined;

  const totalAttempts = filteredShots.length;
  const totalMade = filteredShots.filter((s) => s.made).length;
  const totalPercentage = totalAttempts > 0 ? Math.round((totalMade / totalAttempts) * 1000) / 10 : 0;

  const twoShots = filteredShots.filter((s) => !s.isThree);
  const twoAttempts = twoShots.length;
  const twoMade = twoShots.filter((s) => s.made).length;
  const twoPercentage = twoAttempts > 0 ? Math.round((twoMade / twoAttempts) * 1000) / 10 : 0;

  const threeShots = filteredShots.filter((s) => s.isThree);
  const threeAttempts = threeShots.length;
  const threeMade = threeShots.filter((s) => s.made).length;
  const threePercentage = threeAttempts > 0 ? Math.round((threeMade / threeAttempts) * 1000) / 10 : 0;

  const totalPoints = twoMade * 2 + threeMade * 3;

  // eFG% = (FGM + 0.5 * 3PM) / FGA
  const effectiveFgPercentage = totalAttempts > 0
    ? Math.round(((totalMade + 0.5 * threeMade) / totalAttempts) * 1000) / 10
    : 0;

  // Calculate Rebounds, Assists, Turnovers
  let rebounds = 0;
  let assists = 0;
  let turnovers = 0;

  if (selectedPlayerId === 'all') {
    if (playerStats) {
      Object.values(playerStats).forEach((ps) => {
        rebounds += ps.rebounds || 0;
        assists += ps.assists || 0;
        turnovers += ps.turnovers || 0;
      });
    }
  } else {
    const ps = playerStats?.[selectedPlayerId];
    rebounds = ps?.rebounds || 0;
    assists = ps?.assists || 0;
    turnovers = ps?.turnovers || 0;
  }

  const astToRatio = turnovers > 0
    ? Math.round((assists / turnovers) * 10) / 10
    : assists;

  // Best & Cold zone calculation (with minimum 2 attempts)
  const zoneStats = calculateZoneStats(filteredShots).filter((z) => z.attempts >= 2);
  let bestZone: { name: string; percentage: number; attempts: number } | undefined;
  let coldZone: { name: string; percentage: number; attempts: number } | undefined;

  if (zoneStats.length > 0) {
    const sortedDesc = [...zoneStats].sort((a, b) => b.percentage - a.percentage || b.attempts - a.attempts);
    const sortedAsc = [...zoneStats].sort((a, b) => a.percentage - b.percentage || b.attempts - a.attempts);

    if (sortedDesc[0]) {
      bestZone = {
        name: sortedDesc[0].shortName,
        percentage: sortedDesc[0].percentage,
        attempts: sortedDesc[0].attempts,
      };
    }
    if (sortedAsc[0] && sortedAsc[0].percentage < (bestZone?.percentage ?? 100)) {
      coldZone = {
        name: sortedAsc[0].shortName,
        percentage: sortedAsc[0].percentage,
        attempts: sortedAsc[0].attempts,
      };
    }
  }

  // Calculate streak from latest shots
  let streak = 0;
  if (filteredShots.length > 0) {
    const sortedShots = [...filteredShots].sort((a, b) => b.timestamp - a.timestamp);
    const firstResult = sortedShots[0].made;
    for (const shot of sortedShots) {
      if (shot.made === firstResult) {
        streak += firstResult ? 1 : -1;
      } else {
        break;
      }
    }
  }

  return {
    playerId: selectedPlayerId,
    playerName,
    playerNumber,
    secondsPlayed,
    totalAttempts,
    totalMade,
    totalPercentage,
    twoAttempts,
    twoMade,
    twoPercentage,
    threeAttempts,
    threeMade,
    threePercentage,
    totalPoints,
    effectiveFgPercentage,
    bestZone,
    coldZone,
    streak,
    rebounds,
    assists,
    turnovers,
    astToRatio,
  };
}

export function calculatePlayerLeaderboard(
  shots: Shot[],
  players: Player[],
  playerStats?: Record<string, PlayerGameStats>,
  playerMinutes?: Record<string, number>
) {
  return players.map((player) => {
    const pShots = shots.filter((s) => s.playerId === player.id);
    const attempts = pShots.length;
    const made = pShots.filter((s) => s.made).length;
    const percentage = attempts > 0 ? Math.round((made / attempts) * 1000) / 10 : 0;
    const threeShots = pShots.filter((s) => s.isThree);
    const threeAttempts = threeShots.length;
    const threeMade = threeShots.filter((s) => s.made).length;
    const threePercentage = threeAttempts > 0 ? Math.round((threeMade / threeAttempts) * 1000) / 10 : 0;
    const points = (made - threeMade) * 2 + threeMade * 3;
    const eFG = attempts > 0 ? Math.round(((made + 0.5 * threeMade) / attempts) * 1000) / 10 : 0;
    const secondsPlayed = playerMinutes?.[player.id] || 0;

    const pStats = playerStats?.[player.id];
    const rebounds = pStats?.rebounds || 0;
    const assists = pStats?.assists || 0;
    const turnovers = pStats?.turnovers || 0;
    const astToRatio = turnovers > 0
      ? Math.round((assists / turnovers) * 10) / 10
      : assists;

    return {
      player,
      attempts,
      made,
      percentage,
      threeAttempts,
      threeMade,
      threePercentage,
      points,
      eFG,
      secondsPlayed,
      rebounds,
      assists,
      turnovers,
      astToRatio,
    };
  }).sort((a, b) => b.points - a.points || (b.rebounds + b.assists) - (a.rebounds + a.assists) || b.percentage - a.percentage);
}

