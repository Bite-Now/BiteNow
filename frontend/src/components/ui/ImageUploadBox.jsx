import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

const ImageUploadBox = ({ label, value, onChange }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (validTypes.includes(file.type)) {
            // Generate a local preview URL
            const previewUrl = URL.createObjectURL(file);
            // Call onChange with both the file and the preview URL
            onChange(file, previewUrl);
        } else {
            alert('Please upload a JPG, PNG, or WebP image.');
        }
    };

    const clearImage = (e) => {
        e.stopPropagation();
        if (fileInputRef.current) fileInputRef.current.value = '';
        onChange(null, '');
    };

    return (
        <div className="flex flex-col gap-2">
            {label && <span className="font-label-sm text-on-surface-variant px-1 uppercase tracking-wider text-[10px]">{label}</span>}
            
            <div 
                className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed transition-colors cursor-pointer overflow-hidden
                    ${dragActive ? 'border-amber-500 bg-amber-500/10' : 'border-outline-variant/50 bg-surface/30 hover:border-amber-500/50 hover:bg-surface/50'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg, image/jpg, image/png, image/webp" 
                    onChange={handleChange} 
                    className="hidden" 
                />

                {value ? (
                    <>
                        <img src={value} alt="Preview" className="w-full h-full object-cover opacity-80" />
                        <button 
                            type="button"
                            onClick={clearImage}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors backdrop-blur-md"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                        <p className="text-sm font-medium">Click or drag image to upload</p>
                        <p className="text-xs mt-1 opacity-70">JPG, PNG, or WebP (max 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUploadBox;
