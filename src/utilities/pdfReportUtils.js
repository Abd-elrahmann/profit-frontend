import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

export const PRIMARY_COLOR = [46, 139, 69];

let _arabicFontName = 'helvetica';
let _arabicFontStyle = 'normal';

export const registerArabicFonts = (doc) => {
  try {
    const regularPath = '/assets/fonts/Amiri-Regular.ttf';
    const boldPath = '/assets/fonts/Amiri-Bold.ttf';
    doc.addFont(regularPath, 'Amiri', 'normal');
    doc.addFont(boldPath, 'Amiri', 'bold');
    _arabicFontName = 'Amiri';
    _arabicFontStyle = 'normal';
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
    _arabicFontName = 'helvetica';
    _arabicFontStyle = 'normal';
  }
};

const _font = (doc, style = 'normal') => {
  doc.setFont(_arabicFontName, style === 'bold' ? 'bold' : _arabicFontStyle);
};

export const getArabicFontName = () => _arabicFontName;
export const drawReportHeader = (doc, options = {}) => {
  const {
    reportTitle = 'تقرير',
    ref = '',
    metadata = {},
    startY = 8,
  } = options;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  _font(doc, 'bold');
  const logoWidth = 12;
  const logoHeight = 12;
  const logoX = pageWidth - logoWidth - margin;
  const logoY = startY;
  try {
    doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
  } catch (e) {
    console.warn('Logo not loaded for PDF', e);
  }
  doc.setFontSize(14);
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('نظام إدارة السلف', pageWidth - margin - logoWidth - 2, startY + logoHeight / 2 + 2, { align: 'right' });
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text(reportTitle, pageWidth / 2, startY + 22, { align: 'center' });
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.5);
  const lineY = startY + 25;
  doc.line(pageWidth / 2 - 40, lineY, pageWidth / 2 + 40, lineY);
  if (ref) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(ref, pageWidth / 2, lineY + 6, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  doc.setFontSize(10);
  _font(doc, 'normal');
  let metaY = startY + 4;
  if (metadata.date !== undefined) {
    doc.text(`تاريخ التقرير: ${metadata.date}`, margin, metaY, { align: 'left' });
    metaY += 5;
  }
  if (metadata.time !== undefined) {
    doc.text(`وقت الإصدار: ${metadata.time}`, margin, metaY, { align: 'left' });
    metaY += 5;
  }
  if (metadata.user !== undefined) {
    doc.text(`المستخدم: ${metadata.user}`, margin, metaY, { align: 'left' });
  }
  return lineY + (ref ? 12 : 6);
};
export const drawSeparatorLine = (doc, y) => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  return y + 8;
};
export const drawReportFooter = (doc, pageNum, totalPages, options = {}) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const footerMargin = 10;
  const footerY = pageHeight - 12;
  doc.setPage(pageNum);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(footerMargin, pageHeight - 15, pageWidth - footerMargin, pageHeight - 15);
  doc.setFontSize(9);
  _font(doc, 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text(`صفحة ${pageNum} من ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
  doc.text(`تم الإنشاء في: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - footerMargin, footerY, { align: 'right' });
  doc.text('صُدر من خلال نظام إدارة السلف', footerMargin, footerY, { align: 'left' });
  doc.setTextColor(0, 0, 0);
};
export const getCenteredTableStartX = (doc, columnWidths) => {
  const totalWidth = Array.isArray(columnWidths)
    ? columnWidths.reduce((a, b) => a + b, 0)
    : Object.values(columnWidths).reduce((a, b) => a + b, 0);
  const pageWidth = doc.internal.pageSize.width;
  return (pageWidth - totalWidth) / 2;
};
export const getCenteredTableMargins = (doc, tableWidth) => {
  const pageWidth = doc.internal.pageSize.width;
  const sideMargin = Math.max(5, (pageWidth - tableWidth) / 2);
  return { left: sideMargin, right: sideMargin };
};
export const PAGE_MARGIN = 10;
export const drawReportSummary = (doc, yPosition, summaryText) => {
  doc.setFontSize(11);
  _font(doc, 'bold');
  doc.setTextColor(0, 0, 0);
  const pageWidth = doc.internal.pageSize.width;
  doc.text(summaryText, pageWidth / 2, yPosition, { align: 'center' });
  return yPosition + 10;
};
export const getFullWidthColumnStyles = (doc, baseWidths) => {
  const pageWidth = doc.internal.pageSize.width;
  const availableWidth = pageWidth - 2 * PAGE_MARGIN;
  const widths = Array.isArray(baseWidths)
    ? baseWidths
    : Object.keys(baseWidths)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => baseWidths[k]);
  const totalBase = widths.reduce((a, b) => a + b, 0);
  const scale = totalBase > 0 ? availableWidth / totalBase : 1;
  const result = {};
  widths.forEach((w, i) => {
    result[i] = { cellWidth: Math.round(w * scale) };
  });
  return result;
};
