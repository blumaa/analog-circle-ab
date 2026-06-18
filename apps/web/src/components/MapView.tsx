import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { rawColor } from "@analog/tokens";
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

/** Member locations on a dark CARTO basemap with gold initial pins. */
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
        html: `<span style="background:${rawColor.gold500};color:${rawColor.goldInk}">${initials(m.name)}</span>`,
        iconSize: [34, 42],
        iconAnchor: [17, 42],
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
