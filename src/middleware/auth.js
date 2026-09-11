import "dotenv/config"
import { errors } from "../core/errors.js"; 
import { returnError } from "../core/errors.js";
import {hashedKeyLookup} from "../db/keys.js";
import { createMiddleware } from "hono/factory";
import crypto from "node:crypto";

// Constant time string comparison that wont throw on length mismatch
function safeEqual(a,b) {
    if( typeof a !== 'string' || typeof b !== 'string') return false
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if ( bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
}

export const auth = createMiddleware(async (c, next) => {

    const capturedHeader = c.req.header('Authorization')
    const expectedSecret = process.env.RAPIDAPI_PROXY_SECRET
    const proxySecret = c.req.header('X-RapidAPI-Proxy-Secret')

    if( proxySecret != null) {
        if ( expectedSecret && safeEqual(expectedSecret, proxySecret)) {
            c.set('isMarketplace', true)
            await next()
            return;
        }

        return returnError(c, errors.INVALID_PROXY_SECRET)
    }

    if (capturedHeader == null) {
        return returnError(c, errors.MISSING_API_KEY)
    }
    
    const strippedHeader = capturedHeader.replace("Bearer ", "")

    const headerLookup = await hashedKeyLookup(strippedHeader)

    if (headerLookup == null){
        return returnError(c, errors.INVALID_API_KEY)
    } else { 
        c.set('customer', headerLookup)
        await next()
    }
})