import { CANTEENS_MENU } from '../data/mockData';

/**
 * Generates a mystery deck of 5 combos based on a budget.
 * For simplicity, we create "combos" by picking 1-3 random items
 * from the canteens menu such that their total price is <= budget.
 */
export const generateSurpriseDeck = (budget) => {
    // Flatten all items and specials across all canteens
    const allItems = [];
    
    Object.values(CANTEENS_MENU).forEach(canteen => {
        if (canteen.specials) {
            canteen.specials.forEach(item => {
                allItems.push({ ...item, canteenName: canteen.name, type: 'special' });
            });
        }
        if (canteen.items) {
            canteen.items.forEach(item => {
                if (!item.soldOut) {
                    allItems.push({ ...item, canteenName: canteen.name, type: 'regular' });
                }
            });
        }
    });

    const deck = [];
    const labels = ["Chef's Secret", "Campus Favorite", "Budget Hero", "Today's Pick", "Hidden Gem"];

    // Generate 5 distinct mystery combos
    for (let i = 0; i < 5; i++) {
        // Shuffle allItems
        const shuffled = [...allItems].sort(() => 0.5 - Math.random());
        
        let comboPrice = 0;
        let comboItems = [];
        let comboName = "Mystery Combo";
        let mainImage = "";
        
        // Pick items until we hit budget or max 2 items per combo
        for (const item of shuffled) {
            if (comboPrice + item.price <= budget && comboItems.length < 2) {
                comboItems.push(item);
                comboPrice += item.price;
            }
        }
        
        // If we found at least 1 item
        if (comboItems.length > 0) {
            // Build a decent title and grab the image from the first item
            if (comboItems.length === 1) {
                comboName = comboItems[0].name;
                mainImage = comboItems[0].image;
            } else {
                comboName = `${comboItems[0].name} & ${comboItems[1].name}`;
                mainImage = comboItems[0].image;
            }

            deck.push({
                id: `mystery_${Date.now()}_${i}`,
                label: labels[i % labels.length],
                name: comboName,
                price: comboPrice,
                image: mainImage,
                matchScore: Math.floor(Math.random() * 15) + 85, // 85-99%
                source: comboItems[0].canteenName,
                time: comboItems[0].time || '5 min',
                items: comboItems // store the actual items so we can add them to the cart later
            });
        }
    }
    
    return deck;
};
