import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useWalletStore } from '../store/useWalletStore';
import { getCanteenMenu } from '../services/menuApi';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';

const Canteen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [canteenData, setCanteenData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('');
    
    const cartItems = useCartStore((state) => state.items);
    const addToCart = useCartStore((state) => state.addToCart);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);
    
    // Budget Mode state
    const [budgetMode, setBudgetMode] = useState(false);
    const currentBalance = useWalletStore((state) => state.remainingBalance);

    useEffect(() => {
        const fetchCanteenMenu = async () => {
            try {
                const data = await getCanteenMenu(id);
                setCanteenData(data);
                const categories = Object.keys(data.menu);
                if (categories.length > 0) {
                    setActiveCategory(categories[0]);
                }
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch canteen menu:", err);
                if (err.response && err.response.status === 404) {
                    setError("Menu Not Found");
                } else {
                    setError("Failed to load menu. Please try again.");
                }
                setIsLoading(false);
            }
        };

        fetchCanteenMenu();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <div className="bg-error-container text-on-error-container p-6 rounded-2xl text-center shadow-lg">
                    <span className="material-symbols-outlined text-4xl mb-2">error</span>
                    <h2 className="font-bold text-xl">{error}</h2>
                    <button onClick={() => navigate('/home')} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-full font-bold shadow-md hover:opacity-90">Back to Home</button>
                </div>
            </div>
        );
    }

    if (!canteenData) return null;

    const { canteen, specials, menu } = canteenData;
    const categories = Object.keys(menu);
    const filteredItems = menu[activeCategory] || [];

    // Determine masonry columns
    const col1 = filteredItems.filter((_, i) => i % 2 === 0);
    const col2 = filteredItems.filter((_, i) => i % 2 !== 0);

    return (
        <div className="font-body-md relative flex flex-col pb-[100px] min-h-screen">
            {/* Top Navigation */}

            {/* Main Content Canvas */}
            <main className="px-container-margin flex flex-col gap-lg pt-4 pb-12">
            <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex justify-between items-center px-container-margin py-md border-b border-outline-variant/10">
                <button 
                    onClick={() => navigate('/home')}
                    className="text-primary dark:text-primary-fixed-dim hover:opacity-80 transition-opacity active:scale-95 duration-200 flex items-center justify-center p-2 -ml-2 rounded-full"
                >
                    <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
                </button>
                <h1 className="font-headline-md text-headline-md-mobile font-bold text-primary dark:text-primary-fixed-dim absolute left-1/2 -translate-x-1/2">
                    {canteen.name}
                </h1>
                <div className="w-10"></div>
            </header>
                
                {!canteen.is_open && (
                    <div className="bg-error-container text-on-error-container p-4 rounded-xl text-center shadow-sm -mt-2 mb-2 font-bold flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">gpp_maybe</span>
                        This canteen is currently closed. Orders cannot be placed.
                    </div>
                )}

                {/* Specials Carousel */}
                {specials && specials.length > 0 && (
                    <section>
                        <div className="flex justify-between items-end mb-sm">
                            <h2 className="font-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface text-headline-md-mobile">Today's Specials</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-md no-scrollbar pb-sm snap-x">
                            {specials.map(special => (
                                <div key={special.id} className={`min-w-[280px] w-[280px] md:w-[320px] bg-surface-container-low rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-surface-container-highest snap-start relative flex-shrink-0 group ${!special.is_available ? 'opacity-60 grayscale-[50%]' : ''}`}>
                                    <div className="h-[160px] bg-surface-variant relative overflow-hidden rounded-t-[12px] m-xs">
                                        <img src={special.image_url || DEFAULT_IMAGE} alt={special.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!special.is_available ? 'grayscale' : ''}`} />
                                    </div>
                                    <div className="p-md flex flex-col gap-xs">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-label-md text-label-md text-on-surface">{special.name}</h3>
                                            <span className={`font-label-md text-label-md ${!special.is_available ? 'text-on-surface-variant line-through' : 'text-primary-container'}`}>₹{special.price}</span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{special.description}</p>
                                        
                                        {!special.is_available ? (
                                            <div className="mt-sm w-full py-2 flex justify-center items-center">
                                                <span className="px-3 py-1 rounded text-[12px] font-bold bg-surface-variant text-on-surface-variant uppercase tracking-wider">Sold Out</span>
                                            </div>
                                        ) : !canteen.is_open ? (
                                            <div className="mt-sm w-full py-2 flex justify-center items-center">
                                                <span className="px-3 py-1 rounded text-[12px] font-bold bg-surface-variant text-on-surface-variant uppercase tracking-wider">Closed</span>
                                            </div>
                                        ) : (
                                            <button onClick={() => addToCart({ ...special, image: special.image_url || DEFAULT_IMAGE }, id)} className="mt-sm w-full bg-surface-bright text-on-surface font-label-md text-label-md py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors flex justify-center items-center gap-2 border border-outline-variant/30">
                                                <span className="material-symbols-outlined" data-icon="add">add</span> Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Category Filter & Budget Toggle */}
                {categories.length > 0 && (
                    <section className="sticky top-[70px] z-40 bg-background/90 backdrop-blur-md py-sm -mx-container-margin px-container-margin flex flex-col gap-3">
                        <div className="flex justify-between items-center w-full bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-500 text-xl">account_balance_wallet</span>
                                <span className="text-slate-300 font-label-md">Budget Mode</span>
                            </div>
                            <div className="flex items-center gap-3">
                                {budgetMode && <span className="text-green-400 font-label-md">₹{currentBalance} left</span>}
                                <button 
                                    onClick={() => setBudgetMode(!budgetMode)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors relative flex items-center ${budgetMode ? 'bg-green-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${budgetMode ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-sm overflow-x-auto no-scrollbar">
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={`px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(255,159,67,0.2)]' : 'bg-surface-container-high text-on-surface-variant border border-outline-variant/50 hover:bg-surface-bright'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Menu Masonry Grid */}
                {categories.length > 0 ? (
                    <section className="flex flex-col mb-12">
                        <h3 className="font-label-md text-on-surface-variant mb-6 uppercase tracking-wider text-label-sm">{activeCategory}</h3>
                        <div className="flex gap-4 items-start mt-12">
                            {/* Column 1 */}
                            <div className="flex-1 flex flex-col gap-14">
                                {col1.map(item => <MenuItem key={item.id} item={item} addToCart={() => addToCart({ ...item, image: item.image_url || DEFAULT_IMAGE }, id)} removeFromCart={() => removeFromCart(item.id)} quantity={cartItems.find(i => i.id === item.id)?.quantity || 0} budgetMode={budgetMode} currentBalance={currentBalance} canteenOpen={canteen.is_open} />)}
                            </div>
                            {/* Column 2 (Staggered) */}
                            <div className="flex-1 flex flex-col gap-14 mt-12">
                                {col2.map(item => <MenuItem key={item.id} item={item} addToCart={() => addToCart({ ...item, image: item.image_url || DEFAULT_IMAGE }, id)} removeFromCart={() => removeFromCart(item.id)} quantity={cartItems.find(i => i.id === item.id)?.quantity || 0} budgetMode={budgetMode} currentBalance={currentBalance} canteenOpen={canteen.is_open} />)}
                            </div>
                        </div>
                    </section>
                ) : (
                    <div className="text-center py-20 text-on-surface-variant">
                        <p>No items available in this menu yet.</p>
                    </div>
                )}

            </main>

        </div>
    );
};

const MenuItem = ({ item, addToCart, removeFromCart, quantity, budgetMode, currentBalance, canteenOpen }) => {
    const isOverBudget = budgetMode && item.price > currentBalance;
    const isUnavailable = !item.is_available || isOverBudget || !canteenOpen;

    return (
        <div className={`bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-4 pt-14 relative flex flex-col items-center text-center shadow-lg ${isUnavailable ? 'opacity-60 grayscale-[50%]' : 'hover:bg-surface-container-low transition-colors'}`}>
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-[100px] h-[100px] rounded-full overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.4)] border-[6px] border-surface-container-lowest bg-surface-variant ${isUnavailable ? 'grayscale' : ''}`}>
                <img src={item.image_url || DEFAULT_IMAGE} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-label-md text-on-surface mt-2 line-clamp-1">{item.name}</h3>
            
            {!item.is_available && (
                <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-surface-variant text-on-surface-variant uppercase tracking-wider">Sold Out</span>
            )}
            
            {isOverBudget && item.is_available && (
                <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-red-900/50 text-red-400 uppercase tracking-wider border border-red-900/50">Over Budget</span>
            )}

            {!isUnavailable && (
                <div className="flex gap-0.5 text-primary-container mt-1">
                    {[1,2,3,4,5].map(star => (
                        <span key={star} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {star <= 4.5 ? 'star' : (star - 0.5 <= 4.5 ? 'star_half' : 'star_outline')}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-1 text-on-surface-variant mt-2 font-body-sm text-[12px]">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                15m
            </div>

            <div className="flex items-center justify-between w-full mt-4 bg-surface-container-low px-2 py-2 rounded-xl border border-surface-container-highest">
                <span className={`font-label-md ${isUnavailable ? 'text-on-surface-variant line-through' : 'text-primary-container ml-1'}`}>₹{item.price}</span>
                
                {!isUnavailable && quantity === 0 && (
                    <button onClick={addToCart} className="w-7 h-7 rounded-full bg-surface-bright text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                )}

                {!isUnavailable && quantity > 0 && (
                    <div className="flex items-center bg-surface-container-high rounded-full border border-outline-variant/30 h-7">
                        <button onClick={removeFromCart} className="w-6 h-full flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="font-label-sm text-label-sm text-on-surface px-0.5 min-w-[16px] text-center">{quantity}</span>
                        <button onClick={addToCart} className="w-6 h-full flex items-center justify-center text-primary-container hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Canteen;
