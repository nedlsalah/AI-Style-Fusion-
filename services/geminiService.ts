import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const handleApiError = (error: unknown, context: string): Error => {
    console.error(`Gemini API Error during ${context}:`, error);
    const errorMessage = error instanceof Error ? error.toString() : String(error);

    if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        return new Error("The AI is currently experiencing high traffic. Please wait a moment and try again.");
    }
    if (errorMessage.includes('400') || errorMessage.includes('INVALID_ARGUMENT')) {
        return new Error("There's a problem with the request, possibly due to the uploaded images. Please try using different, high-quality images.");
    }
    if (errorMessage.toUpperCase().includes('SAFETY')) {
        return new Error("The request was blocked for safety reasons. Please try using different images.");
    }

    return new Error("An unexpected error occurred while communicating with the AI. Please try again.");
};

const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
            const data = result.split(',')[1];
            resolve({ mimeType, data });
        };
        reader.onerror = (error) => reject(error);
    });
};

const styleSettings: { [key: string]: string } = {
    'Casual': 'The setting is a modern, sunlit apartment with minimalist decor.',
    'Formal': 'The setting is an elegant event hall with chandeliers and classic architecture.',
    'Studio Portrait': 'The setting is a professional photography studio with a neutral grey backdrop and studio lighting.',
    'Outdoor Casual': 'The setting is a vibrant street in the UAE, showcasing the modern architecture of Dubai or the cultural landmarks of Abu Dhabi, with soft, natural afternoon light.',
    'Evening Wear': 'The setting is a sophisticated rooftop bar at night, with city lights in the background.'
};

const variations = [
    'A full-body shot, with the character standing in a relaxed, confident pose.',
    'A close-up portrait shot, focusing on the details of the face and the upper part of the outfit.',
    'A medium shot from the waist up, with the character leaning against a wall.',
    'The character is sitting comfortably on a modern sofa in the apartment.',
    'A wide-angle shot that captures more of the minimalist apartment interior.',
    'A mirror selfie taken in a stylish, full-length mirror within the apartment.',
    'A dynamic, low-angle shot looking up at the character to make the pose feel powerful.',
    'A profile shot (from the side) showcasing the silhouette of the outfit.',
    'A hyper-realistic vertical (3:4) mirror selfie of the person sitting on a marble floor in a morning sunbeam. One leg is bent, the other stretched out. They are holding an iPhone near their face to take the picture. Behind them is a wall with Batman graffiti. The image must have sharp focus, 8K quality, warm cinematic light, and an urban cool vibe.',
    'A shot with a slightly blurred foreground element (like a plant) to create depth of field, focusing on the character.'
];

const getPrompt = (variation: string, style: string): string => {
    const basePrompt = `Task: Generate an ultra-realistic, 4K resolution photograph.
Subject: Combine the person from image 1 with the outfit from image 2.
Key instructions:
- The person's face, facial features, and likeness from image 1 must be perfectly preserved.
- The outfit from image 2 should be seamlessly and realistically placed on the person. The top from the outfit should be worn untucked with an oversized fit (like a size M).
- The person's expression must be neutral or serious. Do not show them smiling or showing teeth.
- The final image must be exceptionally detailed, with sharp focus, and look like it was taken with a professional DSLR camera. It must be 4K quality.
- Person details: The character is a medium-sized Moroccan man in his late 20s. He is approximately 1.75m tall and 80kg. His hair is short, dark, and curly, and he has a neatly trimmed goatee. All of his features must perfectly match the person in image 1.
- Consistency: Maintain natural body proportions, skin tone, and hairstyle consistent with the person in image 1.`;

    // The Batman graffiti variation is highly specific and should not include a style-based setting.
    if (variation.includes('Batman graffiti')) {
        return `${basePrompt}\nShot type: ${variation}\nEmphasize realism and high-fidelity detail in every aspect of the final photograph.`;
    }

    const setting = styleSettings[style] || styleSettings['Casual'];

    return `${basePrompt}\nSetting: ${setting}\nShot type: ${variation}\nEmphasize realism and high-fidelity detail in every aspect of the final photograph.`;
};

export const generateSingleStyledImage = async (
    personImageFile: File,
    outfitImageFile: File,
    style: string,
    variationIndex: number
): Promise<string> => {
    const [personImageData, outfitImageData] = await Promise.all([
        fileToBase64(personImageFile),
        fileToBase64(outfitImageFile)
    ]);

    const personImagePart = {
        inlineData: {
            mimeType: personImageData.mimeType,
            data: personImageData.data,
        },
    };

    const outfitImagePart = {
        inlineData: {
            mimeType: outfitImageData.mimeType,
            data: outfitImageData.data,
        },
    };
    
    const textPart = {
        text: getPrompt(variations[variationIndex], style),
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [personImagePart, outfitImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { data, mimeType } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        } else {
            const blockReason = response.candidates?.[0]?.finishReason;
            console.error("Image generation failed. Block Reason:", blockReason, "Safety Ratings:", response.candidates?.[0]?.safetyRatings);
            if (blockReason === 'SAFETY') {
                 throw new Error("Image generation was blocked for safety reasons. Please try different images.");
            }
            throw new Error(`The AI failed to produce an image. This can happen sometimes, please try redoing it.`);
        }
    } catch (error) {
        throw handleApiError(error, `single image generation (variation ${variationIndex})`);
    }
};

export const generateStyledImages = async (
    personImageFile: File, 
    outfitImageFile: File,
    style: string,
    onImageGenerated: (imageUrl: string, progress: number) => void
): Promise<string[]> => {
    const [personImageData, outfitImageData] = await Promise.all([
        fileToBase64(personImageFile),
        fileToBase64(outfitImageFile)
    ]);

    const personImagePart = {
        inlineData: {
            mimeType: personImageData.mimeType,
            data: personImageData.data,
        },
    };

    const outfitImagePart = {
        inlineData: {
            mimeType: outfitImageData.mimeType,
            data: outfitImageData.data,
        },
    };
    
    const generatedImages: string[] = [];
    const totalImages = 10;

    for (let i = 0; i < totalImages; i++) {
        const currentVariation = variations[i];
        
        const textPart = {
            text: getPrompt(currentVariation, style),
        };
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [personImagePart, outfitImagePart, textPart],
                },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });
            
            const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
            if (imagePart?.inlineData) {
                const { data, mimeType } = imagePart.inlineData;
                const imageUrl = `data:${mimeType};base64,${data}`;
                generatedImages.push(imageUrl);
                
                const progress = (i + 1) / totalImages;
                onImageGenerated(imageUrl, progress);
            } else {
                const blockReason = response.candidates?.[0]?.finishReason;
                console.error(`Image generation failed for image ${i + 1}. Block Reason:`, blockReason, "Safety Ratings:", response.candidates?.[0]?.safetyRatings);
                 if (blockReason === 'SAFETY') {
                     throw new Error(`Image ${i + 1} was blocked for safety reasons. Please start over with different images.`);
                }
                throw new Error(`The AI failed to generate image ${i + 1}. Please try again.`);
            }
        } catch(error) {
            throw handleApiError(error, `bulk image generation (image ${i + 1})`);
        }
    }
    
    return generatedImages;
};