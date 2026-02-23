import { useCallback } from 'react';

export const useExportDashboard = (elementId = 'dashboard-export-area') => {
  const handleExport = useCallback(async () => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      
      // Get element dimensions
      const elementWidth = element.scrollWidth;
      const elementHeight = element.scrollHeight;
      
      // Calculate PDF dimensions (convert px to mm, 1px ≈ 0.264583mm)
      const pxToMm = 0.264583;
      const pdfWidth = Math.max(elementWidth * pxToMm, 297); // At least A4 landscape width
      const pdfHeight = elementHeight * pxToMm + 20; // Add margin
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `dashboard-export-${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#f6f8f6',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: elementWidth,
          windowHeight: elementHeight,
          ignoreElements: (el) => {
            const exclude = el.closest?.('[data-exclude-export]');
            return !!exclude;
          },
        },
        jsPDF: { 
          unit: 'mm', 
          format: [pdfWidth, pdfHeight],
          orientation: 'landscape',
        },
        pagebreak: { mode: 'avoid-all' },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [elementId]);

  return handleExport;
};
