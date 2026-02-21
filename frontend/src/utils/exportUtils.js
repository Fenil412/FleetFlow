import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Downloads data as a CSV file
 * @param {Array} data - Array of objects
 * @param {string} filename - Name of the file
 */
export const downloadCSV = (data, filename = 'report.csv') => {
    if (!data || !data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const val = row[header];
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Downloads data as a PDF file
 * @param {Array} data - Array of objects
 * @param {string} title - Title of the PDF
 * @param {string} filename - Name of the file
 */
export const downloadPDF = (data, title = 'FleetFlow Report', filename = 'report.pdf') => {
    if (!data || !data.length) return;

    const doc = new jsPDF();
    const headers = Object.keys(data[0]).map(h => h.toUpperCase().replace(/_/g, ' '));
    const tableData = data.map(row => Object.values(row));

    doc.setFontSize(20);
    doc.text(title, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    doc.autoTable({
        startY: 35,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: 255 }, // FleetFlow Blue
        styles: { fontSize: 8 },
        margin: { top: 35 }
    });

    doc.save(filename);
};
