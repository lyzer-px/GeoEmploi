import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

export type MapSearchArea = {
    latitude: number;
    longitude: number;
    radiusKm: number;
    label: string;
};

type MapProps = {
    searchArea: MapSearchArea | null;
};

function Map({ searchArea }: MapProps) {
    const mapElementRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const searchCircleRef = useRef<L.Circle | null>(null);
    const searchMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapElementRef.current || mapRef.current) {
            return;
        }

        const map = L.map(mapElementRef.current).setView([46.6, 2.3], 6);
        mapRef.current = map;

        L.tileLayer(`${API_BACKEND_URL}/tiles/{z}/{x}/{y}.png`, {
            attribution: "&copy; https://data.geopf.fr",
        }).addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !searchArea) {
            return;
        }

        searchCircleRef.current?.remove();
        searchMarkerRef.current?.remove();

        const center: L.LatLngExpression = [searchArea.latitude, searchArea.longitude];
        const circle = L.circle(center, {
            radius: searchArea.radiusKm * 1_000,
            color: "#000091",
            fillColor: "#6a6af4",
            fillOpacity: 0.16,
            weight: 2,
        }).addTo(map);

        searchCircleRef.current = circle;
        searchMarkerRef.current = L.marker(center)
            .addTo(map)
            .bindPopup(searchArea.label);

        map.flyToBounds(circle.getBounds(), {
            padding: [36, 36],
            maxZoom: 13,
        });
    }, [searchArea]);

    return <div id="map" ref={mapElementRef} />;
}

export default Map;
