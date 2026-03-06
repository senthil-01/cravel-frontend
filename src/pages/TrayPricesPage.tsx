import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import { trayPriceCategories } from "@/data/menuData";
import { ArrowRight } from "lucide-react";

const TrayPricesPage = () => (
  <>
    <PageHero title="Tray Prices" />
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trayPriceCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/tray-prices/${cat.slug}`}
              className="group bg-cream rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border"
            >
              <div className="h-48 bg-primary/10 flex items-center justify-center">
                <span className="text-6xl">🍛</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-display font-semibold text-primary mb-2">{cat.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{cat.items.length} items available</p>
                <span className="inline-flex items-center gap-1 text-gold font-semibold text-sm group-hover:gap-2 transition-all">
                  View Items <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default TrayPricesPage;
