// General Error

const error_ROUTE_NOT_FOUND = {
    error: 404,
    description: "Route not found",
    doc_URL: "",
    request_ID: "String"
}

// Internal Error

const error_INTERNAL = {
    error: 500,
    description: "Internal Server Error",
    doc_URL: "",
    request_ID: "String"
}

// Authentication errors

const error_MISSING_API_KEY = {
    error: 401,
    description: "Missing API key, no auth provided",
    doc_URL: "",
    request_ID: "String"
}

const error_INVALID_API_KEY = {
    error: 401,
    description: "Invalid API key, not found or revoked",
    doc_URL: "",
    request_ID: "String"
}

const error_INVALID_PROXY_SECRET = {
    error: 400,
    description: "Bad Proxy Request",
    doc_URL: "",
    request_ID: "String"
}

// Rate/Usage errors

const error_OVER_MONTHLY_LIMIT = {
    error: 429,
    description: "Over monthly limit, too many requests",
    doc_URL: "",
    request_ID: "String"
}

const error_OVER_SECONDLY_LIMIT = {
    error: 429,
    description: "Too many requests per second",
    doc_URL: "",
    request_ID: "String"
}

// File errors

const error_NO_FILE_PROVIDED = {
    error: 400,
    description: "Bad request, no file provided",
    doc_URL: "",
    request_ID: "String"
}

const error_FILE_TO_LARGE = {
    error: 400,
    description: "Payload size too large",
    doc_URL: "",
    request_ID: "String"
}
const error_UNSUPPORTED_FILE_TYPE = {
    error: 415,
    description: "Unsupported Media Type",
    doc_URL: "",
    request_ID: "String"
}

// Helper function

function returnERROR(error) {
   return JSON.stringify(error)
}

