import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { auth } from './middleware/auth.js'
import { rateLimit } from "./middleware/rateLimit.js"
import { fileGuard } from "./middleware/fileGuard.js"
import { sanitize } from "./routes/sanitize.js"
import { health } from "./routes/health.js"
import { usage } from "./routes/usage.js"

const PORT = process.env.PORT || 3000
const app = new Hono()

app.get('/v1/health', health)

app.get('/v1/usage', auth, usage)

// runs in order: auth -> ratelimit etc
app.post('/v1/sanitize', auth, rateLimit, fileGuard, sanitize)

// exporting the app so tests can import it without starting a server
export { app }

// only start the server when this file is run directly (node src/index.js), not when it's imported by a test
if (process.env.NODE_ENV !== 'test') {
    const server = serve({
        fetch: app.fetch,
        port: PORT
    }, (info) => {
        console.log(`App is running on port ${PORT}`)
    })

    process.on('SIGTERM', () => {
        server.close(() => process.exit(0))
    })
}