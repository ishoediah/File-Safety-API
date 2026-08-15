import sharp from 'sharp';

sharp.block({ operation: ["VipsForeignLoadTiff", "VipsForeignLoadVips"] });

async function sanitizeImage(buffer) {
    const findings = []
    let sanitized

    try{

        const metadata = await sharp(buffer).metadata()

        if(metadata.exif) {
            findings.push({ type: 'exif', category: 'metadata',  action: 'removed EXIF metadata'})
        }
        if(metadata.iptc) {
            findings.push({ type: 'iptc', category: 'metadata',  action: 'removed IPTC metadata'})
        }
        if(metadata.xmp) {
            findings.push({ type: 'xmp', category: 'metadata', action: 'removed XMP metadata'})
        }

        sanitized = await sharp(buffer).toBuffer()

    } catch (err) {
        return { sanitized: null, findings, error: true}
    }

    return {sanitized, findings}
}

export { sanitizeImage }