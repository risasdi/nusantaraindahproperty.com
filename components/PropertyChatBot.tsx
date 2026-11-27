"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { trackEvent as trackAnalyticsEvent } from "@/lib/analytics";
import { trackEvent as trackMetaEvent } from "@/lib/meta-pixel";
import {
  buildMarketingWhatsAppUrl,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/site-settings";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_REPLIES = [
  "Rekomendasi rumah DP 0%",
  "Info promo & booking fee",
  "Cara ajukan KPR",
] as const;

const ROUTE_LABELS: Record<string, string> = {
  "/": "Beranda",
  "/kpr": "Info KPR",
  "/search": "Hasil Pencarian",
  "/cluster-sukamukti-islamic": "Cluster Sukamukti Islamic",
  "/cluster-sukamukti-islamic-tipe-36": "Cluster Sukamukti Islamic - Tipe 36",
  "/cluster-sukamukti-islamic-tipe-45": "Cluster Sukamukti Islamic - Tipe 45",
  "/villa-resik": "Villa Resik",
  "/taman-katapang-indah": "Taman Indah Katapang",
};

interface PropertyChatBotProps {
  whatsappNumber?: string;
  companyName?: string;
}

function renderFormattedText(text: string) {
  // Lightweight safe renderer for **bold** and newlines
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <strong key={partIdx} className="font-semibold text-[#063D36]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </span>
    );
  });
}

export default function PropertyChatBot({
  whatsappNumber = DEFAULT_SITE_SETTINGS.whatsapp_number,
  companyName = DEFAULT_SITE_SETTINGS.company_name,
}: PropertyChatBotProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Halo! Saya Asisten Virtual **${companyName}**. Siap membantu info rumah DP 0%, rekomendasi unit, spesifikasi, hingga simulasi KPR. Ada yang bisa saya bantu hari ini?`,
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextIdRef = useRef(1);

  useEffect(() => {
    if (!isOpen) return;
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Never render on /admin or /login routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  const getContextName = () => {
    const knownLabel = ROUTE_LABELS[pathname];
    const headingText =
      typeof document !== "undefined"
        ? document.querySelector("h1")?.textContent?.trim()
        : undefined;
    return (
      knownLabel ||
      (pathname.startsWith("/properti/") && headingText
        ? headingText
        : pathname)
    );
  };

  const waHref = buildMarketingWhatsAppUrl(
    whatsappNumber,
    `Halo ${companyName}, saya ingin konsultasi properti & jadwal survei.`
  );

  const handleWhatsAppClick = () => {
    const contextName = getContextName();

    trackMetaEvent("Contact", {
      content_name: `ChatBot WA - ${contextName}`,
      content_category: "WhatsApp",
    });

    trackAnalyticsEvent({
      event_name: "Contact",
      page_path: pathname,
      property_title: `ChatBot WA - ${contextName}`,
    });
  };

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${nextIdRef.current++}`,
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInputValue("");
    setIsTyping(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 12000);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: nextHistory
            .filter((m) => m.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        debugError?: string;
      };

      if (data.debugError) {
        console.error("Chat API debugError:", data.debugError);
      }

      const replyText =
        (response.ok && data.reply) ||
        data.error ||
        "Waduh, maaf ya Kak 🙏 Asisten AI lagi agak padat nih. Langsung klik tombol **WhatsApp** hijau di atas biar langsung dibantu tim marketing kami ya!";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${nextIdRef.current++}`,
          role: "assistant",
          content: replyText,
        },
      ]);
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${nextIdRef.current++}`,
          role: "assistant",
          content: isTimeout
            ? "Waduh, koneksinya lagi agak lama nih Kak 🙏 Biar lebih cepat, langsung klik tombol **WhatsApp** hijau di atas aja ya, tim marketing kami siap bantu langsung!"
            : "Maaf ya Kak, koneksi lagi terputus. Coba kirim ulang sebentar lagi atau langsung klik tombol **WhatsApp** hijau di atas biar cepat dibantu tim marketing kami!",
        },
      ]);
    } finally {
      window.clearTimeout(timeoutId);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage(inputValue);
  };

  const hasUserInteracted = messages.some((m) => m.role === "user");

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[9990] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Asisten Nusantara Property"
          className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[390px] h-[min(78vh,560px)] bg-white rounded-3xl shadow-[0_24px_60px_rgba(6,61,54,0.28)] border border-[#063D36]/15 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#063D36] text-white px-4 py-3.5 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#C8A15A]/20 border border-[#C8A15A]/50 flex items-center justify-center text-[#C8A15A] shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                  aria-hidden="true"
                >
                  <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" />
                  <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-serif text-sm font-bold text-white leading-tight truncate">
                  Asisten Nusantara Property
                </p>
                <p className="text-[11px] text-emerald-200 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  <span>Online &bull; AI Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                onClick={handleWhatsAppClick}
                title="Lanjut ke WhatsApp Marketing"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-bold transition shadow-xs"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3.5 h-3.5 text-white shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.6a11.9 11.9 0 0 0 5.7 1.4h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4zM12.1 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7.9 1-3.6-.2-.4a9.8 9.8 0 1 1 8.3 4.7zm5.4-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2c-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.2-.7l.5-.6c.2-.2.2-.4.3-.6 0-.2 0-.4-.1-.6-.1-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6 0 1.5 1.1 3 1.2 3.2.2.2 2.2 3.4 5.4 4.8.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4z" />
                </svg>
                <span className="text-white">WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup jendela chat"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-[#F4F6F5] px-4 py-4 space-y-3">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
                      isUser
                        ? "bg-[#063D36] text-white rounded-br-md"
                        : "bg-white text-slate-800 border border-[#063D36]/10 rounded-bl-md"
                    }`}
                  >
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                  </div>
                </div>
              );
            })}

            {/* Quick Replies (shown before first user message) */}
            {!hasUserInteracted && !isTyping && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-500 px-1">
                  Pertanyaan cepat:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REPLIES.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="text-left px-3 py-1.5 rounded-full bg-white border border-[#C8A15A]/60 text-[#063D36] text-xs font-medium hover:bg-[#C8A15A]/15 transition cursor-pointer shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#063D36]/10 rounded-2xl rounded-bl-md px-4 py-3 inline-flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#C8A15A] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#063D36] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#C8A15A] animate-bounce" />
                  <span className="text-[11px] text-slate-500 ml-1.5 font-medium">
                    Mengetik...
                  </span>
                </div>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Tulis pertanyaan Anda..."
              value={inputValue}
              disabled={isTyping}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 h-10 px-3.5 rounded-full border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#C8A15A] focus:ring-2 focus:ring-[#C8A15A]/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              aria-label="Kirim pesan"
              className="w-10 h-10 rounded-full bg-[#063D36] hover:bg-[#052e29] text-[#C8A15A] flex items-center justify-center shrink-0 transition disabled:opacity-45 cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 translate-x-[1px]"
                aria-hidden="true"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Single Floating AI Assistant Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Tutup Asisten AI" : "Tanya AI Asisten Properti"}
        aria-expanded={isOpen}
        className="group relative inline-flex items-center gap-2.5 rounded-full bg-[#063D36] hover:bg-[#052e29] text-white pl-4 pr-2 py-2 border-2 border-[#C8A15A] shadow-[0_10px_28px_rgba(6,61,54,0.35)] hover:shadow-[0_14px_34px_rgba(6,61,54,0.45)] hover:scale-[1.03] transition cursor-pointer"
      >
        <span className="text-xs sm:text-sm font-bold tracking-wide text-[#F7E7C4] whitespace-nowrap">
          {isOpen ? "Tutup Chat" : "Tanya AI"}
        </span>
        <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#C8A15A] text-[#063D36] flex items-center justify-center shrink-0 shadow-inner">
          {isOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M12 7l.8 1.9L14.7 9.7l-1.9.8L12 12.4l-.8-1.9-1.9-.8 1.9-.8L12 7z" />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
