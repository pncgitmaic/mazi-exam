import "dotenv/config";
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;
app.use(express.json());

// Gauri AI Chat API route
app.post("/api/verify-uniex", (req, res) => {
  const { password } = req.body;
  if (password === "PrathamADXA@#1320051969") {
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, error: "Invalid password" });
});

app.post("/api/gauri-chat", async (req, res) => {
  try {
    const { messages, language } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array provided." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(200).json({ 
        text: "Gauri is offline right now! Please configure the GEMINI_API_KEY environment variable in the Secrets tab to awaken her." 
      });
    }

    const ai = new GoogleGenAI({ apiKey: key });

    // Format messages for @google/genai
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.text || m.content || "" }]
    }));

    let systemInstruction = `You are Gauri AI, a virtual academic guide and motivational mentor for Maharashtra state board and government competitive exam aspirants (MPSC, UPSC, Police Bharti, Talathi, SSC, etc.).
Your tone is highly encouraging, positive, empathetic, and motivational. Use high-vibe, uplifting language to cheer on students struggling with exam anxiety, low scores, or exam pressure. Keep your answers clear, motivating, and actionable.
You speak fluidly in English, Marathi, or Hindi based on what the user uses or prefers. Feel free to mix them in a helpful, conversational Indian way (Hinglish/Marathinglish is perfectly fine!).

MaziExam Platform Knowledge:
You know that the MaziExam platform has the following key modules and areas:
1. "Job Alerts": Immediate, real-time notifications for civil services and police recruitment across Maharashtra.
2. "Upcoming Exams": Displays active/upcoming exams, details, syllabus, and target structures.
3. "Paper PDFs" (or PYQ PDFs): Solved previous year questions booklets to help students analyze exam trends.
4. "Mock Tests": Authentic computer-based exam simulator to practice under countdown timing and view instant performance scores.
5. "Selection Portal" ("Get Selection"): Golden Premium Pass (₹80/mo sandbox) that unlocks CSAT/GS speed runs, detailed PYQ booklets, and monthly target current affairs keys.

When students ask for:
- "search exam" or "next exams": direct them to "Upcoming Exams" or "Job Alerts" pages.
- "how to prepare": advise them to practice with "Mock Tests", read past paper solutions in "Paper PDFs", and check out the premium master keys in "Get Selection". Give them a structured daily study structure.
- "syllabus" or "exam pattern": tell them about the "Upcoming Exams" details or suggest mock tests to test their exact syllabus knowledge.
- "FAQs" or general queries: answer them with clarity and encourage them that they CAN clear this exam.

Remember: Be a powerful source of motivation! If a student feels like giving up, revive their spirit with inspirational words. You are Gauri, their friendly, ever-present academic mentor. Keep responses relatively concise and punchy so they read well in a tiny floating chat box on a phone or computer!`;

    // Inject language-specific mandate guidelines
    if (language === "mr") {
      systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: The user has explicitly selected MARATHI as their preferred language. You MUST respond strictly in pure, motivational, and grammatically correct Marathi. Avoid English sentences, but feel free to refer to exam names or technical terms in standard English if helpful.";
    } else if (language === "hi") {
      systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: The user has explicitly selected HINDI as their preferred language. You MUST respond strictly in beautiful, supportive, and motivating Hindi. Avoid English sentences, but feel free to refer to exam names or technical terms in standard English if helpful.";
    } else if (language === "en") {
      systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: The user has explicitly selected ENGLISH as their preferred language. You MUST respond strictly in grammatically correct, encouraging, and fluent English.";
    } else {
      systemInstruction += "\n\nCRITICAL LANGUAGE MANDATE: Respond fluidly in English, Marathi, or Hindi based on what the user uses or prefers. Feel free to mix them in a helpful, conversational Indian way (Hinglish/Marathinglish is perfectly fine!). Default to a hybrid, warm, multilingual tone.";
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const reply = result.text || "I am processing your dreams! Can you please repeat that with more energy?";
    res.json({ text: reply });
  } catch (error: any) {
    console.error("Gauri AI Error:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with Gauri AI." });
  }
});

// Serve static files / Vite middleware
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupViteOrStatic().then(() => {
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
});

export default app;
