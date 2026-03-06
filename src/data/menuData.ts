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
