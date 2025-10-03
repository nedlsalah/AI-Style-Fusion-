import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

const getPrompt = (style: string): string => {
    const basePrompt = `Take the outfit from image 2 and place it on the male character from image 1, keeping his original face and facial features unchanged. Create this as a bright, high-resolution (4K) realistic photo. The character is a 28-year-old Moroccan man, 1.75 m tall, 80kg, with a mesomorph build (balanced, confident frame). He has short dark brown curly hair in a mid-fade haircut, a compact neck, green-brown eyes, and a neatly trimmed goatee. His arms have a light natural hair. He is wearing the clothes from image 2. The hairstyle, body proportions, and skin tone should be natural and consistent with his background.`;

    const stylePrompts: { [key: string]: string } = {
        'Casual': 'The setting is a modern, sunlit apartment with minimalist decor. The pose is relaxed and confident.',
        'Formal': 'The setting is an elegant event hall with soft, ambient lighting. The pose is poised and sophisticated.',
        'Studio Portrait': 'The background is a professional studio setting with a solid, neutral color (like charcoal gray). Lighting is dramatic and focused to highlight the outfit and subject.',
        'Outdoor Casual': 'The setting is an urban street-style scene, possibly in a trendy city district with interesting architecture in the background. The lighting is natural daylight.',
        'Evening Wear': 'The setting is a luxurious rooftop lounge at dusk, with city lights blurred in the background (bokeh effect). The atmosphere is glamorous and upscale.',
    };

    const styleSuffix = stylePrompts[style] || stylePrompts['Casual'];

    return `${basePrompt} ${styleSuffix} The final result should look like a lifelike, professional photo.`;
};


export const generateStyledImages = async (
    personImageFile: File, 
    outfitImageFile: File,
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
    
    const styles = [
        'Casual',
        'Formal',
        'Studio Portrait',
        'Outdoor Casual',
        'Evening Wear'
    ];

    const generatedImages: string[] = [];
    const totalImages = 10;

    for (let i = 0; i < totalImages; i++) {
        // Cycle through the styles to create a mix
        const currentStyle = styles[i % styles.length];
        
        const textPart = {
            text: getPrompt(currentStyle),
        };

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
            throw new Error(`API response for image ${i + 1} did not contain an image part.`);
        }
    }
    
    return generatedImages;
};