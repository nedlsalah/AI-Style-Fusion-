import React, { useState } from 'react';
import { Spinner } from './Spinner';

interface GeneratedImageGridProps {
    images: string[];
    baseStyle: string;
    accentStyle: string;
    onRedo: (index: number) => Promise<void>;
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const RedoIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 15" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-1.5-1.5A9 9 0 003.5 9" />
    </svg>
);

const SmallSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const GeneratedImageGrid: React.FC<GeneratedImageGridProps> = ({ images, baseStyle, accentStyle, onRedo }) => {
    const [confirmedDownloadIndex, setConfirmedDownloadIndex] = useState<number | null>(null);
    const [redoingIndex, setRedoingIndex] = useState<number | null>(null);

    const handleDownload = (imageSrc: string, index: number) => {
        if (confirmedDownloadIndex === index) return;

        const link = document.createElement('a');
        link.href = imageSrc;
        
        const baseSlug = baseStyle.toLowerCase().replace(/\s+/g, '-');
        let filename = `ai-style-${baseSlug}-${index + 1}.png`;

        if (accentStyle && accentStyle !== 'None') {
            const accentSlug = accentStyle.toLowerCase().replace(/\s+/g, '-');
            filename = `ai-style-${baseSlug}-accent-${accentSlug}-${index + 1}.png`;
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setConfirmedDownloadIndex(index);
        setTimeout(() => {
            setConfirmedDownloadIndex(null);
        }, 2000);
    };

    const handleRedo = async (index: number) => {
        if (redoingIndex !== null) return;
        setRedoingIndex(index);
        await onRedo(index);
        setRedoingIndex(null);
    };

    return (
        <section className="fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 mt-12 text-gray-200">Your New Styles</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {images.map((imageSrc, index) => (
                    <div 
                        key={index} 
                        className="group relative rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-105 fade-in aspect-[3/4]"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <img 
                            src={imageSrc} 
                            alt={`Generated style ${index + 1}`} 
                            className="w-full h-full object-cover bg-gray-800"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(imageSrc, index)}
                                    disabled={confirmedDownloadIndex === index}
                                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-green-600"
                                >
                                    {confirmedDownloadIndex === index ? (
                                        <>
                                            <CheckIcon />
                                            Downloaded!
                                        </>
                                    ) : (
                                        <>
                                            <DownloadIcon />
                                            Download
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleRedo(index)}
                                    disabled={redoingIndex !== null}
                                    className="p-3 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 disabled:cursor-not-allowed"
                                    aria-label="Redo image"
                                >
                                    {redoingIndex === index ? <SmallSpinner /> : <RedoIcon />}
                                </button>
                            </div>
                        </div>
                        {redoingIndex === index && (
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                <Spinner />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};