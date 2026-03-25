import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, User, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { useCartSummary } from "@/context/CartSummaryContext";
import { useAuth } from "@/hooks/useAuth";

const TRAY_CATEGORIES = [
  { title: "Appetizers", slug: "appetizers" },
  { title: "Entree",     slug: "entree"     },
  { title: "Rice",       slug: "rice"       },
  { title: "Bread",      slug: "bread"      },
  { title: "Dessert",    slug: "dessert"    },
];

const navLinks = [
  { label: "Home",  href: "/"    },
  { label: "Menu",  href: "/menu"},
  { label: "Tray Sizes", href: "/tray-sizes" },
];

const APPROVAL_ROLES = ["admin", "catering_manager", "business_owner"];

const Navbar = () => {
  const { user, signOut, displayName } = useAuth();
  const [isOpen, setIsOpen]                 = useState(false);
  const [trayDropdownOpen, setTrayDropdown] = useState(false);
  const [mobileTrayOpen, setMobileTray]     = useState(false);
  const [showAuthModal, setShowAuthModal]   = useState(false);

  // ── Added: admin → /admin/dashboard ──────────────────────────────────────
  const dashboardRouteMap: Record<string, string> = {
    business_owner:     "/owner/dashboard",
    sales_rep:          "/sales/dashboard",
    operations_manager: "/sales/dashboard",
    catering_manager:   "/sales/dashboard",
    admin:              "/admin/dashboard",
  };
  const dashboardRoute = dashboardRouteMap[user?.role || ""] || "/";

  const location  = useLocation();
  const navigate  = useNavigate();
  const { totalItems } = useCartSummary();

  const handleSignOut = () => {
    signOut();
    if (
      location.pathname.startsWith("/sales") ||
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/owner")
    ) {
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  const isTrayActive = location.pathname.startsWith("/tray-prices");
  const isOrderPage  = location.pathname === "/order";

  const handleCartClick = () => {
    if (!isOrderPage) navigate("/order");
    else document.getElementById("cart-sidebar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const CartButton = ({ mobile = false }: { mobile?: boolean }) => (
    <Button variant="outline" size="sm" onClick={handleCartClick}
      className={`flex items-center gap-1.5 transition-all ${
        totalItems > 0
          ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
          : "border-border text-foreground hover:text-primary hover:border-primary"
      }`}>
      <ShoppingCart className="w-4 h-4" />
      {totalItems > 0
        ? <span className="text-xs font-semibold">{totalItems}</span>
        : <span className={mobile ? "inline" : "hidden sm:inline"}>Cart</span>}
    </Button>
  );

  const AuthSection = ({ mobile = false }: { mobile?: boolean }) => (
    user ? (
      <div className={`flex items-center gap-2 ${mobile ? "flex-wrap" : ""}`}>
        <span className="text-sm text-foreground font-medium hidden sm:inline">
          Hi, {displayName}
        </span>
        <Button variant="outline" size="sm"
          className="border-border text-foreground hover:text-primary hover:border-primary flex items-center gap-1.5"
          onClick={handleSignOut}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    ) : (
      <Button variant="outline" size="sm"
        className="border-border text-foreground hover:text-primary hover:border-primary flex items-center gap-1.5"
        onClick={() => setShowAuthModal(true)}>
        <User className="w-4 h-4" /> Sign in
      </Button>
    )
  );

  // ── Order page — simplified navbar ──
  if (isOrderPage) {
    return (
      <>
        <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
          <div className="container mx-auto flex items-center justify-between py-3 px-4">
            <Link to="/" className="font-display text-2xl font-bold text-primary tracking-wide">
              NIMIR <span className="text-gold text-sm font-body font-normal block -mt-1">Indian Bar & Grill</span>
            </Link>
            <div className="flex items-center gap-2">
              <AuthSection />
              <CartButton />
            </div>
          </div>
        </nav>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  // ── Full navbar ──
  return (
    <>
      <nav className="bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border shadow-sm">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <Link to="/" className="font-display text-2xl font-bold text-primary tracking-wide">
            NIMIR <span className="text-gold text-sm font-body font-normal block -mt-1">Indian Bar & Grill</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.href}
                className={`font-medium text-sm transition-colors ${isActive(link.href) ? "text-primary" : "text-foreground hover:text-primary"}`}>
                {link.label}
              </Link>
            ))}

            {/* Tray Prices Dropdown */}
            <div className="relative" onMouseLeave={() => setTrayDropdown(false)}>
              <button
                onClick={() => setTrayDropdown(!trayDropdownOpen)}
                onMouseEnter={() => setTrayDropdown(true)}
                className={`font-medium text-sm transition-colors inline-flex items-center gap-1 ${isTrayActive ? "text-primary" : "text-foreground hover:text-primary"}`}>
                Tray Prices <ChevronDown className={`w-3.5 h-3.5 transition-transform ${trayDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {trayDropdownOpen && (
                <div className="absolute top-full left-0 w-56 bg-background border border-border rounded-md shadow-lg py-2 z-50">
                  {TRAY_CATEGORIES.map((cat) => (
                    <Link key={cat.slug} to={`/tray-prices/${cat.slug}`}
                      onClick={() => setTrayDropdown(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        location.pathname === `/tray-prices/${cat.slug}`
                          ? "text-primary-foreground bg-primary"
                          : "text-foreground hover:text-primary-foreground hover:bg-primary/80"
                      }`}>
                      {cat.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard — shows for all staff roles including admin */}
            {user && dashboardRoute !== "/" && (
              <Link
                to={dashboardRoute}
                className={`font-medium text-sm transition-colors ${
                  isActive(dashboardRoute) ? "text-primary" : "text-foreground hover:text-primary"
                }`}
              >
                {/* ── Added: label "Admin" for admin role, "Dashboard" for others ── */}
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
            )}

            {/* Approvals — admin, catering_manager, business_owner */}
            {user && APPROVAL_ROLES.includes(user.role) && (
              <Link to="/approvals/dashboard"
                className={`font-medium text-sm transition-colors ${isActive("/approvals/dashboard") ? "text-primary" : "text-foreground hover:text-primary"}`}>
                Approvals
              </Link>
            )}

            <Link to="/blog" className={`font-medium text-sm transition-colors ${isActive("/blog") ? "text-primary" : "text-foreground hover:text-primary"}`}>Blog</Link>
            <Link to="/contact" className={`font-medium text-sm transition-colors ${isActive("/contact") ? "text-primary" : "text-foreground hover:text-primary"}`}>Contact Us</Link>
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <AuthSection />
            <CartButton />
            <Link to="/order">
              <Button variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">Order Now</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">Email Us</Button>
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
              <Link key={link.label} to={link.href}
                className={`block py-2 font-medium ${isActive(link.href) ? "text-primary" : "text-foreground hover:text-primary"}`}
                onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}

            <button
              className={`w-full text-left py-2 font-medium flex items-center justify-between ${isTrayActive ? "text-primary" : "text-foreground"}`}
              onClick={() => setMobileTray(!mobileTrayOpen)}>
              Tray Prices <ChevronDown className={`w-4 h-4 transition-transform ${mobileTrayOpen ? "rotate-180" : ""}`} />
            </button>
            {mobileTrayOpen && (
              <div className="pl-4 space-y-1">
                {TRAY_CATEGORIES.map((cat) => (
                  <Link key={cat.slug} to={`/tray-prices/${cat.slug}`}
                    className="block py-1.5 text-sm text-muted-foreground hover:text-primary-foreground hover:bg-primary/80 px-2 rounded transition-colors"
                    onClick={() => { setIsOpen(false); setMobileTray(false); }}>
                    {cat.title}
                  </Link>
                ))}
              </div>
            )}

            {/* Dashboard — mobile, includes admin */}
            {user && dashboardRoute !== "/" && (
              <Link
                to={dashboardRoute}
                className={`block py-2 font-medium ${
                  isActive(dashboardRoute) ? "text-primary" : "text-foreground hover:text-primary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {user.role === "admin" ? "Admin" : "Dashboard"}
              </Link>
            )}

            {user && APPROVAL_ROLES.includes(user.role) && (
              <Link to="/approvals/dashboard"
                className={`block py-2 font-medium ${isActive("/approvals/dashboard") ? "text-primary" : "text-foreground hover:text-primary"}`}
                onClick={() => setIsOpen(false)}>
                Approvals
              </Link>
            )}

            <Link to="/blog" className="block py-2 text-foreground hover:text-primary font-medium" onClick={() => setIsOpen(false)}>Blog</Link>
            <Link to="/contact" className="block py-2 text-foreground hover:text-primary font-medium" onClick={() => setIsOpen(false)}>Contact Us</Link>

            <div className="flex gap-2 mt-3 flex-wrap">
              <AuthSection mobile />
              <CartButton mobile />
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
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};

export default Navbar;