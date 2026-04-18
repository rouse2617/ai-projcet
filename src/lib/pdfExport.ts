import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MoldCostInput, MoldCostResult } from './types';

// 注册中文字体支持（使用内置的 helvetica 配合 Unicode 转义）
// jsPDF 默认不支持中文，我们用 ASCII 兼容方式 + 表格数据

/** 生成模具报价单 PDF */
export function exportMoldQuotePdf(input: MoldCostInput, result: MoldCostResult) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const quoteNo = `SH-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

  let y = 15;

  // === Header ===
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MOLD COST QUOTATION', 15, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('ShuHan Tech | AI-Powered Quoting System', 15, 21);
  doc.text(`Quote #: ${quoteNo}`, 15, 27);
  doc.text(`Date: ${dateStr}`, pageWidth - 15, 27, { align: 'right' });

  y = 40;

  // === Project Info ===
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PROJECT INFORMATION', 15, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45, textColor: [100, 100, 100] }, 1: { cellWidth: 50 }, 2: { fontStyle: 'bold', cellWidth: 45, textColor: [100, 100, 100] } },
    body: [
      ['Project', input.projectName || '-', 'Cavities', String(input.numberOfCavities)],
      ['Part Description', input.partDescription || '-', 'Mold Base', `${input.moldBaseWidth}x${input.moldBaseLength}x${input.moldBaseHeight}mm`],
      ['Core Steel', input.coreSteelGrade.toUpperCase(), 'Cavity Steel', input.cavitySteelGrade.toUpperCase()],
      ['Mold Base Brand', input.moldBaseBrand.toUpperCase(), 'Surface', input.surfaceTreatmentType === 'none' ? 'Standard' : input.surfaceTreatmentType],
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable?.finalY ?? y + 40;
  y += 8;

  // === Cost Breakdown ===
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COST BREAKDOWN', 15, y);
  y += 2;

  const costRows: (string | number)[][] = [
    ['Mold Base', `${input.moldBaseWidth}x${input.moldBaseLength}mm ${input.moldBaseBrand.toUpperCase()}`, '', fmtNum(result.moldBaseCost)],
    ['Core Material', `${input.coreSteelGrade.toUpperCase()} ${input.coreWeight}kg`, `@ ${input.coreSteelPricePerKg}/kg`, fmtNum(result.coreMaterialCost)],
    ['Cavity Material', `${input.cavitySteelGrade.toUpperCase()} ${input.cavityWeight}kg`, `@ ${input.cavitySteelPricePerKg}/kg`, fmtNum(result.cavityMaterialCost)],
    ['CNC Machining', `${input.cncHours} hrs`, `@ ${input.cncRate}/hr`, fmtNum(result.cncCost)],
  ];

  if (result.edmCost > 0) costRows.push(['EDM', `${input.edmHours} hrs`, `@ ${input.edmRate}/hr`, fmtNum(result.edmCost)]);
  if (result.wireEdmCost > 0) costRows.push(['Wire EDM', `${input.wireEdmHours} hrs`, `@ ${input.wireEdmRate}/hr`, fmtNum(result.wireEdmCost)]);
  if (result.grindingCost > 0) costRows.push(['Grinding', `${input.grindingHours} hrs`, `@ ${input.grindingRate}/hr`, fmtNum(result.grindingCost)]);
  if (result.designCost > 0) costRows.push(['Design', `${input.designHours} hrs`, `@ ${input.designRate}/hr`, fmtNum(result.designCost)]);
  if (result.heatTreatmentCost > 0) costRows.push(['Heat Treatment', '', '', fmtNum(result.heatTreatmentCost)]);
  if (result.surfaceTreatmentCost > 0) costRows.push(['Surface Treatment', input.surfaceTreatmentType, '', fmtNum(result.surfaceTreatmentCost)]);
  if (result.totalStandardPartsCost > 0) costRows.push(['Standard Parts', 'Ejector pins, springs, etc.', '', fmtNum(result.totalStandardPartsCost)]);
  if (result.totalTrialCost > 0) costRows.push(['Mold Trial', `${input.trialCount} trial(s)`, `@ ${input.trialCost}/trial`, fmtNum(result.totalTrialCost)]);
  if (result.packagingCost > 0) costRows.push(['Packaging & Shipping', '', '', fmtNum(result.packagingCost)]);

  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    head: [['Item', 'Specification', 'Rate', 'Amount (CNY)']],
    body: costRows,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 55 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable?.finalY ?? y + 60;
  y += 4;

  // === Totals ===
  autoTable(doc, {
    startY: y,
    margin: { left: 15, right: 15 },
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5 },
    columnStyles: {
      0: { cellWidth: 127, halign: 'right', textColor: [100, 100, 100] },
      1: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    body: [
      ['Subtotal', fmtNum(result.subtotal)],
      [`Profit (${input.profitMargin}%)`, fmtNum(result.profit)],
      [`Tax (${input.taxRate}%)`, fmtNum(result.tax)],
    ],
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable?.finalY ?? y + 20;
  y += 2;

  // Total bar
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth - 15 - 80, y, 80, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: CNY ${fmtNum(result.totalCost)}`, pageWidth - 15 - 5, y + 8, { align: 'right' });

  y += 22;

  // === Notes ===
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('NOTES:', 15, y);
  y += 4;
  doc.text('1. This quotation is valid for 30 days from the date of issue.', 15, y); y += 3.5;
  doc.text('2. Prices are in Chinese Yuan (CNY) and exclude additional customization unless specified.', 15, y); y += 3.5;
  doc.text('3. Delivery time will be confirmed upon order placement.', 15, y); y += 3.5;
  doc.text('4. Payment terms: 50% deposit, 50% before shipment.', 15, y); y += 8;

  // === Footer ===
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY - 3, pageWidth - 15, footerY - 3);
  doc.setTextColor(160, 160, 160);
  doc.setFontSize(7);
  doc.text('ShuHan Tech | AI-Powered Mold Quoting System | contact@shuhan.tech', 15, footerY);
  doc.text(`Page 1 of 1`, pageWidth - 15, footerY, { align: 'right' });

  // === Stamp area ===
  if (y + 30 < footerY - 15) {
    doc.setDrawColor(200, 200, 200);
    doc.setLineDashPattern([2, 2], 0);
    doc.roundedRect(pageWidth - 15 - 55, y, 55, 25, 2, 2, 'S');
    doc.setTextColor(180, 180, 180);
    doc.setFontSize(7);
    doc.text('Company Stamp', pageWidth - 15 - 27.5, y + 14, { align: 'center' });
  }

  // Save
  const fileName = `Quote_${quoteNo}_${(input.projectName || 'mold').replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}.pdf`;
  doc.save(fileName);
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
