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
  const [temperature, setTemperature] = useState("");
  const [status, setStatus] = useState("");
  const [submittedBy, setSubmittedBy] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!assetId) return;

    setLoading(true);

    const updateData: any = {};

    if (pressure !== "") updateData.pressure = Number(pressure);
    if (flow !== "") updateData.flow = Number(flow);
    if (status !== "") updateData.status = status;

    await supabase.from("field_readings").insert([
      {
        asset_id: assetId,
        pressure: pressure !== "" ? Number(pressure) : null,
        flow: flow !== "" ? Number(flow) : null,
        temperature: temperature !== "" ? Number(temperature) : null,
        status: status !== "" ? status : null,
        submitted_by: submittedBy !== "" ? submittedBy : null,
        reading_time: readingTime !== "" ? new Date(readingTime).toISOString() : new Date().toISOString(),
        notes: notes !== "" ? notes : null,
      },
    ]);

    if (Object.keys(updateData).length > 0) {
      await supabase.from("pipelines").update(updateData).eq("id", assetId);
    }

    setLoading(false);
    onClose();

    setAssetId("");
    setPressure("");
    setFlow("");
    setTemperature("");
    setStatus("");
    setSubmittedBy("");
    setReadingTime("");
    setNotes("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Submit Field Reading</h2>

          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 p-2 hover:bg-white/10"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Submit only the values collected in the field. Blank fields will not overwrite the current live pipeline data.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Pipeline</label>

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
              Reading Date/Time
            </label>

            <input
              type="datetime-local"
              value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
            />

            <p className="mt-1 text-xs text-slate-500">
              Leave blank to use current time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Pressure (bar)
              </label>

              <input
                type="number"
                value={pressure}
                onChange={(e) => setPressure(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
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
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Temperature (°C)
              </label>

              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">Status</label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
            >
              <option value="">Leave unchanged</option>
              <option value="active">Active</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Submitted By
            </label>

            <input
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="e.g., Field Operator A"
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-400">Notes</label>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="e.g., Pressure fluctuation observed near downstream valve."
              className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-500 px-4 py-4 font-bold text-slate-950 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Reading"}
          </button>
        </form>
      </div>
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { X } from "lucide-react";
// import { supabase } from "@/lib/supabase";

// export default function FieldReadingModal({
//   open,
//   onClose,
//   assets,
// }: {
//   open: boolean;
//   onClose: () => void;
//   assets: any[];
// }) {
//   const [assetId, setAssetId] = useState("");
//   const [pressure, setPressure] = useState("");
//   const [flow, setFlow] = useState("");
//   const [status, setStatus] = useState("");
// //   const [status, setStatus] = useState("active");
//   const [notes, setNotes] = useState("");
//   const [loading, setLoading] = useState(false);

//   if (!open) return null;

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
  
//     if (!assetId) return;
  
//     setLoading(true);
  
//     const updateData: any = {};
  
//     if (pressure !== "") updateData.pressure = Number(pressure);
//     if (flow !== "") updateData.flow = Number(flow);
//     if (status !== "") updateData.status = status;
  
//     await supabase.from("field_readings").insert([
//       {
//         asset_id: assetId,
//         pressure: pressure !== "" ? Number(pressure) : null,
//         flow: flow !== "" ? Number(flow) : null,
//         status: status !== "" ? status : null,
//         notes: notes !== "" ? notes : null,
//       },
//     ]);
  
//     if (Object.keys(updateData).length > 0) {
//       await supabase
//         .from("pipelines")
//         .update(updateData)
//         .eq("id", assetId);
//     }
  
//     setLoading(false);
//     onClose();
  
//     setAssetId("");
//     setPressure("");
//     setFlow("");
//     setStatus("");
//     setNotes("");
//   }


//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
//       <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 text-white shadow-2xl">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-bold">
//             Submit Field Reading
//           </h2>

//           <button
//             onClick={onClose}
//             className="rounded-xl bg-white/5 p-2 hover:bg-white/10"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-6 space-y-5">
//           <div>
//             <label className="mb-2 block text-sm text-slate-400">
//               Pipeline
//             </label>

//             <select
//               value={assetId}
//               onChange={(e) => setAssetId(e.target.value)}
//               className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
//               required
//             >
//               <option value="">Select pipeline</option>

//               {assets.map((asset) => (
//                 <option key={asset.id} value={asset.id}>
//                   {asset.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="mb-2 block text-sm text-slate-400">
//               Pressure (bar)
//             </label>

//             <input
//               type="number"
//               value={pressure}
//               onChange={(e) => setPressure(e.target.value)}
//               className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
//             //   required
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm text-slate-400">
//               Flow (MMSCFD)
//             </label>

//             <input
//               type="number"
//               value={flow}
//               onChange={(e) => setFlow(e.target.value)}
//               className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
//             //   required
//             />
//           </div>

//           <div>
//             <label className="mb-2 block text-sm text-slate-400">
//               Status
//             </label>

//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
//             >
//               <option value="">Leave unchanged</option>  
//               <option value="active">Active</option>
//               <option value="warning">Warning</option>
//               <option value="critical">Critical</option>
//               <option value="inactive">Inactive</option>
//             </select>
//           </div>

//           <div>
//             <label className="mb-2 block text-sm text-slate-400">
//               Notes
//             </label>

//             <textarea
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               rows={4}
//               className="w-full rounded-xl border border-white/10 bg-slate-950 p-3"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-2xl bg-emerald-500 px-4 py-4 font-bold text-slate-950 transition hover:opacity-90"
//           >
//             {loading ? "Submitting..." : "Submit Reading"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }