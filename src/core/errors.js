const errors = {

   //General Error

   ROUTE_NOT_FOUND : { 
    code: "ROUTE_NOT_FOUND",
    status: 404, 
    description: "Route not found", 
    doc_URL: "",
    request_ID: "String"
    },

   //Internal Error

   INTERNAL_SERVER_ERROR : {
    code: "INTERNAL_SERVER_ERROR",
    status: 500, 
    description: "Internal Server Error", 
    doc_URL: "", 
    request_ID: "String"
    },

   // Authentication errors

   MISSING_API_KEY : {
    code: 'MISSING_API_KEY',
    status: 401, 
    description: "Missing API key, no auth provided", 
    doc_URL: "", 
    request_ID: "String"
    },

   INVALID_API_KEY : {
    code:"INVALID_API_KEY",
    status: 401,
    description: "Invalid API key, not found or revoked",
    doc_URL: "",
    request_ID: "String"
    },

   INVALID_PROXY_SECRET : {
    code:'INVALID_PROXY_SECRET',
    status: 403,
    description: "Bad Proxy Request",
    doc_URL: "",
    request_ID: "String"
    },

    // Rate/Usage errors

   OVER_MONTHLY_LIMIT : {
    code:"OVER_MONTHLY_LIMIT",
    status: 429,
    description: "Over monthly limit, too many requests",
    doc_URL: "",
    request_ID: "String"
    },

   OVER_SECONDLY_LIMIT : {
    code:"OVER_SECONDLY_LIMIT",
    status: 429,
    description: "Too many requests per second",
    doc_URL: "",
    request_ID: "String"
    },
    
    // File errors

   NO_FILE_PROVIDED : {
    code:"NO_FILE_PROVIDED",
    status: 400,
    description: "Bad request, no file provided",
    doc_URL: "",
    request_ID: "String"
    },

   FILE_TOO_LARGE : {
    code:"FILE_TOO_LARGE",
    status: 413,
    description: "Payload size too large",
    doc_URL: "",
    request_ID: "String"
    },

   UNSUPPORTED_FILE_TYPE : {
    code:"UNSUPPORTED_FILE_TYPE",
    status: 415,
    description: "Unsupported Media Type",
    doc_URL: "",
    request_ID: "String"
    }
}

// Helper function

function returnError(c, error, details = {}) {
    const errorObject = {...error, ...details}
    return c.json(errorObject, error.status)
}

export {errors, returnError}

