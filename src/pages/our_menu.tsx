import { useState, useEffect } from "react";
import MenuHero from "@/components/MenuHero";

// ── Types ─────────────────────────────────────────────────────────────────────

type CuisineTab = "north-indian" | "south-indian" | "indo-chinese";
type CategoryKey = "Appetizer" | "Entree" | "Rice" | "Bread" | "Dessert";

// Exact field names from menu_item_rules MongoDB collection
interface Dish {
  _id: string;
  menuName: string;
  category: string;
  style: string;           // "North Indian" | "South Indian" | "Indo Chinese"
  vegNonVeg?: "Veg" | "Non Veg";
  property?: string | null; // e.g. "Dry", "Gravy", "Tandoor" — can be null
  group?: string | null;    // e.g. "Paneer", "Chicken" — can be null
  riceType?: string | null;
  sellByCount?: boolean;
  isActive: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CUISINE_TABS: { id: CuisineTab; label: string; emoji: string; apiValue: string }[] = [
  { id: "north-indian", label: "North Indian", emoji: "🍛", apiValue: "North Indian" },
  { id: "south-indian", label: "South Indian", emoji: "🥘", apiValue: "South Indian" },
  { id: "indo-chinese", label: "Indo Chinese", emoji: "🥢", apiValue: "Indo Chinese" },
];

const CATEGORIES: CategoryKey[] = ["Appetizer", "Entree", "Rice", "Bread", "Dessert"];

//const API_BASE = "http://127.0.0.1:8000/api/v1/menu-items/";

const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1/menu-items`;
// ── API ───────────────────────────────────────────────────────────────────────

const fetchCategory = async (style: string, category: CategoryKey): Promise<Dish[]> => {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category} items.`);
  const data = await res.json();
  const all: Dish[] = Array.isArray(data) ? data : (data.data ?? data.results ?? []);
  console.log(`[${category}] total=${all.length} active=${all.filter(d=>d.isActive).length} style_match=${all.filter(d=>d.isActive && d.style===style).length} styles=${[...new Set(all.map(d=>d.style))].join(',')}`);
  return all.filter((d) => d.isActive && d.style === style);
};

// ── Grouping ──────────────────────────────────────────────────────────────────

interface DishSection {
  heading: string;
  items: Dish[];
}

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
    // Show all appetizers — no sellByCount filtering on menu page
    const hasProperty = dishes.some((d) => d.property);
    if (!hasProperty) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => d.property ?? "Other");
  }

  if (category === "Entree") {
    // Group by "Group (Property)" combined — e.g. "Paneer (Gravy)", "Chicken (Dry)"
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
    // Group by riceType (e.g. "Biryani", "Fried Rice", "Pulao")
    const hasRiceType = dishes.some((d) => d.riceType);
    if (!hasRiceType) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => d.riceType ?? "Other");
  }

  // Bread / Dessert — flat list, no heading
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

// ── Dish row ──────────────────────────────────────────────────────────────────

const DishRow = ({ item }: { item: Dish }) => (
  <div className="px-7 py-4 hover:bg-cream/60 transition-colors">
    <div className="flex items-center gap-2 flex-wrap">
      <span className="font-display font-semibold text-foreground text-base leading-snug">
        {item.menuName}
      </span>
      <VegBadge type={item.vegNonVeg} />
    </div>
  </div>
);

// ── States ────────────────────────────────────────────────────────────────────

const wrapGrid = (children: React.ReactNode) => (
  <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white min-h-[200px]">
    {children}
  </div>
);

const EmptyState  = ({ category }: { category: string }) =>
  wrapGrid(<div className="col-span-2 py-16 text-center text-muted-foreground font-body">No {category} items available for this cuisine.</div>);

const LoadingState = () =>
  wrapGrid(<div className="col-span-2 py-16 text-center text-muted-foreground font-body animate-pulse">Loading menu…</div>);

const ErrorState  = ({ message }: { message: string }) =>
  wrapGrid(<div className="col-span-2 py-16 text-center text-red-500 font-body">{message}</div>);

// ── Grouped grid ──────────────────────────────────────────────────────────────

const GroupedDishGrid = ({ sections }: { sections: DishSection[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white min-h-[200px]">
    {sections.map((section, sIdx) => {
      const half     = Math.ceil(section.items.length / 2);
      const leftCol  = section.items.slice(0, half);
      const rightCol = section.items.slice(half);
      const isFirst  = sIdx === 0;

      return (
        <div key={`${section.heading}-${sIdx}`} className="contents">

          {/* Full-width bold heading — only when heading exists */}
          {section.heading && (
            <div className={`col-span-2 px-7 pt-5 pb-2 ${!isFirst ? "border-t border-border" : ""}`}>
              <span className="text-sm font-bold uppercase tracking-wider text-foreground font-body">
                {section.heading}
              </span>
            </div>
          )}

          {/* Left column */}
          <div className={`divide-y divide-border md:border-r md:border-border ${!section.heading && !isFirst ? "border-t border-border" : ""}`}>
            {leftCol.map((item) => <DishRow key={item._id} item={item} />)}
          </div>

          {/* Right column */}
          <div className={`divide-y divide-border ${!section.heading && !isFirst ? "border-t border-border" : ""}`}>
            {rightCol.map((item) => <DishRow key={item._id} item={item} />)}
          </div>

        </div>
      );
    })}
  </div>
);

// ── CuisineTable ──────────────────────────────────────────────────────────────

const CuisineTable = ({ cuisineApiValue }: { cuisineApiValue: string }) => {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("Appetizer");
  const [dishes, setDishes]   = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDishes([]);

    fetchCategory(cuisineApiValue, activeCategory)
      .then((data) => { if (!cancelled) setDishes(data); })
      .catch((err)  => { if (!cancelled) setError(err.message ?? "Something went wrong."); })
      .finally(()   => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [cuisineApiValue, activeCategory]);

  const sections = buildSections(dishes, activeCategory);

  return (
    <>
      {/* Category tab bar */}
      <div className="flex flex-wrap border-t-2 border-b-2 border-primary mb-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-1 min-w-[100px] py-4 px-3 text-xs font-bold uppercase tracking-widest
              font-body border-r border-border last:border-r-0 transition-colors duration-200
              ${activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-primary hover:bg-primary/5"}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading           ? <LoadingState /> :
       error             ? <ErrorState message={error} /> :
       dishes.length === 0 ? <EmptyState category={activeCategory} /> :
       <GroupedDishGrid sections={sections} />}
    </>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const Index = () => {
  const [activeTab, setActiveTab] = useState<CuisineTab>("north-indian");
  const activeCuisine = CUISINE_TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-background">
      <MenuHero
        title="Our Menu"
        subtitle="Our catering menu incorporates a variety of flavors, reflecting our passion for creative food."
      />

      {/* About */}
      <section className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-6">
            BOOK YOUR CATERING ORDER FROM THE BEST INDIAN CATERERS
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed mb-8">
            NIMIR Indian Catering is your one stop solution for all catering services — corporate
            parties, buffet catering, or party catering. We extend our services to a diverse group
            of clients, always keeping our motto: "Prepared with Passion, Delivered with Pride."
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <h3 className="text-xl font-display font-semibold text-foreground text-center mb-4">
            We cater to:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Housewarming Functions", "Indian Weddings", "Corporate Events", "Cocktail Parties", "Birthday Parties"].map(
              (s) => (
                <span key={s} className="px-4 py-2 bg-secondary rounded-full text-sm font-body text-secondary-foreground">
                  {s}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="container mx-auto px-6 pb-20" id="menu">
        <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">
          Explore Our Menus
        </h2>

        {/* Cuisine tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CUISINE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-body font-semibold text-sm transition-all duration-300 border ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground border-accent shadow-lg"
                  : "bg-card text-foreground border-border hover:border-accent hover:-translate-y-0.5"
              }`}
            >
              <span className="mr-2">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* key= forces remount + resets to Appetizers when cuisine switches */}
        <div className="max-w-5xl mx-auto">
          <CuisineTable key={activeTab} cuisineApiValue={activeCuisine.apiValue} />
        </div>
      </section>
    </div>
  );
};

export default Index;