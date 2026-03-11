import Api from '../config/Api';

export const isImageFile = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

/** يتحقق إذا كان الرابط من مجلد uploads ويحتاج تمرير عبر API آمن */
const isUploadsUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('/uploads/');
};

/** يحول الرابط لشكل كامل إذا كان نسبياً */
const toFullUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = Api.defaults.baseURL || '';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? '' : '/'}${url}`;
};

/**
 * جلب الملف بشكل آمن عبر POST /api/file (يتطلب صلاحية files.canView)
 * @param {string} url - رابط الملف (نسبي أو كامل)
 * @returns {Promise<Blob>}
 */
export const secureFetchFile = async (url) => {
  const fullUrl = toFullUrl(url);
  if (!isUploadsUrl(fullUrl)) {
    const res = await fetch(fullUrl, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch file');
    return res.blob();
  }
  const { data } = await Api.post('/api/file', { url: fullUrl }, { responseType: 'blob' });
  return data;
};

/**
 * فتح الملف في تاب جديد بشكل آمن
 * @param {string} url - رابط الملف
 */
export const secureOpenFile = async (url) => {
  try {
    const blob = await secureFetchFile(url);
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      win.addEventListener('load', () => setTimeout(() => URL.revokeObjectURL(blobUrl), 5000));
    } else {
      URL.revokeObjectURL(blobUrl);
    }
  } catch (err) {
    console.error('secureOpenFile error:', err);
    throw err;
  }
};

/**
 * تحميل الملف بشكل آمن
 * @param {string} url - رابط الملف
 * @param {string} filename - اسم الملف للتحميل
 */
export const secureDownloadFile = async (url, filename) => {
  const blob = await secureFetchFile(url);
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename || 'file';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
};

/** الحصول على blob URL للعرض (مثلاً لـ img src) - يُفضّل استدعاء revokeObjectURL عند عدم الحاجة */
export const secureGetBlobUrl = async (url) => {
  const blob = await secureFetchFile(url);
  return URL.createObjectURL(blob);
};