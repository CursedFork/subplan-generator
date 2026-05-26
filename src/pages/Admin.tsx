import { useAdminStats, useAdminRecentPlans } from '@/hooks/useAdmin';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-md border border-rule bg-paper shadow-card px-6 py-5 theme-aware">
      <p className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint mb-2">
        {label}
      </p>
      <p className="font-display text-display-lg text-ink leading-none">{value}</p>
      {sub && <p className="text-xs font-sans text-ink-faint mt-1">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: plans, isLoading: plansLoading } = useAdminRecentPlans(20);

  return (
    <div className="space-y-10 max-w-5xl">

      {/* Header */}
      <div>
        <h1 className="font-display text-display-lg text-ink">Admin</h1>
        <p className="font-sans text-sm text-ink-soft mt-1">
          Live stats — refreshes every 30 seconds.
        </p>
      </div>

      {/* Stat cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-md border border-rule bg-paper shadow-card px-6 py-5 animate-pulse h-24" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total users"  value={stats.total_users} />
          <StatCard label="Total plans"  value={stats.total_plans} />
          <StatCard label="Finalized"    value={stats.final_plans} sub="ready to print" />
          <StatCard label="Drafts"       value={stats.draft_plans} sub="in progress" />
          <StatCard label="Plans today"  value={stats.plans_today} sub="last 24 h" />
        </div>
      ) : (
        <p className="text-sm font-sans text-terracotta">Failed to load stats.</p>
      )}

      {/* Recent plans table */}
      <section>
        <h2 className="text-xs font-sans font-semibold uppercase tracking-widest text-ink-faint mb-4">
          Recent plans (last 20)
        </h2>

        {plansLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 rounded-md bg-rule/40 animate-pulse" />
            ))}
          </div>
        ) : plans?.length ? (
          <div className="rounded-md border border-rule overflow-hidden">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-rule bg-terracotta-soft">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink-faint">Title</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink-faint hidden sm:table-cell">Grade</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink-faint hidden md:table-cell">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink-faint">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-ink-faint hidden md:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p, i) => (
                  <tr
                    key={p.plan_id}
                    className={`border-b border-rule last:border-0 ${i % 2 === 0 ? 'bg-paper' : 'bg-terracotta-soft/20'} theme-aware`}
                  >
                    <td className="px-4 py-3 text-ink font-medium truncate max-w-[200px]">
                      {p.title}
                    </td>
                    <td className="px-4 py-3 text-ink-soft hidden sm:table-cell">
                      {p.grade ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="block text-ink">{p.user_name}</span>
                      <span className="block text-ink-faint text-xs">{p.user_email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-[10px] font-semibold uppercase tracking-widest rounded px-2 py-0.5 ${
                        p.status === 'final'
                          ? 'text-sage border border-sage/40'
                          : 'text-ink-faint border border-rule'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-soft hidden md:table-cell whitespace-nowrap">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm font-sans text-ink-faint">No plans yet.</p>
        )}
      </section>

    </div>
  );
}
