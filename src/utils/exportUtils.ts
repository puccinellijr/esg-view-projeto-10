
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
  
  let yPosition = 40;
  
  try {
    // Capture and add KPI Summary section
    const kpiElement = document.querySelector('.kpi-summary-section');
    if (kpiElement) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Resumo de Indicadores-Chave', 105, 20, { align: 'center' });
      
      const canvas = await html2canvas(kpiElement as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 180;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      if (imgHeight > 240) {
        const scaledHeight = 240;
        const scaledWidth = canvas.width * scaledHeight / canvas.height;
        pdf.addImage(imgData, 'PNG', (210 - scaledWidth) / 2, 30, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      }
    }
    
    // Capture and add Environmental comparison section
    const envSection = document.querySelector('[data-category="environmental"]') || 
                      document.querySelector('.comparison-section:has([data-category="environmental"])') ||
                      Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Dimensão Ambiental'))?.closest('div');
    
    if (envSection) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Dimensão Ambiental', 105, 20, { align: 'center' });
      
      const canvas = await html2canvas(envSection as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 180;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      if (imgHeight > 240) {
        const scaledHeight = 240;
        const scaledWidth = canvas.width * scaledHeight / canvas.height;
        pdf.addImage(imgData, 'PNG', (210 - scaledWidth) / 2, 30, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      }
    }
    
    // Capture and add Social comparison section
    const socialSection = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Dimensão Social'))?.closest('div');
    
    if (socialSection) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Dimensão Social', 105, 20, { align: 'center' });
      
      const canvas = await html2canvas(socialSection as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 180;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      if (imgHeight > 240) {
        const scaledHeight = 240;
        const scaledWidth = canvas.width * scaledHeight / canvas.height;
        pdf.addImage(imgData, 'PNG', (210 - scaledWidth) / 2, 30, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      }
    }
    
    // Capture and add Governance comparison section
    const govSection = Array.from(document.querySelectorAll('h2')).find(h => h.textContent?.includes('Dimensão Governança'))?.closest('div');
    
    if (govSection) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Dimensão Governança', 105, 20, { align: 'center' });
      
      const canvas = await html2canvas(govSection as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 180;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      if (imgHeight > 240) {
        const scaledHeight = 240;
        const scaledWidth = canvas.width * scaledHeight / canvas.height;
        pdf.addImage(imgData, 'PNG', (210 - scaledWidth) / 2, 30, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      }
    }
    
    // Capture and add Bar Charts section
    const chartsSection = document.querySelector('.comparison-bar-chart')?.closest('div')?.parentElement;
    
    if (chartsSection) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Visão Geral de Indicadores', 105, 20, { align: 'center' });
      
      const canvas = await html2canvas(chartsSection as HTMLElement, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 180;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      if (imgHeight > 240) {
        const scaledHeight = 240;
        const scaledWidth = canvas.width * scaledHeight / canvas.height;
        pdf.addImage(imgData, 'PNG', (210 - scaledWidth) / 2, 30, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 15, 30, imgWidth, imgHeight);
      }
    }
    
  } catch (error) {
    console.error('Error capturing page elements:', error);
    
    // Fallback: Add data tables if visual capture fails
    pdf.addPage();
    
    // Helper to add category data to PDF
    const addCategoryData = (title: string, categoryData: any, startY: number): number => {
      pdf.setFontSize(14);
      pdf.text(`Dimensão ${title}`, 15, startY);
      
      pdf.setFontSize(10);
      startY += 8;
      
      // Table header
      pdf.text('Indicador', 15, startY);
      pdf.text(period1Str, 100, startY);
      pdf.text(period2Str, 140, startY);
      pdf.text('Var.(%)', 180, startY);
      
      startY += 5;
      
      // Draw a line
      pdf.line(15, startY, 195, startY);
      
      // Add data rows
      startY += 5;
      Object.entries(categoryData).forEach(([key, values]: [string, any]) => {
        // Check if we need a new page
        if (startY > 270) {
          pdf.addPage();
          startY = 20;
        }
        
        const variation = values.value1 !== 0 
          ? ((values.value2 - values.value1) / values.value1 * 100).toFixed(2)
          : 'N/A';
        
        pdf.text(key.replace(/_/g, ' '), 15, startY);
        pdf.text(values.value1.toString(), 100, startY);
        pdf.text(values.value2.toString(), 140, startY);
        pdf.text(`${variation}%`, 180, startY);
        
        startY += 7;
      });
      
      return startY + 10;
    };
    
    // Add environmental data
    yPosition = addCategoryData('Ambiental', data.environmental, yPosition);
    
    // Add social data  
    yPosition = addCategoryData('Social', data.social, yPosition);
    
    // Add new page for governance
    pdf.addPage();
    yPosition = 20;
    
    // Add governance data
    yPosition = addCategoryData('Governança', data.governance, yPosition);
  }
  
  // Save the PDF
  pdf.save(`ESG_${terminalName}_${period1.year}${period1.month}_vs_${period2.year}${period2.month}.pdf`);
};
