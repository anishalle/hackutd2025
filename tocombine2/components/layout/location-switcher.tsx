"use client";

import { useMemo, useState } from "react";

export type LocationOption = {
  id: string;
  name: string;
  status: string;
  detail: string;
  lastSync: string;
  disabled?: boolean;
};

type LocationSwitcherProps = {
  locations: LocationOption[];
  initialId: string;
};

export function LocationSwitcher({
  locations,
  initialId,
}: LocationSwitcherProps) {
  const [activeId, setActiveId] = useState(initialId);
  const [open, setOpen] = useState(false);

  const activeLocation = useMemo(() => {
    return locations.find((loc) => loc.id === activeId) ?? locations[0];
  }, [activeId, locations]);

  return (
    <div className="relative">
      <button
        className="flex w-full flex-col gap-3 rounded-3xl border border-white/15 bg-white/5 px-5 py-4 text-left text-white shadow-[0_15px_45px_-30px_rgba(14,165,233,1)] transition hover:border-cyan-400/40"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
          <span>Active fabric</span>
          <span className="flex items-center gap-2 text-[11px] font-medium text-cyan-200">
            Switch
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 text-[10px] text-cyan-100">
              •
            </span>
          </span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xl font-semibold">{activeLocation.name}</p>
            <p className="text-sm text-white/60">{activeLocation.detail}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Last sync
            </p>
            <p className="text-sm font-semibold text-white">
              {activeLocation.lastSync}
            </p>
            <p className="text-xs text-white/60">{activeLocation.status}</p>
          </div>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#050b18] shadow-2xl shadow-cyan-500/20">
          {locations.map((location) => {
            const isActive = location.id === activeLocation.id;
            return (
              <button
                key={location.id}
                disabled={location.disabled}
                onClick={() => {
                  if (location.disabled) {
                    return;
                  }
                  setActiveId(location.id);
                  setOpen(false);
                }}
                className={`w-full border-b border-white/5 px-4 py-3 text-left transition last:border-none ${
                  location.disabled
                    ? "cursor-not-allowed opacity-40"
                    : "hover:bg-white/5"
                } ${isActive ? "bg-white/5" : ""}`}
              >
                <p className="text-sm font-semibold text-white">
                  {location.name}
                </p>
                <p className="text-xs text-white/60">{location.detail}</p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
                  {location.status}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
