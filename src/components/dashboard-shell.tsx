"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/chat", label: "AI Chat", icon: Bot },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/checklists", label: "Checklists", icon: CheckSquare },
  { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
];

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
};

export function DashboardShell({ children, user }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-900/60 p-6 md:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">NBR Assist</p>
              <p className="text-xs text-slate-400">Compliance Copilot</p>
            </div>
          </div>

          <nav className="space-y-2">
            {links
              .filter((link) => !link.adminOnly || user.role === "ADMIN")
              .map((link) => {
                const Icon = link.icon;
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                      active
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "text-slate-300 hover:bg-slate-800",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
          </nav>

          <div className="mt-auto space-y-3 border-t border-slate-800 pt-4">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
