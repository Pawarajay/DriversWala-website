// src/components/admin/AdminLayout.tsx

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, BookOpen, Users, CreditCard,
  LogOut, Car, Menu, X, ChevronRight, Bell,
  ClipboardList, UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Base nav — shown to all admins
const BASE_NAV = [
  { to: "/admin/dashboard",           icon: LayoutDashboard, label: "Dashboard"    },
  { to: "/admin/bookings",            icon: BookOpen,         label: "Bookings"     },
  { to: "/admin/drivers",             icon: Users,            label: "Drivers"      },
  { to: "/admin/driver-applications", icon: ClipboardList,    label: "Applications" },
  { to: "/admin/payments",            icon: CreditCard,       label: "Payments"     },
];

// Superadmin-only nav item
const SUPERADMIN_NAV = [
  { to: "/admin/users", icon: UserCog, label: "Manage Users" },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const isSuperadmin = admin?.role === "superadmin";

  const navItems = isSuperadmin ? [...BASE_NAV, ...SUPERADMIN_NAV] : BASE_NAV;

  const handleSignOut = () => {
    signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex flex-col h-full bg-[#060e1e] border-r border-white/[0.07]">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.07]">
        <img src="/logo.png" alt="DriversWala" className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />
        <span className="text-white/40 text-[11px] font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
            <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
          </NavLink>
        ))}

        {/* Superadmin section divider */}
        {isSuperadmin && (
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 pt-3 pb-1">
            Superadmin
          </p>
        )}
      </nav>

      {/* User info + sign out */}
      <div className="px-3 py-4 border-t border-white/[0.07]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center
                          text-blue-400 text-xs font-bold flex-shrink-0">
            {admin?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{admin?.name}</p>
            <p className="text-white/30 text-[10px] truncate capitalize">{admin?.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full
                     text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin } = useAuth();

  return (
    <div className="flex h-screen bg-[#080f1d] overflow-hidden">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 flex flex-col">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 lg:px-6 py-4
                           border-b border-white/[0.07] bg-[#060e1e] flex-shrink-0">
          <button
            className="lg:hidden text-white/50 hover:text-white transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center
                             text-white/40 hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center
                            text-blue-400 text-xs font-bold">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-white/70 text-sm font-medium">{admin?.name}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
