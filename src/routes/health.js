import { supabase } from "../db/client.js"

export const health = async (c) => {
    const { error } = await supabase
      .from('usage_counts')
      .select('id')
      .limit(1)
      if (!error) {
        return c.json({ status: "ok" , DB: "online"})
      } else {
        return c.json({ status: "error" , DB: "unreachable"}, 503 )  
      }
}