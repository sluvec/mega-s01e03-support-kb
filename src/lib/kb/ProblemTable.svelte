<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { groupByProblem, reportsIn, type Problem } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // `problems`: the page's words for each problem and the ticket filed for it.
  type Named = { key: Problem; name: string; ticket?: string };
  let { ticket, problems = [] }: { ticket: number; problems?: Named[] } = $props();

  const merged = $derived(reportsIn(ticket, reports as Report[]));
  const groups = $derived(groupByProblem(merged, tenantOf));
  const placed = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const named = (p: Problem) => problems.find((x) => x.key === p);
  const list = (n: Record<string, number>) =>
    Object.entries(n)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ×${v}`)
      .join(' · ');
  const ticketLabel = (url: string) => url.replace(/^https:\/\/github\.com\//, '').replace('/issues/', '#');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'} ·
  every report in exactly one: <strong>{placed === merged.length ? 'yes' : `no, ${merged.length - placed} left over`}</strong>
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>way in</th><th>seen</th><th>intake tagged as</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const n = named(g.problem)}
      <tr class:open={!n?.ticket}>
        <td><code>{g.problem}</code>{#if n}<br /><span class="name">{n.name}</span>{/if}</td>
        <td><strong>{g.reports.length}</strong></td>
        <td title={g.tenants.join(', ')}>{g.tenants.length}</td>
        <td class="small">{list(g.channels)}</td>
        <td class="small">{g.firstSeen} → {g.lastSeen}</td>
        <td class="small">{list(g.taggedAs)}</td>
        <td>{#if n?.ticket}<a href={n.ticket}>{ticketLabel(n.ticket)}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.05rem; }
  .name { color: var(--muted); font-size: 0.85em; }
  .small { color: var(--muted); font-size: 0.82em; }
  .open td { background: var(--warn-bg); }
</style>
