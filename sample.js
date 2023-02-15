import http from 'k6/http';
import { check, group, parseHTML } from 'k6';
import {SharedArray} from 'k6/data'

const BASE_URL = 'http://webtours.load-test.ru:1080';
const cities = ["London", "Denver", "Frankfurt", "Los Angeles", "Paris", "Portland", "San Francisco", "Seattle", "Sydney", "Zurich"];

const data = new SharedArray('getCreds', function(){
    const file = JSON.parse(open('./creds.json'))
    return file.users
})


export const options = {
  vus: 1,
  duration: '3s'
};

export function getBase() {
  const res = http.get(`${BASE_URL}/webtours/`);
  check(res, {
    'status code is 200': (res) => res.status === 200,
  });

let res2 = http.get(`${BASE_URL}/cgi-bin/nav.pl?in=home`, { responseType: 'text' });
    check(res2, {
        'status code is 200': (res2) => res2.status == 200,
    });
    const elem = res2.html().find('input[name=userSession]');
    let userSession = elem.attr('value');
    console.log(userSession)
}

export function login() {

    let random = Math.floor(Math.random() * data.length);
    let user = data[random]
    let username = user.username
    let password = user.password


    const payload = { userSession: '${userSession}',
                        username: '${username}',
                        password: '${password}'
     };
    const headers = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/cgi-bin/login.pl`, JSON.stringify(payload), headers);
    check(res, {
      'status code is 200': (res) => res.status === 200,
    });

    check(res, {
        'verify logged in': (r) =>
          r.body.includes('SofiaY'),
      });
}

export function chooseFlight() {
    //-----------------------------------------------------------------------------------------------------------
  const res1 = http.get(`${BASE_URL}/cgi-bin/welcome.pl?page=search`);
    check(res1, {
    'status code is 200': (res1) => res1.status === 200,
  });
    //-----------------------------------------------------------------------------------------------------------

  const res2 = http.get(`${BASE_URL}/cgi-bin/nav.pl?page=menu&in=flights`);
    check(res2, {
      'status code is 200': (res2) => res2.status === 200,
    });
    //-----------------------------------------------------------------------------------------------------------

  const res3 = http.get(`${BASE_URL}/cgi-bin/reservations.pl?page=welcome`);
    check(res3, {
        'status code is 200': (res3) => res3.status === 200,
      });
    //-----------------------------------------------------------------------------------------------------------

let departCity = Math.floor(Math.random() * cities.length);
let arriveCity = Math.floor(Math.random() * cities.length);

    const payload1 = { advanceDiscount: 0,
                  depart: '${departCity}',
                  departDate: '02/11/2023',
                  arrive: '${arriveCity}',
                  returnDate: '02/11/2023',
                  numPassengers: 1,
                  seatPref: 'None',
                  seatType: 'Coach',
                  "findFlights.x": 70,
                  "findFlights.y": 3
     };
     console.log(payload1)
    const headers1 = { headers: { 'Content-Type': 'application/json' } };

    const res4 = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, JSON.stringify(payload1), headers1);
    check(res4, {
      'status code is 200': (res4) => res4.status === 200,
    });

 const elem = res4.html().find('tr[name=outboundFlight]');
    let outboundFlight = elem.attr('value');
    console.log(outboundFlight)


     //-----------------------------------------------------------------------------------------------------------


const payload2 = { advanceDiscount: 0,
                  outboundFlight: '${outboundFlight}',
                  numPassengers: 1,
                  seatPref: 'None',
                  seatType: 'Coach',
                  "findFlights.x": 70,
                  "findFlights.y": 3
     };
    const headers2 = { headers: { 'Content-Type': 'application/json' } };

    const res5 = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, JSON.stringify(payload2), headers2);
    check(res5, {
      'status code is 200': (res5) => res5.status === 200,
    });
}


export function confirmData() {

const payload = { firstName: 'Sofia',
                  lastName: 'Yurtaeva',
                  address1: 'Teply Stan 26',
                  address2: 'Moscow 111118',
                  pass1: 'Sofia Yurtaeva',
                  creditCard: '352364',
                  expDate: "",
                  oldCCOption: "",
                  outboundFlight: '${outboundFlight}',
                  advanceDiscount: 0,
                  JSFormSubmit: 'off',
                  numPassengers: 1,
                  seatPref: 'None',
                  seatType: 'Coach',
                  'buyFlights.x': 70,
                  'buyFlights.y': 3
     };
    const headers = { headers: { 'Content-Type': 'application/json' } };

    const res = http.post(`${BASE_URL}/cgi-bin/reservations.pl`, JSON.stringify(payload), headers);
    check(res, {
      'status code is 200': (res) => res.status === 200,
    });

}

export default function () {
  getBase();
  login();
  group('chooseFlight', () => { chooseFlight(); });
  confirmData();
  getBase();
}
