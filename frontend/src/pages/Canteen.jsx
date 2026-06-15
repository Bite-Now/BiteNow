import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CANTEENS_MENU } from '../data/mockData';
import { useCartStore } from '../store/useCartStore';

const Canteen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const canteen = CANTEENS_MENU[id] || CANTEENS_MENU[1]; // fallback to 1 if not found

    const [activeCategory, setActiveCategory] = useState(canteen.categories[0]);
    
    const cartItems = useCartStore((state) => state.items);
    const addToCart = useCartStore((state) => state.addToCart);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);

    const filteredItems = canteen.items.filter(item => item.category === activeCategory);
    const totalItems = getTotalItems();

    // Determine masonry columns
    const col1 = filteredItems.filter((_, i) => i % 2 === 0);
    const col2 = filteredItems.filter((_, i) => i % 2 !== 0);

    return (
        <div className="font-body-md relative flex flex-col pb-[100px]">
            {/* Top Navigation */}
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

            {/* Main Content Canvas */}
            <main className="px-container-margin flex flex-col gap-lg pt-4 pb-12">
                
                {/* Specials Carousel */}
                {canteen.specials && canteen.specials.length > 0 && (
                    <section>
                        <div className="flex justify-between items-end mb-sm">
                            <h2 className="font-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface text-headline-md-mobile">Today's Specials</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-md no-scrollbar pb-sm snap-x">
                            {canteen.specials.map(special => (
                                <div key={special.id} className="min-w-[280px] w-[280px] md:w-[320px] bg-surface-container-low rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.2)] border border-surface-container-highest snap-start relative flex-shrink-0 group">
                                    <div className="h-[160px] bg-surface-variant relative overflow-hidden rounded-t-[12px] m-xs">
                                        <img src={special.image} alt={special.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {special.limited && (
                                            <div className="absolute top-sm left-sm bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm bg-opacity-90">
                                                <span className="material-symbols-outlined text-[14px]" data-icon="timer">timer</span>
                                                Limited
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-md flex flex-col gap-xs">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-label-md text-label-md text-on-surface">{special.name}</h3>
                                            <span className="font-label-md text-label-md text-primary-container">₹{special.price}</span>
                                        </div>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{special.description}</p>
                                        <button onClick={() => addToCart(special, id)} className="mt-sm w-full bg-surface-bright text-on-surface font-label-md text-label-md py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors flex justify-center items-center gap-2 border border-outline-variant/30">
                                            <span className="material-symbols-outlined" data-icon="add">add</span> Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Category Filter */}
                <section className="sticky top-[70px] z-40 bg-background/90 backdrop-blur-md py-sm -mx-container-margin px-container-margin">
                    <div className="flex gap-sm overflow-x-auto no-scrollbar">
                        {canteen.categories.map(cat => (
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

                {/* Menu Masonry Grid */}
                <section className="flex flex-col mb-12">
                    <h3 className="font-label-md text-on-surface-variant mb-6 uppercase tracking-wider text-label-sm">{activeCategory}</h3>
                    <div className="flex gap-4 items-start mt-12">
                        {/* Column 1 */}
                        <div className="flex-1 flex flex-col gap-14">
                            {col1.map(item => <MenuItem key={item.id} item={item} addToCart={() => addToCart(item, id)} removeFromCart={() => removeFromCart(item.id)} quantity={cartItems.find(i => i.id === item.id)?.quantity || 0} />)}
                        </div>
                        {/* Column 2 (Staggered) */}
                        <div className="flex-1 flex flex-col gap-14 mt-12">
                            {col2.map(item => <MenuItem key={item.id} item={item} addToCart={() => addToCart(item, id)} removeFromCart={() => removeFromCart(item.id)} quantity={cartItems.find(i => i.id === item.id)?.quantity || 0} />)}
                        </div>
                    </div>
                </section>

            </main>

        </div>
    );
};

const MenuItem = ({ item, addToCart, removeFromCart, quantity }) => {
    return (
        <div className={`bg-surface-container-lowest border border-surface-container-highest rounded-2xl p-4 pt-14 relative flex flex-col items-center text-center shadow-lg ${item.soldOut ? 'opacity-60' : 'hover:bg-surface-container-low transition-colors'}`}>
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-[100px] h-[100px] rounded-full overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.4)] border-[6px] border-surface-container-lowest bg-surface-variant ${item.soldOut ? 'grayscale' : ''}`}>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-label-md text-on-surface mt-2 line-clamp-1">{item.name}</h3>
            
            {item.soldOut && (
                <span className="px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-surface-variant text-on-surface-variant uppercase tracking-wider">Sold Out</span>
            )}

            {!item.soldOut && (
                <div className="flex gap-0.5 text-primary-container mt-1">
                    {[1,2,3,4,5].map(star => (
                        <span key={star} className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {star <= item.rating ? 'star' : (star - 0.5 <= item.rating ? 'star_half' : 'star_outline')}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-1 text-on-surface-variant mt-2 font-body-sm text-[12px]">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {item.time}
            </div>

            <div className="flex items-center justify-between w-full mt-4 bg-surface-container-low px-2 py-2 rounded-xl border border-surface-container-highest">
                <span className={`font-label-md ${item.soldOut ? 'text-on-surface-variant line-through' : 'text-primary-container ml-1'}`}>₹{item.price}</span>
                
                {!item.soldOut && quantity === 0 && (
                    <button onClick={addToCart} className="w-7 h-7 rounded-full bg-surface-bright text-on-surface flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                )}

                {!item.soldOut && quantity > 0 && (
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
