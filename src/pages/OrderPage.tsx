import { useState, useMemo } from "react";
import PageHero from "@/components/PageHero";
import { trayPriceCategories } from "@/data/menuData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Plus, Minus, Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  name: string;
  category: string;
  price: string;
  quantity: number;
  size: string;
}

const OrderPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const addToCart = (name: string, category: string, price: string, size: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.name === name && c.size === size);
      if (existing) {
        return prev.map((c) =>
          c.name === name && c.size === size ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { name, category, price, quantity: 1, size }];
    });
    toast({ title: "Added to cart", description: `${name} (${size})` });
  };

  const updateQuantity = (name: string, size: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.name === name && c.size === size ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (name: string, size: string) => {
    setCart((prev) => prev.filter((c) => !(c.name === name && c.size === size)));
  };

  const totalItems = cart.reduce((sum, c) => sum + c.quantity, 0);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, c) => {
      const price = parseFloat(c.price.replace("$", ""));
      return sum + price * c.quantity;
    }, 0);
  }, [cart]);

  const handleSubmitOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({
      title: "Order Submitted!",
      description: "We'll get back to you shortly to confirm your order.",
    });
    setCart([]);
    setShowForm(false);
  };

  const currentCat = trayPriceCategories[activeTab];
  const half = Math.ceil(currentCat.items.length / 2);
  const leftCol = currentCat.items.slice(0, half);
  const rightCol = currentCat.items.slice(half);

  return (
    <>
      <PageHero title="Order Online" />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── Left: Menu Table ── */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">Select Your Items</h2>

              {/* Tab Bar */}
              <div className="flex flex-wrap border-t-2 border-b-2 border-primary">
                {trayPriceCategories.map((cat, idx) => (
                  <button
                    key={cat.slug}
                    onClick={() => setActiveTab(idx)}
                    className={`
                      flex-1 min-w-[110px] py-4 px-2 text-xs font-bold uppercase tracking-widest
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

              {/* Two-Column Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0 bg-white">

                {/* Left Column */}
                <div className="divide-y divide-border md:border-r md:border-border">
                  {leftCol.map((item) => {
                    const sizeLabel = typeof item.sizes[0] === "string" ? item.sizes[0] : (item.sizes[0] as any).size;
                    const sizePrice = typeof item.sizes[0] === "string" ? item.price ?? "" : (item.sizes[0] as any).price;
                    return (
                      <div key={item.name} className="px-6 py-4 hover:bg-cream/60 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-display font-semibold text-foreground text-base">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.sizes.map((size) => {
                            const label = typeof size === "string" ? size : (size as any).size;
                            const price = typeof size === "string" ? item.price ?? "" : (size as any).price;
                            return (
                              <Button
                                key={label}
                                size="sm"
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                                onClick={() => addToCart(item.name, item.category, price, label)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {label} · {price}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Column */}
                <div className="divide-y divide-border">
                  {rightCol.map((item) => (
                    <div key={item.name} className="px-6 py-4 hover:bg-cream/60 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-display font-semibold text-foreground text-base">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.sizes.map((size) => {
                          const label = typeof size === "string" ? size : (size as any).size;
                          const price = typeof size === "string" ? item.price ?? "" : (size as any).price;
                          return (
                            <Button
                              key={label}
                              size="sm"
                              variant="outline"
                              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                              onClick={() => addToCart(item.name, item.category, price, label)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              {label} · {price}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* ── Right: Cart Sidebar ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-cream border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-display font-bold text-primary">Your Cart</h3>
                  {totalItems > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </div>

                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Your cart is empty. Add items from the menu.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {cart.map((item) => (
                        <div key={`${item.name}-${item.size}`} className="bg-background rounded-md p-3 border border-border">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-medium text-foreground text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.size} · {item.price}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.name, item.size)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.name, item.size, -1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.name, item.size, 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                            <span className="ml-auto text-gold font-bold text-sm">
                              ${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border mt-4 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-display font-bold text-lg text-foreground">Total:</span>
                        <span className="font-display font-bold text-2xl text-gold">${totalPrice.toFixed(2)}</span>
                      </div>

                      {!showForm ? (
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-maroon-dark"
                          size="lg"
                          onClick={() => setShowForm(true)}
                        >
                          Proceed to Order
                        </Button>
                      ) : (
                        <form onSubmit={handleSubmitOrder} className="space-y-3">
                          <Input placeholder="Your Name *" required />
                          <Input type="email" placeholder="Email *" required />
                          <Input type="tel" placeholder="Phone *" required />
                          <Input type="date" placeholder="Event Date" />
                          <Textarea placeholder="Special instructions or delivery details..." rows={3} />
                          <Button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground hover:bg-maroon-dark"
                            size="lg"
                          >
                            <Send className="w-4 h-4 mr-2" /> Submit Order
                          </Button>
                        </form>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default OrderPage;