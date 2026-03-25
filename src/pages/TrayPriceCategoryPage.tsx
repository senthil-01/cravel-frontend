import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import PageHero from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type CategorySlug = "appetizers" | "entree" | "rice" | "bread" | "dessert";

interface TrayPrice {
  S?: number | null;
  M?: number | null;
  L?: number | null;
}

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
  size?: string | null;
  price?: number | null;          // used when sellByCount=true
  trayPrice?: TrayPrice | null;   // used when sellByCount=false
  adjustmentMultiplier?: number | null;
  isActive: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<CategorySlug, { title: string; apiCategory: string }> = {
  appetizers: { title: "Appetizer", apiCategory: "Appetizer" },
  entree:     { title: "Entree",     apiCategory: "Entree"     },
  rice:       { title: "Rice",       apiCategory: "Rice"       },
  bread:      { title: "Bread",      apiCategory: "Bread"      },
  dessert:    { title: "Dessert",    apiCategory: "Dessert"    },
};

const STYLE_OPTIONS = ["North Indian", "South Indian", "Indo Chinese"];
const VEG_OPTIONS   = ["Veg", "Non Veg"];

//const API_BASE = "http://127.0.0.1:8000/api/v1/menu-items/";



const BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE}/api/v1/menu-items`;
// ── API ───────────────────────────────────────────────────────────────────────

const fetchItems = async (category: string): Promise<Dish[]> => {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category} items.`);
  const data = await res.json();
  const all: Dish[] = Array.isArray(data) ? data : (data.data ?? data.results ?? []);
  return all.filter((d) => d.isActive);
};

// ── Pricing helpers ───────────────────────────────────────────────────────────

const fmt = (val?: number | null) =>
  val != null ? `₹${val.toLocaleString("en-IN")}` : null;

// For sellByCount=true: show price per piece
const PiecePrice = ({ price }: { price?: number | null }) => {
  const display = fmt(price);
  if (!display) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
      <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
        Price / piece
      </span>
      <span className="text-lg font-display font-bold text-gold">{display}</span>
    </div>
  );
};

// For sellByCount=false: show trayPrice small / medium / large
const TrayPriceDisplay = ({ trayPrice }: { trayPrice?: TrayPrice | null }) => {
  if (!trayPrice) return null;
  const rows = [
    { label: "Small",  val: trayPrice.S  },
    { label: "Medium", val: trayPrice.M },
    { label: "Large",  val: trayPrice.L  },
  ].filter((r) => r.val != null);
  if (!rows.length) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border space-y-1">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">
            {r.label}
          </span>
          <span className="text-base font-display font-bold text-gold">{fmt(r.val)}</span>
        </div>
      ))}
    </div>
  );
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

const SizeBadge = ({ size }: { size?: string | null }) => {
  if (!size) return null;
  return (
    <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border text-amber-700 border-amber-400 bg-amber-50">
      {size}
    </span>
  );
};

// ── Item Card ─────────────────────────────────────────────────────────────────

const ItemCard = ({ item, slug }: { item: Dish; slug: CategorySlug }) => {
  const showSize =
    slug === "dessert" || (slug === "appetizers" && !!item.sellByCount);

  return (
    <div className="bg-cream rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-display font-semibold text-lg text-primary mb-2">
        {item.menuName}
      </h4>

      {showSize && item.size && (
        <div className="mb-2">
          <SizeBadge size={item.size} />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-1">
        <VegBadge type={item.vegNonVeg} />
      </div>

      {/* Pricing */}
      {item.sellByCount
        ? <PiecePrice price={item.price} />
        : <TrayPriceDisplay trayPrice={item.trayPrice} />
      }
    </div>
  );
};

// ── Section heading ───────────────────────────────────────────────────────────

const SectionHeading = ({ label }: { label: string }) => (
  <div className="col-span-full mb-2 mt-6 first:mt-0">
    <span className="text-sm font-bold uppercase tracking-wider text-foreground font-body">
      {label}
    </span>
    <div className="h-px bg-border mt-1" />
  </div>
);

// ── Grouping ──────────────────────────────────────────────────────────────────

interface Section { heading: string; items: Dish[] }

const buildSections = (dishes: Dish[], slug: CategorySlug): Section[] => {
  const groupBy = (list: Dish[], keyFn: (d: Dish) => string): Section[] => {
    const order: string[] = [];
    const map = new Map<string, Dish[]>();
    for (const dish of list) {
      const key = keyFn(dish) || "Other";
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key)!.push(dish);
    }
    return order.map((k) => ({ heading: k, items: map.get(k)! }));
  };

  if (slug === "appetizers") {
    const hasProperty = dishes.some((d) => d.property);
    if (!hasProperty) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => d.property ?? "Other");
  }

  if (slug === "entree") {
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

  if (slug === "rice") {
    const hasRiceType = dishes.some((d) => d.riceType);
    if (!hasRiceType) return [{ heading: "", items: dishes }];
    return groupBy(dishes, (d) => d.riceType ?? "Other");
  }

  return dishes.length ? [{ heading: "", items: dishes }] : [];
};

// ── Page ──────────────────────────────────────────────────────────────────────

const TrayPriceCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const meta = CATEGORY_META[slug as CategorySlug] ?? null;

  const [allDishes, setAllDishes]   = useState<Dish[]>([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const [search,          setSearch]          = useState("all");
  const [styleFilter,     setStyleFilter]     = useState("all");
  const [vegFilter,       setVegFilter]       = useState("all");
  const [groupFilter,     setGroupFilter]     = useState("all");
  const [propertyFilter,  setPropertyFilter]  = useState("all");

  useEffect(() => {
    if (!meta) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAllDishes([]);
    setSearch("");
    setStyleFilter("all");
    setVegFilter("all");
    setGroupFilter("all");
    setPropertyFilter("all");

    fetchItems(meta.apiCategory)
      .then((data) => { 
        console.log(`[TrayCategory] ${meta.apiCategory} fetched ${data.length} items`);
        if (!cancelled) setAllDishes(data); 
      })
      .catch((err)  => { if (!cancelled) setError(err.message ?? "Something went wrong."); })
      .finally(()   => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  // Dynamic group options for Entree
  const groupOptions = useMemo(() => {
    if (slug !== "entree") return [];
    const groups = new Set<string>();
    allDishes.forEach((d) => { if (d.group) groups.add(d.group); });
    return Array.from(groups).sort();
  }, [allDishes, slug]);

  // Dynamic property options for Appetizers
  const propertyOptions = useMemo(() => {
    if (slug !== "appetizers") return [];
    const props = new Set<string>();
    allDishes.forEach((d) => { if (d.property) props.add(d.property); });
    return Array.from(props).sort();
  }, [allDishes, slug]);

  const filteredDishes = useMemo(() => {
    return allDishes.filter((d) => {
      const matchSearch    = d.menuName.toLowerCase().includes(search.toLowerCase());
      const matchStyle     = styleFilter    === "all" || d.style     === styleFilter;
      const matchVeg       = vegFilter      === "all" || d.vegNonVeg === vegFilter;
      const matchGroup     = groupFilter    === "all" || d.group     === groupFilter;
      const matchProperty  = propertyFilter === "all" || d.property  === propertyFilter;
      return matchSearch && matchStyle && matchVeg && matchGroup && matchProperty;
    });
  }, [allDishes, search, styleFilter, vegFilter, groupFilter, propertyFilter]);

  const sections = useMemo(
    () => buildSections(filteredDishes, slug as CategorySlug),
    [filteredDishes, slug]
  );

  if (!meta) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Category Not Found</h2>
        <Link to="/tray-prices" className="text-gold hover:underline">← Back to Tray Prices</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero title={meta.title} />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-3xl mx-auto flex-wrap">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={styleFilter === "all" ? undefined : styleFilter} onValueChange={(v) => setStyleFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                {STYLE_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={vegFilter === "all" ? undefined : vegFilter} onValueChange={(v) => setVegFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Veg / Non Veg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {VEG_OPTIONS.map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Property dropdown — Appetizers only, dynamic */}
            {slug === "appetizers" && propertyOptions.length > 0 && (
              <Select value={propertyFilter === "all" ? undefined : propertyFilter} onValueChange={(v) => setPropertyFilter(v ?? "all")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyOptions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Group dropdown — Entree only, dynamic */}
            {slug === "entree" && groupOptions.length > 0 && (
              <Select value={groupFilter === "all" ? undefined : groupFilter} onValueChange={(v) => setGroupFilter(v ?? "all")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groupOptions.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <p className="text-center text-muted-foreground py-16 animate-pulse">Loading…</p>
          ) : error ? (
            <p className="text-center text-red-500 py-16">{error}</p>
          ) : filteredDishes.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">
              No items found matching your search.
            </p>
          ) : (
            sections.map((section, sIdx) => (
              <div key={`${section.heading}-${sIdx}`}>
                {section.heading && <SectionHeading label={section.heading} />}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {section.items.map((item) => (
                    <ItemCard key={item._id} item={item} slug={slug as CategorySlug} />
                  ))}
                </div>
              </div>
            ))
          )}

          <div className="text-center mt-10">
            <Link to="/tray-prices" className="text-gold font-semibold hover:underline">
              ← Back to All Categories
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default TrayPriceCategoryPage;