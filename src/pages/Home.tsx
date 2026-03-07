import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import StatsSection from "@/components/StatsSection";
import CuisineSection from "@/components/CuisineSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import EventsSection from "@/components/EventsSection";

const Home = () => (
  <>
    <HeroSection />
    <FeatureCards />
    <StatsSection />
    <CuisineSection />
    <ServicesSection />
    <div id="pricing">
    <PricingSection />
    </div>
    <AboutSection />
    <TestimonialsSection />
    <EventsSection />
  </>
);

export default Home;
