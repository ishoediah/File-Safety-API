import { describe, it, expect } from 'vitest'
import { app } from '../../src/index.js'

describe('GET /v1/health', () => {

  it('Is publicly accessible with no API key', async () => {
    const res = await app.request('/v1/health')  // no auth header at all

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('ok')
  })

})