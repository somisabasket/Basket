import { ShotZoneId, ZoneDefinition } from '../types';

export const COURT_DIMENSIONS = {
  widthMeters: 15,
  depthMeters: 14,
  hoopXPercent: 50,
  hoopYPercent: 11.25, // 1.575m from baseline
  threePointRadiusMeters: 6.75,
  threePointCornerXMeters: 6.6,
  cornerCutoffYPercent: 21.36, // ~2.99m from baseline
  cornerLeftXPercent: 6.0, // 0.9m from sideline
  cornerRightXPercent: 94.0,
  keyWidthPercent: 32.67, // 4.9m wide (from 33.67 to 66.33)
  keyLeftPercent: 33.67,
  keyRightPercent: 66.33,
  freeThrowDepthPercent: 41.43, // 5.8m from baseline
  restrictedAreaRadiusMeters: 1.25,
};

export const ZONE_DEFINITIONS: Record<ShotZoneId, ZoneDefinition> = {
  restricted_area: {
    id: 'restricted_area',
    name: 'Bajo el Aro (Zona Restringida)',
    shortName: 'Bajo Aro',
    isThree: false,
    description: 'Tiros a menos de 1.8m de la canasta (bandejas, volcadas y floaters cortos).',
  },
  paint: {
    id: 'paint',
    name: 'Pintura / Llave',
    shortName: 'Pintura',
    isThree: false,
    description: 'Dentro de la zona pintada fuera del semicírculo restringido.',
  },
  mid_left_corner: {
    id: 'mid_left_corner',
    name: 'Media Distancia - Fondo Izquierdo',
    shortName: 'Media Fondo Izq',
    isThree: false,
    description: 'Tiro de 2 puntos desde la línea de fondo izquierda.',
  },
  mid_left_wing: {
    id: 'mid_left_wing',
    name: 'Media Distancia - Codo Izquierdo',
    shortName: 'Media Codo Izq',
    isThree: false,
    description: 'Tiro de 2 puntos entre la pintura y el triple a 45° izq.',
  },
  mid_center: {
    id: 'mid_center',
    name: 'Media Distancia - Centro / TL',
    shortName: 'Media Centro',
    isThree: false,
    description: 'Tiro de 2 puntos frontal a la altura de la línea de tiros libres.',
  },
  mid_right_wing: {
    id: 'mid_right_wing',
    name: 'Media Distancia - Codo Derecho',
    shortName: 'Media Codo Der',
    isThree: false,
    description: 'Tiro de 2 puntos entre la pintura y el triple a 45° der.',
  },
  mid_right_corner: {
    id: 'mid_right_corner',
    name: 'Media Distancia - Fondo Derecho',
    shortName: 'Media Fondo Der',
    isThree: false,
    description: 'Tiro de 2 puntos desde la línea de fondo derecha.',
  },
  three_left_corner: {
    id: 'three_left_corner',
    name: 'Triple - Esquina Izquierda',
    shortName: '3PT Esq Izq',
    isThree: true,
    description: 'Tiro de 3 puntos desde la esquina izquierda (6.60m).',
  },
  three_left_wing: {
    id: 'three_left_wing',
    name: 'Triple - 45° Izquierda',
    shortName: '3PT 45° Izq',
    isThree: true,
    description: 'Tiro de 3 puntos desde el lateral izquierdo (6.75m).',
  },
  three_center: {
    id: 'three_center',
    name: 'Triple - Frente / Cabecera',
    shortName: '3PT Cabecera',
    isThree: true,
    description: 'Tiro de 3 puntos frontal frente a la canasta (6.75m).',
  },
  three_right_wing: {
    id: 'three_right_wing',
    name: 'Triple - 45° Derecha',
    shortName: '3PT 45° Der',
    isThree: true,
    description: 'Tiro de 3 puntos desde el lateral derecho (6.75m).',
  },
  three_right_corner: {
    id: 'three_right_corner',
    name: 'Triple - Esquina Derecha',
    shortName: '3PT Esq Der',
    isThree: true,
    description: 'Tiro de 3 puntos desde la esquina derecha (6.60m).',
  },
};

export const ALL_ZONES: ShotZoneId[] = [
  'restricted_area',
  'paint',
  'mid_left_corner',
  'mid_left_wing',
  'mid_center',
  'mid_right_wing',
  'mid_right_corner',
  'three_left_corner',
  'three_left_wing',
  'three_center',
  'three_right_wing',
  'three_right_corner',
];

/**
 * Given court coordinates in percentage (0 to 100),
 * calculates distance in meters from rim, whether it's a 3PT, and the zone ID.
 */
export function calculateShotDetails(x: number, y: number): {
  zoneId: ShotZoneId;
  zoneName: string;
  isThree: boolean;
  distanceMeters: number;
} {
  // Clamp coordinates
  const clampedX = Math.max(0, Math.min(100, x));
  const clampedY = Math.max(0, Math.min(100, y));

  const deltaXMeters = ((clampedX - COURT_DIMENSIONS.hoopXPercent) / 100) * COURT_DIMENSIONS.widthMeters;
  const deltaYMeters = ((clampedY - COURT_DIMENSIONS.hoopYPercent) / 100) * COURT_DIMENSIONS.depthMeters;
  const distanceMeters = Math.max(0.1, Number(Math.sqrt(deltaXMeters * deltaXMeters + deltaYMeters * deltaYMeters).toFixed(1)));

  // Angle in degrees from basket center pointing downcourt
  // 0 is straight down, negative is left side, positive is right side
  const angleDegrees = Math.atan2(deltaXMeters, Math.max(0.001, deltaYMeters)) * (180 / Math.PI);

  // Check 3-point status
  let isThree = false;
  if (clampedY <= COURT_DIMENSIONS.cornerCutoffYPercent) {
    // Corner region
    if (clampedX <= COURT_DIMENSIONS.cornerLeftXPercent || clampedX >= COURT_DIMENSIONS.cornerRightXPercent || distanceMeters >= COURT_DIMENSIONS.threePointRadiusMeters) {
      isThree = true;
    }
  } else {
    // Above corner cutoff
    if (distanceMeters >= COURT_DIMENSIONS.threePointRadiusMeters) {
      isThree = true;
    }
  }

  let zoneId: ShotZoneId;

  if (isThree) {
    if (clampedY <= COURT_DIMENSIONS.cornerCutoffYPercent + 2) {
      zoneId = clampedX < 50 ? 'three_left_corner' : 'three_right_corner';
    } else {
      if (angleDegrees < -25) {
        zoneId = 'three_left_wing';
      } else if (angleDegrees > 25) {
        zoneId = 'three_right_wing';
      } else {
        zoneId = 'three_center';
      }
    }
  } else {
    // 2-point territory
    if (distanceMeters <= 1.8) {
      zoneId = 'restricted_area';
    } else if (
      clampedX >= COURT_DIMENSIONS.keyLeftPercent &&
      clampedX <= COURT_DIMENSIONS.keyRightPercent &&
      clampedY <= COURT_DIMENSIONS.freeThrowDepthPercent + 1
    ) {
      zoneId = 'paint';
    } else {
      // Mid-range outside paint
      if (clampedY <= COURT_DIMENSIONS.cornerCutoffYPercent + 1) {
        zoneId = clampedX < 50 ? 'mid_left_corner' : 'mid_right_corner';
      } else {
        if (angleDegrees < -24) {
          zoneId = 'mid_left_wing';
        } else if (angleDegrees > 24) {
          zoneId = 'mid_right_wing';
        } else {
          zoneId = 'mid_center';
        }
      }
    }
  }

  return {
    zoneId,
    zoneName: ZONE_DEFINITIONS[zoneId].name,
    isThree,
    distanceMeters,
  };
}

/**
 * Returns efficiency level ('hot' | 'neutral' | 'cold')
 * based on shooting percentage and whether it is a 3PT or 2PT shot.
 */
export function getEfficiencyLevel(percentage: number, isThree: boolean): 'hot' | 'neutral' | 'cold' {
  if (isThree) {
    if (percentage >= 38) return 'hot';
    if (percentage >= 31) return 'neutral';
    return 'cold';
  } else {
    if (percentage >= 50) return 'hot';
    if (percentage >= 40) return 'neutral';
    return 'cold';
  }
}
