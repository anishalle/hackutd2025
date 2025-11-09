"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useProfile } from "@/contexts/profile-context";
import { getFullName, getUserInitials } from "@/lib/profile/data";

export function ProfileMenu() {
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const initials = getUserInitials(profile);
  const fullName = getFullName(profile);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/5 pl-1 pr-4 py-1 text-sm text-white shadow-[0_10px_30px_-15px_rgba(14,165,233,0.8)] transition hover:border-cyan-400/40 hover:bg-white/10"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.6)]">
          {initials}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold text-white">
            {profile.firstName}
          </span>
          <span className="text-[10px] text-white/50 uppercase tracking-wider">
            {profile.role}
          </span>
        </div>
        <svg
          className={`h-4 w-4 text-white/70 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="animate-fadeIn absolute right-0 top-full z-[60] mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#050b18] shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
          <div className="border-b border-white/10 bg-gradient-to-br from-white/5 to-cyan-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-lg font-bold text-white shadow-[0_0_25px_rgba(14,165,233,0.7)]">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{fullName}</p>
                <p className="text-xs text-white/60">{profile.occupation}</p>
                <p className="text-[10px] text-cyan-300/70 uppercase tracking-wider">
                  {profile.region}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white transition hover:bg-white/10"
            >
              <svg
                className="h-5 w-5 text-cyan-400"
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
              <div>
                <p className="font-semibold">View Profile</p>
                <p className="text-xs text-white/50">Personal & health info</p>
              </div>
            </Link>

            <button
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white transition hover:bg-white/10"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="h-5 w-5 text-white/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>
          </div>

          <div className="border-t border-white/10 p-2">
            <button
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      ) : null}

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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
