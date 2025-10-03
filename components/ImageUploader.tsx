import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
    id: string;
    label: string;
    imagePreview: string | null;
    onImageChange: (file: File | null) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-3 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, imagePreview, onImageChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onImageChange(file);
    };

    const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0] || null;
        onImageChange(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const containerClasses = `w-full h-80 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
        isDragging ? 'border-indigo-500 bg-gray-700/50 scale-105' : 'border-gray-600 hover:border-indigo-500'
    }`;

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-200">{label}</h2>
            <label
                htmlFor={id}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={containerClasses}
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center p-4">
                        <UploadIcon />
                        <p className="text-gray-400">
                            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP (MAX. 10MB)</p>
                    </div>
                )}
                <input
                    id={id}
                    ref={inputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
};