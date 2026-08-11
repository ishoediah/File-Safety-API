import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { sanitizeImage } from '../../src/handlers/image.js'
import sharp from 'sharp'

describe('sanitizeImage', () => {

    it('sanitizes a valid image and returns a buffer', async () => {
    const buffer = readFileSync('test-fixtures/Sample-png.png')
    const result = await sanitizeImage(buffer)
    expect(result.sanitized).toBeInstanceOf(Buffer)
    expect(result.error).toBeFalsy()
    })
    it('Produces findings for an image that contains metadata', async () => {
    const buffer = readFileSync('test-fixtures/Sample-with-exif.jpg')  // <-- your photo with EXIF/GPS
    const result = await sanitizeImage(buffer)
    expect(result.findings.length).toBeGreaterThan(0)  // at least one metadata type removed
    })

    it('Strips the metadata so the sanitized image has none', async () => {
    const buffer = readFileSync('test-fixtures/Sample-with-exif.jpg')
    const result = await sanitizeImage(buffer)
    const cleanedMeta = await sharp(result.sanitized).metadata()
    expect(cleanedMeta.exif).toBeUndefined()
    })

    it('returns error shape for invalid image data', async () => {
    const buffer = Buffer.from('test-fixtures/Sample-csv.csv')
    const result = await sanitizeImage(buffer)
    expect(result.error).toBe(true)
    expect(result.sanitized).toBe(null)
    })

})