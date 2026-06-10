import { supabase } from './client.js'
import crypto from 'node:crypto'


async function hashedKeyLookup(rawkey) {
    const hashedKey = crypto.createHash('sha256').update(rawkey).digest('hex')

    const {data, error} = await supabase
    .from('api_keys')
    .select('*')
    .eq("key_hash", hashedKey)
    .eq("is_active", true)
    .single()

    if( data == null || error != null){
        return null
    } 

    return data

}

export {hashedKeyLookup} ;