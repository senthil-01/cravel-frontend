import { useState } from "react";
import MenuHero from "@/components/MenuHero";
import MenuTable from "@/components/MenuTable";
import { cuisineMenus } from "@/data/menuData";

const tabs = [
  { id: "north-indian", label: "North Indian", emoji: "🍛" },
  { id: "south-indian", label: "South Indian", emoji: "🥘" },
  { id: "international", label: "International", emoji: "🌍" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("north-indian");
  const activeMenu = cuisineMenus.find((m) => m.slug === activeTab)!;

  return (
    <div className="min-h-screen bg-background">
      <MenuHero
        title="Our Menu"
        subtitle="Our catering menu incorporates a variety of flavors, reflecting our passion for creative food."
      />

      {/* About Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-6">
            BOOK YOUR CATERING ORDER FROM THE BEST INDIAN CATERERS
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed mb-8">
            Maya Indian Catering is your one stop solution for all catering services — corporate parties,
            buffet catering, or party catering. We extend our services to a diverse group of clients,
            always keeping our motto: "Prepared with Passion, Delivered with Pride."
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <h3 className="text-xl font-display font-semibold text-foreground text-center mb-4">
            We cater to:
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Housewarming Functions", "Indian Weddings", "Corporate Events", "Cocktail Parties", "Birthday Parties"].map((s) => (
              <span key={s} className="px-4 py-2 bg-secondary rounded-full text-sm font-body text-secondary-foreground">
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Tabs */}
      <section className="container mx-auto px-6 pb-20" id="menu">
        <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">
          Explore Our Menus
        </h2>

        {/* Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
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

        {/* Menu Table */}
        <div className="max-w-4xl mx-auto">
          <MenuTable categories={activeMenu.categories} />
        </div>
      </section>

      
    </div>
  );
};

export default Index;