export const DEFAULT_SCHEDULED_OFFLINE_START = "18:00";
export const DEFAULT_SCHEDULED_OFFLINE_END = "06:00";

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface ParsedTimeHHMM {
  hours: number;
  minutes: number;
  totalMinutes: number;
  normalized: string;
}

export function parseTimeHHMM(value: string | null | undefined, fallback: string): ParsedTimeHHMM {
  const candidate = (value ?? "").trim();
  const match = TIME_PATTERN.exec(candidate) ?? TIME_PATTERN.exec(fallback);
  if (!match) {
    return { hours: 18, minutes: 0, totalMinutes: 18 * 60, normalized: "18:00" };
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  return {
    hours,
    minutes,
    totalMinutes: hours * 60 + minutes,
    normalized: `${match[1]}:${match[2]}`,
  };
}

export function formatTime12h(hhmm: string): string {
  const { hours, minutes } = parseTimeHHMM(hhmm, DEFAULT_SCHEDULED_OFFLINE_START);
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/**
 * Evaluates whether `now` falls inside the daily [start, end) window in GMT+0 (UTC+0).
 * Supports overnight windows (e.g. 18:00 -> 06:00) and same-day windows (e.g. 09:00 -> 17:00).
 */
export function isWithinScheduledOfflineWindow(
  startHHMM: string | null | undefined,
  endHHMM: string | null | undefined,
  now: Date = new Date()
): boolean {
  const start = parseTimeHHMM(startHHMM, DEFAULT_SCHEDULED_OFFLINE_START);
  const end = parseTimeHHMM(endHHMM, DEFAULT_SCHEDULED_OFFLINE_END);

  if (start.totalMinutes === end.totalMinutes) {
    return false;
  }

  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  if (start.totalMinutes < end.totalMinutes) {
    return currentMinutes >= start.totalMinutes && currentMinutes < end.totalMinutes;
  }
  return currentMinutes >= start.totalMinutes || currentMinutes < end.totalMinutes;
}

export function formatScheduledOfflineMessage(
  startHHMM: string | null | undefined,
  endHHMM: string | null | undefined
): string {
  const start = parseTimeHHMM(startHHMM, DEFAULT_SCHEDULED_OFFLINE_START);
  const end = parseTimeHHMM(endHHMM, DEFAULT_SCHEDULED_OFFLINE_END);
  return `Ordering is currently closed for scheduled off-hours (${formatTime12h(start.normalized)} – ${formatTime12h(end.normalized)} GMT+0). All data packages will be back online at ${formatTime12h(end.normalized)} GMT+0.`;
}
