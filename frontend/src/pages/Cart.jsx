import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { useNotificationStore } from '../store/useNotificationStore';


const Cart = () => {
    const navigate = useNavigate();
    const { items, addToCart, removeFromCart, clearCart, getTotalPrice } = useCartStore();
    const { addNotification } = useNotificationStore();

    const handleCheckout = () => {
        if (items.length === 0) return;
        
        addNotification({
            type: 'order',
            title: 'New Order Received',
            message: `Order placed for ₹${getTotalPrice()}`
        });

        clearCart();
        // Since we don't have a backend to actually push the order to MOCK_ORDERS,
        // we simulate success and navigate to the live tracker.
        navigate('/orders');
    };

    return (
        <div className="font-body-md flex flex-col pb-8 relative">
            <header className="sticky top-0 z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex items-center px-container-margin py-md">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-sm mr-sm text-on-surface hover:bg-surface-container rounded-full transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="font-headline-md text-headline-md-mobile font-bold text-on-surface">Your Cart</h1>
            </header>

            <main className="flex-grow px-container-margin mt-4 space-y-md">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">shopping_cart</span>
                        <h2 className="font-headline-md text-on-surface mb-2">Cart is Empty</h2>
                        <p className="text-body-md text-on-surface-variant">Add some items to get started.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-sm">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between items-center bg-surface-container-low rounded-xl p-md border border-surface-variant">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-lg bg-surface-container-highest overflow-hidden">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-label-md text-label-md text-on-surface mb-1">{item.name}</div>
                                            <div className="font-body-sm text-body-sm text-on-surface-variant">₹{item.price}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-surface-container rounded-full px-2 py-1 border border-outline-variant/30">
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">remove</span>
                                        </button>
                                        <span className="font-label-md w-4 text-center text-on-surface">{item.quantity}</span>
                                        <button 
                                            onClick={() => addToCart(item, item.canteenId)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-variant/50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-xl p-md bg-surface-container rounded-xl border border-surface-variant">
                            <div className="flex justify-between items-center mb-md">
                                <span className="font-body-md text-on-surface-variant">Total Amount</span>
                                <span className="font-headline-md text-primary-container">₹{getTotalPrice()}</span>
                            </div>

                            <button 
                                onClick={handleCheckout}
                                className="w-full py-md bg-primary-container text-on-primary-container font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary hover:text-on-primary transition-colors active:scale-[0.98] glow-effect"
                            >
                                <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                                Proceed to Pay
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default Cart;
