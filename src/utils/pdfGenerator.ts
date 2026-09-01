import { jsPDF } from 'jspdf';
import { ChurchEvent, EventRegistration } from '../types';
import { formatDate, calculateAge, formatEventDateRange } from './formatters';

interface GenerateVoucherPDFParams {
  event: ChurchEvent;
  registration: EventRegistration;
  participantName: string;
  participantPhone: string;
  participantEmail: string;
  customAnswers?: Record<string, any>;
}

/**
 * Loads the QR Code as base64 image via offscreen canvas
 */
function fetchQRCodeDataUrl(text: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 140;
          canvas.height = img.height || 140;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve('');
          }
        } catch {
          resolve('');
        }
      };
      img.onerror = () => resolve('');
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(text)}`;
    } catch {
      resolve('');
    }
  });
}

export async function generateEventVoucherPDF(params: GenerateVoucherPDFParams): Promise<void> {
  const { event, registration, participantName, participantPhone, participantEmail, customAnswers } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Top Header Banner (#0B1120 Navy Dark)
  doc.setFillColor(11, 17, 32);
  doc.rect(10, 10, 190, 36, 'F');

  // Gold accent stripe
  doc.setFillColor(245, 158, 11);
  doc.rect(10, 46, 190, 2.5, 'F');

  // Header Texts
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA • MACDP', 105, 19, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPROVANTE OFICIAL DE INSCRIÇÃO', 105, 28, { align: 'center' });

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'italic');
  doc.text('"Proibido a Entrada de Pessoas Perfeitas" • Manaus / AM', 105, 36, { align: 'center' });

  // 2. Status & Credential Bar
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, 52, 190, 22, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CÓDIGO DA CREDENCIAL:', 15, 60);

  doc.setFontSize(12);
  doc.setTextColor(217, 119, 6);
  doc.text(registration.id || `EVT-${Date.now()}`, 15, 67);

  // Status Badge on the right
  const isFree = event.isFree;
  const isPending = registration.paymentStatus === 'pending' || registration.paymentMethod === 'manual';
  if (isFree) {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(120, 57, 75, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ENTRADA GRATUITA • VAGA CONFIRMADA', 157.5, 64.5, { align: 'center' });
  } else if (isPending) {
    doc.setFillColor(217, 119, 6);
    doc.roundedRect(95, 57, 100, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`PAGAMENTO PENDENTE (MANUAL) • R$ ${event.price?.toFixed(2)}`, 145, 64.5, { align: 'center' });
  } else {
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(110, 57, 85, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`PAGAMENTO CONFIRMADO • R$ ${event.price?.toFixed(2)}`, 152.5, 64.5, { align: 'center' });
  }

  // 3. Left Column: Event & Participant Details (w: 125)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, 78, 125, 156, 3, 3, 'FD');

  let currentY = 86;

  // Event section title
  doc.setFillColor(245, 158, 11);
  doc.rect(14, currentY - 4, 3, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO EVENTO', 20, currentY + 3);
  currentY += 10;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Evento:', 16, currentY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const splitTitle = doc.splitTextToSize(event.title, 110);
  doc.text(splitTitle, 16, currentY + 4.5);
  currentY += 5 + splitTitle.length * 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Categoria:', 16, currentY);
  doc.setTextColor(217, 119, 6);
  doc.setFont('helvetica', 'bold');
  doc.text(event.category, 36, currentY);
  currentY += 6;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Data & Horário:', 16, currentY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatEventDateRange(event.date, event.endDate)} às ${event.time}`, 42, currentY);
  currentY += 6;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Localização:', 16, currentY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const splitLoc = doc.splitTextToSize(`${event.location} (${event.roomReserved})`, 110);
  doc.text(splitLoc, 16, currentY + 4.5);
  currentY += 5 + splitLoc.length * 4.5;

  if (event.speakerName) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Ministração:', 16, currentY);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    const splitSpeaker = doc.splitTextToSize(event.speakerName, 110);
    doc.text(splitSpeaker, 16, currentY + 4.5);
    currentY += 5 + splitSpeaker.length * 4.5;
  }

  // Divider line
  doc.setDrawColor(226, 232, 240);
  doc.line(15, currentY, 130, currentY);
  currentY += 7;

  // Participant Section
  doc.setFillColor(245, 158, 11);
  doc.rect(14, currentY - 4, 3, 10, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO PARTICIPANTE', 20, currentY + 3);
  currentY += 10;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Nome:', 16, currentY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(participantName, 30, currentY);
  currentY += 6;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('WhatsApp:', 16, currentY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(participantPhone, 36, currentY);
  currentY += 6;

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('E-mail:', 16, currentY);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(participantEmail || 'Não informado', 30, currentY);
  currentY += 7;

  // Custom Answers Section
  if (customAnswers && Object.keys(customAnswers).length > 0 && event.customQuestions) {
    doc.setDrawColor(226, 232, 240);
    doc.line(15, currentY, 130, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(217, 119, 6);
    doc.text('QUESTIONÁRIO DO EVENTO:', 16, currentY);
    currentY += 5.5;

    event.customQuestions.forEach((q) => {
      const ans = customAnswers[q.id];
      if (!ans) return;
      let valStr = Array.isArray(ans) ? ans.join(', ') : String(ans);
      if (q.type === 'date') {
        const age = calculateAge(String(ans));
        valStr = age !== null ? `${formatDate(String(ans))} (${age} anos)` : formatDate(String(ans));
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.text(`• ${q.label}:`, 18, currentY);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      const splitAns = doc.splitTextToSize(valStr, 105);
      doc.text(splitAns, 22, currentY + 4);
      currentY += 4 + splitAns.length * 3.5;
    });
  }

  // 4. Right Column: QR Code & Access Badge (w: 60)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(140, 78, 60, 156, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('CREDENCIAL', 170, 87, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text('CHECK-IN DIGITAL', 170, 92, { align: 'center' });

  // Draw QR Code Image
  const qrBase64 = await fetchQRCodeDataUrl(`MACDP-EVT:${event.id}:${registration.id}:${participantName}`);
  if (qrBase64) {
    doc.addImage(qrBase64, 'PNG', 146, 98, 48, 48);
  } else {
    // Fallback QR box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(146, 98, 48, 48, 2, 2, 'FD');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('QR CODE DE ENTRADA', 170, 124, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const qrInstructions = doc.splitTextToSize('Apresente este código na recepção ou portaria para entrada rápida.', 52);
  doc.text(qrInstructions, 170, 154, { align: 'center' });

  // Security Badge
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(145, 172, 50, 14, 2, 2, 'F');
  doc.setTextColor(11, 17, 32);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('VÁLIDO PARA 1 PESSOA', 170, 178, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('Uso Pessoal e Intransferível', 170, 183, { align: 'center' });

  // 5. Official Church Footer Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(10, 239, 190, 48, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('ORIENTAÇÕES IMPORTANTES PARA O DIA DO EVENTO', 16, 247);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(71, 85, 105);
  doc.text('• Chegue com pelo menos 15 a 20 minutos de antecedência para credenciamento e acolhimento.', 16, 253);
  doc.text('• Traga um documento com foto ou este comprovante em seu celular ou impresso.', 16, 258);
  doc.text('• Templo Sede: Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova - Manaus / AM.', 16, 263);
  doc.text('• Dúvidas ou suporte da secretaria: WhatsApp Oficial (92) 98450-9989', 16, 268);

  const issueDate = new Date();
  const issueDateFormatted = `${issueDate.toLocaleDateString('pt-BR')} às ${issueDate.toLocaleTimeString('pt-BR')}`;
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(`Documento emitido automaticamente pelo sistema do Ministério Apostólico Caçadores da Presença em ${issueDateFormatted}.`, 105, 280, { align: 'center' });

  // Save the PDF file to user downloads
  const sanitizedTitle = event.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  doc.save(`Comprovante_Inscricao_${sanitizedTitle}.pdf`);
}

/**
 * Generates official Printable/PDF Attendee & Check-in List for the event (Landscape A4)
 */
export function generateEventRegistrationsListPDF(event: ChurchEvent): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 273mm

  const registrations = event.registrations || [];
  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const issueDate = new Date();
  const issueStr = `${issueDate.toLocaleDateString('pt-BR')} às ${issueDate.toLocaleTimeString('pt-BR')}`;

  // Column definitions (Total: 273mm)
  const colWidths = {
    seq: 10,
    name: 65,
    phone: 36,
    age: 32,
    answers: 66,
    status: 30,
    portaria: 34,
  };

  const colX = {
    seq: margin,
    name: margin + colWidths.seq,
    phone: margin + colWidths.seq + colWidths.name,
    age: margin + colWidths.seq + colWidths.name + colWidths.phone,
    answers: margin + colWidths.seq + colWidths.name + colWidths.phone + colWidths.age,
    status: margin + colWidths.seq + colWidths.name + colWidths.phone + colWidths.age + colWidths.answers,
    portaria: margin + colWidths.seq + colWidths.name + colWidths.phone + colWidths.age + colWidths.answers + colWidths.status,
  };

  const drawPageHeader = (pageNum: number) => {
    // Top Navy Block
    doc.setFillColor(11, 17, 32);
    doc.rect(margin, 10, contentWidth, 22, 'F');

    // Gold decorative stripe
    doc.setFillColor(245, 158, 11);
    doc.rect(margin, 31, contentWidth, 1.5, 'F');

    // Church Header
    doc.setTextColor(245, 158, 11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA - TEMPLO SEDE', margin + 6, 17);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('"Proibido a Entrada de Pessoas Perfeitas" • Rua Lagoa Grande, 382 - Canaranas, Manaus/AM • Tel: (92) 98450-9989', margin + 6, 22);

    doc.setTextColor(226, 232, 240);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('LISTA OFICIAL DE INSCRITOS & CONTROLE DE PORTARIA', margin + 6, 28);

    // Header Right
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Emissão: ${issueStr}`, pageWidth - margin - 6, 17, { align: 'right' });
    doc.text(`Página ${pageNum}`, pageWidth - margin - 6, 22, { align: 'right' });

    // Event Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, 35, contentWidth, 16, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(`Evento: ${event.title}`, margin + 5, 41);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const dateLocText = `Data: ${formatEventDateRange(event.date, event.endDate)} às ${event.time}  |  Local: ${event.location}${event.roomReserved ? ` (${event.roomReserved})` : ''}  |  Entrada: ${event.isFree ? 'Gratuito' : `R$ ${event.price?.toFixed(2)}`}`;
    doc.text(dateLocText, margin + 5, 47);

    // Summary stats on right
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(`Total Inscritos: ${registrations.length}  |  Confirmados na Portaria: ${checkedInCount}  |  Vagas Totais: ${event.totalCapacity}`, pageWidth - margin - 5, 45, { align: 'right' });
  };

  const drawTableHeader = (startY: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, startY, contentWidth, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);

    doc.text('#', colX.seq + 2, startY + 5.5);
    doc.text('PARTICIPANTE', colX.name + 2, startY + 5.5);
    doc.text('WHATSAPP', colX.phone + 2, startY + 5.5);
    doc.text('IDADE / NASC.', colX.age + 2, startY + 5.5);
    doc.text('RESPOSTAS DO FORMULÁRIO', colX.answers + 2, startY + 5.5);
    doc.text('PAGAMENTO', colX.status + 2, startY + 5.5);
    doc.text('ASSINATURA / PORTARIA', colX.portaria + 2, startY + 5.5);

    return startY + 8;
  };

  let pageNum = 1;
  drawPageHeader(pageNum);
  let currentY = drawTableHeader(54);

  if (registrations.length === 0) {
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, currentY, contentWidth, 15, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, currentY + 15, margin + contentWidth, currentY + 15);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhum participante inscrito neste evento até o momento.', margin + contentWidth / 2, currentY + 9, { align: 'center' });
    currentY += 20;
  } else {
    registrations.forEach((reg, index) => {
      // Check if need new page
      if (currentY > 185) {
        doc.addPage();
        pageNum++;
        drawPageHeader(pageNum);
        currentY = drawTableHeader(54);
      }

      const rowHeight = 9.5;
      const isEven = index % 2 === 0;

      // Row background
      doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      doc.rect(margin, currentY, contentWidth, rowHeight, 'F');

      // Thin bottom line
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, currentY + rowHeight, margin + contentWidth, currentY + rowHeight);

      // 1. Seq
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
      doc.setTextColor(100, 116, 139);
      doc.text(String(index + 1), colX.seq + 2, currentY + 6.2);

      // 2. Name
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const safeName = reg.name.length > 32 ? reg.name.substring(0, 30) + '...' : reg.name;
      doc.text(safeName, colX.name + 2, currentY + 4.5);
      if (reg.email) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(148, 163, 184);
        const safeEmail = reg.email.length > 36 ? reg.email.substring(0, 34) + '...' : reg.email;
        doc.text(safeEmail, colX.name + 2, currentY + 8);
      }

      // 3. Phone
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(reg.phone || '—', colX.phone + 2, currentY + 6.2);

      // 4. Age / Birth Date
      let birthDateVal: string | null = null;
      if (reg.customAnswers) {
        for (const [k, v] of Object.entries(reg.customAnswers)) {
          const qFound = event.customQuestions?.find((q) => q.id === k);
          if (qFound?.type === 'date' || qFound?.label.toLowerCase().includes('nasc') || qFound?.label.toLowerCase().includes('data')) {
            birthDateVal = String(v);
            break;
          }
        }
      }
      if (birthDateVal) {
        const age = calculateAge(birthDateVal);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(180, 83, 9);
        const ageText = age !== null ? `${age} anos` : '';
        doc.text(ageText, colX.age + 2, currentY + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(formatDate(birthDateVal), colX.age + 2, currentY + 8);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text('—', colX.age + 2, currentY + 6.2);
      }

      // 5. Custom Answers
      const answersList: string[] = [];
      if (reg.customAnswers) {
        for (const [k, v] of Object.entries(reg.customAnswers)) {
          const qFound = event.customQuestions?.find((q) => q.id === k);
          if (qFound?.type === 'date' || qFound?.label.toLowerCase().includes('nasc')) continue;
          const label = qFound ? qFound.label : k;
          const valStr = Array.isArray(v) ? v.join(', ') : String(v);
          answersList.push(`${label}: ${valStr}`);
        }
      }
      const answersText = answersList.length > 0 ? answersList.join(' | ') : 'Sem questionário';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const safeAnswers = answersText.length > 44 ? answersText.substring(0, 42) + '...' : answersText;
      doc.text(safeAnswers, colX.answers + 2, currentY + 6.2);

      // 6. Payment Status
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      if (event.isFree) {
        doc.setTextColor(16, 185, 129);
        doc.text('Gratuito', colX.status + 2, currentY + 6.2);
      } else if (reg.paymentStatus === 'pending' || reg.paymentMethod === 'manual') {
        doc.setTextColor(217, 119, 6);
        doc.text('PENDENTE (Manual)', colX.status + 2, currentY + 6.2);
      } else {
        doc.setTextColor(16, 185, 129);
        doc.text(`Confirmado (R$ ${event.price?.toFixed(2)})`, colX.status + 2, currentY + 6.2);
      }

      // 7. Check-in / Portaria Signature
      if (reg.checkedIn) {
        doc.setTextColor(16, 185, 129);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('[X] CONFIRMADO', colX.portaria + 2, currentY + 6.2);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('[  ] ________________', colX.portaria + 2, currentY + 6.2);
      }

      currentY += rowHeight;
    });
  }

  // Footer on final page
  const footerY = Math.min(pageHeight - 12, Math.max(currentY + 6, 192));
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, footerY, margin + contentWidth, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Ministério Apostólico Caçadores da Presença • Documento Oficial para Portaria e Credenciamento', margin, footerY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Assinatura do Responsável da Portaria: ____________________________________________________', pageWidth - margin, footerY + 5, { align: 'right' });

  // Save the PDF
  const safeFilename = event.title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  doc.save(`Lista_Inscritos_${safeFilename}.pdf`);
}
