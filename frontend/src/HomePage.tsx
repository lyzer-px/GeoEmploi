import { useEffect, useState, type FormEvent } from "react";
import Map, { type JobOffer, type MapSearchArea } from "./Map.tsx";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

type GeoPfFeature = {
    geometry?: {
        coordinates?: [number, number];
    };
    properties?: {
        label?: string;
        name?: string;
    };
};

type GeoPfResponse = {
    features?: GeoPfFeature[];
};

function HomePage() {
    const API = import.meta.env.VITE_API_BACKEND_URL;

    // Search fields
    const [jobName, setJobName] = useState("");
    const [location, setLocation] = useState("");
    const [radiusKm, setRadiusKm] = useState(25);

    // Search location
    const [searchArea, setSearchArea] =
        useState<MapSearchArea | null>(null);

    const [locationError, setLocationError] =
        useState<string | null>(null);

    const [isSearching, setIsSearching] = useState(false);

    const [suggestions, setSuggestions] =
        useState<GeoPfFeature[]>([]);

    const [selectedLocation, setSelectedLocation] =
        useState<GeoPfFeature | null>(null);

    // Offers
    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [offersError, setOffersError] =
        useState<string | null>(null);

    const [isLoadingOffers, setIsLoadingOffers] =
        useState(true);

    /**
     * Load offers.
     *
     * Possible requests:
     *
     * GET /offers/
     * GET /offers/?name=frontend
     * GET /offers/?latitude=...&longitude=...&perimeter=25
     * GET /offers/?name=frontend&latitude=...&longitude=...&perimeter=25
     */
    useEffect(() => {
        const controller = new AbortController();

        const url = new URL(`${API}/offers/`);

        const name = jobName.trim();

        if (name) {
            url.searchParams.set("name", name);
        }

        if (searchArea) {
            url.searchParams.set(
                "latitude",
                String(searchArea.latitude),
            );

            url.searchParams.set(
                "longitude",
                String(searchArea.longitude),
            );

            url.searchParams.set(
                "perimeter",
                String(searchArea.radiusKm),
            );
        }

        setIsLoadingOffers(true);
        setOffersError(null);

        fetch(url, {
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        `GET /offers/ HTTP ${response.status}`,
                    );
                }

                const data = await response.json();

                return data.items ?? [];
            })
            .then((items) => {
                setOffers(items);
            })
            .catch((error) => {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Erreur lors du chargement des offres:",
                    error,
                );

                setOffersError(
                    "Les offres ne sont pas disponibles pour le moment.",
                );
            })
            .finally(() => {
                setIsLoadingOffers(false);
            });

        return () => controller.abort();
    }, [API, jobName, searchArea]);

    /**
     * Select an offer from the map.
     */
    function selectOfferOnMap(offerId: number) {
        document
            .getElementById(`offer-${offerId}`)
            ?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
    }

    /**
     * Location autocomplete.
     */
    useEffect(() => {
        const query = location.trim();

        if (query.length < 2 || selectedLocation) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();

        const timeoutId = window.setTimeout(async () => {
            try {
                const url = new URL(
                    "https://data.geopf.fr/geocodage/search",
                );

                url.searchParams.set("q", query);
                url.searchParams.set("limit", "5");

                const response = await fetch(url, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    setSuggestions([]);
                    return;
                }

                const data =
                    (await response.json()) as GeoPfResponse;

                setSuggestions(
                    (data.features ?? []).filter((feature) => {
                        const [
                            longitude,
                            latitude,
                        ] = feature.geometry?.coordinates ?? [];

                        return (
                            typeof latitude === "number" &&
                            typeof longitude === "number"
                        );
                    }),
                );
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
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

    /**
     * Select an autocomplete location.
     */
    function selectLocation(feature: GeoPfFeature) {
        const label =
            feature.properties?.label ??
            feature.properties?.name;

        if (!label) {
            return;
        }

        setLocation(label);
        setSelectedLocation(feature);
        setSuggestions([]);
        setLocationError(null);
    }

    /**
     * Search button.
     *
     * Supports:
     *
     * 1. Nothing:
     *    → all offers
     *
     * 2. Job name only:
     *    → offers filtered by name
     *
     * 3. Location only:
     *    → offers filtered geographically
     *
     * 4. Job name + location:
     *    → offers filtered by both
     */
    async function handleSearch(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        const job = jobName.trim();
        const city = location.trim();

        setLocationError(null);

        /**
         * No search criteria.
         *
         * Reset the geographic filter.
         * The offers useEffect will request:
         *
         * GET /offers/
         */
        if (!job && !city) {
            setSearchArea(null);
            setSelectedLocation(null);
            return;
        }

        /**
         * Job name only.
         *
         * The offers useEffect will request:
         *
         * GET /offers/?name=...
         */
        if (job && !city) {
            setSearchArea(null);
            setSelectedLocation(null);
            return;
        }

        /**
         * From this point, we know there is a location.
         */
        setIsSearching(true);

        try {
            let feature = selectedLocation;

            /**
             * If the user typed a location but didn't select
             * an autocomplete suggestion, geocode it manually.
             */
            if (!feature) {
                const url = new URL(
                    "https://data.geopf.fr/geocodage/search",
                );

                url.searchParams.set("q", city);
                url.searchParams.set("limit", "1");

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "La recherche de localisation est indisponible.",
                    );
                }

                const data =
                    (await response.json()) as GeoPfResponse;

                feature = data.features?.[0] ?? null;
            }

            const [
                longitude,
                latitude,
            ] = feature?.geometry?.coordinates ?? [];

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number"
            ) {
                setLocationError(
                    "Aucune localisation trouvée. Précisez votre recherche.",
                );

                return;
            }

            /**
             * Setting searchArea triggers the offers useEffect.
             */
            setSearchArea({
                latitude,
                longitude,
                radiusKm,
                label:
                    feature?.properties?.label ??
                    feature?.properties?.name ??
                    city,
            });
        } catch (error) {
            setLocationError(
                error instanceof Error
                    ? error.message
                    : "La recherche de localisation a échoué.",
            );
        } finally {
            setIsSearching(false);
        }
    }

    return (
        <main className="geoemploi-page">
            <form
                className="geoemploi-location"
                onSubmit={handleSearch}
            >
                <h1 id="search-title">
                    Rechercher une offre d'emploi
                </h1>

                <Input
                    label="Métier, compétence ou mot-clé"
                    nativeInputProps={{
                        placeholder:
                            "Ex : développeur, comptable...",
                        value: jobName,
                        onChange: (event) => {
                            setJobName(event.target.value);
                        },
                    }}
                />

                <div className="geoemploi-location-search">
                    <Input
                        label="Localisation"
                        nativeInputProps={{
                            type: "search",
                            placeholder:
                                "Ex : Paris, Lyon, Marseille...",
                            autoComplete: "address-level2",
                            value: location,
                            onChange: (event) => {
                                setLocation(event.target.value);
                                setSelectedLocation(null);
                                setLocationError(null);
                            },
                            role: "combobox",
                            "aria-autocomplete": "list",
                            "aria-expanded":
                                suggestions.length > 0,
                            "aria-controls":
                                "location-suggestions",
                        }}
                        state={
                            locationError
                                ? "error"
                                : "default"
                        }
                        stateRelatedMessage={
                            locationError ?? undefined
                        }
                    />

                    {suggestions.length > 0 && (
                        <ul
                            id="location-suggestions"
                            className="geoemploi-location-suggestions"
                            role="listbox"
                        >
                            {suggestions.map(
                                (feature, index) => {
                                    const label =
                                        feature.properties
                                            ?.label ??
                                        feature.properties
                                            ?.name;

                                    if (!label) {
                                        return null;
                                    }

                                    return (
                                        <li
                                            key={`${label}-${index}`}
                                            role="option"
                                            aria-selected="false"
                                        >
                                            <button
                                                type="button"
                                                onMouseDown={() =>
                                                    selectLocation(
                                                        feature,
                                                    )
                                                }
                                            >
                                                {label}
                                            </button>
                                        </li>
                                    );
                                },
                            )}
                        </ul>
                    )}

                    <Select
                        label="Périmètre"
                        nativeSelectProps={{
                            value: String(radiusKm),
                            onChange: (event) => {
                                setRadiusKm(
                                    Number(
                                        event.target.value,
                                    ),
                                );
                            },
                        }}
                    >
                        <option value="10">
                            10 km
                        </option>
                        <option value="25">
                            25 km
                        </option>
                        <option value="50">
                            50 km
                        </option>
                        <option value="100">
                            100 km
                        </option>
                    </Select>
                </div>

                <div className="geoemploi-geolocation">
                    <Checkbox
                        options={[
                            {
                                label:
                                    "Utiliser ma position actuelle",
                                nativeInputProps: {
                                    name: "use-geolocation",
                                },
                            },
                        ]}
                    />
                </div>

                <div className="geoemploi-search-button">
                    <Button
                        nativeButtonProps={{
                            type: "submit",
                            disabled: isSearching,
                        }}
                    >
                        {isSearching
                            ? "Recherche..."
                            : "Rechercher"}
                    </Button>
                </div>
            </form>

            <div className="geoemploi-results">
                <section
                    aria-labelledby="offers-title"
                    className="geoemploi-offers"
                >
                    <h2 id="offers-title">
                        Offres d'emploi
                    </h2>

                    <div className="geoemploi-offers-list">
                        {isLoadingOffers && (
                            <p>
                                Chargement des offres…
                            </p>
                        )}

                        {offersError && (
                            <p className="fr-alert fr-alert--error">
                                {offersError}
                            </p>
                        )}

                        {!isLoadingOffers &&
                            !offersError &&
                            offers.length === 0 && (
                                <p>
                                    Aucune offre dans cette
                                    zone.
                                </p>
                            )}

                        {offers.map((offer) => (
                            <div
                                id={`offer-${offer.id}`}
                                key={offer.id}
                            >
                                <Card
                                    title={offer.name}
                                    desc={`${offer.adress} · ${offer.contract_type}`}
                                    linkProps={{
                                        href: `/offres/${offer.id}`,
                                    }}
                                />
                            </div>
                        ))}
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

                    <Map
                        searchArea={searchArea}
                        offers={offers}
                        onOfferSelect={selectOfferOnMap}
                    />
                </section>
            </div>
        </main>
    );
}

export default HomePage;