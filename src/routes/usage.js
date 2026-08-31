import { getUsage } from "../db/usage.js";
import { returnError, errors } from "../core/errors.js";

export const usage = async (c) => {

    try{
    const customer = c.get('customer')
    const month = new Date().toISOString().slice(0, 7)

    const used = await getUsage(customer.customer_id, month)

    return c.json({
        plan: customer.plan,
        used: used,
        limit: customer.monthly_limit,
        remaining: customer.monthly_limit - used,
        month: month
    })
    } catch(err) {
        return returnError(c, errors.INTERNAL_SERVER_ERROR)
    }
}