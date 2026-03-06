import { Users, Building2, PartyPopper } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Social Events",
    desc: "Birthday parties, family gatherings, baby showers, graduation celebrations and cocktail parties.",
  },
  {
    icon: Building2,
    title: "Corporate Events",
    desc: "Complete food preparation and presentation for corporate and business events of any scale.",
  },
  {
    icon: PartyPopper,
    title: "Special Events",
    desc: "Personal touches to your special event. Let us help make your party unforgettable for friends and family!",
  },
];

const ServicesSection = () => (
  <section id="services" className="py-20 bg-background">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">Catering Services</h2>
      <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
        Our expert culinary chefs offer exquisite catering services for any events or functions.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.title} className="p-8 rounded-lg bg-cream border border-border hover:shadow-lg transition-shadow group">
            <service.icon className="w-12 h-12 text-gold mx-auto mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-display font-semibold text-foreground mb-3">{service.title}</h3>
            <p className="text-muted-foreground text-sm">{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
