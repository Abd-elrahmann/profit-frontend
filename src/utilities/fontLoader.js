/**
 * Ensures fonts used in PDF generation (Cairo) are loaded before html2canvas renders.
 * Call before PDF generation - resolves immediately if fonts already loaded (e.g. from preview).
 */
export const ensureFontsReady = () => {
  if (document.fonts && document.fonts.load) {
    return document.fonts.load('16px Cairo');
  }
  return Promise.resolve();
};

/**
 * Preloads contract fonts when preview opens. Call on preview open so fonts
 * are ready by the time user clicks save.
 */
export const preloadContractFonts = () => {
  if (document.fonts && document.fonts.load) {
    document.fonts.load('16px Cairo');
  }
};
