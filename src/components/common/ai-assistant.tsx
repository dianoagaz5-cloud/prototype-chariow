"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const QUICK = [
  "Comment acheter sur Marketplace ?",
  "Comment devenir vendeur ?",
  "Paiement MTN Mobile Money ?",
  "Comment télécharger un ebook ?",
];

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Salut 👋 ! Je suis l'assistant Marketplace. Je peux t'aider à acheter, vendre ou répondre à tes questions sur la plateforme.",
    },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, open]);

  async function send(msg: string) {
    const content = msg.trim();
    if (!content || pending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setPending(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Désolé, je n'ai pas pu répondre. Réessaie plus tard." },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <motion.button
        aria-label="Assistant IA"
        onClick={() => setOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-lg grid place-items-center"
      >
        <Sparkles size={22} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 md:bg-transparent"
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed z-50 right-4 left-4 bottom-20 md:bottom-6 md:right-6 md:left-auto md:w-[380px] h-[500px] max-h-[80vh] rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden border"
            >
              <div className="flex items-center justify-between bg-gradient-to-r from-primary to-accent text-white px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">
                    <Bot size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Assistant Marketplace</div>
                    <div className="text-[11px] opacity-80 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      En ligne
                    </div>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Fermer"><X size={18} /></button>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-white rounded-br-md"
                          : "bg-white border rounded-bl-md"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {pending && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl rounded-bl-md px-3.5 py-2 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                )}
                {messages.length === 1 && !pending && (
                  <div className="pt-2 space-y-2">
                    {QUICK.map((q) => (
                      <button
                        key={q}
                        onClick={() => send(q)}
                        className="w-full text-left rounded-lg border bg-white px-3 py-2 text-xs hover:border-primary transition"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 border-t p-3 bg-white"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pose ta question…"
                  className="flex-1 h-10 rounded-full border bg-muted/40 px-3 text-sm focus:bg-background"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="h-10 w-10 rounded-full bg-primary text-white grid place-items-center disabled:opacity-50"
                  aria-label="Envoyer"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
