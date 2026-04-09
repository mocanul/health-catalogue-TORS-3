"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type BookingChatButtonProps = {
  bookingId: number;
  heading: string;
  subheading: string;
  buttonLabel?: string;
  buttonClassName?: string;
};

type ChatSessionData = {
  appId: string;
  conversationId: string;
  currentUserId: string;
};

type BookingChatMessage = {
  id: string;
  senderId: string | null;
  senderName: string;
  type: string;
  text: string;
  createdAt: number;
};

function formatMessageTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function BookingChatButton({
  bookingId,
  heading,
  subheading,
  buttonLabel = "Open chat",
  buttonClassName = "rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50",
}: BookingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionData, setSessionData] = useState<ChatSessionData | null>(null);
  const [messages, setMessages] = useState<BookingChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const currentUserId = sessionData?.currentUserId ?? "";

  async function fetchMessages(showLoadingState = false) {
    if (!sessionData) {
      return;
    }

    if (showLoadingState) {
      setLoadingMessages(true);
    }

    try {
      const response = await fetch(`/api/talkjs/messages?bookingId=${bookingId}`);
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to load chat messages.");
        return;
      }

      setMessages(data.messages || []);
      setErrorMessage("");
    } catch {
      setErrorMessage("Failed to load chat messages.");
    } finally {
      if (showLoadingState) {
        setLoadingMessages(false);
      }
    }
  }

  async function handleOpen() {
    setIsOpen(true);

    if (sessionData || loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/talkjs/booking-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to open chat.");
        return;
      }

      setSessionData(data);
    } catch {
      setErrorMessage("Failed to open chat.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = draftMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    setSending(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/talkjs/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          text: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Failed to send message.");
        return;
      }

      setDraftMessage("");
      await fetchMessages();
    } catch {
      setErrorMessage("Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!sessionData || !isOpen) {
      return;
    }

    fetchMessages(true);

    const intervalId = window.setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [sessionData, isOpen, bookingId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sortedMessages = useMemo(
    () => [...messages].sort((left, right) => left.createdAt - right.createdAt),
    [messages],
  );

  return (
    <>
      <button type="button" onClick={handleOpen} className={buttonClassName}>
        {buttonLabel}
      </button>

      {isOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 p-4">
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
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

            <div className="flex-1 min-h-0 bg-slate-50 p-4">
              {loading && (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-sm text-slate-600">
                  Loading booking chat...
                </div>
              )}

              {errorMessage && !loading && !sessionData && (
                <div className="flex h-full items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {sessionData && !loading && (
                <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <p className="text-sm font-semibold text-slate-900">Booking conversation</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Send questions or updates here. This thread stays linked to this booking.
                    </p>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
                    {loadingMessages && sortedMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Loading messages...
                      </div>
                    ) : sortedMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                        No messages yet. Start the conversation below.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sortedMessages.map((message) => {
                          const isCurrentUser = message.senderId === currentUserId;

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${isCurrentUser
                                    ? "bg-pink-950 text-white"
                                    : "bg-slate-100 text-slate-900"
                                  }`}
                              >
                                <div className={`flex items-center gap-2 text-xs ${isCurrentUser ? "text-pink-100" : "text-slate-500"}`}>
                                  <span className="font-semibold">{isCurrentUser ? "You" : message.senderName}</span>
                                  <span>{formatMessageTime(message.createdAt)}</span>
                                </div>
                                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">
                                  {message.text || "Unsupported message type"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messageEndRef} />
                      </div>
                    )}
                  </div>

                  {errorMessage && sessionData && (
                    <p className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errorMessage}
                    </p>
                  )}

                  <form
                    onSubmit={handleSendMessage}
                    className="border-t border-slate-200 bg-white px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <label className="block flex-1">
                        <span className="mb-2 block text-sm font-semibold text-slate-900">
                          Message
                        </span>
                        <textarea
                          value={draftMessage}
                          onChange={(event) => setDraftMessage(event.target.value)}
                          rows={3}
                          placeholder="Type your message here..."
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pink-700 focus:ring-2 focus:ring-pink-100"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={sending || !draftMessage.trim()}
                        className="rounded-xl bg-pink-950 px-5 py-3 font-semibold text-white transition hover:bg-pink-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

