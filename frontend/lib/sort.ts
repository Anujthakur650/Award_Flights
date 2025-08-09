import { type AwardFlight } from "@/lib/api";

export type FlightSortOption = "none" | "lowestMiles" | "shortestDuration" | "nonStopFirst";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function minDefined(numbers: Array<number | undefined | null>): number | null {
  const vals = numbers.filter((n): n is number => isFiniteNumber(Number(n)));
  if (vals.length === 0) return null;
  return Math.min(...vals);
}

export function getBestMilesForFlight(flight: AwardFlight): number | null {
  // Prefer offers[].miles (real Seats.aero data)
  if (Array.isArray(flight.offers) && flight.offers.length > 0) {
    const miles = flight.offers
      .map((o) => (isFiniteNumber(o.miles) ? (o.miles as number) : Number.NaN))
      .filter((m) => Number.isFinite(m)) as number[];
    if (miles.length > 0) return Math.min(...miles);
  }

  // Legacy fallback: pointsCost object (mock data path)
  const legacy = flight.pointsCost;
  if (legacy) {
    const minLegacy = minDefined([legacy.economy, legacy.premium, legacy.business, legacy.first]);
    if (minLegacy != null) return minLegacy;
  }

  return null;
}

function parseIsoToUTCMinutes(iso?: string): number | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(iso);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const h = parseInt(m[4], 10);
  const mi = parseInt(m[5], 10);
  const s = m[6] ? parseInt(m[6], 10) : 0;
  return Math.floor(Date.UTC(y, mo, d, h, mi, s) / 60000);
}

function parseDurationStringToMinutes(duration?: string | null): number | null {
  if (!duration || typeof duration !== "string") return null;
  const hMatch = /([0-9]+)\s*h/.exec(duration);
  const mMatch = /([0-9]+)\s*m/.exec(duration);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
  const total = hours * 60 + mins;
  return Number.isFinite(total) && total > 0 ? total : null;
}

export function getDurationMinutesForFlight(flight: AwardFlight): number | null {
  // Prefer computing from absolute timestamps
  const dep = flight.departureTime || flight.departureTimeLocal || null;
  const arr = flight.arrivalTime || flight.arrivalTimeLocal || null;
  const dm = parseIsoToUTCMinutes(dep || undefined);
  const am = parseIsoToUTCMinutes(arr || undefined);
  if (dm != null && am != null && am >= dm) {
    return am - dm;
  }
  // Fallback: parse duration string like "8h 30m"
  return parseDurationStringToMinutes(flight.duration);
}

export function sortFlights(flights: AwardFlight[], option: FlightSortOption): AwardFlight[] {
  if (!Array.isArray(flights)) return [];
  if (option === "none") return flights.slice();

  const decorated = flights.map((f, idx) => {
    const bestMiles = getBestMilesForFlight(f);
    const durationMins = getDurationMinutesForFlight(f);
    const stops = typeof f.stops === "number" ? f.stops : Number.POSITIVE_INFINITY;
    return { f, idx, bestMiles, durationMins, stops };
  });

  if (option === "lowestMiles") {
    decorated.sort((a, b) => {
      const aHas = a.bestMiles != null;
      const bHas = b.bestMiles != null;
      if (aHas && bHas) {
        if ((a.bestMiles as number) !== (b.bestMiles as number)) {
          return (a.bestMiles as number) - (b.bestMiles as number);
        }
        return a.idx - b.idx; // stable tie-breaker
      }
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return a.idx - b.idx;
    });
  } else if (option === "shortestDuration") {
    decorated.sort((a, b) => {
      const aHas = a.durationMins != null;
      const bHas = b.durationMins != null;
      if (aHas && bHas) {
        if ((a.durationMins as number) !== (b.durationMins as number)) {
          return (a.durationMins as number) - (b.durationMins as number);
        }
        return a.idx - b.idx;
      }
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return a.idx - b.idx;
    });
  } else if (option === "nonStopFirst") {
    decorated.sort((a, b) => {
      const aNonStop = a.stops === 0 ? 0 : 1;
      const bNonStop = b.stops === 0 ? 0 : 1;
      if (aNonStop !== bNonStop) return aNonStop - bNonStop; // 0 before others
      if (a.stops !== b.stops) return a.stops - b.stops; // then fewer stops first
      return a.idx - b.idx;
    });
  }

  return decorated.map((d) => d.f);
}


