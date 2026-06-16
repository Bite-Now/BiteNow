export const monthlyData = [
  { name: 'Jan', earnings: 400, orders: 240 },
  { name: 'Feb', earnings: 300, orders: 139 },
  { name: 'Mar', earnings: 200, orders: 980 },
  { name: 'Apr', earnings: 278, orders: 390 },
  { name: 'May', earnings: 189, orders: 480 },
  { name: 'Jun', earnings: 239, orders: 380 },
  { name: 'Jul', earnings: 349, orders: 430 },
];

export const yearlyData = [
  { name: '2021', earnings: 4000, orders: 2400 },
  { name: '2022', earnings: 3000, orders: 1398 },
  { name: '2023', earnings: 2000, orders: 9800 },
  { name: '2024', earnings: 2780, orders: 3908 },
];

export const topItems = [
    { name: "Spicy Ramen", orders: 120, trend: "+12%" },
    { name: "Iced Coffee", orders: 85, trend: "+5%" },
    { name: "Chicken Curry", orders: 60, trend: "-2%" },
    { name: "Cheese Burger", orders: 45, trend: "+1%" }
];

export const dashboardStats = {
    earnings: "₹1,020,490",
    ordersCompleted: "3,765",
    ordersPending: "15",
    batchingEfficiency: "92%"
};

export const initialPendingBatches = [
    {
        id: "B-101",
        itemName: "Spicy Ramen",
        quantity: 5,
        timeReceived: "10:30 AM",
        orders: ["#1042", "#1043", "#1045", "#1048", "#1050"]
    },
    {
        id: "B-102",
        itemName: "Iced Coffee",
        quantity: 3,
        timeReceived: "10:35 AM",
        orders: ["#1044", "#1046", "#1047"]
    },
    {
        id: "B-103",
        itemName: "Chicken Curry",
        quantity: 2,
        timeReceived: "10:40 AM",
        orders: ["#1049", "#1051"]
    }
];

export const initialSuccessfulBatches = [
    {
        id: "B-098",
        itemName: "Cheese Burger",
        quantity: 4,
        timeReceived: "09:15 AM",
        completedAt: "09:30 AM",
        orders: ["#1022", "#1023", "#1025", "#1030"]
    },
    {
        id: "B-099",
        itemName: "Spicy Ramen",
        quantity: 6,
        timeReceived: "09:40 AM",
        completedAt: "09:55 AM",
        orders: ["#1031", "#1032", "#1033", "#1035", "#1038", "#1040"]
    }
];

export const mockVendorProducts = {
    specialMenu: [
        { 
            id: "p1", 
            name: "Spicy Ramen", 
            description: "Authentic spicy ramen with boiled egg, nori, and chashu pork.",
            image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=200&q=80",
            price: "₹120", 
            inStock: true, 
            cap: 50 
        },
        { 
            id: "p2", 
            name: "Iced Coffee", 
            description: "Cold brewed coffee served over ice with a splash of milk.",
            image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=200&q=80",
            price: "₹80", 
            inStock: false, 
            cap: 20 
        }
    ],
    categories: [
        {
            id: "c1",
            name: "Fruits 🍎",
            items: [
                { id: "f1", name: "Apples", description: "Fresh red apples", price: "₹100", inStock: true },
                { id: "f2", name: "Bananas", description: "Yellow ripe bananas", price: "₹60", inStock: true },
                { id: "f3", name: "Oranges", description: "Juicy oranges", price: "₹80", inStock: false },
                { id: "f4", name: "Berries", description: "Mixed fresh berries", price: "₹150", inStock: true },
                { id: "f5", name: "Mangoes", description: "Sweet alphonso mangoes", price: "₹200", inStock: true }
            ]
        },
        {
            id: "c2",
            name: "Vegetables 🥦",
            items: [
                { id: "v1", name: "Carrots", description: "Crunchy orange carrots", price: "₹40", inStock: true },
                { id: "v2", name: "Spinach", description: "Fresh green spinach", price: "₹30", inStock: true },
                { id: "v3", name: "Broccoli", description: "Healthy green broccoli", price: "₹120", inStock: false },
                { id: "v4", name: "Tomatoes", description: "Ripe red tomatoes", price: "₹50", inStock: true },
                { id: "v5", name: "Cucumbers", description: "Cool and crisp cucumbers", price: "₹40", inStock: true }
            ]
        },
        {
            id: "c3",
            name: "Grains & Cereals 🌾",
            items: [
                { id: "g1", name: "Rice", description: "Premium basmati rice", price: "₹80", inStock: true },
                { id: "g2", name: "Wheat", description: "Whole wheat flour", price: "₹50", inStock: true },
                { id: "g3", name: "Oats", description: "Healthy rolled oats", price: "₹150", inStock: true },
                { id: "g4", name: "Barley", description: "Pearl barley grains", price: "₹90", inStock: false },
                { id: "g5", name: "Corn", description: "Sweet corn kernels", price: "₹60", inStock: true }
            ]
        },
        {
            id: "c4",
            name: "Protein Foods 🍗",
            items: [
                { id: "pr1", name: "Meat", description: "Fresh tender cuts", price: "₹350", inStock: true },
                { id: "pr2", name: "Poultry", description: "Farm fresh chicken", price: "₹250", inStock: true },
                { id: "pr3", name: "Fish", description: "Fresh catch of the day", price: "₹400", inStock: false },
                { id: "pr4", name: "Eggs", description: "Farm fresh brown eggs", price: "₹70", inStock: true },
                { id: "pr5", name: "Beans", description: "Kidney and black beans", price: "₹90", inStock: true },
                { id: "pr6", name: "Lentils", description: "Yellow and red lentils", price: "₹120", inStock: true },
                { id: "pr7", name: "Nuts", description: "Mixed roasted nuts", price: "₹500", inStock: true }
            ]
        },
        {
            id: "c5",
            name: "Dairy Products 🥛",
            items: [
                { id: "d1", name: "Milk", description: "Full cream cow milk", price: "₹65", inStock: true },
                { id: "d2", name: "Cheese", description: "Cheddar cheese block", price: "₹250", inStock: true },
                { id: "d3", name: "Yogurt", description: "Probiotic plain yogurt", price: "₹45", inStock: true },
                { id: "d4", name: "Butter", description: "Salted creamy butter", price: "₹150", inStock: false }
            ]
        },
        {
            id: "c6",
            name: "Fats & Oils 🫒",
            items: [
                { id: "fo1", name: "Olive oil", description: "Extra virgin olive oil", price: "₹600", inStock: true },
                { id: "fo2", name: "Coconut oil", description: "Cold pressed coconut oil", price: "₹300", inStock: true },
                { id: "fo3", name: "Avocado", description: "Fresh hass avocado", price: "₹150", inStock: false },
                { id: "fo4", name: "Nuts", description: "Raw almonds and walnuts", price: "₹450", inStock: true },
                { id: "fo5", name: "Seeds", description: "Chia and flax seeds mix", price: "₹200", inStock: true }
            ]
        },
        {
            id: "c7",
            name: "Sugars & Sweets 🍬",
            items: [
                { id: "s1", name: "Candy", description: "Assorted fruit candies", price: "₹50", inStock: true },
                { id: "s2", name: "Cakes", description: "Chocolate sponge cake", price: "₹400", inStock: true },
                { id: "s3", name: "Cookies", description: "Choco chip cookies", price: "₹120", inStock: true },
                { id: "s4", name: "Chocolate", description: "Dark chocolate bar", price: "₹150", inStock: false },
                { id: "s5", name: "Sugar", description: "Refined white sugar", price: "₹45", inStock: true }
            ]
        },
        {
            id: "c8",
            name: "Beverages ☕",
            items: [
                { id: "b1", name: "Water", description: "Mineral water bottle", price: "₹20", inStock: true },
                { id: "b2", name: "Tea", description: "Green and black tea bags", price: "₹180", inStock: true },
                { id: "b3", name: "Coffee", description: "Instant coffee powder", price: "₹250", inStock: true },
                { id: "b4", name: "Juice", description: "Fresh fruit juice", price: "₹90", inStock: false },
                { id: "b5", name: "Soft drinks", description: "Carbonated beverages", price: "₹40", inStock: true }
            ]
        },
        {
            id: "c9",
            name: "Herbs, Spices & Condiments 🌿",
            items: [
                { id: "h1", name: "Pepper", description: "Black pepper corns", price: "₹150", inStock: true },
                { id: "h2", name: "Cinnamon", description: "Cinnamon sticks", price: "₹120", inStock: true },
                { id: "h3", name: "Basil", description: "Dried basil leaves", price: "₹80", inStock: true },
                { id: "h4", name: "Ketchup", description: "Tomato ketchup bottle", price: "₹130", inStock: false },
                { id: "h5", name: "Mustard", description: "Yellow mustard sauce", price: "₹100", inStock: true }
            ]
        },
        {
            id: "c10",
            name: "Processed & Convenience Foods 🍕",
            items: [
                { id: "pc1", name: "Chips", description: "Potato chips pack", price: "₹30", inStock: true },
                { id: "pc2", name: "Instant noodles", description: "Spicy instant noodles", price: "₹25", inStock: true },
                { id: "pc3", name: "Frozen meals", description: "Ready to eat frozen meals", price: "₹250", inStock: true },
                { id: "pc4", name: "Fast food", description: "Burger and fries combo", price: "₹199", inStock: false }
            ]
        }
    ]
};

export const payoutHistory = [
    { id: "TXN-001", date: "15 Jun, 2026", amount: "₹45,200", status: "Completed" },
    { id: "TXN-002", date: "08 Jun, 2026", amount: "₹38,900", status: "Completed" },
    { id: "TXN-003", date: "01 Jun, 2026", amount: "₹41,150", status: "Pending" }
];

export const vendorStaff = [
    { id: "s1", name: "Rahul Sharma", role: "Manager", status: "Active" },
    { id: "s2", name: "Priya Patel", role: "Chef", status: "Active" },
    { id: "s3", name: "Amit Kumar", role: "Cashier", status: "Pending Reset" }
];
