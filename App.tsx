import React, { useState, useCallback, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageGrid } from './components/GeneratedImageGrid';
import { GenerationProgress } from './components/GenerationProgress';
import { StyleSelector } from './components/StyleSelector';
import { generateStyledImages, generateSingleStyledImage } from './services/geminiService';

const App: React.FC = () => {
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [outfitImage, setOutfitImage] = useState<File | null>(null);
    const [personImagePreview, setPersonImagePreview] = useState<string | null>(null);
    const [outfitImagePreview, setOutfitImagePreview] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [selectedStyle, setSelectedStyle] = useState<string>('Casual');

    const handlePersonImageChange = useCallback((file: File | null) => {
        setPersonImage(file);
        if (personImagePreview) URL.revokeObjectURL(personImagePreview);
        if (file) {
            setPersonImagePreview(URL.createObjectURL(file));
        } else {
            setPersonImagePreview(null);
        }
    }, [personImagePreview]);

    const handleOutfitImageChange = useCallback((file: File | null) => {
        setOutfitImage(file);
        if (outfitImagePreview) URL.revokeObjectURL(outfitImagePreview);
        if (file) {
            setOutfitImagePreview(URL.createObjectURL(file));
        } else {
            setOutfitImagePreview(null);
        }
    }, [outfitImagePreview]);

    const handleGenerate = async () => {
        if (!personImage || !outfitImage) {
            setError("Please upload both images before generating.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setProgress(0);

        try {
            const onImageGenerated = (newImage: string, p: number) => {
                setGeneratedImages(prev => [...prev, newImage]);
                setProgress(p);
            };
            await generateStyledImages(personImage, outfitImage, selectedStyle, onImageGenerated);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred. Please check the console for details.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRedoImage = useCallback(async (index: number) => {
        if (!personImage || !outfitImage) return;
        
        try {
            const newImageUrl = await generateSingleStyledImage(
                personImage,
                outfitImage,
                selectedStyle,
                index
            );
            setGeneratedImages(prevImages => {
                const newImages = [...prevImages];
                newImages[index] = newImageUrl;
                return newImages;
            });
            setError(null); // Clear previous errors on success
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while redoing the image.";
            setError(errorMessage);
        }
    }, [personImage, outfitImage, selectedStyle]);


    const handleStartOver = () => {
        setPersonImage(null);
        setOutfitImage(null);
        if (personImagePreview) URL.revokeObjectURL(personImagePreview);
        if (outfitImagePreview) URL.revokeObjectURL(outfitImagePreview);
        setPersonImagePreview(null);
        setOutfitImagePreview(null);
        setGeneratedImages([]);
        setIsLoading(false);
        setError(null);
        setProgress(0);
        setSelectedStyle('Casual');
    };

    const canGenerate = useMemo(() => personImage && outfitImage && !isLoading, [personImage, outfitImage, isLoading]);
    const showStartOver = personImage || outfitImage || generatedImages.length > 0 || isLoading || error;

    return (
        <div className="min-h-screen text-white p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto pb-40">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 pb-2">
                        AI Style Fusion
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                        Upload your photo and an outfit. Our AI will create 10 realistic images of you wearing it from different angles and poses.
                    </p>
                </header>

                <main className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-gray-700/50 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <ImageUploader 
                            id="person-image"
                            label="Your Photo"
                            onImageChange={handlePersonImageChange}
                            imagePreview={personImagePreview}
                        />
                        <ImageUploader 
                            id="outfit-image"
                            label="Outfit Photo"
                            onImageChange={handleOutfitImageChange}
                            imagePreview={outfitImagePreview}
                        />
                    </div>

                    <StyleSelector selectedStyle={selectedStyle} onStyleChange={setSelectedStyle} />
                    
                    <div className="text-center mb-8 flex flex-col items-center gap-4">
                        <button
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                            className="w-full max-w-xs px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            {isLoading ? 'Generating...' : 'Generate Your Style'}
                        </button>
                        {showStartOver && (
                             <button
                                onClick={handleStartOver}
                                className="px-6 py-2 bg-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Start Over
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="text-center p-4 mb-8 bg-red-900/50 border border-red-700 text-red-200 rounded-lg max-w-2xl mx-auto">
                            <p className="font-bold text-lg">An Error Occurred</p>
                            <p className="mt-1">{error}</p>
                        </div>
                    )}
                    
                    {generatedImages.length > 0 && (
                        <GeneratedImageGrid 
                            images={generatedImages} 
                            selectedStyle={selectedStyle}
                            onRedo={handleRedoImage}
                        />
                    )}
                </main>

                <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Google Gemini</p>
                </footer>
            </div>

            {isLoading && (
                <div className="fixed bottom-0 left-0 right-0 w-full z-50">
                    <div className="bg-gray-900/80 backdrop-blur-md border-t border-gray-700 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
                        <div className="max-w-7xl mx-auto p-4 sm:p-6">
                            <GenerationProgress progress={progress} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
