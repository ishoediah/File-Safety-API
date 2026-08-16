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
    expect(result.sanitized.toString('utf-8')).toContain("'=SUM")
  })
  it('Csv with no injection triggers should have no findings' , () => {
    const buffer = readFileSync('test-fixtures/Sample-csv.csv')
    const result = sanitizeCsv(buffer)
    expect(result.findings.length).toBe(0)
  })

  it('Handles a malformed CSV without crashing', () => {
  // ragged rows + blank lines — the kind of mess real files have
  const messy = 'a,b,c\n1,2\n3,4,5,6\n\n\n7,8,9'
  const buffer = Buffer.from(messy)
  const result = sanitizeCsv(buffer)

  // it should NOT crash, and should return a valid result (not the error shape)
  expect(result.error).toBeFalsy()
  expect(result.sanitized).not.toBe(null)
  })

  it('Returns error shape when parsing genuinely fails', () => {
  // a malformed quoted field that the parser cannot recover from
  const broken = 'a,"b\n"unterminated" quote"mess,c'
  const buffer = Buffer.from(broken)
  const result = sanitizeCsv(buffer)
  // if it errors, it should return the standard error shape
  expect(result.error).toBe(true)
  })
})