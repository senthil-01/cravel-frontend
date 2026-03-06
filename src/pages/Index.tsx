import TopBar from "@/components/TopBar";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCards from "@/components/FeatureCards";
import StatsSection from "@/components/StatsSection";
import CuisineSection from "@/components/CuisineSection";
import ServicesSection from "@/components/ServicesSection";
import PricingSection from "@/components/PricingSection";
import AboutSection from "@/components/AboutSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BlogSection from "@/components/BlogSection";
import EventsSection from "@/components/EventsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <TopBar />
    <Navbar />
    <HeroSection />
    <FeatureCards />
    <StatsSection />
    <CuisineSection />
    <ServicesSection />
    <PricingSection />
    <AboutSection />
    <TestimonialsSection />
    <BlogSection />
    <EventsSection />
    <ContactSection />
    <Footer />
  </div>
);

export default Index;
