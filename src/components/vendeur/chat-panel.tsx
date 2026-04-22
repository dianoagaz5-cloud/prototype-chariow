"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Msg = { id: string; body: string; authorId: string; createdAt: string };

export function ChatPanel({
  threadId,
  currentUserId,
  initialMessages,
}: {
  threadId: string;
  currentUserId: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const int = setInterval(async () => {
      const res = await fetch(`/api/chat/${threadId}`, { cache: "no-store" });
      const data = await res.json();
      if (data.ok) setMessages(data.messages);
    }, 4000);
    return () => clearInterval(int);
  }, [threadId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || pending) return;
    setPending(true);
    const res = await fetch(`/api/chat/${threadId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: text.trim() }),
    });
    const data = await res.json();
    if (data.ok) {
      setMessages(data.messages);
      setText("");
    }
    setPending(false);
  }

  return (
    <div className="rounded-2xl border bg-card overflow-hidden flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/30">
        {messages.length === 0 && (
          <div className="text-center text-xs text-muted-foreground mt-10">Pas encore de message.</div>
        )}
        {messages.map((m) => {
          const mine = m.authorId === currentUserId;
          return (
            <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-3 py-2 text-sm", mine ? "ml-auto bg-primary text-primary-foreground" : "bg-white border")}>
              {m.body}
              <div className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {new Date(m.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t p-3 bg-card">
        <Input placeholder="Votre message…" value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" disabled={pending || !text.trim()}><Send size={16} /></Button>
      </form>
    </div>
  );
}
