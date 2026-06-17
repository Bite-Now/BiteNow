import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuth } from '@clerk/clerk-react';
import { mockPaymentSuccess, mockPaymentFailed } from '../../services/ordersApi';

const MockPayment = () => {
    const navigate = useNavigate();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const totalAmount = getTotalPrice();

    const handlePayment = async (isSuccess) => {
        setLoading(true);
        setError(null);

        try {
            const canteenId = items.length > 0 ? items[0].canteenId : null;
            if (!canteenId) throw new Error("Cart is empty");

            const payload = {
                canteen_id: canteenId,
                items: items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
                idempotency_key: crypto.randomUUID()
            };

            let data;
            if (isSuccess) {
                data = await mockPaymentSuccess(payload);
            } else {
                data = await mockPaymentFailed(payload);
            }

            if (!isSuccess || data.success === false) {
                setError(data.message || "Payment cancelled. Order not placed.");
                return;
            }

            // Success
            clearCart();
            navigate('/orders');
        } catch (err) {
            setError(err.response?.data?.detail || err.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center mt-20">
                <span className="material-symbols-outlined text-6xl text-surface-variant mb-4">shopping_cart</span>
                <h2 className="font-headline-md text-on-surface mb-2">No Order Found</h2>
                <button onClick={() => navigate('/home')} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg">Go Home</button>
            </div>
        );
    }

    return (
        <div className="font-body-md flex flex-col min-h-screen bg-surface relative">
            <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md shadow-lg shadow-primary/5 flex items-center px-container-margin py-md">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-sm mr-sm text-on-surface hover:bg-surface-container rounded-full transition-colors active:scale-95"
                    disabled={loading}
                >
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h1 className="font-headline-md font-bold text-on-surface">Mock Payment</h1>
            </header>

            <main className="flex-grow px-container-margin mt-4 space-y-md max-w-lg mx-auto w-full pb-8">
                <div className="bg-surface-container-low rounded-xl p-md border border-surface-variant shadow-sm">
                    <h2 className="font-headline-sm text-on-surface mb-4">Order Summary</h2>
                    <div className="space-y-3 mb-6">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-body-md">
                                <span className="text-on-surface-variant">{item.quantity}x {item.name}</span>
                                <span className="text-on-surface font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="border-t border-surface-variant pt-3 mt-3 flex justify-between items-center">
                            <span className="font-label-lg text-on-surface font-bold">Total Amount</span>
                            <span className="font-headline-md text-primary font-bold">₹{totalAmount}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-error/10 text-error p-3 rounded-lg mb-6 flex items-start gap-2">
                            <span className="material-symbols-outlined text-[20px]">error</span>
                            <span className="text-body-sm">{error}</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <button 
                            onClick={() => handlePayment(true)}
                            disabled={loading}
                            className={`w-full py-md font-label-md rounded-xl flex items-center justify-center gap-2 transition-all ${
                                loading ? 'bg-surface-variant text-on-surface-variant' : 'bg-[#00D26A] text-black hover:bg-[#00c262] active:scale-[0.98]'
                            }`}
                        >
                            <span className="material-symbols-outlined">check_circle</span>
                            {loading ? 'Processing...' : 'Simulate Payment Success'}
                        </button>

                        <button 
                            onClick={() => handlePayment(false)}
                            disabled={loading}
                            className={`w-full py-md font-label-md rounded-xl flex items-center justify-center gap-2 transition-all ${
                                loading ? 'bg-surface-variant text-on-surface-variant' : 'bg-error/10 text-error border border-error/20 hover:bg-error/20 active:scale-[0.98]'
                            }`}
                        >
                            <span className="material-symbols-outlined">cancel</span>
                            Simulate Payment Failure
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MockPayment;
