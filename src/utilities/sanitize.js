import DOMPurify from "dompurify";

/**
 * Sanitizes a value to prevent XSS attacks by removing all HTML tags and attributes.
 * Used for dynamic data injection into trusted templates.
 *
 * @param {any} value - The value to sanitize
 * @returns {string} - The sanitized string value
 */
export const sanitizeValue = (value) =>
  DOMPurify.sanitize(String(value), {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

/**
 * Validates if a template HTML is safe for use with dangerouslySetInnerHTML.
 * Checks for common XSS attack vectors in templates.
 *
 * @param {string} html - The HTML template to validate
 * @returns {boolean} - True if template appears safe
 */
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

  // Check for dangerous CSS patterns inside style tags
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

/**
 * Injects sanitized dynamic data into a trusted HTML template.
 * Replaces {{key}} placeholders with sanitized values.
 *
 * @param {string} template - The trusted HTML template
 * @param {object} data - Object containing dynamic data to inject
 * @returns {string} - HTML with injected sanitized data
 */
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