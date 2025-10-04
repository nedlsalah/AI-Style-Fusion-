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
    'Full-body shot\nThe man stands in a relaxed yet confident pose, one hand casually in his pocket, the other resting by his side. His mouth remains closed, his expression calm and grounded. The outfit falls naturally — clean lines, subtle textures catching the light. The background is minimal, letting the focus stay on his posture and overall look.',
    'Close-up portrait\nA tight frame captures the upper part of his outfit and the quiet intensity in his eyes. The camera highlights small details — the fabric’s texture, the collar’s structure, and the light brushing across his face. His lips are closed, expression thoughtful but composed, showing confidence without a smile.',
    'Medium waist-up shot\nHe leans slightly against a wall, one shoulder touching it, creating a casual yet refined pose. The outfit fits neatly, the sleeves or upper layers showing their texture under soft indoor lighting. His expression is calm, mouth closed, gaze slightly off-camera — as if lost in thought.',
    'Seated on sofa\nHe sits comfortably on a modern sofa inside the apartment, one arm resting on the backrest, the other relaxed on his lap. The outfit drapes effortlessly with natural folds, reflecting a sense of comfort and style. His lips remain closed, his expression neutral, blending a sense of peace and quiet confidence.',
    'Wide-angle interior shot\nThe camera captures him within the apartment — a minimalist space with clean lines and soft light filtering through. He stands near a window or wall, the outfit subtly contrasting with the tones of the room. Mouth closed, posture steady, his calm energy fills the wide frame without words.',
    'Mirror selfie\nThe man stands in front of a full-length mirror, holding his phone naturally at chest level. Afternoon light hits the outfit, highlighting its fit and texture. The reflection shows a composed expression with closed lips, giving the moment an authentic, self-assured feel. The apartment background is tidy and stylish.',
    'Low-angle dynamic shot\nThe camera is placed slightly below eye level, looking up to emphasize presence and confidence. The man stands tall, mouth closed, eyes steady, outfit structured and sharp. The angle gives him a powerful yet natural look — as if quietly owning the space without trying too hard.',
    'Side profile shot\nA clean profile from the side, showing the sharp lines and silhouette of the outfit. His expression is calm and reflective, lips closed, gaze focused straight ahead. The background is softly blurred, keeping all attention on the outline and structure of his look.',
    'Sitting on the floor (vertical 3:4)\nHe sits casually on the floor, one leg bent, the other stretched out. His outfit folds naturally with his movement, showing comfort and texture. The lighting is soft, creating gentle shadows. The background stays minimal, drawing focus to his relaxed pose and quiet expression, mouth closed.',
    'Depth-of-field shot with blurred foreground\nA plant, light flare, or soft object in the foreground adds depth. The man stands or sits behind it, sharply in focus, his mouth closed and eyes calm. The outfit catches subtle highlights, and the framing feels intimate — like a candid glimpse into a quiet, stylish moment.'
];

const getPrompt = (variation: string, style: string): string => {
    const basePrompt = `Task: Generate an ultra-realistic, 4K resolution photograph.
Subject: Combine the person from image 1 with the outfit from image 2.
Key instructions:
- The person's face, facial features, and likeness from image 1 must be perfectly preserved.
- The outfit from image 2 should be seamlessly and realistically placed on the person. The top from the outfit should be worn untucked with an oversized fit (like a size M). The person must also be wearing socks that are visible and match the outfit's style.
- The person's expression must be neutral or serious. Do not show them smiling or showing teeth.
- The final image must be exceptionally detailed, with sharp focus, and look like it was taken with a professional DSLR camera. It must be 4K quality.
- Person details: The character is a medium-sized Moroccan man in his late 20s. He is approximately 1.75m tall and 80kg. His hair is short, dark, and curly, and he has a neatly trimmed goatee. All of his features must perfectly match the person in image 1.
- Consistency: Maintain natural body proportions, skin tone, and hairstyle consistent with the person in image 1.`;
    
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
            contents: [{
                parts: [personImagePart, outfitImagePart, textPart],
            }],
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
                contents: [{
                    parts: [personImagePart, outfitImagePart, textPart],
                }],
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