import ServicePageLayout from "@/components/ServicePageLayout";
import { Award, Glasses, ShieldCheck, Ticket } from "lucide-react";

export default function ValetEventServices() {
    return (
        <ServicePageLayout
            data={{
                badge: "Premium Guest Experience",
                titleWhite: "Valet & Event",
                titleAccent: "Services",
                subtitle:
                    "Hosting a wedding, corporate gala, or private party? Ensure your guests arrive and leave seamlessly with our professional valet parking and event chauffeur teams.",
                featuresBadge: "Luxury Service",
                featuresTitle: "First Impressions",
                featuresTitleAccent: "Matter",
                features: [
                    {
                        icon: Glasses,
                        title: "Professional Attire",
                        desc: "All valets wear sharp uniforms, ensuring a premium first touchpoint for your guests.",
                    },
                    {
                        icon: ShieldCheck,
                        title: "Secure Parking",
                        desc: "Trained to handle luxury vehicles securely, with proper token and key management systems.",
                    },
                    {
                        icon: Ticket,
                        title: "Complete Management",
                        desc: "We provide valet desks, branded tickets, traffic cones, and directional signage.",
                    },
                    {
                        icon: Award,
                        title: "VIP Chauffeurs",
                        desc: "Dedicated personal chauffeurs for VIP guests, speakers, or the bridal couple.",
                    },
                ],

                faqs: [
                    {
                        q: "How many valets do I need for my event?",
                        a: "A standard rule of thumb is 1 valet driver per 25 expected cars. If parking is far from the venue, you may need more to ensure guests aren't kept waiting.",
                    },
                    {
                        q: "Do you provide parking tags/tokens?",
                        a: "Yes! Our standard event packages (Wedding & Corporate) include a professional valet desk, key lockboxes, and 3-part custom valet tickets.",
                    },
                    {
                        q: "Are the valets trained to drive luxury / automatic cars?",
                        a: "Absolutely. Our event teams consist of our highest-rated drivers who are specifically trained to handle Audis, BMWs, Mercedes, and exotic vehicles securely.",
                    },
                    {
                        q: "What happens if a guest's car gets scratched?",
                        a: "Our drivers are extremely careful. However, in the rare event of damage proven to be our driver's fault while parking, our comprehensive liability policy covers the deductible.",
                    },
                ],
            }}
        />
    );
}
