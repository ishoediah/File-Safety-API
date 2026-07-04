const handlerMap = {
    'image/jpeg' : 'image',
    'image/png' : 'image',
    'image/webp' : 'image',
    'image/gif' : 'image',
    'text/csv' : 'csv',
    'image/svg+xml' : 'svg',
}

function routeToHandler(detectedType) {
    const handler = handlerMap[detectedType]
    return handler || null
}

export {routeToHandler}
