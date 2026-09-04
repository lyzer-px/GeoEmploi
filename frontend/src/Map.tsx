import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const TILE_URL = import.meta.env.VITE_TILE_URL;

function Map() {
    useEffect(() => {
    const map = L.map("map").setView([46.6, 2.3], 6);

    L.tileLayer(`${TILE_URL}/{z}/{x}/{y}.png`, {
        attribution: "&copy; https://data.geopf.fr",
    }).addTo(map);

    return () => {
        map.remove();
    };
    }, []);

    return <div id="map"></div>;
}

export default Map;
