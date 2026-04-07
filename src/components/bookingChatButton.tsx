"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BookingChatButtonProps = {
  bookingId: number;
  heading: string;
  subheading: string;
  buttonLabel?: string;
  buttonClassName?: string;
};

type ChatMessage = {
  id: number;
  text: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderRole: string;
};

type ChatResponse = {
  messages: ChatMessage[];
  currentUserId: number;
};

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRoleLabel(role: string) {
  if (role === "TECHNICIAN") {
    return "Technician";
  }

  if (role === "STAFF") {
    return "Staff";
  }

  if (role === "ADMIN") {
    return "Admin";
  }

  return "Student";
}

export default function BookingChatButton({
  bookingId,
  heading,
  subheading,
  buttonLabel = "Chat",
  buttonClassName = "rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-50",
}: BookingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/booking-chat?bookingId=${bookingId}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as ChatResponse & { error?: string };

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to load conversation.");
        return;
      }

      setMessages(data.messages);
      setCurrentUserId(data.currentUserId);
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to load conversation.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [bookingId]);

  async function handleOpen() {
    setIsOpen(true);
    await loadMessages(true);
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = draft.trim();

    if (!message) {
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/booking-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          message,
        }),
      });

      const data = (await response.json()) as { error?: string; message?: ChatMessage };

      if (!response.ok || !data.message) {
        setErrorMessage(data.error || "Failed to send message.");
        return;
      }

      setMessages((currentMessages) => [...currentMessages, data.message as ChatMessage]);
      setDraft("");
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadMessages();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, loadMessages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  return (
    <>
      <button type="button" onClick={handleOpen} className={buttonClassName}>
        {buttonLabel}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4">
            <div className="relative isolate flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{heading}</h2>
                  <p className="mt-2 text-gray-600">{subheading}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  {loading ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-600">
                      Loading conversation...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-600">
                      No messages yet. Start the conversation below.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isOwnMessage = currentUserId === message.senderId;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                                isOwnMessage
                                  ? "bg-pink-950 text-white"
                                  : "bg-white text-gray-900"
                              }`}
                            >
                              <div
                                className={`flex flex-wrap items-center gap-2 text-xs ${
                                  isOwnMessage ? "text-pink-100" : "text-gray-500"
                                }`}
                              >
                                <span className="font-semibold">{message.senderName}</span>
                                <span>{getRoleLabel(message.senderRole)}</span>
                                <span>{formatMessageTime(message.createdAt)}</span>
                              </div>
                              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                                {message.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={endRef} />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <p className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700">
                    {errorMessage}
                  </p>
                )}

                <form
                  onSubmit={handleSend}
                  className="border-t border-gray-200 bg-white px-5 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <label className="block flex-1">
                      <span className="mb-2 block text-sm font-semibold text-gray-900">
                        Message
                      </span>
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        rows={3}
                        placeholder="Type your message here..."
                        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-pink-700 focus:ring-2 focus:ring-pink-100"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={sending || !draft.trim()}
                      className="rounded-xl bg-pink-950 px-5 py-3 font-semibold text-white transition hover:bg-pink-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
