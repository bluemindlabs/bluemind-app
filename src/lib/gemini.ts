import type { AnalysisResult } from "./types";
import { fileToBase64 } from "./imageCompression";

export const FALLBACK_ANALYSIS: AnalysisResult = {
  trashType: "Unidentified litter",
  materialType: "other",
  environmentalImpact:
    "Litter left in the environment can harm wildlife and pollute soil and water. Please describe what you found.",
  cleanupPriority: "medium",
};

export async function analyzeImage(file: File): Promise<{
  result: AnalysisResult;
  failed: boolean;
}> {
  try {
    const imageBase64 = await fileToBase64(file);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64,
        mimeType: file.type || "image/jpeg",
      }),
    });

    if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);

    const data = (await res.json()) as AnalysisResult;

    return {
      result: data,
      failed: false,
    };
  } catch (e) {
    console.warn("analyzeImage fallback:", e);

    return {
      result: FALLBACK_ANALYSIS,
      failed: true,
    };
  }
}