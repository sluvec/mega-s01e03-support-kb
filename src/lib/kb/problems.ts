// Which problem a report in a big ticket really is. Builds on causes.ts; pages explain it, this file is what runs.
//
// causes.ts tells the two date-order bugs apart by tenant and way in (`parser`, `hint`). Reports the desk
// read as a one-day move (desk-notes.json, `oneDayMove`) are neither: nothing is swapped, the booking lands
// a day early. causes.ts still files them under a date-order cause by tenant; here they are their own problem.
import notes from '#lib/data/desk-notes.json';
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'one-day' | 'unplaced';

export function problemOf(
  r: Pick<Report, 'id' | 'channel'>,
  t: Tenant | undefined,
  oneDay: readonly string[] = notes.oneDayMove,
): Problem {
  if (oneDay.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

// The reports a ticket holds: one id, one report, merged into that ticket.
export function reportsIn(ticket: number, rows: Report[]): Report[] {
  return uniqueById(rows).filter((r) => r.mergedInto === ticket);
}

export type ProblemGroup = {
  problem: Problem;
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  // What intake tagged these reports as: tag → count.
  taggedAs: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const tally = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[] = notes.oneDayMove,
): ProblemGroup[] {
  const by = new Map<Problem, Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), oneDay);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
        channels: tally(rs.map((r) => r.channel)),
        taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
