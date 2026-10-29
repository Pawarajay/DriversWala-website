import ServicePageLayout from "@/components/ServicePageLayout";
import { Map, BadgeCheck, ShieldAlert, Coffee } from "lucide-react";

export default function OutstationDriver() {
    return (
        <ServicePageLayout
            data={{
                badge: "Outstation Journeys",
                titleWhite: "Trips Made Comfortable",
                titleAccent: "& Reliable",
                subtitle:
                    "Planning a weekend getaway, business trip, or family vacation? Hire an experienced highway driver and enjoy the journey from the back seat.",
                featuresBadge: "Why Choose Us",
                featuresTitle: "Highway Experts",
                featuresTitleAccent: "At The Wheel",
                features: [
                    {
                        icon: ShieldAlert,
                        title: "Highway Safety",
                        desc: "Drivers trained specifically for night driving, mountain ghats, and expressways.",
                    },
                    {
                        icon: BadgeCheck,
                        title: "Toll & RTO Knowledge",
                        desc: "Expert navigation across state borders, FASTag lanes, and local RTO rules.",
                    },
                    {
                        icon: Coffee,
                        title: "Punctual Stops",
                        desc: "Drivers know the best, cleanest rest stops and family restaurants on major routes.",
                    },
                    {
                        icon: Map,
                        title: "One-Way or Round Trip",
                        desc: "Total flexibility. Book a drop-only service or keep the driver for your entire vacation.",
                    },
                ],
                routesBadge: "Popular Destinations",
                routesTitle: "Top Routes from",
                routesTitleAccent: "Pune",
                routes: [
                    { from: "Pune", to: "Mumbai (Drop)", distance: "150 km • 3 hrs", price: "₹1,499" },
                    { from: "Pune", to: "Goa", distance: "450 km • 9 hrs", price: "₹3,499/day" },
                    { from: "Pune", to: "Mahabaleshwar", distance: "120 km • 3 hrs", price: "₹1,999/day" },
                    { from: "Pune", to: "Shirdi", distance: "200 km • 4.5 hrs", price: "₹1,999/day" },
                    { from: "Pune", to: "Lonavala", distance: "65 km • 1.5 hrs", price: "₹1,199/day" },
                    { from: "Pune", to: "Nashik", distance: "210 km • 5 hrs", price: "₹1,999/day" },
                ],

                faqs: [
                    {
                        q: "How does the daily outstation billing work?",
                        a: "Outstation billing is calculated on a calendar day basis (Midnight to Midnight). If you leave at 8 AM on Saturday and return at 8 PM on Sunday, it counts as 2 days.",
                    },
                    {
                        q: "Do I need to arrange accommodation for the driver?",
                        a: "You don't necessarily have to book a hotel room. A simple blanket and permission to sleep in the car is fine. If you prefer, a ₹300/night allowance can be provided instead.",
                    },
                    {
                        q: "Is there a night driving charge?",
                        a: "Yes, if the driver is required to drive between 10 PM and 6 AM, a standard night allowance of ₹200 applies per night.",
                    },
                    {
                        q: "What if the driver gets pulled over or there's an accident?",
                        a: "We provide comprehensive driving instructions and verify all licenses. However, since they are driving your vehicle, your car's insurance covers any vehicle damages. Traffic challans resulting specifically from driver negligence will be reimbursed by us.",
                    },
                ],
            }}
        />
    );
}
