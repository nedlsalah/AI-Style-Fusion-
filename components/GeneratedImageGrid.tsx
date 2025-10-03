import React from 'react';

interface GeneratedImageGridProps {
    images: string[];
}

const DownloadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const GeneratedImageGrid: React.FC<GeneratedImageGridProps> = ({ images }) => {
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
                            <a
                                href={imageSrc}
                                download={`ai-style-${index + 1}.png`}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                            >
                                <DownloadIcon />
                                Download
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};