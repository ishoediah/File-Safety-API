import 'dotenv/config';
import { createClient } from '@supabase/supabase-js'

const supabaseURL = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export const supabase = createClient(supabaseURL, supabaseServiceKey)