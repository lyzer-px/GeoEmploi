# GéoEmploi

GéoEmploi est une application web de mise en relation entre demandeurs d'emploi et employeurs grâce à la géolocalisation.

L'objectif est de permettre aux utilisateurs de rechercher des offres d'emploi à proximité, de candidater directement depuis l'application et aux employeurs de publier et gérer leurs offres.

Le projet est réalisé dans le cadre du cahier des charges Epitech GéoEmploi.

---

## Fonctionnalités

### 👤 Demandeurs d'emploi

- Création et gestion d'un profil professionnel
- Gestion des compétences et expériences
- Indication de la disponibilité
- Recherche d'offres d'emploi géolocalisées
- Consultation des offres directement sur une carte interactive
- Candidature depuis l'application
- Suivi des candidatures

### 🏢 Employeurs

- Création d'un compte employeur
- Vérification de l'activité de l'entreprise
- Création et publication d'offres d'emploi
- Géolocalisation des offres
- Définition d'un périmètre de diffusion
- Réception des candidatures
- Gestion du statut des candidatures
- Tableau de bord avec statistiques
- Notifications lors de nouvelles candidatures

### 🛡️ Administration

- Modération des offres
- Gestion des comptes utilisateurs
- Activation / suspension de comptes
- Consultation de métriques nationales
- Gestion des signalements

### 🗺️ Géolocalisation

- Consultation des offres sans avoir besoin d'un compte
- Carte interactive
- Géolocalisation des offres à l'échelle de la commune ou de l'arrondissement
- Utilisation d'OpenStreetMap
- Affichage via Leaflet

---

## Architecture

Le projet est séparé en deux parties principales :

```text
geoemploi/
├── frontend/             # Application React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/              # API Python
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   └── main.py
│   ├── requirements.txt
│   └── ...
│
├── .gitignore
└── README.md