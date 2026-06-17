// src/components/upload/UploadFlow.tsx
"use client";

import { cleanAIText } from "@/lib/text";
import { cleanText } from "@/lib/text";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, ImageIcon, MapPin, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/components/providers/AuthProvider";
import { compressImage } from "@/lib/imageCompression";
import { analyzeImage } from "@/lib/gemini";
import { getCurrentPosition } from "@/lib/geolocation";
import { uploadContributionImage } from "@/lib/storage";
import { createContribution } from "@/lib/firestore";
import { BADGE_META } from "@/lib/gamification";
import type {
  AnalysisResult,
  BadgeLevel,
  CleanupPriority,
  MaterialType,
} from "@/lib/types";


// Leaflet must not render on the server.
const LocationPicker = dynamic(() => import("@/components/map/LocationPicker"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center"><Spinner /></div>,
});

type Step = "image" | "analyze" | "location" | "done";

const MATERIALS: MaterialType[] = [
  "plastic", "glass", "metal", "paper", "organic", "electronic", "hazardous", "mixed", "other",
];
const PRIORITIES: CleanupPriority[] = ["low", "medium", "high", "critical"];

export function UploadFlow() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiFailed, setAiFailed] = useState(false);
  const [ai, setAi] = useState<AnalysisResult | null>(null);
  const [edited, setEdited] = useState<AnalysisResult | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<BadgeLevel | null>(null);

  // --- Step 1: pick + compress + preview ---
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const compressed = await compressImage(f);
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
  }

  // --- Step 2: AI analysis ---
async function runAnalysis() {
  if (!file) return;

  setStep("analyze");
  setAnalyzing(true);

  try {
    const { result, failed } = await analyzeImage(file);

    setAi(result);
    setEdited(result);
    setAiFailed(failed);
  } finally {
    setAnalyzing(false);
  }
}

  // --- Step 3: geolocation ---
  async function requestLocation() {
    setLocating(true);
    setLocError("");
    try {
      const c = await getCurrentPosition();
      setCoords({ lat: c.lat, lng: c.lng });
      setStep("location");
    } catch (err) {
      setLocError(err instanceof Error ? err.message : "Could not get location.");
      // Allow manual placement from a default center.
      setCoords({ lat: 40.7128, lng: -74.006 });
      setStep("location");
    } finally {
      setLocating(false);
    }
  }

  // --- Final submit ---
  async function submit() {
    if (!user || !file || !ai || !edited || !coords) return;
    setSubmitting(true);
    try {
      const imageUrl = await uploadContributionImage(user.uid, file);
      const userEdited = JSON.stringify(ai) !== JSON.stringify(edited);
       const { badgeEarned } = await createContribution({
        userId: user.uid,
        imageUrl,
        lat: coords.lat,
        lng: coords.lng,
        ai: {
        ...ai,
        trashType: cleanText(ai.trashType),
        environmentalImpact: cleanText(ai.environmentalImpact),
        },
        trashType: cleanText(edited.trashType),
        materialType: edited.materialType,
        environmentalImpact: cleanText(edited.environmentalImpact),
        cleanupPriority: edited.cleanupPriority,
        userEdited,
        isPublic,
      });
      setEarnedBadge(badgeEarned);
      await refreshProfile();
      setStep("done");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Stepper step={step} />

      {/* STEP 1 — IMAGE */}
      {step === "image" && (
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-bold">Add a photo of the litter</h2>
          {preview ? (
            <div className="overflow-hidden rounded-2xl">
              <Image src={preview} alt="Preview" width={640} height={480} className="h-64 w-full object-cover" unoptimized />
            </div>
          ) : (
            <p className="text-sm text-muted">Use your camera in the field, or pick from your gallery.</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-brand-200 bg-white/70 p-4 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              <Camera className="h-6 w-6" /> Camera
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </label>
            <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border border-brand-200 bg-white/70 p-4 text-sm font-semibold text-brand-700 hover:bg-brand-50">
              <ImageIcon className="h-6 w-6" /> Gallery
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <Button disabled={!file} onClick={runAnalysis} className="w-full">
            <Sparkles className="h-4 w-4" /> Analyze with AI
          </Button>
        </Card>
      )}

      {/* STEP 2 — ANALYSIS (editable) */}
      {step === "analyze" && (
        <Card className="space-y-4">
          {analyzing ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-muted">Gemini is analyzing your photo</p>
            </div>
          ) : edited ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Review the details</h2>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">
                  {aiFailed ? "Manual entry" : "AI suggested \u00b7 editable"}
                </span>
              </div>

              <Field label="Trash type">
                <input
                  className="input"
                  value={edited.trashType}
                  onChange={(e) => setEdited({ ...edited, trashType: e.target.value })}
                />
              </Field>

              <Field label="Material">
                <select
                  className="input capitalize"
                  value={edited.materialType}
                  onChange={(e) => setEdited({ ...edited, materialType: e.target.value as MaterialType })}
                >
                  {MATERIALS.map((m) => (<option key={m} value={m} className="capitalize">{m}</option>))}
                </select>
              </Field>

              <Field label="Environmental impact">
                <textarea
                  rows={3}
                  className="input"
                  value={edited.environmentalImpact}
                  onChange={(e) => setEdited({ ...edited, environmentalImpact: e.target.value })}
                />
              </Field>

              <Field label="Cleanup priority">
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setEdited({ ...edited, cleanupPriority: p })}
                      className={`flex-1 rounded-full px-2 py-1.5 text-xs font-semibold capitalize transition ${
                        edited.cleanupPriority === p
                          ? "bg-brand-500 text-white"
                          : "bg-brand-50 text-brand-700"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </Field>

              <Button onClick={requestLocation} loading={locating} className="w-full">
                <MapPin className="h-4 w-4" /> Confirm location
              </Button>
            </>
          ) : null}
        </Card>
      )}

      {/* STEP 3 — LOCATION */}
      {step === "location" && coords && (
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-bold">Where did you find it?</h2>
          {locError && <p className="text-sm text-amber-600">{locError} Tap the map to set it manually.</p>}
          <div className="h-64 overflow-hidden rounded-2xl">
            <LocationPicker
              lat={coords.lat}
              lng={coords.lng}
              onChange={(lat, lng) => setCoords({ lat, lng })}
            />
          </div>
          <p className="text-xs text-muted">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)} tap or drag the pin to adjust.
          </p>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            Show this report on the public community map
          </label>
          <Button onClick={submit} loading={submitting} className="w-full">
            <Check className="h-4 w-4" /> Submit report
          </Button>
        </Card>
      )}

      {/* STEP 4 — DONE */}
      {step === "done" && (
        <Card className="space-y-4 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-3xl text-brand-600">
            ✓
          </div>
          <h2 className="font-display text-2xl font-bold">Report submitted!</h2>
          <p className="text-sm text-muted">Thanks for helping map the planet.</p>
          {earnedBadge && (
            <div className="rounded-2xl bg-brand-50 p-4">
              <p className="text-3xl">{BADGE_META[earnedBadge].emoji}</p>
              <p className="mt-1 font-semibold text-brand-700">
                New badge unlocked: {BADGE_META[earnedBadge].label}!
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => router.push("/profile")}>
              View profile
            </Button>
            <Button className="flex-1" onClick={() => window.location.reload()}>
              Report another
            </Button>
          </div>
        </Card>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid var(--color-brand-200);
          background: #fff;
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus {
          border-color: var(--color-brand-400);
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: Step[] = ["image", "analyze", "location", "done"];
  const labels = ["Photo", "Analyze", "Location", "Done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center justify-between px-2">
      {labels.map((l, i) => (
        <div key={l} className="flex flex-1 items-center">
          <div
            className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
              i <= idx ? "bg-brand-500 text-white" : "bg-brand-100 text-brand-400"
            }`}
          >
            {i + 1}
          </div>
          {i < labels.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 ${i < idx ? "bg-brand-500" : "bg-brand-100"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
