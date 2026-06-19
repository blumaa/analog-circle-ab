import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Member } from "../data";
import styles from "./MapView.module.css";

const BERLIN: [number, number] = [52.508, 13.42];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Member locations on a dark CARTO basemap with gold CSS-teardrop pins. */
export function MapView({ members }: { members: Member[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { center: BERLIN, zoom: 11, scrollWheelZoom: false });
    mapRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    for (const m of members) {
      if (!m.location) continue;
      const icon = L.divIcon({
        className: styles.pin,
        html: `<span class="ic-teardrop"><span class="ic-teardrop-initials">${initials(m.name)}</span></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });
      L.marker([m.location.lat, m.location.lng], { icon, title: m.name }).addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [members]);

  return <div ref={ref} className={styles.map} role="application" aria-label="Member map" />;
}
