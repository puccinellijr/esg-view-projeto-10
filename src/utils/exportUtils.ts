import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Helper to format period (month + year)
const formatPeriod = (month: string, year: string): string => {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  return `${months[parseInt(month)]} de ${year}`;
};

interface ExportData {
  environmental: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  governance: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
  social: {
    [key: string]: {
      value1: number;
      value2: number;
    };
  };
}

interface Period {
  month: string;
  year: string;
}

export const exportToExcel = (
  data: ExportData,
  period1: Period,
  period2: Period,
  terminalName: string
): void => {
  // Format the period strings
  const period1Str = formatPeriod(period1.month, period1.year);
  const period2Str = formatPeriod(period2.month, period2.year);
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Process data for Excel
  const processCategory = (category: string, categoryData: any) => {
    const rows = [
      [`Indicadores ${category}`, `${period1Str}`, `${period2Str}`, 'Variação (%)']
    ];
    
    Object.entries(categoryData).forEach(([key, values]: [string, any]) => {
      const variation = values.value1 !== 0 
        ? ((values.value2 - values.value1) / values.value1 * 100).toFixed(2)
        : 'N/A';
      rows.push([
        key.replace(/_/g, ' '),
        values.value1,
        values.value2,
        `${variation}%`
      ]);
    });
    
    return rows;
  };
  
  // Create worksheets for each category
  const envData = processCategory('Ambiental', data.environmental);
  const socialData = processCategory('Social', data.social);
  const govData = processCategory('Governança', data.governance);
  
  // Create worksheets
  const wsEnv = XLSX.utils.aoa_to_sheet(envData);
  const wsSocial = XLSX.utils.aoa_to_sheet(socialData);
  const wsGov = XLSX.utils.aoa_to_sheet(govData);
  
  // Add worksheets to workbook
  XLSX.utils.book_append_sheet(wb, wsEnv, "Ambiental");
  XLSX.utils.book_append_sheet(wb, wsSocial, "Social");
  XLSX.utils.book_append_sheet(wb, wsGov, "Governança");
  
  // Add summary sheet with KPI calculations
  const calculateKPISummary = () => {
    let totalMetrics = 0;
    let improvedCount = 0;
    let unchangedCount = 0;
    let worsenedCount = 0;
    let totalVariationPercentage = 0;
    let metricsWithValues = 0;
    
    ['environmental', 'social', 'governance'].forEach(category => {
      const categoryData = data[category as keyof ExportData];
      
      Object.values(categoryData).forEach(({ value1, value2 }) => {
        if (value2 > value1) improvedCount++;
        else if (value2 === value1) unchangedCount++;
        else worsenedCount++;
        totalMetrics++;
        
        if (value1 > 0) {
          const variationPercent = ((value2 - value1) / value1) * 100;
          totalVariationPercentage += variationPercent;
          metricsWithValues++;
        }
      });
    });
    
    const averageVariation = metricsWithValues > 0 ? totalVariationPercentage / metricsWithValues : 0;
    
    return {
      improvedCount,
      unchangedCount,
      worsenedCount,
      totalMetrics,
      averageVariation
    };
  };
  
  const kpiSummary = calculateKPISummary();
  
  const summaryData = [
    [`Relatório ESG - ${terminalName}`],
    [`Comparação: ${period1Str} vs ${period2Str}`],
    ['Data de geração:', new Date().toLocaleDateString('pt-BR')],
    [],
    ['RESUMO DE INDICADORES'],
    ['Variação Média:', `${kpiSummary.averageVariation.toFixed(2)}%`],
    ['Indicadores Melhorados:', `${kpiSummary.improvedCount}/${kpiSummary.totalMetrics}`],
    ['Indicadores Piorados:', `${kpiSummary.worsenedCount}/${kpiSummary.totalMetrics}`],
    ['Indicadores Inalterados:', `${kpiSummary.unchangedCount}/${kpiSummary.totalMetrics}`],
    []
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `ESG_${terminalName}_${period1.year}${period1.month}_vs_${period2.year}${period2.month}.xlsx`);
};

export const exportToPDF = async (
  data: ExportData,
  period1: Period,
  period2: Period,
  terminalName: string
): Promise<void> => {
  // Format the period strings
  const period1Str = formatPeriod(period1.month, period1.year);
  const period2Str = formatPeriod(period2.month, period2.year);
  
  // Create PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add header
  pdf.setFontSize(18);
  pdf.text(`Relatório ESG - ${terminalName}`, 105, 15, { align: 'center' });
  pdf.setFontSize(14);
  pdf.text(`Comparação: ${period1Str} vs ${period2Str}`, 105, 25, { align: 'center' });
  pdf.setFontSize(10);
  pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
  
  // Create comparative table on first page
  let yPosition = 45;
  
  // Table headers
  pdf.setFontSize(12);
  pdf.text('Indicador', 15, yPosition);
  pdf.text('Dimensão', 70, yPosition);
  pdf.text(period1Str, 110, yPosition);
  pdf.text(period2Str, 140, yPosition);
  pdf.text('Variação (%)', 170, yPosition);
  
  yPosition += 5;
  pdf.line(15, yPosition, 195, yPosition);
  yPosition += 5;
  
  pdf.setFontSize(10);
  
  // Add environmental data
  Object.entries(data.environmental).forEach(([key, values]) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    const variation = values.value1 !== 0 
      ? ((values.value2 - values.value1) / values.value1 * 100).toFixed(2)
      : 'N/A';
    
    pdf.text(key.replace(/_/g, ' '), 15, yPosition);
    pdf.text('Ambiental', 70, yPosition);
    pdf.text(values.value1.toString(), 110, yPosition);
    pdf.text(values.value2.toString(), 140, yPosition);
    pdf.text(`${variation}%`, 170, yPosition);
    
    yPosition += 6;
  });
  
  // Add social data
  Object.entries(data.social).forEach(([key, values]) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    const variation = values.value1 !== 0 
      ? ((values.value2 - values.value1) / values.value1 * 100).toFixed(2)
      : 'N/A';
    
    pdf.text(key.replace(/_/g, ' '), 15, yPosition);
    pdf.text('Social', 70, yPosition);
    pdf.text(values.value1.toString(), 110, yPosition);
    pdf.text(values.value2.toString(), 140, yPosition);
    pdf.text(`${variation}%`, 170, yPosition);
    
    yPosition += 6;
  });
  
  // Add governance data
  Object.entries(data.governance).forEach(([key, values]) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }
    
    const variation = values.value1 !== 0 
      ? ((values.value2 - values.value1) / values.value1 * 100).toFixed(2)
      : 'N/A';
    
    pdf.text(key.replace(/_/g, ' '), 15, yPosition);
    pdf.text('Governança', 70, yPosition);
    pdf.text(values.value1.toString(), 110, yPosition);
    pdf.text(values.value2.toString(), 140, yPosition);
    pdf.text(`${variation}%`, 170, yPosition);
    
    yPosition += 6;
  });
  
  // Second page with bar charts only
  pdf.addPage();
  yPosition = 20;
  
  try {
    // Capture the charts section from the comparison page
    const chartsSection = document.querySelector('.comparison-bar-chart')?.parentElement?.parentElement;
    
    if (chartsSection) {
      pdf.setFontSize(16);
      pdf.text('Visão Geral de Indicadores', 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      const canvas = await html2canvas(chartsSection as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        height: chartsSection.scrollHeight,
        width: chartsSection.scrollWidth
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 180;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const maxHeight = 240;
      
      if (imgHeight > maxHeight) {
        const scaledHeight = maxHeight;
        const scaledWidth = canvas.width * scaledHeight / canvas.height;
        pdf.addImage(imgData, 'PNG', (210 - scaledWidth) / 2, yPosition, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 15, yPosition, imgWidth, imgHeight);
      }
    }
    
  } catch (error) {
    console.error('Error capturing charts:', error);
    // Fallback: add text indicating charts could not be captured
    pdf.setFontSize(12);
    pdf.text('Gráficos não puderam ser capturados', 105, yPosition + 50, { align: 'center' });
  }
  
  // Save the PDF
  pdf.save(`ESG_${terminalName}_${period1.year}${period1.month}_vs_${period2.year}${period2.month}.pdf`);
};
