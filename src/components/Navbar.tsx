

import { useState, useEffect } from "react";
import { Menu, X, Phone, LayoutDashboard, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@/assets/logo.png";

const navLinks = [
  { label: "Home",     href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Vehicles", href: "#vehicles" },
  { label: "Pricing",  href: "#booking" },
  { label: "FAQ",      href: "#faq" },
  { label: "Contact",  href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // ⭐ Secret CRM shortcut: Ctrl + Shift + A
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        window.location.href = "/admin";
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const isLight = scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isLight
          ? "bg-white/98 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-gradient-to-b from-black/60 via-black/30 to-transparent border-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-[68px] px-4 lg:px-8">

        {/* Logo */}
        <a href="#home" className="flex items-center flex-shrink-0">
          <img
            src={logoImg}
            alt="DriversWala"
            className={`h-10 sm:h-11 w-auto object-contain transition-all duration-300 ${
              !isLight ? "drop-shadow-[0_2px_10px_rgba(255,255,255,0.45)]" : ""
            }`}
          />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-200 ${
                isLight
                  ? "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  : "text-white/90 hover:text-white hover:bg-white/15 drop-shadow-sm"
              }`}
            >
              {link.label}
            </a>
          ))}

          {/* Driver Register */}
          <a
            href="/driver-register"
            className={`ml-1 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-semibold transition-all duration-200 ${
              isLight
                ? "text-emerald-600 hover:bg-emerald-50"
                : "text-emerald-300 hover:text-white hover:bg-white/15"
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            Join as Driver
          </a>

          {/* Bookings dashboard */}
          {/* <a
            href="/bookings"
            className={`ml-1 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-semibold transition-all duration-200 ${
              isLight
                ? "text-indigo-600 hover:bg-indigo-50"
                : "text-indigo-300 hover:text-white hover:bg-white/15"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Bookings
          </a> */}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          <a
            href="tel:+917756998289"
            className={`flex items-center gap-2 text-[13px] font-semibold transition-colors duration-300 ${
              isLight ? "text-gray-700 hover:text-blue-600" : "text-white drop-shadow-md"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isLight ? "bg-blue-100" : "bg-white/20"
            }`}>
              <Phone className="w-3.5 h-3.5" />
            </div>
            +91 77569 98289
          </a>

          <Button
            variant="accent"
            size="sm"
            className="shadow-cta-glow px-5 rounded-xl text-[13px] font-bold h-9"
            asChild
          >
            <a href="#booking">Book a Driver</a>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
            isLight
              ? "text-gray-700 hover:bg-gray-100"
              : "text-white hover:bg-white/20 drop-shadow-md"
          }`}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[68px] bg-black/40 lg:hidden z-40"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="lg:hidden relative z-50 bg-white border-b border-gray-100 shadow-xl"
            >
              <nav className="flex flex-col px-4 pt-3 pb-5 gap-0.5">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-[14px] font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                <a
                  href="/driver-register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold text-emerald-600 hover:bg-emerald-50"
                >
                  <Car className="w-4 h-4" />
                  Join as Driver
                </a>

                <a
                  href="/bookings"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-semibold text-indigo-600 hover:bg-indigo-50"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Bookings Dashboard
                </a>

                <div className="my-2 h-px bg-gray-100" />

                <a
                  href="tel:+917756998289"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  +91 77569 98289
                </a>

                <Button
                  variant="accent"
                  className="mt-2 shadow-cta-glow rounded-xl font-bold text-[14px] h-11"
                  asChild
                >
                  <a href="#booking" onClick={() => setMobileOpen(false)}>
                    Book a Driver
                  </a>
                </Button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;