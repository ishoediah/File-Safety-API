import { Hono } from "hono";
import {serve} from "@hono/node-server"

const PORT = 3000;

const app = new Hono()

serve({
    fetch: app.fetch,
    port: PORT
}, (info) =>{
    console.log(`App is running on port ${PORT}`)
})

app.get('/v1/health', (c) => {
    return c.json({status : "ok"})
})