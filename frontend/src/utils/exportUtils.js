
/**
 * Downloads data as a CSV file
 */
export const downloadCSV = (data, filename = 'report.csv') => {
    if (!data || !data.length) {
        alert('No data available to export.');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const val = row[header];
            if (val == null) return '';
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
        }).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Downloads data as a PDF file using jsPDF v4 + jspdf-autotable v5
 */
export const downloadPDF = async (data, title = 'FleetFlow Report', filename = 'report.pdf') => {
    if (!data || !data.length) {
        alert('No data available to export.');
        return;
    }

    try {
        // Dynamic import to ensure module is loaded correctly in any bundler
        const jsPDFModule = await import('jspdf');
        const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
        await import('jspdf-autotable');

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

        // Header bar
        doc.setFillColor(37, 99, 235); // Blue
        doc.rect(0, 0, 297, 18, 'F');
        doc.setFontSize(13);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('FleetFlow — ' + title, 10, 12);

        // Subtitle
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, 230, 12);

        // Table
        const headers = Object.keys(data[0]).map(h => h.toUpperCase().replace(/_/g, ' '));
        const tableData = data.map(row =>
            Object.values(row).map(v => (v == null ? '' : String(v)))
        );

        // jspdf-autotable v5 exposes autoTable on the jsPDF prototype
        if (typeof doc.autoTable === 'function') {
            doc.autoTable({
                startY: 24,
                head: [headers],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold', fontSize: 8 },
                bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
                alternateRowStyles: { fillColor: [245, 247, 255] },
                styles: { overflow: 'linebreak', cellPadding: 2 },
                margin: { left: 10, right: 10 },
            });
        } else {
            // Fallback: simple text rendering
            doc.setFontSize(9);
            doc.setTextColor(0);
            let y = 30;
            doc.text(headers.join('   |   '), 10, y);
            y += 6;
            tableData.forEach(row => {
                if (y > 195) { doc.addPage(); y = 20; }
                doc.text(row.join('   |   '), 10, y);
                y += 5;
            });
        }

        doc.save(filename);
    } catch (err) {
        console.error('PDF generation failed:', err);
        alert(`PDF export failed: ${err.message}\n\nPlease try the CSV export instead.`);
    }
};
