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
        label?: unknown;
        name?: unknown;
        city?: unknown;
        municipality?: unknown;
        citycode?: unknown;
    };
};

function asText(value: unknown): string | undefined {
    if (typeof value === "string") {
        const text = value.trim();
        return text || undefined;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (Array.isArray(value)) {
        const text = value.find((item) => typeof item === "string");
        return typeof text === "string" ? text.trim() || undefined : undefined;
    }

    return undefined;
}

function getFeatureLabel(feature: GeoPfFeature): string | undefined {
    const properties = feature.properties;
    return (
        asText(properties?.label) ??
        asText(properties?.name) ??
        asText(properties?.city) ??
        asText(properties?.municipality)
    );
}

function getFeatureCity(feature: GeoPfFeature): string | undefined {
    const properties = feature.properties;
    return (
        asText(properties?.city) ??
        asText(properties?.municipality) ??
        asText(properties?.name)
    );
}

type GeoPfResponse = {
    features?: GeoPfFeature[];
};

function HomePage() {
    const [location, setLocation] = useState("");
    const [radiusKm, setRadiusKm] = useState(25);
    const [searchArea, setSearchArea] = useState<MapSearchArea | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [useGeolocation, setUseGeolocation] = useState(false);
    const [suggestions, setSuggestions] = useState<GeoPfFeature[]>([]);
    const [selectedLocation, setSelectedLocation] =
        useState<GeoPfFeature | null>(null);

    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

    useEffect(() => {
        const query = typeof location === "string" ? location.trim() : "";

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
                    return;
                }

                const data = (await response.json()) as GeoPfResponse;

                setSuggestions(
                    (data.features ?? []).filter((feature) => {
                        const [longitude, latitude] =
                            feature.geometry?.coordinates ?? [];

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

    async function loadOffers(
        search?: {
            latitude: number;
            longitude: number;
            radiusKm: number;
            name?: string;
        },
    ) {
        const url = new URL(
            `${import.meta.env.VITE_API_BACKEND_URL}/offers/`,
        );

        if (search) {
            url.searchParams.set("latitude", String(search.latitude));
            url.searchParams.set("longitude", String(search.longitude));
            url.searchParams.set(
                "perimeter",
                String(search.radiusKm * 2 * Math.PI),
            );

            if (search.name?.trim()) {
                url.searchParams.set("name", search.name.trim());
            }
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Impossible de récupérer les offres.");
        }

        const data = await response.json();
        setOffers(data.items ?? []);
    }

    useEffect(() => {
        loadOffers().catch((error) => {
            console.error("Erreur lors du chargement des offres :", error);
        });
    }, []);

    async function reverseGeocodeCity(
        latitude: number,
        longitude: number,
    ): Promise<{ city: string }> {
        const communeUrl = new URL(
            "https://geo.api.gouv.fr/communes",
        );
        communeUrl.searchParams.set("lat", String(latitude));
        communeUrl.searchParams.set("lon", String(longitude));
        communeUrl.searchParams.set("fields", "nom,code");
        communeUrl.searchParams.set("limit", "1");

        try {
            const communeResponse = await fetch(communeUrl);

            if (communeResponse.ok) {
                const communes = (await communeResponse.json()) as Array<{
                    nom?: unknown;
                }>;
                const city = asText(communes[0]?.nom);

                if (city) {
                    return { city };
                }
            }
        } catch {
        }
        const municipalityUrl = new URL(
            "https://data.geopf.fr/geocodage/reverse",
        );
        municipalityUrl.searchParams.set("lat", String(latitude));
        municipalityUrl.searchParams.set("lon", String(longitude));
        municipalityUrl.searchParams.set("index", "address");
        municipalityUrl.searchParams.set("type", "municipality");
        municipalityUrl.searchParams.set("limit", "1");

        const municipalityResponse = await fetch(municipalityUrl);

        if (municipalityResponse.ok) {
            const municipalityData =
                (await municipalityResponse.json()) as GeoPfResponse;
            const municipalityFeature = municipalityData.features?.[0];
            const city = municipalityFeature
                ? getFeatureCity(municipalityFeature) ??
                  getFeatureLabel(municipalityFeature)
                : undefined;

            if (city) {
                return { city };
            }
        }
        const searchGeometry = JSON.stringify({
            type: "Circle",
            coordinates: [longitude, latitude],
            radius: 1,
        });
        const poiUrl = new URL(
            "https://data.geopf.fr/geocodage/reverse",
        );
        poiUrl.searchParams.set("lat", String(latitude));
        poiUrl.searchParams.set("lon", String(longitude));
        poiUrl.searchParams.set("index", "poi");
        poiUrl.searchParams.set("category", "commune");
        poiUrl.searchParams.set("searchgeom", searchGeometry);
        poiUrl.searchParams.set("limit", "1");

        const poiResponse = await fetch(poiUrl);
        if (poiResponse.ok) {
            const poiData = (await poiResponse.json()) as GeoPfResponse;
            const poiFeature = poiData.features?.[0];
            const city = poiFeature
                ? getFeatureCity(poiFeature) ?? getFeatureLabel(poiFeature)
                : undefined;

            if (city) {
                return { city };
            }
        }

        throw new Error(
            "Votre ville n'a pas pu être déterminée. Vous pouvez saisir votre ville manuellement.",
        );
    }

    function handleGeolocationChange(checked: boolean) {
        setUseGeolocation(checked);
        setLocationError(null);

        if (!checked) {
            return;
        }

        if (!navigator.geolocation) {
            setUseGeolocation(false);
            setLocationError(
                "La géolocalisation n'est pas disponible sur votre navigateur.",
            );
            return;
        }

        setIsLocating(true);
        setSuggestions([]);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const result = await reverseGeocodeCity(
                        latitude,
                        longitude,
                    );

                    setLocation(result.city);
                    setSelectedLocation({
                        geometry: {
                            coordinates: [longitude, latitude],
                        },
                        properties: {
                            name: result.city,
                            label: result.city,
                            city: result.city,
                        },
                    });
                    setSearchArea({
                        latitude,
                        longitude,
                        radiusKm,
                        label: result.city,
                    });
                } catch (error) {
                    setUseGeolocation(false);
                    setLocationError(
                        error instanceof Error
                            ? error.message
                            : "Impossible de récupérer votre localisation.",
                    );
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                setUseGeolocation(false);
                setIsLocating(false);

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError(
                            "L'accès à votre position a été refusé. Autorisez la géolocalisation dans votre navigateur puis réessayez.",
                        );
                        break;
                    case error.TIMEOUT:
                        setLocationError(
                            "La récupération de votre position a pris trop de temps. Réessayez.",
                        );
                        break;
                    default:
                        setLocationError(
                            "Votre position n'a pas pu être récupérée.",
                        );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 60000,
            },
        );
    }

    function selectLocation(feature: GeoPfFeature) {
        const label = getFeatureLabel(feature);

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

        const query = typeof location === "string" ? location.trim() : "";

        if (!query) {
            setLocationError("Saisissez une ville ou une adresse.");
            return;
        }

        setIsSearching(true);
        setLocationError(null);

        try {
            let feature = selectedLocation;

            if (!feature) {
                const url = new URL(
                    "https://data.geopf.fr/geocodage/search",
                );

                url.searchParams.set("q", query);
                url.searchParams.set("limit", "1");

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(
                        "La recherche de localisation est indisponible.",
                    );
                }

                const data = (await response.json()) as GeoPfResponse;
                feature = data.features?.[0] ?? null;
            }

            const [longitude, latitude] =
                feature?.geometry?.coordinates ?? [];

            if (
                typeof latitude !== "number" ||
                typeof longitude !== "number"
            ) {
                setLocationError(
                    "Aucune localisation trouvée. Précisez votre recherche.",
                );
                return;
            }

            setSearchArea({
                latitude,
                longitude,
                radiusKm,
                label: getFeatureLabel(feature) ?? query,
            });

            await loadOffers({
                latitude,
                longitude,
                radiusKm,
                name: undefined,
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

    function openOffer(offer: JobOffer) {
        setSelectedOffer(offer);
        setCvFile(null);
        setCoverLetterFile(null);
    }

    function closeOffer() {
        setSelectedOffer(null);
        setCvFile(null);
        setCoverLetterFile(null);
    }

    async function handleApply() {
    if (!selectedOffer || !cvFile || !coverLetterFile) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Vous devez être connecté pour postuler.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("resume", cvFile);
        formData.append("cover_letter", coverLetterFile);

        const response = await fetch(
            `${import.meta.env.VITE_API_BACKEND_URL}/applications/${selectedOffer.id}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de l'envoi de la candidature.");
        }

        alert("Votre candidature a bien été envoyée !");
        closeOffer();
    } catch (error) {
        console.error("Erreur postuler :", error);
        alert("Impossible d'envoyer la candidature.");
    }
}

    function handleCvChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0] ?? null;

        if (file && file.type !== "application/pdf") {
            event.target.value = "";
            setCvFile(null);
            return;
        }

        setCvFile(file);
    }

    function handleCoverLetterChange(
        event: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = event.target.files?.[0] ?? null;

        if (file && file.type !== "application/pdf") {
            event.target.value = "";
            setCoverLetterFile(null);
            return;
        }

        setCoverLetterFile(file);
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
                                        getFeatureLabel(feature);

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
                        label="Rayon"
                        nativeSelectProps={{
                            value: String(radiusKm),
                            onChange: (event) => {
                                const nextRadius = Number(
                                    event.target.value,
                                );

                                setRadiusKm(nextRadius);
                                setSearchArea((previous) =>
                                    previous
                                        ? {
                                              ...previous,
                                              radiusKm: nextRadius,
                                          }
                                        : previous,
                                );
                            },
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
                        options={[
                            {
                                label:
                                    isLocating
                                        ? "Localisation en cours..."
                                        : "Utiliser ma position actuelle",
                                nativeInputProps: {
                                    name: "use-geolocation",
                                    checked: useGeolocation,
                                    disabled: isLocating,
                                    onChange: (event) =>
                                        handleGeolocationChange(
                                            event.target.checked,
                                        ),
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
                        {offers.map((offer) => (
                            <Card
                                key={offer.id}
                                title={offer.name}
                                desc={`${offer.adress} · ${offer.contract_type}`}
                                linkProps={{
                                    href: "#",
                                    onClick: (event) => {
                                        event.preventDefault();
                                        openOffer(offer);
                                    },
                                }}
                            />
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
                        onOfferSelect={(offerId) => {
                            const offer = offers.find(
                                (item) => item.id === offerId,
                            );

                            if (offer) {
                                openOffer(offer);
                            }
                        }}
                    />
                </section>
            </div>

            {selectedOffer !== null && (
                <div
                    className="geoemploi-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeOffer();
                        }
                    }}
                >
                    <div
                        className="geoemploi-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="offer-modal-title"
                    >
                        <button
                            type="button"
                            className="geoemploi-modal-close"
                            onClick={closeOffer}
                            aria-label="Fermer"
                        >
                            ×
                        </button>

                        <h2 id="offer-modal-title">
                            {selectedOffer.name}
                        </h2>

                        <p>
                            <strong>Employeur :</strong>{" "}
                            {selectedOffer.employer.first_name}{" "}
                            {selectedOffer.employer.last_name}
                        </p>

                        <p>
                            <strong>Lieu :</strong>{" "}
                            {selectedOffer.adress}
                        </p>

                        <p>
                            <strong>Contrat :</strong>{" "}
                            {selectedOffer.contract_type}
                        </p>

                        <p>
                            <strong>Date de début :</strong>{" "}
                            {selectedOffer.start_date}
                        </p>

                        {selectedOffer.end_date && (
                            <p>
                                <strong>Date de fin :</strong>{" "}
                                {selectedOffer.end_date}
                            </p>
                        )}

                        <div>
                            <h3>Description</h3>
                            <p>
                                {selectedOffer.description}
                            </p>
                        </div>

                        <div className="geoemploi-file-upload">
                            <label htmlFor="cv-file">
                                CV
                            </label>

                            <input
                                id="cv-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={handleCvChange}
                            />

                            {cvFile && (
                                <p>
                                    Fichier sélectionné :{" "}
                                    {cvFile.name}
                                </p>
                            )}
                        </div>

                        <div className="geoemploi-file-upload">
                            <label htmlFor="cover-letter-file">
                                Lettre de motivation
                            </label>

                            <input
                                id="cover-letter-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={
                                    handleCoverLetterChange
                                }
                            />

                            {coverLetterFile && (
                                <p>
                                    Fichier sélectionné :{" "}
                                    {coverLetterFile.name}
                                </p>
                            )}
                        </div>

                        <Button
                            nativeButtonProps={{
                                type: "button",
                                disabled:
                                    !cvFile ||
                                    !coverLetterFile,
                                onClick: handleApply,
                            }}
                        >
                            Postuler
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}

export default HomePage;