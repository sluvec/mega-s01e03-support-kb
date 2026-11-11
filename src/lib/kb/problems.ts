// The problems a big ticket holds, counted the desk's way. Builds on causes.ts; pages explain it, this file is what runs.
//
// The desk's own view (CauseTable) files every report under its cause by tenant and way in: `parser` or `hint`.
// Reports the desk read as a one-day move (desk-notes.json, `oneDayMove`) stay filed there, "counted where
// they're filed", and are a problem of their own on top: nothing is swapped, the booking lands a day early.
// So a one-day report counts twice: under its filed cause, and as `one-day`.
import notes from '#lib/data/desk-notes.json';
import { groupByCause, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'unplaced' | 'one-day';

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
  // How many of these reports the desk also reads as a one-day move.
  alsoOneDay: number;
};

const tally = (xs: string[]) => xs.reduce<Record<string, number>>((n, x) => ({ ...n, [x]: (n[x] ?? 0) + 1 }), {});

function describe(problem: Problem, rs: Report[], oneDay: readonly string[]): ProblemGroup {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
    channels: tally(rs.map((r) => r.channel)),
    taggedAs: tally(rs.map((r) => r.meta.intakeTag)),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    alsoOneDay: problem === 'one-day' ? 0 : rs.filter((r) => oneDay.includes(r.id)).length,
  };
}

export function groupByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDay: readonly string[] = notes.oneDayMove,
): ProblemGroup[] {
  const filed = groupByCause(reports, tenantOf).map((g) => describe(g.cause, g.reports, oneDay));
  // The same reports the #4471 page footnotes with readAs.
  const moved = reports.filter((r) => oneDay.includes(r.id));
  return moved.length ? [...filed, describe('one-day', moved, oneDay)] : filed;
}
