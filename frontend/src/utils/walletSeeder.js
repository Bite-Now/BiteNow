const CANTEENS = ['Ashapura', 'Laxmi', 'Padma', 'Shine Star', 'Non-veg'];
const CATEGORIES = ['Food', 'Beverages', 'Snacks', 'Dessert'];

export const generateMockTransactions = () => {
    const transactions = [];
    const now = new Date();
    
    // Generate ~50 transactions over the last 6 months
    for (let i = 0; i < 50; i++) {
        // Random date within last 180 days
        const daysAgo = Math.floor(Math.random() * 180);
        const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        
        // Random amount between 50 and 300
        const amount = Math.floor(Math.random() * 250) + 50;
        
        const canteen = CANTEENS[Math.floor(Math.random() * CANTEENS.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        
        transactions.push({
            id: `tx-mock-${i}-${Date.now()}`,
            amount: amount,
            canteenId: canteen, // using name as ID for simplicity in charts
            category: category,
            timestamp: date.toISOString()
        });
    }
    
    // Sort by timestamp descending (newest first)
    return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};
