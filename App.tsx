
import React, { useState, useCallback, useMemo } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImageGrid } from './components/GeneratedImageGrid';
import { Spinner } from './components/Spinner';
import { generateStyledImages } from './services/geminiService';

const App: React.FC = () => {
    const [personImage, setPersonImage] = useState<File | null>(null);
    const [outfitImage, setOutfitImage] = useState<File | null>(null);
    const [personImagePreview, setPersonImagePreview] = useState<string | null>(null);
    const [outfitImagePreview, setOutfitImagePreview] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

        try {
            const images = await generateStyledImages(personImage, outfitImage);
            setGeneratedImages(images);
        } catch (err) {
            console.error(err);
            setError("Failed to generate images. Please check the console for details and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const canGenerate = useMemo(() => personImage && outfitImage && !isLoading, [personImage, outfitImage, isLoading]);

    return (
        <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
                        AI Style Fusion
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Upload your photo and an outfit. Our AI will create 10 realistic images of you wearing it.
                    </p>
                </header>

                <main>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <ImageUploader 
                            id="person-image"
                            label="Your Photo (Image 1)"
                            onImageChange={handlePersonImageChange}
                            imagePreview={personImagePreview}
                        />
                        <ImageUploader 
                            id="outfit-image"
                            label="Outfit Photo (Image 2)"
                            onImageChange={handleOutfitImageChange}
                            imagePreview={outfitImagePreview}
                        />
                    </div>
                    
                    <div className="text-center mb-8">
                        <button
                            onClick={handleGenerate}
                            disabled={!canGenerate}
                            className="px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
                        >
                            {isLoading ? 'Generating...' : 'Generate Your Style'}
                        </button>
                    </div>

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg">
                            <Spinner />
                            <p className="mt-4 text-lg text-gray-300">
                                Crafting your new looks... This may take a few moments.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">
                            <p className="font-bold">An Error Occurred</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {generatedImages.length > 0 && (
                        <GeneratedImageGrid images={generatedImages} />
                    )}
                </main>

                <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Google Gemini</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
