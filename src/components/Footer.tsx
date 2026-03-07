import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => (
  <footer className="bg-primary py-9">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-display text-xl font-bold text-primary-foreground mb-2">NIMIR Indian Catering</h3>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Premier catering services located in the vibrant city of Boston, Massachusetts. Our commitment to culinary excellence sets us apart.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-primary-foreground mb-3">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { label: "Home", to: "/" },
              { label: "Menu", to: "/menu" },
              { label: "Tray Sizes", to: "/tray-sizes" },
              { label: "Tray Prices", to: "/tray-prices" },
              { label: "Blog", to: "/blog" },
              { label: "Contact", to: "/contact" },
            ].map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="text-primary-foreground/70 hover:text-gold text-sm transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-primary-foreground mb-3">Address</h4>
          <div className="space-y-2 text-primary-foreground/70 text-sm">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold" /> 33 Tuttle St, Wakefield, MA, USA</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold" /> +1 617-987-5222</div>
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold" /> info@nimirindiangrill.com</div>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 pt-6 text-center">
        <p className="text-primary-foreground/50 text-sm">© 2026 All Rights Reserved | NIMIR Catering</p>
      </div>
    </div>
  </footer>
);

export default Footer;
