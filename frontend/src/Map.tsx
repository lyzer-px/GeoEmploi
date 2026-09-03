import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function Map() {
    useEffect(() => {
    const map = L.map("map").setView([46.6, 2.3], 6);

    L.tileLayer("http://127.0.0.1:8000/tile/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    return () => {
        map.remove();
    };
    }, []);

    return <div id="map"></div>;
}

export default Map;