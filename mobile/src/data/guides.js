export const guides = [
  {
    id: "1",
    userId: "u1",
    name: "Amal Perera",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "Experienced guide with over 10 years showing tourists the best of Sri Lanka. Specializing in cultural and historical tours with deep knowledge of ancient temples and archaeological sites.",
    experience: 10,
    languages: ["English", "Sinhala", "Tamil"],
    expertise: ["Cultural", "Historical", "Religious"],
    areas: ["Kandy", "Anuradhapura", "Polonnaruwa", "Sigiriya"],
    rating: 4.9,
    reviewCount: 127,
    pricePerDay: 60,
    verified: true,
    gallery: [
      "https://images.unsplash.com/photo-1605649461784-edc561c0fde8",
      "https://images.unsplash.com/photo-1580889272861-dc2dbea5468d",
      "https://images.unsplash.com/photo-1625123558721-0c97a228fe31",
    ],
    contactInfo: {
      email: "amal.perera@example.com",
      phone: "+94 71 234 5678",
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
  },
  {
    id: "2",
    userId: "u2",
    name: "Kumari Silva",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Nature enthusiast and wildlife photographer. I love showing visitors the incredible biodiversity of Sri Lanka. Specialized in wildlife safaris, bird watching tours, and trekking through rainforests.",
    experience: 7,
    languages: ["English", "Sinhala", "German"],
    expertise: ["Wildlife", "Nature", "Photography"],
    areas: ["Yala", "Wilpattu", "Sinharaja", "Horton Plains"],
    rating: 4.8,
    reviewCount: 93,
    pricePerDay: 75,
    verified: true,
    gallery: [
      "https://images.unsplash.com/photo-1541492845268-3705ece069af",
      "https://images.unsplash.com/photo-1562059635-f7b7c9474001",
      "https://images.unsplash.com/photo-1589310124831-dc58bce19711",
    ],
    contactInfo: {
      email: "kumari.silva@example.com",
      phone: "+94 77 345 6789",
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: false,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true,
    },
  },
  {
    id: "3",
    userId: "u3",
    name: "Dinesh Fernando",
    avatar: "https://randomuser.me/api/portraits/men/62.jpg",
    bio: "Born and raised in Galle, I specialize in coastal tours and water activities. From whale watching to surfing lessons, I can help you experience the best of Sri Lanka's stunning coastline.",
    experience: 5,
    languages: ["English", "Sinhala", "French"],
    expertise: ["Beach", "Adventure", "Water Sports"],
    areas: ["Galle", "Mirissa", "Unawatuna", "Hikkaduwa"],
    rating: 4.7,
    reviewCount: 68,
    pricePerDay: 55,
    verified: true,
    gallery: [
      "https://images.unsplash.com/photo-1589390385690-ee87e3dbae00",
      "https://images.unsplash.com/photo-1544551763-92ab472cad5d",
      "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a",
    ],
    contactInfo: {
      email: "dinesh.fernando@example.com",
      phone: "+94 76 456 7890",
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: false,
      friday: false,
      saturday: true,
      sunday: true,
    },
  },
  {
    id: "4",
    userId: "u4",
    name: "Priya Navaratne",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    bio: "Culinary expert and food tour guide. Discover the authentic flavors of Sri Lankan cuisine with me. From street food tours to cooking classes, I'll introduce you to our rich food culture.",
    experience: 8,
    languages: ["English", "Sinhala", "Italian"],
    expertise: ["Food", "Cultural", "Cooking"],
    areas: ["Colombo", "Kandy", "Galle", "Matara"],
    rating: 4.9,
    reviewCount: 105,
    pricePerDay: 65,
    verified: true,
    gallery: [
      "https://images.unsplash.com/photo-1606471191009-63994c53433b",
      "https://images.unsplash.com/photo-1555535332-8f3b7ae9c10e",
      "https://images.unsplash.com/photo-1561828715-2889974edb9b",
    ],
    contactInfo: {
      email: "priya.navaratne@example.com",
      phone: "+94 75 567 8901",
    },
    availability: {
      monday: false,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false,
    },
  },
  {
    id: "5",
    userId: "u5",
    name: "Rajan Mendis",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    bio: "Mountain trekking expert with extensive knowledge of Sri Lanka's central highlands. I offer hiking tours ranging from easy walks to challenging multi-day treks through some of the most beautiful landscapes in the country.",
    experience: 12,
    languages: ["English", "Sinhala", "Dutch"],
    expertise: ["Trekking", "Nature", "Adventure"],
    areas: ["Ella", "Nuwara Eliya", "Adam's Peak", "Knuckles Range"],
    rating: 4.8,
    reviewCount: 142,
    pricePerDay: 70,
    verified: true,
    gallery: [
      "https://images.unsplash.com/photo-1612699239779-3c2d29899258",
      "https://images.unsplash.com/photo-1626148750686-8c5665b46b89",
      "https://images.unsplash.com/photo-1586678305585-c2440d4f2c95",
    ],
    contactInfo: {
      email: "rajan.mendis@example.com",
      phone: "+94 78 678 9012",
    },
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  },
];

export const expertiseCategories = [
  { id: "all", name: "All Guides" },
  { id: "Cultural", name: "Cultural" },
  { id: "Historical", name: "Historical" },
  { id: "Religious", name: "Religious" },
  { id: "Wildlife", name: "Wildlife" },
  { id: "Nature", name: "Nature" },
  { id: "Photography", name: "Photography" },
  { id: "Beach", name: "Beach" },
  { id: "Adventure", name: "Adventure" },
  { id: "Water Sports", name: "Water Sports" },
  { id: "Food", name: "Food" },
  { id: "Cooking", name: "Cooking" },
  { id: "Trekking", name: "Trekking" },
];

export const areas = [
  "Colombo",
  "Kandy",
  "Galle",
  "Anuradhapura",
  "Polonnaruwa",
  "Sigiriya",
  "Yala",
  "Wilpattu",
  "Sinharaja",
  "Horton Plains",
  "Mirissa",
  "Unawatuna",
  "Hikkaduwa",
  "Matara",
  "Ella",
  "Nuwara Eliya",
  "Adam's Peak",
  "Knuckles Range",
];
