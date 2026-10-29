import ServicePageLayout from "@/components/ServicePageLayout";
import { CalendarDays, Briefcase, CarFront, Contact } from "lucide-react";

export default function DailyMonthlyDriver() {
    return (
        <ServicePageLayout
            data={{
                badge: "Reliable Daily Commutes",
                titleWhite: "Daily & Monthly",
                titleAccent: "Driver Hire",
                subtitle:
                    "Enjoy the luxury of a personal chauffeur for your daily office commute, school drops, or long-term family needs without the hassle of hiring full-time.",
                featuresBadge: "Service Benefits",
                featuresTitle: "Your Personal",
                featuresTitleAccent: "Chauffeur",
                features: [
                    {
                        icon: Contact,
                        title: "Dedicated Driver",
                        desc: "Get the same familiar face every day. Build trust and comfort for your family.",
                    },
                    {
                        icon: CalendarDays,
                        title: "Flexible Scheduling",
                        desc: "Set your own timings. Need them early morning or late night? You decide the hours.",
                    },
                    {
                        icon: CarFront,
                        title: "Zero Hiring Hassles",
                        desc: "We handle background checks, salaries, leaves, and replacement drivers.",
                    },
                    {
                        icon: Briefcase,
                        title: "Corporate Ready",
                        desc: "Polite, uniformed chauffeurs trained specifically for corporate commuting.",
                    },
                ],

                faqs: [
                    {
                        q: "What happens if my assigned monthly driver falls sick?",
                        a: "Don't worry! We provide a trained replacement driver at your doorstep within 60 minutes. Your daily routine remains uninterrupted.",
                    },
                    {
                        q: "Do I need to sign a long-term contract?",
                        a: "No lock-in periods. You can hire on a daily, weekly, or month-to-month basis and cancel anytime with 3 days' notice.",
                    },
                    {
                        q: "What are the timings for a monthly driver?",
                        a: "A standard monthly shift is 10 hours. You can choose any 10-hour window (e.g., 9 AM to 7 PM). Overtime charges apply beyond 10 hours.",
                    },
                    {
                        q: "Can the driver do other chores like washing the car?",
                        a: "Our monthly drivers include complimentary daily external car dusting. Wet washing or deep cleaning is not included in standard driving duties.",
                    },
                ],
            }}
        />
    );
}
