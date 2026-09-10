import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8084/api/v1';

export const options = {
  vus: 50,
  duration: '180s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

const cities = new SharedArray('cities', function () {
  return [
    { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Lyon', latitude: 45.764, longitude: 4.8357 },
    { name: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
    { name: 'Toulouse', latitude: 43.6047, longitude: 1.4442 },
    { name: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
    { name: 'Bordeaux', latitude: 44.8378, longitude: -0.5792 },
  ];
});

const searchNames = ['Développeur', 'Serveur', 'Comptable', 'Chef de Projet', 'Boulanger', 'Technicien'];
const perimeters = [1, 5, 10, 25, 50]; // km
const pageSizes = [10, 20, 50];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickScenario() {
  const r = Math.random();
  if (r < 0.25) return 'no_filter';
  if (r < 0.5) return 'name_only';
  if (r < 0.75) return 'geo_only';
  return 'geo_and_name';
}

function buildQueryString(pairs) {
  return pairs
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

export default function () {
  const scenario = pickScenario();
  const pairs = [];

  if (scenario === 'name_only' || scenario === 'geo_and_name') {
    pairs.push(['name', randomItem(searchNames)]);
  }

  if (scenario === 'geo_only' || scenario === 'geo_and_name') {
    const city = randomItem(cities);
    pairs.push(['latitude', city.latitude]);
    pairs.push(['longitude', city.longitude]);
    pairs.push(['perimeter', randomItem(perimeters)]);
  }

  pairs.push(['size', randomItem(pageSizes)]);

  const url = `${BASE_URL}/offers/?${buildQueryString(pairs)}`;

  const res = http.get(url, { tags: { scenario: scenario } });

  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'has items array': (r) => {
      try {
        return Array.isArray(JSON.parse(r.body).items);
      } catch (e) {
        return false;
      }
    },
  });

  if (!ok) {
    console.error(`Echec [${scenario}] ${url} -> ${res.status} ${res.body}`);
    sleep(1);
    return;
  }

  const body = JSON.parse(res.body);
  if (body.next_page) {
    const nextPairs = pairs
      .filter(([key]) => key !== 'cursor')
      .concat([['cursor', body.next_page]]);
    const nextUrl = `${BASE_URL}/offers/?${buildQueryString(nextPairs)}`;

    const nextRes = http.get(nextUrl, { tags: { scenario: `${scenario}_next_page` } });
    check(nextRes, { 'pagination (next_page) status is 200': (r) => r.status === 200 });
  }

  sleep(1);
}