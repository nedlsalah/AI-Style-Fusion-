
import React, { useRef } from 'react';

interface ImageUploaderProps {
    id: string;
    label: string;
    imagePreview: string | null;
    onImageChange: (file: File | null) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, imagePreview, onImageChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onImageChange(file);
    };

    const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0] || null;
        onImageChange(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-200">{label}</h2>
            <label
                htmlFor={id}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="w-full h-80 border-2 border-dashed border-gray-600 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-indigo-500 hover:bg-gray-700/50 transition-colors duration-300 relative overflow-hidden"
            >
                {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="text-center">
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
