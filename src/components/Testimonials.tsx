import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  { name: "Rajesh Sharma", role: "Business Owner", text: "Excellent service! The driver was punctual, professional, and knew the routes very well. Highly recommended for outstation trips.", rating: 5, initials: "RS" },
  { name: "Priya Kulkarni", role: "IT Professional", text: "I use their monthly driver service for my daily commute. Reliable and affordable — saves me so much stress every day.", rating: 5, initials: "PK" },
  { name: "Amit Deshmukh", role: "Event Manager", text: "Booked their valet service for a wedding. Flawless execution, polite staff, and they handled 50+ cars without a hitch!", rating: 5, initials: "AD" },
];

const Testimonials = () => (
  <section className="py-24 bg-section-gradient relative overflow-hidden">
    <div className="absolute top-10 left-10 w-72 h-72 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative container mx-auto px-4 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          ⭐ Testimonials
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
          What Our Customers Say
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="bg-card rounded-2xl p-7 border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 relative"
          >
            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/8" />
            <div className="flex gap-0.5 mb-5">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-5 h-5 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-foreground text-sm mb-6 leading-relaxed italic">"{t.text}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <div className="w-11 h-11 rounded-full bg-hero-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">{t.initials}</span>
              </div>
              <div>
                <p className="font-display font-bold text-foreground text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
