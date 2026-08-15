import { detectFileType } from "../core/detectType.js";
import { routeToHandler } from "../core/router.js";
import { returnError } from "../core/errors.js";
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

    // temporary — confirm stage 1 works
    console.log('detected type:', fileType)
    console.log('handler:', handler)

    return c.json({ fileType, handler })  // temporary response to test

}