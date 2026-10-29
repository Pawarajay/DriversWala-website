// src/pages/admin/AdminLogin.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Car, Lock, Mail, Loader2, Eye, EyeOff, Phone, KeyRound, CheckCircle2 } from "lucide-react";
import { sendForgotPasswordOTP, resetForgotPassword } from "@/services/adminService";

export default function AdminLogin() {
  const { signIn }     = useAuth();
  const navigate       = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Forgot password flow state
  const [isForgot,      setIsForgot]      = useState(false);
  const [forgotPhone,   setForgotPhone]   = useState("");
  const [forgotOtp,     setForgotOtp]     = useState("");
  const [newPassword,   setNewPassword]   = useState("");
  const [otpSent,       setOtpSent]       = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendForgotPasswordOTP(forgotPhone);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send WhatsApp OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await resetForgotPassword(forgotPhone, forgotOtp, newPassword);
      setForgotSuccess("Password reset successfully! You can now sign in.");
      setTimeout(() => {
        setIsForgot(false);
        setOtpSent(false);
        setForgotSuccess("");
        setPassword("");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4">

      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px]
                      bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
            <Car className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">DriverWala Admin</h1>
          <p className="text-white/40 text-sm mt-1">
            {isForgot ? "Reset password via WhatsApp OTP" : "Sign in to access the admin panel"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] backdrop-blur-xl border border-white/10
                        rounded-3xl p-8 shadow-2xl">

          {!isForgot ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>
                <label className="text-white/40 text-xs font-semibold uppercase tracking-widest block mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@driverwala.com"
                    required
                    className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/10
                               text-white placeholder:text-white/20 text-sm
                               focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/60"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/40 text-xs font-semibold uppercase tracking-widest block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setIsForgot(true); setError(""); }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-12 pl-10 pr-10 rounded-xl bg-white/10 border border-white/10
                               text-white placeholder:text-white/20 text-sm
                               focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10
                                border border-red-400/20 rounded-xl px-3 py-2.5">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm
                           hover:bg-blue-500 transition-all disabled:opacity-60
                           flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : "Sign In"
                }
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {forgotSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  {forgotSuccess}
                </div>
              ) : !otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-widest block mb-1.5">
                      WhatsApp Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="tel"
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/10
                                   text-white placeholder:text-white/20 text-sm
                                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/60"
                      />
                    </div>
                    <p className="text-white/30 text-xs mt-1.5">
                      We will send a 6-digit WhatsApp OTP using <span className="text-blue-400 font-mono">pune_driver_otp</span> template.
                    </p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2.5">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm
                               hover:bg-blue-500 transition-all disabled:opacity-60
                               flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                      : "Send WhatsApp OTP"
                    }
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-widest block mb-1.5">
                      6-Digit OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="123456"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/10
                                   text-white placeholder:text-white/20 text-sm tracking-widest font-mono
                                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-widest block mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        required
                        minLength={6}
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/10
                                   text-white placeholder:text-white/20 text-sm
                                   focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500/60"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-400/20 rounded-xl px-3 py-2.5">
                      ⚠️ {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold text-sm
                               hover:bg-emerald-500 transition-all disabled:opacity-60
                               flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                      : "Reset Password"
                    }
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setIsForgot(false); setOtpSent(false); setError(""); }}
                className="w-full text-center text-xs text-white/40 hover:text-white transition-colors pt-2"
              >
                ← Back to Login
              </button>
            </div>
          )}

          <p className="text-center text-white/20 text-xs mt-6">
            Default: admin@driverwala.com / Admin@123
          </p>
        </div>

        {/* Back to website */}
        <p className="text-center mt-6">
          <a href="/" className="text-white/30 hover:text-white text-sm transition-colors">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}

