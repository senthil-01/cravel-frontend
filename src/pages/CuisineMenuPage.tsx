import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PageHero from "@/components/PageHero";

// ── Types ─────────────────────────────────────────────────────────────────────

type CuisineSlug = "north-indian" | "south-indian" | "indo-chinese";
type CategoryKey = "Appetizer" | "Entree" | "Rice" | "Bread" | "Dessert";

interface Dish {
  _id: string;
  menuName: string;
  category: string;
  style: string;
  vegNonVeg?: "Veg" | "Non Veg";
  property?: string | null;
  group?: string | null;
  riceType?: string | null;
  sellByCount?: boolean;
  isActive: boolean;
}

interface DishSection {
  heading: string;
  items: Dish[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CUISINE_META: Record<CuisineSlug, { title: string; subtitle: string; apiValue: string }> = {
  "north-indian": {
    title: "North Indian",
    subtitle: "Rich curries, tandoor specialties and breads from the heart of India.",
    apiValue: "North Indian",
  },
  "south-indian": {
    title: "South Indian",
    subtitle: "Aromatic rice dishes, crispy dosas and traditional Chettinad flavors.",
    apiValue: "South Indian",
  },
  "indo-chinese": {
    title: "Indo Chinese",
    subtitle: "Bold Indo-Chinese flavors with a desi twist.",
    apiValue: "Indo Chinese",
  },
};

const CATEGORIES: CategoryKey[] = ["Appetizer", "Entree", "Rice", "Bread", "Dessert"];



const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1/menu-items/`;

// ── API ───────────────────────────────────────────────────────────────────────

const fetchCategory = async (style: string, category: CategoryKey): Promise<Dish[]> => {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category} items.`);
  const data = await res.json();
  const all: Dish[] = Array.isArray(data) ? data : (data.data ?? data.results ?? []);
  return all.filter((d) => d.isActive && d.style === style);
};

// ── Grouping ──────────────────────────────────────────────────────────────────

const buildSections = (dishes: Dish[], category: CategoryKey): DishSection[] => {
  const groupBy = (list: Dish[], keyFn: (d: Dish) => string): DishSection[] => {
    const order: string[] = [];
    const map = new Map<string, Dish[]>();
    for (const dish of list) {
      const key = keyFn(dish) || "Other";
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key)!.push(dish);
    }
    return order.map((key) => ({ heading: key, items: map.get(key)! }));
  };

  if (category === "Appetizer") {
    const hasProperty = dishes.some((d) => d.property);
    if (!hasProperty) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => d.property ?? "Other");
  }

  if (category === "Entree") {
    const hasGrouping = dishes.some((d) => d.group || d.property);
    if (!hasGrouping) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => {
      const grp  = d.group    ?? null;
      const prop = d.property ?? null;
      if (grp && prop) return `${grp} (${prop})`;
      if (grp)         return grp;
      if (prop)        return prop;
      return "Other";
    });
  }

  if (category === "Rice") {
    const hasRiceType = dishes.some((d) => d.riceType);
    if (!hasRiceType) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => d.riceType ?? "Other");
  }

  return dishes.length ? [{ heading: "", items: dishes }] : [];
};

// ── Badges ────────────────────────────────────────────────────────────────────

const VegBadge = ({ type }: { type?: string | null }) => {
  if (!type) return null;
  const isVeg = type === "Veg";
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
        isVeg
          ? "text-green-700 border-green-400 bg-green-50"
          : "text-red-700 border-red-400 bg-red-50"
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-500" : "bg-red-500"}`} />
      {type}
    </span>
  );
};

// ── Dish row — original UI preserved ─────────────────────────────────────────

const DishRow = ({ item }: { item: Dish }) => (
  <div className="px-7 py-5 hover:bg-cream/60 transition-colors">
    <div className="flex items-center gap-2 mb-1">
      <span className="font-display font-semibold text-foreground text-base">
        {item.menuName}
      </span>
    </div>
    <VegBadge type={item.vegNonVeg} />
  </div>
);

// ── Section heading ───────────────────────────────────────────────────────────

const SectionHeading = ({ label, isFirst }: { label: string; isFirst: boolean }) => (
  <div className={`col-span-2 px-7 pt-5 pb-2 ${!isFirst ? "border-t border-border" : ""}`}>
    <span className="text-sm font-bold uppercase tracking-wider text-foreground font-body">
      {label}
    </span>
  </div>
);

// ── Grouped two-column grid ───────────────────────────────────────────────────

const GroupedDishGrid = ({ sections }: { sections: DishSection[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white">
    {sections.map((section, sIdx) => {
      const half     = Math.ceil(section.items.length / 2);
      const leftCol  = section.items.slice(0, half);
      const rightCol = section.items.slice(half);
      const isFirst  = sIdx === 0;

      return (
        <div key={`${section.heading}-${sIdx}`} className="contents">
          {section.heading && <SectionHeading label={section.heading} isFirst={isFirst} />}

          <div className={`divide-y divide-border md:border-r md:border-border ${!section.heading && !isFirst ? "border-t border-border" : ""}`}>
            {leftCol.map((item) => <DishRow key={item._id} item={item} />)}
          </div>

          <div className={`divide-y divide-border ${!section.heading && !isFirst ? "border-t border-border" : ""}`}>
            {rightCol.map((item) => <DishRow key={item._id} item={item} />)}
          </div>
        </div>
      );
    })}
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const CuisineMenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cuisineMeta = CUISINE_META[slug as CuisineSlug] ?? null;

  const [activeTab, setActiveTab]   = useState<CategoryKey>("Appetizer");
  const [dishes, setDishes]         = useState<Dish[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    if (!cuisineMeta) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDishes([]);

    fetchCategory(cuisineMeta.apiValue, activeTab)
      .then((data) => { if (!cancelled) setDishes(data); })
      .catch((err)  => { if (!cancelled) setError(err.message ?? "Something went wrong."); })
      .finally(()   => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [cuisineMeta, activeTab]);

  if (!cuisineMeta) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Menu Not Found</h2>
        <Link to="/" className="text-gold hover:underline">← Back to Home</Link>
      </div>
    );
  }

  const sections = buildSections(dishes, activeTab);

  return (
    <>
      <PageHero title={cuisineMeta.title} />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <p className="text-center text-muted-foreground mb-8 text-lg">
            {cuisineMeta.subtitle}
          </p>

          {/* Tab Bar — original UI */}
          <div className="flex flex-wrap border-t-2 border-b-2 border-primary mb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`
                  flex-1 min-w-[120px] py-4 px-3 text-xs font-bold uppercase tracking-widest
                  font-body border-r border-border last:border-r-0 transition-colors duration-200
                  ${activeTab === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-transparent text-primary hover:bg-primary/5"}
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white min-h-[200px]">
              <div className="col-span-2 py-16 text-center text-muted-foreground font-body animate-pulse">
                Loading menu…
              </div>
            </div>
          ) : error ? (
            <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white min-h-[200px]">
              <div className="col-span-2 py-16 text-center text-red-500 font-body">{error}</div>
            </div>
          ) : dishes.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white min-h-[200px]">
              <div className="col-span-2 py-16 text-center text-muted-foreground font-body">
                No {activeTab} items available.
              </div>
            </div>
          ) : (
            <GroupedDishGrid sections={sections} />
          )}

          <div className="text-center mt-10">
            <Link to="/" className="text-gold font-semibold hover:underline">← Back to Home</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default CuisineMenuPage;