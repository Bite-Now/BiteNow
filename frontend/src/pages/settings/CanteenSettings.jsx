import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import GlassInput from '../../components/ui/GlassInput';
import GoldenGlowButton from '../../components/ui/GoldenGlowButton';
import ImageUploadBox from '../../components/ui/ImageUploadBox';
import { Loader2 } from 'lucide-react';

const CanteenSettings = () => {
    const [canteenName, setCanteenName] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchCanteen = async () => {
            try {
                const response = await api.get('/owner/canteen');
                setCanteenName(response.data.name || '');
                setDescription(response.data.description || '');
                setImageUrl(response.data.image_url || '');
                setIsOpen(response.data.is_open !== false);
            } catch (err) {
                console.error('Failed to fetch canteen:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCanteen();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', canteenName);
            formData.append('description', description);
            formData.append('is_open', isOpen);
            
            if (imageFile) {
                formData.append('file', imageFile);
            } else if (imageUrl) {
                formData.append('image_url', imageUrl);
            }

            const response = await api.patch('/owner/canteen', formData);
            
            // If the server returns a new image_url or we want to reset file state
            setImageFile(null);
            alert('Canteen settings updated successfully!');
        } catch (err) {
            console.error('Failed to update canteen:', err);
            alert('Failed to update canteen settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#1c1b1b] rounded-[24px] p-5 shadow-lg mx-2 mb-8">
                <h2 className="font-title-md text-primary mb-6">Canteen Information</h2>
                
                <form onSubmit={handleSave} className="flex flex-col gap-5">
                    <GlassInput 
                        label="Canteen Name" 
                        value={canteenName} 
                        onChange={(e) => setCanteenName(e.target.value)} 
                    />
                    <GlassInput 
                        label="Canteen Description" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                    />
                    <ImageUploadBox 
                        label="Banner Image" 
                        value={imageUrl} 
                        onChange={(file, previewUrl) => {
                            if (file) {
                                setImageUrl(previewUrl);
                                setImageFile(file);
                            } else {
                                setImageUrl('');
                                setImageFile(null);
                            }
                        }} 
                    />
                    
                    <div className="flex flex-col gap-2 mt-2">
                        <span className="font-label-sm text-on-surface-variant px-1 uppercase tracking-wider text-[10px]">Canteen Status</span>
                        <div className="flex gap-2">
                            <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-primary/30 bg-primary/10 cursor-pointer active:scale-95 transition-transform">
                                <input 
                                    type="radio" 
                                    name="status" 
                                    value="open" 
                                    checked={isOpen} 
                                    onChange={() => setIsOpen(true)}
                                    className="accent-primary" 
                                />
                                <span className="font-label-md text-primary font-bold">Open</span>
                            </label>
                            <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-outline-variant/30 bg-surface cursor-pointer active:scale-95 transition-transform">
                                <input 
                                    type="radio" 
                                    name="status" 
                                    value="closed" 
                                    checked={!isOpen} 
                                    onChange={() => setIsOpen(false)}
                                    className="accent-primary" 
                                />
                                <span className="font-label-md text-on-surface-variant font-bold">Closed</span>
                            </label>
                        </div>
                    </div>
                    
                    <div className="pt-6">
                        <GoldenGlowButton type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Canteen'}
                        </GoldenGlowButton>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default CanteenSettings;
