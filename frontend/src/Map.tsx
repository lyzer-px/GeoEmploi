import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BACKEND_URL = import.meta.env.VITE_API_BACKEND_URL;

export type MapSearchArea = {
    latitude: number;
    longitude: number;
    radiusKm: number;
    label: string;
    zoom?: number;
};

export type JobOffer = {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string | null;
    contract_type: string;
    latitude: number;
    longitude: number;
    adress: string;
    employer: {
        first_name: string;
        last_name: string;
    };
};

type MapProps = {
    searchArea: MapSearchArea | null;
    offers: JobOffer[];
    onOfferSelect: (offerId: number) => void;
};

function Map({ searchArea, offers, onOfferSelect }: MapProps) {
    const mapElementRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const searchCircleRef = useRef<L.Circle | null>(null);
    const searchMarkerRef = useRef<L.Marker | null>(null);

    useEffect(() => {
        if (!mapElementRef.current || mapRef.current) {
            return;
        }

        const map = L.map(mapElementRef.current).setView(
            [46.6, 2.3],
            6,
        );

        mapRef.current = map;

        L.tileLayer(
            `${API_BACKEND_URL}/tiles/{z}/{x}/{y}.png`,
            {
                attribution: "&copy; https://data.geopf.fr",
            },
        ).addTo(map);

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

        const center: L.LatLngExpression = [
            searchArea.latitude,
            searchArea.longitude,
        ];

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

        // Always fit the complete search radius in the viewport.
        // A fixed zoom (for example 13) is too close to the user's point
        // and hides most/all of a 25 km search area.
        map.flyToBounds(circle.getBounds(), {
            padding: [48, 48],
            maxZoom: 11,
            duration: 0.8,
        });
    }, [searchArea]);

    useEffect(() => {
        const map = mapRef.current;

        if (!map) {
            return;
        }

        const markers = L.layerGroup().addTo(map);

        const rebuildMarkers = () => {
            markers.clearLayers();

            const clusters: JobOffer[][] = [];

            offers.forEach((offer) => {
                const point = map.latLngToContainerPoint([
                    offer.latitude,
                    offer.longitude,
                ]);

                const cluster = clusters.find(
                    ([firstOffer]) => {
                        const firstPoint =
                            map.latLngToContainerPoint([
                                firstOffer.latitude,
                                firstOffer.longitude,
                            ]);

                        return (
                            point.distanceTo(firstPoint) < 42
                        );
                    },
                );

                if (cluster) {
                    cluster.push(offer);
                } else {
                    clusters.push([offer]);
                }
            });

            clusters.forEach((cluster) => {
                const firstOffer = cluster[0];

                const position: L.LatLngExpression = [
                    firstOffer.latitude,
                    firstOffer.longitude,
                ];

                if (cluster.length === 1) {
                    const marker = L.marker(position, {
                        icon: L.divIcon({
                            className:
                                "geoemploi-map-pin",
                            html: "<span></span>",
                            iconSize: [28, 36],
                            iconAnchor: [14, 36],
                        }),
                    }).addTo(markers);

                    marker.bindPopup(
                        `<strong>${firstOffer.name}</strong><br>${firstOffer.adress}`,
                    );

                    marker.on("click", () => {
                        onOfferSelect(firstOffer.id);
                    });

                    return;
                }

                const marker = L.marker(position, {
                    icon: L.divIcon({
                        className:
                            "geoemploi-map-cluster",
                        html: `<span>${cluster.length}</span>`,
                        iconSize: [42, 42],
                        iconAnchor: [21, 21],
                    }),
                }).addTo(markers);

                marker.bindPopup(
                    `<strong>${cluster.length} offres dans cette zone</strong>`,
                );

                marker.on("click", () => {
                    const bounds = L.latLngBounds(
                        cluster.map(
                            (offer) =>
                                [
                                    offer.latitude,
                                    offer.longitude,
                                ] as L.LatLngTuple,
                        ),
                    );

                    if (
                        bounds.isValid() &&
                        !bounds
                            .getSouthWest()
                            .equals(bounds.getNorthEast())
                    ) {
                        map.fitBounds(bounds.pad(0.5));
                    } else {
                        map.setView(
                            position,
                            Math.min(
                                map.getZoom() + 2,
                                18,
                            ),
                        );
                    }
                });
            });
        };

        rebuildMarkers();

        map.on("zoomend moveend", rebuildMarkers);

        return () => {
            map.off(
                "zoomend moveend",
                rebuildMarkers,
            );
            markers.remove();
        };
    }, [offers, onOfferSelect]);

    return <div id="map" ref={mapElementRef} />;
}

export default Map;