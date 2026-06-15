export const CANTEENS_MENU = {
  1: {
    name: 'Ashapura',
    description: 'Fast Food & Beverages',
    status: 'Open',
    waitTime: '5m',
    specials: [
      {
        id: 's1_1',
        name: 'Veg Burger Combo',
        price: 120,
        description: 'Burger with fries and a cold drink.',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        limited: true,
        time: '10 min'
      }
    ],
    categories: ['Fast Food', 'Beverages'],
    items: [
      {
        id: 'm1_1',
        name: 'Cheese Pizza',
        category: 'Fast Food',
        price: 150,
        rating: 4.2,
        time: '15 min',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm1_2',
        name: 'French Fries',
        category: 'Fast Food',
        price: 60,
        rating: 4.0,
        time: '5 min',
        image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm1_3',
        name: 'Coca Cola',
        category: 'Beverages',
        price: 40,
        rating: 4.5,
        time: '2 min',
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      }
    ]
  },
  2: {
    name: 'Laxmi',
    description: 'Authentic Thalis & Snacks',
    status: 'Open',
    waitTime: '15m',
    specials: [
      {
        id: 's2_1',
        name: 'Jumbo Samosa',
        price: 25,
        description: 'Crispy pastry filled with spiced potato and peas.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        limited: true,
        time: '5 min'
      },
      {
        id: 's2_2',
        name: 'Mini Thali',
        price: 80,
        description: 'Complete meal with Dal, Sabzi, Rice, and Roti.',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        limited: false,
        time: '15 min'
      }
    ],
    categories: ['Starters', 'Mains', 'Beverages'],
    items: [
      {
        id: 'm2_1',
        name: 'Paneer Tikka',
        category: 'Starters',
        price: 80,
        rating: 4.5,
        time: '15 min',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm2_2',
        name: 'Masala Dosa',
        category: 'Mains',
        price: 55,
        rating: 5,
        time: '10 min',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm2_3',
        name: 'Cold Coffee',
        category: 'Beverages',
        price: 45,
        rating: 4.0,
        time: '5 min',
        image: 'https://images.unsplash.com/photo-1461023058943-07cb1ce8db83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: true
      },
      {
        id: 'm2_4',
        name: 'Chole Bhature',
        category: 'Mains',
        price: 70,
        rating: 4.8,
        time: '20 min',
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      }
    ]
  },
  3: {
    name: 'Padma',
    description: 'Cafe & Bakery',
    status: 'Busy',
    waitTime: '25m',
    specials: [
      {
        id: 's3_1',
        name: 'Chocolate Truffle',
        price: 90,
        description: 'Rich dark chocolate pastry slice.',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        limited: true,
        time: '2 min'
      }
    ],
    categories: ['Bakery', 'Coffee'],
    items: [
      {
        id: 'm3_1',
        name: 'Croissant',
        category: 'Bakery',
        price: 65,
        rating: 4.6,
        time: '5 min',
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm3_2',
        name: 'Cappuccino',
        category: 'Coffee',
        price: 110,
        rating: 4.8,
        time: '10 min',
        image: 'https://images.unsplash.com/photo-1534687941688-651ccaafbff8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      }
    ]
  },
  4: {
    name: 'Shine Star',
    description: 'Desserts & Snacks',
    status: 'Open',
    waitTime: '10m',
    specials: [
      {
        id: 's4_1',
        name: 'Pani Puri Platters',
        price: 40,
        description: 'Spicy, tangy and sweet puri platters.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        limited: false,
        time: '5 min'
      }
    ],
    categories: ['Chaat', 'Desserts'],
    items: [
      {
        id: 'm4_1',
        name: 'Bhel Puri',
        category: 'Chaat',
        price: 45,
        rating: 4.3,
        time: '5 min',
        image: 'https://images.unsplash.com/photo-1645077271457-3a1ab943d67f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm4_2',
        name: 'Gulab Jamun',
        category: 'Desserts',
        price: 35,
        rating: 4.9,
        time: '2 min',
        image: 'https://images.unsplash.com/photo-1582285150917-29efd6f03eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      }
    ]
  },
  5: {
    name: 'Non-veg',
    description: 'Grill & Roast',
    status: 'Open',
    waitTime: '20m',
    specials: [
      {
        id: 's5_1',
        name: 'Tandoori Chicken',
        price: 250,
        description: 'Half chicken marinated and roasted in tandoor.',
        image: 'https://images.unsplash.com/photo-1599487405905-ce34199bd626?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        limited: true,
        time: '25 min'
      }
    ],
    categories: ['Grills', 'Curries', 'Breads'],
    items: [
      {
        id: 'm5_1',
        name: 'Chicken Tikka',
        category: 'Grills',
        price: 180,
        rating: 4.7,
        time: '20 min',
        image: 'https://images.unsplash.com/photo-1599487405905-ce34199bd626?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm5_2',
        name: 'Butter Chicken',
        category: 'Curries',
        price: 220,
        rating: 4.8,
        time: '15 min',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      },
      {
        id: 'm5_3',
        name: 'Garlic Naan',
        category: 'Breads',
        price: 45,
        rating: 4.5,
        time: '10 min',
        image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        soldOut: false
      }
    ]
  }
};

export const MOCK_ORDERS = [
  {
    id: "ORD-8492",
    canteenName: "Laxmi",
    status: "IN_QUEUE", // IN_QUEUE, PREPARING, READY
    items: [
      {
        id: "m2_1",
        name: "Paneer Tikka",
        quantity: 1,
        image: "https://images.unsplash.com/photo-1599487405620-8e10629a2016?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        status: "IN_QUEUE"
      },
      {
        id: "m2_2",
        name: "Cold Coffee",
        quantity: 2,
        image: "https://images.unsplash.com/photo-1461023058943-07cb1ceacd54?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        status: "READY"
      }
    ]
  }
];

export const MOCK_HISTORY = [
  {
    date: "Today",
    orders: [
      {
        id: "ORD-8401",
        canteenName: "Ashapura",
        total: 105,
        items: [
          { name: "Jumbo Samosa", quantity: 2, price: 25 },
          { name: "Mini Thali", quantity: 1, price: 55 }
        ]
      }
    ]
  },
  {
    date: "June 12, 2026",
    orders: [
      {
        id: "ORD-7392",
        canteenName: "Shine Star",
        total: 80,
        items: [
          { name: "Bhel Puri", quantity: 1, price: 40 },
          { name: "Gulab Jamun", quantity: 2, price: 20 }
        ]
      }
    ]
  }
];
