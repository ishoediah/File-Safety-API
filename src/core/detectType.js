import { fileTypeFromBuffer } from 'file-type';

async function detectFileType(buffer) {
  const typeResult = await fileTypeFromBuffer(buffer);

  const textContent = buffer.toString('utf-8');

  if (textContent.includes('<svg') || textContent.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return 'image/svg+xml';
  }

  if (typeResult) {
    return typeResult.mime;
  }

  if (textContent.includes(',') && textContent.split('\n').length > 1) {
    return 'text/csv';
  }
  
  return null;
}

export { detectFileType };
