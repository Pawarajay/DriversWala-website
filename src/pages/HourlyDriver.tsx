import ServicePageLayout from "@/components/ServicePageLayout";
import { Clock, ShieldCheck, MapPin, Calculator } from "lucide-react";

export default function HourlyDriver() {
    return (
        <ServicePageLayout
            data={{
                badge: "Flexible & On-Demand",
                titleWhite: "Hire a Driver",
                titleAccent: "By the Hour",
                subtitle:
                    "Need someone to drive you to meetings, run errands, or drop off family? Hire a professional driver only for the hours you need.",
                featuresBadge: "Why Choose Us",
                featuresTitle: "Smart Driving",
                featuresTitleAccent: "On Your Terms",
                features: [
                    {
                        icon: Clock,
                        title: "On-Demand Booking",
                        desc: "Book a driver with just 30 minutes notice in Pune and Mumbai city limits.",
                    },
                    {
                        icon: Calculator,
                        title: "Pay By The Hour",
                        desc: "No long-term commitments. Pay only for the exact hours you use the service.",
                    },
                    {
                        icon: ShieldCheck,
                        title: "Trained Professionals",
                        desc: "All drivers are background verified, uniformed, and trained in defensive driving.",
                    },
                    {
                        icon: MapPin,
                        title: "City Expertise",
                        desc: "Drivers know the quickest routes, handling dense traffic and tough parking easily.",
                    },
                ],

                faqs: [
                    {
                        q: "Is there a minimum booking duration?",
                        a: "Yes, the minimum booking duration for an hourly driver is 2 hours.",
                    },
                    {
                        q: "What if the trip extends beyond the booked hours?",
                        a: "You will be charged ₹100 per additional 30 minutes. The overtime charges can be paid directly via the app or to the driver.",
                    },
                    {
                        q: "Can the driver handle luxury cars?",
                        a: "Yes! When booking, just specify your vehicle type (e.g., Luxury/Premium), and we'll assign a chauffeur specifically trained for high-end automatic vehicles.",
                    },
                    {
                        q: "Do I have to pay for the driver's meals?",
                        a: "For bookings under 6 hours, no meals are required. For full-day bookings (10+ hours), you can either provide a basic meal alignment or add a ₹150 meal allowance to the final bill.",
                    },
                ],
            }}
        />
    );
}
