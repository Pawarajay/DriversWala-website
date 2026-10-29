import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ctaBg from "@/assets/cta-bg.jpg";

const CTABanner = () => (
  <section className="relative py-24 overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={ctaBg} alt="Pune city highway at sunset" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(216,100%,12%)/0.9] via-[hsl(216,100%,18%)/0.85] to-[hsl(214,100%,22%)/0.8]" />
    </div>

    {/* Decorative */}
    <div className="absolute top-0 right-20 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />

    <div className="relative container mx-auto px-4 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/25 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Available 24/7
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground mb-5 tracking-tight">
          Need a Driver <span className="gradient-text-accent">Right Now?</span>
        </h2>
        <p className="text-primary-foreground/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          Call us or send a WhatsApp message for instant booking. Professional drivers across Pune & Mumbai, ready when you are.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <Button variant="accent" size="lg" className="shadow-cta-glow text-base px-8 h-13" asChild>
            <a href="tel:+917756998289">
              <Phone className="w-5 h-5 mr-2" /> Call +91 77569 98289
            </a>
          </Button>
          <Button variant="heroOutline" size="lg" className="text-base px-8 h-13" asChild>
            <a href="https://wa.me/917756998289" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Booking
            </a>
          </Button>
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-primary-foreground/40 text-sm mt-8 flex items-center justify-center gap-4"
        >
          <span>✓ No waiting time</span>
          <span>✓ Verified drivers</span>
          <span>✓ Best rates guaranteed</span>
        </motion.p>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
