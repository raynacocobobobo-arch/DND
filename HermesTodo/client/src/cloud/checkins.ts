import { nextOccurrence } from "./recurrence";
import type { RepeatInterval } from "../../../shared/contracts";

export type RecurringInput = {
  repeatInterval: RepeatInterval;
  repeatRule: string;
  dueAt: string | null;
  createdAt: string;
};
export type Checkin = { taskId: string; cycleAt: string; completedAt: string };
export type RepeatProgress = {
  cycleAt: string | null;
  cycleCompleted: boolean;
  checkinCount: number;
  scheduledCount: number;
  completionRate: number;
};

const ZONE = "Asia/Shanghai";
const pad = (n:number)=>String(n).padStart(2,"0");

function localParts(iso:string) {
  const parts = new Intl.DateTimeFormat("en-US",{
    timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",hourCycle:"h23"
  }).formatToParts(new Date(iso));
  const get=(kind:string)=>Number(parts.find(p=>p.type===kind)?.value??0);
  return {year:get("year"),month:get("month"),day:get("day"),hour:get("hour"),minute:get("minute")};
}
function localIso(y:number,m:number,d:number,h:number,min:number) {
  return new Date(Date.UTC(y,m-1,d,h-8,min)).toISOString();
}
function initialOccurrence(task:RecurringInput):Date {
  const anchor = task.dueAt || task.createdAt;
  const custom = /^每周([一二三四五六日])$/.exec(task.repeatRule);
  const monthly = /^每月(\d{1,2})日$/.exec(task.repeatRule);
  if (!custom && !monthly) return new Date(anchor);
  const p=localParts(anchor);
  if (custom) {
    const weekdays:Record<string,number>={日:0,一:1,二:2,三:3,四:4,五:5,六:6};
    const current=new Date(Date.UTC(p.year,p.month-1,p.day)).getUTCDay();
    const delta=(weekdays[custom[1]]-current+7)%7;
    return new Date(localIso(p.year,p.month,p.day+delta,p.hour,p.minute));
  }
  const n=Number(monthly![1]);
  const last=new Date(Date.UTC(p.year,p.month,0)).getUTCDate();
  const candidate=new Date(localIso(p.year,p.month,Math.min(n,last),p.hour,p.minute));
  if (candidate.getTime() >= new Date(anchor).getTime()) return candidate;
  const nextMonth=new Date(Date.UTC(p.year,p.month,1));
  const y=nextMonth.getUTCFullYear(),m=nextMonth.getUTCMonth()+1;
  const cap=new Date(Date.UTC(y,m,0)).getUTCDate();
  return new Date(localIso(y,m,Math.min(n,cap),p.hour,p.minute));
}

/** Determine which scheduled period is current; count missed and completed periods.
 * Checkins are unique by task and cycle, preventing duplicate credit.
 */
export function repeatProgress(task:RecurringInput, records:Checkin[],now:Date = new Date()):RepeatProgress {
  if (task.repeatInterval === "none") return {
    cycleAt:null,cycleCompleted:false,checkinCount:records.length,scheduledCount:0,completionRate:0
  };
  const rule={interval:task.repeatInterval,customRule:task.repeatRule};
  const initial=initialOccurrence(task);
  let candidate=initial;
  // Never allow a broken schedule to hang the UI.
  if (!Number.isFinite(candidate.getTime())) return {cycleAt:null,cycleCompleted:false,checkinCount:records.length,scheduledCount:0,completionRate:0};
  let current:string|null=null,scheduled=0;
  const end=now.getTime();
  for(let i=0;i<60000 && candidate.getTime()<=end;i++){
    current=candidate.toISOString();
    scheduled++;
    // Always compute monthly/yearly dates from the original anchor.
    // Otherwise Jan 31 -> Feb 28 would incorrectly drift to Mar 28.
    const anchored=task.repeatInterval==="monthly" || task.repeatInterval==="yearly" ||
      (task.repeatInterval==="custom" && /^每月\d{1,2}日$/.test(task.repeatRule));
    const next=nextOccurrence(rule,anchored?initial: candidate,new Date(candidate.getTime()+1),ZONE);
    if (!next || next.getTime()<=candidate.getTime()) break;
    candidate=next;
  }
  const unique=new Set(records.map(x=>x.cycleAt));
  const completed=records.filter((x,i)=>unique.has(x.cycleAt)&&records.findIndex(y=>y.cycleAt===x.cycleAt)===i).length;
  const cycleCompleted=!!current&&unique.has(current);
  return {
    cycleAt:current,cycleCompleted,checkinCount:completed,scheduledCount:scheduled,
    completionRate:scheduled?Math.round(completed/scheduled*100):0
  };
}
