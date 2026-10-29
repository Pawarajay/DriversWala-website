
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import sectionBgDark from "@/assets/section-bg-dark.jpg";
import logoImg from "@/assets/logo.png";

const Footer = () => (
  <footer className="relative overflow-hidden bg-slate-950" id="contact">

    <div className="relative container mx-auto px-4 lg:px-8 py-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        <div className="col-span-2 lg:col-span-1">
          <div className="mb-5">
            <Link to="/">
              <img
                src={logoImg}
                alt="DriversWala"
                className="h-11 sm:h-12 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.45)]"
              />
            </Link>
          </div>
          <p className="text-primary-foreground/50 text-sm leading-relaxed mb-6">
            Professional driver hire service in Pune & Mumbai. Reliable, safe, and affordable drivers at your doorstep — anytime, anywhere.
          </p>
          <div className="flex gap-3">
            {["Facebook", "Instagram", "Twitter"].map((s) => (
              <a key={s} href="#" className="w-9 h-9 rounded-lg bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center text-primary-foreground/50 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all text-xs font-semibold">
                {s[0]}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-5 text-lg">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Home", href: "#home" },
              { label: "Services", href: "#services" },
              { label: "Vehicles", href: "#vehicles" },
              { label: "Book Now", href: "#booking" },
              { label: "FAQ", href: "#faq" },
            ].map((link) => (
              <li key={link.label}>
                <a href={link.href} className="text-primary-foreground/50 hover:text-accent transition-colors flex items-center gap-1 group">
                  {link.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-primary-foreground mb-5 text-lg">Services</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/50">
            {[
              { label: "Hourly Driver Hire", href: "/hourly-driver" },
              { label: "Daily & Monthly Drivers", href: "/daily-monthly-driver" },
              { label: "Outstation Drivers", href: "/outstation-driver" },
              { label: "Valet & Event Services", href: "/valet-event-services" },
              { label: "Driving Lessons", href: "/driving-lessons" },
            ].map((s) => (
              <li key={s.label}>
                <Link to={s.href} className="hover:text-accent transition-colors flex items-center gap-1 group w-max">
                  {s.label}
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <h4 className="font-display font-bold text-primary-foreground mb-5 text-lg">Contact Us</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3 text-primary-foreground/60">
              <a href="tel:+917756998289" className="flex items-center gap-3 hover:text-white transition-colors">
                <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-accent" />
                </div>
                +91 77569 98289
              </a>
            </li>
            <li className="flex items-center gap-3 text-primary-foreground/60">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-accent" />
              </div>
              info@driverwala.com
            </li>
            <li className="flex items-start gap-3 text-primary-foreground/60">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-accent" />
              </div>
              Pune & Mumbai, Maharashtra
            </li>
            <li className="flex items-center gap-3 text-primary-foreground/60">
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-accent" />
              </div>
              24/7 Available
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/8 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/35">
        <p>© {new Date().getFullYear()} Driver Wala. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary-foreground/60 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-foreground/60 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
