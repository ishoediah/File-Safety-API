import { supabase } from './client.js'

async function getUsage(customerID, month) {

    const {data, error} = await supabase
    .from('usage_counts')
    .select('*')
    .eq('customer_id', customerID)
    .eq('month', month)
    .single()

    if( data != null){
        return data.count
    }

    return 0;
}

async function incrementUsage(customerID, month) {
    const {error} = await supabase.rpc('increment_usage', {p_customer_id: customerID, p_month: month})
    if(error){
        console.log(error)
    }
}

export { getUsage, incrementUsage}