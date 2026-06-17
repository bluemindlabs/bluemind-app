// src/lib/storage.ts
// Uploads images to Firebase Storage and returns a public download URL.

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadContributionImage(
  uid: string,
  file: File
): Promise<string> {
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const storageRef = ref(storage, `contributions/${uid}/${fileName}`);
  await uploadBytes(storageRef, file, { contentType: "image/jpeg" });
  return getDownloadURL(storageRef);
}

export async function uploadAvatar(uid: string, file: File): Promise<string> {
  const storageRef = ref(storage, `avatars/${uid}/${Date.now()}.jpg`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
