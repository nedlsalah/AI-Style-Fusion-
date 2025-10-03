
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

const PROMPT = `Take the outfit from image 2 and place it on the male character from image 1, keeping his original face and facial features unchanged. Create this as a bright, high-resolution (4K) realistic photo. The scene should look like a natural mirror selfie: a 28-year-old Moroccan man, 1.75 m tall, 80kg, with a mesomorph build (balanced, confident frame). He has short dark brown curly hair in a mid-fade haircut, a compact neck, green-brown eyes, and a neatly trimmed goatee. His arms have a light natural hair. He is posing elegantly in the afternoon sunlight, looking toward the mirror, wearing the clothes from image 2. The hairstyle, body proportions, and skin tone should be natural and consistent with his background. The final result should look like a lifelike, professional yet casual photo.`;

export const generateStyledImages = async (personImageFile: File, outfitImageFile: File): Promise<string[]> => {
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
        text: PROMPT,
    };

    const generationPromises = Array(10).fill(0).map(() => 
        ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [personImagePart, outfitImagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        })
    );

    const responses = await Promise.all(generationPromises);

    const generatedImages = responses.map(response => {
        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            const { data, mimeType } = imagePart.inlineData;
            return `data:${mimeType};base64,${data}`;
        }
        throw new Error("API response did not contain an image part.");
    });
    
    return generatedImages;
};
