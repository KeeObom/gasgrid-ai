"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FieldReadingModal({
  open,
  onClose,
  assets,
}: {
  open: boolean;
  onClose: () => void;
  assets: any[];
}) {
  const [assetId, setAssetId] = useState("");
  const [pressure, setPressure] = useState("");
  const [flow, setFlow] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    await supabase.from("field_readings").insert([
      {
        asset_id: assetId,
        pressure: Number(pressure),
        flow: Number(flow),
        status,
        notes,
      },
    ]);

    await supabase
      .from("pipelines")
      .update({
        pressure: Number(pressure),
        flow: Number(flow),
        status,
      })
      .eq("id", assetId);

    setLoading(false);

    onClose();

    setAssetId("");
    setPressure("");
    setFlow("");
    setStatus("active");
    setNotes("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Submit Field Reading
          </h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 p-2 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Pipeline
            </label>

            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
              required
            >
              <option value="">Select pipeline</option>

              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Pressure (bar)
            </label>

            <input
              type="number"
              value={pressure}
              onChange={(e) => setPressure(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Flow (MMSCFD)
            </label>

            <input
              type="number"
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
            >
              <option value="active">Active</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-4 font-bold text-slate-950 transition hover:opacity-90"
          >
            {loading ? "Submitting..." : "Submit Reading"}
          </button>
        </form>
      </div>
    </div>
  );
}