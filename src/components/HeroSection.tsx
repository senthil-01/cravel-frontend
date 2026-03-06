import heroImg from "@/assets/hero-catering.jpg";

const HeroSection = () => (
  <section id="home" className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
    <img src={heroImg} alt="Maya Indian Catering outdoor event" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
    <div className="relative z-10 text-center px-4">
      <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground text-shadow-hero mb-6">
        Welcome to Maya Indian Catering
      </h1>
    </div>
  </section>
);

export default HeroSection;
