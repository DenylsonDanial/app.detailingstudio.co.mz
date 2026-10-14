export  const stripBase64Prefix = (dataUrl : string) => {
  const commaIndex = dataUrl.indexOf(',');
  return commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

export const  parseBase64DataUrl = (dataUrl : string) =>  {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) return { mimeType: null, base64: dataUrl };

  return {
    mimeType: match[1],
    base64: match[2]
  };
}
