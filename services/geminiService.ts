import { GoogleGenAI } from "@google/genai";
import { Resource, Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTaskInsights = async (
  tasks: Task[], 
  resources: Resource[], 
  query: string
): Promise<string> => {
  
  if (!process.env.API_KEY) {
    return "API Key is missing. Please configure the environment variable.";
  }

  // Simplify context to save tokens and improve focus
  const context = `
    Current Date: ${new Date().toISOString().split('T')[0]}
    
    Resources:
    ${resources.map(r => `- ${r.name} (${r.role})`).join('\n')}
    
    Tasks:
    ${tasks.map(t => `- [${t.status}] ${t.title} (${t.assignedResourceId}) on ${t.date} for ${t.projectName}`).join('\n')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Context:
        ${context}
        
        User Query: ${query}
        
        Instruction: You are an expert Project Manager assistant. Analyze the provided resources and tasks. Provide concise, actionable insights or answers based on the query. Keep it under 150 words unless asked for a detailed report.
      `,
    });
    
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't generate insights at this moment. Please try again later.";
  }
};
