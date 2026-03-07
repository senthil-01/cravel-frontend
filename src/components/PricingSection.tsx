import expressImg from "@/assets/package-express.jpg";
import ultimateImg from "@/assets/package-ultimate.jpg";
import specialtyImg from "@/assets/package-specialty.jpg";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const packages = [
  {
    name: "Express Package",
    price: 20,
    image: expressImg,
    items: ["1 Appetizer", "1 Veg Entrée", "1 Chicken Entrée", "1 Naan", "Basmati Rice", "Mint Chutney", "Tamarind Chutney"],
  },
  {
    name: "Ultimate Package",
    price: 24,
    image: ultimateImg,
    featured: true,
    items: ["2 Appetizers (1 Veg, 1 Chicken)", "3 Entrées (1 Veg, 1 Paneer, 1 Chicken)", "1 Naan", "Biryani (Veg or Chicken)", "1 Dessert", "Raita", "Mint & Tamarind Chutney"],
  },
  {
    name: "Specialty Package",
    price: 28,
    image: specialtyImg,
    items: ["2 Appetizers (1 Veg, 1 Non-Veg)", "4 Entrées (Veg, Paneer, Chicken, Lamb/Goat/Fish)", "1 Naan", "Biryani (Veg, Chicken, or Goat)", "2 Desserts", "Raita", "Mint & Tamarind Chutney"],
  },
];

const PricingSection = () => (
  <section id="pricing" className="py-20 bg-cream">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">Pricing Options<br /></h2>
      <p className="text-muted-foreground text-sm mb-12">Check out the price for getting a professional catering plan completed to suit you and your guests.
        <br />Minimum quantity to order from Corporate Catering package is 30. *T&C Apply. *Price Subject To Change</p>
      <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
          Corporate Catering Package Menu
        </h2>
      <p className="text-muted-foreground text-sm mb-12">Min – 30 Guests and 7 days in advance. Pick up from restaurant.</p>
      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {packages.map((pkg) => (
          <div
            key={pkg.name}
            className={`rounded-lg overflow-hidden bg-background shadow-md flex flex-col ${
              pkg.featured ? "ring-2 ring-gold scale-[1.02]" : ""
            }`}
          >
            <div className="h-48 overflow-hidden">
              <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <h4 className="font-display font-semibold text-lg text-primary">{pkg.name}</h4>
              <div className="my-4">
                <span className="text-4xl font-display font-bold text-gold">${pkg.price}</span>
                <span className="text-muted-foreground text-sm">/person</span>
              </div>
              <ul className="text-left space-y-2 flex-1">
                {pkg.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
