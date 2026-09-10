import http from 'k6/http';
import { sleep, check } from 'k6';

const apiUrl = "http://127.0.0.1:8084/api/v1"

export const options = {
  vus: 50,
  duration: '180s',
};

export default function() {
  let res = http.get(apiUrl + "/offers");
  check(res, { "status is 200": (res) => res.status === 200 });
  sleep(1);
}