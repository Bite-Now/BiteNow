import React, { useState, useEffect } from 'react';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import { useCurrentCanteen } from '../../hooks/useCurrentCanteen';
import api from '../../services/api';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80';

// --- Add Product Modal ---
const AddProductModal = ({ isOpen, onClose, onAdd, categoryName, isSubmitting }) => {
    if (!isOpen) return null;
    
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price) return;
        
        try {
            await onAdd({
                name,
                description: desc || undefined,
                price: parseFloat(price.replace('₹', '')),
                image_url: image || undefined,
                category: categoryName !== 'special' ? categoryName : undefined
            });
            
            onClose();
            setName(''); setDesc(''); setPrice(''); setImage('');
        } catch (err) {
            // Error handled in onAdd
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-container rounded-2xl w-full max-w-md p-6 border border-outline-variant/20 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-on-surface">
                        Add to {categoryName === 'special' ? "Today's Special" : categoryName || 'Menu'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface" disabled={isSubmitting}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-on-surface-variant font-medium ml-1">Image URL</label>
                        <input 
                            type="text" 
                            className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                            placeholder="https://example.com/image.jpg"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-on-surface-variant font-medium ml-1">Product Name *</label>
                        <input 
                            type="text" 
                            required
                            className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                            placeholder="e.g. Garlic Naan"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-on-surface-variant font-medium ml-1">Price *</label>
                        <input 
                            type="number" 
                            required
                            min="1"
                            className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                            placeholder="e.g. 50"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {categoryName === 'special' && (
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-on-surface-variant font-medium ml-1">Description</label>
                            <textarea 
                                className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary resize-none h-20"
                                placeholder="Brief description of the item..."
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 rounded-xl border border-outline-variant/50 text-on-surface font-bold hover:bg-surface transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-[0_4px_14px_0_rgba(255,159,67,0.39)] transition-transform active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100">
                            {isSubmitting ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Product Card ---
const ProductCard = ({ item, isSpecial }) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="bg-surface rounded-xl p-3 flex gap-3 shadow-sm border border-outline-variant/10">
                {/* Image Thumbnail */}
                <div className="w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 bg-surface-container">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <img src={DEFAULT_IMAGE} alt={item.name} className="w-full h-full object-cover" />
                    )}
                </div>

                {/* Content Middle */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="text-on-surface font-bold text-[15px] truncate pr-2">{item.name}</h4>
                    </div>
                    
                    {isSpecial && item.description && (
                        <p className="text-on-surface-variant text-[11px] mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-end justify-between mt-auto">
                        <p className="text-on-surface font-bold text-[13px]">₹{item.price}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VendorProducts = () => {
    const { canteenId, isLoaded } = useCurrentCanteen();
    const [menuData, setMenuData] = useState({ specials: [], categories: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, categoryName: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMenu = async () => {
        if (!canteenId) return;
        try {
            const response = await api.get(`/canteens/${canteenId}/menu`);
            const data = response.data;
            const categories = Object.keys(data.menu).map(categoryName => ({
                name: categoryName,
                items: data.menu[categoryName]
            }));
            
            setMenuData({
                specials: data.specials || [],
                categories: categories
            });
        } catch (err) {
            console.error("Failed to fetch owner menu:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (canteenId) {
                fetchMenu();
            } else {
                setIsLoading(false);
            }
        }
    }, [isLoaded, canteenId]);

    const handleAddProduct = async (newItemPayload) => {
        setIsSubmitting(true);
        try {
            if (modalConfig.categoryName === 'special') {
                await api.post(`/owner/specials?canteen_id=${canteenId}`, newItemPayload);
            } else {
                await api.post(`/owner/menu?canteen_id=${canteenId}`, newItemPayload);
            }
            await fetchMenu();
        } catch (err) {
            console.error("Failed to add product:", err);
            alert("Failed to add product.");
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAddModal = (categoryName) => {
        setModalConfig({ isOpen: true, categoryName });
    };

    if (isLoading || !isLoaded) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!canteenId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <div className="bg-error-container text-on-error-container p-6 rounded-2xl text-center shadow-lg">
                    <h2 className="font-bold text-xl">Not Authorized</h2>
                    <p>You don't have a canteen associated with this account.</p>
                </div>
            </div>
        );
    }

    // Filter by search query
    const filteredSpecials = menuData.specials.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredCategories = menuData.categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    })).filter(cat => cat.items.length > 0 || !searchQuery); // keep category if empty only when no search

    return (
        <div className="flex flex-col gap-4 w-full pb-32 pt-4 px-3 relative bg-background min-h-screen">
            
            {/* Header */}
            <div className="flex justify-between items-center px-1 mt-2">
                <div className="flex items-center gap-3">
                    <button className="w-8 h-8 flex items-center justify-center text-on-surface rounded-full hover:bg-surface-container">
                        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-xl font-bold text-on-surface">Products</h1>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative px-1 mt-1">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input 
                    type="text" 
                    placeholder="Search" 
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-2.5 pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none focus:border-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Special Menu Section */}
            <div className="mt-4 px-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="material-symbols-outlined text-primary text-xl">star</span>
                    <h2 className="text-on-surface font-bold text-lg">Today's Special ({filteredSpecials.length})</h2>
                </div>
                <div className="flex flex-col gap-4 bg-surface-container-low rounded-3xl p-4 border border-outline-variant/30 shadow-sm">
                    {filteredSpecials.map(item => (
                        <ProductCard 
                            key={item.id} 
                            item={item} 
                            isSpecial={true} 
                        />
                    ))}
                    <button 
                        onClick={() => openAddModal('special')}
                        className="w-full py-3 mt-2 rounded-xl border border-primary text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add special item
                    </button>
                </div>
            </div>

            {/* Standard Menu Categories */}
            <div className="flex flex-col gap-3 mt-4 px-1">
                {filteredCategories.map(category => (
                    <CollapsibleSection 
                        key={category.name} 
                        title={`${category.name} (${category.items.length})`}
                        defaultOpen={true}
                    >
                        <div className="flex flex-col gap-4 mt-2 mb-2">
                            {category.items.map(item => (
                                <ProductCard 
                                    key={item.id} 
                                    item={item} 
                                    isSpecial={false} 
                                />
                            ))}
                            
                            <button 
                                onClick={() => openAddModal(category.name)}
                                className="w-full py-3 mt-2 rounded-xl border border-[#22c55e] text-[#22c55e] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#22c55e]/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Add product
                            </button>
                        </div>
                    </CollapsibleSection>
                ))}

                {/* Option to create a new category */}
                <div className="flex justify-center mt-6 mb-12">
                     <button 
                         onClick={() => {
                             const newCat = prompt("Enter new category name:");
                             if (newCat) openAddModal(newCat);
                         }}
                         className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant font-bold text-sm hover:bg-surface transition-colors"
                     >
                         + New Category
                     </button>
                </div>
            </div>

            {/* Modal */}
            <AddProductModal 
                isOpen={modalConfig.isOpen}
                categoryName={modalConfig.categoryName}
                onClose={() => setModalConfig({ isOpen: false, categoryName: '' })}
                onAdd={handleAddProduct}
                isSubmitting={isSubmitting}
            />

        </div>
    );
};

export default VendorProducts;
