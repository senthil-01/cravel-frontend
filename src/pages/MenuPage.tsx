import { Link } from "react-router-dom";
import PageHero from "@/components/PageHero";
const MenuPage = () => {
  return (
    <>
      <PageHero title="Our Menu" />

      <section className="min-h-[70vh] bg-cream flex items-center py-16">
        <div className="container mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left: Text + Buttons */}
            <div className="flex flex-col justify-center pl-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-10 leading-snug">
                Extensive Menu to cover all regional<br />Cuisines of India.
              </h2>

              <div className="flex flex-col gap-5">
                <a
                  href="/src/pdfs/north-indian-menu.pdf"  /* ← replace with your PDF path */
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/80 text-primary-foreground text-center text-base font-semibold py-5 px-8 max-w-sm rounded-md hover:bg-primary transition-colors duration-200"
                >
                  North Indian Catering Menu
                </a>

                <a
                  href="/src/pdfs/south-indian-menu.pdf"  /* ← replace with your PDF path */
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary/80 text-primary-foreground text-center text-base font-semibold py-5 px-8 max-w-sm rounded-md hover:bg-primary transition-colors duration-200"
                >
                  South Indian Catering Menu
                </a>

              </div>
            </div>

            {/* Right: Image */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="/src/assets/hero-menu.jpg"  /* ← replace with your image path */
                alt="Indian catering buffet"
                className="w-full h-[360px] object-cover"
              />
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default MenuPage;