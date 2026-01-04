
import { GoogleGenAI, Schema } from "@google/genai";
import { Story, Citation, Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GeminiResult {
  text: string;
  stories?: Story[];
  sources?: Source[];
}

function parseMultipleStoriesFromText(text: string): Story[] {
  const stories: Story[] = [];
  const storyBlocks = text.split('---').map(s => s.trim()).filter(Boolean);

  for (const block of storyBlocks) {
    const titleMatch = block.match(/## Title: (.*)/);
    const authorMatch = block.match(/### Author: (.*)/);
    const bookMatch = block.match(/### Book: (.*)/);
    const storyMatch = block.match(/### Story\s*([\s\S]*)/);
    
    if (titleMatch && authorMatch && bookMatch && storyMatch) {
      const citation: Citation = {
        author: authorMatch[1].trim(),
        title: bookMatch[1].trim(),
      };
      const story: Story = {
        title: titleMatch[1].trim(),
        citation,
        content: storyMatch[1].trim(),
      };
      stories.push(story);
    }
  }
  
  if (stories.length === 0) {
      const titleMatch = text.match(/## Title: (.*)/);
      const authorMatch = text.match(/### Author: (.*)/);
      const bookMatch = text.match(/### Book: (.*)/);
      const storyMatch = text.match(/### Story\s*([\s\S]*)/);

      if (titleMatch && authorMatch && bookMatch && storyMatch) {
        const citation: Citation = {
          author: authorMatch[1].trim(),
          title: bookMatch[1].trim(),
        };
        const story: Story = {
          title: titleMatch[1].trim(),
          citation,
          content: storyMatch[1].trim(),
        };
        return [story];
      }
  }

  return stories;
}


export const getQuickAnswer = async (prompt: string): Promise<GeminiResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a master librarian and storyteller.
      **Crucial Rule:** Your absolute first priority is to identify if the user is asking for a *specific, named story, author, or book*. If they are, you MUST focus your entire effort on finding and presenting *that specific story*.

      You MUST format your response as follows:

      ## Title: [Title of the Story]
      ### Author: [Author's Name]
      ### Book: [Book or Collection Name]
      ### Story
      [The full text or a detailed summary of the story here]

      User query: "${prompt}"`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const stories = parseMultipleStoriesFromText(text);

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: Source[] = groundingChunks
      ?.filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        uri: chunk.web.uri,
        title: chunk.web.title || 'Source',
      })) || [];

    return { text, stories, sources: sources.length > 0 ? sources : undefined };
  } catch (error) {
    console.error("Error fetching quick answer:", error);
    return { text: "I'm sorry, I encountered an error while searching for that story." };
  }
};

export const getDeepAnalysis = async (prompt: string): Promise<GeminiResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are a literary scholar and mythologist. Unearth profound, obscure stories from world literature based on this request: "${prompt}". 

Separate each story with "---" and use the format:
## Title: [Title]
### Author: [Author]
### Book: [Book]
### Story
[Detailed summary]`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const text = response.text;
    const stories = parseMultipleStoriesFromText(text);
    return { text, stories };
  } catch (error) {
    console.error("Error fetching deep analysis:", error);
    return { text: "I'm sorry, I encountered an error during my deep analysis." };
  }
};


export const getCreativeCollab = async (prompt: string): Promise<GeminiResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an insightful and collaborative literary analyst. Partner with the user to explore: "${prompt}"`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
      },
    });

    return { text: response.text };
  } catch (error) {
    console.error("Error fetching creative collab response:", error);
    return { text: "I'm sorry, I had trouble formulating a response." };
  }
};

export const transcribeUserAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
          { text: "Transcribe this audio exactly as spoken." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "Error transcribing audio.";
  }
};

export const consultScriptorium = async (currentText: string, instruction: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an intellectual partner in a Scriptorium. 
      Text: "${currentText}"
      Instruction: "${instruction}"
      Be fluid, responsive, and intellectually rigorous.`
    });
    return response.text || "";
  } catch (error) {
    console.error("Error consulting scriptorium:", error);
    return "I am having trouble consulting the archives right now.";
  }
};
