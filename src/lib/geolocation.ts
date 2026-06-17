// src/lib/geolocation.ts
// Thin promise wrapper around the browser Geolocation API.

export interface Coords {
  lat: number;
  lng: number;
  accuracy: number;
}

export function getCurrentPosition(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => {
        const messages: Record<number, string> = {
          1: "Location permission denied. Please enable it to tag your report.",
          2: "Location unavailable. Try again or set it manually on the map.",
          3: "Location request timed out. Try again.",
        };
        reject(new Error(messages[err.code] ?? err.message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
