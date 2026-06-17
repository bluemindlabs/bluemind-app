// src/components/map/LocationPicker.tsx
"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const dot = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#0ea5e9;border:3px solid #fff;box-shadow:0 0 0 4px rgba(14,165,233,.25)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function ClickToSet({ onSet }: { onSet: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSet(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Small confirmation map. Tap to move the pin; drag to fine-tune. */
export default function LocationPicker({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom className="h-full w-full">
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickToSet onSet={onChange} />
      <Marker
        position={[lat, lng]}
        icon={dot}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const m = e.target as L.Marker;
            const p = m.getLatLng();
            onChange(p.lat, p.lng);
          },
        }}
      />
    </MapContainer>
  );
}
