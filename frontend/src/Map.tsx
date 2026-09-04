import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

function Map() {
    useEffect(() => {
    const map = L.map("map").setView([46.6, 2.3], 6);

    L.tileLayer(`${API_BACKEND_URL}/tiles/{z}/{x}/{y}.png`, {
        attribution: "&copy; https://data.geopf.fr",
    }).addTo(map);

    return () => {
        map.remove();
    };
    }, []);

    return <div id="map"></div>;
}

export default Map;