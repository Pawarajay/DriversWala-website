// src/pages/BookingsDashboard.tsx  (public-facing page)
import { useState, useEffect, useCallback } from "react";

const Icon = ({ d, size = 16, color = "currentColor", strokeWidth = 2 }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons: Record<string, string> = {
  refresh:  "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  close:    "M18 6L6 18M6 6l12 12",
  car:      "M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2M7 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.07 3.38 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  mappin:   "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a1 1 0 1 0 2 0 1 1 0 0 0-2 0",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  clock:    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2",
  tag:      "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  note:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  chevronL: "M15 18l-6-6 6-6",
  chevronR: "M9 18l6-6-6-6",
  hash:     "M4 9h16M4 15h16M10 3L8 21M16 3l-2 18",
};

const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  pending:      { label: "Pending",      bg: "#fef9c3", color: "#854d0e", dot: "#eab308" },
  confirmed:    { label: "Confirmed",    bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  assigned:     { label: "Assigned",     bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  trip_started: { label: "Trip Started", bg: "#ffedd5", color: "#9a3412", dot: "#f97316" },
  trip_ongoing: { label: "Trip Ongoing", bg: "#cffafe", color: "#155e75", dot: "#06b6d4" },
  completed:    { label: "Completed",    bg: "#f3f4f6", color: "#374151", dot: "#6b7280" },
  cancelled:    { label: "Cancelled",    bg: "#fee2e2", color: "#991b1b", dot: "#ef4444" },
};

// Updated service labels — new keys from the revised rate sheet + legacy keys
// so existing bookings (hourly / daily / monthly) still display correctly.
const SERVICE_LABELS: Record<string, string> = {
  local: "Local",
  round_trip_outstation: "Round Trip Outstation (1 day)",
  outstation: "Outstation",
  valet: "Valet Parking",
  permanent: "Permanent Driver",
  // legacy keys — existing bookings
  hourly: "Hourly",
  daily: "Daily",
  monthly: "Monthly",
};

const ALL_STATUSES = ["all", "pending", "confirmed", "assigned", "trip_started", "trip_ongoing", "completed", "cancelled"];

// ── CSV export — now includes vehicle_number ──────────────────────────────────
function exportToCSV(bookings: any[]) {
  const headers = [
    "Booking ID", "Name", "Email", "Phone",
    "Pickup City", "Drop Location",
    "Date", "Time", "Service", "Vehicle Type", "Vehicle Number",
    "Status", "Notes", "Promo", "Created At",
  ];
  const rows = bookings.map((b) => [
    b.booking_id, b.full_name, b.email, b.phone,
    b.pickup_city, b.drop_location || "",
    b.pickup_date, b.pickup_time,
    SERVICE_LABELS[b.service_type] || b.service_type,
    b.vehicle_type, b.vehicle_number || "",
    b.status, b.special_notes || "", b.promo_code || "",
    new Date(b.created_at).toLocaleString("en-IN"),
  ]);
  const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatCard({ label, value, accent }: any) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: "20px 24px",
      border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,.06)",
      borderLeft: `4px solid ${accent}`,
    }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</p>
      <p style={{ margin: "6px 0 0", fontSize: 28, fontWeight: 800, color: "#111827" }}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
      padding: "3px 10px", borderRadius: 20,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {cfg.label.toUpperCase()}
    </span>
  );
}

// ── Booking detail modal ───────────────────────────────────────────────────────
function BookingModal({ booking, onClose, onStatusChange }: any) {
  if (!booking) return null;
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`${API_BASE}/bookings/${booking.booking_id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      onStatusChange(booking.booking_id, status);
      onClose();
    } catch { /* silent */ }
    setSaving(false);
  };

  const Field = ({ icon, label, value }: any) => value ? (
    <div style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ color: "#9ca3af", marginTop: 1 }}><Icon d={icons[icon]} size={14} /></span>
      <div>
        <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 14, color: "#111827", fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  ) : null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480,
        maxHeight: "90vh", overflowY: "auto", padding: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }} onClick={(e) => e.stopPropagation()}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase" }}>Booking Detail</p>
            <p style={{ margin: "4px 0 0", fontSize: 13, fontFamily: "monospace", color: "#374151", background: "#f3f4f6", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>
              {booking.booking_id?.slice(0, 18)}…
            </p>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "#f3f4f6", borderRadius: 8, padding: 6, cursor: "pointer", color: "#6b7280" }}>
            <Icon d={icons.close} size={16} />
          </button>
        </div>

        <StatusBadge status={booking.status} />

        <div style={{ marginTop: 16 }}>
          <Field icon="phone"    label="Customer"        value={`${booking.full_name} · ${booking.phone}`} />
          <Field icon="mail"     label="Email"           value={booking.email} />
          <Field icon="mappin"   label="Pickup"          value={booking.pickup_city} />
          <Field icon="mappin"   label="Drop"            value={booking.drop_location} />
          <Field icon="calendar" label="Date & Time"     value={`${booking.pickup_date}  ·  ${booking.pickup_time}`} />
          <Field icon="car"      label="Service"         value={SERVICE_LABELS[booking.service_type] || booking.service_type} />
          <Field icon="car"      label="Vehicle Type"    value={booking.vehicle_type?.toUpperCase()} />
          <Field icon="hash"     label="Vehicle Number"  value={booking.vehicle_number} />  {/* NEW */}
          <Field icon="tag"      label="Promo Code"      value={booking.promo_code} />
          <Field icon="note"     label="Notes"           value={booking.special_notes} />
          <Field icon="clock"    label="Booked At"       value={new Date(booking.created_at).toLocaleString("en-IN")} />
        </div>

        {/* Status update */}
        <div style={{ marginTop: 20, padding: "16px", background: "#f9fafb", borderRadius: 12 }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#374151" }}>Update Status</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button key={key} onClick={() => setStatus(key)} style={{
                fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                border: status === key ? `2px solid ${cfg.dot}` : "2px solid transparent",
                background: status === key ? cfg.bg : "#fff",
                color: status === key ? cfg.color : "#6b7280",
                transition: "all .15s",
              }}>
                {cfg.label}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving || status === booking.status} style={{
            marginTop: 12, width: "100%", padding: "10px", borderRadius: 10, border: "none",
            background: status !== booking.status ? "#111827" : "#e5e7eb",
            color: status !== booking.status ? "#fff" : "#9ca3af",
            fontWeight: 700, fontSize: 13,
            cursor: status !== booking.status ? "pointer" : "default",
            transition: "all .2s",
          }}>
            {saving ? "Saving…" : "Save Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function BookingsDashboard() {
  const [bookings,     setBookings]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter,   setDateFilter]   = useState("");
  const [selected,     setSelected]     = useState<any>(null);
  const [page,         setPage]         = useState(1);
  const PER_PAGE = 10;

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: "1", limit: "200" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (dateFilter)             params.set("date",   dateFilter);
      const res  = await fetch(`${API_BASE}/bookings?${params}`);
      const data = await res.json();
      if (data.success) setBookings(data.data || []);
      else throw new Error(data.message);
    } catch (e: any) {
      setError(e.message || "Failed to fetch bookings.");
    }
    setLoading(false);
  }, [statusFilter, dateFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { setPage(1); }, [search, statusFilter, dateFilter]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setBookings((prev) => prev.map((b) => b.booking_id === id ? { ...b, status: newStatus } : b));
  };

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return !q ||
      b.full_name?.toLowerCase().includes(q)  ||
      b.email?.toLowerCase().includes(q)       ||
      b.phone?.includes(q)                     ||
      b.pickup_city?.toLowerCase().includes(q) ||
      b.vehicle_number?.toLowerCase().includes(q) ||   // NEW
      b.booking_id?.includes(q);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: #f5f6fa; }
        .brow:hover { background: #f8faff !important; }
        .act-btn:hover { background: #e0e7ff !important; }
        input[type=date]::-webkit-calendar-picker-indicator { opacity: .5; cursor: pointer; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 6px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Navbar */}
        <nav style={{ background: "#0f172a", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 2px 16px rgba(0,0,0,.25)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
                <img src="/logo.png" alt="DriversWala" style={{ height: 32, width: "auto", objectFit: "contain" }} />
              </a>
              <span style={{ color: "#334155", margin: "0 8px", fontSize: 18 }}>/</span>
              <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, background: "#1e293b", padding: "3px 10px", borderRadius: 6, border: "1px solid #334155" }}>
                Bookings Dashboard
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => exportToCSV(filtered)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                <Icon d={icons.download} size={13} color="#fff" /> Export CSV
              </button>
              <button onClick={fetchBookings} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: 8, padding: "7px 10px", cursor: "pointer" }}>
                <Icon d={icons.refresh} size={14} color="#94a3b8" />
              </button>
              <a href="/#booking" style={{ display: "flex", alignItems: "center", gap: 5, background: "#f97316", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                <Icon d={icons.car} size={13} color="#fff" /> Book Driver
              </a>
            </div>
          </div>
        </nav>

        <div style={{ padding: "24px 20px 40px", maxWidth: 1280, margin: "0 auto" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
            <StatCard label="Total Bookings" value={stats.total}     accent="#6366f1" />
            <StatCard label="Pending"        value={stats.pending}   accent="#eab308" />
            <StatCard label="Confirmed"      value={stats.confirmed} accent="#22c55e" />
            <StatCard label="Completed"      value={stats.completed} accent="#6b7280" />
          </div>

          {/* Filters */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16, border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                <Icon d={icons.search} size={14} />
              </span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, phone, city, vehicle number…"
                style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px 8px 32px", fontSize: 13, outline: "none", color: "#111827", background: "#fafafa" }} />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ALL_STATUSES.map((s) => {
                const cfg    = STATUS_CONFIG[s];
                const active = statusFilter === s;
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all .15s",
                    border: active ? `1.5px solid ${cfg?.dot || "#6366f1"}` : "1.5px solid #e5e7eb",
                    background: active ? (cfg?.bg || "#eef2ff") : "#fff",
                    color:      active ? (cfg?.color || "#4338ca") : "#6b7280",
                  }}>
                    {s === "all" ? "All" : (STATUS_CONFIG[s]?.label || s)}
                  </button>
                );
              })}
            </div>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
              style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 10px", fontSize: 13, outline: "none", color: "#374151", background: "#fafafa" }} />
            {dateFilter && (
              <button onClick={() => setDateFilter("")} style={{ border: "none", background: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                <Icon d={icons.close} size={14} />
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", boxShadow: "0 1px 4px rgba(0,0,0,.05)", overflow: "hidden" }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
                <p style={{ fontSize: 14 }}>Loading bookings…</p>
              </div>
            ) : error ? (
              <div style={{ padding: 60, textAlign: "center", color: "#ef4444" }}>
                <p style={{ fontSize: 14 }}>⚠️ {error}</p>
                <button onClick={fetchBookings} style={{ marginTop: 12, padding: "8px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>
                <p style={{ fontSize: 14 }}>No bookings found.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                      {["Booking ID","Customer","Contact","Pickup","Date · Time","Service","Vehicle","Status",""].map((h) => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.08em", textTransform: "uppercase", background: "#fafafa", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((b) => (
                      <tr key={b.booking_id} className="brow" style={{ borderBottom: "1px solid #f9fafb", background: "#fff", cursor: "pointer", transition: "background .1s" }}>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <span style={{ fontFamily: "monospace", fontSize: 11, color: "#6366f1", background: "#eef2ff", padding: "2px 7px", borderRadius: 5 }}>
                            {b.booking_id?.slice(0, 8)}…
                          </span>
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <p style={{ margin: 0, fontWeight: 600, color: "#111827" }}>{b.full_name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{b.email}</p>
                        </td>
                        <td style={{ padding: "13px 16px", color: "#374151", whiteSpace: "nowrap" }}>{b.phone}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <p style={{ margin: 0, color: "#374151" }}>{b.pickup_city}</p>
                          {b.drop_location && <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>→ {b.drop_location}</p>}
                        </td>
                        <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                          <p style={{ margin: 0, color: "#374151" }}>{b.pickup_date}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{b.pickup_time}</p>
                        </td>
                        <td style={{ padding: "13px 16px", color: "#374151" }}>{SERVICE_LABELS[b.service_type] || b.service_type}</td>
                        <td style={{ padding: "13px 16px" }}>
                          {/* Vehicle type + number stacked */}
                          <p style={{ margin: 0, color: "#374151", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>{b.vehicle_type}</p>
                          {b.vehicle_number && (
                            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6366f1", fontFamily: "monospace", fontWeight: 600 }}>{b.vehicle_number}</p>
                          )}
                        </td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={b.status} /></td>
                        <td style={{ padding: "13px 16px" }}>
                          <button className="act-btn" onClick={() => setSelected(b)} style={{ display: "flex", alignItems: "center", gap: 4, border: "none", background: "#f0f1ff", color: "#6366f1", borderRadius: 7, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, transition: "background .15s" }}>
                            <Icon d={icons.eye} size={12} color="#6366f1" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid #f3f4f6" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>
                  Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
                </p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 7, padding: "5px 10px", cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "#d1d5db" : "#374151" }}>
                    <Icon d={icons.chevronL} size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} onClick={() => setPage(n)} style={{ border: page === n ? "1.5px solid #6366f1" : "1px solid #e5e7eb", background: page === n ? "#eef2ff" : "#fff", color: page === n ? "#6366f1" : "#374151", borderRadius: 7, padding: "5px 10px", cursor: "pointer", fontWeight: page === n ? 700 : 400, fontSize: 13 }}>{n}</button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 7, padding: "5px 10px", cursor: page === totalPages ? "default" : "pointer", color: page === totalPages ? "#d1d5db" : "#374151" }}>
                    <Icon d={icons.chevronR} size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <p style={{ textAlign: "center", marginTop: 28, fontSize: 11, color: "#d1d5db" }}>
            DriverWala · Bookings Dashboard · <a href="/" style={{ color: "#6366f1", textDecoration: "none" }}>← Back to Website</a>
          </p>
        </div>
      </div>

      <BookingModal booking={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
    </>
  );
}