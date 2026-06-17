import React, { useState } from 'react';
import { mockVendorProducts } from '../../data/mockVendorData';
import CollapsibleSection from '../../components/common/CollapsibleSection';

// --- Add Product Modal ---
const AddProductModal = ({ isOpen, onClose, onAdd, categoryId, categoryName }) => {
    if (!isOpen) return null;
    
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !price) return;

        onAdd({
            id: 'p' + Date.now(),
            name,
            description: desc || 'No description provided.',
            price: price.startsWith('₹') ? price : `₹${price}`,
            image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80', // Default food image
            inStock: true
        }, categoryId);
        
        onClose();
        setName(''); setDesc(''); setPrice(''); setImage('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-container rounded-2xl w-full max-w-md p-6 border border-outline-variant/20 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-on-surface">
                        Add to {categoryName || 'Menu'}
                    </h2>
                    <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Image URL Mock */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-on-surface-variant font-medium ml-1">Image URL</label>
                        <input 
                            type="text" 
                            className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                            placeholder="https://example.com/image.jpg"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
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
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-on-surface-variant font-medium ml-1">Price *</label>
                        <input 
                            type="text" 
                            required
                            className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
                            placeholder="e.g. 50"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-on-surface-variant font-medium ml-1">Description</label>
                        <textarea 
                            className="bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:border-primary resize-none h-20"
                            placeholder="Brief description of the item..."
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-outline-variant/50 text-on-surface font-bold hover:bg-surface transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-[0_4px_14px_0_rgba(255,159,67,0.39)] transition-transform active:scale-[0.98]">
                            Add Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Product Card ---
const ProductCard = ({ item, isSpecial, onToggleStock, onChangeCap }) => {
    return (
        <div className="flex flex-col gap-1">
            <div className="bg-surface rounded-xl p-3 flex gap-3 shadow-sm border border-outline-variant/10">
                {/* Image Thumbnail */}
                <div className="w-[72px] h-[72px] rounded-lg overflow-hidden shrink-0 bg-surface-container">
                    {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-3xl">restaurant</span>
                        </div>
                    )}
                </div>

                {/* Content Middle */}
                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="text-on-surface font-bold text-[15px] truncate pr-2">{item.name}</h4>
                        {/* Toggle Switch */}
                        <label className="flex items-center cursor-pointer shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                            <div className="relative">
                                <input 
                                    type="checkbox" 
                                    className="sr-only" 
                                    checked={item.inStock} 
                                    onChange={() => onToggleStock(item.id)} 
                                />
                                <div className={`block w-9 h-5 rounded-full transition-colors ${item.inStock ? 'bg-[#22c55e]' : 'bg-surface-variant'}`}></div>
                                <div className={`dot absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full transition-transform ${item.inStock ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                    
                    <p className="text-on-surface-variant text-[11px] mt-0.5 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-end justify-between mt-auto">
                        <p className="text-on-surface font-bold text-[13px]">{item.price}</p>
                    </div>
                </div>
            </div>

            {/* Special Menu Quantity Cap */}
            {isSpecial && (
                <div className="flex justify-between items-center bg-surface-container p-2 px-3 rounded-lg border border-outline-variant/20 mx-1">
                    <span className="text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">Daily Cap</span>
                    <div className="flex items-center gap-3">
                        <button 
                            className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/50"
                            onClick={() => onChangeCap(item.id, Math.max(0, item.cap - 1))}
                        >
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="text-on-surface font-bold text-sm min-w-[24px] text-center">{item.cap}</span>
                        <button 
                            className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/50"
                            onClick={() => onChangeCap(item.id, item.cap + 1)}
                        >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const VendorProducts = () => {
    const [products, setProducts] = useState(mockVendorProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, categoryId: null, categoryName: '' });

    const toggleStock = (itemId) => {
        setProducts(prev => {
            const specialMenu = prev.specialMenu.map(i => i.id === itemId ? { ...i, inStock: !i.inStock } : i);
            const categories = prev.categories.map(c => ({
                ...c,
                items: c.items.map(i => i.id === itemId ? { ...i, inStock: !i.inStock } : i)
            }));
            return { ...prev, specialMenu, categories };
        });
    };

    const changeCap = (itemId, newCap) => {
        setProducts(prev => {
            const specialMenu = prev.specialMenu.map(i => i.id === itemId ? { ...i, cap: newCap } : i);
            return { ...prev, specialMenu };
        });
    };

    const handleAddProduct = (newItem, categoryId) => {
        setProducts(prev => {
            if (categoryId === 'special') {
                return {
                    ...prev,
                    specialMenu: [...prev.specialMenu, { ...newItem, cap: 10 }]
                };
            } else {
                return {
                    ...prev,
                    categories: prev.categories.map(c => 
                        c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c
                    )
                };
            }
        });
    };

    const openAddModal = (categoryId, categoryName) => {
        setModalConfig({ isOpen: true, categoryId, categoryName });
    };

    return (
        <div className="flex flex-col gap-4 w-full pb-32 pt-4 px-3 relative bg-background">
            
            {/* Header */}
            <div className="flex justify-between items-center px-1 mt-2">
                <div className="flex items-center gap-3">
                    <button className="w-8 h-8 flex items-center justify-center text-on-surface rounded-full hover:bg-surface-container">
                        <span className="material-symbols-outlined text-[20px]">arrow_back_ios_new</span>
                    </button>
                    <h1 className="text-xl font-bold text-on-surface">Products</h1>
                </div>
                <button 
                    onClick={() => openAddModal(products.categories[0]?.id, products.categories[0]?.name)}
                    className="w-8 h-8 flex items-center justify-center text-on-surface rounded-full border border-outline-variant/50 hover:bg-surface-container"
                >
                    <span className="material-symbols-outlined text-[22px]">add</span>
                </button>
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

            {/* Special Menu Section (Always Expanded) */}
            <div className="mt-4 px-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="material-symbols-outlined text-primary text-xl">star</span>
                    <h2 className="text-on-surface font-bold text-lg">Today's Special ({products.specialMenu.length})</h2>
                </div>
                <div className="flex flex-col gap-4 bg-surface-container-low rounded-3xl p-4 border border-outline-variant/30 shadow-sm">
                    {products.specialMenu.map(item => (
                        <ProductCard 
                            key={item.id} 
                            item={item} 
                            isSpecial={true} 
                            onToggleStock={toggleStock}
                            onChangeCap={changeCap}
                        />
                    ))}
                    <button 
                        onClick={() => openAddModal('special', "Today's Special")}
                        className="w-full py-3 mt-2 rounded-xl border border-primary text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add special item
                    </button>
                </div>
            </div>

            {/* Standard Menu Categories (Collapsible) */}
            <div className="flex flex-col gap-3 mt-4 px-1">
                {products.categories.map(category => (
                    <CollapsibleSection 
                        key={category.id} 
                        title={`${category.name}(${category.items.length})`}
                        defaultOpen={false}
                        headerRight={
                            <span className="material-symbols-outlined text-[#22c55e] text-[18px]">edit</span>
                        }
                    >
                        <div className="flex flex-col gap-4 mt-2 mb-2">
                            {category.items.map(item => (
                                <ProductCard 
                                    key={item.id} 
                                    item={item} 
                                    isSpecial={false} 
                                    onToggleStock={toggleStock}
                                />
                            ))}
                            
                            <button 
                                onClick={() => openAddModal(category.id, category.name)}
                                className="w-full py-3 mt-2 rounded-xl border border-[#22c55e] text-[#22c55e] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#22c55e]/5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                Add product
                            </button>
                        </div>
                    </CollapsibleSection>
                ))}
            </div>

            {/* Modal */}
            <AddProductModal 
                isOpen={modalConfig.isOpen}
                categoryId={modalConfig.categoryId}
                categoryName={modalConfig.categoryName}
                onClose={() => setModalConfig({ isOpen: false, categoryId: null, categoryName: '' })}
                onAdd={handleAddProduct}
            />

        </div>
    );
};

export default VendorProducts;
