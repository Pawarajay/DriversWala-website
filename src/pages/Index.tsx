import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Services from "@/components/Services";
import Vehicles from "@/components/Vehicles";
import Testimonials from "@/components/Testimonials";
import CTABanner from "@/components/CTABanner";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => (
  <>
    <Navbar />
    <HeroSection />
    <WhyChooseUs />
    <Services />
    <Vehicles />
    <Testimonials />
    <CTABanner />
    <FAQ />
    <Footer />
    <WhatsAppButton />
  </>
);

export default Index;
