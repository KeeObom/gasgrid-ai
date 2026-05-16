import { AlertTriangle } from "lucide-react";

export default function IncidentPanel({
  incidents,
}: {
  incidents: any[];
}) {
  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 font-semibold text-red-300">
        <AlertTriangle size={18} />
        Operational Incidents
      </div>

      <div className="mt-4 space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="rounded-xl border border-red-500/20 bg-red-500/10 p-3"
          >
            <div className="font-semibold text-red-200">
              {incident.title}
            </div>

            <div className="mt-1 text-sm text-red-100">
              {incident.description}
            </div>

            <div className="mt-2 text-xs uppercase tracking-wide text-red-300">
              Severity: {incident.severity} • Status: {incident.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}