"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";

type Msg = { id: string; authorId: string; body: string; createdAt: string };

export function ChatWidget({
  sellerId,
  sellerName,
  subject,
}: {
  sellerId: string;
  sellerName: string;
  subject?: string;
}) {
  const [open, setOpen] = useState(false);
  const [authUser, setAuthUser] = useState<{ id: string; name: string } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAuthUser(d.user ? { id: d.user.id, name: d.user.name } : null));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages, open]);

  async function openChat() {
    if (!authUser) return;
    setOpen(true);
    setLoading(true);
    const r = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sellerId, subject }),
    });
    const d = await r.json();
    if (d.ok) {
      setThreadId(d.threadId);
      setMessages(d.messages);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!threadId || !open) return;
    const interval = setInterval(async () => {
      const r = await fetch(`/api/chat/${threadId}`);
      const d = await r.json();
      if (d.ok) setMessages(d.messages);
    }, 3000);
    return () => clearInterval(interval);
  }, [threadId, open]);

  async function send() {
    if (!input.trim() || !threadId) return;
    const body = input;
    setInput("");
    const r = await fetch(`/api/chat/${threadId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const d = await r.json();
    if (d.ok) setMessages(d.messages);
  }

  if (!authUser) {
    return (
      <Link
        href="/connexion"
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
      >
        <MessageCircle size={16} /> Discuter avec le vendeur
      </Link>
    );
  }

  return (
    <>
      <button
        onClick={openChat}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-muted"
      >
        <MessageCircle size={16} /> Discuter avec {sellerName}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/30"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-4 right-4 left-4 md:bottom-6 md:right-6 md:left-auto md:w-[380px] z-50 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col border overflow-hidden"
            >
              <div className="flex items-center justify-between bg-zinc-900 text-white px-4 py-3">
                <div>
                  <div className="text-sm font-semibold">{sellerName}</div>
                  <div className="text-[11px] opacity-80">{subject || "Chat vendeur"}</div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Fermer"><X size={18} /></button>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-zinc-50">
                {loading && <div className="text-xs text-center text-muted-foreground">Chargement…</div>}
                {messages.map((m) => {
                  const mine = m.authorId === authUser.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                          mine ? "bg-primary text-white rounded-br-sm" : "bg-white border rounded-bl-sm"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2 border-t p-3"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Votre message…"
                  className="flex-1 h-10 rounded-full border bg-muted/40 px-3 text-sm focus:bg-background"
                />
                <button
                  type="submit"
                  className="h-10 w-10 rounded-full bg-primary text-white grid place-items-center disabled:opacity-50"
                  disabled={!input.trim()}
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
