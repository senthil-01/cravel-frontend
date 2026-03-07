import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trayPriceCategories } from "@/data/menuData";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "Tray Sizes", href: "/tray-sizes" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [trayDropdownOpen, setTrayDropdownOpen] = useState(false);
  const [mobileTrayOpen, setMobileTrayOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;
  const isTrayPriceActive = location.pathname.startsWith("/tray-prices");

  return (
    <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="font-display text-2xl font-bold text-primary tracking-wide">
          NIMIR <span className="text-gold text-sm font-body font-normal block -mt-1">Indian Bar & Grill</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`font-medium text-sm transition-colors ${
                isActive(link.href) ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Tray Prices Dropdown — closes when mouse leaves the whole area */}
          <div
            className="relative"
            onMouseLeave={() => setTrayDropdownOpen(false)}
          >
            <button
              onClick={() => setTrayDropdownOpen(!trayDropdownOpen)}
              onMouseEnter={() => setTrayDropdownOpen(true)}
              className={`font-medium text-sm transition-colors inline-flex items-center gap-1 ${
                isTrayPriceActive ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Tray Prices <ChevronDown className={`w-3.5 h-3.5 transition-transform ${trayDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {trayDropdownOpen && (
              <div className="absolute top-full left-0  w-56 bg-background border border-border rounded-md shadow-lg py-2 z-50">
                {trayPriceCategories.map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/tray-prices/${cat.slug}`}
                    onClick={() => setTrayDropdownOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      location.pathname === `/tray-prices/${cat.slug}`
                        ? "text-primary-foreground bg-primary"
                        : "text-foreground hover:text-primary-foreground hover:bg-primary/80"
                    }`}
                  >
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/blog"
            className={`font-medium text-sm transition-colors ${
              isActive("/blog") ? "text-primary" : "text-foreground hover:text-primary"
            }`}
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className={`font-medium text-sm transition-colors ${
              isActive("/contact") ? "text-primary" : "text-foreground hover:text-primary"
            }`}
          >
            Contact Us
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/order">
            <Button variant="default" className="bg-primary text-primary-foreground hover:bg-maroon-dark">
              Order Now
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Email Us
            </Button>
          </Link>
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
            <Link
              key={link.label}
              to={link.href}
              className={`block py-2 font-medium ${
                isActive(link.href) ? "text-primary" : "text-foreground hover:text-primary"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile Tray Prices */}
          <button
            className={`w-full text-left py-2 font-medium flex items-center justify-between ${
              isTrayPriceActive ? "text-primary" : "text-foreground"
            }`}
            onClick={() => setMobileTrayOpen(!mobileTrayOpen)}
          >
            Tray Prices <ChevronDown className={`w-4 h-4 transition-transform ${mobileTrayOpen ? "rotate-180" : ""}`} />
          </button>
          {mobileTrayOpen && (
            <div className="pl-4 space-y-1">
              {trayPriceCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/tray-prices/${cat.slug}`}
                  className="block py-1.5 text-sm text-muted-foreground hover:text-primary-foreground hover:bg-primary/80 px-2 rounded transition-colors"
                  onClick={() => { setIsOpen(false); setMobileTrayOpen(false); }}
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          )}

          <Link
            to="/blog"
            className="block py-2 text-foreground hover:text-primary font-medium"
            onClick={() => setIsOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/contact"
            className="block py-2 text-foreground hover:text-primary font-medium"
            onClick={() => setIsOpen(false)}
          >
            Contact Us
          </Link>

          <div className="flex gap-2 mt-3">
            <Link to="/order" onClick={() => setIsOpen(false)}>
              <Button variant="default" size="sm" className="bg-primary text-primary-foreground">Order Now</Button>
            </Link>
            <Link to="/contact" onClick={() => setIsOpen(false)}>
              <Button variant="outline" size="sm" className="border-primary text-primary">Email Us</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;