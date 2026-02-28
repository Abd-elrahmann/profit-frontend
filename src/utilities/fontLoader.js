export const ensureFontsReady = () => {
  if (document.fonts && document.fonts.load) {
    return document.fonts.load('16px Cairo');
  }
  return Promise.resolve();
};
export const preloadContractFonts = () => {
  if (document.fonts && document.fonts.load) {
    document.fonts.load('16px Cairo');
  }
};