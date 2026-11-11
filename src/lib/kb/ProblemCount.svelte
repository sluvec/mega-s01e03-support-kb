<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { groupByProblem, reportsIn, type Problem } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One number for a sentence, computed at render time.
  // of: 'reports' (in the ticket) · 'problems' · 'rows' (export rows) · 'repeats' (rows that came twice) · a problem key
  let { ticket, of = 'reports' }: { ticket: number; of?: 'reports' | 'problems' | 'rows' | 'repeats' | Problem } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(reportsIn(ticket, reports as Report[]));
  const groups = $derived(groupByProblem(merged, tenantOf));
  const n = $derived(
    of === 'reports' ? merged.length
    : of === 'problems' ? groups.length
    : of === 'rows' ? rows.length
    : of === 'repeats' ? rows.length - merged.length
    : (groups.find((g) => g.problem === of)?.reports.length ?? 0),
  );
</script>

<strong>{n}</strong>
