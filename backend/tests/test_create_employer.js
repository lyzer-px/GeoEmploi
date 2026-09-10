import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8084/api/v1';

export const options = {
  vus: 1,
  iterations: 1,
};

function randomEmail() {
  return `employer${Math.floor(Math.random() * 100000)}@gmail.com`;
}

export default function () {
  const email = randomEmail();

  console.log(email)
  const payload = JSON.stringify({
    first_name: 'Jean',
    last_name: 'Dupont',
    email: email,
    password: 'Password123!',
    role: 'employer',
  });

  const headers = { 'Content-Type': 'application/json' };

  const res = http.post(`${BASE_URL}/auth/register`, payload, { headers });

  const registered = check(res, {
    'register status is 201': (r) => r.status === 201,
    'response has access_token': (r) => {
      try {
        return !!JSON.parse(r.body).tokens.access_token;
      } catch (e) {
        return false;
      }
    },
  });

  if (!registered) {
    console.error(`Echec inscription (${res.status}): ${res.body}`);
    return;
  }

  const body = JSON.parse(res.body);
  const accessToken = body.tokens.access_token;

  console.log(`Employeur créé -> id=${body.user.id} email=${body.user.email}`);
  console.log(`access_token=${accessToken}`);

  const meRes = http.get(`${BASE_URL}/offers/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  check(meRes, {
    'GET /offers/me avec token status is 200': (r) => r.status === 200,
  });

  sleep(1);
}