import {getUsage} from "../db/usage.js"
import { incrementUsage } from "../db/usage.js"
import { errors } from "../core/errors.js"
import { returnError } from "../core/errors.js"
import { createMiddleware } from "hono/factory"

export const rateLimit = createMiddleware(async (c,next) => {

    if (c.get('isMarketplace')) {
    await next()
    return;
    }

    const customer = c.get('customer')
    const currentDate = new Date().toISOString().slice(0, 7)

    const usage = await getUsage(customer.customer_id, currentDate)

    if( usage >= customer.monthly_limit){
        return returnError(c, errors.OVER_MONTHLY_LIMIT)
    } else{
        await incrementUsage(customer.customer_id, currentDate)
        await next()
    }
})
