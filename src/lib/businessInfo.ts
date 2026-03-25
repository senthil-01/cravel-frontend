export interface BusinessChunk {
  id: string;
  content: string;
  metadata: {
    category: string;
  };
}

export const businessChunks: BusinessChunk[] = [
  {
    id: "about-us",
    content: `About NIMIR Indian Catering:
    Our catering goal is to help make your event a memorable experience for your guests.
    We provide a premium food experience for events ranging from small gatherings to large
    corporate events, weddings and parties.
    NIMIR is selected as one of the preferred vendors for many Corporate Catering events.
    We have been doing Wedding Catering in collaboration with other vendors to provide a
    multi-cuisine menu. Our team ensures the best quality food, timely delivery, orderly
    setup, and pleasant service.
    Our motto is: Prepared with Passion, Delivered with Pride.
    We cater for Housewarming Functions, Indian Weddings, Corporate Events, Cocktail Parties
    and Birthday Parties.`,
    metadata: { category: "about" }
  },

  {
    id: "business-location",
    content: `NIMIR Indian Bar and Grill is located at 123 Main Street, Sample City, State 00000.
    Phone: +1 000-000-0000.
    Email: contact@nimir.com.
    You can also reach us through the contact form on our website.
    We will respond to your inquiry as soon as possible.`,
    metadata: { category: "business-info" }
  },

  {
    id: "business-hours",
    content: `NIMIR catering is open Monday to Sunday from 10:00 AM to 9:00 PM.
    We are available all 7 days of the week including public holidays.
    For regular tray orders, booking must be placed at least 1 hour before pickup or delivery.
    For Corporate Catering packages, orders must be placed at least 7 days in advance with
    a minimum of 30 guests. Corporate packages are pickup only from the restaurant.`,
    metadata: { category: "business-info" }
  },

  {
    id: "services",
    content: `NIMIR Indian Catering provides full catering services across North Indian,
    South Indian and International cuisines.
    We cater for Housewarming Functions, Indian Weddings, Corporate Events,
    Cocktail Parties and Birthday Parties.
    Delivery is available depending on order size and type.
    Pickup is also available from our restaurant.
    For large corporate packages, pickup from restaurant is required.`,
    metadata: { category: "services" }
  },

  {
    id: "event-types",
    content: `NIMIR Indian Catering serves three main types of events:

    Social Events: We cater for birthday parties, family gatherings, baby showers,
    graduation celebrations and cocktail parties.

    Corporate Events: We provide complete food preparation and presentation for
    corporate and business events of any scale.

    Special Events: We add personal touches to your special event and help make
    your party unforgettable for friends and family.

    No event is too small or too large for NIMIR. We bring the same quality,
    passion and professionalism to every event we cater.`,
    metadata: { category: "event-types" }
  },

  {
    id: "ordering",
    content: `To place a catering order with NIMIR, visit our website and go to the Order page,
    or call us directly at +1 000-000-0000, or email us at contact@nimir.com.
    For regular tray orders, booking must be placed at least 1 hour before pickup or delivery.
    For Corporate Catering packages, minimum 30 guests and 7 days advance notice is required.
    Delivery is available depending on order size and type.
    Pickup is available from our restaurant Monday to Sunday 10:00 AM to 9:00 PM.`,
    metadata: { category: "ordering" }
  },

  {
    id: "faq-halal",
    content: `Yes, NIMIR uses 100% halal meat for all non-vegetarian dishes.
    This applies to all chicken, lamb, goat, mutton and other meat dishes on our menu.
    Customers with halal dietary requirements can order with confidence.`,
    metadata: { category: "faq" }
  },

  {
    id: "faq-custom",
    content: `Custom menus and dietary accommodations are available at NIMIR on request.
    We can adjust spice levels, accommodate vegan and vegetarian preferences,
    and create custom menus for your specific event needs.
    Contact us to discuss your requirements before placing your order.`,
    metadata: { category: "faq" }
  },

  {
    id: "faq-delivery",
    content: `NIMIR provides delivery depending on order size and type.
    For smaller or regular tray orders, both delivery and pickup options may be available.
    For Corporate Catering packages, pickup from the restaurant is required.
    Service area covers Sample City and surrounding regions.
    Contact us at +1 000-000-0000 to confirm delivery availability for your location.`,
    metadata: { category: "faq" }
  },

  {
  id: "tray-serving-sizes",
  content: `NIMIR catering tray sizes and serving capacities:

  Half Tray also called Small Deep Tray:
  Width 10 3/8 inches, Depth 2 9/16 inches, Capacity 120oz.
  Serves 5 to 6 people.

  Medium Tray also called Long Shallow Tray:
  Width 12 13/16 inches, Depth 2 inches, Capacity 228oz.
  Serves 10 to 12 people.

  Full Tray also called Large Deep Tray:
  Width 12 13/16 inches, Depth 3 3/8 inches, Capacity 346oz.
  Serves 25 to 30 people.

  Tray prices vary by dish. Soups, curries, rice and desserts are available in
  Half, Medium and Full tray sizes.
  Breads like Naan, Roti and Paratha are priced per piece.
  Chat, Wraps, Dosa and Tiffin items are also priced per piece.`,
  metadata: { category: "tray-info" }
},

  {
    id: "corporate-packages",
    content: `NIMIR offers Corporate Catering Package Menu with 3 options.
    Minimum 30 guests required. Must be booked 7 days in advance. Pickup from restaurant only.
    Prices subject to change. T&C apply.

    Express Package at $20 per person includes:
    1 Appetizer, 1 Veg Entree, 1 Chicken Entree, 1 Naan, Basmati Rice,
    Mint Chutney and Tamarind Chutney.

    Ultimate Package at $24 per person includes:
    2 Appetizers (1 Veg and 1 Chicken), 3 Entrees (1 Veg, 1 Paneer, 1 Chicken),
    1 Naan, Biryani (Veg or Chicken), 1 Dessert, Raita, Mint and Tamarind Chutney.

    Specialty Package at $28 per person includes:
    2 Appetizers (1 Veg and 1 Non-Veg), 4 Entrees (Veg, Paneer, Chicken, Lamb/Goat/Fish),
    1 Naan, Biryani (Veg, Chicken or Goat), 2 Desserts, Raita, Mint and Tamarind Chutney.`,
    metadata: { category: "packages" }
  },

  {
    id: "achievements",
    content: `NIMIR Indian Catering achievements and experience:
    Over 200 corporate clients served.
    Over 900 private clients served.
    Over 4500 events catered successfully.
    Our menu offers over 107 dishes across 3 cuisine types: North Indian, South Indian and International.
    We offer 12 Soups, 10 Chat and Wraps, 9 Veg Appetizers, 6 Non-Veg Appetizers,
    16 Veg Curries, 14 Non-Veg Curries, 10 Rice dishes, 5 Breads, 12 Desserts,
    2 Salads, 4 Pasta and Italian, 3 Mediterranean, 3 Continental Mains and 7 Tiffin items.
    NIMIR is a trusted and experienced catering company with a proven track record
    across corporate events, weddings, private parties and more.`,
    metadata: { category: "achievements" }
  },

  {
    id: "website-pages",
    content: `NIMIR website has the following pages customers can visit:
    Home page with overview of services.
    Our Menu page showing full North Indian, South Indian and International menus.
    Tray Prices page showing all dishes with Half, Medium and Full tray pricing broken
    into categories: Soup/Chat/Wraps, Veg and Non-Veg Appetizers, Veg Curries,
    Non-Veg Curries and Rice/Bread/Desserts.
    Order page to place a catering order directly online.
    Contact page to reach the NIMIR team by email or phone.
    Blog page for catering tips and updates.`,
    metadata: { category: "website-info" }
  },

  {
    id: "event-types",
    content: `NIMIR Indian Catering serves three main types of events:

    Social Events: We cater for birthday parties, family gatherings, baby showers,
    graduation celebrations and cocktail parties.

    Special Events: We add personal touches to your special event and help make
    your party unforgettable for friends and family.

    Corporate Events: We provide complete food preparation and presentation for
    corporate and business events of any scale.
    Corporate packages require minimum 30 guests, 7 days advance booking and pickup from restaurant.
    Corporate package pricing starts from $20 per person.

    For Social and Special Events:
    Advance booking must be made at least 5 days before the event.
    Delivery and pickup availability depends on order size and type.
    For pricing details and minimum guest count for Social and Special events,
    please contact us directly at +1 000-000-0000 or email contact@nimir.com.
    Our team will work with you to create the perfect menu for your event.`,
    metadata: { category: "event-types" }
  },
];