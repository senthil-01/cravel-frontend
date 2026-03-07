import heroImage from "@/assets/hero-menu.jpg";

interface MenuHeroProps {
  title: string;
  subtitle: string;
}

const MenuHero = ({ title, subtitle }: MenuHeroProps) => {
  return (
    <div className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
      <img
        src={heroImage}
        alt="Catering spread"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-hero-overlay/70" />
      <div className="relative z-10 container mx-auto px-6 pb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-3">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl font-body">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default MenuHero;
