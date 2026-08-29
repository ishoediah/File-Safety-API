import { supabase } from './client.js'

export async function logRequest(customerId, mimeType, safetyScore) {
    try {
        const { error } = await supabase
            .from('request_log')
            .insert({
                customer_id: customerId,   // real ID for direct, null for marketplace
                MIME_type: mimeType,       // the detected file type
                safety_score: safetyScore  // the risk level string
                // created_at is omitted — the DB defaults it to now()
            })
            if (error) console.error('Failed to log request:', error)
    } catch (err) {
        // best-effort logging — never let a logging failure break the request
        console.error('Failed to log request:', err)
    }
}