import { CuisineMenuCategory } from "@/data/menuData";

interface MenuTableProps {
  categories: CuisineMenuCategory[];
}

const MenuTable = ({ categories }: MenuTableProps) => {
  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <div key={category.title}>
          <h3 className="text-xl font-display font-semibold text-primary mb-4 tracking-wide border-b-2 border-accent pb-2">
            {category.title}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {category.items.map((item) => (
              <div
                key={item.name}
                className="py-2 px-3 font-body text-foreground text-sm"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MenuTable;