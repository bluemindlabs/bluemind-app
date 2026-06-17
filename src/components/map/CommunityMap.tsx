"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { deleteContribution } from "@/lib/firestore";
import { cleanText } from "@/lib/text";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import type { Contribution, CleanupPriority } from "@/lib/types";

const PRIORITY_COLOR: Record<CleanupPriority, string> = {
  low: "#22c55e",
  medium: "#0ea5e9",
  high: "#f59e0b",
  critical: "#ef4444",
};

function pinIcon(priority: CleanupPriority) {
  const color = PRIORITY_COLOR[priority];
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:50% 50% 50% 0;
        background:${color};
        transform:rotate(-45deg);
        border:2px solid #fff;
        box-shadow:0 2px 6px rgba(0,0,0,.3)
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -16],
  });
}

export default function CommunityMap({
  contributions,
  center = [20, 0],
  zoom = 2,
}: {
  contributions: Contribution[];
  center?: [number, number];
  zoom?: number;
}) {
  const { user } = useAuth();

console.log("MAP CONTRIBUTIONS", contributions);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MarkerClusterGroup chunkedLoading>
        {contributions.map((c) => (
          <Marker
            key={c.id}
            position={[Number(c.lat), Number(c.lng)]}
            icon={pinIcon(c.cleanupPriority)}
          >
            <Popup>
              <div className="w-44">

                <img
                  src={c.imageUrl}
                  alt={c.trashType}
                  className="mb-2 h-24 w-full rounded-lg object-cover"
                />

                <p className="text-sm font-semibold text-ink">
                  {cleanText(c.trashType)}
                </p>

                <p className="text-xs capitalize text-muted">
                  {cleanText(c.materialType)} · {cleanText(c.cleanupPriority)} priority
                </p>

                <a
                  href={`/contribution/${c.id}`}
                  className="mt-1 inline-block text-xs font-semibold text-brand-600"
                >
                  View report →
                </a>

                {user?.uid === c.userId && (
                  <button
                    onClick={async () => {
                      await deleteContributionAndRollback(c.id, c.userId);
                      window.location.reload();
                    }}
                    className="mt-2 block text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}

              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}