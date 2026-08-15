import { Hono } from "hono";
import {serve} from "@hono/node-server"
import {auth} from './middleware/auth.js'
import { rateLimit } from "./middleware/rateLimit.js"
import { fileGuard } from "./middleware/fileGuard.js";
import { sanitize } from "./routes/sanitize.js";

const PORT = 3000;

const app = new Hono()

app.use('/v1/*', auth)
app.use('/v1/*', rateLimit)
app.use('/v1/*', fileGuard)

app.post('/v1/sanitize', sanitize) //after middelware because middleware runs first

app.get('/v1/health', (c) => {
    return c.json({status : "ok"})
})

serve({
    fetch: app.fetch,
    port: PORT
}, (info) =>{
    console.log(`App is running on port ${PORT}`)
})


