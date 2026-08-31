import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import 'dotenv/config'
import { app } from '../../src/index.js'  // the exported app (no server starts)

const TEST_KEY = process.env.TEST_API_KEY

describe('POST /v1/sanitize', () => {

  it('Rejects a request with no API key', async () => {
    // build a multipart form with a file
    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      body: form
      // no Authorization header
    })

    expect(res.status).toBe(401)  // MISSING_API_KEY
  })

  it('Sanitizes a valid PNG with a valid key', async () => {
    const form = new FormData()
    const fileBuffer = readFileSync('test-fixtures/Sample-png.png')
    form.append('file', new Blob([fileBuffer]), 'Sample-png.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_KEY}` },
      body: form
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.detectedType).toBe('image/png')
    expect(data.sanitizedFile).toBeTruthy()      // got a base64 file back
    expect(data.riskLevel).toBeTruthy()          // got a risk level
  })

  it('Rejects an unsupported file type', async () => {
    const form = new FormData()
    // a .txt file — not a supported type
    const fileBuffer = Buffer.from('just some plain text, not a supported file')
    form.append('file', new Blob([fileBuffer]), 'notes.txt')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_KEY}` },
      body: form
    })

    expect(res.status).toBe(415)  // UNSUPPORTED_FILE_TYPE
  })

  it('Returns 500 for a corrupt image that fails during sanitization', async () => {
    const realPng = readFileSync('test-fixtures/Sample-png.png')
    // Keep the header (detects as PNG) but truncate the image data so sharp fails.
    const truncated = realPng.subarray(0, 40)

    const form = new FormData()
    form.append('file', new Blob([truncated]), 'corrupt.png')

    const res = await app.request('/v1/sanitize', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_KEY}` },
      body: form
    })

    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.code).toBe('INTERNAL_SERVER_ERROR')
  })

})