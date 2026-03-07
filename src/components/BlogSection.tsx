import { ArrowRight, Search, Facebook, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";

const posts = [
  {
    title: "Summer garden catering",
    image: "/src/assets/summer_garden_catering.jpg",
    excerpt:
      "Celebrate sunshine and good vibes with Maya Catering's Summer Garden Catering! Perfect for outdoor parties, brunches, and elegant evening gatherings, we offer fresh, seasonal",
    description:
      "Celebrate sunshine and good vibes with Maya Catering's Summer Garden Catering! Perfect for outdoor parties, brunches, and elegant evening gatherings, we offer fresh, seasonal menus inspired by summer's best flavors. Think colorful salads, refreshing beverages, grilled delicacies, and light desserts — all beautifully presented to complement your garden setting. Whether it's a casual backyard picnic or a stylish soirée, we bring the taste of summer to your table with flawless service and a touch of elegance.",
  },
  {
    title: "Special Event Catering",
    image: "/src/assets/special_event_catering.jpg",
    excerpt:
      "At Maya Catering, we believe every special occasion deserves an extraordinary culinary experience. Whether it's a wedding, engagement, birthday, anniversary, or a",
    description:
      "At Maya Catering, we believe every special occasion deserves an extraordinary culinary experience. Whether it's a wedding, engagement, birthday, anniversary, or a corporate milestone, we craft menus that leave a lasting impression. Our team of expert chefs brings creativity and precision to every plate, ensuring your event is remembered for its flavors as much as its moments. From elegant plated dinners to lavish buffets, we tailor every detail to match your vision and exceed your guests' expectations.",
  },
  {
    title: "Catering holiday buffet",
    image: "/src/assets/catering_holiday_buffer.jpg",
    excerpt:
      "Celebrate the festive season with a delightful spread from Maya Catering! Our Holiday Buffet Catering service brings seasonal flavors, classic favorites, and chef-inspired",
    description:
      "Celebrate the festive season with a delightful spread from Maya Catering! Our Holiday Buffet Catering service brings seasonal flavors, classic favorites, and chef-inspired creations to your table. From rich curries and aromatic biryanis to indulgent desserts and festive drinks, we curate a spread that captures the warmth and joy of the holidays. Perfect for office parties, family gatherings, or community celebrations — let us take care of the food while you enjoy the festivities.",
  },
  {
    title: "Crafting the Perfect Indian Wedding Feast",
    image: "/src/assets/indian_wedding_feast.jpg",
    excerpt:
      "Indian weddings are vibrant, multi-day celebrations filled with tradition, emotion, and togetherness. Learn how we bring authentic culinary magic to every ceremony.",
    description:
      "Indian weddings are vibrant, multi-day celebrations filled with tradition, emotion, and togetherness. Learn how we bring authentic culinary magic to every ceremony, from the mehendi night to the grand reception dinner. Our chefs specialize in regional Indian cuisines, crafting menus that honor your family's traditions while delighting every guest. From fragrant biryanis and rich gravies to mithai and chaat stations, we ensure your wedding feast is as unforgettable as the occasion itself.",
  },
  {
    title: "Dinner Party Catering Done Right",
    image: "/src/assets/diner_party_catering.jpg",
    excerpt:
      "Turn your evening into a culinary celebration with our tailored dinner party catering. From multi-course meals to elegant buffet setups, every dish is crafted to impress your guests.",
    description:
      "Turn your evening into a culinary celebration with our tailored dinner party catering. From multi-course meals to elegant buffet setups, every dish is crafted to impress your guests. Whether you're hosting an intimate gathering of close friends or a larger soirée, our team handles everything from menu planning and prep to service and cleanup. We bring restaurant-quality food and hospitality directly to your home, so you can relax and enjoy the company of your guests.",
  },
  {
    title: "Picnic and Party Buffet Ideas",
    image: "/src/assets/pinic_and_party_buffet.jpg",
    excerpt:
      "Make your outdoor gatherings fun, flavorful, and fuss-free with our picnic & party buffet options that keep everyone satisfied.",
    description:
      "Make your outdoor gatherings fun, flavorful, and fuss-free with our picnic & party buffet options that keep everyone satisfied. Fresh, vibrant dishes served with warmth and care. From finger foods and wraps to hearty mains and refreshing drinks, our picnic menus are designed to be easy to serve and a pleasure to eat. Whether it's a park birthday party, a school event, or a family reunion, we bring the food — you bring the fun.",
  },
];

const SOCIAL_LINKS = {
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
};

const BlogSection = () => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(query.toLowerCase())
  );

  if (selectedIndex !== null) {
    const post = posts[selectedIndex];
    const hasPrev = selectedIndex > 0;
    const hasNext = selectedIndex < posts.length - 1;

    return (
      <section id="blog" className="py-20 bg-cream">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-display font-bold text-primary mb-8 text-center">
            {post.title}
          </h1>

          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-lg mb-8 object-cover"
            style={{ maxHeight: "480px" }}
          />

          <p className="text-foreground text-base leading-relaxed mb-12">
            {post.description}
          </p>

          <div className="flex justify-between items-center border-t border-border pt-6 mb-6">
            <button
              onClick={() => hasPrev && setSelectedIndex(selectedIndex - 1)}
              className={`text-sm font-medium ${hasPrev ? "text-primary hover:underline cursor-pointer" : "text-muted-foreground cursor-default"}`}
            >
              &lt; Older Post
            </button>
            <button
              onClick={() => hasNext && setSelectedIndex(selectedIndex + 1)}
              className={`text-sm font-medium ${hasNext ? "text-primary hover:underline cursor-pointer" : "text-muted-foreground cursor-default"}`}
            >
              Newer Post &gt;
            </button>
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>

          <div className="text-center">
            <button
              onClick={() => setSelectedIndex(null)}
              className="text-sm text-gold font-semibold no-underline"
            >
              ← Back to Blog
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-cream">
      <div className="container mx-auto px-4 text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-4">
          Catering Events
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto mb-8">
          From small to large corporate events or weddings and parties, get inspired with our favorite catering projects.
        </p>
        <div className="relative max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search by events"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-input rounded-full py-3 pl-5 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {filtered.map((post) => {
            const originalIndex = posts.indexOf(post);
            return (
              <article key={post.title} className="bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-52 object-cover cursor-pointer"
                  onClick={() => setSelectedIndex(originalIndex)}
                />
                <div className="p-6">
                  <h3 className="text-lg font-display font-semibold text-foreground mb-3">{post.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{post.excerpt}</p>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setSelectedIndex(originalIndex); }}
                    className="inline-flex items-center gap-1 text-gold font-semibold text-sm hover:gap-2 transition-all"
                  >
                    Read more <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;