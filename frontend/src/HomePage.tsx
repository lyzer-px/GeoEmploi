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
    const [location, setLocation] = useState("");
    const [radiusKm, setRadiusKm] = useState(25);
    const [searchArea, setSearchArea] = useState<MapSearchArea | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState<GeoPfFeature[]>([]);
    const [selectedLocation, setSelectedLocation] =
        useState<GeoPfFeature | null>(null);

    const [offers, setOffers] = useState<JobOffer[]>([]);
    const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);

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

    useEffect(() => {
        async function loadOffers() {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BACKEND_URL}/offers/`,
                );

                if (!response.ok) {
                    throw new Error(
                        "Impossible de récupérer les offres.",
                    );
                }

                const data = await response.json();

                setOffers(data.items ?? []);
            } catch (error) {
                console.error(
                    "Erreur lors du chargement des offres :",
                    error,
                );
            }
        }

        loadOffers();
    }, []);

    function selectLocation(feature: GeoPfFeature) {
        const label =
            feature.properties?.label ?? feature.properties?.name;

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
                label:
                    feature?.properties?.label ??
                    feature?.properties?.name ??
                    query,
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

          const formData = new FormData();
          formData.append("resume", cvFile);
          formData.append("cover_letter", coverLetterFile);

          try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(
              `${import.meta.env.VITE_API_BACKEND_URL}/applications/${selectedOffer.id}`,
              {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
              }
            );
        
            if (!response.ok) {
              const errorData = (await response.json().catch(() => null)) as { detail?: string } | null;
              throw new Error(
                errorData?.detail ?? "Impossible d'envoyer votre candidature."
              );
            }
        
            alert("Votre candidature a bien été envoyée !");
            closeOffer();
          } catch (error) {
            console.error("Erreur de candidature :", error);
            alert((error as Error).message);
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
                            onChange: (event) =>
                                setRadiusKm(
                                    Number(
                                        event.target.value,
                                    ),
                                ),
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
                                onClick: handleApply
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