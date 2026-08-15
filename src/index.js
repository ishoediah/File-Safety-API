import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { auth } from './middleware/auth.js'
import { rateLimit } from "./middleware/rateLimit.js"
import { fileGuard } from "./middleware/fileGuard.js"
import { sanitize } from "./routes/sanitize.js"
import { health } from "./routes/health.js"
import { usage } from "./routes/usage.js"

const PORT = 3000
const app = new Hono()

app.get('/v1/health', health)

app.get('/v1/usage', auth, usage)

// runs in order: auth -> ratelimit etc
app.post('/v1/sanitize', auth, rateLimit, fileGuard, sanitize)

serve({
        fetch: app.fetch,
        port: PORT
    }, (info) => {
        console.log(`App is running on port ${PORT}`)
    })
