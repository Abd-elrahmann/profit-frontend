/**
 * أدوات موحدة لتقارير PDF - نظام إدارة السلف
 * Unified PDF report utilities - consistent header, footer, layout across all exporters
 * لا تستخدم أي أيقونات أونلاين - اللوجو محلي فقط
 */

import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

export const PRIMARY_COLOR = [46, 139, 69]; // #2E8B45

export const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

/**
 * رسم هيدر التقرير الموحد
 * Right: Logo + نظام إدارة السلف
 * Center: Report title + optional ref
 * Left: Metadata (date, time, user)
 */
export const drawReportHeader = (doc, options = {}) => {
  const {
    reportTitle = 'تقرير',
    ref = '',
    metadata = {},
    startY = 8,
  } = options;

  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;

  doc.setFont('Amiri', 'bold');

  // Right: Logo + نظام إدارة السلف
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

  // Center: Report title (with underline effect via line) - منزّل لتحت لتجنب التداخل مع الهيدر
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

  // Left: Metadata
  doc.setFontSize(10);
  doc.setFont('Amiri', 'normal');
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

/**
 * خط فاصل أخضر (Primary)
 */
export const drawSeparatorLine = (doc, y) => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  return y + 8;
};

/**
 * رسم فوتر التقرير الموحد
 */
export const drawReportFooter = (doc, pageNum, totalPages, options = {}) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const footerMargin = 10;
  const footerY = pageHeight - 12;

  doc.setPage(pageNum);

  // Line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(footerMargin, pageHeight - 15, pageWidth - footerMargin, pageHeight - 15);

  doc.setFontSize(9);
  doc.setFont('Amiri', 'bold');
  doc.setTextColor(100, 100, 100);

  // Center: Page number
  doc.text(`صفحة ${pageNum} من ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });

  // Right: Created at
  doc.text(`تم الإنشاء في: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - footerMargin, footerY, { align: 'right' });

  // Left: System info
  doc.text('صُدر من خلال نظام إدارة السلف', footerMargin, footerY, { align: 'left' });

  doc.setTextColor(0, 0, 0);
};

/**
 * حساب نقطة البداية للجدول مع ضمان توسيطه
 */
export const getCenteredTableStartX = (doc, columnWidths) => {
  const totalWidth = Array.isArray(columnWidths)
    ? columnWidths.reduce((a, b) => a + b, 0)
    : Object.values(columnWidths).reduce((a, b) => a + b, 0);
  const pageWidth = doc.internal.pageSize.width;
  return (pageWidth - totalWidth) / 2;
};

/**
 * حساب الهوامش لتوسيط الجدول أفقياً (يُستخدم مع margin في autoTable)
 */
export const getCenteredTableMargins = (doc, tableWidth) => {
  const pageWidth = doc.internal.pageSize.width;
  const sideMargin = Math.max(5, (pageWidth - tableWidth) / 2);
  return { left: sideMargin, right: sideMargin };
};
