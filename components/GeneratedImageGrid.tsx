import React, { useState } from 'react';

interface GeneratedImageGridProps {
    images: string[];
    selectedStyle: string;
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

export const GeneratedImageGrid: React.FC<GeneratedImageGridProps> = ({ images, selectedStyle }) => {
    const [confirmedDownloadIndex, setConfirmedDownloadIndex] = useState<number | null>(null);

    const handleDownload = (imageSrc: string, index: number) => {
        if (confirmedDownloadIndex === index) return;

        const link = document.createElement('a');
        link.href = imageSrc;
        const styleSlug = selectedStyle.toLowerCase().replace(/\s+/g, '-');
        link.download = `ai-style-${styleSlug}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setConfirmedDownloadIndex(index);
        setTimeout(() => {
            setConfirmedDownloadIndex(null);
        }, 2000);
    };

    return (
        <section className="fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 mt-12 text-gray-200">Your New Styles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {images.map((imageSrc, index) => (
                    <div 
                        key={index} 
                        className="group relative rounded-lg overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-105 fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <img 
                            src={imageSrc} 
                            alt={`Generated style ${index + 1}`} 
                            className="w-full h-auto aspect-[3/4] object-cover bg-gray-800"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity duration-300 flex items-center justify-center">
                            <button
                                onClick={() => handleDownload(imageSrc, index)}
                                disabled={confirmedDownloadIndex === index}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-green-600 disabled:opacity-100"
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
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
