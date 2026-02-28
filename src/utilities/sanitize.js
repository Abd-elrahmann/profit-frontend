import DOMPurify from "dompurify";
export const sanitizeValue = (value) =>
  DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
export const isValidTemplate = (html) => {
  if (!html || typeof html !== 'string') return false;
  const dangerousPatterns = [
    /<script/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /vbscript:/i,
    /data:\s*text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /<form/i,
    /<input/i,
    /<textarea/i,
    /<select/i,
    /<button/i,
    /<meta/i,
    /<link/i
  ];
  if (/<style/i.test(html)) {
    const dangerousCssPatterns = [
      /@import/i,
      /url\s*\(/i,
      /expression\s*\(/i,
      /javascript:/i,
      /vbscript:/i
    ];
    if (dangerousCssPatterns.some(pattern => pattern.test(html))) {
      return false;
    }
  }
  return !dangerousPatterns.some(pattern => pattern.test(html));
};
export const injectContractData = (template, data) => {
  if (!isValidTemplate(template)) {
    throw new Error("Invalid contract template: contains potentially dangerous content");
  }
  let html = template;
  if (data && typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const sanitizedValue = sanitizeValue(value);
      html = html.replaceAll(placeholder, sanitizedValue);
    });
  }
  return html;
};