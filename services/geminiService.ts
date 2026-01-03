
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
    // Use a more robust regex to capture story content, even with newlines
    const storyMatch = block.match(/### Story\s*([\s\S]*)/);
    
    // Sometimes the first block might not be a story, handle this gracefully
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
  
  // Fallback for single, non-delimited story
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
      model: "gemini-2.5-flash",
      contents: `You are a master librarian and storyteller.
      **Crucial Rule:** Your absolute first priority is to identify if the user is asking for a *specific, named story, author, or book*. If they are, you MUST focus your entire effort on finding and presenting *that specific story*. Only if they ask for a theme or an idea should you search for multiple examples.

      When you find the requested story:
      - If it's short and in the public domain, present the full text.
      - If it's under copyright or too long, provide a detailed summary.

      You MUST format your response as follows, even if you only find one story. Use "---" as a separator if you find multiple thematically related stories (which you should only do if the user does not name a specific work).

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
      model: "gemini-2.5-pro",
      contents: `You are a literary scholar and mythologist with access to a vast digital library, equivalent to every book ever written. Your purpose is to unearth profound, obscure, and deeply resonant stories from the trenches of world literature. The user has a complex request. Your task is to perform a deep, multi-layered analysis of their query and provide up to 5 thematically connected stories.

Do not suggest common or obvious examples. Dig deeper. Find tales from forgotten texts, obscure folklore, dense novels, or philosophical works that contain powerful narratives.

For each story you find, you MUST follow this exact format and separate each story with "---":

## Title: [Title of the Story]
### Author: [Author's Name or "Traditional"]
### Book: [Book/Collection Name, including details if it's a small part of a larger work]
### Story
[Provide an in-depth, comprehensive summary of the story. If the story is long, capture its core narrative, themes, and emotional arc in detail. Do not be afraid to be thorough.]

---

User query: "${prompt}"`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const text = response.text;
    const stories = parseMultipleStoriesFromText(text);
    return { text, stories };

  } catch (error) {
    console.error("Error fetching deep analysis:", error);
    return { text: "I'm sorry, I encountered an error during my deep analysis. Please try again." };
  }
};


export const getCreativeCollab = async (prompt: string): Promise<GeminiResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: `You are an insightful and collaborative literary analyst. Your role is to act as a creative partner to the user, helping them explore, analyze, and write about literature.

- Engage in a thoughtful dialogue. Ask clarifying questions if the user's query is ambiguous.
- Help the user brainstorm ideas, create outlines for essays, or co-write paragraphs of analysis.
- Discuss literary devices, character development, thematic depth, and historical context.
- When appropriate, quote or reference the text being discussed to support your points.
- Your tone should be encouraging, inquisitive, and scholarly, but accessible. Avoid simply giving a final answer; guide the user through the process of discovery.

The user wants to collaborate on the following topic: "${prompt}"`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 },
      },
    });

    const text = response.text;
    return { text };

  } catch (error) {
    console.error("Error fetching creative collab response:", error);
    return { text: "I'm sorry, I had trouble formulating a creative response. Let's try that again." };
  }
};

// --- Scriptorium Specific Functions ---

export const transcribeUserAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: `Transcribe this audio. 
            
            Instructions:
            1. Capture the text exactly as spoken.
            2. Do not paraphrase or summarize.
            3. Remove only non-lexical filler words (like "um", "uh").
            4. Preserve the speaker's natural flow and style.`
          }
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
      model: "gemini-2.5-pro",
      contents: `You are a sophisticated, open-minded intellectual partner in a Scriptorium.
      
      The user is working on the following text:
      "${currentText}"

      User's latest input/request: "${instruction}"

      Your role is to serve the user's intent with absolute utility and intelligence. 
      - If they want to debate a theory, debate it rigorously.
      - If they want to change the style (e.g., to Dostoevsky, to poetry, to scientific, to raw stream of consciousness), do it.
      - If they want to expand or cut, do it.
      - If they just want to chat about the ideas, chat.
      
      Do not impose a specific structure or tone. Be fluid, responsive, and intellectually rigorous.`
    });
    return response.text || "";
  } catch (error) {
    console.error("Error consulting scriptorium:", error);
    return "I am having trouble consulting the archives right now.";
  }
};
