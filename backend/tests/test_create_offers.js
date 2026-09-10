import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8084/api/v1';

export const options = {
  scenarios: {
    fill_offers: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 500,
      maxDuration: '5m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

const cities = new SharedArray('cities', function () {
  return [
    { name: 'Paris', adress: '10 Rue de Rivoli, 75001 Paris', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Lyon', adress: '5 Place Bellecour, 69002 Lyon', latitude: 45.764, longitude: 4.8357 },
    { name: 'Marseille', adress: '1 Rue Canebière, 13001 Marseille', latitude: 43.2965, longitude: 5.3698 },
    { name: 'Toulouse', adress: '2 Place du Capitole, 31000 Toulouse', latitude: 43.6047, longitude: 1.4442 },
    { name: 'Nice', adress: '3 Promenade des Anglais, 06000 Nice', latitude: 43.7102, longitude: 7.262 },
    { name: 'Nantes', adress: '4 Cours des 50 Otages, 44000 Nantes', latitude: 47.2184, longitude: -1.5536 },
    { name: 'Strasbourg', adress: '1 Place Kléber, 67000 Strasbourg', latitude: 48.5734, longitude: 7.7521 },
    { name: 'Montpellier', adress: '1 Place de la Comédie, 34000 Montpellier', latitude: 43.6108, longitude: 3.8767 },
    { name: 'Bordeaux', adress: '1 Place Gambetta, 33000 Bordeaux', latitude: 44.8378, longitude: -0.5792 },
    { name: 'Lille', adress: '1 Place du Général de Gaulle, 59000 Lille', latitude: 50.6292, longitude: 3.0573 },
  ];
});

const jobTitles = new SharedArray('jobs', function () {
  return [
    'Développeur Full-Stack',
    'Boulanger',
    'Serveur / Serveuse',
    'Comptable',
    'Assistant Commercial',
    'Chauffeur Livreur',
    'Infirmier / Infirmière',
    'Technicien de Maintenance',
    'Vendeur en Boutique',
    'Chef de Projet',
    "Agent d'Entretien",
    'Electricien',
    'Plombier',
    'Jardinier',
    'Cuisinier',
  ];
});

const contractTypes = ['part-time', 'full-time', 'internship', 'volunteer'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min, max, decimals = 4) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(daysFromNowMin, daysFromNowMax) {
  const days = Math.floor(Math.random() * (daysFromNowMax - daysFromNowMin) + daysFromNowMin);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function randomEmail() {
  return `employer${Math.floor(Math.random() * 100000)}@gmail.com`;
}

export function setup() {
  const email = randomEmail()
  const payload = JSON.stringify({
    first_name: 'Employeur',
    last_name: 'K6',
    email: email,
    password: 'Password123!',
    role: 'employer',
  });

  const res = http.post(`${BASE_URL}/auth/register`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status !== 201) {
    throw new Error(`Impossible de créer l'employeur de test: ${res.status} ${res.body}`);
  }

  const body = JSON.parse(res.body);
  console.log(`Employeur de test créé: ${email} (id=${body.user.id})`);

  return { token: body.tokens.access_token };
}

export default function (data) {
  const city = randomItem(cities);
  const jobTitle = randomItem(jobTitles);
  const contractType = randomItem(contractTypes);
  const startDate = randomDate(1, 30);
  const hasEndDate = Math.random() > 0.4;

  const payload = {
    name: `${jobTitle} - ${city.name}`,
    description: `Nous recherchons un(e) ${jobTitle.toLowerCase()} pour rejoindre notre équipe à ${city.name}. Poste en ${contractType}, à pourvoir rapidement. Offre générée par k6 pour test de charge.`,
    start_date: startDate,
    contract_type: contractType,
    adress: city.adress,
    geocoding_source: 'nominatim',
    geocoding_score: randomFloat(0.5, 1.0, 2),
    latitude: city.latitude + randomFloat(-0.05, 0.05),
    longitude: city.longitude + randomFloat(-0.05, 0.05),
  };

  if (hasEndDate) {
    payload.end_date = randomDate(31, 120);
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.token}`,
  };

  const res = http.post(`${BASE_URL}/offers/`, JSON.stringify(payload), { headers });

  const ok = check(res, {
    'create offer status is 201': (r) => r.status === 201,
  });

  if (!ok) {
    console.error(`Echec création offre (${res.status}): ${res.body}`);
  }

  sleep(0.2);
}

export function teardown(data) {
  console.log('Remplissage terminé.');
}