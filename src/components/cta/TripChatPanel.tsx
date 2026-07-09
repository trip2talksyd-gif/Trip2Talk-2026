"use client";

import { useEffect, useRef, useState } from "react";

import { FadeUp } from "@/components/motion/FadeUp";
import { MIcon } from "@/components/ui/MIcon";
import { buildTripLeaderReply } from "@/lib/trip-chat-replies";
import { cn } from "@/lib/cn";

interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    text: "สวัสดีครับ! ผมเป็น Trip Leader ของ Trip2Talk ครับ อยากรู้เรื่องทริปไหนเป็นพิเศษไหมครับ?",
  },
  {
    id: "seed-2",
    role: "user",
    text: "อยากไปถ่ายรูปทางช้างเผือกที่ Uluru ครับ มีที่ว่างไหม?",
  },
  {
    id: "seed-3",
    role: "assistant",
    text: "ทริป Uluru-Kata Tjuta 4 วัน 3 คืน รอบหน้าคือ 15-18 มี.ค. 2026 ครับ ยังมีที่ว่างอยู่ ราคาเริ่มต้น $1,690 ต่อท่าน พร้อมช่างภาพมืออาชีพดูแลตลอดทริปครับ อยากให้ช่วยจองที่นั่งเลยไหมครับ?",
  },
];

interface TripChatPanelProps {
  initialScroll?: "top" | "bottom";
  animateMessagesIn?: boolean;
}

export function TripChatPanel({
  initialScroll = "top",
  animateMessagesIn = false,
}: TripChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = initialScroll === "bottom" ? el.scrollHeight : 0;
  }, [initialScroll, messages.length]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };
    const reply: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      text: buildTripLeaderReply(text),
    };

    setMessages((prev) => [...prev, userMsg, reply]);
    setDraft("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="flex h-full min-h-[280px] flex-col rounded-2xl border border-white/10"
      style={{
        background: "rgba(8,8,10,0.6)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
          <MIcon name="photo_camera" size={14} className="text-white/70" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">คุยกับ Trip Leader</p>
          <p className="text-[11px] text-white/40">
            ถามเรื่องทริป หรือจองที่นั่งได้เลย
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex-1 space-y-4 overflow-y-auto px-4 py-5"
      >
        {messages.map((msg, i) => {
          const bubble = (
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "ml-auto bg-white/15 text-white/90"
                  : "border border-white/5 bg-white/5 text-white/70",
              )}
            >
              {msg.text}
            </div>
          );

          if (animateMessagesIn && i < SEED_MESSAGES.length) {
            return (
              <FadeUp key={msg.id} delay={i * 0.12} y={16}>
                {bubble}
              </FadeUp>
            );
          }

          return <div key={msg.id}>{bubble}</div>;
        })}
      </div>

      <div className="p-3">
        <div className="liquid-glass flex items-end gap-2 rounded-2xl p-2">
          <textarea
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="ถามเรื่องทริปได้เลยครับ..."
            className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white/90 placeholder:text-white/35 focus:outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-xl bg-white p-2 text-black transition-opacity hover:opacity-90"
            aria-label="ส่งข้อความ"
          >
            <MIcon name="arrow_upward" size={16} weight={600} />
          </button>
        </div>
      </div>
    </div>
  );
}
