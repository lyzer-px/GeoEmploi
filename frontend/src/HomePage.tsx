import { useEffect, useState, type FormEvent } from "react";
import Map, { type MapSearchArea } from "./Map.tsx";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

type GeoPfFeature = {
    geometry?: { coordinates?: [number, number] };
    properties?: { label?: string; name?: string };
};

type GeoPfResponse = { features?: GeoPfFeature[] };

function HomePage() {
    const [location, setLocation] = useState("");
    const [radiusKm, setRadiusKm] = useState(25);
    const [searchArea, setSearchArea] = useState<MapSearchArea | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<GeoPfFeature[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<GeoPfFeature | null>(null);

    useEffect(() => {
        const query = location.trim();
        if (query.length < 2 || selectedLocation) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            try {
                const url = new URL("https://data.geopf.fr/geocodage/search");
                url.searchParams.set("q", query);
                url.searchParams.set("limit", "5");
                const response = await fetch(url, { signal: controller.signal });

                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as GeoPfResponse;
                setSuggestions(
                    (data.features ?? []).filter((feature) => {
                        const [longitude, latitude] = feature.geometry?.coordinates ?? [];
                        return typeof latitude === "number" && typeof longitude === "number";
                    }),
                );
            } catch (error) {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                setSuggestions([]);
            }
        }, 250);

        return () => {
            controller.abort();
            window.clearTimeout(timeoutId);
        };
    }, [location, selectedLocation]);

    function selectLocation(feature: GeoPfFeature) {
        const label = feature.properties?.label ?? feature.properties?.name;
        if (!label) {
            return;
        }

        setLocation(label);
        setSelectedLocation(feature);
        setSuggestions([]);
        setLocationError(null);
    }

    async function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const query = location.trim();

        if (!query) {
            setLocationError("Saisissez une ville ou une adresse.");
            return;
        }

        setIsSearching(true);
        setLocationError(null);

        try {
            let feature = selectedLocation;
            if (!feature) {
                const url = new URL("https://data.geopf.fr/geocodage/search");
                url.searchParams.set("q", query);
                url.searchParams.set("limit", "1");
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("La recherche de localisation est indisponible.");
                }

                const data = (await response.json()) as GeoPfResponse;
                feature = data.features?.[0] ?? null;
            }
            const [longitude, latitude] = feature?.geometry?.coordinates ?? [];

            if (typeof latitude !== "number" || typeof longitude !== "number") {
                setLocationError("Aucune localisation trouvée. Précisez votre recherche.");
                return;
            }

            setSearchArea({
                latitude,
                longitude,
                radiusKm,
                label: feature?.properties?.label ?? feature?.properties?.name ?? query,
            });
        } catch (error) {
            setLocationError(
                error instanceof Error ? error.message : "La recherche de localisation a échoué.",
            );
        } finally {
            setIsSearching(false);
        }
    }

    return (
    <main className="geoemploi-page">
        <form className="geoemploi-location" onSubmit={handleSearch}>
            <h1 id="search-title">
                Rechercher une offre d'emploi
            </h1>
            <Input
                label="Métier, compétence ou mot-clé"
                nativeInputProps={{
                placeholder: "Ex : développeur, comptable..."
                }}
            />
            <div className="geoemploi-location-search">
            <Input
            label="Localisation"
            nativeInputProps={{
                type: "search",
                placeholder: "Ex : Paris, Lyon, Marseille...",
                autoComplete: "address-level2",
                value: location,
                onChange: (event) => {
                    setLocation(event.target.value);
                    setSelectedLocation(null);
                },
                role: "combobox",
                "aria-autocomplete": "list",
                "aria-expanded": suggestions.length > 0,
                "aria-controls": "location-suggestions",
            }}
            state={locationError ? "error" : "default"}
            stateRelatedMessage={locationError ?? undefined}
            />
            {suggestions.length > 0 && (
                <ul id="location-suggestions" className="geoemploi-location-suggestions" role="listbox">
                    {suggestions.map((feature, index) => {
                        const label = feature.properties?.label ?? feature.properties?.name;
                        if (!label) {
                            return null;
                        }

                        return (
                            <li key={`${label}-${index}`} role="option" aria-selected="false">
                                <button type="button" onMouseDown={() => selectLocation(feature)}>
                                    {label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
            <Select
            label="Périmètre"
            nativeSelectProps={{
                value: String(radiusKm),
                onChange: (event) => setRadiusKm(Number(event.target.value)),
            }}
            >
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
            </Select>
        </div>
        <div className="geoemploi-geolocation">
            <Checkbox
            options={[{
                label: "Utiliser ma position actuelle",
                nativeInputProps: {
                    name: "use-geolocation",
                },},]}
            />
        </div>
            <div className="geoemploi-search-button">
                <Button nativeButtonProps={{ type: "submit", disabled: isSearching }}>
                    {isSearching ? "Recherche..." : "Rechercher"}
                </Button>
            </div>
        </form>
        <div className="geoemploi-results">
        <section
            aria-labelledby="offers-title"
            className="geoemploi-offers"
        >
            <h2 id="offers-title"> Offres d'emploi </h2>
            <div className="geoemploi-offers-list">
            <Card
                title="Développeur Web"
                desc="Paris · CDI"
                linkProps={{ href: "/offres/1" }}
            />
            <Card
                title="Développeur Full Stack"
                desc="Lyon · CDI"
                linkProps={{ href: "/offres/2" }}
            />
            <Card
                title="Data Analyst"
                desc="Marseille · CDD"
                linkProps={{ href: "/offres/3" }}
            />
            <Card
                title="Ingénieur logiciel"
                desc="Toulouse · CDI"
                linkProps={{ href: "/offres/4" }}
            />
            <Card
                title="Développeur React"
                desc="Bordeaux · CDI"
                linkProps={{ href: "/offres/5" }}
            />
            </div>
        </section>
        <section
            aria-labelledby="map-title"
            className="geoemploi-map"
        >
            <h2
            id="map-title"
            className="fr-sr-only"
            >
            Carte des offres d'emploi
            </h2>
            <Map searchArea={searchArea} />
        </section>
        </div>
    </main>
    );
}

export default HomePage;
