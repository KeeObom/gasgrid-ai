"use client";

// import { useState } from "react";
import { useEffect, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";

export default function AiChatPanel({
  assets,
  pipelines,
  customers,
  documents,
}: {
  assets: any[];
  pipelines: any[];
  customers: any[];
  documents: any[];
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello, I am GasGrid AI. Ask me about pipeline routes, pressure issues, affected customers, or asset status.",
    },
  ]);

  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  function generateAnswer(question: string) {
    const q = question.toLowerCase();

    const criticalPipelines = pipelines.filter(
      (p) => p.status === "critical" || Number(p.pressure) < Number(p.normal_pressure) * 0.8
    );

    if (q.includes("lagos")) {
      const lagosPipeline = pipelines.find((p) =>
        p.name.toLowerCase().includes("lagos")
      );

      const lagosCustomers = customers.filter((c) => c.station_id === "lagos");

      if (!lagosPipeline) {
        return "I could not find a Lagos pipeline in the current network database.";
      }

      return `The Lagos route is supplied through ${lagosPipeline.name}. Current pressure is ${lagosPipeline.pressure} bar compared to normal pressure of ${lagosPipeline.normal_pressure} bar. Status is ${lagosPipeline.status}. Connected customers include ${lagosCustomers
        .map((c) => c.customer_name)
        .join(", ")}.`;
    }

    if (q.includes("critical") || q.includes("problem") || q.includes("wrong")) {
      if (criticalPipelines.length === 0) {
        return "No critical pipeline anomaly is currently detected in the network.";
      }

      return `I found ${criticalPipelines.length} critical/anomalous pipeline(s): ${criticalPipelines
        .map(
          (p) =>
            `${p.name} is at ${p.pressure} bar versus normal ${p.normal_pressure} bar`
        )
        .join("; ")}. Recommended action: verify field readings, inspect compressor performance, compare upstream/downstream pressure, and check affected customers.`;
    }

    if (q.includes("customer") || q.includes("offtaker") || q.includes("affected")) {
      return `Current connected customers/offtakers include: ${customers
        .map(
          (c) =>
            `${c.customer_name} (${c.customer_type}, ${c.daily_allocation} MMSCFD)`
        )
        .join("; ")}.`;
    }

    if (q.includes("route") || q.includes("explain")) {
      return `The current demo network flows from Escravos Gas Terminal to Warri Compressor Station, then to Oben Gas Hub. From Oben, gas is routed toward Lagos Metering Station and Benin Metering Station. This allows the system to show upstream and downstream impact when a pressure anomaly occurs.`;
    }

    if (
        q.includes("maintenance") ||
        q.includes("what should") ||
        q.includes("recommend") ||
        q.includes("fix") ||
        q.includes("leak") ||
        q.includes("compressor")
      ) {
        const matchedDocs = documents.filter((doc) => {
          const text = `${doc.title} ${doc.category} ${doc.related_asset_type} ${doc.content}`.toLowerCase();
          return (
            text.includes("pressure") ||
            text.includes("compressor") ||
            text.includes("leak") ||
            text.includes("metering")
          );
        });
      
        if (matchedDocs.length === 0) {
          return "I do not have maintenance documents loaded yet, but I recommend verifying field readings, checking upstream/downstream pressure, and escalating abnormal readings to operations control.";
        }
      
        return `Based on the maintenance knowledge base: ${matchedDocs
          .map((doc) => `${doc.title}: ${doc.content}`)
          .join(" ")}`;
      }

    return "I can currently answer questions about Lagos, pipeline problems, routes, pressure, status, connected customers, and affected offtakers. Try asking: “What is wrong with the Lagos line?”";
  }

  function handleSend() {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    const assistantMessage = {
      role: "assistant",
      content: generateAnswer(input),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello, I am GasGrid AI. Ask me about pipeline routes, pressure issues, affected customers, or asset status.",
      },
    ]);
  }

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-cyan-300">
            <Bot size={18} />
            GasGrid AI Assistant
        </div>

        <button
            onClick={clearChat}
            className="rounded-lg bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/25"
        >
            Clear Chat
        </button>
        </div>
      {/* <div className="flex items-center gap-2 font-semibold text-cyan-300">
        <Bot size={18} />
        GasGrid AI Assistant
      </div> */}

      {/* <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1"> */}
      <div
        ref={chatContainerRef}
        className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1"
        >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-2xl p-3 text-sm ${
              message.role === "assistant"
                ? "bg-slate-950/70 text-slate-200"
                : "bg-cyan-500 text-slate-950"
            }`}
          >
            {message.content}
          </div>
        ))}

      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Ask about Lagos line, customers, pressure..."
          className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none"
        />

        <button
          onClick={handleSend}
          className="rounded-xl bg-cyan-500 px-4 text-slate-950"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}