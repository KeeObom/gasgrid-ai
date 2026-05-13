"use client";

import React, { useState } from "react";
// import ReactFlow, {
//   Background,
//   Controls,
//   MiniMap,
//   Node,
//   Edge,
// } from "@xyflow/react";
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
  } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AlertTriangle, Activity, Database, Bot } from "lucide-react";
import { assets, pipelines } from "../data/dummy-network";
// import { assets, pipelines } from "../data/dummy-network";

const positions: Record<string, { x: number; y: number }> = {
  escravos: { x: 100, y: 260 },
  warri: { x: 330, y: 260 },
  oben: { x: 580, y: 260 },
  lagos: { x: 850, y: 120 },
  benin: { x: 850, y: 390 },
};

function getNodeColor(status: string) {
  if (status === "critical") return "border-red-500 bg-red-50 text-red-700";
  if (status === "warning") return "border-yellow-500 bg-yellow-50 text-yellow-700";
  return "border-emerald-500 bg-emerald-50 text-emerald-700";
}

function getEdgeStyle(status: string) {
  if (status === "critical") {
    return {
      stroke: "#ef4444",
      strokeWidth: 4,
      filter: "drop-shadow(0 0 8px #ef4444)",
    };
  }

  if (status === "warning") {
    return {
      stroke: "#f59e0b",
      strokeWidth: 4,
      filter: "drop-shadow(0 0 8px #f59e0b)",
    };
  }

  return {
    stroke: "#10b981",
    strokeWidth: 4,
    filter: "drop-shadow(0 0 8px #10b981)",
  };
}

export default function GasNetworkMap() {
  const [selected, setSelected] = useState<any>(null);

  const nodes: Node[] = assets.map((asset) => ({
    id: asset.id,
    position: positions[asset.id],
    data: {
      label: (
        <div
          className={`rounded-2xl border-2 px-4 py-3 shadow-sm ${getNodeColor(
            asset.status
          )}`}
        >
          <div className="text-sm font-bold">{asset.name}</div>
          <div className="text-xs">{asset.type}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide">
            {asset.status}
          </div>
        </div>
      ),
      asset,
    },
    type: "default",
  }));

  const edges: Edge[] = pipelines.map((pipe) => ({
    id: pipe.id,
    source: pipe.source,
    target: pipe.target,
    animated: pipe.status === "active" || pipe.status === "critical",
    label: pipe.name,
    data: pipe,
    style: getEdgeStyle(pipe.status),
    labelStyle: { fontSize: 12, fontWeight: 700 },
  }));

  const criticalPipelines = pipelines.filter((p) => p.status === "critical");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid h-screen grid-cols-[280px_1fr_360px]">
        <aside className="border-r border-white/10 bg-slate-900 p-5">
          <h1 className="text-2xl font-bold">GasGrid AI</h1>
          <p className="mt-2 text-sm text-slate-400">
            Intelligent gas transmission digital twin
          </p>

          <div className="mt-8 space-y-3">
            <button className="flex w-full items-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-left font-semibold text-slate-950">
              <Activity size={18} />
              Network Map
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left text-slate-300">
              <Bot size={18} />
              AI Q/A
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left text-slate-300">
              <Database size={18} />
              Knowledge Base
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 font-semibold text-red-300">
              <AlertTriangle size={18} />
              Active Alerts
            </div>
            <p className="mt-2 text-sm text-red-100">
              {criticalPipelines.length} critical pipeline anomaly detected.
            </p>
          </div>
        </aside>

        <section className="relative bg-slate-950">
          <div className="absolute left-6 top-6 z-10 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl">
            <div className="text-sm text-slate-400">Live Network</div>
            <div className="text-xl font-bold">Nigeria Gas Transmission Map</div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            onNodeClick={(event, node) => {
                event.preventDefault();
                setSelected(node.data?.asset);
              }}
              onEdgeClick={(event, edge) => {
                event.preventDefault();
                setSelected(edge.data);
              }}
            // onNodeClick={(_, node) => setSelected(node.data.asset)}
            // onEdgeClick={(_, edge) => setSelected(edge.data)}
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </section>

        <aside className="border-l border-white/10 bg-slate-900 p-5">
          <h2 className="text-xl font-bold">Asset Intelligence</h2>
          <p className="mt-1 text-sm text-slate-400">
            Click any pipeline or station.
          </p>

          {selected ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-bold">{selected.name}</h3>

              <div className="mt-4 space-y-3 text-sm">
                {Object.entries(selected).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between gap-4 border-b border-white/10 pb-2"
                  >
                    <span className="capitalize text-slate-400">
                      {key.replaceAll("_", " ")}
                    </span>
                    <span className="text-right font-medium">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>

              {selected.status === "critical" && (
                <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                  AI Insight: Pressure anomaly detected. Possible compressor
                  failure, leak, downstream restriction, or abnormal demand spike.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              No asset selected yet.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}