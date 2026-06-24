import "dotenv/config"
import { errors } from "../core/errors.js"; 
import { returnError } from "../core/errors.js";
import {hashedKeyLookup} from "../db/keys.js";
import { createMiddleware } from "hono/factory";

export const auth = createMiddleware(async (c, next) => {

    const capturedHeader = c.req.header('Authorization')

    if (c.req.header('X-RapidAPI-Proxy-Secret') == process.env.RAPIDAPI_PROXY_SECRET) {
        c.set('isMarketplace', true)
        await next()
        return;
    }else if( capturedHeader == null ) {
        return returnError(c, errors.MISSING_API_KEY);
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

