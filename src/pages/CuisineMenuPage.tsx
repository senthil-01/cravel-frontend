import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import { getCuisineBySlug } from "@/data/menuData";
import { Leaf } from "lucide-react";

const CuisineMenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cuisine = getCuisineBySlug(slug || "");

  const [activeTab, setActiveTab] = useState(0);

  if (!cuisine) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Menu Not Found</h2>
        <Link to="/" className="text-gold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const currentCategory = cuisine.categories[activeTab];
  const half = Math.ceil(currentCategory.items.length / 2);
  const leftCol = currentCategory.items.slice(0, half);
  const rightCol = currentCategory.items.slice(half);

  return (
    <>
      <PageHero title={cuisine.title} />

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-center text-muted-foreground mb-8 text-lg">{cuisine.subtitle}</p>

          {/* ── Tab Bar ── */}
          <div className="flex flex-wrap border-t-2 border-b-2 border-primary mb-0">
            {cuisine.categories.map((cat, idx) => (
              <button
                key={cat.title}
                onClick={() => setActiveTab(idx)}
                className={`
                  flex-1 min-w-[120px] py-4 px-3 text-xs font-bold uppercase tracking-widest
                  font-body border-r border-border last:border-r-0
                  transition-colors duration-200
                  ${activeTab === idx
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-primary hover:bg-primary/5"}
                `}
              >
                {cat.title}
              </button>
            ))}
          </div>

          {/* ── Two-Column Table ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white">

            {/* Left Column */}
            <div className="divide-y divide-border md:border-r md:border-border">
              {leftCol.map((item) => (
                <div
                  key={item.name}
                  className="px-7 py-5 hover:bg-cream/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-foreground text-base">
                      {item.name}
                    </span>
                    {item.isVeg && (
                      <Leaf className="w-3.5 h-3.5 text-accent-foreground flex-shrink-0" />
                    )}
                    {item.price && (
                      <span className="ml-auto text-gold font-display font-bold text-base">
                        {item.price}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="divide-y divide-border">
              {rightCol.map((item) => (
                <div
                  key={item.name}
                  className="px-7 py-5 hover:bg-cream/60 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-foreground text-base">
                      {item.name}
                    </span>
                    {item.isVeg && (
                      <Leaf className="w-3.5 h-3.5 text-accent-foreground flex-shrink-0" />
                    )}
                    {item.price && (
                      <span className="ml-auto text-gold font-display font-bold text-base">
                        {item.price}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* ── Back Link ── */}
          <div className="text-center mt-10">
            <Link to="/" className="text-gold font-semibold hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default CuisineMenuPage;