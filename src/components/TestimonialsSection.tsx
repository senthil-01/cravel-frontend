import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Maya Indian Catering transformed our wedding into a culinary delight! Every dish was bursting with authentic flavors, and our guests couldn't stop raving about the food.",
    name: "Anjali S.",
    role: "Bride, Private Wedding",
  },
  {
    quote: "We've used Maya for three corporate events now. The presentation is always impeccable and the food disappears fast — that's the best compliment a caterer can get!",
    name: "Michael R.",
    role: "Event Manager, Tech Corp",
  },
  {
    quote: "The South Indian spread at our family reunion was incredible. From the dosas to the biryanis, everything was fresh and authentically prepared. Highly recommend!",
    name: "Priya K.",
    role: "Host, Family Reunion",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl font-display font-bold text-primary-foreground mb-10">What Our Clients Say</h2>
        <div className="relative">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold fill-gold" />
            ))}
          </div>
          <blockquote className="text-lg md:text-xl text-primary-foreground/90 italic leading-relaxed mb-6 font-display">
            "{testimonials[current].quote}"
          </blockquote>
          <p className="text-gold font-semibold">{testimonials[current].name}</p>
          <p className="text-primary-foreground/60 text-sm">{testimonials[current].role}</p>
          <div className="flex justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 rounded-full border border-primary-foreground/30 text-primary-foreground/70 hover:bg-primary-foreground/10 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} className="p-2 rounded-full border border-primary-foreground/30 text-primary-foreground/70 hover:bg-primary-foreground/10 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
