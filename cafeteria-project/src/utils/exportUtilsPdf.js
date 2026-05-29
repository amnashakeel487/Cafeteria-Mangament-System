import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const exportToPDF = ({
  title,
  cafeteriaName,
  dateRange,
  summaryStats,
  tableData,
  columns,
  filename,
}) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text(title, 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Cafeteria: ${cafeteriaName}`, 14, 32);
  doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 39);
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 46);

  let yPos = 56;
  summaryStats.forEach((stat, i) => {
    const x = 14 + (i % 3) * 64;
    const y = yPos + Math.floor(i / 3) * 24;
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(x, y, 60, 20, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(stat.label, x + 4, y + 7);
    doc.setFontSize(12);
    doc.setTextColor(40);
    doc.text(String(stat.value), x + 4, y + 15);
  });

  yPos += Math.ceil(summaryStats.length / 3) * 24 + 10;

  autoTable(doc, {
    startY: yPos,
    head: [columns.map((c) => c.header)],
    body: tableData.map((row) => columns.map((c) => row[c.key] ?? '-')),
    styles: { fontSize: 9 },
    headStyles: {
      fillColor: [6, 214, 199],
      textColor: [10, 26, 26],
    },
    alternateRowStyles: { fillColor: [250, 250, 252] },
  });

  doc.save(`${filename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
