
import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2, XCircle, Eye, Loader2, Search,
  Shield, Phone, MapPin, CreditCard, User, X, FileText, Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
function getToken() { return localStorage.getItem("admin_token") || ""; }

async function crmReq(method: string, path: string, body?: any) {
  const res  = await fetch(`${API}/admin${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

const STATUS_COLORS: Record<string, string> = {
  pending:            "bg-yellow-500/15 text-yellow-400 border-yellow-400/20",
  documents_uploaded: "bg-blue-500/15 text-blue-400 border-blue-400/20",
  under_review:       "bg-purple-500/15 text-purple-400 border-purple-400/20",
  approved:           "bg-green-500/15 text-green-400 border-green-400/20",
  rejected:           "bg-red-500/15 text-red-400 border-red-400/20",
};

function Badge({ status }: { status: string }) {
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize",
      STATUS_COLORS[status] || "bg-white/10 text-white/40 border-white/10")}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

// ── Approve modal — just confirm zone, then one click ─────────────────────────
function ApproveModal({ app, onClose, onDone }: any) {
  const [area,    setArea]    = useState(app.location || "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleApprove = async () => {
    setLoading(true); setError("");
    try {
      await crmReq("PATCH", `/driver-applications/${app.app_id}/approve`, { area });
      onDone("approved");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1b2e] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <p className="text-white font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" /> Approve Driver
          </p>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* Driver summary */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-2">
            <p className="text-white font-semibold">{app.full_name}</p>
            <p className="text-white/50 text-xs flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />{app.phone}
            </p>
            <p className="text-white/50 text-xs flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />{app.location}
            </p>
          </div>

          {/* Context note */}
          <div className="bg-blue-500/8 border border-blue-400/20 rounded-xl px-4 py-3">
            <p className="text-blue-400 text-xs leading-relaxed">
              <span className="font-bold">Note:</span> This driver will drive <span className="font-bold">customers' own vehicles</span> — no vehicle details are needed from the driver.
            </p>
          </div>

          {/* Zone — auto-filled from registration, admin can adjust */}
          <div>
            <label className="text-white/40 text-xs font-semibold uppercase tracking-widest block mb-1.5">
              Assigned Zone / Area
            </label>
            <input value={area} onChange={e => setArea(e.target.value)}
              placeholder="e.g. Wakad, Pune"
              className="w-full h-11 rounded-xl bg-white/10 border border-white/10 text-white text-sm px-3
                         placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-green-500/50" />
            <p className="text-white/25 text-xs mt-1">Pre-filled from driver's registration. Adjust if needed.</p>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button onClick={handleApprove} disabled={loading}
            className="w-full h-12 rounded-xl bg-green-600 text-white font-bold text-sm
                       hover:bg-green-500 transition-all disabled:opacity-50
                       flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</>
              : <><CheckCircle2 className="w-4 h-4" /> Approve & Notify on WhatsApp</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reject modal ───────────────────────────────────────────────────────────────
function RejectModal({ app, onClose, onDone }: any) {
  const [reason,  setReason]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleReject = async () => {
    setLoading(true); setError("");
    try {
      await crmReq("PATCH", `/driver-applications/${app.app_id}/reject`, { reason });
      onDone("rejected");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1b2e] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <p className="text-white font-bold flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-400" /> Reject Application
          </p>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-white/50 text-sm">Provide a reason (optional). Driver will be notified on WhatsApp.</p>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Reason for rejection (optional)…" rows={3}
            className="w-full rounded-xl bg-white/10 border border-white/10 text-white text-sm px-3 py-2.5
                       placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-red-500/50 resize-none" />
          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">⚠️ {error}</p>
          )}
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-white/5 text-white/60 text-sm font-medium hover:bg-white/10 transition-all">
              Cancel
            </button>
            <button onClick={handleReject} disabled={loading}
              className="flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm
                         hover:bg-red-500 transition-all disabled:opacity-50
                         flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              {loading ? "Rejecting…" : "Reject & Notify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Detail drawer ──────────────────────────────────────────────────────────────
function DetailDrawer({ app, onClose, onAction }: any) {
  const [showApprove, setShowApprove] = useState(false);
  const [showReject,  setShowReject]  = useState(false);

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="relative h-full w-full max-w-lg bg-[#0a1628] border-l border-white/10
                        overflow-y-auto shadow-2xl"
             onClick={e => e.stopPropagation()}>

          <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <p className="text-white font-bold">{app.full_name}</p>
              <p className="text-white/40 text-xs mt-0.5">{app.app_id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={app.status} />
              <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="p-6 space-y-5">

            {/* Business model clarification */}
            <div className="bg-blue-500/8 border border-blue-400/20 rounded-2xl px-4 py-3">
              <p className="text-blue-400 text-xs">
                🚗 This driver will drive <strong>customers' own vehicles</strong>. No vehicle details required from driver.
              </p>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User,       label: "Full Name",  value: app.full_name },
                { icon: Phone,      label: "Mobile",     value: app.phone },
                { icon: MapPin,     label: "Location",   value: app.location },
                { icon: CreditCard, label: "Aadhar",     value: "XXXX XXXX " + String(app.aadhar_number || "").slice(-4) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white/5 rounded-2xl p-3.5">
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-1">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{value || "—"}</p>
                </div>
              ))}
            </div>

            {/* Documents checklist */}
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Documents</p>
              <div className="space-y-2">
                {[
                  { icon: FileText, label: "Driving Licence",          file: app.licence_filename },
                  { icon: Camera,   label: "Profile Photo",            file: app.profile_photo },
                  { icon: Shield,   label: "Police Verification Cert", file: app.police_cert_filename },
                ].map(({ icon: Icon, label, file }) => (
                  <div key={label}
                       className={cn("flex items-center gap-3 rounded-xl px-3.5 py-3 border",
                         file ? "bg-emerald-500/8 border-emerald-500/20" : "bg-white/[0.03] border-white/8")}>
                    <Icon className={cn("w-4 h-4 flex-shrink-0", file ? "text-emerald-400" : "text-white/20")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs font-medium", file ? "text-white" : "text-white/30")}>{label}</p>
                      {file && <p className="text-white/40 text-[11px] truncate">{file}</p>}
                    </div>
                    <span className={cn("text-[10px] font-bold flex-shrink-0",
                      file ? "text-emerald-400" : "text-white/20")}>
                      {file ? "✓ Uploaded" : "Missing"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Timeline</p>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Application created", time: app.created_at },
                  { label: "OTP verified",        time: app.otp_verified_at },
                  { label: "Documents submitted", time: app.submitted_at },
                  { label: "Reviewed",            time: app.reviewed_at },
                ].filter(t => t.time).map(({ label, time }) => (
                  <div key={label} className="flex items-center justify-between text-white/50">
                    <span>{label}</span>
                    <span className="text-white/30">{new Date(time).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {app.rejection_reason && (
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-3.5">
                <p className="text-red-400 text-xs font-semibold mb-1">Rejection Reason</p>
                <p className="text-red-300/70 text-sm">{app.rejection_reason}</p>
              </div>
            )}

            {/* Action buttons */}
            {!["approved", "rejected"].includes(app.status) && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowReject(true)}
                  className="flex-1 h-11 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold
                             border border-red-400/20 hover:bg-red-500/20 transition-all
                             flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => setShowApprove(true)}
                  className="flex-1 h-11 rounded-xl bg-green-600 text-white text-sm font-bold
                             hover:bg-green-500 transition-all
                             flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApprove && (
        <ApproveModal app={app} onClose={() => setShowApprove(false)}
          onDone={(s: string) => { setShowApprove(false); onAction(s); }} />
      )}
      {showReject && (
        <RejectModal app={app} onClose={() => setShowReject(false)}
          onDone={(s: string) => { setShowReject(false); onAction(s); }} />
      )}
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CRMDriverApplications() {
  const [apps,     setApps]     = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("");
  const [selected, setSelected] = useState<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await crmReq("GET", `/driver-applications?status=${filter}&search=${search}`);
      setApps(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const counts = {
    all:                apps.length,
    pending:            apps.filter(a => a.status === "pending").length,
    documents_uploaded: apps.filter(a => a.status === "documents_uploaded").length,
    approved:           apps.filter(a => a.status === "approved").length,
    rejected:           apps.filter(a => a.status === "rejected").length,
  };

  const actionRequired = counts.pending + counts.documents_uploaded;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Driver Applications</h1>
          <p className="text-white/40 text-sm">Review and approve incoming driver registrations</p>
        </div>
        {actionRequired > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-400/20">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-yellow-400 text-xs font-bold">{actionRequired} pending review</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "",                   label: `All (${counts.all})` },
          { key: "pending",            label: `Pending (${counts.pending})` },
          { key: "documents_uploaded", label: `Docs Ready (${counts.documents_uploaded})` },
          { key: "approved",           label: `Approved (${counts.approved})` },
          { key: "rejected",           label: `Rejected (${counts.rejected})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn("px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              filter === key ? "bg-accent text-white" : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
            )}>
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name or phone…"
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                     text-white text-sm placeholder:text-white/30
                     focus:outline-none focus:ring-1 focus:ring-accent" />
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
                  {["App ID","Name","Mobile","Location","Documents","Submitted","Status","Review"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/30 text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.app_id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">
                      {app.app_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center
                                        text-accent text-xs font-bold flex-shrink-0">
                          {app.full_name?.charAt(0)}
                        </div>
                        <span className="text-white font-medium text-xs">{app.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">{app.phone}</td>
                    <td className="px-4 py-3 text-white/60 text-xs max-w-[120px] truncate">{app.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1" title="Licence / Profile / Police Cert">
                        {[app.licence_filename, app.profile_photo, app.police_cert_filename].map((f, i) => (
                          <div key={i}
                               className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold",
                                 f ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/20")}>
                            {f ? "✓" : "·"}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString("en-IN")
                        : <span className="text-white/20">Incomplete</span>}
                    </td>
                    <td className="px-4 py-3"><Badge status={app.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(app)}
                        className="p-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all"
                        title="Review application">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {!apps.length && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-white/30 text-sm">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <DetailDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onAction={() => { setSelected(null); load(); }}
        />
      )}
    </div>
  );
}
