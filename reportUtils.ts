import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { dispatchAlert } from './modalUtils';
import { Company } from '../types';

export const handlePrint = () => {
  window.print();
};

export const handleExportPDF = async (elementId: string, fileName: string) => {
  const input = document.getElementById(elementId);
  if (!input) {
    dispatchAlert({ title: 'Erro', message: 'Elemento para impressão não encontrado.', type: 'error' });
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const a4WidthMm = 210;
    const a4HeightMm = 297;
    const marginMm = 10;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const contentWidth = a4WidthMm - marginMm * 2;
    const contentHeight = a4HeightMm - marginMm * 2;
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const aspectRatio = imgWidth / imgHeight;

    let pdfImgWidth = contentWidth;
    let pdfImgHeight = contentWidth / aspectRatio;

    if (pdfImgHeight > contentHeight) {
      pdfImgHeight = contentHeight;
      pdfImgWidth = contentHeight * aspectRatio;
    }
    
    const x = (a4WidthMm - pdfImgWidth) / 2;
    const y = marginMm;

    pdf.addImage(imgData, 'PNG', x, y, pdfImgWidth, pdfImgHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    dispatchAlert({ title: 'Erro', message: 'Ocorreu um erro ao gerar o PDF. Tente novamente.', type: 'error' });
  }
};

const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) {
        return '';
    }
    const str = String(field);
    // Enclose field in quotes if it contains a semicolon, a quote, or a newline
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
        const escapedStr = str.replace(/"/g, '""');
        return `"${escapedStr}"`;
    }
    return str;
};

export const handleExportCSV = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
        dispatchAlert({ title: 'Sem dados', message: 'Não há dados para exportar.', type: 'info' });
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(';'), // Use semicolon for Excel compatibility in some regions
        ...data.map(row =>
            headers.map(header => escapeCsvField(row[header])).join(';') // Use semicolon
        )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

interface PaginatedReportParams {
  data: any[];
  columns: {
    header: string;
    accessor: string;
    format?: (value: any, row: any) => string;
    align?: 'left' | 'right' | 'center';
  }[];
  reportTitle: string;
  baseReportText: string;
  company: Company | null;
  itemsPerPage?: number;
}

export const handleSharePaginatedReport = async ({
  data,
  columns,
  reportTitle,
  baseReportText,
  company,
  itemsPerPage = 12,
}: PaginatedReportParams) => {
  if (!data || data.length === 0) {
    dispatchAlert({ title: 'Sem dados', message: 'Não há dados para compartilhar.', type: 'info' });
    return;
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  document.body.appendChild(container);

  const pages: HTMLDivElement[] = [];
  const totalPages = Math.ceil(data.length / itemsPerPage);

  for (let i = 0; i < totalPages; i++) {
    const chunk = data.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
    
    const pageDiv = document.createElement('div');
    pageDiv.className = 'bg-white p-6 font-sans';
    pageDiv.style.width = '800px';
    pageDiv.style.minHeight = '1120px';
    pageDiv.style.display = 'flex';
    pageDiv.style.flexDirection = 'column';
    pageDiv.style.fontFamily = 'sans-serif';

    const tableRowsHtml = chunk.map(row => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        ${columns.map(col => `
          <td style="padding: 12px 8px; text-align: ${col.align || 'left'}; font-size: 14px; color: #374155; word-break: break-word;">
            ${col.format ? col.format(row[col.accessor], row) : row[col.accessor]}
          </td>
        `).join('')}
      </tr>
    `).join('');

    pageDiv.innerHTML = `
      <div style="flex-grow: 1;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb;">
          <div>
            <h2 style="font-size: 24px; font-weight: bold; color: #11182c;">${reportTitle}</h2>
            <p style="color: #6b7280; font-size: 14px;">Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          ${company ? `
            <div style="text-align: right;">
              <h3 style="font-size: 18px; font-weight: bold; color: #11182c;">${company.name}</h3>
              <p style="font-size: 12px; color: #6b7280;">${company.address}</p>
            </div>
          ` : ''}
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              ${columns.map(col => `
                <th style="padding: 12px 8px; text-align: ${col.align || 'left'}; font-size: 14px; font-weight: 600; color: #4b5563;">
                  ${col.header}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
      <div style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
        Página ${i + 1} de ${totalPages} - Desenvolvido por MRP Sistemas & Codix Digital
      </div>
    `;
    container.appendChild(pageDiv);
    pages.push(pageDiv);
  }

  try {
    const blobs = await Promise.all(pages.map(page => 
      html2canvas(page, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
        .then(canvas => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png')))
    ));

    const files = blobs
      .filter((blob): blob is Blob => blob !== null)
      .map((blob, index) => new File([blob], `relatorio_pagina_${index + 1}.png`, { type: 'image/png' }));

    if (files.length === 0) throw new Error('Nenhuma imagem pôde ser gerada.');

    const shareData = { files, title: reportTitle, text: baseReportText };

    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      dispatchAlert({ title: 'Indisponível', message: 'Seu navegador não suporta o compartilhamento de múltiplas imagens. Apenas a primeira página será copiada.', type: 'info' });
      await navigator.clipboard.write([ new ClipboardItem({ 'image/png': files[0] }) ]);
      dispatchAlert({ title: 'Copiado!', message: 'A primeira página do relatório foi copiada. Cole na sua conversa!', type: 'success' });
    }
  } catch (error) {
    console.error('Erro ao gerar ou compartilhar imagens do relatório:', error);
    dispatchAlert({ title: 'Erro', message: 'Ocorreu um erro ao gerar as imagens do relatório.', type: 'error' });
  } finally {
    document.body.removeChild(container);
  }
};

export const handleShareReportAsImage = async (elementId: string, text: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    dispatchAlert({ title: 'Erro', message: 'Elemento para compartilhar não encontrado.', type: 'error' });
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        dispatchAlert({ title: 'Erro', message: 'Não foi possível gerar a imagem para compartilhamento.', type: 'error' });
        return;
      }

      const file = new File([blob], 'relatorio.png', { type: 'image/png' });
      const shareData = {
        files: [file],
        title: 'Relatório',
        text: text,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if ((error as DOMException).name !== 'AbortError') {
            console.error('Erro ao compartilhar imagem:', error);
            dispatchAlert({ title: 'Indisponível', message: 'O compartilhamento de imagem falhou ou foi cancelado.', type: 'info' });
          }
        }
      } else {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          dispatchAlert({
            title: 'Pronto para compartilhar!',
            message: 'A imagem do relatório foi copiada. Agora é só colar na conversa do WhatsApp!',
            type: 'info'
          });
        } catch (err) {
          console.warn('Não foi possível copiar a imagem para a área de transferência.', err);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'relatorio.png';
          a.click();
          URL.revokeObjectURL(url);
          dispatchAlert({
            title: 'Pronto para compartilhar!',
            message: 'Sua mensagem foi aberta no WhatsApp. A imagem do relatório foi baixada, agora é só anexar na conversa!',
            type: 'info'
          });
        }
      }
    }, 'image/png');
  } catch (error) {
    console.error('Erro ao gerar imagem do relatório:', error);
    dispatchAlert({ title: 'Erro', message: 'Ocorreu um erro ao gerar a imagem do relatório.', type: 'error' });
  }
};


export const handleShareWhatsApp = (text: string) => {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, '_blank');
};

export const handleShareImage = async (elementId: string, fileName: string = 'comprovante.png') => {
  const element = document.getElementById(elementId);
  if (!element) {
    dispatchAlert({ title: 'Erro', message: 'Elemento para compartilhar não encontrado.', type: 'error' });
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    canvas.toBlob(async (blob) => {
      if (!blob) {
        dispatchAlert({ title: 'Erro', message: 'Não foi possível gerar a imagem para compartilhamento.', type: 'error' });
        return;
      }

      const file = new File([blob], fileName, { type: 'image/png' });
      const shareData = {
        files: [file],
        title: 'Comprovante de Venda',
        text: 'Veja seu comprovante de venda.',
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          if ((error as DOMException).name !== 'AbortError') {
            console.error('Erro ao compartilhar imagem:', error);
            dispatchAlert({ title: 'Indisponível', message: 'O compartilhamento de imagem falhou ou foi cancelado.', type: 'info' });
          }
        }
      } else {
        dispatchAlert({ title: 'Indisponível', message: 'Seu navegador não suporta o compartilhamento de imagens.', type: 'info' });
      }
    }, 'image/png');

  } catch (error) {
    console.error('Erro ao gerar imagem do recibo:', error);
    dispatchAlert({ title: 'Erro', message: 'Ocorreu um erro ao gerar a imagem do recibo.', type: 'error' });
  }
};
