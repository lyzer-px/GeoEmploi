import MyHeader from "../Header";
import Footer from "../Footer";

function CGU() {
    return (
        <div className="app-layout">
            <MyHeader />

            <main className="about-page">
                <h1>Conditions générales d’utilisation</h1>

                <p className="about-description">
                    Les présentes conditions générales d’utilisation définissent
                    les règles applicables à l’utilisation du service GéoEmploi.
                    Elles ont pour objectif de préciser les conditions d’accès
                    et d’utilisation de la plateforme ainsi que les droits et
                    obligations de ses utilisateurs.
                </p>

                <h2>Objet du service</h2>

                <p className="about-description">
                    GéoEmploi est un service destiné à faciliter la recherche
                    d’emploi et la mise en relation entre les personnes à la
                    recherche d’une activité professionnelle et les employeurs
                    qui recrutent.
                </p>

                <p className="about-description">
                    La plateforme permet notamment aux personnes à la recherche
                    d’un emploi de consulter librement les offres disponibles,
                    d’effectuer des recherches selon différents critères et de
                    déposer une candidature auprès des employeurs.
                </p>

                <h2>Accès au service</h2>

                <p className="about-description">
                    La consultation des offres et de la carte est accessible
                    sans création de compte. Certaines fonctionnalités,
                    notamment celles permettant de gérer un profil ou de
                    publier des offres d’emploi, nécessitent la création d’un
                    compte utilisateur.
                </p>

                <h2>Publication des offres</h2>

                <p className="about-description">
                    Les employeurs peuvent publier des offres d’emploi sur
                    GéoEmploi afin de les rendre accessibles aux personnes à
                    la recherche d’un emploi.
                </p>

                <p className="about-description">
                    La publication d’une offre d’emploi sur GéoEmploi est
                    entièrement gratuite. Aucun abonnement, tarif ou
                    contrepartie financière n’est demandé pour publier une
                    offre sur la plateforme.
                </p>

                <h2>Localisation des offres</h2>

                <p className="about-description">
                    Les offres d’emploi sont localisées à la maille communale.
                    Afin de préserver la confidentialité des informations de
                    localisation, GéoEmploi n’affiche pas l’adresse précise
                    associée à une offre.
                </p>

                <p className="about-description">
                    Sur la carte, les offres sont représentées au niveau du
                    centroïde de la commune concernée.
                </p>

                <h2>Utilisation du service</h2>

                <p className="about-description">
                    Les utilisateurs s’engagent à utiliser GéoEmploi de
                    manière loyale et conformément à sa finalité. Les
                    informations transmises lors de la création d’un compte,
                    de la publication d’une offre ou d’une candidature doivent
                    être exactes et ne pas être utilisées à des fins
                    frauduleuses ou contraires à la réglementation applicable.
                </p>

                <h2>Protection des données personnelles</h2>

                <p className="about-description">
                    Les données personnelles utilisées dans le cadre de
                    GéoEmploi sont traitées conformément aux règles applicables
                    en matière de protection des données personnelles.
                </p>

                <p className="about-description">
                    Les informations relatives à la localisation des offres
                    sont limitées à la maille communale. Les coordonnées
                    correspondant à une localisation plus précise sont
                    ramenées à cette maille en base de données.
                </p>

                <h2>Durée de conservation</h2>

                <p className="about-description">
                    Les offres d’emploi sont conservées pendant leur période
                    de validité. Les offres arrivées à expiration sont
                    automatiquement archivées au-delà de 30 jours suivant leur
                    date d’expiration.
                </p>

                <h2>Évolution du service</h2>

                <p className="about-description">
                    GéoEmploi peut être amené à faire évoluer ses
                    fonctionnalités afin d’améliorer le service, sa sécurité,
                    son accessibilité ou son fonctionnement.
                </p>

                <h2>Contact</h2>

                <p className="about-description">
                    Pour toute question relative à l’utilisation du service,
                    aux présentes conditions générales d’utilisation ou à la
                    protection des données personnelles, les utilisateurs
                    peuvent contacter l’équipe en charge de GéoEmploi.
                </p>
            </main>

            <Footer />
        </div>
    );
}

export default CGU;