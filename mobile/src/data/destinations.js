export const destinations = [
  {
    id: "1",
    name: "Sigiriya Rock Fortress",
    description:
      "An ancient rock fortress located in the northern Matale District near the town of Dambulla. A UNESCO World Heritage Site with remarkable frescoes and landscaped gardens.",
    image:
      "https://images.unsplash.com/photo-1585116938581-27b7e355925a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 7.9572,
    longitude: 80.76,
    category: "historical",
    rating: 4.8,
    activities: ["Hiking", "Photography", "Historical Tour"],
    openingHours: "7:00 AM - 5:30 PM",
    entranceFee: "$30 for foreigners",
    bestTimeToVisit: "Early morning to avoid crowds and heat",
  },
  {
    id: "2",
    name: "Galle Fort",
    description:
      "A fortified old city founded by Portuguese colonists in the 16th century. Now a UNESCO World Heritage Site with colonial architecture, boutique shops, and ocean views.",
    image:
      "https://images.unsplash.com/photo-1590332763549-e5ba46222ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 6.0257,
    longitude: 80.2168,
    category: "historical",
    rating: 4.7,
    activities: ["Walking Tour", "Shopping", "Sunset Viewing"],
    openingHours: "Open 24 hours",
    entranceFee: "Free",
    bestTimeToVisit: "Late afternoon for sunset views",
  },
  {
    id: "3",
    name: "Yala National Park",
    description:
      "The most visited and second largest national park in Sri Lanka. Famous for its high density of leopards, elephants, and diverse bird species.",
    image:
      "https://images.unsplash.com/photo-1541492845268-3705ece069af?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 6.3675,
    longitude: 81.5168,
    category: "nature",
    rating: 4.6,
    activities: ["Safari", "Wildlife Photography", "Bird Watching"],
    openingHours: "6:00 AM - 6:00 PM",
    entranceFee: "$40 for foreigners",
    bestTimeToVisit: "February to July when water levels are low",
  },
  {
    id: "4",
    name: "Temple of the Sacred Tooth Relic",
    description:
      "A Buddhist temple in the city of Kandy which houses the relic of the tooth of the Buddha. One of the most sacred Buddhist sites in the world.",
    image:
      "https://images.unsplash.com/photo-1553855994-a3cbf3ae7d81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 7.2945,
    longitude: 80.6409,
    category: "religious",
    rating: 4.5,
    activities: ["Religious Tour", "Cultural Experience", "Photography"],
    openingHours: "5:30 AM - 8:00 PM",
    entranceFee: "$10 for foreigners",
    bestTimeToVisit: "Morning or during puja ceremonies",
  },
  {
    id: "5",
    name: "Mirissa Beach",
    description:
      "A stunning beach known for its palm-lined shores, clear waters, and vibrant nightlife. Popular for surfing and whale watching.",
    image:
      "https://images.unsplash.com/photo-1586678305585-c2440d4f2c95?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 5.9483,
    longitude: 80.4572,
    category: "beach",
    rating: 4.7,
    activities: ["Surfing", "Whale Watching", "Sunbathing", "Snorkeling"],
    openingHours: "Open 24 hours",
    entranceFee: "Free",
    bestTimeToVisit: "November to April for best weather and whale watching",
  },
  {
    id: "6",
    name: "Nine Arches Bridge",
    description:
      "A colonial-era railway bridge in Ella, known for its nine arches. Set amidst lush tea plantations and mountains, it's a photographer's paradise.",
    image:
      "https://images.unsplash.com/photo-1594475748809-e6a77139f62f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 6.8782,
    longitude: 81.0562,
    category: "scenic",
    rating: 4.6,
    activities: ["Photography", "Train Watching", "Hiking"],
    openingHours: "Open 24 hours",
    entranceFee: "Free",
    bestTimeToVisit: "Early morning or late afternoon for best light",
  },
  {
    id: "7",
    name: "Polonnaruwa Ancient City",
    description:
      "The second most ancient of Sri Lanka's kingdoms, featuring well-preserved ruins and archaeological treasures.",
    image:
      "https://images.unsplash.com/photo-1572868682105-a6d36dfa7b54?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 7.9403,
    longitude: 81.0188,
    category: "historical",
    rating: 4.5,
    activities: ["Cycling Tour", "Historical Exploration", "Photography"],
    openingHours: "7:00 AM - 6:00 PM",
    entranceFee: "$25 for foreigners",
    bestTimeToVisit: "Early morning to avoid the heat",
  },
  {
    id: "8",
    name: "Ella Rock",
    description:
      "A challenging hike with panoramic views of Ella Gap and the surrounding mountains and tea plantations.",
    image:
      "https://images.unsplash.com/photo-1606996251932-0ad3ef79e98b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    latitude: 6.867,
    longitude: 81.0461,
    category: "nature",
    rating: 4.7,
    activities: ["Hiking", "Photography", "Bird Watching"],
    openingHours: "Best climbed in daylight hours",
    entranceFee: "Free",
    bestTimeToVisit: "Early morning for clearest views",
  },
];

// Categories with their colors for map markers
export const categories = [
  { id: "all", name: "All Places", color: "#0066CC" },
  { id: "historical", name: "Historical", color: "#FF6B6B" },
  { id: "nature", name: "Nature & Wildlife", color: "#4CAF50" },
  { id: "beach", name: "Beaches", color: "#00BCD4" },
  { id: "religious", name: "Religious Sites", color: "#9C27B0" },
  { id: "scenic", name: "Scenic Views", color: "#FF9800" },
];
