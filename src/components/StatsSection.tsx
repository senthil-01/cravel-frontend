import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 500, label: "Menu Items" },
  { value: 200, label: "Corporate Clients" },
  { value: 900, label: "Private Clients" },
  { value: 4500, label: "Events Catered" },
];

const AnimatedNumber = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-display font-bold text-gold">
      {count.toLocaleString()}+
    </div>
  );
};

const StatsSection = () => (
  <section className="py-16 bg-primary">
    <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {stats.map((stat) => (
        <div key={stat.label}>
          <AnimatedNumber target={stat.value} />
          <p className="text-primary-foreground/80 mt-2 font-medium">{stat.label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default StatsSection;
