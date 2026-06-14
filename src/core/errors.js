// General Error

const error_ROUTE_NOT_FOUND = {
    error: 404,
    description: "Route not found",
    doc_URL: "",
    request_ID: "String"
}

function returnERROR(error) {
   return JSON.stringify(error)
}

console.log(returnERROR(error_ROUTE_NOT_FOUND))
