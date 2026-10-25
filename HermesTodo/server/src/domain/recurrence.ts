import type { RepeatInterval } from "../../../shared/contracts";
import { fromZonedTime } from "date-fns-tz";

export interface RepeatRule {
  interval: RepeatInterval;
  customRule?: string;
}

interface WallClock {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

const weekdayIndex: Record<string, number> = {
  "日": 0,
  "一": 1,
  "二": 2,
  "三": 3,
  "四": 4,
  "五": 5,
  "六": 6
};

function wallClock(date: Date, timeZone: string): WallClock {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  });
  const values = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
    millisecond: date.getUTCMilliseconds()
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toInstant(parts: WallClock, timeZone: string): Date {
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  const local = `${pad(parts.year, 4)}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}.${pad(parts.millisecond, 3)}`;
  return fromZonedTime(local, timeZone);
}

function calendarDate(parts: WallClock): Date {
  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond)
  );
}

function fromCalendarDate(date: Date): WallClock {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
    millisecond: date.getUTCMilliseconds()
  };
}

function addDays(parts: WallClock, count: number): WallClock {
  const date = calendarDate(parts);
  date.setUTCDate(date.getUTCDate() + count);
  return fromCalendarDate(date);
}

function addMonths(parts: WallClock, count: number, anchorDay: number): WallClock {
  const monthIndex = parts.year * 12 + (parts.month - 1) + count;
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;
  return { ...parts, year, month, day: Math.min(anchorDay, daysInMonth(year, month)) };
}

function addYears(parts: WallClock, count: number, anchorMonth: number, anchorDay: number): WallClock {
  const year = parts.year + count;
  return {
    ...parts,
    year,
    month: anchorMonth,
    day: Math.min(anchorDay, daysInMonth(year, anchorMonth))
  };
}

export function isValidCustomRepeatRule(rule: string): boolean {
  const weekly = rule.match(/^每周([日一二三四五六])$/);
  if (weekly) {
    return true;
  }
  const monthly = rule.match(/^每月(\d{1,2})日$/);
  return monthly !== null && Number(monthly[1]) >= 1 && Number(monthly[1]) <= 31;
}

export function nextOccurrence(
  rule: RepeatRule,
  scheduledAt: Date | null,
  completedAt: Date,
  timeZone: string
): Date | null {
  if (rule.interval === "none") {
    return null;
  }

  const base = scheduledAt ?? completedAt;
  const anchor = wallClock(base, timeZone);
  const completedTime = completedAt.getTime();

  if (rule.interval === "custom") {
    const custom = rule.customRule ?? "";
    const weekly = custom.match(/^每周([日一二三四五六])$/);
    if (weekly) {
      const currentWeekday = calendarDate(anchor).getUTCDay();
      let delta = weekdayIndex[weekly[1]] - currentWeekday;
      if (delta <= 0) {
        delta += 7;
      }
      let candidateParts = addDays(anchor, delta);
      let candidate = toInstant(candidateParts, timeZone);
      while (candidate.getTime() <= completedTime) {
        candidateParts = addDays(candidateParts, 7);
        candidate = toInstant(candidateParts, timeZone);
      }
      return candidate;
    }

    const monthly = custom.match(/^每月(\d{1,2})日$/);
    if (!monthly) {
      return null;
    }
    const targetDay = Number(monthly[1]);
    let monthOffset = 0;
    let candidateParts = addMonths(anchor, monthOffset, targetDay);
    let candidate = toInstant(candidateParts, timeZone);
    if (candidate.getTime() <= base.getTime()) {
      monthOffset += 1;
      candidateParts = addMonths(anchor, monthOffset, targetDay);
      candidate = toInstant(candidateParts, timeZone);
    }
    while (candidate.getTime() <= completedTime) {
      monthOffset += 1;
      candidateParts = addMonths(anchor, monthOffset, targetDay);
      candidate = toInstant(candidateParts, timeZone);
    }
    return candidate;
  }

  let step = 1;
  while (step <= 100_000) {
    let candidateParts: WallClock;
    if (rule.interval === "daily") {
      candidateParts = addDays(anchor, step);
    } else if (rule.interval === "weekly") {
      candidateParts = addDays(anchor, step * 7);
    } else if (rule.interval === "monthly") {
      candidateParts = addMonths(anchor, step, anchor.day);
    } else {
      candidateParts = addYears(anchor, step, anchor.month, anchor.day);
    }
    const candidate = toInstant(candidateParts, timeZone);
    if (candidate.getTime() > completedTime) {
      return candidate;
    }
    step += 1;
  }
  throw new Error("Could not calculate a future recurrence");
}
