import { useParams, Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import { getCuisineBySlug } from "@/data/menuData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf } from "lucide-react";

const CuisineMenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cuisine = getCuisineBySlug(slug || "");

  if (!cuisine) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Menu Not Found</h2>
        <Link to="/" className="text-gold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero title={cuisine.title} />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-center text-muted-foreground mb-10 text-lg">{cuisine.subtitle}</p>

          <Accordion type="multiple" className="space-y-3">
            {cuisine.categories.map((cat) => (
              <AccordionItem
                key={cat.title}
                value={cat.title}
                className="border border-border rounded-lg overflow-hidden bg-cream px-0"
              >
                <AccordionTrigger className="px-6 py-4 text-lg font-display font-semibold text-primary hover:no-underline hover:bg-primary/5">
                  {cat.title}
                  <span className="ml-2 text-sm font-body font-normal text-muted-foreground">
                    ({cat.items.length} items)
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="divide-y divide-border">
                    {cat.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between px-6 py-3 hover:bg-background/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{item.name}</span>
                            {item.isVeg && (
                              <Leaf className="w-3.5 h-3.5 text-accent-foreground" />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          )}
                        </div>
                        {item.price && (
                          <span className="text-gold font-display font-bold text-lg ml-4">{item.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

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
