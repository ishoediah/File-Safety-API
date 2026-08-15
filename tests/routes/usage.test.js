import { describe, it, expect } from 'vitest'
import 'dotenv/config'
import { app } from '../../src/index.js'

const TEST_KEY = process.env.TEST_API_KEY

describe('GET /v1/usage', () => {

  it('Returns usage stats for an authenticated customer', async () => {
    const res = await app.request('/v1/usage', {
      headers: { 'Authorization': `Bearer ${TEST_KEY}` }
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.plan).toBeTruthy()                    // has a plan
    expect(typeof data.used).toBe('number')           // used is a number
    expect(typeof data.limit).toBe('number')          // limit is a number
    expect(data.remaining).toBe(data.limit - data.used) // remaining math checks out
  })

  it('Rejects a usage request with no API key', async () => {
    const res = await app.request('/v1/usage')  // no auth header

    expect(res.status).toBe(401)  // MISSING_API_KEY — usage is protected
  })

})