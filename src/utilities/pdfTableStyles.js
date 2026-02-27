/**
 * أنماط موحدة لجداول PDF - تُستخدم في جميع ملفات التصدير
 * Unified PDF table styles for consistent appearance across all exporters
 */
export const pdfTableBaseStyles = {
  theme: 'striped',
  styles: {
    font: 'Amiri',
    fontStyle: 'normal',
    fontSize: 9,
    cellPadding: 4,
    lineColor: [200, 200, 200],
    lineWidth: 0.1,
    halign: 'center',
    valign: 'middle',
    overflow: 'linebreak',
    minCellHeight: 14,
    textColor: [0, 0, 0]
  },
  headStyles: {
    fillColor: [46, 139, 69],
    textColor: [255, 255, 255],
    fontStyle: 'bold',
    fontSize: 10,
    halign: 'center',
    valign: 'middle',
    cellPadding: 5,
    lineWidth: 0.1,
    overflow: 'hidden',
    minCellHeight: 10
  },
  bodyStyles: {
    fontStyle: 'normal',
    fontSize: 9,
    halign: 'center',
    valign: 'middle',
    cellPadding: 4,
    lineWidth: 0.1,
    overflow: 'linebreak'
  },
  alternateRowStyles: {
    fillColor: [250, 250, 250]
  }
};

/**
 * دمج الأنماط الأساسية مع تخصيصات اختيارية
 * Merge base styles with optional overrides
 */
export const getPdfTableStyles = (overrides = {}) => ({
  ...pdfTableBaseStyles,
  ...overrides,
  styles: { ...pdfTableBaseStyles.styles, ...overrides.styles },
  headStyles: { ...pdfTableBaseStyles.headStyles, ...overrides.headStyles },
  bodyStyles: { ...pdfTableBaseStyles.bodyStyles, ...overrides.bodyStyles },
  alternateRowStyles: { ...pdfTableBaseStyles.alternateRowStyles, ...overrides.alternateRowStyles }
});

/**
 * يرسم إطار رمادي حول الجدول
 * Draws a gray border around the table
 */
export const createDidDrawTable = (doc) => (data) => {
  if (data.cursor) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    const tableX = data.settings.margin.left;
    const tableY = data.cursor.y - data.table.height;
    const tableWidth = data.table.width;
    const tableHeight = data.table.height;
    if (!isNaN(tableX) && !isNaN(tableY) &&
        !isNaN(tableWidth) && !isNaN(tableHeight) &&
        tableWidth > 0 && tableHeight > 0) {
      doc.rect(tableX, tableY, tableWidth, tableHeight, 'S');
    }
  }
};
