
import { motion } from "framer-motion";
import { Car, ChevronRight, Shield, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import sectionBgDark from "@/assets/section-bg-dark.jpg";

const vehicles = [
  {
    type: "Hatchback",
    examples: "WagonR · i10 · Swift",
    desc: "Perfect for city commutes and short trips around Pune & Mumbai",
    tag: "Most Popular",
    tagColor: "bg-orange-500",
    features: ["Fuel Efficient", "Easy Parking", "City Expert"],
  },
  {
    type: "Sedan",
    examples: "Honda City · Ciaz · Verna",
    desc: "Comfortable rides for business meetings & family outings",
    tag: "Business Choice",
    tagColor: "bg-blue-500",
    features: ["AC Comfort", "Boot Space", "Professional"],
  },
  {
    type: "SUV / MUV",
    examples: "Innova · XUV700 · Fortuner",
    desc: "Spacious vehicles for groups, outstation trips & airport runs",
    tag: "Premium",
    tagColor: "bg-purple-500",
    features: ["7 Seater", "Outstation Ready", "Luggage Space"],
  },
];

const trustBadges = [
  { icon: Shield, label: "Verified Drivers" },
  { icon: Star,   label: "4.8★ Rated" },
  { icon: Users,  label: "10,000+ Trips" },
];

const Vehicles = () => (
  <section className="relative py-20 md:py-28 overflow-hidden" id="vehicles">

    {/* ── Background ── */}
    <div className="absolute inset-0">
      <img src={sectionBgDark} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(216,100%,8%)] via-[hsl(216,100%,12%)]/90 to-[hsl(214,100%,16%)]/80" />
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }}
      />
    </div>

    {/* Decorative glows */}
    <div className="absolute top-10 left-1/4 w-96 h-96 bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
    <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">

      {/* ── Section header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 md:mb-16"
      >
        <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/25 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          <Car className="w-3.5 h-3.5" /> Vehicles We Cover
        </span>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary-foreground mt-3 tracking-tight leading-tight">
          We Drive{" "}
          <span className="gradient-text-accent">All Vehicle Types</span>
        </h2>
        <p className="text-primary-foreground/60 text-base md:text-lg mt-4 max-w-xl mx-auto leading-relaxed px-4">
          Whether it's a compact hatchback or a luxury SUV — our trained drivers handle them all
        </p>
      </motion.div>

      {/* ── Cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
        {vehicles.map((v, i) => (
          <motion.div
            key={v.type}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.55 }}
            className="group relative"
          >
            {/* Card */}
            <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm
                            hover:bg-white/10 hover:border-white/20 hover:shadow-2xl
                            transition-all duration-300 overflow-hidden p-6 md:p-7 flex flex-col">

              {/* Tag badge */}
              <span className={`absolute top-4 right-4 ${v.tagColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase`}>
                {v.tag}
              </span>

              {/* Content */}
              <h3 className="font-display font-extrabold text-xl md:text-2xl text-primary-foreground mb-1">
                {v.type}
              </h3>
              <p className="text-primary-foreground/40 text-xs mb-2 font-medium">{v.examples}</p>
              <p className="text-primary-foreground/65 text-sm leading-relaxed mb-5 flex-1">
                {v.desc}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {v.features.map((f) => (
                  <span key={f} className="text-[11px] font-semibold text-primary-foreground/60
                                           bg-white/8 border border-white/10 px-2.5 py-1 rounded-lg">
                    {f}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center justify-end mt-auto pt-4 border-t border-white/10">
                <a href="#booking"
                  className="flex items-center gap-1.5 bg-accent hover:bg-accent/90 text-white
                             text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200
                             shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5">
                  Book Now <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Trust badges row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-4 md:gap-8 mt-10 md:mt-14"
      >
        {trustBadges.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-primary-foreground/50 text-sm font-medium">
            <Icon className="w-4 h-4 text-accent" />
            {label}
          </div>
        ))}
      </motion.div>

      {/* ── Bottom CTA ── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 md:mt-10"
      >
        <Button variant="heroOutline" size="lg" className="text-sm md:text-base px-6 md:px-8" asChild>
          <a href="#booking">
            Book Your Driver Now <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </Button>
      </motion.div>

    </div>
  </section>
);

export default Vehicles;