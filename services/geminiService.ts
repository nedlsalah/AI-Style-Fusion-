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

const getPrompt = (variation: string): string => {
    const basePrompt = `Task: Generate an ultra-realistic, 4K resolution photograph.
Subject: Combine the person from image 1 with the outfit from image 2.
Key instructions:
- The person's face, facial features, and likeness from image 1 must be perfectly preserved.
- The outfit from image 2 should be seamlessly and realistically placed on the person.
- The final image must be exceptionally detailed, with sharp focus, and look like it was taken with a professional DSLR camera. It must be 4K quality.
- Person details: The character is a 28-year-old Moroccan man, 1.75 m tall, 80kg, with a mesomorph build (balanced, confident frame). He has short dark brown curly hair in a mid-fade haircut, a compact neck, green-brown eyes, and a neatly trimmed goatee. His arms have a light natural hair.
- Consistency: Maintain natural body proportions, skin tone, and hairstyle consistent with the person in image 1.`;

    const setting = 'The setting is a modern, sunlit apartment with minimalist decor.';

    return `${basePrompt}\nSetting: ${setting}\nShot type: ${variation}\nEmphasize realism and high-fidelity detail in every aspect of the final photograph.`;
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
    
    const variations = [
        'A full-body shot, with the character standing in a relaxed, confident pose.',
        'A close-up portrait shot, focusing on the details of the face and the upper part of the outfit.',
        'A medium shot from the waist up, with the character leaning against a wall.',
        'The character is sitting comfortably on a modern sofa in the apartment.',
        'A wide-angle shot that captures more of the minimalist apartment interior.',
        'A mirror selfie taken in a stylish, full-length mirror within the apartment.',
        'A dynamic, low-angle shot looking up at the character to make the pose feel powerful.',
        'A profile shot (from the side) showcasing the silhouette of the outfit.',
        'An over-the-shoulder perspective, as if someone is looking at the character from behind.',
        'A shot with a slightly blurred foreground element (like a plant) to create depth of field, focusing on the character.'
    ];

    const generatedImages: string[] = [];
    const totalImages = 10;

    for (let i = 0; i < totalImages; i++) {
        const currentVariation = variations[i];
        
        const textPart = {
            text: getPrompt(currentVariation),
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