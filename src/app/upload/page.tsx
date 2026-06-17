// src/app/upload/page.tsx
"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { UploadFlow } from "@/components/upload/UploadFlow";


export default function UploadPage() {
  return (
    <ProtectedRoute>
      <div className="py-4">
        <UploadFlow />
      </div>
    </ProtectedRoute>
  );
}
