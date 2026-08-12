import DOMPurify from 'isomorphic-dompurify'
import {blockedSVGTags, blockedSVGAttributes} from '../config/constants.js'

function sanitizeSvg(buffer) {
    const findings  = []
    let sanitized

    try {
        const dirty = buffer.toString('utf-8')
        const clean = DOMPurify.sanitize(dirty, {
            USE_PROFILES: { svg: true, svgFilters: true},
            FORBID_TAGS: blockedSVGTags,
            FORBID_ATTR: blockedSVGAttributes
        })
        sanitized = Buffer.from(clean, 'utf-8')
        for( let i = 0; i < DOMPurify.removed.length; i++){
            findings.push(DOMPurify.removed[i])
        }
    } catch(err) {
        return { sanitized : null, findings, error: true}
    }

    return {sanitized, findings}
}

export {sanitizeSvg}