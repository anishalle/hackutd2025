"use client";

import { useState, useRef, useEffect } from "react";
import {
  datacenterDevices,
  predefinedQuestions,
  getDeviceById,
} from "@/lib/devices/data";
import { askDeviceAssistant } from "@/lib/gemini-api";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export function DeviceAssistant() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredefined, setShowPredefined] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAskQuestion = async (question: string) => {
    if (!selectedDeviceId || !question.trim() || isLoading) return;

    const device = getDeviceById(selectedDeviceId);
    if (!device) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setCustomQuestion("");
    setIsLoading(true);

    try {
      const response = await askDeviceAssistant(question, device);

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error asking question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
  };

  const selectedDevice = selectedDeviceId
    ? getDeviceById(selectedDeviceId)
    : null;
  const questions = selectedDeviceId
    ? predefinedQuestions[selectedDeviceId] || []
    : [];

  return (
    <div className="space-y-4">
      {/* Device Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
            Select Device or Part
          </label>
          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Clear Chat
            </button>
          )}
        </div>
        <select
          value={selectedDeviceId}
          onChange={(e) => {
            setSelectedDeviceId(e.target.value);
            setShowPredefined(true);
          }}
          className="w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
        >
          <option value="" className="bg-slate-900">
            Choose a device...
          </option>
          {datacenterDevices.map((device) => (
            <option
              key={device.id}
              value={device.id}
              className="bg-slate-900"
            >
              {device.name} ({device.category})
            </option>
          ))}
        </select>
      </div>

      {/* Device Info */}
      {selectedDevice && (
        <div className="animate-fadeIn rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-cyan-500/20 p-2">
              <svg
                className="h-5 w-5 text-cyan-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">{selectedDevice.name}</p>
              <p className="text-xs text-white/60">
                {selectedDevice.category}
                {selectedDevice.manufacturer &&
                  ` · ${selectedDevice.manufacturer}`}
              </p>
              {selectedDevice.specifications && (
                <p className="mt-2 text-xs text-white/70">
                  {selectedDevice.specifications}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question Mode Toggle */}
      {selectedDeviceId && (
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 p-1 text-xs">
          <button
            onClick={() => setShowPredefined(true)}
            className={`flex-1 rounded-2xl px-3 py-2 font-semibold transition ${
              showPredefined
                ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Predefined Questions
          </button>
          <button
            onClick={() => setShowPredefined(false)}
            className={`flex-1 rounded-2xl px-3 py-2 font-semibold transition ${
              !showPredefined
                ? "bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white"
                : "text-white/60 hover:text-white"
            }`}
          >
            Ask Your Own
          </button>
        </div>
      )}

      {/* Predefined Questions */}
      {selectedDeviceId && showPredefined && questions.length > 0 && (
        <div className="animate-fadeIn space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            Common Questions
          </p>
          <div className="space-y-2">
            {questions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(question)}
                disabled={isLoading}
                className="group w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white transition hover:border-cyan-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-cyan-400 transition group-hover:text-cyan-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{question}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Question Input */}
      {selectedDeviceId && !showPredefined && (
        <div className="animate-fadeIn space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            Ask Your Question
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAskQuestion(customQuestion);
                }
              }}
              placeholder="Type your question here..."
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 backdrop-blur-sm transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={() => handleAskQuestion(customQuestion)}
              disabled={!customQuestion.trim() || isLoading}
              className="rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(14,165,233,0.4)] transition hover:from-cyan-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              Ask
            </button>
          </div>
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="animate-fadeIn space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
            Conversation
          </p>
          <div className="max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`animate-slideIn flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    message.role === "user"
                      ? "border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-white"
                      : "border border-white/10 bg-white/5 text-white/90"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-2 text-xs text-white/40">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
                      <svg
                        className="h-5 w-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="animate-pulse flex gap-3">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-500">
                    <svg
                      className="h-5 w-5 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="max-w-[80%] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedDeviceId && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20">
            <svg
              className="h-8 w-8 text-cyan-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">
            Device Assistant Ready
          </h3>
          <p className="mt-2 text-sm text-white/60">
            Select a device or part from the dropdown above to get started.
            <br />
            Ask questions about installation, troubleshooting, or best
            practices.
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
