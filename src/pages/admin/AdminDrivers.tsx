// src/pages/crm/CRMDrivers.tsx
import { useEffect, useState, useCallback } from "react";
import { getDrivers, createDriver, updateDriver, deleteDriver } from "@/services/adminService";
import {
  Plus, Search, Pencil, Trash2, Loader2, X,
  Phone, MapPin, Car, Star, CheckCircle2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_FORM = { name: "", phone: "", area: "", vehicle_no: "", licence_no: "", notes: "" };

function DriverModal({ driver, onClose, onSave }: any) {
  const isEdit = !!driver?.driver_id;
  const [form,    setForm]    = useState(isEdit ? { ...driver } : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const setF = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setError("");
    if (!form.name || !form.phone || !form.area || !form.vehicle_no) {
      setError("Name, phone, area and vehicle number are required.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) await updateDriver(driver.driver_id, form);
      else        await createDriver(form);
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1b2e] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <p className="text-white font-bold">{isEdit ? "Edit Driver" : "Add New Driver"}</p>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          {[
            { key: "name",       ph: "Full Name *",       icon: "👤" },
            { key: "phone",      ph: "WhatsApp Number *", icon: "📱" },
            { key: "area",       ph: "Base Area / Zone *",icon: "📍" },
            { key: "vehicle_no", ph: "Vehicle Number *",  icon: "🚗" },
            { key: "licence_no", ph: "Licence No.",       icon: "📋" },
          ].map(({ key, ph }) => (
            <input key={key}
              value={form[key] || ""}
              onChange={(e) => setF(key, e.target.value)}
              placeholder={ph}
              className="w-full h-11 rounded-xl bg-white/10 border border-white/10 text-white
                         text-sm px-3 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent"
            />
          ))}
          <textarea
            value={form.notes || ""}
            onChange={(e) => setF("notes", e.target.value)}
            placeholder="Notes (optional)"
            rows={3}
            className="w-full rounded-xl bg-white/10 border border-white/10 text-white
                       text-sm px-3 py-2.5 placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />

          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setF("active", form.active ? "0" : "1")}
                className={cn("w-10 h-6 rounded-full transition-all relative",
                  form.active ? "bg-accent" : "bg-white/20")}
              >
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                  form.active ? "left-5" : "left-1")} />
              </div>
              <span className="text-white/70 text-sm">Active</span>
            </label>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2">
              ⚠️ {error}
            </p>
          )}

          <button onClick={handleSave} disabled={loading}
            className="w-full h-11 rounded-xl bg-accent text-white font-bold text-sm
                       hover:bg-accent/90 transition-all disabled:opacity-50
                       flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEdit ? "Save Changes" : "Add Driver"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CRMDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState<any>(null); // null | {} (new) | driver obj (edit)

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDrivers({ search });
      setDrivers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (driver: any) => {
    try {
      await updateDriver(driver.driver_id, { active: driver.active ? 0 : 1 });
      load();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Drivers</h1>
          <p className="text-white/40 text-sm">{drivers.length} drivers in fleet</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white
                     text-sm font-bold hover:bg-accent/90 transition-all shadow-lg">
          <Plus className="w-4 h-4" /> Add Driver
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search drivers…"
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.04] border border-white/[0.08]
                     text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Driver cards grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div key={d.driver_id}
                 className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center
                                  text-accent font-bold text-sm flex-shrink-0">
                    {d.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{d.name}</p>
                    <p className="text-white/30 text-[11px]">{d.driver_id}</p>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold",
                  d.active ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400")}>
                  {d.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {d.active ? "Active" : "Inactive"}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {d.phone}
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  {d.area}
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Car className="w-3.5 h-3.5 flex-shrink-0" />
                  {d.vehicle_no}
                  {d.licence_no && <span className="text-white/30">· {d.licence_no}</span>}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { label: "Trips",     value: d.total_trips  || 0 },
                  { label: "Bookings",  value: d.booking_count || 0 },
                  { label: "Rating",    value: `${d.rating || 5.0}★` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/5 rounded-xl px-2 py-1.5 text-center">
                    <p className="text-white font-bold text-sm">{value}</p>
                    <p className="text-white/30 text-[10px]">{label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => setModal(d)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl
                             bg-white/5 text-white/60 hover:text-white hover:bg-white/10
                             transition-all text-xs font-medium">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleToggle(d)}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl",
                    "transition-all text-xs font-medium",
                    d.active
                      ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  )}>
                  {d.active ? <><XCircle className="w-3.5 h-3.5" /> Deactivate</>
                            : <><CheckCircle2 className="w-3.5 h-3.5" /> Activate</>}
                </button>
              </div>
            </div>
          ))}

          {!drivers.length && (
            <div className="col-span-3 text-center py-12 text-white/30 text-sm">
              No drivers found. Add your first driver.
            </div>
          )}
        </div>
      )}

      {modal !== null && (
        <DriverModal
          driver={modal?.driver_id ? modal : null}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
