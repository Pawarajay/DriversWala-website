import ServicePageLayout from "@/components/ServicePageLayout";
import { GraduationCap, Car, ShieldCheck, HeartHandshake } from "lucide-react";

export default function DrivingLessons() {
    return (
        <ServicePageLayout
            data={{
                badge: "Learn With Confidence",
                titleWhite: "Master Driving with",
                titleAccent: "Certified Experts",
                subtitle:
                    "From absolute beginners to nervous license holders, our patient and certified instructors help you become a confident driver in Pune & Mumbai traffic.",
                featuresBadge: "Why Learn With Us",
                featuresTitle: "Safe & Stress-Free",
                featuresTitleAccent: "Lessons",
                features: [
                    {
                        icon: HeartHandshake,
                        title: "Patient Instructors",
                        desc: "We understand driving anxiety. Our instructors teach calmly without yelling or stress.",
                    },
                    {
                        icon: Car,
                        title: "Learn in Your Car",
                        desc: "Get comfortable in the exact dimensions of the vehicle you will actually be driving daily.",
                    },
                    {
                        icon: ShieldCheck,
                        title: "Dual-Control Safety",
                        desc: "If using our training cars, we provide fully serviced vehicles with dual clutch/brake systems.",
                    },
                    {
                        icon: GraduationCap,
                        title: "License Assistance",
                        desc: "Guidance on RTO test procedures, required documents, and passing tips.",
                    },
                ],

                faqs: [
                    {
                        q: "Can I learn driving in my automatic car?",
                        a: "Yes! We highly recommend learning in the vehicle you'll be driving. Our instructors are experts at teaching on both Automatic (AMT, CVT, DSG) and Manual transmissions.",
                    },
                    {
                        q: "Do you guarantee I will get my license?",
                        a: "We guarantee you will have the skills and knowledge to pass. However, the final RTO driving test is administered by government inspectors.",
                    },
                    {
                        q: "What if I miss a scheduled class?",
                        a: "You can reschedule a class with 12 hours notice for free. Classes canceled at the last minute are deducted from your package.",
                    },
                    {
                        q: "Are the training cars insured?",
                        a: "Yes, all our dedicated training vehicles carry comprehensive commercial insurance specifically covering learner drivers.",
                    },
                ],
            }}
        />
    );
}
