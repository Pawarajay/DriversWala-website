
// src/services/crmService.ts
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("crm_token") || "";
}

function headers() {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${getToken()}`,
  };
}

async function req(method: string, path: string, body?: any) {
  const res  = await fetch(`${BASE}/crm${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const login          = (email: string, password: string) =>
  req("POST", "/auth/login", { email, password });
export const getMe          = () => req("GET", "/auth/me");
export const changePassword = (old_password: string, new_password: string) =>
  req("POST", "/auth/change-password", { old_password, new_password });

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => req("GET", "/dashboard");

// ── Bookings ──────────────────────────────────────────────────────────────────
export const getBookings = (params: Record<string, any> = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  ).toString();
  return req("GET", `/bookings${qs ? "?" + qs : ""}`);
};
export const getBooking         = (id: string) => req("GET", `/bookings/${id}`);
export const assignDriver       = (id: string, driver_id: string) =>
  req("PATCH", `/bookings/${id}/assign`, { driver_id });
export const sendPaymentLink    = (id: string, amount: number, payment_link: string) =>
  req("POST", `/bookings/${id}/send-payment-link`, { amount, payment_link });
export const markPaid           = (id: string) => req("PATCH", `/bookings/${id}/mark-paid`);
export const updateBookingStatus = (id: string, status: string, reason?: string) =>
  req("PATCH", `/bookings/${id}/status`, { status, reason });
export const deleteBooking      = (id: string) => req("DELETE", `/bookings/${id}`);

// Trip lifecycle status (trip_started / trip_ongoing / trip_completed)
export const updateTripStatus = (
  id: string,
  trip_status: "trip_started" | "trip_ongoing" | "trip_completed",
  fare?: number
) => req("PATCH", `/bookings/${id}/trip-status`, { trip_status, ...(fare ? { fare } : {}) });

// Customer feedback rating (1-5) + optional comment
export const submitFeedback = (id: string, rating: number, comment?: string) =>
  req("POST", `/bookings/${id}/feedback`, { rating, comment: comment || "" });

// ── Drivers ───────────────────────────────────────────────────────────────────
export const getDrivers   = (params: Record<string, any> = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  ).toString();
  return req("GET", `/drivers${qs ? "?" + qs : ""}`);
};
export const getDriver    = (id: string)  => req("GET",    `/drivers/${id}`);
export const createDriver = (data: any)   => req("POST",   "/drivers", data);
export const updateDriver = (id: string, data: any) => req("PATCH", `/drivers/${id}`, data);
export const deleteDriver = (id: string)  => req("DELETE", `/drivers/${id}`);

// ── Driver Applications ───────────────────────────────────────────────────────
export const getDriverApplications = (params: Record<string, any> = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  ).toString();
  return req("GET", `/driver-applications${qs ? "?" + qs : ""}`);
};
export const getDriverApplication = (app_id: string) =>
  req("GET",   `/driver-applications/${app_id}`);
export const approveApplication   = (app_id: string, area: string) =>
  req("PATCH", `/driver-applications/${app_id}/approve`, { area });
export const rejectApplication    = (app_id: string, reason: string) =>
  req("PATCH", `/driver-applications/${app_id}/reject`, { reason });