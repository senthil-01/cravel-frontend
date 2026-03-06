import { useState, useMemo } from "react";
import PageHero from "@/components/PageHero";
import { trayPriceCategories } from "@/data/menuData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  return (
    <>
      <PageHero title="Order Online" />
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-display font-bold text-primary mb-6">Select Your Items</h2>
              <Accordion type="multiple" className="space-y-3">
                {trayPriceCategories.map((cat) => (
                  <AccordionItem
                    key={cat.slug}
                    value={cat.slug}
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
                            className="flex items-center justify-between px-6 py-3 hover:bg-background/50 transition-colors gap-4"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-foreground">{item.name}</span>
                              <p className="text-xs text-muted-foreground">{item.category}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-end">
                              <span className="text-gold font-display font-bold">{item.price}</span>
                              {item.sizes.map((size) => (
                                <Button
                                  key={size}
                                  size="sm"
                                  variant="outline"
                                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs"
                                  onClick={() => addToCart(item.name, item.category, item.price, size)}
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  {size}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Cart Sidebar */}
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
                  <p className="text-muted-foreground text-sm text-center py-8">Your cart is empty. Add items from the menu.</p>
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
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.name, item.size, -1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.name, item.size, 1)}
                            >
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
