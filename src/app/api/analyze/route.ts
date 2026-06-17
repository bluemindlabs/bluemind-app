// src/app/api/analyze/route.ts
// Server-only route. Receives a base64 image, asks Gemini to classify the
// trash, and returns structured JSON. The GEMINI_API_KEY never reaches the
// browser because this runs on the server.

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";

const MODEL = "gemini-2.0-flash"; // fast, multimodal, cheap. Upgrade as needed.

// Structured-output schema so Gemini returns clean, parseable JSON.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    trashType: { type: Type.STRING, description: "Concise name of the item, e.g. 'Plastic water bottle'" },
    materialType: {
      type: Type.STRING,
      enum: ["plastic", "glass", "metal", "paper", "organic", "electronic", "hazardous", "mixed", "other"],
    },
    environmentalImpact: { type: Type.STRING, description: "2-3 sentence plain-language impact summary" },
    cleanupPriority: { type: Type.STRING, enum: ["low", "medium", "high", "critical"] },
  },
  required: ["trashType", "materialType", "environmentalImpact", "cleanupPriority"],
};

const PROMPT = `You are an environmental analyst for a litter-mapping app called BlueMind.
Analyse the photo of waste/litter found in the environment and return:
- trashType: a concise human-readable label
- materialType: the dominant material
- environmentalImpact: a clear 2-3 sentence summary of why this litter matters (wildlife, waterways, decomposition time)
- cleanupPriority: how urgently it should be cleaned, considering hazard and ecological harm
If the image does not appear to contain litter, still respond with your best guess and use "other".`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("KEY EXISTS:", !!apiKey);
    console.log("KEY LENGTH:", apiKey?.length);
    if (!apiKey) {
      return NextResponse.json({ error: "Server is missing GEMINI_API_KEY." }, { status: 500 });
    }

    const { imageBase64, mimeType } = (await req.json()) as {
      imageBase64?: string;
      mimeType?: string;
    };
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided." }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: PROMPT },
            { inlineData: { mimeType: mimeType ?? "image/jpeg", data: imageBase64 } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2,
      },
    });

    const text = response.text ?? "";
    const parsed = JSON.parse(text) as AnalysisResult;
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Gemini analysis failed:", err);
    return NextResponse.json(
      { error: "Image analysis failed. You can still fill in the details manually." },
      { status: 502 }
    );
  }
}
