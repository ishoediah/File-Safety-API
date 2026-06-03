//defining supported MIME types, formula injecton triggers, SVG blocked tags and attributes. All as an array

const supportedMIMETypes = ['image/svg+xml', 'image/jpeg', 'text/csv', 'image/png', 'image/webp','image/gif']

const formulaInjectionTriggers = ['=', '+', '-', '@', '\t', '\n', '\r']

const blockedSVGTags = ['script', 'iframe', 'foreignObject', '<use>', '<!ENTITY>', '<foreignObject>']

const blockedSVGAtrributes = ['onload', 'onmouseover', 'onclick', 'onerror','xlink:href', 'externalResourcesRequired', 'onfocus', 'onbegin ', 'onmousemove', 'onmousedown', 'onend']
//on = on event handlers

export {supportedMIMETypes, formulaInjectionTriggers, blockedSVGAtrributes, blockedSVGTags}