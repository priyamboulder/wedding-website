import type {
  ChecklistItem,
  EventDayId,
  EventDayOffset,
} from "@/types/checklist";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const TEMPLATE_DEFAULT_WINDOW_DAYS = 365;

export interface EventDayInfo {
  daysOffset: number;
  mainHour: number;
  label: string;
}

export const EVENT_DAYS: Record<EventDayId, EventDayInfo> = {
  welcome: { daysOffset: -3, mainHour: 19, label: "Welcome Day" },
  ganesh_puja: { daysOffset: -2, mainHour: 9, label: "Ganesh Puja" },
  mehndi: { daysOffset: -2, mainHour: 11, label: "Mehndi" },
  haldi: { daysOffset: -1, mainHour: 10, label: "Haldi" },
  sangeet: { daysOffset: -1, mainHour: 19, label: "Sangeet" },
  wedding: { daysOffset: 0, mainHour: 11, label: "Wedding" },
  reception: { daysOffset: 0, mainHour: 19, label: "Reception" },
  post_brunch: { daysOffset: 1, mainHour: 11, label: "Post-Wedding Brunch" },
};

export interface DeadlineOptions {
  now?: Date;
  templateWindowDays?: number;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function eventDayDeadline(
  weddingDate: Date,
  offset: EventDayOffset,
): Date {
  const info = EVENT_DAYS[offset.eventDay];
  if (!info) return new Date(weddingDate);
  const d = new Date(weddingDate);
  d.setDate(d.getDate() + info.daysOffset);
  d.setHours(info.mainHour, 0, 0, 0);
  d.setTime(d.getTime() - offset.hoursBefore * 60 * 60 * 1000);
  return d;
}

export function computeAutoDeadline(
  task: ChecklistItem,
  weddingDate: Date | null,
  options?: DeadlineOptions,
): Date | null {
  if (!weddingDate) return null;

  if (task.eventDayOffset) {
    return eventDayDeadline(weddingDate, task.eventDayOffset);
  }

  if (typeof task.daysBeforeWedding !== "number") return null;

  const now = options?.now ?? new Date();
  const windowDays =
    options?.templateWindowDays ?? TEMPLATE_DEFAULT_WINDOW_DAYS;

  const wedDay = startOfDay(weddingDate);
  const today = startOfDay(now);
  const remainingDays = (wedDay.getTime() - today.getTime()) / MS_PER_DAY;

  let effectiveOffset = task.daysBeforeWedding;

  if (remainingDays > 0 && remainingDays < windowDays) {
    const scale = remainingDays / windowDays;
    effectiveOffset = task.daysBeforeWedding * scale;
  }

  const result = new Date(wedDay);
  result.setDate(result.getDate() - Math.round(effectiveOffset));
  return result;
}

export function computeDeadline(
  task: ChecklistItem,
  weddingDate: Date | null,
  options?: DeadlineOptions,
): { date: Date | null; isOverride: boolean } {
  if (task.due_date) {
    return { date: new Date(task.due_date), isOverride: true };
  }
  return {
    date: computeAutoDeadline(task, weddingDate, options),
    isOverride: false,
  };
}

export function isAtRisk(
  task: ChecklistItem,
  weddingDate: Date | null,
  options?: DeadlineOptions,
): boolean {
  if (task.status === "done" || task.status === "not_applicable") return false;
  const { date } = computeDeadline(task, weddingDate, options);
  if (!date) return false;
  const now = options?.now ?? new Date();
  return startOfDay(date).getTime() < startOfDay(now).getTime();
}

export function isDueThisWeek(
  task: ChecklistItem,
  weddingDate: Date | null,
  options?: DeadlineOptions,
): boolean {
  const { date } = computeDeadline(task, weddingDate, options);
  if (!date) return false;
  const now = options?.now ?? new Date();
  const start = startOfDay(now);
  start.setDate(start.getDate() - start.getDay());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

export function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isWeddingInPast(
  weddingDate: Date | null,
  now: Date = new Date(),
): boolean {
  if (!weddingDate) return false;
  return startOfDay(weddingDate).getTime() < startOfDay(now).getTime();
}
