"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Option = {
  value: string;
  label: string;
};

type FilterMultiSelectProps = {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
};

export function FilterMultiSelect({
  label,
  options,
  selected,
  onChange,
}: FilterMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const summary = useMemo(() => {
    if (selected.length === 0) return "All";
    if (selected.length <= 2) {
      return selected
        .map((value) => options.find((option) => option.value === value)?.label ?? value)
        .join(", ");
    }
    return `${selected.length} selected`;
  }, [options, selected]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((current) => current !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const clearSelection = () => onChange([]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-w-[160px] items-center justify-between rounded-2xl border border-white/15 bg-black/40 px-4 py-2 text-left text-sm text-white/80 hover:border-white/40"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">{label}</p>
          <p className="text-white">{summary}</p>
        </div>
        <span className="text-white/50">{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-slate-950/95 p-3 text-sm text-white shadow-2xl">
          <div className="mb-2 flex items-center justify-between text-xs text-white/60">
            <span>Select {label.toLowerCase()}</span>
            <button
              type="button"
              className="text-cyan-300 hover:text-cyan-100"
              onClick={clearSelection}
            >
              Clear
            </button>
          </div>
          <div className="max-h-64 space-y-1 overflow-auto pr-1">
            {options.map((option) => {
              const isChecked = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm ${
                    isChecked
                      ? "border-cyan-400/40 bg-cyan-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/40"
                  }`}
                >
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-cyan-400"
                    checked={isChecked}
                    onChange={() => toggleValue(option.value)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
