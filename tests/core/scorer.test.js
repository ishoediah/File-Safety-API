import { describe, it, expect } from 'vitest'
import { scoreFindings } from '../../src/core/scorer.js'

describe('scoreFindings', () => {

  it('Returns CLEAN when there are no findings', () => {
    const result = scoreFindings([])
    expect(result.highest).toBe('CLEAN')
    expect(result.found).toBe(0)
  })

  it('Returns LOW for metadata-only findings', () => {
    const findings = [{ category: 'metadata' }]
    const result = scoreFindings(findings)
    expect(result.highest).toBe('LOW')
  })

  it('Returns MEDIUM for formula injection', () => {
    const findings = [{ category: 'formula_injection' }]
    const result = scoreFindings(findings)
    expect(result.highest).toBe('MEDIUM')
  })

  it('Returns HIGH for XSS findings', () => {
    const findings = [{ category: 'xss' }]
    const result = scoreFindings(findings)
    expect(result.highest).toBe('HIGH')
  })

  it('Returns the HIGHEST severity when findings are mixed', () => {
    const findings = [
      { category: 'metadata' },      // LOW
      { category: 'formula_injection' }, // MEDIUM
      { category: 'xss' }            // HIGH  , this should win
    ]
    const result = scoreFindings(findings)
    expect(result.highest).toBe('HIGH')
  })

  it('Counts the number of findings', () => {
    const findings = [{ category: 'metadata' }, { category: 'xss' }]
    const result = scoreFindings(findings)
    expect(result.found).toBe(2)
  })

})