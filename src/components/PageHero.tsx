import heroImg from "@/assets/hero-catering.jpg";

interface PageHeroProps {
  title: string;
}

const PageHero = ({ title }: PageHeroProps) => (
  <section className="relative h-[50vh] min-h-[350px] flex items-end overflow-hidden">
    <img src={heroImg} alt={title} className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
    <div className="relative z-10 container mx-auto px-4 pb-12">
      <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground text-shadow-hero">
        {title}
      </h1>
    </div>
  </section>
);

export default PageHero;
