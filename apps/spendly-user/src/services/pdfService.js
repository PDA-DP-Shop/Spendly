import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a premium PDF receipt from a DOM element
 * @param {HTMLElement} element - The target UI element to capture
 * @param {string} fileName - Name for the saved PDF
 */
export const generateReceiptPDF = async (element, fileName = 'recipe.pdf') => {
  if (!element) return;

  try {
    // 1. Capture the element as a high-quality canvas
    const canvas = await html2canvas(element, {
      scale: 3, 
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Fix for html2canvas bug: modern CSS colors (Tailwind 4) cause a crash
        // We catch oklch, oklab, lab, lch, hwb, and color() functions
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
    
    // 2. Create high-res PDF
    // We use a custom size based on the content aspect ratio for best fit
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // We create the PDF with the dynamic height of the bill to avoid clipping
    // or we can add multiple pages. For digital receipts, dynamic height is superior.
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: [imgWidth, Math.max(imgHeight, 297)] // At least A4 height
    });
    
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return false;
  }
};
