import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const events = [
  {
    title: "Culinary Showcase",
    date: "March 15, 2026",
    location: "Boston Convention Center",
    desc: "Join us for a delightful culinary showcase featuring our signature North and South Indian dishes.",
  },
  {
    title: "Spring Festival",
    date: "April 20, 2026",
    location: "Boston City Park",
    desc: "Celebrate the arrival of spring with us! Enjoy a variety of our traditional dishes and explore catering options.",
  },
];

const EventsSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-12">Upcoming Events & Promotions</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {events.map((event) => (
          <div key={event.title} className="bg-cream rounded-lg p-8 text-left border border-border">
            <h3 className="text-xl font-display font-semibold text-primary mb-3">{event.title}</h3>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="w-4 h-4 text-gold" />
              {event.date}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
              <MapPin className="w-4 h-4 text-gold" />
              {event.location}
            </div>
            <p className="text-muted-foreground text-sm">{event.desc}</p>
          </div>
        ))}
      </div>
      <Button className="mt-10 bg-primary text-primary-foreground hover:bg-maroon-dark">Join Us</Button>
    </div>
  </section>
);

export default EventsSection;
