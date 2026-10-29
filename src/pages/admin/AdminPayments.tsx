// src/pages/crm/CRMPayments.tsx
import { useEffect, useState, useCallback } from "react";
import { getBookings } from "@/services/adminService";
import { IndianRupee, Loader2, TrendingUp, Clock, CheckCircle2, Link } from "lucide-react";
import { cn } from "@/lib/utils";

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-400/20",
    link_sent: "bg-blue-500/15 text-blue-400 border-blue-400/20",
    paid:      "bg-green-500/15 text-green-400 border-green-400/20",
    failed:    "bg-red-500/15 text-red-400 border-red-400/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
      m[status] || "bg-white/10 text-white/50 border-white/10")}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function CRMPayments() {
  const [rows,    setRows]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ limit: 100, payment: filter || undefined });
      setRows(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  // Summary stats
  const stats = {
    total:     rows.reduce((s, r) => s + (Number(r.payment_amount) || 0), 0),
    paid:      rows.filter(r => r.payment_status === "paid").reduce((s, r) => s + (Number(r.payment_amount) || 0), 0),
    pending:   rows.filter(r => r.payment_status === "pending").length,
    link_sent: rows.filter(r => r.payment_status === "link_sent").length,
    paid_count: rows.filter(r => r.payment_status === "paid").length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-white text-xl font-bold">Payments</h1>
        <p className="text-white/40 text-sm">Track payment status for all bookings</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: IndianRupee, label: "Total Invoiced",    value: `₹${stats.total.toLocaleString("en-IN")}`,    color: "blue"   },
          { icon: CheckCircle2,label: "Total Collected",   value: `₹${stats.paid.toLocaleString("en-IN")}`,     color: "green"  },
          { icon: Link,        label: "Link Sent",         value: stats.link_sent,                               color: "accent" },
          { icon: Clock,       label: "Pending Payment",   value: stats.pending,                                 color: "yellow" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 flex items-start gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              color === "green"  ? "bg-green-500/15 text-green-400"  :
              color === "yellow" ? "bg-yellow-500/15 text-yellow-400":
              color === "blue"   ? "bg-blue-500/15 text-blue-400"    :
              "bg-accent/15 text-accent"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium mb-0.5">{label}</p>
              <p className="text-white text-2xl font-bold leading-none">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["", "pending", "link_sent", "paid", "failed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all",
              filter === s
                ? "bg-accent text-white"
                : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
            )}>
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Booking ID","Customer","Phone","Service","Date","Amount","Payment Status","Link"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.booking_id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-white/50 font-mono text-xs">
                      {b.booking_id.slice(0,8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-white text-xs font-medium">{b.full_name}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{b.phone}</td>
                    <td className="px-4 py-3 text-white/60 text-xs capitalize">{b.service_type}</td>
                    <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">{b.pickup_date}</td>
                    <td className="px-4 py-3 text-white font-semibold text-xs">
                      {b.payment_amount ? `₹${Number(b.payment_amount).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={b.payment_status || "pending"} />
                    </td>
                    <td className="px-4 py-3">
                      {b.payment_link ? (
                        <a href={b.payment_link} target="_blank" rel="noreferrer"
                          className="text-accent text-xs hover:underline flex items-center gap-1">
                          <Link className="w-3 h-3" /> Open
                        </a>
                      ) : <span className="text-white/20 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-white/30 text-sm">
                      No payment records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
