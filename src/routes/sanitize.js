import { detectFileType } from "../core/detectType.js";
import { routeToHandler } from "../core/router.js";
import { returnError, errors } from "../core/errors.js";
import { sanitizeCsv } from "../handlers/csv.js";
import { sanitizeImage } from "../handlers/image.js";
import { sanitizeSvg } from "../handlers/svg.js";
import { scoreFindings } from "../core/scorer.js";
import { logRequest } from "../db/requestLog.js";
import { limit, hasCapacity } from "../core/limiter.js"

const timeOutMS = 15000

function timeOut(ms) {
    return new Promise((_, reject) => {
        setTimeout(()=> reject(new Error('Pipeline Timeout')), ms)
    })
}

export const sanitize = async(c) => {

    if ( !hasCapacity()) {
        return returnError(c, errors.SERVER_BUSY)
    }

    try {
    const customer = c.get('customer')
    const customerId = customer ? customer.customer_id : null
    const body = await c.req.parseBody()
    const file = body['file']
    const buffer = Buffer.from(await file.arrayBuffer())

    const fileType = await detectFileType(buffer)
    const handler = routeToHandler(fileType)

    if (handler === null) {
        return returnError(c, errors.UNSUPPORTED_FILE_TYPE)
    }

    const handlerFunctions = {
        image: sanitizeImage,
        csv: sanitizeCsv,
        svg: sanitizeSvg
    }

    const handlerFunction = handlerFunctions[handler]
    
    const result = await Promise.race([
        limit( ()=> handlerFunction(buffer)),
        timeOut(timeOutMS)
    ])

    if (result.error) {
        if (result.reason === 'timeout') {
            return returnError(c, errors.PROCESSING_TIMEOUT)
        }
        if (result.reason === 'too_large') {
            return returnError(c, errors.FILE_TOO_LARGE)
        }
        if (result.reason === 'image_too_complex') {
            return returnError(c, errors.IMAGE_TOO_COMPLEX)
        }
        if (result.reason === 'csv_too_complex') {
            return returnError(c, errors.CSV_TOO_COMPLEX)
        }
        if (result.reason === 'svg_too_complex') {
            return returnError(c, errors.SVG_TOO_COMPLEX)
        }
        return returnError(c, errors.INTERNAL_SERVER_ERROR)
    }

    const score = scoreFindings(result.findings)
    const base64File = result.sanitized.toString('base64')
    await logRequest(customerId, fileType, score.highest)
    return c.json({
        detectedType: fileType,
        riskLevel: score.highest,
        findingsCount: score.found,
        findings: result.findings,
        sanitizedFile: base64File,
        announcements: null   // reserved for future product notifications ( will be used when dirreclty selling the api)
    })
    } catch(err) {
        if (err.message === 'Pipeline Timeout') {
        return returnError(c, errors.PROCESSING_TIMEOUT)
    }
        return returnError(c, errors.INTERNAL_SERVER_ERROR)
    }
}