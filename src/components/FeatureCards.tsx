import passionImg from "@/assets/passion-food.jpg";
import qualityImg from "@/assets/quality-food.jpg";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    image: passionImg,
    title: "Our Passion for Authenticity",
    desc: "Crafting unforgettable culinary experiences.",
    buttonLabel: "View Menu",
    route: "/our_menu",
  },
  {
    image: qualityImg,
    title: "Quality You Can Trust",
    desc: "Committed to excellence in every dish.",
    buttonLabel: "Explore Packages",
    route: "#pricing",
  },
];

const FeatureCards = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div
            key={card.title}
            className="relative rounded-lg overflow-hidden group h-80"
          >
            <img
              src={card.image}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end items-center p-8">
              <h3 className="text-xl font-display font-semibold text-white text-center">
                {card.title}
              </h3>
              <p className="text-white/80 mt-1 text-center">{card.desc}</p>
              <button
                onClick={() => {
                  if (card.route.startsWith("#")) {
                    const el = document.getElementById(card.route.slice(1));
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    navigate(card.route);
                  }
                }}
                className="
                  mt-5 px-6 py-2
                  bg-transparent text-white
                  border border-white rounded-full
                  text-sm font-medium tracking-wide
                  hover:bg-white hover:text-black
                  transition-colors duration-300
                  backdrop-blur-sm
                "
              >
                {card.buttonLabel}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;