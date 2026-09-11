import sharp from 'sharp';

sharp.block({ operation: ["VipsForeignLoadTiff", "VipsForeignLoadVips"] });

const pixelLimit = 24000000 //24 Megapixels
const timeOutSeconds = 10

async function sanitizeImage(buffer) {
    const findings = []
    let sanitized

    try{

        const metadata = await sharp(buffer, { limitInputPixels: pixelLimit }).metadata()

        if(metadata.width && metadata.height && metadata.width * metadata.height > pixelLimit) {
                    return { sanitized: null, findings, error: true, reason: "image_too_complex"}
        }

        if(metadata.exif) {
            findings.push({ type: 'exif', category: 'metadata',  action: 'removed EXIF metadata'})
        }
        if(metadata.iptc) {
            findings.push({ type: 'iptc', category: 'metadata',  action: 'removed IPTC metadata'})
        }
        if(metadata.xmp) {
            findings.push({ type: 'xmp', category: 'metadata', action: 'removed XMP metadata'})
        }

        sanitized = await sharp(buffer, { limitInputPixels: pixelLimit }).timeout({seconds: timeOutSeconds}).toBuffer()

    } catch (err) {

        if(err.message && err.message.toLowerCase().includes('timeout')){
            return { sanitized: null, findings, error: true, reason: 'timeout' }
        }
        if(err.message && err.message.toLowerCase().includes('pixel')){
            return { sanitized: null, findings, error: true, reason: 'image_too_complex' } 
        }
        return { sanitized: null, findings, error: true}
    }

    return {sanitized, findings}
}

export { sanitizeImage }