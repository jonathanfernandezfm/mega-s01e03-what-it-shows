<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { splitTicket, type Problem } from '#lib/kb/problems';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: problem → the ticket that now owns it
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<Problem, { href: string; label: string }>> } = $props();

  const rows = (reports as Report[]).length;
  const groups = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const WHAT: Record<Problem, string> = {
    parser: 'shared parser reads day-first dates month first',
    hint: 'booking-v3 form hints MM/DD/YYYY, reads day first',
    shift: 'date moves by one day (not a swap)',
    unplaced: 'no tenant on file',
  };
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ({rows} export rows, {rows - total} duplicates by id) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>intake tag wrong</th><th>ticket</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> · {WHAT[g.problem]}</td>
        <td><strong>{g.reports.length}</strong></td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{g.mistagged}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]?.href}>{tickets[g.problem]?.label}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .none { color: var(--warn); font-weight: 600; }
</style>
