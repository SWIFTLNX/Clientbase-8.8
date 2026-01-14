
import { GoogleGenAI } from "@google/genai";
import { Appointment } from "../types";

export const getGlowInsights = async (appointments: Appointment[]) => {
  // Initialize inside the function to ensure it uses the current process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const summary = appointments.map(a => 
    `${a.service} for ${a.clientName} on ${a.date} at ${a.time} - Paid: ${a.amountPaid}`
  ).join('\n');

  const prompt = `
    You are the "Glow Assistant" for Baddieglow, a top-tier beauty technician in Akure, Nigeria. 
    Analyze the following appointment schedule and provide 3 key business insights and a "Baddie Motto" for the day.
    Keep the tone professional, empowering, and stylish.
    
    Appointments Data:
    ${summary}
    
    Response format:
    Insights:
    1. [Insight 1 about busiest days or high revenue services]
    2. [Insight 2 about client retention or gaps in schedule]
    3. [Advice on how to upsell or improve workflow]
    
    Baddie Motto:
    "[Inspirational quote about beauty and business]"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate insights at this moment. Keep shining, Baddie!";
  }
};
