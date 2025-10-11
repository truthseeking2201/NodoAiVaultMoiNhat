const formatNumber = (value: number | string) =>
  typeof value === "number" ? value.toLocaleString() : value;

export default function QuestSummaryCard({
  totalXp = 0,
  activeCount = 0,
  claimableCount = 0,
}: {
  totalXp?: number;
  activeCount?: number;
  claimableCount?: number;
}) {
  const stats = [
    {
      label: "Total XP Shares",
      value: totalXp,
      icon: "⭐",
      accent: "from-emerald-400/15 via-emerald-300/10 to-transparent",
    },
    {
      label: "Active Quests",
      value: activeCount,
      icon: "🔥",
      accent: "from-cyan-400/15 via-cyan-300/10 to-transparent",
    },
    {
      label: "Claimable",
      value: claimableCount,
      icon: "🎁",
      accent: "from-purple-400/15 via-purple-300/10 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 text-white md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(6,20,45,0.35)] backdrop-blur-md transition hover:border-white/20 hover:bg-white/8 hover:shadow-[0_16px_45px_rgba(6,20,45,0.5)]"
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-70`}
          />
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full border border-white/10 opacity-40 blur-xl group-hover:opacity-60" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-semibold tabular-nums text-white">
                {formatNumber(stat.value)}
              </div>
            </div>
            <div className="text-3xl opacity-80 drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
