// src/pages/admin/AdminUsers.tsx
// Manage CRM admin users — superadmin only
import { useEffect, useState } from "react";
import { getUsers, createUser, updateUser, deleteUser } from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";
import {
  Users, Plus, Pencil, Trash2, Loader2, AlertCircle,
  CheckCircle2, XCircle, Eye, EyeOff, ShieldCheck, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminUser {
  id:         number;
  name:       string;
  email:      string;
  role:       "superadmin" | "admin";
  active:     number;
  last_login: string | null;
  created_at: string;
}

// ── Reusable input ────────────────────────────────────────────────────────────
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-10 px-3 rounded-xl bg-white/[0.07] border border-white/10 text-white text-sm",
        "placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/50",
        className
      )}
    />
  );
}

// ── Role badge ────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  return role === "superadmin" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
                     bg-purple-500/15 text-purple-300 border border-purple-500/20">
      <ShieldCheck className="w-3 h-3" /> Superadmin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
                     bg-blue-500/15 text-blue-300 border border-blue-500/20">
      <Shield className="w-3 h-3" /> Admin
    </span>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  mode:    "create" | "edit";
  user?:   AdminUser;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ mode, user, onClose, onSaved }: ModalProps) {
  const [name,     setName]     = useState(user?.name     || "");
  const [email,    setEmail]    = useState(user?.email    || "");
  const [role,     setRole]     = useState<"admin"|"superadmin">(user?.role || "admin");
  const [active,   setActive]   = useState(user?.active !== 0);
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required."); return;
    }
    if (mode === "create" && password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }

    setLoading(true);
    try {
      if (mode === "create") {
        await createUser({ name: name.trim(), email: email.trim(), password, role });
      } else if (user) {
        const payload: any = { name: name.trim(), email: email.trim(), role, active };
        if (password.length >= 6) payload.password = password;
        await updateUser(user.id, payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0e1928] border border-white/10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <h3 className="text-white font-bold text-base">
            {mode === "create" ? "Create Admin User" : "Edit User"}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10
                            border border-red-400/20 rounded-xl px-3 py-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <Field label="Full Name">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />
          </Field>

          <Field label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rahul@driverwala.com"
            />
          </Field>

          <Field label={mode === "create" ? "Password" : "New Password (leave blank to keep current)"}>
            <div className="relative">
              <Input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "create" ? "Minimum 6 characters" : "Leave blank to keep current"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl bg-white/[0.07] border border-white/10
                         text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <p className="text-white/30 text-xs mt-1">
              Superadmin can manage other users. Admin can only manage bookings & drivers.
            </p>
          </Field>

          {mode === "edit" && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setActive(!active)}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  active ? "bg-green-500" : "bg-white/20"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                  active ? "left-5" : "left-0.5"
                )} />
              </div>
              <span className="text-white/60 text-sm">
                {active ? "Active — can log in" : "Deactivated — cannot log in"}
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.07]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5
                       text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 text-white
                       text-sm font-bold hover:bg-blue-500 transition-all disabled:opacity-60"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><CheckCircle2 className="w-4 h-4" /> {mode === "create" ? "Create User" : "Save Changes"}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const { admin: me } = useAuth();
  const [users,   setUsers]   = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [modal,   setModal]   = useState<{ mode: "create"|"edit"; user?: AdminUser } | null>(null);
  const [toast,   setToast]   = useState("");
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);

  const isSuperadmin = me?.role === "superadmin";

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const d = await getUsers();
      setUsers(d.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSaved = () => {
    setModal(null);
    load();
    showToast("User saved successfully.");
  };

  const handleDeactivate = async (user: AdminUser) => {
    try {
      await deleteUser(user.id);
      setConfirmDelete(null);
      load();
      showToast(`${user.name} has been deactivated.`);
    } catch (err: any) {
      showToast("Error: " + err.message);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (!isSuperadmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <ShieldCheck className="w-12 h-12 text-white/20" />
        <p className="text-white/40 text-sm">Superadmin access required to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-600 text-white
                        text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Admin Users</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Manage who can access the admin panel
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white
                     text-sm font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20
                      rounded-xl px-4 py-3 text-blue-300 text-sm">
        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Superadmin only</p>
          <p className="text-blue-300/70 text-xs mt-0.5">
            Only you (superadmin) can see this page and manage users.
            Regular admins can manage bookings, drivers and applications — but cannot access this page.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-400/20
                        rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">

          {/* Table header */}
          <div className="grid grid-cols-[1fr_1.5fr_100px_80px_100px_100px] gap-4
                          px-5 py-3 border-b border-white/[0.07] text-white/30 text-xs
                          font-semibold uppercase tracking-wide">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Last Login</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Users className="w-10 h-10 text-white/10" />
              <p className="text-white/30 text-sm">No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={cn(
                  "grid grid-cols-[1fr_1.5fr_100px_80px_100px_100px] gap-4 px-5 py-3.5",
                  "border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors items-center",
                  !user.active && "opacity-50"
                )}
              >
                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 flex items-center justify-center
                                  text-blue-400 text-xs font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user.name}</p>
                    {user.id === me?.id && (
                      <p className="text-blue-400 text-[10px]">You</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <p className="text-white/60 text-sm truncate">{user.email}</p>

                {/* Role */}
                <RoleBadge role={user.role} />

                {/* Active */}
                {user.active ? (
                  <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-white/30 text-xs font-medium">
                    <XCircle className="w-3.5 h-3.5" /> Inactive
                  </span>
                )}

                {/* Last login */}
                <p className="text-white/40 text-xs">
                  {user.last_login
                    ? new Date(user.last_login).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
                    : <span className="text-white/20">Never</span>
                  }
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => setModal({ mode: "edit", user })}
                    disabled={user.id === me?.id && false}
                    title="Edit user"
                    className="w-7 h-7 rounded-lg flex items-center justify-center
                               text-white/30 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {user.id !== me?.id && user.active ? (
                    <button
                      onClick={() => setConfirmDelete(user)}
                      title="Deactivate user"
                      className="w-7 h-7 rounded-lg flex items-center justify-center
                                 text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="w-7 h-7" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create/Edit modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Deactivate confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-sm bg-[#0e1928] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-white font-bold text-base mb-2">Deactivate User?</h3>
            <p className="text-white/50 text-sm mb-6">
              <span className="text-white font-medium">{confirmDelete.name}</span> will no longer
              be able to log in. You can re-enable them later by editing the account.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 text-sm
                           font-medium hover:bg-white/15 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeactivate(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm
                           font-bold hover:bg-red-500 transition-all"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
