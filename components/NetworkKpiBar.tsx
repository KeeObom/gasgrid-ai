import { Activity, AlertTriangle, Gauge, Network, Users, Zap } from "lucide-react";

export default function NetworkKpiBar({
  pipelines,
  customers,
  incidents,
}: {
  pipelines: any[];
  customers: any[];
  incidents: any[];
}) {
  const activePipelines = pipelines.filter((p) => p.status === "active").length;
  const criticalPipelines = pipelines.filter((p) => p.status === "critical").length;

  const totalFlow = pipelines.reduce(
    (sum, pipe) => sum + Number(pipe.flow || 0),
    0
  );

  const averagePressure =
    pipelines.length > 0
      ? Math.round(
          pipelines.reduce((sum, pipe) => sum + Number(pipe.pressure || 0), 0) /
            pipelines.length
        )
      : 0;

  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length;

  const cards = [
    {
      label: "Total Pipelines",
      value: pipelines.length,
      icon: Network,
    },
    {
      label: "Active Pipelines",
      value: activePipelines,
      icon: Activity,
    },
    {
      label: "Critical Alerts",
      value: criticalPipelines + activeIncidents,
      icon: AlertTriangle,
    },
    {
      label: "Total Flow",
      value: `${totalFlow} MMSCFD`,
      icon: Zap,
    },
    {
      label: "Avg. Pressure",
      value: `${averagePressure} bar`,
      icon: Gauge,
    },
    {
      label: "Customers",
      value: customers.length,
      icon: Users,
    },
  ];

  return (
    <div className="absolute left-6 right-6 top-32 z-10 grid grid-cols-6 gap-3">
    {/* <div className="absolute left-6 right-6 top-24 z-10 grid grid-cols-6 gap-3"> */}
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-slate-900/90 p-3 shadow-xl backdrop-blur"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-medium text-slate-400">
                {card.label}
              </div>

              <Icon size={16} className="text-cyan-300" />
            </div>

            <div className="mt-2 text-lg font-black text-white">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}