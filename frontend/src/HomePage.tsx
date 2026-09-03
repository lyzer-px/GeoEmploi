import Map from './Map.tsx'
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

function HomePage() {
    return (
    <main className="geoemploi-page">
        <div className="geoemploi-location">
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
            }}
            />
            <Select
            label="Périmètre"
            nativeSelectProps={{
                defaultValue: "25",
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
                <Button> Rechercher </Button>
            </div>
        </div>
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
            <Map />
        </section>
        </div>
    </main>
    );
}

export default HomePage;