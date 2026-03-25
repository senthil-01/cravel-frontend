import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
import { ArrowRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryStat {
  title: string;
  slug: string;
  count: number;
  fromPrice: number | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { title: string; slug: string; apiCategory: string; emoji: string }[] = [
  { title: "Appetizer", slug: "appetizers", apiCategory: "Appetizer", emoji: "🍢" },
  { title: "Entree",     slug: "entree",     apiCategory: "Entree",     emoji: "🍛" },
  { title: "Rice",       slug: "rice",       apiCategory: "Rice",       emoji: "🍚" },
  { title: "Bread",      slug: "bread",      apiCategory: "Bread",      emoji: "🫓" },
  { title: "Dessert",    slug: "dessert",    apiCategory: "Dessert",    emoji: "🍮" },
];

//const API_BASE = "http://127.0.0.1:8000/api/v1/menu-items/";

const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1/menu-items/`;



// ── API ───────────────────────────────────────────────────────────────────────

interface FetchResult { count: number; fromPrice: number | null }

const fetchCategoryStats = async (apiCategory: string): Promise<FetchResult> => {
  const params = new URLSearchParams({ category: apiCategory });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) return { count: 0, fromPrice: null };
  const data = await res.json();
  const items: any[] = Array.isArray(data) ? data : (data.data ?? data.results ?? []);
  const active = items.filter((d) => d.isActive);

  // Collect all prices: piece price + tray S/M/L
  const prices: number[] = [];
  active.forEach((d) => {
    if (d.sellByCount && d.price != null)       prices.push(d.price);
    if (!d.sellByCount && d.trayPrice) {
      if (d.trayPrice.S != null) prices.push(d.trayPrice.S);
      if (d.trayPrice.M != null) prices.push(d.trayPrice.M);
      if (d.trayPrice.L != null) prices.push(d.trayPrice.L);
    }
  });

  const fromPrice = prices.length ? Math.min(...prices) : null;
  return { count: active.length, fromPrice };
};

// ── Page ──────────────────────────────────────────────────────────────────────

const TrayPricesPage = () => {
  const [stats, setStats] = useState<Record<string, CategoryStat>>({});

  useEffect(() => {
    CATEGORIES.forEach((cat) => {
      fetchCategoryStats(cat.apiCategory).then((result) => {
        setStats((prev) => ({
          ...prev,
          [cat.slug]: { title: cat.title, slug: cat.slug, ...result },
        }));
      });
    });
  }, []);

  return (
    <>
      <PageHero title="Tray Prices" />
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/tray-prices/${cat.slug}`}
                className="group bg-cream rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-border"
              >
                <div className="h-48 bg-primary/10 flex items-center justify-center">
                  <span className="text-6xl">{cat.emoji}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-display font-semibold text-primary mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-1">
                    {stats[cat.slug] !== undefined
                      ? `${stats[cat.slug].count} items available`
                      : "Loading…"}
                  </p>
                  <p className="text-gold font-display font-semibold text-sm mb-3">
                    {stats[cat.slug]?.fromPrice != null
                      ? `from $${stats[cat.slug].fromPrice!.toLocaleString("en-US")}`
                      : ""}
                  </p>
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
};

export default TrayPricesPage;