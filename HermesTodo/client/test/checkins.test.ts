import { describe,expect,it } from "vitest";
import { canonicalCycleAt, repeatProgress } from "../src/cloud/checkins";

describe("monthly check-in calendar anchoring",()=>{
  const monthly={repeatInterval:"monthly" as const,repeatRule:"",
    dueAt:"2027-01-31T06:40:41.000Z",createdAt:"2027-01-01T01:00:00.000Z"};

  it("keeps the exact local time and returns to the 31st after February",()=>{
    expect(repeatProgress(monthly,[],new Date("2027-01-31T06:40:41.000Z")))
      .toMatchObject({cycleAt:"2027-01-31T06:40:41.000Z",scheduledCount:1});
    expect(repeatProgress(monthly,[],new Date("2027-02-28T06:40:41.000Z")))
      .toMatchObject({cycleAt:"2027-02-28T06:40:41.000Z",scheduledCount:2});
    expect(repeatProgress(monthly,[],new Date("2027-03-30T06:40:41.000Z")))
      .toMatchObject({cycleAt:"2027-02-28T06:40:41.000Z",scheduledCount:2});
    expect(repeatProgress(monthly,[],new Date("2027-03-31T06:40:41.000Z")))
      .toMatchObject({cycleAt:"2027-03-31T06:40:41.000Z",scheduledCount:3});
  });

  it("keeps the same hour and minute over ordinary month boundaries",()=>{
    const task={...monthly,dueAt:"2026-11-05T06:40:41.000Z"};
    expect(repeatProgress(task,[],new Date("2026-12-05T06:40:40.000Z")))
      .toMatchObject({cycleAt:"2026-11-05T06:40:41.000Z",scheduledCount:1});
    expect(repeatProgress(task,[],new Date("2026-12-05T06:40:41.000Z")))
      .toMatchObject({cycleAt:"2026-12-05T06:40:41.000Z",scheduledCount:2});
  });

  it("recognizes an existing Postgres +00:00 check-in as completed, not another insert",()=>{
    const task={...monthly,dueAt:"2026-11-05T06:40:41.000Z"};
    const records=[
      {taskId:"one",cycleAt:"2026-11-05T06:40:41+00:00",completedAt:"2026-11-05T06:45:00+00:00"}
    ];
    expect(repeatProgress(task,records,new Date("2026-11-05T06:50:00.000Z")))
      .toMatchObject({cycleAt:"2026-11-05T06:40:41.000Z",cycleCompleted:true,
        scheduledCount:1,checkinCount:1,completionRate:100});
    expect(canonicalCycleAt("2026-11-05T14:40:41+08:00")).toBe("2026-11-05T06:40:41.000Z");
  });

  it("counts different textual representations of the same cycle only once",()=>{
    const task={...monthly,dueAt:"2026-11-05T06:40:41.000Z"};
    const records=[
      {taskId:"one",cycleAt:"2026-11-05T06:40:41.000Z",completedAt:"2026-11-05T06:45:00Z"},
      {taskId:"one",cycleAt:"2026-11-05T06:40:41+00:00",completedAt:"2026-11-05T06:46:00Z"},
      {taskId:"one",cycleAt:"2026-11-05T14:40:41+08:00",completedAt:"2026-11-05T06:47:00Z"}
    ];
    expect(repeatProgress(task,records,new Date("2026-11-05T06:50:00.000Z")))
      .toMatchObject({checkinCount:1,scheduledCount:1,completionRate:100,cycleCompleted:true});
  });

  it("does not lose February 29 when a future leap year returns",()=>{
    const annual={repeatInterval:"yearly" as const,repeatRule:"",
      dueAt:"2028-02-29T06:40:41.000Z",createdAt:"2028-02-01T00:00:00.000Z"};
    expect(repeatProgress(annual,[],new Date("2032-02-29T06:40:41.000Z")))
      .toMatchObject({cycleAt:"2032-02-29T06:40:41.000Z",scheduledCount:5});
  });
});
