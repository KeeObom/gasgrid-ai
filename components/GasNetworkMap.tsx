"use client";

import React, { useEffect, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AlertTriangle, Activity, Database, Bot } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AIAlertPanel from "@/components/AIAlertPanel";
import FieldReadingModal from "@/components/FieldReadingModal";
import AiChatPanel from "@/components/AiChatPanel";

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
  if (status === "inactive") return "border-slate-500 bg-slate-200 text-slate-700";
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

  if (status === "inactive") {
    return {
      stroke: "#64748b",
      strokeWidth: 3,
      opacity: 0.45,
      strokeDasharray: "8 6",
    };
  }

  return {
    stroke: "#10b981",
    strokeWidth: 4,
    filter: "drop-shadow(0 0 8px #10b981)",
  };
}

export default function GasNetworkMap() {
  const [assets, setAssets] = useState<any[]>([]);
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    async function loadNetworkData() {
      setLoading(true);
  
      const { data: assetsData, error: assetsError } = await supabase
        .from("assets")
        .select("*");
  
      const { data: pipelinesData, error: pipelinesError } = await supabase
        .from("pipelines")
        .select("*");

      const { data: customersData, error: customersError } = await supabase
        .from("station_customers")
        .select("*");

      const { data: documentsData, error: documentsError } = await supabase
        .from("knowledge_documents")
        .select("*");

      if (assetsError || pipelinesError || customersError || documentsError) {
        console.error(
          "Error loading network data:",
          assetsError || pipelinesError || customersError || documentsError
        );
      } 

      // if (assetsError || pipelinesError || customersError) {
      //   console.error(
      //     "Error loading network data:",
      //     assetsError || pipelinesError || customersError
      //   );
      // }
  
      setAssets(assetsData || []);
      setPipelines(pipelinesData || []);
      setCustomers(customersData || []);
      setDocuments(documentsData || []);
      setLoading(false);
    }
  
    loadNetworkData();
  
    const assetsChannel = supabase
      .channel("assets-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assets" },
        () => {
          loadNetworkData();
        }
      )
      .subscribe();
  
    const pipelinesChannel = supabase
      .channel("pipelines-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pipelines" },
        () => {
          loadNetworkData();
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(assetsChannel);
      supabase.removeChannel(pipelinesChannel);
    };
  }, []);

  // useEffect(() => {
  //   async function loadNetworkData() {
  //     setLoading(true);

  //     const { data: assetsData, error: assetsError } = await supabase
  //       .from("assets")
  //       .select("*");

  //     const { data: pipelinesData, error: pipelinesError } = await supabase
  //       .from("pipelines")
  //       .select("*");

  //     if (assetsError || pipelinesError) {
  //       console.error("Error loading network data:", assetsError || pipelinesError);
  //     }

  //     setAssets(assetsData || []);
  //     setPipelines(pipelinesData || []);
  //     setLoading(false);
  //   }

  //   loadNetworkData();
  // }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          Loading GasGrid AI network...
        </div>
      </main>
    );
  }

  const nodes: Node[] = assets.map((asset) => ({
    id: asset.id,
    position: positions[asset.id] || { x: 300, y: 300 },
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
    // animated: pipe.status === "active" || pipe.status === "critical",
    animated: pipe.status === "active" || pipe.status === "warning" || pipe.status === "critical",
    label: pipe.name,
    data: pipe,
    style: getEdgeStyle(pipe.status),
    labelStyle: {
      fontSize: 12,
      fontWeight: 700,
      fill: "#e2e8f0",
    },
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
            
            <button
              onClick={() => setShowReadingModal(true)}
              className="flex w-full items-center gap-3 rounded-xl bg-cyan-500 px-4 py-3 text-left font-semibold text-slate-950"
            >
              + New Field Reading
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
          <AIAlertPanel pipelines={pipelines} />
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
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </section>

        <aside className="flex h-screen flex-col border-l border-white/10 bg-slate-900">
  
          <div className="border-b border-white/10 p-5">
            <h2 className="text-xl font-bold">Asset Intelligence</h2>

            <p className="mt-1 text-sm text-slate-400">
              Click any pipeline or station.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {selected ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
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

                {customers.filter((c) => c.station_id === selected.id).length > 0 && (
                  <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <div className="font-semibold text-cyan-300">
                      Connected Customers / Offtakers
                    </div>

                    <div className="mt-3 space-y-3">
                      {customers
                        .filter((c) => c.station_id === selected.id)
                        .map((customer) => (
                          <div
                            key={customer.id}
                            className="rounded-xl bg-slate-950/60 p-3 text-sm"
                          >
                            <div className="font-semibold text-white">
                              {customer.customer_name}
                            </div>

                            <div className="mt-1 text-slate-400">
                              {customer.customer_type} •{" "}
                              {customer.daily_allocation} MMSCFD •{" "}
                              {customer.status}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selected.status === "critical" && (
                  <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                    AI Insight: Pressure anomaly detected. Possible compressor
                    failure, leak, downstream restriction, or abnormal demand spike.
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                No asset selected yet.
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-5">
            <AiChatPanel
              assets={assets}
              pipelines={pipelines}
              customers={customers}
              documents={documents}
            />
          </div>
        </aside>

        {/* <aside className="border-l border-white/10 bg-slate-900 p-5">
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

                {customers.filter((c) => c.station_id === selected.id).length > 0 && (
                  <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                    <div className="font-semibold text-cyan-300">
                      Connected Customers / Offtakers
                    </div>

                    <div className="mt-3 space-y-3">
                      {customers
                        .filter((c) => c.station_id === selected.id)
                        .map((customer) => (
                          <div
                            key={customer.id}
                            className="rounded-xl bg-slate-950/60 p-3 text-sm"
                          >
                            <div className="font-semibold text-white">
                              {customer.customer_name}
                            </div>
                            <div className="mt-1 text-slate-400">
                              {customer.customer_type} • {customer.daily_allocation} MMSCFD •{" "}
                              {customer.status}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
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

          <AiChatPanel
            assets={assets}
            pipelines={pipelines}
            customers={customers}
          />
        </aside>         */}
      </div>

      <FieldReadingModal
        open={showReadingModal}
        onClose={() => setShowReadingModal(false)}
        assets={pipelines}
      />

    </main>
  );
}

