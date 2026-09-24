/**
 * Haversine formula to compute great-circle distance between two [lat, lng] coordinates in kilometers.
 */
export function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2 || coord1.length < 2 || coord2.length < 2) return 0;
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;

  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 100) / 100; // 2 decimal places
}

/**
 * Estimate transit time assuming urban average traffic speed of 22 km/h + 8 min turnaround per stop.
 */
export function estimateTravelTime(distanceKm, stopCount = 1) {
  const transitMinutes = (distanceKm / 22) * 60;
  const stopTurnaround = stopCount * 8;
  return Math.round(transitMinutes + stopTurnaround);
}

/**
 * Heuristic route optimizer prioritizing urgent food (perishables near safe window limit)
 * followed by nearest neighbor distance.
 */
export function solveUrgentRoute(originCoord, stops) {
  if (!stops || stops.length === 0) {
    return { orderedStops: [], totalDistanceKm: 0, totalDurationMin: 0 };
  }

  const urgencyWeights = {
    IMMEDIATE: 100,
    URGENT: 75,
    ELEVATED: 40,
    NORMAL: 10
  };

  let unvisited = [...stops];
  let currentCoord = originCoord;
  let orderedStops = [];
  let totalDistanceKm = 0;

  while (unvisited.length > 0) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const stop = unvisited[i];
      const dist = calculateDistance(currentCoord, stop.coordinates || originCoord);
      const urg = urgencyWeights[stop.urgency] || 20;

      // Higher urgency increases priority; greater distance decreases priority
      // Score = (Urgency weight * 1.5) - (Distance * 4)
      const score = urg * 1.5 - dist * 4;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const nextStop = unvisited.splice(bestIndex, 1)[0];
    const legDistance = calculateDistance(currentCoord, nextStop.coordinates || originCoord);
    totalDistanceKm += legDistance;
    currentCoord = nextStop.coordinates || originCoord;
    orderedStops.push({
      ...nextStop,
      legDistanceKm: Math.round(legDistance * 100) / 100
    });
  }

  // Return to base/origin
  const returnDist = calculateDistance(currentCoord, originCoord);
  totalDistanceKm += returnDist;
  totalDistanceKm = Math.round(totalDistanceKm * 100) / 100;

  const totalDurationMin = estimateTravelTime(totalDistanceKm, orderedStops.length);

  return {
    orderedStops,
    returnToBaseKm: Math.round(returnDist * 100) / 100,
    totalDistanceKm,
    totalDurationMin
  };
}
