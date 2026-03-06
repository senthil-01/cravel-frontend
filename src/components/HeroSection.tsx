import heroImg from "@/assets/hero-catering.jpg";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section id="home" className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
    <img src={heroImg} alt="Maya Indian Catering outdoor event" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
    <div className="relative z-10 text-center px-4">
      <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground text-shadow-hero mb-6">
        Welcome to Maya Indian Catering
      </h1>
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-maroon-dark text-base px-8">
          View Menu
        </Button>
        <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/20 text-base px-8">
          Explore Packages
        </Button>
      </div>
    </div>
  </section>
);

export default HeroSection;
