import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy initialize the Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export const suggestSubstitutes = async (medicineName: string, salt: string) => {
  try {
    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on the medicine "${medicineName}" with salt "${salt}", suggest 5 common Indian brand substitutes with the same exact salt and strength. Format the output as a JSON array of objects with keys: name, manufacturer, and common_price_range.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up the response if it contains markdown code blocks
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error suggesting substitutes:', error);
    return [];
  }
};

export const scanBillOCR = async (base64Image: string) => {
  try {
    const model = getGenAI().getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "Extract all items from this pharmacy purchase invoice image. Return a JSON structure with bill_number, date, supplier_name, and an array of items (name, batch, expiry, rate, qty, gst_percentage).";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType: "image/jpeg"
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error scanning bill OCR:', error);
    return null;
  }
};
