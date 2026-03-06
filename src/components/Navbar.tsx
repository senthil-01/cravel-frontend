import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#cuisine" },
  { label: "Tray Sizes", href: "#services" },
  { label: "Tray Prices", href: "#pricing" },
  { label: "Blog", href: "#blog" },
  { label: "Contact Us", href: "#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <a href="#home" className="font-display text-2xl font-bold text-primary tracking-wide">
          MAYA <span className="text-gold text-sm font-body font-normal block -mt-1">Indian Bar & Grill</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-foreground hover:text-primary font-medium text-sm transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button variant="default" className="bg-primary text-primary-foreground hover:bg-maroon-dark">
            Order Now
          </Button>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Email Us
          </Button>
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-background border-t border-border px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 text-foreground hover:text-primary font-medium"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 mt-3">
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground">Order Now</Button>
            <Button variant="outline" size="sm" className="border-primary text-primary">Email Us</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
