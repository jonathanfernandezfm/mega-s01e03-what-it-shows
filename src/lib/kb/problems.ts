// #4471 split into the problems it holds. Builds on causes.ts and counts the desk's way: every report
// under its cause by tenant, and the one-day moves the desk noted (desk-notes.json) also as their own
// problem, because a day/month swap cannot move a date by one day. Those few count in both.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift' | 'unplaced';


export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string; mistagged: number };

export function splitTicket(all: Report[], ticket: number, tenantOf: (r: Report) => Tenant | undefined, oneDayMove: readonly string[]): ProblemGroup[] {
  const by = new Map<Problem, Report[]>();
  const add = (p: Problem, r: Report) => by.set(p, [...(by.get(p) ?? []), r]);
  for (const r of uniqueById(all).filter((r) => r.mergedInto === ticket)) {
    add(causeOf(r, tenantOf(r)) ?? 'unplaced', r);
    if (oneDayMove.includes(r.id)) add('shift', r);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        // intake's tag only knows parser/hint; a shift tagged either way is still mistagged
        mistagged: rs.filter((r) => r.meta.intakeTag !== problem).length,
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
