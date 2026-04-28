import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

/**
 * Unified Report Template
 * ------------------------------------------------------------------
 * A single, project-wide PDF report template modeled after the
 * "تقرير بأرصدة العملاء" sample layout:
 *   - Per-page header (org name right, report title centered, meta left)
 *   - Repeating table headers each page
 *   - Optional in-table summary rows (اجمالي للنوع / اجمالي للتقرير)
 *   - Signature block on the last page only
 *   - Centered page footer "-- X of Y --"
 *
 * Use `exportUnifiedReport(options)` from any page's exporter.
 * ------------------------------------------------------------------
 */

export const REPORT_PRIMARY_COLOR = [46, 139, 69];
const HEADER_BORDER_COLOR = [180, 180, 180];
const MUTED_TEXT = [90, 90, 90];
const DEFAULT_ORG_NAME = 'نظام إدارة السلف';

let _arabicFontName = 'helvetica';

const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
    _arabicFontName = 'Amiri';
  } catch (error) {
    console.warn('Arabic fonts not found, falling back to helvetica', error);
    _arabicFontName = 'helvetica';
  }
};

const setFont = (doc, style = 'normal') => {
  doc.setFont(_arabicFontName, style);
};

const formatNumber = (n, fractionDigits = 2) => {
  const num = Number(n);
  if (Number.isNaN(num)) return String(n ?? '');
  return num.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
};

const formatCell = (value, format) => {
  if (value === null || value === undefined) return '';
  if (format === 'number') return formatNumber(value, 2);
  if (format === 'number0') return formatNumber(value, 0);
  if (format === 'date') return value ? dayjs(value).format('DD-MM-YYYY') : '';
  if (typeof format === 'function') return format(value);
  return String(value);
};

const formatDate = (d) => (d ? dayjs(d).format('DD-MM-YYYY') : '');

/**
 * Draw the report header on the current page.
 * Header layout (RTL):
 *   - Right side: logo + org/system name
 *   - Center: report title + period line
 *   - Left side: date, time, user, page indicator (currentPage - totalPages)
 */
const drawHeader = (doc, ctx, pageNumber, totalPages) => {
  const pageWidth = doc.internal.pageSize.width;
  const margin = ctx.margin;
  const startY = 8;

  setFont(doc, 'bold');
  doc.setTextColor(0, 0, 0);

  const logoSize = 12;
  const logoX = pageWidth - logoSize - margin;
  const logoY = startY;
  try {
    doc.addImage(logo, 'PNG', logoX, logoY, logoSize, logoSize);
  } catch {
    // ignore missing logo
  }

  doc.setFontSize(13);
  doc.setTextColor(...REPORT_PRIMARY_COLOR);
  doc.text(ctx.orgName, logoX - 2, startY + 6, { align: 'right' });

  if (ctx.branchName) {
    setFont(doc, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED_TEXT);
    doc.text(ctx.branchName, logoX - 2, startY + 11, { align: 'right' });
  }

  setFont(doc, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(ctx.reportTitle, pageWidth / 2, startY + 8, { align: 'center' });

  doc.setDrawColor(...REPORT_PRIMARY_COLOR);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2 - 45, startY + 10.5, pageWidth / 2 + 45, startY + 10.5);

  if (ctx.dateFrom || ctx.dateTo) {
    setFont(doc, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED_TEXT);
    const periodText = `من تاريخ: ${formatDate(ctx.dateFrom) || '—'}     الى تاريخ: ${formatDate(ctx.dateTo) || '—'}`;
    doc.text(periodText, pageWidth / 2, startY + 16, { align: 'center' });
  }

  setFont(doc, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_TEXT);

  const metaX = margin;
  let metaY = startY + 3;
  doc.text(`${ctx.generatedDate}    ${ctx.generatedTime}`, metaX, metaY, { align: 'left' });
  metaY += 5;
  doc.text(`المستخدم: ${ctx.userName || '—'}`, metaX, metaY, { align: 'left' });
  metaY += 5;
  doc.text(`${totalPages} - ${pageNumber}`, metaX, metaY, { align: 'left' });

  doc.setDrawColor(...HEADER_BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.line(margin, ctx.headerBottomY - 2, pageWidth - margin, ctx.headerBottomY - 2);

  doc.setTextColor(0, 0, 0);
};

const drawFooter = (doc, pageNumber, totalPages, ctx) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = ctx.margin;

  doc.setDrawColor(...HEADER_BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

  setFont(doc, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED_TEXT);
  doc.text(`-- ${pageNumber} of ${totalPages} --`, pageWidth / 2, pageHeight - 8, { align: 'center' });
  doc.text('صُدر من خلال نظام إدارة السلف', margin, pageHeight - 8, { align: 'left' });
  doc.text(`تم الإنشاء في: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
};

const drawSignatureBlock = (doc, ctx) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = ctx.margin;
  const labels = ctx.signatureLabels || ['الإدارة', 'الحسابات', 'المختص'];

  const blockTop = pageHeight - 38;
  const blockBottom = pageHeight - 20;
  const usableWidth = pageWidth - margin * 2;
  const cellWidth = usableWidth / labels.length;

  setFont(doc, 'bold');
  doc.setFontSize(10);
  doc.setDrawColor(...HEADER_BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.setTextColor(0, 0, 0);

  labels.forEach((label, i) => {
    const x = margin + cellWidth * i;
    doc.line(x + 8, blockBottom - 4, x + cellWidth - 8, blockBottom - 4);
    doc.text(label, x + cellWidth / 2, blockBottom, { align: 'center' });
    doc.setTextColor(...MUTED_TEXT);
    doc.setFontSize(8);
    setFont(doc, 'normal');
    doc.text('التوقيع', x + cellWidth / 2, blockTop + 4, { align: 'center' });
    doc.setFontSize(10);
    setFont(doc, 'bold');
    doc.setTextColor(0, 0, 0);
  });
};

/**
 * Build body rows from raw row data + column defs.
 */
const buildRows = (columns, rows) => {
  return rows.map((row) => {
    if (Array.isArray(row)) return row;
    return columns.map((col) => formatCell(row[col.dataKey], col.format));
  });
};

/**
 * Build appended summary rows.
 *
 * summaryRows item shape:
 *   {
 *     values: { <dataKey>: value, ... },  // values keyed by column dataKey
 *     highlight?: boolean,                // highlight with primary tint
 *     separator?: boolean,                // render this row as "---***---" separators
 *   }
 *
 * Cells without a value in `values` receive '---***---' when separator=true,
 * or an empty string otherwise.
 */
const buildSummaryRows = (columns, summaryRows) => {
  if (!summaryRows || summaryRows.length === 0) return [];
  return summaryRows.map((sr) => {
    return columns.map((col) => {
      let cellValue = '';
      if (sr.values && Object.prototype.hasOwnProperty.call(sr.values, col.dataKey)) {
        cellValue = formatCell(sr.values[col.dataKey], col.format);
      } else if (sr.separator) {
        cellValue = '---***---';
      }
      return {
        content: cellValue,
        styles: {
          fontStyle: 'bold',
          fillColor: sr.highlight ? [220, 237, 222] : [245, 245, 245],
          textColor: [0, 0, 0],
          halign: col.align || 'center',
        },
      };
    });
  });
};

/**
 * Main entry point: build and save a unified report PDF.
 *
 * @param {object} opts
 * @param {string} opts.reportTitle - Title shown centered in header
 * @param {string} [opts.fileName]  - Save file name (without extension)
 * @param {'landscape'|'portrait'} [opts.orientation='landscape']
 * @param {string|Date} [opts.dateFrom]
 * @param {string|Date} [opts.dateTo]
 * @param {string} [opts.userName]  - Logged-in user name
 * @param {string} [opts.orgName]   - Organization name (right side of header)
 * @param {string} [opts.branchName]- Optional sub-line under org name
 * @param {Array<{header:string,dataKey:string,width?:number,format?:string|Function,align?:string}>} opts.columns
 * @param {Array<object|Array>} opts.rows
 * @param {Array<{label:string,values:object,separators?:boolean,highlight?:boolean}>} [opts.summaryRows]
 * @param {string} [opts.subtitle]  - Optional text line above the table
 * @param {boolean} [opts.showSignatures=false]
 * @param {boolean} [opts.save=true]
 * @param {string[]} [opts.signatureLabels]
 * @param {object} [opts.tableStyles] - autoTable style overrides
 * @returns {Promise<jsPDF>}
 */
export const exportUnifiedReport = async (opts) => {
  const {
    reportTitle = 'تقرير',
    fileName,
    orientation = 'landscape',
    dateFrom,
    dateTo,
    userName = '',
    orgName = DEFAULT_ORG_NAME,
    branchName = '',
    columns = [],
    rows = [],
    summaryRows = [],
    subtitle,
    showSignatures = false,
    save = true,
    signatureLabels,
    tableStyles = {},
  } = opts;

  const doc = new jsPDF(orientation, 'mm', 'a4');
  registerArabicFonts(doc);

  doc.setProperties({
    title: reportTitle,
    subject: reportTitle,
    author: orgName,
    creator: DEFAULT_ORG_NAME,
  });

  const ctx = {
    reportTitle,
    orgName,
    branchName,
    userName,
    dateFrom,
    dateTo,
    generatedDate: dayjs().format('DD-MM-YYYY'),
    generatedTime: dayjs().format('HH:mm'),
    margin: 10,
    headerBottomY: 32,
    signatureLabels,
  };

  const headHeaders = [columns.map((c) => c.header)];
  const bodyRows = buildRows(columns, rows);
  const summaryBody = buildSummaryRows(columns, summaryRows);
  const allBody = [...bodyRows, ...summaryBody];

  const columnStyles = {};
  const totalBaseWidth = columns.reduce((sum, c) => sum + (c.width || 30), 0);
  const pageUsableWidth = doc.internal.pageSize.width - ctx.margin * 2;
  const scale = totalBaseWidth > 0 ? pageUsableWidth / totalBaseWidth : 1;
  columns.forEach((c, i) => {
    columnStyles[i] = {
      cellWidth: Math.round((c.width || 30) * scale),
      halign: c.align || 'center',
    };
  });

  const bottomMargin = showSignatures ? 45 : 22;

  autoTable(doc, {
    head: headHeaders,
    body: allBody,
    startY: ctx.headerBottomY,
    margin: { top: ctx.headerBottomY, left: ctx.margin, right: ctx.margin, bottom: bottomMargin },
    theme: 'striped',
    styles: {
      font: _arabicFontName,
      fontSize: 9,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      halign: 'center',
      valign: 'middle',
      overflow: 'linebreak',
      textColor: [0, 0, 0],
      ...(tableStyles.styles || {}),
    },
    headStyles: {
      fillColor: REPORT_PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
      cellPadding: 4,
      lineWidth: 0.1,
      ...(tableStyles.headStyles || {}),
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
      ...(tableStyles.bodyStyles || {}),
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
      ...(tableStyles.alternateRowStyles || {}),
    },
    columnStyles,
    didParseCell: (hookData) => {
      if (hookData.section !== 'body' && hookData.section !== 'head') return;
      const raw = Array.isArray(hookData.cell.raw)
        ? hookData.cell.raw.join(' ')
        : hookData.cell.raw;
      hookData.cell.text = [raw == null ? '' : String(raw)];
    },
    didDrawPage: () => {
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      drawHeader(doc, ctx, pageNumber, '{T}');
      if (subtitle) {
        setFont(doc, 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...MUTED_TEXT);
        doc.text(subtitle, doc.internal.pageSize.width / 2, ctx.headerBottomY - 4, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }
    },
  });

  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i += 1) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.width;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, ctx.headerBottomY - 2, 'F');
    drawHeader(doc, ctx, i, totalPages);
    if (subtitle) {
      setFont(doc, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...MUTED_TEXT);
      doc.text(subtitle, pageWidth / 2, ctx.headerBottomY - 4, { align: 'center' });
      doc.setTextColor(0, 0, 0);
    }
    drawFooter(doc, i, totalPages, ctx);
    if (showSignatures && i === totalPages) {
      drawSignatureBlock(doc, ctx);
    }
  }

  const safeTitle = (fileName || reportTitle).replace(/[\\/:*?"<>|]/g, '_');
  const stamp = dayjs().format('YYYY-MM-DD_HH-mm');
  if (save) {
    doc.save(`${safeTitle}_${stamp}.pdf`);
  }
  return doc;
};

export default exportUnifiedReport;
