import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { generateSurpriseDeck } from '../utils/surpriseGenerator';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';

const GENERATION_TEXTS = [
    "Analyzing order history...",
    "Checking favorite meals...",
    "Finding budget-friendly picks...",
    "Generating surprises..."
];

const POPULAR_PICKS = [
    { emoji: '🍕', label: 'Pizza', price: 'From ₹149' },
    { emoji: '🍔', label: 'Burger', price: 'From ₹99' },
    { emoji: '🥤', label: 'Cold Coffee', price: 'From ₹79' },
    { emoji: '🥗', label: 'Healthy Bowl', price: 'From ₹199' },
    { emoji: '🌮', label: 'Wrap', price: 'From ₹129' },
    { emoji: '🍟', label: 'Fries', price: 'From ₹89' },
];

const BackgroundParticles = () => {
    const particles = Array.from({ length: 15 });
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-primary/30 rounded-full blur-[1px]"
                    style={{
                        width: Math.random() * 6 + 2 + 'px',
                        height: Math.random() * 6 + 2 + 'px',
                        left: Math.random() * 100 + '%',
                        top: Math.random() * 100 + '%',
                    }}
                    animate={{
                        y: [0, -100 - Math.random() * 100],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10,
                    }}
                />
            ))}
        </div>
    );
};

const PopularPicksCarousel = () => {
    // Duplicate array for seamless infinite scrolling
    const items = [...POPULAR_PICKS, ...POPULAR_PICKS];

    return (
        <div className="w-full mt-24 mb-2 z-10 flex flex-col items-center pointer-events-none">
            <h3 className="text-white/40 font-label-sm uppercase tracking-widest mb-4">Today's Popular Picks</h3>
            <div 
                className="w-full overflow-hidden relative"
                style={{ 
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' 
                }}
            >
                <motion.div 
                    className="flex w-max"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                >
                    {items.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center w-[110px] bg-white/5 border border-white/5 rounded-[16px] p-3 mx-2 backdrop-blur-sm">
                            <span className="text-[32px] mb-2">{item.emoji}</span>
                            <span className="text-white/80 font-label-md text-[13px] text-center">{item.label}</span>
                            <span className="text-primary/70 font-label-sm text-[10px]">{item.price}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

// Helper for dynamic tags removed
const Surprise = () => {
    const navigate = useNavigate();
    const { addToCart, getTotalItems } = useCartStore();
    const totalCartItems = getTotalItems();
    
    // State
    const [flowState, setFlowState] = useState('setup'); // setup, generating, active, empty
    const [budget, setBudget] = useState(120);
    const [deck, setDeck] = useState([]);
    const [showLocalCart, setShowLocalCart] = useState(false);
    const [cartPulse, setCartPulse] = useState(false);
    
    // Track direction for the exit animation of swiped cards
    const [lastSwipeDirection, setLastSwipeDirection] = useState(null);

    // Handlers
    const handleSurpriseMe = () => {
        setFlowState('generating');
    };

    const handleGenerationComplete = () => {
        setDeck(generateSurpriseDeck(budget));
        setFlowState('active');
    };

    const handleSuggestAgain = () => {
        setFlowState('setup');
        setShowLocalCart(false);
    };

    // Card Swipe Logic
    const handleSwipe = (cardId, direction, items) => {
        setLastSwipeDirection(direction);
        
        // Remove card from deck (AnimatePresence will handle the exit animation)
        setDeck(prev => prev.filter(c => c.id !== cardId));
        
        if (direction === 'right') {
            // Add items to cart
            items.forEach(item => {
                addToCart(item, item.canteenId || 'c1');
            });
            
            // Trigger cart pop-in and pulse
            setShowLocalCart(true);
            setCartPulse(true);
            setTimeout(() => setCartPulse(false), 2000); // stop glowing after 2s
        }
    };

    // When deck empties in active state
    useEffect(() => {
        if (flowState === 'active' && deck.length === 0) {
            // Wait a moment for the last card to animate out
            const timer = setTimeout(() => {
                setFlowState('empty');
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [deck, flowState]);

    // Helper removed
    return (
        <div className="absolute inset-0 bg-background text-on-surface flex flex-col items-center justify-center overflow-hidden pt-safe pb-[90px] perspective-[1000px]">
            {/* Header stays static */}
            <div className="absolute top-8 left-0 right-0 px-6 text-center z-10 pointer-events-none">
                <h1 className="text-white font-headline-lg-mobile tracking-tight">✨ Surprise Me</h1>
                <p className="text-white/60 font-body-sm mt-1">"Let AI build your next meal."</p>
                {flowState === 'setup' && (
                    <div className="mt-4 inline-block bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
                        <p className="text-primary font-label-sm text-[10px]">Personalized using your budget & favorites.</p>
                    </div>
                )}
            </div>

            {/* Particles only in setup phase */}
            {flowState === 'setup' && <BackgroundParticles />}

            <AnimatePresence mode="wait">
                {/* SETUP PHASE */}
                {flowState === 'setup' && (
                    <motion.div 
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40, scale: 0.95 }}
                        className="w-full flex flex-col items-center h-full pt-10 px-6 justify-center"
                    >
                        {/* 1. Live Carousel */}
                        <PopularPicksCarousel />

                        {/* 2. Sleek Budget Form */}
                        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center mt-10 text-center z-10">
                            <h2 className="text-white font-headline-md mb-2 text-[28px] font-bold tracking-tight">What's your budget?</h2>
                            <p className="text-white/40 font-body-sm mb-12">We'll find the perfect meal for you</p>

                            <div className="w-full text-left mb-6">
                                <label className="text-white/30 font-label-sm uppercase tracking-widest text-[10px] mb-2 block">Enter your budget</label>
                                <div className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent mb-4"></div>
                                
                                <div className="bg-[#1a1a1a] rounded-[12px] p-4 flex items-center border border-white/5 shadow-inner transition-colors focus-within:bg-[#222]">
                                    <span className="text-white/40 font-headline-sm mr-2 ml-2">₹</span>
                                    <input 
                                        type="number"
                                        placeholder="e.g. 150"
                                        className="bg-transparent border-none outline-none text-white font-headline-sm w-full placeholder:text-white/20 pl-2"
                                        value={budget || ""}
                                        onChange={(e) => setBudget(Number(e.target.value))}
                                        min="50"
                                        max="2000"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSurpriseMe}
                                className="w-full bg-[#f96b24] text-white font-label-md text-[16px] py-4 rounded-[12px] flex items-center justify-center shadow-[0_0_30px_rgba(249,107,36,0.3)] active:scale-95 transition-all hover:bg-[#ff7b38]"
                            >
                                <span className="mr-2">✨</span> SURPRISE ME <span className="ml-2 font-bold text-[20px]">→</span>
                            </button>

                            <p className="text-white/30 font-body-sm text-[11px] mt-6">We'll pick a random delicious meal within your range</p>
                        </div>
                    </motion.div>
                )}

                {/* GENERATING PHASE */}
                {flowState === 'generating' && (
                    <GenerationSequences key="generating" onComplete={handleGenerationComplete} />
                )}

                {/* ACTIVE PHASE (DECK) */}
                {flowState === 'active' && (
                    <motion.div 
                        key="active"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-[400px] relative flex justify-center items-center mt-12"
                    >
                        <div className="absolute -top-12 text-center w-full z-0">
                            <p className="text-white/50 font-label-md">{deck.length} Picks Left</p>
                        </div>
                        
                        <AnimatePresence>
                            {/* We map the deck backwards so index 0 is rendered last (on top) */}
                            {[...deck].reverse().map((card, idx) => {
                                const isTop = idx === deck.length - 1; 
                                return (
                                    <SwipeableCard 
                                        key={card.id} 
                                        card={card} 
                                        isTop={isTop} 
                                        index={deck.length - 1 - idx} 
                                        onSwipe={handleSwipe}
                                        swipeDirection={lastSwipeDirection}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* EMPTY PHASE */}
                {flowState === 'empty' && (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full px-6 flex flex-col items-center mt-20 text-center"
                    >
                        <span className="text-[64px] mb-4">✨</span>
                        <h2 className="text-white font-headline-lg-mobile mb-2">No perfect match yet</h2>
                        <p className="text-white/60 font-body-md mb-8">Let's generate another round.</p>
                        
                        <button 
                            onClick={handleSuggestAgain}
                            className="bg-surface-bright text-white px-8 py-3 rounded-full font-label-md active:scale-95 transition-transform"
                        >
                            Suggest Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LOCALIZED CART BUTTON */}
            <AnimatePresence>
                {showLocalCart && totalCartItems > 0 && flowState !== 'generating' && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0, y: 50 }}
                        animate={{ 
                            opacity: 1, 
                            scale: 1, 
                            y: 0,
                            boxShadow: cartPulse ? '0 0 30px rgba(255, 159, 67, 0.6)' : '0 8px 32px rgba(0,0,0,0.5)'
                        }}
                        exit={{ opacity: 0, scale: 0, y: 50 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onClick={() => navigate('/cart')}
                        className={`absolute bottom-28 right-6 z-50 bg-primary-container text-on-primary-container w-14 h-14 rounded-full flex items-center justify-center border border-primary/20 ${cartPulse ? 'animate-pulse' : ''}`}
                    >
                        <span className="material-symbols-outlined text-[28px]">shopping_cart</span>
                        <span className="absolute -top-2 -right-2 bg-error text-on-error font-label-sm text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                            {totalCartItems}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- CINEMATIC GENERATION SEQUENCES ---
const GenerationSequences = ({ onComplete }) => {
    const [type] = useState(() => Math.random() > 0.5 ? 'A' : 'B');
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        // Change text every 600ms
        const interval = setInterval(() => {
            setTextIndex(prev => Math.min(prev + 1, GENERATION_TEXTS.length - 1));
        }, 600);

        // Sequence runs for ~2.5 seconds total
        const timeout = setTimeout(() => {
            onComplete();
        }, 2500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none perspective-[1000px]"
        >
            {/* Background Ambient Glow */}
            <motion.div 
                animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute w-[300px] h-[300px] bg-primary/30 rounded-full blur-[80px]"
            />

            <AnimatePresence mode="wait">
                <motion.h2 
                    key={textIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[20%] text-white font-headline-md text-center px-8 z-30 drop-shadow-lg"
                >
                    {GENERATION_TEXTS[textIndex]}
                </motion.h2>
            </AnimatePresence>

            {type === 'A' ? <CardStormShuffle /> : <CosmicAssembly />}
        </motion.div>
    );
};

const CardStormShuffle = () => {
    // 5 cards entering from random off-screen coordinates, crossing, and finally stacking in the center.
    const startCoords = [
        { x: -500, y: -300 },
        { x: 500, y: -200 },
        { x: -400, y: 400 },
        { x: 500, y: 400 },
        { x: 0, y: -600 }
    ];

    return (
        <div className="relative w-full h-[400px] flex items-center justify-center">
            {startCoords.map((coord, i) => (
                <motion.div
                    key={i}
                    initial={{ x: coord.x, y: coord.y, rotate: Math.random() * 90 - 45, opacity: 0, scale: 0.5 }}
                    animate={{ 
                        x: [coord.x, -coord.x * 0.5, 0], // cross over the center
                        y: [coord.y, -coord.y * 0.5, i * 5], 
                        rotate: [Math.random() * 90 - 45, Math.random() * 360, 0],
                        opacity: [0, 1, 1],
                        scale: [0.5, 1.2, 1 - (i * 0.05)]
                    }}
                    transition={{ 
                        duration: 2, 
                        times: [0, 0.6, 1], 
                        ease: "easeInOut",
                        delay: i * 0.1 
                    }}
                    className="absolute w-[200px] h-[280px] bg-surface-container-low border-2 border-primary/30 rounded-[16px] shadow-[0_0_20px_rgba(255,159,67,0.2)] flex items-center justify-center"
                    style={{ zIndex: 5 - i }}
                >
                    {/* Mystery Back Cover Design */}
                    <div className="w-[80%] h-[90%] border border-primary/20 rounded-lg flex items-center justify-center bg-background/50">
                        <span className="text-[40px] opacity-20">✨</span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const CosmicAssembly = () => {
    // Cards start in a wide radius and spiral inward while spinning in 3D.
    return (
        <motion.div 
            className="relative w-full h-[400px] flex items-center justify-center preserve-3d"
            animate={{ rotateZ: 360 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
        >
            {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i * 360) / 5;
                const radius = 250;
                const startX = Math.cos((angle * Math.PI) / 180) * radius;
                const startY = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                    <motion.div
                        key={i}
                        initial={{ x: startX, y: startY, rotateY: 90, rotateX: 90, opacity: 0, scale: 0.2 }}
                        animate={{ 
                            x: [startX, startX * 0.5, 0],
                            y: [startY, startY * 0.5, i * 5],
                            rotateY: [90, 360, 0],
                            rotateX: [90, 0, 0],
                            opacity: [0, 1, 1],
                            scale: [0.2, 1.2, 1 - (i * 0.05)]
                        }}
                        transition={{ 
                            duration: 2.2, 
                            times: [0, 0.7, 1], 
                            ease: "easeOut",
                            delay: i * 0.05
                        }}
                        className="absolute w-[200px] h-[280px] bg-surface-container-low border-2 border-primary/30 rounded-[16px] shadow-[0_0_20px_rgba(255,159,67,0.2)] flex items-center justify-center"
                        style={{ zIndex: 5 - i }}
                    >
                        <div className="w-[80%] h-[90%] border border-primary/20 rounded-lg flex items-center justify-center bg-background/50">
                            <span className="text-[40px] opacity-20">🔮</span>
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
};


// --- SWIPEABLE CARD COMPONENT ---
const SwipeableCard = ({ card, isTop, index, onSwipe, swipeDirection }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
    
    const yumOpacity = useTransform(x, [50, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -100], [0, 1]);

    // Tap to Reveal State
    const [isFlipped, setIsFlipped] = useState(false);

    const handleDragEnd = (event, info) => {
        if (!isTop || !isFlipped) return;
        const threshold = 100;
        if (info.offset.x > threshold) {
            onSwipe(card.id, 'right', card.items);
        } else if (info.offset.x < -threshold) {
            onSwipe(card.id, 'left', card.items);
        }
    };

    const handleTap = () => {
        if (isTop && !isFlipped) {
            setIsFlipped(true);
        }
    };

    const scale = 1 - (index * 0.05);
    const yOffset = index * 20;

    // Determine exit animation based on swipe direction
    const exitAnimation = swipeDirection === 'right' 
        ? { x: 300, y: 400, opacity: 0, rotate: 30, scale: 0.5, transition: { duration: 0.4 } } 
        : { x: -300, y: 0, opacity: 0, rotate: -20, transition: { duration: 0.4 } };

    return (
        <motion.div
            className="absolute w-[300px] h-[400px] perspective-[1000px]"
            style={{ 
                zIndex: 10 - index,
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                opacity: isTop ? opacity : 1,
            }}
            initial={{ scale: 0, opacity: 0, y: 50 }}
            animate={{ scale, y: yOffset, opacity: 1 }}
            exit={exitAnimation}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            drag={isTop && isFlipped ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            whileDrag={isFlipped ? { cursor: "grabbing" } : {}}
            onTap={handleTap}
        >
            <motion.div 
                className="w-full h-full relative transition-transform duration-700 shadow-2xl rounded-[24px] cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE (MYSTERY BACK COVER) */}
                <div 
                    className="absolute inset-0 bg-[#1C1B1B] rounded-[24px] overflow-hidden border border-white/10 flex flex-col items-center justify-center backface-hidden"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <div className="w-[85%] h-[90%] border-2 border-dashed border-primary/30 rounded-[16px] flex flex-col items-center justify-center bg-surface-bright/20 p-6 text-center group hover:bg-surface-bright/40 transition-colors">
                        <span className="text-[64px] mb-4 group-hover:scale-110 transition-transform duration-300">✨</span>
                        <h3 className="text-white font-headline-md mb-2">Tap to Reveal</h3>
                        <p className="text-white/40 font-body-sm">Your mystery meal awaits...</p>
                    </div>
                </div>

                {/* BACK FACE (ACTUAL MEAL DATA) - Note: rotateY-180 so it's facing away initially */}
                <div 
                    className="absolute inset-0 bg-[#1C1B1B] rounded-[24px] overflow-hidden border border-white/10 backface-hidden flex flex-col"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="w-full h-[55%] relative">
                        <img src={card.image} alt={card.name} className="w-full h-full object-cover" draggable={false} />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            <span className="text-primary font-label-sm text-[10px] uppercase tracking-wider">{card.label}</span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1B1B] to-transparent"></div>
                    </div>
                    
                    <div className="p-5 flex flex-col h-[45%] justify-between bg-[#1C1B1B]">
                        <div>
                            <h3 className="text-white font-headline-md leading-tight mb-1">{card.name}</h3>
                            <p className="text-primary text-[22px] font-bold">₹{card.price}</p>
                        </div>
                        
                        <div className="bg-surface-bright rounded-[12px] p-3 border border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white/60 font-label-sm text-[11px] uppercase">Match Score</span>
                                <span className="text-[#8ef4e9] font-bold text-[14px]">{card.matchScore}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/40 font-body-sm text-[12px]">Source: {card.source}</span>
                                <span className="text-white/40 font-body-sm text-[12px] flex items-center"><span className="material-symbols-outlined text-[14px] mr-1">schedule</span> {card.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Optional Swipe Indicators that appear on drag */}
                    {isTop && isFlipped && (
                        <>
                            <motion.div 
                                className="absolute top-8 right-8 border-4 border-[#71d7cd] rounded-md px-2 py-1 text-[#71d7cd] font-bold text-2xl rotate-[15deg] pointer-events-none"
                                style={{ opacity: yumOpacity }}
                            >
                                YUM
                            </motion.div>
                            <motion.div 
                                className="absolute top-8 left-8 border-4 border-error rounded-md px-2 py-1 text-error font-bold text-2xl -rotate-[15deg] pointer-events-none"
                                style={{ opacity: nopeOpacity }}
                            >
                                NOPE
                            </motion.div>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Surprise;
