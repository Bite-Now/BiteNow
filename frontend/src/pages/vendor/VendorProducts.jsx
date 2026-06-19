import React, { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import CollapsibleSection from '../../components/common/CollapsibleSection';
import GlassModal from '../../components/ui/GlassModal';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';
import ImageUploadBox from '../../components/ui/ImageUploadBox';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentCanteen } from '../../hooks/useCurrentCanteen';
import { getCanteenMenu, createMenuItem, updateMenuItem, deleteMenuItem, createDailySpecial, updateDailySpecial, deleteDailySpecial } from '../../services/menuApi';

// --- Add/Edit Product Modal ---
const AddProductModal = ({ isOpen, onClose, onAdd, onEdit, editItem, categoryName, isSubmitting }) => {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (isOpen && editItem) {
            setName(editItem.name || '');
            setDesc(editItem.description || '');
            setPrice(editItem.price ? String(editItem.price) : '');
            setImage(editItem.image_url || '');
            setImageFile(null);
        } else if (isOpen && !editItem) {
            setName(''); setDesc(''); setPrice(''); setImage(''); setImageFile(null);
        }
    }, [isOpen, editItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price) return;

        try {
            const formData = new FormData();
            if (editItem) {
                // Edit Mode: only append what changed
                if (name !== editItem.name) formData.append('name', name);
                if (desc !== (editItem.description || '')) formData.append('description', desc);
                const parsedPrice = parseFloat(price.replace('₹', ''));
                if (parsedPrice !== editItem.price) formData.append('price', parsedPrice);
                
                // Only send image if a new file was uploaded
                if (imageFile) {
                    formData.append('file', imageFile);
                }
                
                await onEdit(editItem.id, formData);
            } else {
                // Add Mode
                formData.append('name', name);
                if (desc) formData.append('description', desc);
                formData.append('price', parseFloat(price.replace('₹', '')));
                if (categoryName !== 'special') formData.append('category', categoryName);
                formData.append('is_available', true);
                
                if (imageFile) {
                    formData.append('file', imageFile);
                } else if (image) {
                    formData.append('image_url', image);
                }
                await onAdd(formData);
            }

            onClose();
            setName(''); setDesc(''); setPrice(''); setImage('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <GlassModal
            isOpen={isOpen}
            onClose={onClose}
            title={editItem ? `Edit ${editItem.name}` : `Add to ${categoryName || 'Menu'}`}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <ImageUploadBox
                    label="Product Image"
                    value={image}
                    onChange={(file, previewUrl) => {
                        if (file) {
                            setImage(previewUrl);
                            setImageFile(file);
                        } else {
                            setImage('');
                            setImageFile(null);
                        }
                    }}
                />

                <GlassInput
                    label="Product Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <GlassInput
                    label="Price"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <div className="relative">
                    <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-md rounded-xl border border-white/10 pointer-events-none transition-colors peer-focus:border-white/30"></div>
                    <textarea
                        className="peer relative w-full bg-transparent text-white placeholder-white/40 focus:outline-none focus:ring-0 text-sm px-4 py-3 resize-none h-20"
                        placeholder="Description"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <GlassButton type="button" onClick={onClose} variant="secondary" className="flex-1">
                        Cancel
                    </GlassButton>
                    <GoldenGlowButton type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? (editItem ? 'Saving...' : 'Adding...') : (editItem ? 'Save Changes' : 'Add Item')}
                    </GoldenGlowButton>
                </div>
            </form>
        </GlassModal>
    );
};

// --- Product Card ---
const ProductCard = ({ item, isSpecial, onToggleStock, onDelete, onEdit }) => {
    return (
        <div className="bg-surface-container rounded-xl p-2.5 flex gap-3 shadow-sm border border-outline-variant/20 mb-2 hover:border-outline-variant/40 transition-all group">
            {/* Left Side: Content */}
            <div className="flex flex-col flex-1 min-w-0">
                <h4 className="text-on-surface font-bold text-[15px] truncate">{item.name}</h4>
                <p className="text-on-surface-variant text-[12px] mt-0.5 line-clamp-2 leading-snug">{item.description}</p>
                <div className="mt-auto pt-1.5 flex items-center gap-2">
                    <p className="text-on-surface font-bold text-[14px]">₹{item.price}</p>
                    {isSpecial && (
                        <span className="text-primary text-[10px] font-bold uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">Special</span>
                    )}
                </div>
            </div>

            {/* Right Side: Image & Toggle */}
            <div className="flex flex-col items-end justify-between shrink-0">
                <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => onEdit(item)} className="text-primary/80 hover:text-primary p-1 rounded-full hover:bg-primary/10 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => onDelete(item.id)} className="text-error/80 hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                </div>
                <div className="w-[68px] h-[68px] rounded-lg overflow-hidden bg-surface shadow-sm border border-outline-variant/10">
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-2xl">restaurant</span>
                        </div>
                    )}
                </div>

                {/* Visibility Toggle Switch */}
                <label className="flex items-center cursor-pointer mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="relative">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={item.is_available}
                            onChange={() => onToggleStock(item.id, !item.is_available)}
                        />
                        <div className={`block w-10 h-5 rounded-full transition-colors ${item.is_available ? 'bg-[#22c55e]' : 'bg-surface-variant'}`}></div>
                        <div className={`dot absolute left-[2px] top-[2px] bg-white w-4 h-4 rounded-full transition-transform ${item.is_available ? 'transform translate-x-5' : ''}`}></div>
                    </div>
                </label>
            </div>
        </div>
    );
};

const VendorProducts = () => {
    const { canteenId, isLoaded } = useCurrentCanteen();
    const [products, setProducts] = useState({ specialMenu: [], categories: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategoryId, setActiveCategoryId] = useState('special');
    const [modalConfig, setModalConfig] = useState({ isOpen: false, categoryName: '', editItem: null });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const tabRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    const fetchMenu = async () => {
        if (!canteenId) return;
        try {
            const data = await getCanteenMenu(canteenId);
            const cats = Object.keys(data.menu).map(catName => ({
                id: catName,
                name: catName,
                items: data.menu[catName]
            }));

            setProducts({
                specialMenu: data.specials || [],
                categories: cats
            });
        } catch (err) {
            console.error("Failed to fetch menu:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded && canteenId) {
            fetchMenu();
        } else if (isLoaded) {
            setIsLoading(false);
        }
    }, [isLoaded, canteenId]);

    useEffect(() => {
        const el = tabRefs.current[activeCategoryId];
        if (el) {
            setIndicatorStyle({
                left: el.offsetLeft,
                width: el.offsetWidth,
            });
        }
    }, [activeCategoryId, products.categories.length]);

    const handleAddProduct = async (newItemPayload) => {
        setIsSubmitting(true);
        try {
            if (modalConfig.categoryName === 'special') {
                await createDailySpecial(canteenId, newItemPayload);
            } else {
                await createMenuItem(canteenId, newItemPayload);
            }
            await fetchMenu();
        } catch (err) {
            console.error("Failed to add product:", err);
            alert("Failed to add product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProduct = async (itemId, editPayload) => {
        setIsSubmitting(true);
        try {
            if (activeCategoryId === 'special') {
                await updateDailySpecial(itemId, editPayload);
            } else {
                await updateMenuItem(itemId, editPayload);
            }
            await fetchMenu();
        } catch (err) {
            console.error("Failed to update product:", err);
            alert("Failed to update product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleStock = async (itemId, newAvailableStatus) => {
        try {
            if (activeCategoryId === 'special') {
                await updateDailySpecial(itemId, { is_available: newAvailableStatus });
            } else {
                await updateMenuItem(itemId, { is_available: newAvailableStatus });
            }
            fetchMenu();
        } catch (err) {
            console.error("Failed to update availability", err);
        }
    };

    const handleDelete = async (itemId) => {
        try {
            if (activeCategoryId === 'special') {
                await deleteDailySpecial(itemId);
            } else {
                await deleteMenuItem(itemId);
            }
            fetchMenu();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) {
            setIsAddingCategory(false);
            return;
        }

        setProducts(prev => ({
            ...prev,
            categories: [...prev.categories, { id: trimmedName, name: trimmedName, items: [] }]
        }));

        setActiveCategoryId(trimmedName);
        setIsAddingCategory(false);
        setNewCategoryName('');
    };

    const cancelAddCategory = () => {
        setIsAddingCategory(false);
        setNewCategoryName('');
    };

    return (
        <div className="flex flex-col gap-4 w-full pb-32 pt-4 px-3 relative bg-background min-h-screen">
            <div className="flex justify-between items-center px-1 mt-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-on-surface ml-4 ">Products</h1>
                </div>
            </div>

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

            <div className="relative w-full mt-4 flex flex-col gap-2">
                <div className="flex justify-end px-2 h-[34px]">
                    {isAddingCategory ? (
                        <form
                            onSubmit={handleAddCategory}
                            className="flex items-center gap-1 bg-surface-container rounded-lg border border-primary/50 overflow-hidden shadow-sm"
                        >
                            <input
                                type="text"
                                autoFocus
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Escape' && cancelAddCategory()}
                                placeholder="New category..."
                                className="bg-transparent text-sm text-on-surface px-3 py-1.5 outline-none w-[120px] placeholder:text-on-surface-variant/50"
                            />
                            <button
                                type="button"
                                onClick={cancelAddCategory}
                                className="text-on-surface-variant hover:text-error transition-colors px-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            <button
                                type="submit"
                                className="text-primary hover:text-primary-container transition-colors pr-2 pl-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingCategory(true)}
                            className="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-lg border border-outline-variant/10 bg-surface-container"
                        >
                            <span className="material-symbols-outlined text-[16px]">add_circle</span>
                            Category
                        </button>
                    )}
                </div>

                <div className="relative w-full">
                    <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-background to-transparent z-[35] pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-[35] pointer-events-none" />

                    <div className="relative flex overflow-x-auto no-scrollbar gap-1 px-2 pt-2 pb-3 snap-x">
                        <motion.div
                            className="absolute top-0 bottom-3 bg-[#1c1b1b] rounded-t-[16px] border border-outline-variant/20 border-b-0 z-0 pointer-events-none"
                            animate={indicatorStyle}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />

                        <button
                            ref={el => tabRefs.current['special'] = el}
                            onClick={() => setActiveCategoryId('special')}
                            className={`relative px-5 py-3 pb-5 text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 snap-start z-10 ${activeCategoryId === 'special'
                                    ? 'text-primary'
                                    : 'text-on-surface-variant hover:text-on-surface'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">star</span>
                            Today's Special
                        </button>

                        {products.categories.map(category => (
                            <button
                                key={category.id}
                                ref={el => tabRefs.current[category.id] = el}
                                onClick={() => setActiveCategoryId(category.id)}
                                className={`relative px-5 py-3 pb-5 text-sm font-bold whitespace-nowrap transition-colors snap-start z-10 ${activeCategoryId === category.id
                                        ? 'text-[#e5e2e1]'
                                        : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-[#1c1b1b] rounded-[20px] border border-outline-variant/20 p-4 shadow-lg flex flex-col h-[70vh] min-h-[500px] relative z-20 mx-2 -mt-3">
                <div className="flex justify-between items-end mb-4 px-1 pb-2 border-b border-outline-variant/10">
                    <div>
                        <h2 className="text-on-surface font-bold text-lg">
                            {activeCategoryId === 'special' ? "Today's Special" : products.categories.find(c => c.id === activeCategoryId)?.name}
                        </h2>
                        <p className="text-on-surface-variant text-xs mt-0.5">
                            {activeCategoryId === 'special'
                                ? `${products.specialMenu.length} Active Products`
                                : `${products.categories.find(c => c.id === activeCategoryId)?.items.filter(i => i.is_available).length || 0} Active Products`
                            }
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 bg-surface-container rounded-xl p-2.5 mb-2 border border-outline-variant/10 animate-pulse">
                            <div className="flex-1 flex flex-col justify-center gap-2">
                                <div className="h-4 w-3/4 bg-surface-variant rounded"></div>
                                <div className="h-3 w-full bg-surface-variant rounded"></div>
                                <div className="h-4 w-16 bg-surface-variant rounded mt-2"></div>
                            </div>
                            <div className="w-[68px] h-[68px] rounded-lg bg-surface-variant shrink-0"></div>
                        </div>
                    ))
                ) : (
                    <>
                        {(() => {
                            const activeItems = activeCategoryId === 'special'
                                ? products.specialMenu
                                : products.categories.find(c => c.id === activeCategoryId)?.items || [];

                            const filteredItems = activeItems.filter(item =>
                                item.name.toLowerCase().includes(searchQuery.toLowerCase())
                            );

                            const isEmpty = filteredItems.length === 0;

                            return (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeCategoryId}
                                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        className="flex flex-col flex-1 min-h-0"
                                    >
                                        {!isEmpty && (
                                            <GoldenGlowButton
                                                onClick={() => setModalConfig({
                                                    isOpen: true,
                                                    categoryName: activeCategoryId === 'special' ? 'special' : activeCategoryId
                                                })}
                                                className="w-full mb-4 shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">add</span>
                                                {activeCategoryId === 'special' ? "Add special item" : "Add product"}
                                            </GoldenGlowButton>
                                        )}

                                        {isEmpty ? (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-8">
                                                <div className="w-16 h-16 rounded-full bg-surface-variant/20 flex items-center justify-center mb-4">
                                                    <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                                                        {activeCategoryId === 'special' ? 'star' : 'category'}
                                                    </span>
                                                </div>
                                                <h3 className="text-on-surface font-bold text-lg mb-2">No products found</h3>
                                                <GoldenGlowButton
                                                    onClick={() => setModalConfig({
                                                        isOpen: true,
                                                        categoryName: activeCategoryId === 'special' ? 'special' : activeCategoryId
                                                    })}
                                                    className="mt-4"
                                                >
                                                    <span className="material-symbols-outlined text-lg mr-1">add</span>
                                                    Add Product
                                                </GoldenGlowButton>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2 flex-1 overflow-y-auto no-scrollbar pb-4">
                                                {filteredItems.map(item => (
                                                    <ProductCard
                                                        key={item.id}
                                                        item={item}
                                                        isSpecial={activeCategoryId === 'special'}
                                                        onToggleStock={toggleStock}
                                                        onDelete={handleDelete}
                                                        onEdit={(item) => setModalConfig({ 
                                                            isOpen: true, 
                                                            categoryName: activeCategoryId === 'special' ? 'special' : activeCategoryId, 
                                                            editItem: item 
                                                        })}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            );
                        })()}
                    </>
                )}
            </div>

            <AddProductModal
                isOpen={modalConfig.isOpen}
                categoryName={modalConfig.categoryName}
                editItem={modalConfig.editItem}
                onClose={() => setModalConfig({ isOpen: false, categoryName: '', editItem: null })}
                onAdd={handleAddProduct}
                onEdit={handleEditProduct}
                isSubmitting={isSubmitting}
            />

        </div>
    );
};

export default VendorProducts;
