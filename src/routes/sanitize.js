import { detectFileType } from "../core/detectType.js";
import { routeToHandler } from "../core/router.js";
import { returnError, errors } from "../core/errors.js";
import { sanitizeCsv } from "../handlers/csv.js";
import { sanitizeImage } from "../handlers/image.js";
import { sanitizeSvg } from "../handlers/svg.js";
import { scoreFindings } from "../core/scorer.js";

export const sanitize = async(c) => {

    //const customer = c.get('customer') will be added here for direct traffic
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
    const result = await handlerFunction(buffer)

    if (result.error) {
        return returnError(c, errors.INTERNAL)
    }

    const score = scoreFindings(result.findings)
    const base64File = result.sanitized.toString('base64')
    return c.json({
        detectedType: fileType,
        riskLevel: score.highest,
        findingsCount: score.found,
        findings: result.findings,
        sanitizedFile: base64File,
        announcements: null   // reserved for future product notifications ( will be used when dirreclty selling the api)
    })
}