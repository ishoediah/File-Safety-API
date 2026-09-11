import DOMPurify from 'isomorphic-dompurify'
import {blockedSVGTags, blockedSVGAttributes} from '../config/constants.js'

const SVG_MAX_SIZE = 5 * 1024 * 1024
const SVG_MAX_ELEMENTS = 5000

function sanitizeSvg(buffer) {
    const findings  = []
    let sanitized

    if(buffer.length > SVG_MAX_SIZE) {
        return { sanitized: null, findings : [], error: true, reason : 'too_large'}
    }

    const svgString = buffer.toString('utf-8')

    const elementCount = (svgString.match(/<[a-zA-Z]/g) || []).length
    if( elementCount > SVG_MAX_ELEMENTS){
        return { sanitized: null, findings : [], error: true, reason : 'svg_too_complex'}
    }

    try {
        const clean = DOMPurify.sanitize(svgString, {
            USE_PROFILES: { svg: true, svgFilters: true},
            FORBID_TAGS: blockedSVGTags,
            FORBID_ATTR: blockedSVGAttributes
        })
        sanitized = Buffer.from(clean, 'utf-8')
        for( let i = 0; i < DOMPurify.removed.length; i++){
            findings.push({
                category: 'xss',
                action: 'removed dangerous content',
                detail: DOMPurify.removed[i]
            })
        }
    } catch(err) {
        return { sanitized : null, findings, error: true}
    }

    return {sanitized, findings}
}

export {sanitizeSvg}