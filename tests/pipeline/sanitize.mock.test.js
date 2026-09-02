import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'

// --Mock the database layer before importing the app \
// vi.mock is hoisted to the top of the file, before the functions and middleware are imported

vi.mock('../../src/db/keys.js', () => ({
  hashedKeyLookup: vi.fn()
}))

vi.mock('../../src/db/usage.js', () => ({
  getUsage: vi.fn(),
  incrementUsage: vi.fn()
}))

vi.mock('../../src/db/requestLog.js', () => ({
  logRequest: vi.fn()
}))

import { hashedKeyLookup } from '../../src/db/keys.js'
import { getUsage, incrementUsage } from '../../src/db/usage.js'
import { logRequest } from '../../src/db/requestLog.js'

import { app } from '../../src/index.js'

// A fake customer row, shaped like what hashedKeyLookup would return from the DB
const fakeCustomer = {
  id: 1,
  key_hash: 'fake-hash',
  customer_id: 'test-customer-uuid',
  plan: 'free',
  monthly_limit: 100,
  max_file_mb: 5,
  is_active: true
}

describe('POST /v1/sanitize (mocked DB — full pipeline)', () => {

  beforeEach(() => {
    vi.clearAllMocks()
    hashedKeyLookup.mockResolvedValue(fakeCustomer) 
    getUsage.mockResolvedValue(0)                    
    incrementUsage.mockResolvedValue(undefined)      
    logRequest.mockResolvedValue(undefined)     
    process.env.RAPIDAPI_PROXY_SECRET = 'test-proxy-secret'     
  })

  it('Sanitizes a valid PNG through the full pipeline', async () => {
    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { Authorization: 'Bearer any-key-the-lookup-is-mocked' },
      body: form
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.detectedType).toBe('image/png')
    expect(data.sanitizedFile).toBeTruthy()
    expect(data.riskLevel).toBeTruthy()

    expect(hashedKeyLookup).toHaveBeenCalledOnce()
    expect(incrementUsage).toHaveBeenCalledOnce()
    expect(logRequest).toHaveBeenCalledOnce()
  })

  it('Rejects a request with no API key (401)', async () => {
    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      body: form // no Authorization header
    })

    expect(res.status).toBe(401) // MISSING_API_KEY
    // Auth short-circuits before the key lookup
    expect(hashedKeyLookup).not.toHaveBeenCalled()
  })

  it('Rejects an invalid API key (401)', async () => {
    hashedKeyLookup.mockResolvedValue(null) // key not found / revoked

    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid-key' },
      body: form
    })

    expect(res.status).toBe(401) // INVALID_API_KEY
  })

  it('Rejects when the customer is over their monthly limit (429)', async () => {
    getUsage.mockResolvedValue(100) // usage equals the limit

    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-key' },
      body: form
    })

    expect(res.status).toBe(429) // OVER_MONTHLY_LIMIT
    // Rate limit blocks before incrementing / sanitizing
    expect(incrementUsage).not.toHaveBeenCalled()
  })

  it('Rejects an unsupported file type (415)', async () => {
    const form = new FormData()
    const fileBuffer = Buffer.from('just some plain text, not a supported file')
    form.append('file', new Blob([fileBuffer]), 'notes.txt')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-key' },
      body: form
    })

    expect(res.status).toBe(415) // UNSUPPORTED_FILE_TYPE
  })

  it('Returns 500 for a corrupt image that fails during sanitization', async () => {
    const realPng = readFileSync('test-fixtures/Sample-png.png')
    const truncated = realPng.subarray(0, 40) // detects as PNG, sharp fails to decode

    const form = new FormData()
    form.append('file', new Blob([truncated]), 'corrupt.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-key' },
      body: form
    })

    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.code).toBe('INTERNAL_SERVER_ERROR')
  })

  it('Treats marketplace traffic (proxy secret) as authenticated', async () => {

    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { 'X-RapidAPI-Proxy-Secret': 'test-proxy-secret' },
      body: form
    })

    expect(res.status).toBe(200)
    // Marketplace path skips the key lookup and the rate-limit increment
    expect(hashedKeyLookup).not.toHaveBeenCalled()
    expect(incrementUsage).not.toHaveBeenCalled()
    // But it still logs the request (with a null customer id)
    expect(logRequest).toHaveBeenCalledOnce()
  })

})