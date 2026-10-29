// src/pages/admin/AdminDashboard.tsx
// v2 — CEO-level operational dashboard. Sky blue + white theme.
import { useEffect, useState } from "react";
import { getDashboard } from "@/services/adminService";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  BookOpen, Users, CheckCircle2, Clock, XCircle,
  Navigation, IndianRupee, Car, Loader2, AlertCircle,
  TrendingUp, TrendingDown, AlertTriangle, Repeat, Timer,
  MapPinOff, UserMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const PIE_COLORS = ["#4A9DE0", "#4CAF7D", "#E8A23B", "#8B6FE0", "#D9534F"];

function StatCard({ icon: Icon, label, value, sub, accent = "border-t-[#4A9DE0]", iconBg = "bg-[#EAF4FD]", iconColor = "text-[#1D63A0]" }: any) {
  return (
    <div className={cn("bg-white border border-[#E4EBF1] rounded-xl p-[18px] shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)] border-t-[3px]", accent)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0", iconBg, iconColor)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#94A3B3]">{label}</p>
      </div>
      <p className="text-[26px] font-extrabold text-[#1A2433] leading-none tracking-tight">{value ?? "—"}</p>
      {sub && <p className="text-xs text-[#5A6B7D] mt-1.5">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { bg: string; text: string; dot: string }> = {
    pending:      { bg: "bg-[#FDF3E2]", text: "text-[#92650F]", dot: "bg-[#E8A23B]" },
    confirmed:    { bg: "bg-[#EAF4FD]", text: "text-[#1D63A0]", dot: "bg-[#4A9DE0]" },
    assigned:     { bg: "bg-[#F1EDFB]", text: "text-[#6B4FBF]", dot: "bg-[#8B6FE0]" },
    trip_started: { bg: "bg-[#E5F7FA]", text: "text-[#1A7E91]", dot: "bg-[#2BB7C9]" },
    trip_ongoing: { bg: "bg-[#E5F7FA]", text: "text-[#1A7E91]", dot: "bg-[#2BB7C9]" },
    completed:    { bg: "bg-[#E8F5EE]", text: "text-[#1E7A4C]", dot: "bg-[#4CAF7D]" },
    cancelled:    { bg: "bg-[#FCEAEA]", text: "text-[#B23A3A]", dot: "bg-[#D9534F]" },
  };
  const cfg = m[status] || { bg: "bg-[#F1F4F7]", text: "text-[#5A6B7D]", dot: "bg-[#94A3B3]" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize whitespace-nowrap", cfg.bg, cfg.text)}>
      <span className={cn("w-[5px] h-[5px] rounded-full flex-shrink-0", cfg.dot)} />
      {status.replace(/_/g, " ")}
    </span>
  );
}

function FunnelStage({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12.5px] font-medium text-[#5A6B7D]">{label}</span>
        <span className="text-[12.5px] font-bold text-[#1A2433]">{count} <span className="text-[#94A3B3] font-normal">({pct}%)</span></span>
      </div>
      <div className="h-2 rounded-full bg-[#F1F4F7] overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    getDashboard()
      .then((d) => setData(d.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-[#1D63A0] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-3 text-[#B23A3A] bg-[#FCEAEA] border border-[#F0C9C9] rounded-xl p-4">
      <AlertCircle className="w-5 h-5" /> {error}
    </div>
  );

  const s        = data.stats;
  const rev      = data.revenueTrend || {};
  const retn     = data.retention || {};
  const funnel   = data.funnel || {};
  const resp     = data.driverResponse || {};
  const gaps     = data.coverageGaps || [];
  const cooling  = data.coolingDrivers || [];

  const weeklyMap: Record<string, any> = {};
  (data.weekly || []).forEach((d: any) => { weeklyMap[d.date] = d; });
  const weeklyFilled = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return {
      date:     format(d, "MMM d"),
      bookings: weeklyMap[key]?.bookings || 0,
      revenue:  weeklyMap[key]?.revenue  || 0,
    };
  });

  const pieData = (data.byService || []).map((s: any) => ({
    name: s.service_type, value: Number(s.revenue) || Number(s.count),
  }));

  const hasAlerts = (s.active_drivers === 0) || gaps.length > 0 || cooling.length > 0 || (resp.no_response_pct > 30);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-[#1A2433] text-[22px] font-bold tracking-tight">Dashboard</h1>
        <p className="text-[#5A6B7D] text-[13.5px] mt-0.5">Welcome back — here's your business health overview</p>
      </div>

      {hasAlerts && (
        <div className="space-y-2">
          {s.active_drivers === 0 && (
            <div className="flex items-start gap-3 bg-[#FCEAEA] border border-[#F0C9C9] rounded-xl px-4 py-3">
              <AlertTriangle className="w-[18px] h-[18px] text-[#B23A3A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#B23A3A] text-sm font-bold">No active drivers</p>
                <p className="text-[#B23A3A] text-xs mt-0.5 opacity-80">
                  Any new booking right now has nobody to serve it. Activate or onboard drivers immediately.
                </p>
              </div>
            </div>
          )}

          {gaps.slice(0, 2).map((g: any) => (
            <div key={g.area} className="flex items-start gap-3 bg-[#FDF3E2] border border-[#F5DDB0] rounded-xl px-4 py-3">
              <MapPinOff className="w-[18px] h-[18px] text-[#92650F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#92650F] text-sm font-bold">No driver coverage in {g.area}</p>
                <p className="text-[#92650F] text-xs mt-0.5 opacity-80">
                  {g.booking_count} booking{g.booking_count !== 1 ? "s" : ""} from this area in the last 14 days, but zero active drivers cover it.
                </p>
              </div>
            </div>
          ))}

          {resp.no_response_pct > 30 && (
            <div className="flex items-start gap-3 bg-[#FDF3E2] border border-[#F5DDB0] rounded-xl px-4 py-3">
              <Timer className="w-[18px] h-[18px] text-[#92650F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#92650F] text-sm font-bold">{resp.no_response_pct}% of bookings got no driver response</p>
                <p className="text-[#92650F] text-xs mt-0.5 opacity-80">
                  In the last 30 days. These customers likely left without a driver — review WhatsApp delivery and driver coverage.
                </p>
              </div>
            </div>
          )}

          {cooling.length > 0 && (
            <div className="flex items-start gap-3 bg-[#FDF3E2] border border-[#F5DDB0] rounded-xl px-4 py-3">
              <UserMinus className="w-[18px] h-[18px] text-[#92650F] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[#92650F] text-sm font-bold">
                  {cooling.length} active driver{cooling.length !== 1 ? "s" : ""} haven't taken a trip in 14+ days
                </p>
                <p className="text-[#92650F] text-xs mt-0.5 opacity-80">
                  {cooling.slice(0, 3).map((d: any) => d.name).join(", ")}
                  {cooling.length > 3 ? ` +${cooling.length - 3} more` : ""} — check if they're still available.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#94A3B3] mb-2">Today's revenue</p>
          <div className="flex items-baseline gap-2">
            <p className="text-[28px] font-extrabold text-[#1A2433] tracking-tight">
              ₹{Number(rev.today_revenue || 0).toLocaleString("en-IN")}
            </p>
            {rev.change_pct !== 0 && (
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md",
                rev.change_pct > 0 ? "text-[#1E7A4C] bg-[#E8F5EE]" : "text-[#B23A3A] bg-[#FCEAEA]"
              )}>
                {rev.change_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(rev.change_pct)}%
              </span>
            )}
          </div>
          <p className="text-xs text-[#5A6B7D] mt-1.5">vs ₹{Number(rev.yesterday_revenue || 0).toLocaleString("en-IN")} yesterday</p>
        </div>

        <div className="bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#94A3B3] mb-2">Pending payments</p>
          <p className="text-[28px] font-extrabold text-[#E8A23B] tracking-tight">
            ₹{Number(s.pending_payment_value || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[#5A6B7D] mt-1.5">owed across unpaid bookings right now</p>
        </div>

        <div className="bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-[#94A3B3] mb-2">Average fare</p>
          <p className="text-[28px] font-extrabold text-[#1A2433] tracking-tight">
            ₹{Math.round(Number(s.avg_fare || 0)).toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-[#5A6B7D] mt-1.5">per completed, paid booking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total bookings"
          value={s.total_bookings} sub={`${s.today_bookings ?? 0} today`}
          accent="border-t-[#4A9DE0]" iconBg="bg-[#EAF4FD]" iconColor="text-[#1D63A0]" />
        <StatCard icon={Clock} label="Pending"
          value={s.pending} sub={`${s.today_pending ?? 0} new today`}
          accent="border-t-[#E8A23B]" iconBg="bg-[#FDF3E2]" iconColor="text-[#92650F]" />
        <StatCard icon={CheckCircle2} label="Completed"
          value={s.completed}
          accent="border-t-[#4CAF7D]" iconBg="bg-[#E8F5EE]" iconColor="text-[#1E7A4C]" />
        <StatCard icon={IndianRupee} label="Total revenue"
          value={`₹${Number(s.total_revenue || 0).toLocaleString("en-IN")}`}
          accent="border-t-[#4CAF7D]" iconBg="bg-[#E8F5EE]" iconColor="text-[#1E7A4C]" />
        <StatCard icon={Car} label="Active drivers"
          value={`${s.active_drivers ?? 0}/${s.total_drivers ?? 0}`}
          accent={s.active_drivers === 0 ? "border-t-[#D9534F]" : "border-t-[#8B6FE0]"}
          iconBg={s.active_drivers === 0 ? "bg-[#FCEAEA]" : "bg-[#F1EDFB]"}
          iconColor={s.active_drivers === 0 ? "text-[#B23A3A]" : "text-[#6B4FBF]"} />
        <StatCard icon={Navigation} label="Active trips"
          value={s.active_trips ?? 0} sub="trip_started + trip_ongoing"
          accent="border-t-[#2BB7C9]" iconBg="bg-[#E5F7FA]" iconColor="text-[#1A7E91]" />
        <StatCard icon={XCircle} label="Cancelled"
          value={s.cancelled}
          accent="border-t-[#D9534F]" iconBg="bg-[#FCEAEA]" iconColor="text-[#B23A3A]" />
        <StatCard icon={Repeat} label="Repeat customers"
          value={`${retn.repeat_rate_pct ?? 0}%`} sub={`${retn.unique_customers ?? 0} unique, last 30 days`}
          accent="border-t-[#4A9DE0]" iconBg="bg-[#EAF4FD]" iconColor="text-[#1D63A0]" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        <div className="bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[#1A2433] font-bold mb-1 text-sm">Booking funnel — last 30 days</p>
          <p className="text-[#94A3B3] text-xs mb-4">Where bookings drop off before completion</p>
          <div className="space-y-3">
            <FunnelStage label="Bookings created"   count={funnel.created || 0}          total={funnel.created || 1} color="bg-[#4A9DE0]" />
            <FunnelStage label="Driver assigned"     count={funnel.driver_assigned || 0}  total={funnel.created || 1} color="bg-[#8B6FE0]" />
            <FunnelStage label="Payment link sent"   count={funnel.payment_link_sent || 0} total={funnel.created || 1} color="bg-[#2BB7C9]" />
            <FunnelStage label="Payment received"    count={funnel.payment_received || 0}  total={funnel.created || 1} color="bg-[#E8A23B]" />
            <FunnelStage label="Trip completed"      count={funnel.trip_completed || 0}    total={funnel.created || 1} color="bg-[#4CAF7D]" />
          </div>
          {funnel.dropoff_pct > 0 && (
            <p className="text-[#B23A3A] text-xs font-semibold mt-4 bg-[#FCEAEA] rounded-lg px-3 py-2">
              {funnel.dropoff_pct}% of bookings never got a driver assigned
            </p>
          )}
        </div>

        <div className="bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[#1A2433] font-bold mb-1 text-sm">Driver responsiveness — last 30 days</p>
          <p className="text-[#94A3B3] text-xs mb-4">How fast drivers respond to WhatsApp alerts</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F7FAFC] rounded-lg p-4">
              <p className="text-[#94A3B3] text-[10.5px] font-semibold uppercase tracking-wide mb-1">Avg. accept time</p>
              <p className="text-[#1A2433] text-2xl font-extrabold">
                {resp.avg_accept_minutes != null ? `${resp.avg_accept_minutes}m` : "—"}
              </p>
            </div>
            <div className="bg-[#F7FAFC] rounded-lg p-4">
              <p className="text-[#94A3B3] text-[10.5px] font-semibold uppercase tracking-wide mb-1">No response</p>
              <p className={cn("text-2xl font-extrabold", resp.no_response_pct > 30 ? "text-[#B23A3A]" : "text-[#1A2433]")}>
                {resp.no_response_pct ?? 0}%
              </p>
            </div>
          </div>
          <p className="text-[#5A6B7D] text-xs mt-3">
            {resp.no_driver_response ?? 0} of {resp.total_recent ?? 0} bookings had no driver reply at all.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="lg:col-span-2 bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[#1A2433] font-bold mb-4 text-sm">Revenue — last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyFilled} barGap={4}>
              <XAxis dataKey="date" tick={{ fill: "#94A3B3", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94A3B3", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E4EBF1", borderRadius: 10 }}
                labelStyle={{ color: "#1A2433" }}
                itemStyle={{ color: "#5A6B7D" }}
                formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN")}`}
              />
              <Bar dataKey="revenue" fill="#4CAF7D" radius={[6, 6, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-[#E4EBF1] rounded-xl p-5 shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <p className="text-[#1A2433] font-bold mb-4 text-sm">Revenue by service type</p>
          {pieData.length > 0 && pieData.some((d: any) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" outerRadius={70}
                  dataKey="value" nameKey="name" label={false}>
                  {pieData.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ color: "#5A6B7D", fontSize: 11 }}>{v}</span>} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E4EBF1", borderRadius: 10 }}
                  itemStyle={{ color: "#5A6B7D" }}
                  formatter={(v: any) => `₹${Number(v).toLocaleString("en-IN")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[#94A3B3] text-sm">
              No revenue yet
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">

        <div className="bg-white border border-[#E4EBF1] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <div className="px-5 py-4 border-b border-[#E4EBF1] flex items-center justify-between">
            <p className="text-[#1A2433] font-bold text-sm">Top drivers</p>
            <Link to="/admin/drivers" className="text-[#1D63A0] text-xs font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="p-2">
            {(data.topDrivers || []).length === 0 && (
              <p className="text-[#94A3B3] text-sm text-center py-6">No drivers yet</p>
            )}
            {(data.topDrivers || []).map((d: any, i: number) => (
              <div key={d.driver_id}
                className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[#EFF6FC] transition-colors">
                <span className="text-[#94A3B3] text-[11px] font-bold w-4 text-center">{i + 1}</span>
                <div className="w-8 h-8 rounded-lg bg-[#D3E9FB] text-[#1D63A0] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {d.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1A2433] text-xs font-semibold truncate">{d.name}</p>
                  <p className="text-[#94A3B3] text-[11px]">{d.area}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#1A2433] text-xs font-bold">{d.total_trips} trips</p>
                  <p className="text-[#E8A23B] text-[11px] font-semibold">★ {d.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-[#E4EBF1] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(16,42,67,0.04),0_1px_8px_rgba(16,42,67,0.04)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4EBF1]">
            <p className="text-[#1A2433] font-bold text-sm">Recent bookings</p>
            <Link to="/admin/bookings" className="text-[#1D63A0] text-xs font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4EBF1] bg-[#F7FAFC]">
                  {["ID", "Customer", "Pickup", "Vehicle", "Driver", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-[#94A3B3] text-[10.5px] font-bold uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.recentBookings || []).map((b: any) => (
                  <tr key={b.booking_id} className="border-b border-[#E4EBF1] hover:bg-[#EFF6FC] transition-colors">
                    <td className="px-4 py-3 text-[#1D63A0] text-xs font-mono">
                      {b.booking_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[#1A2433] font-semibold text-xs">{b.full_name}</p>
                      <p className="text-[#94A3B3] text-[11px]">{b.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-[#1A2433] text-xs max-w-[130px] truncate">{b.pickup_city}</td>
                    <td className="px-4 py-3">
                      <p className="text-[#1A2433] text-xs uppercase font-semibold">{b.vehicle_type}</p>
                      {b.vehicle_number && <p className="text-[#1D63A0] text-[11px] font-mono font-semibold">{b.vehicle_number}</p>}
                    </td>
                    <td className="px-4 py-3 text-[#5A6B7D] text-xs">
                      {b.driver_name || <span className="text-[#94A3B3]">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.trip_status || b.status} /></td>
                  </tr>
                ))}
                {!data.recentBookings?.length && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#94A3B3] text-sm">
                      No bookings yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}