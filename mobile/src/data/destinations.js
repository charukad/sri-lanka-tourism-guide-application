export const destinations = [
  {
    id: '1',
    name: 'Sigiriya',
    description: 'Ancient palace and fortress complex with stunning frescoes and lion-shaped gateway.',
    location: {
      latitude: 7.9570,
      longitude: 80.7603,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4c/Sigiriya.jpg',
    ],
    category: 'heritage',
    rating: 4.8,
    reviews: 2453,
    duration: '4-5 hours',
    bestTimeToVisit: 'Early morning or late afternoon',
    ticketPrice: {
      foreigners: 30,
      locals: 50,
      currency: 'USD'
    },
    facilities: ['Parking', 'Restrooms', 'Guided Tours', 'Museum'],
    activities: ['Rock Climbing', 'Photography', 'Historical Tour'],
  },
  {
    id: '2',
    name: 'Galle Fort',
    description: 'UNESCO World Heritage site featuring Dutch colonial architecture and ocean views.',
    location: {
      latitude: 6.0300,
      longitude: 80.2167,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Galle_Fort_Lighthouse.jpg/1280px-Galle_Fort_Lighthouse.jpg',
    ],
    category: 'heritage',
    rating: 4.6,
    reviews: 1876,
    duration: '2-3 hours',
    bestTimeToVisit: 'Sunset',
    ticketPrice: {
      foreigners: 0,
      locals: 0,
      currency: 'USD'
    },
    facilities: ['Restaurants', 'Shops', 'Museums', 'Hotels'],
    activities: ['Walking Tour', 'Shopping', 'Photography'],
  },
  {
    id: '3',
    name: 'Yala National Park',
    description: 'Famous wildlife sanctuary known for leopards, elephants, and diverse bird species.',
    location: {
      latitude: 6.3698,
      longitude: 81.5292,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Elephant_in_Yala_National_Park.jpg/1280px-Elephant_in_Yala_National_Park.jpg',
    ],
    category: 'nature',
    rating: 4.7,
    reviews: 3241,
    duration: '4-6 hours',
    bestTimeToVisit: 'Early morning or late afternoon',
    ticketPrice: {
      foreigners: 40,
      locals: 20,
      currency: 'USD'
    },
    facilities: ['Safari Jeeps', 'Camping', 'Guides', 'Restrooms'],
    activities: ['Safari', 'Bird Watching', 'Photography'],
  },
  {
    id: '4',
    name: 'Temple of the Tooth',
    description: 'Sacred Buddhist temple housing the relic of Buddha\'s tooth.',
    location: {
      latitude: 7.2936,
      longitude: 80.6413,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Temple_of_the_Tooth_Kandy.jpg/1280px-Temple_of_the_Tooth_Kandy.jpg',
    ],
    category: 'religious',
    rating: 4.9,
    reviews: 2876,
    duration: '1-2 hours',
    bestTimeToVisit: 'Morning or evening puja times',
    ticketPrice: {
      foreigners: 15,
      locals: 0,
      currency: 'USD'
    },
    facilities: ['Shoe Storage', 'Guides', 'Museum'],
    activities: ['Religious Ceremonies', 'Cultural Experience', 'Photography'],
  },
  {
    id: '5',
    name: 'Nine Arch Bridge',
    description: 'Iconic colonial-era railway bridge surrounded by tea plantations.',
    location: {
      latitude: 6.8789,
      longitude: 81.0642,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Nine_Arch_Bridge_Ella.jpg/1280px-Nine_Arch_Bridge_Ella.jpg',
    ],
    category: 'scenic',
    rating: 4.5,
    reviews: 1543,
    duration: '1-2 hours',
    bestTimeToVisit: 'Early morning',
    ticketPrice: {
      foreigners: 0,
      locals: 0,
      currency: 'USD'
    },
    facilities: ['Viewpoints', 'Tea Shops', 'Local Guides'],
    activities: ['Photography', 'Train Watching', 'Hiking'],
  },
  {
    id: '6',
    name: 'Mirissa Beach',
    description: 'Popular beach destination known for whale watching and surfing.',
    location: {
      latitude: 5.9483,
      longitude: 80.4589,
    },
    images: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Mirissa_Beach.jpg/1280px-Mirissa_Beach.jpg',
    ],
    category: 'beach',
    rating: 4.6,
    reviews: 2134,
    duration: 'Flexible',
    bestTimeToVisit: 'November to April',
    ticketPrice: {
      foreigners: 0,
      locals: 0,
      currency: 'USD'
    },
    facilities: ['Restaurants', 'Beach Bars', 'Water Sports', 'Hotels'],
    activities: ['Whale Watching', 'Surfing', 'Sunbathing', 'Snorkeling'],
  },
];

export const categories = [
  { id: 'heritage', name: 'Heritage Sites', icon: 'landmark' },
  { id: 'nature', name: 'Nature & Wildlife', icon: 'tree' },
  { id: 'religious', name: 'Religious Sites', icon: 'pray' },
  { id: 'scenic', name: 'Scenic Spots', icon: 'mountain' },
  { id: 'beach', name: 'Beaches', icon: 'umbrella-beach' },
];

export default destinations;
