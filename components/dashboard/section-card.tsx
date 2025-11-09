import { ReactNode } from "react";

type SectionCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_45px_-15px_rgba(14,165,233,0.6)] backdrop-blur-xl ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-cyan-500/10" />
      <div className="relative border-b border-white/10 px-6 pb-4 pt-5">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
            {eyebrow}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {description && (
              <p className="text-sm text-white/60">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
      <div className="relative px-6 py-5">{children}</div>
    </section>
  );
}
