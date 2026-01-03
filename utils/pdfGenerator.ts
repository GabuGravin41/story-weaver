
import { Citation } from '../types';

declare const jspdf: any;

export const generatePdf = (title: string, content: string, citation: Citation) => {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
        title: title,
        author: citation.author,
    });
    
    // Set fonts
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(title, 105, 20, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`By: ${citation.author}`, 105, 30, { align: 'center' });
    doc.text(`From: ${citation.title}`, 105, 38, { align: 'center' });

    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(content, 180);
    
    let y = 55;
    for (let i = 0; i < splitText.length; i++) {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        doc.text(splitText[i], 15, y);
        y += 5; // line height
    }
    
    doc.save(`${title.replace(/\s/g, '_')}.pdf`);
};
