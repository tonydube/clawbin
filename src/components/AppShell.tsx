"use client";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";

const NAV_ROUTES: Record<string, string> = {
  explore: "/",
  bookmarks: "/bookmarks",
  "my-prompts": "/my-prompts",
  "my-runs": "/login",
};

function pathnameToNav(pathname: string): string {
  if (pathname === "/") return "explore";
  if (pathname === "/bookmarks") return "bookmarks";
  if (pathname === "/my-prompts") return "my-prompts";
  if (pathname.startsWith("/profile/")) return "my-runs";
  if (pathname === "/search") return "search";
  return "";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();

  if (pathname === "/login" || pathname === "/signup") {
    return <div className="h-full bg-bg-base">{children}</div>;
  }

  const activeNav = pathnameToNav(pathname);
  const profilePath = profile ? `/profile/${profile.username}` : "/login";

  return (
    <div className="flex h-full bg-bg-base overflow-hidden">
      {/* Sidebar — desktop only */}
      <Sidebar
        className="hidden lg:flex"
        activeNav={activeNav}
        onNavChange={(nav) =>
          router.push(
            nav === "my-runs" ? profilePath : (NAV_ROUTES[nav] ?? "/"),
          )
        }
        onTagChange={(tag) => {
          if (tag) router.push(`/search?tag=${encodeURIComponent(tag)}`);
        }}
      />

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
          onNewPrompt={() => router.push("/create")}
          onProfile={() => router.push(profilePath)}
        />

        {/* Page content */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>

        {/* Bottom navigation — mobile only */}
        <BottomNav
          activeNav={activeNav}
          onNavChange={(nav) =>
            router.push(
              nav === "my-runs" ? profilePath : (NAV_ROUTES[nav] ?? "/"),
            )
          }
          onSearch={() => router.push("/search")}
          onCreate={() => router.push("/create")}
          onProfile={() => router.push(profilePath)}
        />
      </div>
    </div>
  );
}
