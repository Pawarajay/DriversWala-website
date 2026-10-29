
import { useState, useRef, useEffect } from "react";
import { Car, Phone, User, MapPin, CreditCard, Upload, Shield,
         CheckCircle2, ArrowRight, Loader2, Eye, EyeOff,
         ChevronRight, ExternalLink, Camera, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Police verification link — update to actual portal URL
const POLICE_VERIFICATION_URL = "https://pasportpolice.gov.in/police-clearance";

async function apiPost(path: string, body: any) {
  const res  = await fetch(`${API}/driver${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepDot({ n, current, label }: { n: number; current: number; label: string }) {
  const done   = current > n;
  const active = current === n;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
        done   ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"  :
        active ? "bg-[#c8a35a] text-[#0a0a0a] shadow-lg shadow-[#c8a35a]/30" :
                 "bg-white/10 text-white/30"
      )}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : n}
      </div>
      <span className={cn("text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap hidden sm:block",
        active ? "text-[#c8a35a]" : done ? "text-emerald-400" : "text-white/25"
      )}>{label}</span>
    </div>
  );
}

// ── File upload box ────────────────────────────────────────────────────────────
function FileUploadBox({
  label, sublabel, icon: Icon, value, onChange, accept = "image/*"
}: {
  label: string; sublabel: string; icon: any;
  value: string; onChange: (name: string) => void; accept?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onChange(f.name);
  };

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className={cn(
        "w-full rounded-2xl border-2 border-dashed p-5 transition-all duration-300 text-left group",
        value
          ? "border-emerald-500/50 bg-emerald-500/5"
          : "border-white/10 bg-white/[0.03] hover:border-[#c8a35a]/40 hover:bg-[#c8a35a]/5"
      )}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile} />
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
          value ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30 group-hover:bg-[#c8a35a]/10 group-hover:text-[#c8a35a]"
        )}>
          {value ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", value ? "text-emerald-400" : "text-white/70")}>{label}</p>
          <p className="text-white/30 text-xs mt-0.5 truncate">
            {value ? `✓ ${value}` : sublabel}
          </p>
        </div>
        {value && (
          <button type="button" onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/20 flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DriverRegister() {
  const [step,    setStep]    = useState(1);   // 1=phone, 2=otp, 3=details, 4=police, 5=done
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  // Step 1 — phone
  const [phone, setPhone]   = useState("");

  // Step 2 — otp
  const [otp,            setOtp]            = useState(["","","","","",""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtp,         setDevOtp]         = useState("");
  const otpRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 3 — details
  const [form, setForm] = useState({
    full_name:        "",
    location:         "",
    aadhar_number:    "",
    licence_filename: "",
    profile_photo:    "",
  });

  // Step 4 — police cert
  const [appId,         setAppId]         = useState("");
  const [policeCertFile,setPoliceCertFile] = useState("");
  const [policeOpened,  setPoliceOpened]   = useState(false);

  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const act = async (fn: () => Promise<any>) => {
    setError(""); setLoading(true);
    try { return await fn(); }
    catch (e: any) { setError(e.message); return null; }
    finally { setLoading(false); }
  };

  // ── Step 1: send OTP ─────────────────────────────────────────────────────────
  const handleSendOTP = () => act(async () => {
    if (phone.replace(/\D/g,"").length < 10) throw new Error("Enter a valid 10-digit mobile number.");
    const data = await apiPost("/send-otp", { phone });
    if (data?.dev_otp) {
      setDevOtp(data.dev_otp);
    }
    setResendCooldown(30);
    setStep(2);
  });

  const handleResendOTP = () => act(async () => {
    if (phone.replace(/\D/g,"").length < 10) throw new Error("Enter a valid 10-digit mobile number.");
    const data = await apiPost("/send-otp", { phone });
    if (data?.dev_otp) {
      setDevOtp(data.dev_otp);
    }
    setResendCooldown(30);
  });

  // ── Step 2: verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOTP = () => act(async () => {
    const code = otp.join("");
    if (code.length < 6) throw new Error("Enter the complete 6-digit OTP.");
    const data = await apiPost("/verify-otp", { phone, otp: code });
    if (data.existing) {
      // Already applied — show status directly
      setAppId(data.existing.app_id);
      setStep(5);
    } else {
      setStep(3);
    }
  });

  // OTP input handler
  const handleOtpKey = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs[i + 1].current?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs[5].current?.focus();
    }
  };

  // ── Step 3: submit registration ───────────────────────────────────────────────
  const handleRegister = () => act(async () => {
    if (!form.full_name.trim())     throw new Error("Full name is required.");
    if (!form.location.trim())      throw new Error("Location / area is required.");
    if (!/^\d{12}$/.test(form.aadhar_number.replace(/\s/g,"")))
      throw new Error("Aadhar number must be exactly 12 digits.");
    if (!form.licence_filename)     throw new Error("Please upload your licence photo.");
    if (!form.profile_photo)        throw new Error("Please upload your profile photo.");

    const data = await apiPost("/register", { phone, ...form });
    setAppId(data.app_id);
    setStep(4);
  });

  // ── Step 4: upload police cert ────────────────────────────────────────────────
  const handleSubmitPolice = () => act(async () => {
    if (!policeOpened) throw new Error("Please complete police verification first.");
    if (!policeCertFile) throw new Error("Please upload your police verification certificate.");
    await apiPost("/upload-police-cert", { phone, app_id: appId, police_cert_filename: policeCertFile });
    setStep(5);
  });

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080808] text-white font-['DM_Sans',sans-serif] overflow-x-hidden">

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-[#c8a35a]/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        bg-emerald-500/5 rounded-full blur-[120px]" />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <a href="/" className="flex items-center group">
          <img src={logoImg} alt="DriversWala" className="h-9 w-auto object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.35)]" />
        </a>
        <a href="/" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1">
          ← Back to website
        </a>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-lg mx-auto px-5 pb-20">

        {/* Page title */}
        <div className="text-center mt-8 mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                          bg-[#c8a35a]/10 border border-[#c8a35a]/20 mb-4">
            <Shield className="w-3.5 h-3.5 text-[#c8a35a]" />
            <span className="text-[#c8a35a] text-xs font-semibold uppercase tracking-widest">Driver Registration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3"
              style={{ fontFamily: "'Playfair Display', serif" }}>
            Join Our Fleet
          </h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Register as a professional driver with DriverWala.<br />
            Earn on your schedule across Pune & Mumbai.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {[
            [1, "Mobile"],
            [2, "OTP"],
            [3, "Details"],
            [4, "Police"],
            [5, "Done"],
          ].map(([n, label], i, arr) => (
            <div key={n} className="flex items-center gap-3">
              <StepDot n={Number(n)} current={step} label={String(label)} />
              {i < arr.length - 1 && (
                <div className={cn("w-8 h-px transition-all duration-500",
                  step > Number(n) ? "bg-emerald-500/50" : "bg-white/10")} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 sm:p-8
                        backdrop-blur-xl shadow-2xl">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-400/20
                            rounded-2xl px-4 py-3 mb-5 text-sm text-red-400">
              <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* ── STEP 1: Enter phone ───────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Enter Your Mobile Number</h2>
                <p className="text-white/40 text-sm">We'll send an OTP to your WhatsApp number to verify your identity.</p>
              </div>

              <div className="space-y-2">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                  WhatsApp Mobile Number
                </label>
                <div className="flex">
                  <div className="flex items-center gap-2 px-4 rounded-l-2xl bg-white/5 border border-r-0
                                  border-white/10 text-white/50 text-sm font-medium whitespace-nowrap">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel" maxLength={10}
                    value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,""))}
                    onKeyDown={e => e.key === "Enter" && handleSendOTP()}
                    placeholder="9876543210"
                    className="flex-1 h-12 px-4 rounded-r-2xl bg-white/5 border border-white/10
                               text-white placeholder:text-white/20 text-lg font-mono tracking-widest
                               focus:outline-none focus:ring-1 focus:ring-[#c8a35a]/60 focus:border-[#c8a35a]/40"
                  />
                </div>
                <p className="text-white/25 text-xs">Make sure this number is active on WhatsApp</p>
              </div>

              <button onClick={handleSendOTP} disabled={loading || phone.length < 10}
                className="w-full h-12 rounded-2xl bg-[#c8a35a] text-[#0a0a0a] font-bold
                           hover:bg-[#d4b06a] transition-all disabled:opacity-40
                           flex items-center justify-center gap-2 shadow-lg shadow-[#c8a35a]/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? "Sending OTP…" : "Send OTP on WhatsApp"}
              </button>
            </div>
          )}

          {/* ── STEP 2: OTP ──────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Enter OTP</h2>
                <p className="text-white/40 text-sm">
                  A 6-digit OTP was sent to <span className="text-white font-semibold">+91 {phone}</span> on WhatsApp.
                </p>
              </div>

              {/* 6-box OTP input */}
              {devOtp && (
                <div className="flex items-center justify-between bg-[#c8a35a]/10 border border-[#c8a35a]/30 rounded-xl px-3.5 py-2 text-xs text-[#c8a35a]">
                  <span>Dev OTP: <strong className="font-mono text-sm tracking-widest">{devOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp(devOtp.split(""));
                      otpRefs[5].current?.focus();
                    }}
                    className="underline hover:text-white font-medium"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text" inputMode="numeric" maxLength={1}
                    value={digit}
                    onChange={e => handleOtpKey(i, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !digit && i > 0) otpRefs[i-1].current?.focus();
                    }}
                    className="w-12 h-14 rounded-2xl bg-white/5 border border-white/10 text-white
                               text-2xl font-bold text-center focus:outline-none
                               focus:ring-2 focus:ring-[#c8a35a]/60 focus:border-[#c8a35a]/40
                               transition-all"
                  />
                ))}
              </div>

              <button onClick={handleVerifyOTP} disabled={loading || otp.join("").length < 6}
                className="w-full h-12 rounded-2xl bg-[#c8a35a] text-[#0a0a0a] font-bold
                           hover:bg-[#d4b06a] transition-all disabled:opacity-40
                           flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {loading ? "Verifying…" : "Verify OTP"}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || resendCooldown > 0}
                  className="text-[#c8a35a] hover:underline disabled:text-white/30 disabled:no-underline transition-colors font-medium"
                >
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                </button>
                <button onClick={() => { setStep(1); setOtp(["","","","","",""]); setError(""); setDevOtp(""); }}
                  className="text-white/40 hover:text-white transition-colors">
                  ← Change number
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Registration details ─────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Personal Details</h2>
                <p className="text-white/40 text-sm">Fill in your information. All fields are required.</p>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input value={form.full_name} onChange={e => setF("full_name", e.target.value)}
                    placeholder="As on Aadhar card"
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/10
                               text-white placeholder:text-white/20 text-sm
                               focus:outline-none focus:ring-1 focus:ring-[#c8a35a]/60 focus:border-[#c8a35a]/40" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">Base Location / Area</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input value={form.location} onChange={e => setF("location", e.target.value)}
                    placeholder="e.g. Wakad, Pune"
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/10
                               text-white placeholder:text-white/20 text-sm
                               focus:outline-none focus:ring-1 focus:ring-[#c8a35a]/60 focus:border-[#c8a35a]/40" />
                </div>
              </div>

              {/* Aadhar */}
              <div className="space-y-1.5">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-widest">Aadhar Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={form.aadhar_number}
                    onChange={e => setF("aadhar_number", e.target.value.replace(/\D/g,"").slice(0,12))}
                    placeholder="12-digit Aadhar number"
                    maxLength={12}
                    className="w-full h-12 pl-10 pr-4 rounded-2xl bg-white/5 border border-white/10
                               text-white placeholder:text-white/20 text-sm font-mono tracking-wider
                               focus:outline-none focus:ring-1 focus:ring-[#c8a35a]/60 focus:border-[#c8a35a]/40" />
                </div>
                <p className="text-white/20 text-xs px-1">Your Aadhar is encrypted and used only for verification</p>
              </div>

              {/* File uploads */}
              <div className="space-y-3">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-widest block">Documents</label>
                <FileUploadBox
                  label="Driving Licence"
                  sublabel="Upload photo of your licence (front side)"
                  icon={FileText}
                  value={form.licence_filename}
                  onChange={v => setF("licence_filename", v)}
                />
                <FileUploadBox
                  label="Profile Photo"
                  sublabel="Clear face photo (passport size preferred)"
                  icon={Camera}
                  value={form.profile_photo}
                  onChange={v => setF("profile_photo", v)}
                />
              </div>

              <button onClick={handleRegister} disabled={loading}
                className="w-full h-12 rounded-2xl bg-[#c8a35a] text-[#0a0a0a] font-bold
                           hover:bg-[#d4b06a] transition-all disabled:opacity-40
                           flex items-center justify-center gap-2 shadow-lg shadow-[#c8a35a]/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? "Submitting…" : "Continue to Police Verification"}
              </button>
            </div>
          )}

          {/* ── STEP 4: Police verification ───────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Police Verification</h2>
                <p className="text-white/40 text-sm">
                  As per government regulation, driver registration requires a police clearance certificate.
                </p>
              </div>

              {/* Police verification link */}
              <div className="bg-[#c8a35a]/8 border border-[#c8a35a]/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#c8a35a]/15 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#c8a35a]" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Step 1 — Get Police Clearance</p>
                    <p className="text-white/40 text-xs mt-0.5">
                      Click the button below to visit the official portal and complete your police verification.
                    </p>
                  </div>
                </div>
                <a
                  href={POLICE_VERIFICATION_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setPoliceOpened(true)}
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl
                             bg-[#c8a35a] text-[#0a0a0a] font-bold text-sm
                             hover:bg-[#d4b06a] transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Police Verification Portal
                </a>
                {policeOpened && (
                  <p className="text-emerald-400 text-xs text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Portal opened — complete verification and come back
                  </p>
                )}
              </div>

              {/* Upload certificate */}
              <div className="space-y-2">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                  Step 2 — Upload Certificate
                </p>
                <FileUploadBox
                  label="Police Verification Certificate"
                  sublabel="Upload the downloaded certificate (PDF or image)"
                  icon={Shield}
                  value={policeCertFile}
                  onChange={setPoliceCertFile}
                  accept="image/*,.pdf"
                />
              </div>

              <button onClick={handleSubmitPolice} disabled={loading || !policeCertFile}
                className="w-full h-12 rounded-2xl bg-[#c8a35a] text-[#0a0a0a] font-bold
                           hover:bg-[#d4b06a] transition-all disabled:opacity-40
                           flex items-center justify-center gap-2 shadow-lg shadow-[#c8a35a]/20">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {loading ? "Submitting…" : "Submit for Review"}
              </button>

              <p className="text-white/20 text-xs text-center">
                By submitting, you agree to DriverWala's driver terms and conditions.
              </p>
            </div>
          )}

          {/* ── STEP 5: Done ─────────────────────────────────────────────── */}
          {step === 5 && (
            <div className="text-center space-y-5 py-4">
              {/* Animated checkmark */}
              <div className="flex justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-[#c8a35a]/15 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[#c8a35a]/20 border-2
                                  border-[#c8a35a]/40 flex items-center justify-center">
                    <CheckCircle2 className="w-9 h-9 text-[#c8a35a]" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                  Application Submitted!
                </h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Thank you for applying to drive with DriverWala.
                </p>
              </div>

              {/* Status card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                <div className="flex items-center gap-2 text-[#c8a35a] text-sm font-semibold">
                  <Shield className="w-4 h-4" /> Application Status
                </div>
                <div className="space-y-2">
                  {[
                    { icon: "📋", label: "Application ID", value: appId.slice(0,8).toUpperCase() },
                    { icon: "📱", label: "Mobile",         value: "+91 " + phone.replace(/^91/,"") },
                    { icon: "⏳", label: "Status",         value: "Under Review" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-white/40 text-xs flex items-center gap-1.5">
                        <span>{icon}</span> {label}
                      </span>
                      <span className="text-white text-xs font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What's next */}
              <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 text-left">
                <p className="text-emerald-400 text-sm font-semibold mb-2">📲 What happens next?</p>
                <ul className="space-y-1.5 text-white/50 text-xs">
                  <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-400" /> Our team will review your documents within 24–48 hours</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-400" /> You will receive a WhatsApp message once approved</li>
                  <li className="flex items-start gap-2"><ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-emerald-400" /> After approval, trip requests will arrive on this WhatsApp number</li>
                </ul>
              </div>

              <a href="/"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
                ← Return to homepage
              </a>
            </div>
          )}

        </div>
      </main>

      {/* Font imports */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
    </div>
  );
}
