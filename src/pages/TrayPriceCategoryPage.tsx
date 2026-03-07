import { useParams, Link } from "react-router-dom";
import { useState, useMemo } from "react";
import PageHero from "@/components/PageHero";
import { getCategoryBySlug, MenuItem } from "@/data/menuData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const ItemCard = ({ item }: { item: MenuItem }) => {
  const [selectedSize, setSelectedSize] = useState(item.sizes[0]);

  return (
    <div className="bg-cream rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-display font-semibold text-lg text-primary mb-1">{item.name}</h4>
      <p className="text-muted-foreground text-sm mb-4">{item.category}</p>

      <div className="mb-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Size:</span>
        <div className="flex gap-2 mt-1">
          {item.sizes.map((s) => {
            const sizeKey = typeof s === "string" ? s : s.size;
            return (
              <span
                key={sizeKey}
                onClick={() => setSelectedSize(s)}
                className={`px-3 py-1 text-xs rounded-full font-medium cursor-pointer ${
                  (typeof selectedSize === "string" ? selectedSize : selectedSize.size) === sizeKey
                    ? "bg-primary text-white"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {sizeKey}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Price:</span>
        <span className="text-xl font-display font-bold text-gold">
          {typeof selectedSize === "string" ? item.price ?? "N/A" : selectedSize.price}
        </span>
      </div>
    </div>
  );
};

const TrayPriceCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || "");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const subCategories = useMemo(() => {
    if (!category) return [];
    return [...new Set(category.items.map((i) => i.category))];
  }, [category]);

  const filteredItems = useMemo(() => {
    if (!category) return [];
    return category.items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "all" || item.category === filter;
      return matchesSearch && matchesFilter;
    });
  }, [category, search, filter]);

  if (!category) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Category Not Found</h2>
        <Link to="/tray-prices" className="text-gold hover:underline">← Back to Tray Prices</Link>
      </div>
    );
  }

  return (
    <>
      <PageHero title={category.title} />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {subCategories.map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
                <ItemCard key={item.name} item={item} />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No items found matching your search.</p>
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
