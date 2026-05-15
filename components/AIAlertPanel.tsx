import { AlertTriangle, Brain, CheckCircle2 } from "lucide-react";

export default function AIAlertPanel({ pipelines }: { pipelines: any[] }) {
  const anomalies = pipelines.filter((pipe) => {
    const pressure = Number(pipe.pressure);
    const normal = Number(pipe.normal_pressure);

    return (
      pipe.status === "critical" ||
      pipe.status === "warning" ||
      pressure < normal * 0.8
    );
  });

  if (anomalies.length === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-center gap-2 font-semibold text-emerald-300">
          <CheckCircle2 size={18} />
          AI Network Insight
        </div>
        <p className="mt-2 text-sm text-emerald-100">
          No major pressure or flow anomalies detected across the network.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 font-semibold text-cyan-300">
        <Brain size={18} />
        AI Alert Intelligence
      </div>

      {anomalies.map((pipe) => {
        const pressure = Number(pipe.pressure);
        const normal = Number(pipe.normal_pressure);
        const pressureDrop = normal - pressure;
        const pressureDropPercent = Math.round((pressureDrop / normal) * 100);

        return (
          <div
            key={pipe.id}
            className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100"
          >
            <div className="flex items-center gap-2 font-bold text-red-300">
              <AlertTriangle size={17} />
              Flow anomaly detected
            </div>

            <p className="mt-3">
              <strong>{pipe.name}</strong> is operating below expected pressure.
              Current pressure is <strong>{pressure} bar</strong> compared to
              normal pressure of <strong>{normal} bar</strong>.
            </p>

            <p className="mt-2">
              Estimated pressure drop:{" "}
              <strong>{pressureDropPercent}% below normal range</strong>.
            </p>

            <div className="mt-3 rounded-xl bg-slate-950/60 p-3">
              <p className="font-semibold text-white">Possible causes:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Compressor underperformance</li>
                <li>Leakage or pipeline integrity issue</li>
                <li>Downstream restriction or valve issue</li>
                <li>Unexpected demand spike from connected customers</li>
              </ul>
            </div>

            <div className="mt-3 rounded-xl bg-slate-950/60 p-3">
              <p className="font-semibold text-white">Recommended action:</p>
              <p className="mt-1">
                Inspect upstream and downstream pressure readings, verify
                compressor status, compare recent flow trend, and dispatch field
                inspection if pressure continues dropping.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}