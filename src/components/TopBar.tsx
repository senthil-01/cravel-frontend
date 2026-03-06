import { MapPin, Phone, Mail } from "lucide-react";

const TopBar = () => (
  <div className="bg-topbar text-topbar-foreground py-2 px-4 text-sm">
    <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        <span>33 Tuttle St, Wakefield, MA, USA</span>
      </div>
      <div className="flex items-center gap-4">
        <a href="tel:+16179875222" className="flex items-center gap-1 hover:text-gold transition-colors">
          <Phone className="w-4 h-4" />
          <span>+1 617-987-5222</span>
        </a>
        <a href="mailto:info@mayaindiangrill.com" className="flex items-center gap-1 hover:text-gold transition-colors">
          <Mail className="w-4 h-4" />
          <span className="hidden sm:inline">info@mayaindiangrill.com</span>
        </a>
      </div>
    </div>
  </div>
);

export default TopBar;
