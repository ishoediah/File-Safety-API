import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'
import { blockedSVGTags, blockedSVGAttributes } from '../config/constants.js'

const SVG_MAX_SIZE = 5 * 1024 * 1024
const SVG_MAX_ELEMENTS = 5000

function sanitizeSvg(buffer) {
    const findings = []
    let sanitized

    if (buffer.length > SVG_MAX_SIZE) {
        return { sanitized: null, findings: [], error: true, reason: 'too_large' }
    }

    const svgString = buffer.toString('utf-8')

    // Quick structural check for excessive elements to protect jsdom parsing
    const elementCount = (svgString.match(/<[a-zA-Z]/g) || []).length
    if (elementCount > SVG_MAX_ELEMENTS) {
        return { sanitized: null, findings: [], error: true, reason: 'svg_too_complex' }
    }

    let window

    try {
        window = new JSDOM('<!DOCTYPE html>').window
        const DOMPurify = createDOMPurify(window)
        
        const clean = DOMPurify.sanitize(svgString, {
            USE_PROFILES: { svg: true, svgFilters: true },
            FORBID_TAGS: blockedSVGTags,
            FORBID_ATTR: blockedSVGAttributes
        })
        
        sanitized = Buffer.from(clean, 'utf-8')
        
        // Optimized mapping for removed objects
        if (DOMPurify.removed && DOMPurify.removed.length > 0) {
            DOMPurify.removed.forEach(item => {
                findings.push({
                    category: 'xss',
                    action: 'removed dangerous content',
                    // Safe string conversion fallback if DOMPurify returns an object node
                    detail: item.element ? item.element.tagName : String(item) 
                })
            })
        }
        
    } catch (err) {
        return { sanitized: null, findings, error: true }
    } finally {
        if (window && typeof window.close === 'function') {
            window.close() 
        }
    }

    return { sanitized, findings }
}

export { sanitizeSvg }
