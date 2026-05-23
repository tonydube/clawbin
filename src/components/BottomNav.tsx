"use client";
import { Compass, Plus, Bookmark, User, Search } from "lucide-react";
import { clsx } from "clsx";

type BottomNavSection = "explore" | "bookmarks" | "my-runs" | "my-prompts";

interface BottomNavProps {
  activeNav: string;
  onNavChange: (nav: BottomNavSection) => void;
  onSearch: () => void;
  onCreate: () => void;
  onProfile: () => void;
}

export default function BottomNav({
  activeNav,
  onNavChange,
  onSearch,
  onCreate,
  onProfile,
}: BottomNavProps) {
  return (
    <nav
      className="lg:hidden flex-shrink-0 bg-bg-surface/95 backdrop-blur-md border-t border-border-subtle"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center h-14">
        {/* Explore */}
        <button
          onClick={() => onNavChange("explore")}
          aria-label="Explore"
          className={clsx(
            "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:bg-bg-hover",
            activeNav === "explore" ? "text-accent-light" : "text-text-muted",
          )}
        >
          <Compass size={22} />
          <span className="text-[10px] font-medium leading-none">Explore</span>
        </button>

        {/* Search */}
        <button
          onClick={onSearch}
          aria-label="Search"
          className={clsx(
            "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:bg-bg-hover",
            activeNav === "search" ? "text-accent-light" : "text-text-muted",
          )}
        >
          <Search size={22} />
          <span className="text-[10px] font-medium leading-none">Search</span>
        </button>

        {/* Create — accent pill in center */}
        <button
          onClick={onCreate}
          aria-label="Create prompt"
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:bg-bg-hover"
        >
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_14px_rgba(124,58,237,0.4)] active:scale-90 transition-transform">
            <Plus size={20} strokeWidth={2.5} className="text-white" />
          </div>
        </button>

        {/* Saved */}
        <button
          onClick={() => onNavChange("bookmarks")}
          aria-label="Bookmarks"
          className={clsx(
            "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:bg-bg-hover",
            activeNav === "bookmarks" ? "text-accent-light" : "text-text-muted",
          )}
        >
          <Bookmark size={22} />
          <span className="text-[10px] font-medium leading-none">Saved</span>
        </button>

        {/* Profile */}
        <button
          onClick={onProfile}
          aria-label="Profile"
          className={clsx(
            "flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors active:bg-bg-hover",
            activeNav === "my-runs" ? "text-accent-light" : "text-text-muted",
          )}
        >
          <User size={22} />
          <span className="text-[10px] font-medium leading-none">Profile</span>
        </button>
      </div>
    </nav>
  );
}
