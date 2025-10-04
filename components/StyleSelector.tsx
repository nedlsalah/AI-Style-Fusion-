import React from 'react';

interface StyleSelectorProps {
    selectedBaseStyle: string;
    onBaseStyleChange: (style: string) => void;
    selectedAccentStyle: string;
    onAccentStyleChange: (style: string) => void;
}

const styles = [
    'Casual',
    'Formal',
    'Studio Portrait',
    'Outdoor Casual',
    'Evening Wear'
];

const accentStyles = ['None', ...styles];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ 
    selectedBaseStyle, 
    onBaseStyleChange,
    selectedAccentStyle,
    onAccentStyleChange
}) => {

    const handleBaseStyleChange = (style: string) => {
        onBaseStyleChange(style);
        // If the new base style is the same as the current accent style, reset the accent
        if (style === selectedAccentStyle) {
            onAccentStyleChange('None');
        }
    };

    // Don't allow the selected base style to be an accent style
    const filteredAccentStyles = accentStyles.filter(style => style !== selectedBaseStyle);

    return (
        <div className="mb-8 space-y-6">
            <div>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-200">1. Choose a Base Style</h3>
                <div className="flex flex-wrap justify-center gap-3">
                    {styles.map((style) => (
                        <button
                            key={style}
                            onClick={() => handleBaseStyleChange(style)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
                                selectedBaseStyle === style
                                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg'
                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-center mb-4 text-gray-200">2. (Optional) Add an Accent Style</h3>
                 <div className="flex flex-wrap justify-center gap-3">
                    {filteredAccentStyles.map((style) => (
                        <button
                            key={style}
                            onClick={() => onAccentStyleChange(style)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border-2 transition-all duration-200 ease-in-out transform hover:scale-105 ${
                                selectedAccentStyle === style
                                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:border-gray-500'
                            }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};