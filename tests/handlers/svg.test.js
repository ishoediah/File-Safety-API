import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { sanitizeSvg } from '../../src/handlers/svg.js'

describe('sanitizeSvg', () => {

  it('Removes script tags from a malicious SVG', () => {
    const buffer = readFileSync('test-fixtures/malicious.svg')
    const result = sanitizeSvg(buffer)
    const output = result.sanitized.toString('utf-8')
    expect(output).not.toContain('<script')   // script must be gone
  })

  it('Removes event handlers from a malicious SVG', () => {
    const buffer = readFileSync('test-fixtures/malicious.svg')
    const result = sanitizeSvg(buffer)
    const output = result.sanitized.toString('utf-8')
    expect(output).not.toContain('onclick')    // event handler must be gone
  })

  it('Removes javascript: URLs', () => {
    const buffer = readFileSync('test-fixtures/malicious.svg')
    const result = sanitizeSvg(buffer)
    const output = result.sanitized.toString('utf-8')
    expect(output).not.toContain('javascript:') // dangerous URI must be gone
  })

  it('Preserves legitimate SVG content', () => {
    const buffer = readFileSync('test-fixtures/malicious.svg')
    const result = sanitizeSvg(buffer)
    const output = result.sanitized.toString('utf-8')
    expect(output).toContain('circle')          // the safe circle survives
  })

  it('Produces findings for dangerous content', () => {
    const buffer = readFileSync('test-fixtures/malicious.svg')
    const result = sanitizeSvg(buffer)
    expect(result.findings.length).toBeGreaterThan(0)  // it reported what it stripped
  })

  it('Returns a buffer and no error for a clean SVG', () => {
    const buffer = readFileSync('test-fixtures/Sample-svg.svg')
    const result = sanitizeSvg(buffer)
    expect(result.sanitized).toBeInstanceOf(Buffer)
    expect(result.error).toBeFalsy()
  })

})