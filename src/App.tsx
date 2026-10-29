// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// // ── Existing website pages ────────────────────────────────────────────────────
// import Index               from "./pages/Index";
// import NotFound            from "./pages/NotFound";
// import HourlyDriver        from "./pages/HourlyDriver";
// import DailyMonthlyDriver  from "./pages/DailyMonthlyDriver";
// import OutstationDriver    from "./pages/OutstationDriver";
// import ValetEventServices  from "./pages/ValetEventServices";
// import DrivingLessons      from "./pages/DrivingLessons";
// import BookingsDashboard   from "./pages/BookingsDashboard";
// import DriverRegister      from "./pages/DriverRegister";          // NEW

// // ── CRM ───────────────────────────────────────────────────────────────────────
// import { AuthProvider }          from "@/context/AuthContext";
// import CRMProtectedRoute         from "@/components/crm/CRMProtectedRoute";
// import CRMLayout                 from "@/components/crm/CRMLayout";
// import CRMLogin                  from "@/pages/crm/CRMLogin";
// import CRMDashboard              from "@/pages/crm/CRMDashboard";
// import CRMBookings               from "@/pages/crm/CRMBookings";
// import CRMDrivers                from "@/pages/crm/CRMDrivers";
// import CRMPayments               from "@/pages/crm/CRMPayments";
// import CRMDriverApplications     from "@/pages/crm/CRMDriverApplications";  // NEW

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <AuthProvider>
//         <BrowserRouter>
//           <Routes>

//             {/* ── Public website routes ────────────────────────────────── */}
//             <Route path="/"                     element={<Index />} />
//             <Route path="/bookings"             element={<BookingsDashboard />} />
//             <Route path="/hourly-driver"        element={<HourlyDriver />} />
//             <Route path="/daily-monthly-driver" element={<DailyMonthlyDriver />} />
//             <Route path="/outstation-driver"    element={<OutstationDriver />} />
//             <Route path="/valet-event-services" element={<ValetEventServices />} />
//             <Route path="/driving-lessons"      element={<DrivingLessons />} />

//             {/* ── Driver self-registration (public) ────────────────────── */}
//             <Route path="/driver-register"      element={<DriverRegister />} />

//             {/* ── CRM Login (public) ───────────────────────────────────── */}
//             <Route path="/crm/login"            element={<CRMLogin />} />

//             {/* ── CRM Protected Routes ─────────────────────────────────── */}
//             <Route path="/crm" element={
//               <CRMProtectedRoute>
//                 <CRMLayout />
//               </CRMProtectedRoute>
//             }>
//               <Route index                      element={<Navigate to="/crm/dashboard" replace />} />
//               <Route path="dashboard"           element={<CRMDashboard />} />
//               <Route path="bookings"            element={<CRMBookings />} />
//               <Route path="drivers"             element={<CRMDrivers />} />
//               <Route path="driver-applications" element={<CRMDriverApplications />} />
//               <Route path="payments"            element={<CRMPayments />} />
//             </Route>

//             {/* ── 404 ──────────────────────────────────────────────────── */}
//             <Route path="*" element={<NotFound />} />

//           </Routes>
//         </BrowserRouter>
//       </AuthProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;

//testing

// // // src/App.tsx — final with /admin/users route added
import { Toaster }           from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider }   from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Public website pages ──────────────────────────────────────────────────────
import Index              from "./pages/Index";
import NotFound           from "./pages/NotFound";
import HourlyDriver       from "./pages/HourlyDriver";
import DailyMonthlyDriver from "./pages/DailyMonthlyDriver";
import OutstationDriver   from "./pages/OutstationDriver";
import ValetEventServices from "./pages/ValetEventServices";
import DrivingLessons     from "./pages/DrivingLessons";
import BookingsDashboard  from "./pages/BookingsDashboard";
import DriverRegister     from "./pages/DriverRegister";

// ── Admin panel ───────────────────────────────────────────────────────────────
import { AuthProvider }        from "@/context/AuthContext";
import AdminProtectedRoute     from "@/components/admin/AdminProtectedRoute";
import AdminLayout             from "@/components/admin/AdminLayout";
import AdminLogin              from "@/pages/admin/AdminLogin";
import AdminDashboard          from "@/pages/admin/AdminDashboard";
import AdminBookings           from "@/pages/admin/AdminBookings";
import AdminDrivers            from "@/pages/admin/AdminDrivers";
import AdminDriverApplications from "@/pages/admin/AdminDriverApplications";
import AdminPayments           from "@/pages/admin/AdminPayments";
import AdminUsers              from "@/pages/admin/AdminUsers";   // NEW

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── Public website ────────────────────────────────────────────── */}
            <Route path="/"                     element={<Index />} />
            <Route path="/bookings"             element={<BookingsDashboard />} />
            <Route path="/hourly-driver"        element={<HourlyDriver />} />
            <Route path="/daily-monthly-driver" element={<DailyMonthlyDriver />} />
            <Route path="/outstation-driver"    element={<OutstationDriver />} />
            <Route path="/valet-event-services" element={<ValetEventServices />} />
            <Route path="/driving-lessons"      element={<DrivingLessons />} />

            {/* ── Driver self-registration ──────────────────────────────────── */}
            <Route path="/driver-register"      element={<DriverRegister />} />

            {/* ── Admin login (public) ──────────────────────────────────────── */}
            <Route path="/admin/login"          element={<AdminLogin />} />
            <Route path="/admin"                element={<Navigate to="/admin/dashboard" replace />} />

            {/* ── Admin protected routes ────────────────────────────────────── */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route path="dashboard"           element={<AdminDashboard />} />
              <Route path="bookings"            element={<AdminBookings />} />
              <Route path="drivers"             element={<AdminDrivers />} />
              <Route path="driver-applications" element={<AdminDriverApplications />} />
              <Route path="payments"            element={<AdminPayments />} />
              <Route path="users"               element={<AdminUsers />} />
            </Route>

            {/* ── 404 ──────────────────────────────────────────────────────── */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;




