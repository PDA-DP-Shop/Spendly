import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a professional Tax Invoice PDF for merchants
 * @param {HTMLElement} element - The target UI element to capture
 * @param {string} fileName - Name for the saved PDF
 */
export const generateInvoicePDF = async (element, fileName = 'invoice.pdf') => {
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Fix for html2canvas bug: modern CSS colors (Tailwind 4) cause a crash
        const modernColorRegex = /(oklch|oklab|lab|lch|hwb|color)\([^)]+\)/g;
        const allElements = clonedDoc.getElementsByTagName('*');
        for (let i = 0; i < allElements.length; i++) {
          const el = allElements[i];
          const styles = window.getComputedStyle(el);
          ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach(prop => {
            const val = styles[prop];
            if (val && (
              val.includes('oklch') || val.includes('oklab') || 
              val.includes('lab') || val.includes('lch') || 
              val.includes('hwb') || val.includes('color(')
            )) {
              el.style[prop] = 'rgb(0, 0, 0)'; 
            }
          });
        }
        
        Array.from(clonedDoc.styleSheets).forEach(sheet => {
          try {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule.style && rule.style.cssText.match(modernColorRegex)) {
                rule.style.cssText = rule.style.cssText.replace(modernColorRegex, 'rgb(0, 0, 0)');
              }
            });
          } catch (e) {}
        });
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [imgWidth, Math.max(imgHeight, 297)] // At least A4 height
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Invoice PDF Generation Error:', error);
    return false;
  }
};
