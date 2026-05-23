"use client";
import { Compass, FileText, Play, Bookmark, Settings } from "lucide-react";
import Link from "next/link";
import Avatar from "./Avatar";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { useTagStats } from "@/hooks/useTagStats";
import { getAvatarColor, getInitials } from "@/lib/utils";

// Sidebar is desktop-only; the parent passes className="hidden lg:flex" on mobile

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  count?: string;
  onClick?: () => void;
}

function NavItem({ icon, label, active, count, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group",
        active
          ? "bg-bg-active text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
      )}
    >
      <span
        className={clsx(
          "w-4 h-4 flex-shrink-0 transition-colors",
          active
            ? "text-accent-light"
            : "text-text-muted group-hover:text-text-secondary",
        )}
      >
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {count && (
        <span className="text-[11px] text-text-muted font-normal">{count}</span>
      )}
    </button>
  );
}

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  activeTag?: string | null;
  onTagChange: (tag: string | null) => void;
  className?: string;
}

export default function Sidebar({
  activeNav,
  onNavChange,
  activeTag = null,
  onTagChange,
  className,
}: SidebarProps) {
  const tags = useTagStats();
  const { profile } = useAuth();

  return (
    <aside
      className={clsx(
        "w-52 flex-shrink-0 flex flex-col h-full bg-bg-surface border-r border-border-subtle",
        className,
      )}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(124,58,237,0.4)]">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path
              d="M3 2C3 1.4 3.4 1 4 1H11C11.6 1 12 1.4 12 2V4L13.5 5.5C13.8 5.8 14 6.2 14 6.6V12C14 12.6 13.6 13 13 13H2C1.4 13 1 12.6 1 12V6.6C1 6.2 1.2 5.8 1.5 5.5L3 4V2Z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M5.5 8.5C5.5 7.7 6.7 7 7.5 7C8.3 7 9.5 7.7 9.5 8.5C9.5 9.3 8.6 9.8 7.5 10.5C6.4 9.8 5.5 9.3 5.5 8.5Z"
              fill="#7c3aed"
            />
          </svg>
        </div>
        <span className="font-semibold text-text-primary tracking-tight text-[15px]">
          Clawbin
        </span>
      </div>

      {/* Main Nav */}
      <nav className="px-2 flex flex-col gap-0.5">
        <NavItem
          icon={<Compass size={15} />}
          label="Explore"
          active={activeNav === "explore"}
          onClick={() => {
            onNavChange("explore");
            onTagChange(null);
          }}
        />
        <NavItem
          icon={<FileText size={15} />}
          label="My Prompts"
          active={activeNav === "my-prompts"}
          onClick={() => onNavChange("my-prompts")}
        />
        <NavItem
          icon={<Bookmark size={15} />}
          label="Bookmarks"
          active={activeNav === "bookmarks"}
          onClick={() => onNavChange("bookmarks")}
        />
        <NavItem
          icon={<Play size={15} />}
          label="My Runs"
          active={activeNav === "my-runs"}
          onClick={() => onNavChange("my-runs")}
        />
      </nav>

      {/* Divider */}
      <div className="mx-4 my-4 border-t border-border-subtle" />

      {/* Top Tags */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="px-1 mb-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Top Tags
        </p>
        <div className="flex flex-col gap-0.5">
          {tags.map((t) => (
            <button
              key={t.label}
              onClick={() =>
                onTagChange(activeTag === t.label ? null : t.label)
              }
              className={clsx(
                "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all duration-150 group",
                activeTag === t.label
                  ? "bg-bg-active text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
              )}
            >
              <span className="font-medium">{t.label}</span>
              <span className="text-[11px] text-text-muted">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Account footer */}
      <div className="p-3 border-t border-border-subtle">
        {/* Upgrade banner */}
        <div className="mb-3 rounded-xl border border-accent/20 bg-accent-glow p-3">
          <p className="text-xs font-semibold text-text-primary mb-0.5">
            Clawbin Pro
          </p>
          <p className="text-[11px] text-text-secondary leading-snug mb-2">
            Unlimited runs, private prompts, and more.
          </p>
          <button className="w-full rounded-lg bg-accent hover:bg-accent-hover transition-colors text-white text-xs font-semibold py-1.5">
            Upgrade to Pro
          </button>
        </div>

        {/* User row */}
        {profile ? (
          <Link
            href={`/profile/${profile.username}`}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-bg-hover transition-colors group"
          >
            <Avatar
              author={{
                id: profile.id,
                name: profile.display_name,
                username: profile.username,
                initials: getInitials(profile.display_name, profile.username),
                avatarColor: getAvatarColor(profile.id),
                avatarUrl: profile.avatar_url,
              }}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-text-primary truncate leading-tight">
                {profile.display_name}
              </p>
              <p className="text-[11px] text-text-secondary truncate leading-tight">
                @{profile.username}
              </p>
            </div>
            <Settings
              size={13}
              className="text-text-muted group-hover:text-text-secondary transition-colors flex-shrink-0"
            />
          </Link>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center rounded-lg border border-border-default px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
          >
            Sign in to save prompts
          </Link>
        )}
      </div>
    </aside>
  );
}
