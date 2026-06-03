//defining supported MIME types, formula injecton triggers, SVG blocked tags and attributes. All as an array

const supportedMIMETypes = ['image/svg+xml', 'image/jpeg', 'text/csv', 'image/png', 'image/webp','image/gif']

const formulaInjectionTriggers = ['=', '+', '-', '@', '\t', '\n', '\r']

const blockedSVGTagsAndAtrributes = ['script', '<iframe', 'on', 'onclick', '<foreignObject>', '<use>', '<iframe>']
//on = on event handlers

export default supportedMIMETypes
export default formulaInjectionTriggers
export default blockedSVGTagsAndAtrributes