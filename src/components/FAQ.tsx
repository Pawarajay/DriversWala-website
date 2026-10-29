import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  { q: "How quickly can I get a driver?", a: "We can arrange a driver within 30 minutes for locations within Pune city limits. For outstation bookings, we recommend booking at least 2 hours in advance." },
  { q: "Are your drivers verified and trained?", a: "Yes, all our drivers undergo thorough background verification, driving skill tests, and are trained in road safety and customer etiquette before onboarding." },
  { q: "What cities do you operate in?", a: "We primarily serve Pune and Mumbai, including all suburbs. For outstation trips, we cover routes across Maharashtra and neighboring states." },
  { q: "Can I hire a driver for my own car?", a: "Absolutely! Our core service is providing professional drivers who drive your car. We're experienced with all vehicle types — hatchbacks, sedans, SUVs, and luxury cars." },
  { q: "What are your payment options?", a: "We accept cash, UPI, bank transfers, and all major digital wallets. Monthly customers can opt for invoice-based billing." },
];

const FAQ = () => (
  <section className="py-24 relative overflow-hidden" id="faq">
    <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/3 rounded-full blur-[100px] pointer-events-none" />

    <div className="relative container mx-auto px-4 lg:px-8 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          FAQ
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
          Frequently Asked Questions
        </h2>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <AccordionItem value={`faq-${i}`} className="bg-card border border-border/50 rounded-2xl px-7 shadow-card hover:shadow-card-hover transition-shadow">
              <AccordionTrigger className="font-display font-semibold text-foreground text-left hover:no-underline py-5">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FAQ;
