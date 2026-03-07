import { Link } from "react-router-dom";
import northImg from "@/assets/north-indian.jpg";
import southImg from "@/assets/south-indian.jpg";
import internationalImg from "@/assets/international.jpg";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const cuisines = [
  {
    image: northImg,
    title: "North Indian Catering",
    desc: "Elegant modern Indian cuisine using the finest seasonal ingredients with both classic and modern techniques. A wide North Indian menu for your selection.",
    link: "/menu/north-indian",
    cta: "View Menu",
  },
  {
    image: southImg,
    title: "South Indian Catering",
    desc: "Famous for our extensive South Indian menu covering all regional specialties of Andhra, Karnataka, Kerala and Tamil Nadu.",
    link: "/menu/south-indian",
    cta: "View Menu",
  },
  {
    image: internationalImg,
    title: "International Catering",
    desc: "A unique experience with International Cuisines including Italian, Mediterranean, and Continental Veg/Vegan flavors.",
    link: "/menu/international",
    cta: "View Menu",
  },
];

const CuisineSection = () => (
  <section id="cuisine" className="py-20 bg-cream">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8">
        {cuisines.map((item) => (
          <div key={item.title} className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="h-56 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-display font-semibold text-primary mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              <Link to={item.link}>
                <Button className="mt-4 bg-primary text-primary-foreground hover:bg-maroon-dark">
                  {item.cta} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CuisineSection;
