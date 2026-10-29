
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Car, Clock, CheckCircle2,
  ArrowRight, Loader2, ChevronDown, Hash, IndianRupee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import heroImage from "@/assets/hero-driver.jpg";
import { createBooking, getPriceEstimate } from "@/services/bookingService";

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"];

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+",    label: "Verified Drivers"  },
  { value: "50+",     label: "Cities Covered"    },
  { value: "4.8★",   label: "Average Rating"     },
];

const INITIAL_FORM = {
  full_name:      "",
  email:          "",
  phone:          "",
  pickup_city:    "",
  drop_location:  "",
  pickup_date:    format(new Date(), "yyyy-MM-dd"),
  pickup_time:    "",
  return_date:    "",
  return_time:    "",
  service_type:   "",
  vehicle_type:   "",
  vehicle_class:  "normal",
  vehicle_number: "",
  trip_type:      "one_way",
  food_provided:  false,
  special_notes:  "",
  promo_code:     "",
};

// Vehicle list is booking info only (customer's own car, shown to the driver).
// Per the rate sheet, driver services are flat-rate — vehicle type / Luxury does NOT change the price.
const VEHICLE_OPTIONS = [
  { value: "hatchback", label: "Hatchback"  },
  { value: "sedan",     label: "Sedan"      },
  { value: "suv",       label: "SUV / MUV"  },
  { value: "luxury",    label: "Luxury"     },
];

// Booking terms shown under the form (client wording).
const SERVICE_NOTES: Record<string, string> = {
  local: "If the booking duration exceeds 8 hours, extra charges will apply.",
  round_trip_outstation:
    "Pickup and drop-off times are specified during booking. If the actual service duration exceeds the scheduled time, extra charges will apply.",
  outstation:
    "Pickup and drop-off times are specified during booking. If the actual service duration exceeds the scheduled time, extra charges will apply.",
};

// Same destination rule as backend pricingEngine: Google Autocomplete returns
// "Mumbai, Maharashtra, India" → compare on the first comma-separated part only.
const normalizeDestination = (v: string) => (v || "").split(",")[0].trim().toLowerCase();

// Local booking rule (client): pickup & drop in the SAME city — Mumbai or Pune.
// Same logic as backend pricingEngine.checkLocalBooking (backend is the final check).
const LOCAL_CITIES = ["mumbai", "pune"];
const detectLocalCity = (text: string) => {
  const parts = (text || "").split(",").map((x) => x.trim().toLowerCase());
  return LOCAL_CITIES.find((c) => parts.includes(c)) || "";
};
const checkLocalCity = (pickup: string, drop: string): string => {
  if (!pickup.trim()) return "";
  const pc = detectLocalCity(pickup);
  if (!pc) return "Local service is available only within Mumbai or Pune. You may have selected the wrong city or service — please check.";
  if (drop.trim() && detectLocalCity(drop) !== pc)
    return "Local needs pickup and drop in the same city (Mumbai or Pune). You may have selected the wrong city or service — for trips between cities choose Round Trip Outstation or Outstation.";
  return "";
};

// ── TimePicker ────────────────────────────────────────────────────────────────
interface TimePickerProps { value: string; onChange: (val: string) => void; label?: string; }

const TimePicker = ({ value, onChange, label = "Time" }: TimePickerProps) => {
  const parse = (v: string) => {
    if (!v) return { h: "12", m: "00", ap: "AM" as "AM" | "PM" };
    const [hh, mm] = v.split(":");
    const h24 = parseInt(hh, 10);
    const ap: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    let h12 = h24 % 12; if (h12 === 0) h12 = 12;
    return { h: String(h12), m: mm || "00", ap };
  };
  const { h: ih, m: im, ap: ia } = parse(value);
  const [hour, setHour]     = useState(ih);
  const [minute, setMinute] = useState(im);
  const [ampm, setAmpm]     = useState<"AM"|"PM">(ia);
  const [open, setOpen]     = useState(false);

  const emit = (h: string, m: string, ap: "AM"|"PM") => {
    let h24 = parseInt(h, 10);
    if (ap === "AM" && h24 === 12) h24 = 0;
    if (ap === "PM" && h24 !== 12) h24 += 12;
    onChange(`${String(h24).padStart(2,"0")}:${m}`);
  };
  const onH = (v: string) => { setHour(v);   emit(v, minute, ampm); };
  const onM = (v: string) => { setMinute(v); emit(hour, v, ampm); };
  const onA = (v: "AM"|"PM") => { setAmpm(v); emit(hour, minute, v); };
  const display = value
    ? (() => { const { h, m, ap } = parse(value); return `${h.padStart(2,"0")}:${m} ${ap}`; })()
    : "Select time";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button"
          className="flex-1 h-full flex items-center justify-between px-3 sm:px-3.5 bg-transparent text-sm font-medium focus:outline-none min-w-0">
          <span className={cn("truncate", value ? "text-[#1A1A1A]" : "text-[#9A9A9A]")}>{display}</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#B0B0B0] flex-shrink-0 ml-1" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(18rem,calc(100vw-2rem))] p-0 z-[200] border border-[#EBEBEB] shadow-xl rounded-2xl overflow-hidden bg-white"
        align="start" sideOffset={6} collisionPadding={16}
      >
        <div className="px-4 pt-4 pb-3 border-b border-[#EFEFEF]">
          <p className="text-[#9A9A9A] text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-[#1A1A1A] text-3xl font-bold font-mono tracking-widest leading-none">
            {hour.padStart(2,"0")}<span className="text-[#C7C7C7] mx-1">:</span>{minute}
            <span className="text-[#E8A23B] text-xl ml-2">{ampm}</span>
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-[#9A9A9A] text-[10px] font-bold uppercase tracking-widest mb-2">Hour</p>
            <div className="grid grid-cols-6 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => String(i+1)).map((h) => (
                <button key={h} type="button" onClick={() => onH(h)}
                  className={cn("h-9 rounded-lg text-sm font-semibold transition-all duration-100",
                    hour === h ? "bg-[#1A1A1A] text-white"
                               : "bg-[#F5F5F5] text-[#5C5C5C] hover:bg-[#EAEAEA]")}>
                  {h.padStart(2,"0")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#9A9A9A] text-[10px] font-bold uppercase tracking-widest mb-2">Minute</p>
            <div className="grid grid-cols-6 gap-1.5">
              {["00","05","10","15","20","25","30","35","40","45","50","55"].map((m) => (
                <button key={m} type="button" onClick={() => onM(m)}
                  className={cn("h-9 rounded-lg text-sm font-semibold transition-all duration-100",
                    minute === m ? "bg-[#1A1A1A] text-white"
                                 : "bg-[#F5F5F5] text-[#5C5C5C] hover:bg-[#EAEAEA]")}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#9A9A9A] text-[10px] font-bold uppercase tracking-widest mb-2">Period</p>
            <div className="grid grid-cols-2 gap-2">
              {(["AM","PM"] as const).map((ap) => (
                <button key={ap} type="button" onClick={() => onA(ap)}
                  className={cn("h-10 rounded-xl text-sm font-bold tracking-wider transition-all duration-100",
                    ampm === ap ? "bg-[#1A1A1A] text-white"
                                : "bg-[#F5F5F5] text-[#5C5C5C] hover:bg-[#EAEAEA]")}>
                  {ap}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)}
            className="w-full h-10 rounded-xl bg-[#1A1A1A] text-white text-sm font-bold hover:opacity-90 transition-all">
            Confirm
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// ── LocationInput ─────────────────────────────────────────────────────────────
interface LocationInputProps {
  value: string; onChange: (val: string) => void;
  placeholder: string; isLoaded: boolean; className?: string;
}
const LocationInput = ({ value, onChange, placeholder, isLoaded, className }: LocationInputProps) => {
  const acRef  = useRef<google.maps.places.Autocomplete | null>(null);
  const inpRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (inpRef.current && value === "") inpRef.current.value = ""; }, [value]);
  const onPlaceChanged = () => {
    if (!acRef.current) return;
    const place = acRef.current.getPlace();
    const addr  = place.formatted_address || place.name || inpRef.current?.value || "";
    onChange(addr);
    if (inpRef.current) inpRef.current.value = addr;
  };
  const sharedCls = cn("h-full w-full bg-transparent border-0 outline-none ring-0 shadow-none text-[15px] text-[#1A1A1A] placeholder:text-[#9A9A9A] font-medium min-w-0", className);
  if (!isLoaded) return (
    <input ref={inpRef} defaultValue={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} className={sharedCls} autoComplete="off" />
  );
  return (
    <Autocomplete onLoad={(ac) => { acRef.current = ac; }} onPlaceChanged={onPlaceChanged}
      options={{ componentRestrictions: { country: "in" }, fields: ["formatted_address","name"], types: ["geocode","establishment"] }}>
      <input ref={inpRef} defaultValue={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className={sharedCls} autoComplete="off" />
    </Autocomplete>
  );
};

// ── Segmented control (food allowance) ────────────────────────────────────────
interface SegmentedProps { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; }
const Segmented = ({ options, value, onChange }: SegmentedProps) => (
  <div className="rounded-xl bg-[#F5F5F5] p-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
    {options.map((opt) => (
      <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
        className={cn(
          "h-9 rounded-lg text-[12.5px] sm:text-[13px] font-semibold transition-all px-1 truncate",
          value === opt.value
            ? "bg-[#1A1A1A] text-white shadow-sm"
            : "text-[#5C5C5C] hover:text-[#1A1A1A]"
        )}>
        {opt.label}
      </button>
    ))}
  </div>
);

// ── HeroSection ───────────────────────────────────────────────────────────────
const HeroSection = () => {
  const [form,      setForm]      = useState(INITIAL_FORM);
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [error,     setError]     = useState("");

  const [estimate,        setEstimate]        = useState<any>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "vehicle_number" ? value.toUpperCase().replace(/\s/g, "") : value,
    }));
  };

  const handleSelect = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  // Selecting "luxury" sets both vehicle_type and vehicle_class to "luxury".
  // Booking info only — no price effect (driver services are flat-rate per the sheet).
  const handleVehicleSelect = (v: string) => {
    setForm((prev) => ({
      ...prev,
      vehicle_type:  v,
      vehicle_class: v === "luxury" ? "luxury" : "normal",
    }));
  };

  // Local service: pickup & drop must be in the same city (Mumbai / Pune)
  const localCityError =
    form.service_type === "local" ? checkLocalCity(form.pickup_city, form.drop_location) : "";

  const vehicleOptions = VEHICLE_OPTIONS;

  // Switching service type: keep only vehicles valid for it
  useEffect(() => {
    const valid = vehicleOptions.map((o) => o.value);
    setForm((prev) => {
      let next = prev;
      if (prev.vehicle_type && !valid.includes(prev.vehicle_type)) {
        next = { ...next, vehicle_type: "", vehicle_class: "normal" };
      }
      return next;
    });
  }, [form.service_type]);

  // Small hint shown ~0.7s after the user stops typing (so it doesn't flash mid-typing).
  // Blocking (estimate / submit) uses localCityError immediately.
  const [localHint, setLocalHint] = useState("");
  useEffect(() => {
    if (!localCityError) { setLocalHint(""); return; }
    const timer = setTimeout(() => setLocalHint(localCityError), 700);
    return () => clearTimeout(timer);
  }, [localCityError]);

  // useEffect(() => {
  //   const canEstimate = form.pickup_city && form.service_type && form.vehicle_type;
  //   if (!canEstimate) { setEstimate(null); return; }

  //   const timer = setTimeout(async () => {
  //     setEstimateLoading(true);
  //     const result = await getPriceEstimate({
  //       pickup_city:   form.pickup_city,
  //       drop_location: form.drop_location,
  //       destination:   form.drop_location,
  //       service_type:  form.service_type,
  //       vehicle_type:  form.vehicle_type,
  //       vehicle_class: form.vehicle_class,
  //       trip_type:     form.trip_type,
  //       pickup_time:   form.pickup_time,
  //       pickup_date:   form.pickup_date,
  //       return_date:   form.return_date,
  //       return_time:   form.return_time,
  //       food_provided: form.food_provided,
  //     });
  //     setEstimate(result);
  //     setEstimateLoading(false);
  //   }, 600);

  //   return () => clearTimeout(timer);
  // }, [
  //   form.pickup_city, form.drop_location, form.service_type, form.vehicle_type,
  //   form.trip_type, form.pickup_time, form.vehicle_class,
  //   form.pickup_date, form.return_date, form.return_time, form.food_provided,
  // ]);

  useEffect(() => {
    const canEstimate = form.pickup_city && form.service_type && form.vehicle_type && !localCityError;
    if (!canEstimate) { setEstimate(null); return; }

    const timer = setTimeout(async () => {
      setEstimateLoading(true);
      const result = await getPriceEstimate({
        pickup_city:   form.pickup_city,
        drop_location: form.drop_location,
        destination:   form.drop_location,
        service_type:  form.service_type,
        vehicle_type:  form.vehicle_type,
        vehicle_class: form.vehicle_class,
        trip_type:     form.trip_type,
        pickup_time:   form.pickup_time,
        pickup_date:   form.pickup_date,
        return_date:   form.return_date,
        return_time:   form.return_time,
        food_provided: form.food_provided,
      });
      // Never show a ₹0 fare — treat it as "no estimate"
      setEstimate(result && result.total_fare > 0 ? result : null);
      setEstimateLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [
    form.pickup_city, form.drop_location, form.service_type, form.vehicle_type,
    form.trip_type, form.pickup_time, form.vehicle_class,
    form.pickup_date, form.return_date, form.return_time, form.food_provided,
  ]);

  // (Removed: One Way / Round Trip toggle and its two reset effects — not in the rate sheet.
  //  trip_type stays "one_way" in the form so the booking payload/DB are unchanged.)

  const handleSubmit = async () => {
    setError("");
    const required = ["full_name","email","phone","pickup_city","pickup_date","pickup_time","service_type","vehicle_type"];
    // Outstation is priced per day / per night halt (night window 6 PM–5 AM), so return date AND time are needed.
    // Driver Local, Round Trip & Outstation: pickup and drop-off date/time are specified at booking
    // (used to work out extra hours).
    if (form.service_type === "local" || form.service_type === "outstation" || form.service_type === "round_trip_outstation") required.push("return_date", "return_time");
    const missing  = required.filter((k) => !form[k as keyof typeof form]);
    if (missing.length) { setError("Please fill in all required fields."); return; }
    if (localCityError) { setError(localCityError); return; }
    if (form.vehicle_number && !/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(form.vehicle_number)) {
      setError("Vehicle number format should be like MH12AB1234 (or leave blank).");
      return;
    }

    setLoading(true);
    try {
      const res = await createBooking(form);
      setBookingId(res.booking_id);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldCls = "h-12 rounded-xl text-[15px] bg-[#F5F5F5] border-0 text-[#1A1A1A] placeholder:text-[#9A9A9A] font-medium focus-visible:ring-1 focus-visible:ring-[#1A1A1A]/20";

  // Food allowance toggle (per sheet): Outstation = ₹350/day (not for Mumbai — all-inclusive),
  // Round Trip Outstation (one day) = ₹350 for 3 meals. Customer feeding the driver = not payable.
  const showFoodToggle =
    (form.service_type === "outstation" && normalizeDestination(form.drop_location) !== "mumbai") ||
    form.service_type === "round_trip_outstation";
  const foodAddLabel =
    form.service_type === "round_trip_outstation" ? "Add ₹350 (3 meals)" : "Add ₹350/day";

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" id="home">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Professional driver with car in Pune"
          className="hidden md:block w-full h-full object-cover object-center" loading="eager" />
        <div className="md:hidden absolute inset-0 bg-[#050d1a]" />
        <div className="hidden md:block absolute inset-0"
          style={{ background: "linear-gradient(105deg, rgba(3,8,20,0.97) 0%, rgba(3,8,20,0.90) 38%, rgba(4,10,26,0.55) 62%, rgba(6,14,36,0.15) 100%)" }} />
        <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-[rgba(3,8,20,0.80)] via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-36 pb-16 w-full max-w-full">
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-14 lg:items-center">

          {/* Mobile headline */}
          <div className="order-1 lg:hidden mb-5">
            <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-[#E8A23B]/20 border border-[#E8A23B]/30 text-[#E8A23B] px-4 py-1.5 rounded-full text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8A23B] animate-pulse" />
              #1 Driver Hire Service · Pune &amp; Mumbai
            </motion.span>
            <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="font-display text-[1.5rem] xs:text-[1.65rem] font-extrabold text-white leading-[1.2] tracking-tight">
              Hire a Professional Driver —{" "}
              <span className="text-[#E8A23B]">Fast, Safe &amp; Reliable</span>
            </motion.h1>
          </div>

          {/* ── FORM — max-width constrained on mobile/tablet, full width from lg ── */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25 }} id="booking"
            className="order-2 lg:order-last w-full max-w-[440px] mx-auto lg:max-w-none">
            <div className="rounded-3xl p-4 xs:p-5 sm:p-6 md:p-7 bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-[1.05rem] text-[#1A1A1A] truncate">Book a Driver</h3>
                  <p className="text-[#8A8A8A] text-xs truncate">Get an instant quote — no commitment</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-[#EAF7EF] flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#1E7A4C]" />
                    </div>
                    <h4 className="font-display font-bold text-lg text-[#1A1A1A] mb-1">Booking Received!</h4>
                    <p className="text-[#5C5C5C] text-sm mb-1">Nearby drivers have been notified on WhatsApp.</p>
                    <p className="text-[#9A9A9A] text-xs mb-3">You'll receive a WhatsApp message once a driver accepts.</p>
                    {estimate?.total_fare && (
                      <p className="text-[#5C5C5C] text-xs mb-3">
                        Estimated fare: <span className="text-[#1A1A1A] font-bold">₹{estimate.total_fare.toLocaleString("en-IN")}</span>
                        <span className="text-[#B0B0B0]"> (final fare confirmed before payment)</span>
                      </p>
                    )}
                    <p className="text-xs font-mono bg-[#F5F5F5] px-3 py-1.5 rounded-lg inline-block text-[#1A1A1A] break-all">
                      ID: {bookingId}
                    </p>
                    <div className="mt-5 flex gap-3 justify-center">
                      <button
                        onClick={() => { setSubmitted(false); setForm(INITIAL_FORM); setEstimate(null); }}
                        className="px-5 h-10 rounded-xl border border-[#E0E0E0] text-[#1A1A1A] text-sm font-semibold hover:bg-[#F5F5F5] transition-all">
                        New Booking
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" className="space-y-2.5">

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                      <Input name="full_name" value={form.full_name} onChange={handleChange}
                        placeholder="Full Name *" className={fieldCls} />
                      <Input name="phone" value={form.phone} onChange={handleChange}
                        placeholder="Phone *" className={fieldCls} />
                    </div>

                    <Input name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="Email Address *" className={fieldCls} />

                    {/* ── Pickup / Drop ── */}
                    <div className="rounded-xl bg-[#F5F5F5] relative overflow-visible">
                      <div className="flex items-center h-12 px-3 sm:px-3.5 gap-2.5 sm:gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] flex-shrink-0" />
                        <LocationInput value={form.pickup_city}
                          onChange={(val) => setForm((prev) => ({ ...prev, pickup_city: val }))}
                          placeholder="Pickup location *" isLoaded={isLoaded} />
                      </div>
                      <div className="h-px bg-[#E5E5E5] ml-[24px] sm:ml-[26px]" />
                      <div className="flex items-center h-12 px-3 sm:px-3.5 gap-2.5 sm:gap-3">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#B0B0B0] flex-shrink-0" />
                        <LocationInput value={form.drop_location}
                          onChange={(val) => setForm((prev) => ({ ...prev, drop_location: val }))}
                          placeholder="Drop location" isLoaded={isLoaded} />
                      </div>
                    </div>

                    {localHint && (
                      <p className="text-[11px] leading-snug text-[#92650F] bg-[#FDF3E2] rounded-lg px-3 py-2">
                        ⚠️ {localHint}
                      </p>
                    )}

                    {/* ── Pickup Date & Time — stacks below 400px, side by side above ── */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                      <div className="h-12 rounded-xl bg-[#F5F5F5] flex items-center px-1 min-w-0">
                        <CalendarIcon className="w-4 h-4 text-[#8A8A8A] flex-shrink-0 ml-2 sm:ml-2.5" />
                        <Popover>
                          <PopoverTrigger asChild>
                            <button type="button"
                              className="flex-1 h-full flex items-center justify-between px-2 sm:px-2.5 text-sm font-medium bg-transparent focus:outline-none min-w-0">
                              <span className={cn("truncate", form.pickup_date ? "text-[#1A1A1A]" : "text-[#9A9A9A]")}>
                                {form.pickup_date ? format(new Date(form.pickup_date+"T00:00:00"), "d MMM yyyy") : "Date"}
                              </span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto max-w-[calc(100vw-2rem)] p-0 z-[200] bg-white"
                            align="start" collisionPadding={16}
                          >
                            <Calendar mode="single"
                              selected={form.pickup_date ? new Date(form.pickup_date+"T00:00:00") : undefined}
                              onSelect={(date) => date && handleSelect("pickup_date", format(date, "yyyy-MM-dd"))}
                              disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                              initialFocus className="rounded-xl border shadow-xl" />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="h-12 rounded-xl bg-[#F5F5F5] flex items-center px-1 min-w-0">
                        <Clock className="w-4 h-4 text-[#8A8A8A] flex-shrink-0 ml-2 sm:ml-2.5" />
                        <TimePicker value={form.pickup_time} label="Pickup Time"
                          onChange={(val) => setForm((prev) => ({ ...prev, pickup_time: val }))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                      <Select value={form.service_type} onValueChange={(v) => handleSelect("service_type", v)}>
                        <SelectTrigger className="h-12 rounded-xl text-[15px] bg-[#F5F5F5] border-0 text-[#1A1A1A] data-[placeholder]:text-[#9A9A9A] font-medium">
                          <SelectValue placeholder="Service Type *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local (8 hrs)</SelectItem>
                          <SelectItem value="round_trip_outstation">Round Trip Outstation (1 day)</SelectItem>
                          <SelectItem value="outstation">Outstation</SelectItem>
                          <SelectItem value="valet">Valet Parking</SelectItem>
                          <SelectItem value="permanent">Permanent Driver</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* ── Vehicle dropdown — booking info only, no price effect ── */}
                      <Select value={form.vehicle_type} onValueChange={handleVehicleSelect}>
                        <SelectTrigger className="h-12 rounded-xl text-[15px] bg-[#F5F5F5] border-0 text-[#1A1A1A] data-[placeholder]:text-[#9A9A9A] font-medium">
                          <SelectValue placeholder="Vehicle *" />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ── Vehicle Number ── */}
                    <div className="rounded-xl bg-[#F5F5F5] flex items-center gap-2.5 px-3 sm:px-3.5 h-12">
                      <Hash className="w-4 h-4 text-[#8A8A8A] flex-shrink-0" />
                      <input
                        name="vehicle_number"
                        value={form.vehicle_number}
                        onChange={handleChange}
                        placeholder="Vehicle no. e.g. MH12AB1234 (optional)"
                        maxLength={11}
                        className="flex-1 h-full bg-transparent border-0 outline-none
                                   text-sm text-[#1A1A1A] placeholder:text-[#9A9A9A]
                                   font-mono tracking-wider min-w-0"
                        autoComplete="off"
                        autoCapitalize="characters"
                      />
                    </div>

                    {/* ── Drop-off / Return Date & Time (Driver Local + Outstation + Round Trip) ── */}
                    {(form.service_type === "local" || form.service_type === "outstation" || form.service_type === "round_trip_outstation") && (
                      <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                        <div className="h-12 rounded-xl bg-[#F5F5F5] flex items-center px-1 min-w-0">
                          <CalendarIcon className="w-4 h-4 text-[#8A8A8A] flex-shrink-0 ml-2 sm:ml-2.5" />
                          <Popover>
                            <PopoverTrigger asChild>
                              <button type="button"
                                className="flex-1 h-full flex items-center justify-between px-2 sm:px-2.5 text-sm font-medium bg-transparent focus:outline-none min-w-0">
                                <span className={cn("truncate", form.return_date ? "text-[#1A1A1A]" : "text-[#9A9A9A]")}>
                                  {form.return_date ? format(new Date(form.return_date+"T00:00:00"), "d MMM yyyy") : "Drop-off date *"}
                                </span>
                              </button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto max-w-[calc(100vw-2rem)] p-0 z-[200] bg-white"
                              align="start" collisionPadding={16}
                            >
                              <Calendar mode="single"
                                selected={form.return_date ? new Date(form.return_date+"T00:00:00") : undefined}
                                onSelect={(date) => date && handleSelect("return_date", format(date, "yyyy-MM-dd"))}
                                disabled={(date) => date < new Date(form.pickup_date+"T00:00:00")}
                                initialFocus className="rounded-xl border shadow-xl" />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="h-12 rounded-xl bg-[#F5F5F5] flex items-center px-1 min-w-0">
                          <Clock className="w-4 h-4 text-[#8A8A8A] flex-shrink-0 ml-2 sm:ml-2.5" />
                          <TimePicker value={form.return_time} label="Drop-off Time *"
                            onChange={(val) => setForm((prev) => ({ ...prev, return_time: val }))} />
                        </div>
                      </div>
                    )}

                    {/* ── Food Allowance ── */}
                    {showFoodToggle && (
                      <Segmented
                        value={form.food_provided ? "provide" : "add"}
                        onChange={(v) => setForm((prev) => ({ ...prev, food_provided: v === "provide" }))}
                        options={[
                          { value: "provide", label: "I'll provide food" },
                          { value: "add",     label: foodAddLabel        },
                        ]}
                      />
                    )}

                    {/* ── Booking terms for the selected service ── */}
                    {SERVICE_NOTES[form.service_type] && (
                      <p className="text-[11px] leading-snug text-[#5C5C5C] bg-[#F5F5F5] rounded-lg px-3 py-2">
                        ℹ️ {SERVICE_NOTES[form.service_type]}
                      </p>
                    )}

                    {/* ── Live Fare Estimate ── */}
                    <AnimatePresence>
                      {(estimate || estimateLoading) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl bg-[#FDF3E2] px-3.5 sm:px-4 py-3 overflow-hidden"
                        >
                          {estimateLoading ? (
                            <div className="flex items-center gap-2 text-[#8A8A8A] text-sm">
                              <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                              Calculating estimate…
                            </div>
                          ) : estimate ? (
                            <div>
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <span className="text-[#92650F] text-[11px] font-semibold uppercase tracking-wider">
                                  Estimated Fare
                                </span>
                                {estimate.distance_text && (
                                  <span className="text-[#8A8A8A] text-[11px] truncate">
                                    {estimate.distance_text} · {estimate.duration_text}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1 mt-1 flex-wrap">
                                <IndianRupee className="w-4 h-4 text-[#1A1A1A] flex-shrink-0" />
                                <span className="text-[#1A1A1A] text-2xl font-bold">
                                  {estimate.total_fare?.toLocaleString("en-IN")}
                                </span>
                                {estimate.is_night_charge && (
                                  <span className="text-[#92650F] text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/60">
                                    🌙 Night charge included
                                  </span>
                                )}
                                {estimate.nights > 0 && (
                                  <span className="text-[#92650F] text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/60">
                                    🌙 {estimate.nights} night halt{estimate.nights > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>

                              {/* Local / Valet / Round Trip: booked duration vs the included hours */}
                              {(estimate.service_type === "local" || estimate.service_type === "valet" || estimate.service_type === "round_trip_outstation") && estimate.scheduled_hours > 0 && (
                                <p className="text-[#92650F] text-[11px] mt-1">
                                  Booked for {estimate.scheduled_hours} hrs
                                  {estimate.scheduled_hours > estimate.included_hours
                                    ? ` — ${Math.round((estimate.scheduled_hours - estimate.included_hours) * 100) / 100} hrs beyond the ${estimate.included_hours}-hour limit`
                                    : ""}
                                  {estimate.extra_hour_charge > 0
                                    ? ` (+₹${estimate.extra_hour_charge} included)`
                                    : estimate.extra_hours_pending > 0
                                      ? ` · extra hours charged at ₹${estimate.extra_hour_rate}/hr in the final bill`
                                      : estimate.scheduled_hours > estimate.included_hours
                                        ? "; extra charges will apply"
                                        : ""}
                                </p>
                              )}

                              {/* Outstation: booked duration and day breakdown */}
                              {estimate.service_type === "outstation" && estimate.scheduled_hours > 0 && !estimate.all_inclusive && (
                                <p className="text-[#92650F] text-[11px] mt-1">
                                  Booked for {estimate.scheduled_hours} hrs ({estimate.days} day{estimate.days > 1 ? "s" : ""}
                                  {estimate.extra_hours > 0 ? ` + ${estimate.extra_hours} extra hrs` : ""})
                                  {estimate.extra_hour_charge > 0
                                    ? ` (+₹${estimate.extra_hour_charge?.toLocaleString("en-IN")} included)`
                                    : ""}
                                </p>
                              )}

                              {/* Included hours / extra-hour rate (from rate sheet) */}
                              {estimate.extra_hour_rate > 0 && (
                                <p className="text-[#92650F] text-[11px] mt-1">
                                  {estimate.included_hours ? `Includes ${estimate.included_hours} hrs · ` : estimate.service_type === "outstation" ? "Includes 12 hrs duty/day · " : ""}
                                  Extra hours ₹{estimate.extra_hour_rate}/hr
                                </p>
                              )}

                              {/* Permanent driver: monthly fare for 12 hrs + service charge (both included in total) */}
                              {estimate.service_type === "permanent" && (
                                <p className="text-[#92650F] text-[11px] mt-1">
                                  ₹{estimate.monthly_fare?.toLocaleString("en-IN")} monthly fare for {estimate.included_hours} hrs/day
                                  {" "}+ ₹{estimate.annual_service_charge?.toLocaleString("en-IN")} service charge
                                </p>
                              )}

                              <p className="text-[#B0863E] text-[10px] mt-1.5 leading-relaxed">
                                {estimate.note}
                              </p>
                            </div>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Input name="special_notes" value={form.special_notes} onChange={handleChange}
                      placeholder="Special notes or promo code" className={fieldCls} />

                    {error && (
                      <p className="text-xs text-[#B23A3A] bg-[#FCEAEA] rounded-xl px-3 py-2">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={handleSubmit} disabled={loading}
                      className="w-full h-12 sm:h-13 py-3 sm:py-3.5 rounded-xl bg-[#1A1A1A] text-white text-[14px] sm:text-[15px] font-bold
                                 hover:opacity-90 transition-all disabled:opacity-50
                                 flex items-center justify-center gap-2 mt-1">
                      {loading
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                        : <>Get Instant Quote <ArrowRight className="w-4 h-4" /></>
                      }
                    </button>

                    <p className="text-center text-[10.5px] sm:text-[11px] text-[#9A9A9A] flex flex-wrap justify-center gap-x-2.5 sm:gap-x-3 pt-1">
                      <span>Free cancellation</span>
                      <span>·</span>
                      <span>No hidden charges</span>
                      <span>·</span>
                      <span>Instant confirmation</span>
                    </p>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── Hero copy ── */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }} className="order-3 lg:order-first mt-8 lg:mt-0">
            <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="hidden lg:inline-flex items-center gap-2 bg-[#E8A23B]/15 border border-[#E8A23B]/25 text-[#E8A23B] px-5 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#E8A23B] animate-pulse" />
              #1 Driver Hire Service in Pune &amp; Mumbai
            </motion.span>
            <h1 className="hidden lg:block font-display text-4xl md:text-5xl lg:text-[3.4rem]
                           font-extrabold text-white drop-shadow-lg leading-[1.1] mb-8 tracking-tight">
              Hire a Professional Driver —{" "}
              <span className="text-[#E8A23B] drop-shadow-md">Fast, Safe &amp; Reliable</span>
            </h1>
            <ul className="space-y-3 text-white/90 text-[0.9rem] sm:text-[0.95rem] md:text-lg mb-8">
              {["24/7 Service Availability","Verified & Trained Drivers","Local, Outstation & Permanent Driver Options","Pune, Mumbai & Outstation Routes"].map((item, i) => (
                <motion.li key={item} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-[#E8A23B] flex-shrink-0" />
                  {item}
                </motion.li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-3 mb-10">
              <a href="tel:+919762798200"
                className="inline-flex items-center h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-[#E8A23B] text-[#1A1A1A] font-bold text-sm sm:text-base hover:opacity-90 transition-all">
                Call Now
              </a>
              <a href="https://wa.me/918855807122" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center h-11 sm:h-12 px-6 sm:px-8 rounded-xl border border-white/30 text-white font-bold text-sm sm:text-base hover:bg-white/10 transition-all">
                WhatsApp Booking
              </a>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/15
                         bg-black/20 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none
                         px-5 md:px-0 py-5 md:py-0 rounded-2xl md:rounded-none -mx-1 md:mx-0">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display font-bold text-xl sm:text-2xl text-[#E8A23B] drop-shadow-sm">{s.value}</p>
                  <p className="text-white/70 font-medium text-xs sm:text-sm mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 60 1440 50V80H0V40Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;