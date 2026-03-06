import { ArrowRight } from "lucide-react";

const posts = [
  {
    title: "Crafting the Perfect Indian Wedding Feast",
    date: "January 29, 2026",
    excerpt: "Indian weddings are vibrant, multi-day celebrations filled with tradition, emotion, and togetherness. Learn how we bring culinary magic to every ceremony.",
  },
  {
    title: "Dinner Party Catering Done Right",
    date: "April 23, 2025",
    excerpt: "Turn your evening into a culinary celebration with our tailored dinner party catering. From multi-course meals to elegant buffet setups.",
  },
  {
    title: "Picnic and Party Buffet Ideas",
    date: "April 23, 2025",
    excerpt: "Make your outdoor gatherings fun, flavorful, and fuss-free with our picnic & party buffet options that keep everyone satisfied.",
  },
];

const BlogSection = () => (
  <section id="blog" className="py-20 bg-cream">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-primary text-center mb-12">Latest from Our Blog</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.title} className="bg-background rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
            <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
            <h3 className="text-lg font-display font-semibold text-foreground mb-3">{post.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <a href="#" className="inline-flex items-center gap-1 text-gold font-semibold text-sm hover:gap-2 transition-all">
              Read More <ArrowRight className="w-4 h-4" />
            </a>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default BlogSection;
