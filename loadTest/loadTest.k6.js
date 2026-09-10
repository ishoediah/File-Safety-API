// loadtest.k6.js; k6 load test for /v1/sanitize (multipart file upload)

import http from 'k6/http'
import { check, sleep } from 'k6'

//-- config
const BASE_URL = 'http://localhost:3000' //configure your own preferred port
const ENDPOINT = '/v1/sanitize'
const API_KEY = __ENV.TEST_API_KEY
//


const FILE = __ENV.FILE // so we dont hardcode the file and can retest with different files

const fileBin = open(FILE, 'b')

export const options = {
  stages: [
    { duration: '20s', target: 1 },
    { duration: '20s', target: 5 },
    { duration: '20s', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '20s', target: 30 },
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<15000'],
  },
}

export default function () {
  const filename = FILE.split('/').pop()
  const payload = {
    file: http.file(fileBin, filename),
  }

  const res = http.post(BASE_URL + ENDPOINT, payload, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })

  // Log non-200s so failures are visible (status + short body)
  if (res.status !== 200) {
    console.log(`status=${res.status} body=${String(res.body).slice(0, 120)}`)
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
  })

  sleep(1)
}