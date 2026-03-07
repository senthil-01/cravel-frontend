import PageHero from "@/components/PageHero";

const traySizes = [
  {
    name: "Half Tray (Small Deep Tray)",
    imageSrc: "/src/assets/Half+tray-1920w.webp", // 👈 Replace with your image path
    specs: [
      { label: "WIDTH", value: '10 3/8 Inches' },
      { label: "DEPTH", value: '2 9/16 Inches' },
      { label: "BOTTOM LENGTH", value: '10 1/4 Inches' },
      { label: "TOP LENGTH", value: '12 3/4 Inches' },
      { label: "BOTTOM WIDTH", value: '7 7/8 Inches' },
      { label: "CAPACITY", value: '120 oz' },
      { label: "PEOPLE'S", value: '5 to 6' },
    ],
  },
  {
    name: "Medium Tray (Long Shallow Tray)",
    imageSrc: "/src/assets/medium+tray-1920w (1).webp", // 👈 Replace with your image path
    specs: [
      { label: "WIDTH", value: '12 13/16 Inches' },
      { label: "DEPTH", value: '2 Inches' },
      { label: "BOTTOM LENGTH", value: '18 1/4 Inches' },
      { label: "TOP LENGTH", value: '20 3/4 Inches' },
      { label: "BOTTOM WIDTH", value: '10 1/8 Inches' },
      { label: "TOP WIDTH", value: '12 13/16 Inches' },
      { label: "CAPACITY", value: '228 oz' },
      { label: "PEOPLE'S", value: '10-12' },
    ],
  },
  {
    name: "Full Tray (Large Deep Tray)",
    imageSrc: "/src/assets/Full+Tray-1920w.webp", // 👈 Replace with your image path
    specs: [
      { label: "WIDTH", value: '12 13/16 Inches' },
      { label: "DEPTH", value: '3 3/8 Inches' },
      { label: "BOTTOM LENGTH", value: '18 1/4 Inches' },
      { label: "TOP LENGTH", value: '20 3/4 Inches' },
      { label: "BOTTOM WIDTH", value: '10 1/8 Inches' },
      { label: "TOP WIDTH", value: '12 13/16 Inches' },
      { label: "CAPACITY", value: '346 oz' },
      { label: "PEOPLE'S", value: '25 - 30' },
    ],
  },
];

const TraySizesPage = () => (
  <>
    <PageHero title="Tray Sizes" />
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {traySizes.map((tray) => (
            <div key={tray.name} className="bg-cream rounded-lg p-8 border border-border shadow-md text-center">
              <h3 className="text-xl font-display font-semibold text-primary mb-6">{tray.name}</h3>
              <div className="w-32 h-24 mx-auto mb-6 flex items-center justify-center">
                <img
                  src={tray.imageSrc}
                  alt={tray.name}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div className="space-y-3 text-left">
                {tray.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between text-sm border-b border-border pb-2">
                    <span className="font-semibold text-foreground">{spec.label}:</span>
                    <span className="text-muted-foreground">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default TraySizesPage;