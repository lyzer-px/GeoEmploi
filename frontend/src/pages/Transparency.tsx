import MyHeader from "../Header";
import Footer from "../Footer";

function Transparency() {
    return (
        <div className="app-layout">
            <MyHeader />
                <main className="about-page">
                    <h1>Transparence</h1>
                    <p className="about-description">
                        GéoEmploi est un service public qui permet aux personnes à la recherche
                        d’un emploi de consulter des offres et aux employeurs de publier leurs
                        opportunités professionnelles. Cette page présente de manière claire
                        les principales règles relatives au fonctionnement du service et aux
                        données utilisées par la plateforme.
                    </p>
                    <h2>Publication des offres</h2>
                    <p className="about-description">
                        La publication d’une offre d’emploi sur GéoEmploi est entièrement
                        gratuite pour les employeurs. Aucun abonnement, tarif ou contrepartie
                        financière n’est demandé pour publier une offre sur la plateforme.
                    </p>
                    <h2>Localisation des offres</h2>
                    <p className="about-description">
                        Afin de protéger la confidentialité des informations de localisation,
                        GéoEmploi n’affiche pas l’adresse précise d’une offre d’emploi. Les
                        offres sont localisées à la maille communale et sont représentées sur
                        la carte au niveau du centroïde de la commune concernée.
                    </p>
                    <p className="about-description">
                        Les coordonnées précédemment enregistrées à une adresse précise sont
                        ramenées à la maille communale en base de données. Cette transformation
                        est effectuée de manière irréversible.
                    </p>
                    <h2>Durée de conservation</h2>
                    <p className="about-description">
                        Les offres d’emploi sont conservées pendant leur période de validité.
                        Les offres arrivées à expiration sont automatiquement archivées au-delà
                        de 30 jours suivant leur date d’expiration.
                    </p>
                    <h2>Protection des données personnelles</h2>
                    <p className="about-description">
                        GéoEmploi accorde une attention particulière à la protection des
                        données personnelles. Les données utilisées par le service sont
                        traitées conformément aux règles applicables en matière de protection
                        des données personnelles.
                    </p>
                    <p className="about-description">
                        Pour toute question relative à la protection de vos données
                        personnelles ou à l’exercice de vos droits, vous pouvez contacter le
                        Délégué à la protection des données (DPO).
                    </p>
                    <h2>Contact du DPO</h2>
                    <p className="about-description">
                        Délégué à la protection des données : rayan.ouerdane@epitech.eu
                    </p>
                </main>
            <Footer />
        </div>
    );
}

export default Transparency;