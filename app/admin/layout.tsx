import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Music2, LayoutDashboard, ListMusic, Users, BarChart3 } from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/songs", label: "Músicas", icon: ListMusic },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/stats", label: "Estatísticas", icon: BarChart3 },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin");

  // Check admin role via metadata or a separate table
  const isAdmin = user.app_metadata?.role === "admin" ||
    user.user_metadata?.is_admin === true;

  if (!isAdmin) redirect("/");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/5 bg-surface-800">
        <div className="p-6">
          <div className="flex items-center gap-2 font-bold text-lg mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-brand">
              <Music2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-gradient">Admin</span>
          </div>

          <nav className="space-y-1">
            {adminLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-surface-900 p-8">{children}</main>
    </div>
  );
}
