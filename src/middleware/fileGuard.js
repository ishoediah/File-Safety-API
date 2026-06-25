import { errors } from "../core/errors.js"
import { returnError } from "../core/errors.js"
import { createMiddleware } from "hono/factory"
import plans from "../config/plans.js"

export const fileGuard = createMiddleware( async (c,next) => {

    const customer = c.get('customer')

    const body = await c.req.parseBody()
    const file = body['file']

    if(!(file instanceof File)){
        return returnError(c, errors.NO_FILE_PROVIDED)
    }

    let limit

    if(c.get("isMarketplace")) {
        limit = plans.business.fileSizeCap
    } else {
        limit = customer.max_file_mb * 1024 * 1024
    }

    if (file.size > limit){
        return returnError(c, errors.FILE_TOO_LARGE)
    } else {
        await next()
    }
})