import aboutImg from "@/assets/about-team.jpg";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img src={aboutImg} alt="Maya Catering Team" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-4">About Us</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Our catering goal is to help make your event a memorable experience for your guests. The premium food experience from small to large corporate events or weddings and parties.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-6">
            NIMIR is selected as one of the preferred vendors for many Corporate Catering events. We have been doing Wedding Catering in collaboration with other vendors to provide a multi-cuisine menu. Our team ensures the best quality food, timely delivery, orderly setup, and pleasant service.
          </p>
          <Button
            onClick={() => navigate("/our_menu")}
            className="bg-primary text-primary-foreground hover:bg-maroon-dark"
          >
            Explore Our Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;