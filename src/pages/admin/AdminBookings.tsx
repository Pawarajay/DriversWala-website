// src/pages/crm/CRMBookings.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookings, getDrivers, assignDriver, sendPaymentLink,
  markPaid, updateBookingStatus, deleteBooking,
} from "@/services/adminService";
import {
  Search, Filter, RefreshCw, Eye, UserCheck,
  CreditCard, CheckCircle, XCircle, Trash2, Loader2, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["", "pending","confirmed","assigned","completed","cancelled"];
const SERVICE_OPTIONS = ["","hourly","daily","outstation","monthly","valet"];

function Badge({ status }: { status: string }) {
  const m: Record<string, string> = {
    pending:   "bg-yellow-500/15 text-yellow-400 border-yellow-400/20",
    confirmed: "bg-blue-500/15 text-blue-400 border-blue-400/20",
    assigned:  "bg-purple-500/15 text-purple-400 border-purple-400/20",
    completed: "bg-green-500/15 text-green-400 border-green-400/20",
    cancelled: "bg-red-500/15 text-red-400 border-red-400/20",
    paid:      "bg-green-500/15 text-green-400 border-green-400/20",
    link_sent: "bg-blue-500/15 text-blue-400 border-blue-400/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
      m[status] || "bg-white/10 text-white/50 border-white/10")}>
      {status.replace("_"," ")}
    </span>
  );
}

// ── Booking Detail / Action Modal ─────────────────────────────────────────────
function BookingModal({ booking, drivers, onClose, onRefresh }: any) {
  const [tab,         setTab]         = useState<"details"|"assign"|"payment">("details");
  const [selDriver,   setSelDriver]   = useState(booking.assigned_driver_id || "");
  const [amount,      setAmount]      = useState("");
  const [payLink,     setPayLink]     = useState("");
  const [loading,     setLoading]     = useState(false);
  const [msg,         setMsg]         = useState("");

  const act = async (fn: () => Promise<any>, successMsg: string) => {
    setLoading(true); setMsg("");
    try {
      await fn();
      setMsg("✅ " + successMsg);
      onRefresh();
    } catch (e: any) { setMsg("❌ " + e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1b2e] border border-white/10 rounded-3xl w-full max-w-2xl
                      max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <p className="text-white font-bold">Booking #{booking.booking_id.slice(0,8).toUpperCase()}</p>
            <p className="text-white/40 text-xs mt-0.5">{booking.full_name} · {booking.phone}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["details","assign","payment"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                tab === t ? "bg-accent text-white" : "text-white/40 hover:text-white hover:bg-white/5"
              )}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">

          {/* Details tab */}
          {tab === "details" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Customer",    booking.full_name],
                  ["Phone",       booking.phone],
                  ["Email",       booking.email],
                  ["Service",     booking.service_type],
                  ["Vehicle",     booking.vehicle_type],
                  ["Date",        booking.pickup_date],
                  ["Time",        booking.pickup_time],
                  ["Status",      booking.status],
                ].map(([k, v]) => (
                  <div key={k} className="bg-white/5 rounded-xl px-3 py-2.5">
                    <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">{k}</p>
                    <p className="text-white text-sm mt-0.5 capitalize">{v}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl px-3 py-2.5">
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">Pickup</p>
                <p className="text-white text-sm mt-0.5">{booking.pickup_city}</p>
              </div>
              {booking.drop_location && (
                <div className="bg-white/5 rounded-xl px-3 py-2.5">
                  <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wide">Drop</p>
                  <p className="text-white text-sm mt-0.5">{booking.drop_location}</p>
                </div>
              )}
              {booking.driver_name && (
                <div className="bg-purple-500/10 border border-purple-400/20 rounded-xl px-3 py-2.5">
                  <p className="text-purple-400 text-[10px] font-semibold uppercase tracking-wide">Assigned Driver</p>
                  <p className="text-white text-sm mt-0.5">{booking.driver_name} · {booking.driver_phone}</p>
                </div>
              )}

              {/* Status change */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["completed","cancelled"].map((s) => (
                  <button key={s} onClick={() => act(() => updateBookingStatus(booking.booking_id, s), `Status → ${s}`)}
                    disabled={loading || booking.status === s}
                    className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40",
                      s === "completed"
                        ? "border-green-400/30 text-green-400 hover:bg-green-500/15"
                        : "border-red-400/30 text-red-400 hover:bg-red-500/15"
                    )}>
                    Mark {s}
                  </button>
                ))}
                <button onClick={() => act(() => deleteBooking(booking.booking_id), "Booking deleted")}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-red-500/30
                             text-red-400 hover:bg-red-500/15 transition-all disabled:opacity-40 ml-auto">
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Assign driver tab */}
          {tab === "assign" && (
            <div className="space-y-3">
              <p className="text-white/50 text-sm">Select a driver to assign to this booking.
                A WhatsApp notification will be sent to both driver and customer.</p>
              <select
                value={selDriver}
                onChange={(e) => setSelDriver(e.target.value)}
                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 text-white
                           text-sm px-3 focus:outline-none focus:ring-1 focus:ring-accent
                           [&>option]:bg-[#0d1b2e]"
              >
                <option value="">Select driver…</option>
                {drivers.filter((d: any) => d.active).map((d: any) => (
                  <option key={d.driver_id} value={d.driver_id}>
                    {d.name} · {d.area} · {d.phone}
                  </option>
                ))}
              </select>
              <button
                onClick={() => act(() => assignDriver(booking.booking_id, selDriver), "Driver assigned & notified!")}
                disabled={loading || !selDriver}
                className="w-full h-11 rounded-xl bg-accent text-white font-bold text-sm
                           hover:bg-accent/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                Assign & Notify via WhatsApp
              </button>
            </div>
          )}

          {/* Payment tab */}
          {tab === "payment" && (
            <div className="space-y-3">
              <p className="text-white/50 text-sm">Enter the amount and payment link.
                This will be sent to the customer via WhatsApp.</p>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₹)"
                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 text-white
                           text-sm px-3 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <input
                type="url"
                value={payLink}
                onChange={(e) => setPayLink(e.target.value)}
                placeholder="Payment link (https://…)"
                className="w-full h-11 rounded-xl bg-white/10 border border-white/15 text-white
                           text-sm px-3 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={() => act(() => sendPaymentLink(booking.booking_id, Number(amount), payLink),
                  "Payment link sent to customer!")}
                disabled={loading || !amount || !payLink}
                className="w-full h-11 rounded-xl bg-blue-600 text-white font-bold text-sm
                           hover:bg-blue-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Send Payment Link via WhatsApp
              </button>

              {booking.assigned_driver_id && (
                <button
                  onClick={() => act(() => markPaid(booking.booking_id),
                    "Marked paid! Driver & customer notified!")}
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-green-600 text-white font-bold text-sm
                             hover:bg-green-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Mark as Paid & Share Driver Details
                </button>
              )}
            </div>
          )}

          {msg && (
            <p className={cn("text-sm px-3 py-2 rounded-xl",
              msg.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-400/20"
                                   : "bg-red-500/10 text-red-400 border border-red-400/20")}>
              {msg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Bookings Page ────────────────────────────────────────────────────────
export default function CRMBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [drivers,  setDrivers]  = useState<any[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const [filters, setFilters] = useState({
    search: "", status: "", service: "", date: "", payment: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBookings({ ...filters, page, limit: 20 });
      setBookings(res.data);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getDrivers({ active: true }).then((d) => setDrivers(d.data));
  }, []);

  const setF = (k: string, v: string) => {
    setFilters((p) => ({ ...p, [k]: v }));
    setPage(1);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Bookings</h1>
          <p className="text-white/40 text-sm">{total} total bookings</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5
                     text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input value={filters.search} onChange={(e) => setF("search", e.target.value)}
              placeholder="Search name, phone, ID…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/10 border border-white/10
                         text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          {[
            { key: "status",  opts: STATUS_OPTIONS,  ph: "All Status" },
            { key: "service", opts: SERVICE_OPTIONS, ph: "All Services" },
          ].map(({ key, opts, ph }) => (
            <select key={key} value={(filters as any)[key]} onChange={(e) => setF(key, e.target.value)}
              className="h-10 rounded-xl bg-white/10 border border-white/10 text-white text-sm px-3
                         focus:outline-none focus:ring-1 focus:ring-accent [&>option]:bg-[#0d1b2e]">
              <option value="">{ph}</option>
              {opts.filter(Boolean).map((o) => (
                <option key={o} value={o} className="capitalize">{o}</option>
              ))}
            </select>
          ))}
          <input type="date" value={filters.date} onChange={(e) => setF("date", e.target.value)}
            className="h-10 rounded-xl bg-white/10 border border-white/10 text-white text-sm px-3
                       focus:outline-none focus:ring-1 focus:ring-accent [color-scheme:dark]" />
        </div>
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
                  {["Booking ID","Customer","Pickup → Drop","Date/Time","Service","Driver","Status","Payment","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.booking_id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors group">
                    <td className="px-4 py-3 text-white/50 font-mono text-xs">
                      {b.booking_id.slice(0,8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-xs">{b.full_name}</p>
                      <p className="text-white/40 text-[11px]">{b.phone}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="text-white/70 text-xs truncate">{b.pickup_city}</p>
                      {b.drop_location && (
                        <p className="text-white/30 text-[11px] truncate">→ {b.drop_location}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-white/70 text-xs">{b.pickup_date}</p>
                      <p className="text-white/40 text-[11px]">{b.pickup_time}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs capitalize">{b.service_type}</td>
                    <td className="px-4 py-3 text-xs">
                      {b.driver_name
                        ? <span className="text-purple-400">{b.driver_name}</span>
                        : <span className="text-white/20">Unassigned</span>
                      }
                    </td>
                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                    <td className="px-4 py-3"><Badge status={b.payment_status || "pending"} /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(b)}
                        className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white
                                   transition-all"
                        title="View / Manage"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!bookings.length && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-white/30 text-sm">
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
            <p className="text-white/30 text-xs">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs
                           hover:bg-white/10 disabled:opacity-30 transition-all">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs
                           hover:bg-white/10 disabled:opacity-30 transition-all">Next →</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <BookingModal
          booking={selected}
          drivers={drivers}
          onClose={() => setSelected(null)}
          onRefresh={() => { load(); setSelected(null); }}
        />
      )}
    </div>
  );
}
