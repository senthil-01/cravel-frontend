export interface MenuItem {
  name: string;
  category: string;
  sizes: string[];
  price: string;
}

export interface MenuCategory {
  slug: string;
  title: string;
  items: MenuItem[];
}

export const trayPriceCategories: MenuCategory[] = [
  {
    slug: "soup-chat-wraps",
    title: "Soup/Chat/Wraps",
    items: [
      { name: "Chettinadu Veg", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Hot and Sour", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Hot and Sour Chicken", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Lemon Rasam", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Mulligatawny", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Mutton Nejelumbu Soup", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$90" },
      { name: "Mysore Rasam", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "NaatuKozhi Rasam", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Pineapple Rasam", category: "Soup", sizes: ["Medium"], price: "$90" },
      { name: "Sweet Corn Chicken", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Sweet Corn Veg", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Tomato Rasam", category: "Soup", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Achari Paneer Roll", category: "Chat/Wraps", sizes: ["Piece"], price: "$6" },
      { name: "Aloo Tikki Wrap", category: "Chat/Wraps", sizes: ["Piece"], price: "$6" },
      { name: "Aloo Papdi Chat", category: "Chat/Wraps", sizes: ["Piece"], price: "$3" },
      { name: "Chicken Seekh Wrap", category: "Chat/Wraps", sizes: ["Piece"], price: "$7" },
      { name: "Chicken Tikka Wrap", category: "Chat/Wraps", sizes: ["Piece"], price: "$7" },
      { name: "Falafel Wrap", category: "Chat/Wraps", sizes: ["Piece"], price: "$6" },
      { name: "Pav Bhaji", category: "Chat/Wraps", sizes: ["Piece"], price: "$4" },
      { name: "Samosa Chat", category: "Chat/Wraps", sizes: ["Piece"], price: "$3.5" },
      { name: "Tikki Chole Chat", category: "Chat/Wraps", sizes: ["Piece"], price: "$3.5" },
      { name: "Vada Pav", category: "Chat/Wraps", sizes: ["Piece"], price: "$4" },
    ],
  },
  {
    slug: "veg-nonveg-appetizers",
    title: "Veg and Non Veg Appetizers",
    items: [
      { name: "Paneer Tikka", category: "Veg", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Gobi Manchurian", category: "Veg", sizes: ["Half", "Medium", "Full"], price: "$65" },
      { name: "Vegetable Samosa", category: "Veg", sizes: ["Piece"], price: "$2.5" },
      { name: "Onion Bhaji", category: "Veg", sizes: ["Half", "Medium", "Full"], price: "$55" },
      { name: "Hara Bhara Kabab", category: "Veg", sizes: ["Half", "Medium", "Full"], price: "$65" },
      { name: "Aloo Tikki", category: "Veg", sizes: ["Piece"], price: "$3" },
      { name: "Chicken Tikka", category: "Non-Veg", sizes: ["Half", "Medium", "Full"], price: "$85" },
      { name: "Chicken 65", category: "Non-Veg", sizes: ["Half", "Medium", "Full"], price: "$80" },
      { name: "Chicken Lollipop", category: "Non-Veg", sizes: ["Half", "Medium", "Full"], price: "$85" },
      { name: "Fish Pakora", category: "Non-Veg", sizes: ["Half", "Medium", "Full"], price: "$90" },
      { name: "Lamb Seekh Kabab", category: "Non-Veg", sizes: ["Half", "Medium", "Full"], price: "$95" },
      { name: "Tandoori Chicken", category: "Non-Veg", sizes: ["Half", "Medium", "Full"], price: "$90" },
    ],
  },
  {
    slug: "veg-curries",
    title: "Veg Curries",
    items: [
      { name: "Paneer Butter Masala", category: "Paneer", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Palak Paneer", category: "Paneer", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Kadai Paneer", category: "Paneer", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Shahi Paneer", category: "Paneer", sizes: ["Half", "Medium", "Full"], price: "$75" },
      { name: "Dal Makhani", category: "Dal", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Dal Tadka", category: "Dal", sizes: ["Half", "Medium", "Full"], price: "$55" },
      { name: "Chana Masala", category: "Curry", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Aloo Gobi", category: "Curry", sizes: ["Half", "Medium", "Full"], price: "$55" },
      { name: "Baingan Bharta", category: "Curry", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Mixed Veg Curry", category: "Curry", sizes: ["Half", "Medium", "Full"], price: "$55" },
      { name: "Malai Kofta", category: "Curry", sizes: ["Half", "Medium", "Full"], price: "$70" },
      { name: "Navratan Korma", category: "Curry", sizes: ["Half", "Medium", "Full"], price: "$65" },
    ],
  },
  {
    slug: "non-veg-curries",
    title: "Non Veg Curries",
    items: [
      { name: "Butter Chicken", category: "Chicken", sizes: ["Half", "Medium", "Full"], price: "$85" },
      { name: "Chicken Tikka Masala", category: "Chicken", sizes: ["Half", "Medium", "Full"], price: "$85" },
      { name: "Chicken Chettinad", category: "Chicken", sizes: ["Half", "Medium", "Full"], price: "$85" },
      { name: "Chicken Korma", category: "Chicken", sizes: ["Half", "Medium", "Full"], price: "$80" },
      { name: "Kadai Chicken", category: "Chicken", sizes: ["Half", "Medium", "Full"], price: "$80" },
      { name: "Lamb Rogan Josh", category: "Lamb/Goat", sizes: ["Half", "Medium", "Full"], price: "$100" },
      { name: "Goat Curry", category: "Lamb/Goat", sizes: ["Half", "Medium", "Full"], price: "$100" },
      { name: "Lamb Vindaloo", category: "Lamb/Goat", sizes: ["Half", "Medium", "Full"], price: "$100" },
      { name: "Fish Curry", category: "Seafood", sizes: ["Half", "Medium", "Full"], price: "$95" },
      { name: "Shrimp Masala", category: "Seafood", sizes: ["Half", "Medium", "Full"], price: "$100" },
      { name: "Egg Curry", category: "Egg", sizes: ["Half", "Medium", "Full"], price: "$65" },
      { name: "Egg Masala", category: "Egg", sizes: ["Half", "Medium", "Full"], price: "$65" },
    ],
  },
  {
    slug: "rice-bread-desserts",
    title: "Rice/Bread/Desserts",
    items: [
      { name: "Basmati Rice", category: "Rice", sizes: ["Half", "Medium", "Full"], price: "$40" },
      { name: "Jeera Rice", category: "Rice", sizes: ["Half", "Medium", "Full"], price: "$45" },
      { name: "Veg Biryani", category: "Rice", sizes: ["Half", "Medium", "Full"], price: "$65" },
      { name: "Chicken Biryani", category: "Rice", sizes: ["Half", "Medium", "Full"], price: "$80" },
      { name: "Goat Biryani", category: "Rice", sizes: ["Half", "Medium", "Full"], price: "$95" },
      { name: "Lemon Rice", category: "Rice", sizes: ["Half", "Medium", "Full"], price: "$50" },
      { name: "Naan", category: "Bread", sizes: ["Piece"], price: "$2" },
      { name: "Garlic Naan", category: "Bread", sizes: ["Piece"], price: "$2.5" },
      { name: "Roti", category: "Bread", sizes: ["Piece"], price: "$1.5" },
      { name: "Paratha", category: "Bread", sizes: ["Piece"], price: "$3" },
      { name: "Gulab Jamun", category: "Dessert", sizes: ["Half", "Medium", "Full"], price: "$50" },
      { name: "Rasmalai", category: "Dessert", sizes: ["Half", "Medium", "Full"], price: "$60" },
      { name: "Kheer", category: "Dessert", sizes: ["Half", "Medium", "Full"], price: "$55" },
      { name: "Gajar Ka Halwa", category: "Dessert", sizes: ["Half", "Medium", "Full"], price: "$60" },
    ],
  },
];

export function getCategoryBySlug(slug: string): MenuCategory | undefined {
  return trayPriceCategories.find((c) => c.slug === slug);
}

// Cuisine-specific menu data with accordion categories
export interface CuisineMenuItem {
  name: string;
  description?: string;
  price?: string;
  isVeg?: boolean;
}

export interface CuisineMenuCategory {
  title: string;
  items: CuisineMenuItem[];
}

export interface CuisineMenu {
  slug: string;
  title: string;
  subtitle: string;
  categories: CuisineMenuCategory[];
}

export const cuisineMenus: CuisineMenu[] = [
  {
    slug: "north-indian",
    title: "North Indian Menu",
    subtitle: "Authentic flavors from the heart of North India",
    categories: [
      {
        title: "Starters & Appetizers",
        items: [
          { name: "Paneer Tikka", description: "Marinated cottage cheese grilled in tandoor", price: "$14", isVeg: true },
          { name: "Samosa (2 pcs)", description: "Crispy pastry with spiced potato filling", price: "$6", isVeg: true },
          { name: "Aloo Tikki", description: "Spiced potato cutlets served with chutneys", price: "$8", isVeg: true },
          { name: "Hara Bhara Kabab", description: "Spinach and green pea patties", price: "$10", isVeg: true },
          { name: "Chicken Tikka", description: "Tandoori spiced chicken pieces", price: "$16" },
          { name: "Lamb Seekh Kabab", description: "Minced lamb skewers with herbs", price: "$18" },
          { name: "Tandoori Chicken", description: "Classic tandoori marinated chicken", price: "$16" },
          { name: "Fish Amritsari", description: "Battered fish fried Amritsar style", price: "$16" },
        ],
      },
      {
        title: "Main Course - Vegetarian",
        items: [
          { name: "Paneer Butter Masala", description: "Cottage cheese in creamy tomato sauce", price: "$16", isVeg: true },
          { name: "Palak Paneer", description: "Cottage cheese in spinach gravy", price: "$16", isVeg: true },
          { name: "Dal Makhani", description: "Slow-cooked black lentils in cream", price: "$14", isVeg: true },
          { name: "Chana Masala", description: "Spiced chickpea curry", price: "$13", isVeg: true },
          { name: "Aloo Gobi", description: "Potato and cauliflower curry", price: "$13", isVeg: true },
          { name: "Malai Kofta", description: "Paneer-potato dumplings in rich gravy", price: "$16", isVeg: true },
          { name: "Shahi Paneer", description: "Royal paneer in cashew cream sauce", price: "$16", isVeg: true },
          { name: "Kadai Paneer", description: "Paneer with peppers in kadai spices", price: "$16", isVeg: true },
        ],
      },
      {
        title: "Main Course - Non Vegetarian",
        items: [
          { name: "Butter Chicken", description: "Tender chicken in buttery tomato gravy", price: "$18" },
          { name: "Chicken Tikka Masala", description: "Tikka chicken in spiced masala", price: "$18" },
          { name: "Lamb Rogan Josh", description: "Kashmiri-style lamb curry", price: "$22" },
          { name: "Goat Curry", description: "Traditional goat meat curry", price: "$22" },
          { name: "Chicken Korma", description: "Mild chicken in cashew-yogurt sauce", price: "$17" },
          { name: "Kadai Chicken", description: "Chicken with bell peppers", price: "$17" },
          { name: "Fish Curry", description: "Fish in aromatic curry sauce", price: "$20" },
          { name: "Shrimp Masala", description: "Shrimp in spiced onion-tomato masala", price: "$22" },
        ],
      },
      {
        title: "Biryani & Rice",
        items: [
          { name: "Chicken Biryani", description: "Fragrant basmati rice with chicken", price: "$18" },
          { name: "Goat Biryani", description: "Dum-style biryani with goat meat", price: "$22" },
          { name: "Veg Biryani", description: "Mixed vegetable dum biryani", price: "$15", isVeg: true },
          { name: "Jeera Rice", description: "Cumin-tempered basmati rice", price: "$8", isVeg: true },
          { name: "Lemon Rice", description: "Tangy lemon-flavored rice", price: "$9", isVeg: true },
        ],
      },
      {
        title: "Breads",
        items: [
          { name: "Naan", description: "Classic tandoori bread", price: "$3", isVeg: true },
          { name: "Garlic Naan", description: "Naan with garlic and herbs", price: "$4", isVeg: true },
          { name: "Roti", description: "Whole wheat flatbread", price: "$2.5", isVeg: true },
          { name: "Paratha", description: "Layered flaky bread", price: "$4", isVeg: true },
          { name: "Kulcha", description: "Stuffed oven-baked bread", price: "$5", isVeg: true },
        ],
      },
      {
        title: "Desserts",
        items: [
          { name: "Gulab Jamun", description: "Deep-fried milk balls in syrup", price: "$6", isVeg: true },
          { name: "Rasmalai", description: "Soft paneer discs in saffron milk", price: "$8", isVeg: true },
          { name: "Gajar Ka Halwa", description: "Warm carrot pudding", price: "$7", isVeg: true },
          { name: "Kheer", description: "Creamy rice pudding", price: "$6", isVeg: true },
        ],
      },
    ],
  },
  {
    slug: "south-indian",
    title: "South Indian Menu",
    subtitle: "Regional specialties from Andhra, Karnataka, Kerala & Tamil Nadu",
    categories: [
      {
        title: "Tiffin & Breakfast",
        items: [
          { name: "Masala Dosa", description: "Crispy crepe with potato filling", price: "$10", isVeg: true },
          { name: "Plain Dosa", description: "Thin rice and lentil crepe", price: "$8", isVeg: true },
          { name: "Idli (3 pcs)", description: "Steamed rice cakes with sambar", price: "$8", isVeg: true },
          { name: "Medu Vada (2 pcs)", description: "Crispy lentil donuts", price: "$8", isVeg: true },
          { name: "Uttapam", description: "Thick rice pancake with toppings", price: "$10", isVeg: true },
          { name: "Pongal", description: "Rice-lentil comfort dish", price: "$10", isVeg: true },
          { name: "Upma", description: "Semolina savory porridge", price: "$9", isVeg: true },
        ],
      },
      {
        title: "Starters",
        items: [
          { name: "Chicken 65", description: "Spicy deep-fried chicken", price: "$15" },
          { name: "Gobi 65", description: "Crispy spiced cauliflower", price: "$12", isVeg: true },
          { name: "Paneer 65", description: "Spicy fried cottage cheese", price: "$14", isVeg: true },
          { name: "Fish Fry", description: "South Indian-style pan-fried fish", price: "$16" },
          { name: "Chicken Lollipop", description: "Spiced drumettes", price: "$15" },
          { name: "Vazhakai Bajji", description: "Raw banana fritters", price: "$10", isVeg: true },
        ],
      },
      {
        title: "Curries - Vegetarian",
        items: [
          { name: "Sambar", description: "Lentil and vegetable stew", price: "$12", isVeg: true },
          { name: "Rasam", description: "Tangy tamarind soup", price: "$10", isVeg: true },
          { name: "Aviyal", description: "Kerala mixed vegetable coconut curry", price: "$14", isVeg: true },
          { name: "Kootu", description: "Lentil and vegetable thick curry", price: "$13", isVeg: true },
          { name: "Poriyal", description: "Dry vegetable stir-fry", price: "$12", isVeg: true },
          { name: "Kuzhambu", description: "Tamarind-based spicy gravy", price: "$13", isVeg: true },
        ],
      },
      {
        title: "Curries - Non Vegetarian",
        items: [
          { name: "Chettinad Chicken", description: "Fiery Chettinad-spiced chicken", price: "$18" },
          { name: "Kerala Fish Curry", description: "Fish in coconut and tamarind", price: "$20" },
          { name: "Mutton Kuzhambu", description: "Spiced mutton in tamarind gravy", price: "$22" },
          { name: "Egg Curry", description: "Boiled eggs in spiced gravy", price: "$14" },
          { name: "Prawn Masala", description: "Coastal prawn curry", price: "$22" },
          { name: "NaatuKozhi Curry", description: "Country chicken curry", price: "$20" },
        ],
      },
      {
        title: "Rice & Biryani",
        items: [
          { name: "Curd Rice", description: "Yogurt rice with tempering", price: "$8", isVeg: true },
          { name: "Lemon Rice", description: "Tangy lemon-seasoned rice", price: "$9", isVeg: true },
          { name: "Tamarind Rice", description: "Puliyodarai - tamarind rice", price: "$9", isVeg: true },
          { name: "Coconut Rice", description: "Fragrant coconut rice", price: "$10", isVeg: true },
          { name: "Chicken Biryani", description: "Hyderabadi-style dum biryani", price: "$18" },
          { name: "Mutton Biryani", description: "Layered mutton dum biryani", price: "$22" },
        ],
      },
      {
        title: "Desserts",
        items: [
          { name: "Payasam", description: "Vermicelli or dal kheer", price: "$7", isVeg: true },
          { name: "Mysore Pak", description: "Rich gram flour fudge", price: "$6", isVeg: true },
          { name: "Kesari", description: "Semolina halwa with saffron", price: "$6", isVeg: true },
          { name: "Ada Pradhaman", description: "Kerala rice ada in jaggery coconut milk", price: "$8", isVeg: true },
        ],
      },
    ],
  },
  {
    slug: "international",
    title: "International Menu",
    subtitle: "Italian, Mediterranean, and Continental Veg/Vegan flavors",
    categories: [
      {
        title: "Salads & Soups",
        items: [
          { name: "Caesar Salad", description: "Classic romaine with parmesan croutons", price: "$12", isVeg: true },
          { name: "Greek Salad", description: "Fresh veggies with feta and olives", price: "$12", isVeg: true },
          { name: "Minestrone Soup", description: "Italian vegetable soup", price: "$10", isVeg: true },
          { name: "Tom Yum Soup", description: "Thai hot and sour soup", price: "$12" },
          { name: "Corn Chowder", description: "Creamy sweet corn soup", price: "$10", isVeg: true },
        ],
      },
      {
        title: "Pasta & Italian",
        items: [
          { name: "Penne Arrabbiata", description: "Spicy tomato sauce pasta", price: "$14", isVeg: true },
          { name: "Alfredo Pasta", description: "Creamy white sauce pasta", price: "$14", isVeg: true },
          { name: "Lasagna", description: "Layered pasta with cheese and sauce", price: "$16", isVeg: true },
          { name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: "$14", isVeg: true },
          { name: "Chicken Parmigiana", description: "Breaded chicken with marinara", price: "$18" },
        ],
      },
      {
        title: "Mediterranean",
        items: [
          { name: "Falafel Platter", description: "Crispy chickpea fritters with hummus", price: "$14", isVeg: true },
          { name: "Hummus & Pita", description: "Creamy chickpea dip with warm bread", price: "$10", isVeg: true },
          { name: "Grilled Halloumi", description: "Pan-seared halloumi with herbs", price: "$14", isVeg: true },
          { name: "Shawarma Wrap", description: "Spiced chicken in flatbread", price: "$14" },
          { name: "Baba Ganoush", description: "Smoky eggplant dip", price: "$10", isVeg: true },
        ],
      },
      {
        title: "Continental Mains",
        items: [
          { name: "Grilled Chicken Breast", description: "Herb-marinated grilled chicken", price: "$18" },
          { name: "Fish and Chips", description: "Beer-battered fish with fries", price: "$16" },
          { name: "Vegetable Stir Fry", description: "Asian-style mixed vegetable stir fry", price: "$14", isVeg: true },
          { name: "Mushroom Risotto", description: "Creamy Italian arborio rice", price: "$16", isVeg: true },
          { name: "Stuffed Bell Peppers", description: "Rice and herb stuffed peppers", price: "$14", isVeg: true },
        ],
      },
      {
        title: "Desserts",
        items: [
          { name: "Tiramisu", description: "Classic Italian coffee dessert", price: "$8", isVeg: true },
          { name: "Panna Cotta", description: "Italian cream custard", price: "$8", isVeg: true },
          { name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", price: "$10", isVeg: true },
          { name: "Baklava", description: "Layered filo pastry with nuts", price: "$7", isVeg: true },
        ],
      },
    ],
  },
];

export function getCuisineBySlug(slug: string): CuisineMenu | undefined {
  return cuisineMenus.find((c) => c.slug === slug);
}
