import React, { useRef, useState, useEffect } from 'react';

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

const CloseIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const UploaderSpinner: React.FC = () => (
    <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, imagePreview, onImageChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        // When the parent passes a new imagePreview, we know processing is done.
        if (imagePreview) {
            setIsProcessing(false);
        }
    }, [imagePreview]);

    const handleFileSelected = (file: File | null) => {
        if (file) {
            setIsProcessing(true);
            onImageChange(file);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        handleFileSelected(file);
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
        handleFileSelected(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    const handleRemoveImage = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onImageChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const containerClasses = `w-full border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300 relative overflow-hidden group ${
        imagePreview ? 'h-96' : 'h-80'
    } ${
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
                {isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm z-10">
                        <UploaderSpinner />
                    </div>
                ) : imagePreview ? (
                    <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                            onClick={handleRemoveImage}
                            className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-all duration-200 z-20"
                            aria-label="Remove image"
                        >
                            <CloseIcon />
                        </button>
                    </>
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
                    disabled={isProcessing}
                />
            </label>
        </div>
    );
};