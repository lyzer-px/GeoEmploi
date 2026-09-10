# Backend Tests

This directory contains K6 load and smoke tests for the backend API.

The tests are not Python unit tests. They are JavaScript load-test scripts executed with `k6`.

## What is in this folder

- `script.js`: a simple smoke test that performs `GET /offers`
- `test_get_offers.js`: a load test for the offers listing endpoint, with filtering and pagination coverage
- `test_create_offers.js`: a load test that creates many offers using a freshly created employer token
- `test_create_employer.js`: a smoke test that registers an employer and checks `GET /offers/me`
- `.env`: local environment values for the test runner
- `package.json`: Node dependencies used to support the test scripts

## Runtime dependencies

The test runner uses:

- `k6` installed on the machine
- `dotenv`
- `ts-node`
- `@types/k6`

## How the scripts behave

### `script.js`

This is the simplest smoke test.

- sends `GET /offers`
- expects HTTP `200`
- sleeps for one second between iterations

It uses:

- `vus: 50`
- `duration: 180s`

### `test_get_offers.js`

This script stresses the public offers listing endpoint.

It:

- generates different request scenarios
- tests requests with no filters
- tests name-only filters
- tests geolocation-only filters
- tests combined name + geolocation filters
- checks pagination through `next_page`

It also validates:

- HTTP `200`
- response body contains an `items` array
- response time threshold `p(95) < 500ms`
- failure rate threshold `rate < 0.01`

### `test_create_offers.js`

This script creates a test employer first, then uses its token to create offers.

It:

- registers a temporary employer in `setup()`
- stores the returned access token
- creates offers with varied cities, titles, dates, and contract types
- checks that each creation returns HTTP `201`

Useful details:

- `shared-iterations`
- `vus: 10`
- `iterations: 500`
- `maxDuration: 5m`

### `test_create_employer.js`

This is a smoke test for employer registration.

It:

- registers an employer with random email
- checks that the API returns HTTP `201`
- verifies that an `access_token` is present
- calls `GET /offers/me` with the token

## How to run

From `backend/tests`:

```bash
k6 run script.js
```

Run the employer registration smoke test:

```bash
k6 run test_create_employer.js
```

Run the offer creation load test:

```bash
k6 run test_create_offers.js
```

Run the offers listing load test:

```bash
k6 run test_get_offers.js
```

## Notes

- These tests target the backend running on `http://127.0.0.1:8084/api/v1` by default.
- The scripts are meant to be run while the backend is already up.
- `test_create_offers.js` creates test data, so it is not a read-only test.
- `test_create_employer.js` creates a new user each time it runs because it generates a random email.

