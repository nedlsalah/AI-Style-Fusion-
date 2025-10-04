import React from 'react';

interface StyleSelectorProps {
    selectedStyle: string;
    onStyleChange: (style: string) => void;
}

const styles = [
    'Casual',
    'Formal',
    'Studio Portrait',
    'Outdoor Casual',
    'Evening Wear',
    'Cyberpunk',
    'Art Deco',
    'Retro 80s',
    'Fantasy',
    'Gothic'
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
    return (
        <div className="mb-8">
            <h3 className="text-xl font-bold text-center mb-4 text-gray-200">Choose a Style</h3>
            <div className="flex flex-wrap justify-center gap-3">
                {styles.map((style) => (
                    <button
                        key={style}
                        onClick={() => onStyleChange(style)}
                        className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
                            selectedStyle === style
                                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                        }`}
                    >
                        {style}
                    </button>
                ))}
            </div>
        </div>
    );
};