

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const services = [
  { title: "Hourly Driver", desc: "Hire a driver by the hour for errands, meetings, or short trips around the city.", gradient: "from-primary to-secondary" },
  { title: "Daily / Monthly Driver", desc: "Full-day or long-term driver hire for regular commuting and personal needs.", gradient: "from-secondary to-primary" },
  { title: "Outstation Driver", desc: "Professional drivers for intercity travel — Pune to Mumbai, Goa, Shirdi & more.", gradient: "from-primary to-accent" },
  { title: "Temporary Driver", desc: "Short-term replacement driver when your regular driver is on leave.", gradient: "from-accent to-primary" },
  { title: "Valet & Event", desc: "Professional valet parking and chauffeur services for weddings and corporate events.", gradient: "from-secondary to-accent" },
  { title: "Driving Instructor", desc: "Learn to drive with certified instructors in your own car or ours.", gradient: "from-accent to-secondary" },
];

const Services = () => (
  <section className="pt-12 pb-24 bg-section-gradient relative" id="services">
    {/* Decorative orbs */}
    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

    <div className="relative container mx-auto px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 bg-secondary/8 border border-secondary/15 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          Our Services
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
          Driver Solutions for <span className="text-gradient-primary">Every Need</span>
        </h2>
        <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
          From hourly rides to long-term hires — we have the perfect driver solution for you
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="group relative bg-card rounded-2xl p-7 border border-border/50 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
          >
            {/* Top gradient line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <h3 className="font-display font-bold text-lg text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>

            <div className="flex justify-end mt-5">
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Services;