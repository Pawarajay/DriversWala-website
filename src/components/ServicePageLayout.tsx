import { Link } from "react-router-dom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { LucideIcon } from "lucide-react";
import ctaBg from "@/assets/cta-bg.jpg";

/* ─── Types ─── */
export interface Feature {
    icon: LucideIcon;
    title: string;
    desc: string;
}



export interface PopularRoute {
    from: string;
    to: string;
    distance: string;
    price: string;
}

export interface FaqItem {
    q: string;
    a: string;
}

export interface ServicePageData {
    /* Hero */
    badge: string;
    titleWhite: string;
    titleAccent: string;
    subtitle: string;

    /* Features */
    featuresBadge: string;
    featuresTitle: string;
    featuresTitleAccent: string;
    features: Feature[];



    /* Optional routes (outstation page) */
    routes?: PopularRoute[];
    routesBadge?: string;
    routesTitle?: string;
    routesTitleAccent?: string;

    /* FAQ */
    faqs: FaqItem[];
}

/* ─── Animations ─── */
const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true } as const,
};

const stagger = (i: number) => ({ delay: i * 0.08, duration: 0.5 });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const ServicePageLayout = ({ data }: { data: ServicePageData }) => (
    <>
        <Navbar />

        {/* ── HERO ── */}
        <section className="relative min-h-[70vh] flex items-center overflow-hidden">
            {/* Dark background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(216,100%,8%)] via-[hsl(216,100%,14%)] to-[hsl(214,80%,20%)]" />
            {/* Noise texture */}
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")",
                }}
            />
            {/* Decorative blobs */}
            <div className="absolute top-20 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative container mx-auto px-4 lg:px-8 pt-28 pb-20 text-center max-w-3xl">
                <motion.span
                    {...fadeUp}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/25 text-amber-300 px-5 py-2 rounded-full text-sm font-semibold mb-8 backdrop-blur-sm"
                >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    {data.badge}
                </motion.span>

                <motion.h1
                    {...fadeUp}
                    transition={{ delay: 0.2 }}
                    className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight"
                >
                    {data.titleWhite}{" "}
                    <span className="gradient-text-accent">{data.titleAccent}</span>
                </motion.h1>

                <motion.p
                    {...fadeUp}
                    transition={{ delay: 0.3 }}
                    className="text-white/65 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
                >
                    {data.subtitle}
                </motion.p>

                <motion.div
                    {...fadeUp}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <Button
                        variant="accent"
                        size="lg"
                        className="shadow-cta-glow text-base px-8 rounded-xl"
                        asChild
                    >
                        <Link to="/#booking">
                            Book Now <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </Button>
                    <Button variant="heroOutline" size="lg" className="text-base px-8 rounded-xl" asChild>
                        <a href="https://wa.me/917756998289" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                        </a>
                    </Button>
                </motion.div>
            </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="py-20 lg:py-28 bg-section-gradient relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative container mx-auto px-4 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 bg-secondary/8 border border-secondary/15 text-secondary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        {data.featuresBadge}
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
                        {data.featuresTitle}{" "}
                        <span className="text-gradient-primary">{data.featuresTitleAccent}</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
                    {data.features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            {...fadeUp}
                            transition={stagger(i)}
                            className="group relative bg-card rounded-2xl p-7 border border-border/50 hover:border-primary/30 hover:shadow-card-hover transition-all duration-300 cursor-default hover:-translate-y-1"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                                <f.icon className="w-7 h-7 text-primary group-hover:text-secondary transition-colors" />
                            </div>
                            <h3 className="font-display font-bold text-lg text-foreground mb-2">{f.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── POPULAR ROUTES (optional) ── */}
        {data.routes && data.routes.length > 0 && (
            <section className="py-20 lg:py-28 relative">
                <div className="relative container mx-auto px-4 lg:px-8">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                            {data.routesBadge}
                        </span>
                        <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
                            {data.routesTitle}{" "}
                            <span className="gradient-text-accent">{data.routesTitleAccent}</span>
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.routes.map((r, i) => (
                            <motion.div
                                key={`${r.from}-${r.to}`}
                                {...fadeUp}
                                transition={stagger(i)}
                                className="group bg-card rounded-2xl p-6 border border-border/50 hover:border-accent/30 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent font-bold text-sm">
                                        {r.from.slice(0, 3).toUpperCase()}
                                    </span>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                    <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                        {r.to.slice(0, 3).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="font-display font-bold text-foreground mb-1">
                                    {r.from} → {r.to}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-3">{r.distance}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-primary font-bold text-lg">{r.price}</span>
                                    <Button variant="outline" size="sm" className="rounded-xl text-xs" asChild>
                                        <Link to="/#booking">Book Trip</Link>
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        )}



        {/* ── 3-STEP PROCESS ── */}
        <section className="py-20 lg:py-28 bg-dark-section relative overflow-hidden">
            <div className="absolute top-10 right-20 w-64 h-64 bg-accent/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative container mx-auto px-4 lg:px-8">
                <motion.div {...fadeUp} className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/25 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        How It Works
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground mt-3 tracking-tight">
                        Simple <span className="gradient-text-accent">3-Step</span> Booking
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
                    {[
                        {
                            step: "01",
                            title: "Submit Trip Details",
                            desc: "Share your requirements — pickup, destination, date & vehicle type.",
                        },
                        {
                            step: "02",
                            title: "Get Instant Quote",
                            desc: "Receive a transparent, all-inclusive price estimate within minutes.",
                        },
                        {
                            step: "03",
                            title: "Start Your Journey",
                            desc: "Your professional driver arrives on time — sit back and relax.",
                        },
                    ].map((s, i) => (
                        <motion.div key={s.step} {...fadeUp} transition={stagger(i)} className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto mb-5">
                                <span className="font-display text-2xl font-extrabold text-accent">{s.step}</span>
                            </div>
                            <h3 className="font-display font-bold text-lg text-primary-foreground mb-2">
                                {s.title}
                            </h3>
                            <p className="text-primary-foreground/55 text-sm leading-relaxed">{s.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="text-center mt-12">
                    <Button variant="accent" size="lg" className="shadow-cta-glow text-base px-10 rounded-xl" asChild>
                        <Link to="/#booking">
                            Book Now <ArrowRight className="w-5 h-5 ml-1" />
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="relative py-24 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <img src={ctaBg} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[hsla(216,100%,12%,0.95)] via-[hsla(216,100%,18%,0.9)] to-[hsla(214,100%,22%,0.85)]" />
            </div>
            <div className="absolute top-0 right-20 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative container mx-auto px-4 lg:px-8 text-center">
                <motion.div {...fadeUp}>
                    <span className="inline-flex items-center gap-2 bg-accent/15 border border-accent/25 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                        Available 24/7
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground mb-5 tracking-tight">
                        Ready to Book Your{" "}
                        <span className="gradient-text-accent">Perfect Ride?</span>
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
                        {...fadeUp}
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

        {/* ── FAQ ── */}
        <section className="py-24 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative container mx-auto px-4 lg:px-8 max-w-3xl">
                <motion.div {...fadeUp} className="text-center mb-14">
                    <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                        FAQ
                    </span>
                    <h2 className="font-display text-3xl md:text-5xl font-extrabold text-foreground mt-3 tracking-tight">
                        Frequently Asked{" "}
                        <span className="gradient-text-accent">Questions</span>
                    </h2>
                </motion.div>

                <Accordion type="single" collapsible className="space-y-4">
                    {data.faqs.map((f, i) => (
                        <motion.div key={i} {...fadeUp} transition={stagger(i)}>
                            <AccordionItem
                                value={`faq-${i}`}
                                className="bg-card border border-border/50 rounded-2xl px-7 shadow-card hover:shadow-card-hover transition-shadow"
                            >
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

        <Footer />
        <WhatsAppButton />
    </>
);

export default ServicePageLayout;
