import {describe, it, expect} from 'vitest'
import { readFileSync } from 'node:fs'
import {detectFileType} from '../../src/core/detectType.js'

describe('detectFileType', ()=>{
    it("Detect PNG from magic-bytes", async ()=>{
        const buffer = readFileSync('test-fixtures/Sample-png.png')
        const result = await detectFileType(buffer)
        expect(result).toBe('image/png')
    })

})