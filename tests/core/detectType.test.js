import {describe, it, expect} from 'vitest'
import { readFileSync } from 'node:fs'
import {detectFileType} from '../../src/core/detectType.js'

describe('detectFileType', ()=>{
    it("Detect PNG from magic-bytes", async ()=>{
        const buffer = readFileSync('test-fixtures/Sample-png.png')
        const result = await detectFileType(buffer)
        expect(result).toBe('image/png')
    })
    it("Detect JPEG from magic-bytes", async ()=>{
        const buffer = readFileSync('test-fixtures/Sample-jpeg.jpg')
        const result = await detectFileType(buffer)
        expect(result).toBe('image/jpeg')
    })
    it("Detect CSV from magic-bytes", async ()=>{
        const buffer = readFileSync('test-fixtures/Sample-csv.csv')
        const result = await detectFileType(buffer)
        expect(result).toBe('text/csv')
    })
    it("Detect SVG from magic-bytes", async ()=>{
        const buffer = readFileSync('test-fixtures/Sample-svg.svg')
        const result = await detectFileType(buffer)
        expect(result).toBe('image/svg+xml')
    })
    it("Detect correct file type from a renamed file (.jpg renamend to .png)", async ()=>{
        const buffer = readFileSync('test-fixtures/Spoofing-sample.png')
        const result = await detectFileType(buffer)
        expect(result).toBe('image/jpeg')
    })

})