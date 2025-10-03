import React from 'react';

interface GenerationProgressProps {
    progress: number; // 0 to 1
}

const messages = [
    "Warming up the AI's creative circuits...",
    "Styling the pixels with precision...",
    "Fusing fashion and photography...",
    "Almost camera-ready, adding highlights...",
    "Applying the final glamorous touches...",
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
    const percentage = Math.round(progress * 100);
    const imagesDone = Math.round(progress * 10);
    const messageIndex = Math.min(Math.floor(progress * messages.length), messages.length - 1);
    const currentMessage = messages[messageIndex];

    return (
        <div className="flex flex-col items-center justify-center text-center w-full">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
                Generating Your Styles
            </h3>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                ></div>
            </div>
            <div className="flex justify-between w-full text-sm text-gray-400">
                <span>{imagesDone} of 10 images complete.</span>
                <span className="font-mono font-semibold text-indigo-300">{percentage}%</span>
            </div>
            <p className="mt-4 text-lg text-gray-300 italic h-6">
                {currentMessage}
            </p>
        </div>
    );
};