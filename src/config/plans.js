//configuring the plans

const plans = {
    'free': {
        monthlyCalls: 100,
        fileSizeCap: 5 * 1024 * 1024, //5 MB = 5 * 1024 * 1024 = 5,242,880 bytes, want javascript werkt met bytes. bij de andere is het hetzelfde methodiek alleen met 10, 50 en 100 bytes respectievelijk
        callsPerSecond: 1
    },
    'basic' : {
        monthlyCalls: 1000,
        fileSizeCap: 10 * 1024 * 1024,
        callsPerSecond: 5
    },
    'pro' : {
        monthlyCalls: 10000,
        fileSizeCap: 50 * 1024 * 1024,
        callsPerSecond: 20
    },
    'business' : {
        monthlyCalls: 100000,
        fileSizeCap: 100 * 1024 * 1024,
        callsPerSecond: 50
    }
}

export default plans;