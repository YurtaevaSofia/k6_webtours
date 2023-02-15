import http from 'k6/http';
import { check, group, parseHTML , stages, sleep} from 'k6';

export const options = {
  scenarios: {
      yandex: {
        executor: 'ramping-vus',
        exec: 'getYandex',
        startVUs: 0,
        stages: [
            { duration: '5m', target: 10 },
            { duration: '10m', target: 10 },
            { duration: '5m', target: 12 },
            { duration: '10m', target: 12 }
          ]
      },
      www: {
          executor: 'ramping-vus',
          exec: 'getWWW',
          startVUs: 0,
          stages: [
              { duration: '5m', target: 10 },
              { duration: '10m', target: 10 },
              { duration: '5m', target: 12 },
              { duration: '10m', target: 12 }
            ]
      }
}};

export function getYandex() {
  const res = http.get('http://ya.ru');
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });
  sleep(5)
}

export function getWWW() {
  const res = http.get('http://www.ru');
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });
    sleep(5)
}
