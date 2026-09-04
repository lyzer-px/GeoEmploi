import MyHeader from "../Header";
import Footer from "../Footer";

function About() {
    return (
        <div className="app-layout">
            <MyHeader />
            <main className="about-page">
                <h1>À propos de GeoEmploi</h1>
                <p className="about-description">
                    GeoEmploi est un service public destiné à faciliter l’accès à l’emploi et à renforcer
                    la mise en relation entre les personnes à la recherche d’une activité professionnelle
                    et les employeurs qui recrutent. Il s’inscrit dans une démarche de proximité, afin de
                    rendre les opportunités professionnelles plus lisibles et plus accessibles à chacun.
                </p>
                <p className="about-description">
                    La plateforme permet de rechercher des offres selon un métier, une compétence et une
                    localisation. En indiquant une zone géographique et un périmètre de recherche, les
                    utilisateurs peuvent consulter les opportunités disponibles autour d’eux et identifier
                    celles qui correspondent le mieux à leur parcours, à leurs qualifications et à leurs
                    projets professionnels.
                </p>
                <p className="about-description">
                    GeoEmploi contribue ainsi à simplifier les démarches de recherche d’emploi tout en
                    favorisant la rencontre entre les compétences et les besoins des territoires. Les
                    recruteurs disposent d’un moyen supplémentaire pour rendre leurs offres visibles auprès
                    de candidats susceptibles de répondre à leurs besoins. Le service a vocation à proposer
                    une information claire, utile et accessible, au bénéfice des candidats, des recruteurs,
                    des entreprises et des acteurs de l’emploi.
                </p>
            </main>
            <Footer />
        </div>
    );
}

export default About;