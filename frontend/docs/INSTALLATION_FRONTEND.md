# GéoEmploi — Documentation d'installation du frontend

## 1. Prérequis

Le frontend est un projet **React + TypeScript + Vite**.

Avant de commencer, vérifier que Node.js et npm sont installés :

```bash
node --version
npm --version
```

Si les commandes fonctionnent, vous pouvez installer le projet.

---

## 2. Récupérer le projet

### Fichier `.dsfr.yml` — obligatoire

Le fichier `.dsfr.yml` doit être présent **à la racine du frontend**, au même niveau que `package.json`.

Structure attendue :

```text
GeoEmploi/
└── frontend/
    ├── .dsfr.yml          ← obligatoire
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── public/
    └── src/
```

Ce fichier est important pour le fonctionnement et l'optimisation du **DSFR** dans le frontend. Il ne faut donc pas l'oublier lors d'un clonage, d'une copie ou d'une nouvelle installation du projet.

Les scripts du `package.json` utilisent notamment :

```bash
react-dsfr optimize-css
```

Le fichier `.dsfr.yml` doit rester dans le projet afin que cette configuration soit disponible lors de l'installation et du lancement du frontend.

**Ne pas supprimer ou déplacer `.dsfr.yml`.**

Pour vérifier sa présence :

```bash
ls -la
```

Vous devez voir notamment :

```text
.dsfr.yml
package.json
package-lock.json
```

Après avoir cloné ou récupéré le dépôt :

```bash
cd GeoEmploi/frontend
```

Vérifier que le dossier contient notamment :

```text
package.json
package-lock.json
src/
public/
index.html
```

---

## 3. Installation des dépendances

Avant de lancer l'installation, vérifier que vous êtes bien dans :

```text
GeoEmploi/frontend
```

et que `.dsfr.yml` et `package.json` sont présents :

```bash
pwd
ls -la
```

Puis :

### Méthode recommandée

Il n'est pas nécessaire d'installer chaque bibliothèque manuellement.

Le fichier `package.json` contient déjà toutes les dépendances du frontend.

Exécuter simplement :

```bash
npm install
```

Cette commande installe automatiquement les dépendances nécessaires.

### Dépendances principales installées

Le projet utilise :

```text
react
react-dom
react-router-dom
leaflet
@codegouvfr/react-dsfr
@gouvfr/dsfr
```

### Dépendances de développement

Le projet utilise également :

```text
typescript
vite
@vitejs/plugin-react
@types/react
@types/react-dom
@types/leaflet
@types/node
oxlint
```

Une dépendance optionnelle spécifique à certaines installations Linux est également présente :

```text
@rolldown/binding-linux-x64-gnu
```

---

## 4. Installation manuelle — uniquement si nécessaire

Si le `package.json` est incomplet ou si vous configurez un nouveau projet à partir de zéro, les commandes correspondant au projet sont :

### React

```bash
npm install react react-dom
```

### React Router

```bash
npm install react-router-dom
```

### Leaflet

```bash
npm install leaflet
```

### Types TypeScript pour Leaflet

```bash
npm install -D @types/leaflet
```

### DSFR

```bash
npm install @codegouvfr/react-dsfr @gouvfr/dsfr
```

### TypeScript, Vite et plugin React

```bash
npm install -D typescript vite @vitejs/plugin-react
```

### Types React et Node

```bash
npm install -D @types/react @types/react-dom @types/node
```

### Oxlint

```bash
npm install -D oxlint
```

**Attention :** dans le projet existant, ne lancez pas toutes ces commandes inutilement. `npm install` suffit lorsque `package.json` et `package-lock.json` sont présents.

---

## 5. Configuration des variables d'environnement

Le frontend utilise une variable d'environnement pour communiquer avec le backend :

```text
VITE_API_BACKEND_URL
```

Créer un fichier `.env` dans :

```text
frontend/.env
```

Exemple :

```env
VITE_API_BACKEND_URL=http://127.0.0.1:8084/api/v1
```

Ne pas publier de secrets dans Git.

Le fichier `.env` doit rester ignoré par Git.

Pour partager la configuration avec l'équipe, utiliser plutôt un fichier :

```text
.env.example
```

Exemple :

```env
VITE_API_BACKEND_URL=http://127.0.0.1:8084/api/v1
```

---

## 6. Lancer le frontend en développement

Depuis le dossier `frontend` :

```bash
npm run dev
```

Vite démarre alors le serveur de développement.

Si nécessaire, Vite affichera l'adresse locale, généralement :

```text
http://localhost:5173
```

---

## 7. Vérifier le projet

### Linter

```bash
npm run lint
```

### Build de production

```bash
npm run build
```

### Prévisualisation du build

```bash
npm run preview
```

---

## 8. Scripts disponibles

Le `package.json` actuel contient :

| Commande | Utilisation |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Compile TypeScript et crée le build Vite |
| `npm run lint` | Lance Oxlint |
| `npm run preview` | Prévisualise le build de production |

Le projet exécute également automatiquement :

```bash
react-dsfr optimize-css
```

avant `npm run dev` et `npm run build`.

---

## 9. Structure des assets

Les images utilisées par le frontend sont placées dans `public/`.

Structure actuelle :

```text
public/
├── Geo_emploie_favicon.png
└── images/
    ├── Geo_emploie_header.png
    └── Geo_emploie_footer.png
```

Elles sont ensuite accessibles depuis le code avec :

```text
/Geo_emploie_favicon.png
/images/Geo_emploie_header.png
/images/Geo_emploie_footer.png
```

### Important pour Git

Si les images doivent être versionnées, elles ne doivent pas être ignorées par `.gitignore`.

Par exemple, une règle globale :

```gitignore
*.png
```

ignore toutes les images PNG.

Si cette règle est conservée, autoriser explicitement les images GéoEmploi :

```gitignore
!frontend/public/Geo_emploie_favicon.png
!frontend/public/images/Geo_emploie_header.png
!frontend/public/images/Geo_emploie_footer.png
```

---

## 10. Installation complète sur une nouvelle machine

Pour une installation classique du frontend :

```bash
git clone <URL_DU_DEPOT>
cd GeoEmploi/frontend
npm install
```

Créer ensuite `.env` :

```env
VITE_API_BACKEND_URL=http://127.0.0.1:8084/api/v1
```

Puis lancer :

```bash
npm run dev
```

Pour vérifier avant livraison :

```bash
npm run lint
npm run build
```

---

## 11. En cas de problème avec Vite

Si le projet utilise un ancien cache Vite, supprimer uniquement le cache :

```bash
rm -rf node_modules/.vite
```

Puis relancer :

```bash
npm run dev
```

Si les dépendances sont corrompues, une réinstallation complète peut être effectuée :

```bash
rm -rf node_modules
npm install
```

Il n'est normalement pas nécessaire de supprimer `package-lock.json`.

---

## 12. Résumé rapide

Pour un projet GéoEmploi déjà récupéré depuis Git :

```bash
cd GeoEmploi/frontend
npm install
npm run dev
```

Pour vérifier le projet :

```bash
npm run lint
npm run build
```

**La règle principale :** ne pas installer les dépendances une par une lorsque le `package.json` du projet est déjà présent. `npm install` lit le `package.json` et installe l'ensemble des dépendances déclarées.
