"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProfileMenu } from "./profile-menu";

type NavLink = {
  label: string;
  href: string;
};

type FloatingIslandNavProps = {
  links: NavLink[];
};

export function FloatingIslandNav({ links }: FloatingIslandNavProps) {
  const pathname = usePathname();

  return (
    <div
      className="fixed left-0 right-0 top-4 z-50 flex w-full items-center justify-center px-4"
    >
      <div className="flex w-full max-w-7xl items-center justify-between gap-4">
        <nav
          className="flex flex-1 items-center justify-center gap-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_20px_60px_-35px_rgba(56,189,248,0.9)] backdrop-blur-2xl"
        >
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 rounded-full px-4 py-2 text-center transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/70 to-blue-500/70 font-semibold text-white shadow-[0_20px_45px_-30px_rgba(14,165,233,1)]"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ProfileMenu />
      </div>
    </div>
  );
}
