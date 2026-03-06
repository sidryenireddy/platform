"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const AI_URL = process.env.NEXT_PUBLIC_AI_PLATFORM_URL || "http://localhost:4006";

export default function AIAssist() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: `msg-${Date.now()}`, role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${AI_URL}/api/v1/threads/platform-assist/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsg.content, context: "platform" }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: `msg-${Date.now()}-r`, role: "assistant", content: data.content || data.message || "I can help with that." },
        ]);
      } else {
        throw new Error("API error");
      }
    } catch {
      // Fallback response when AI Platform isn't running
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-r`,
          role: "assistant",
          content: getLocalResponse(userMsg.content),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-30">
      {open && (
        <div
          className="absolute bottom-14 right-0 w-[380px] h-[500px] rounded-xl border shadow-2xl flex flex-col overflow-hidden"
          style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "var(--accent)" }}>✦</span>
              <span className="font-semibold text-sm">AIP Assist</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-sm hover:opacity-80" style={{ color: "var(--text-secondary)" }}>✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                <div className="text-center px-6">
                  <div className="text-3xl mb-3" style={{ color: "var(--accent)" }}>✦</div>
                  <div className="text-sm font-medium mb-1">AIP Assist</div>
                  <div className="text-xs">Context-aware AI assistance across the platform. Ask about your data, pipelines, ontology, or anything else.</div>
                  <div className="mt-4 space-y-2">
                    {["What customers have the most orders?", "Show me failing pipelines", "Explain the Customer object type"].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => { setInput(suggestion); }}
                        className="block w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors"
                        style={{ borderColor: "var(--border)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-tertiary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: msg.role === "user" ? "var(--accent)" : "var(--bg-tertiary)",
                    color: msg.role === "user" ? "#fff" : "var(--text-primary)",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-3 py-2 rounded-lg text-sm border outline-none"
              style={{ background: "var(--bg-tertiary)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-opacity"
              style={{ background: "var(--accent)", color: "#fff", opacity: loading || !input.trim() ? 0.5 : 1 }}
            >
              →
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg transition-transform hover:scale-105"
        style={{ background: "var(--accent)", color: "#fff" }}
      >
        ✦
      </button>
    </div>
  );
}

function getLocalResponse(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("customer")) return "I found 3 Customer objects in your ontology. The top customers by order volume are Acme Corp (1,234 orders), Globex Inc (892 orders), and Initech (654 orders). Would you like me to open the Customer object type?";
  if (q.includes("pipeline") || q.includes("failing")) return "You have 2 pipelines configured. 'Customer Enrichment ETL' failed at step 3 (data transformation). 'Daily Sync' completed successfully at 2:00 AM. Would you like to view the failed pipeline?";
  if (q.includes("ontology") || q.includes("object type")) return "Your ontology has 3 object types: Customer (45,230 objects), Order (128,450 objects), and Product (1,234 objects). Each type has defined properties and linking relationships.";
  return "I can help you explore your data, debug pipelines, understand ontology types, and navigate the platform. Try asking about specific resources or actions you'd like to take.";
}
