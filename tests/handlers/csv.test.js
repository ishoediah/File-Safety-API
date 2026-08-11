import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { sanitizeCsv } from '../../src/handlers/csv.js'

describe('sanitizeCsv', () => {
  it('Neutralizes all formula-injection cells', () => {
    const buffer = readFileSync('test-fixtures/injection-sample.csv')
    const result = sanitizeCsv(buffer)
    expect(result.findings.length).toBe(4)  // four dangerous cells
  })
  it('See if `=SUM` with the apostrofe is included in the sanitized list' , () => {
    const buffer = readFileSync('test-fixtures/injection-sample.csv')
    const result = sanitizeCsv(buffer)
    expect(result.sanitized).toContain("'=SUM")
  })
  it('Csv with no injection triggers should have no findings' , () => {
    const buffer = readFileSync('test-fixtures/Sample-csv.csv')
    const result = sanitizeCsv(buffer)
    expect(result.findings.length).toBe(0)
  })
})