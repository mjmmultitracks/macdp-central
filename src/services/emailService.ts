import { ChurchEvent, EventRegistration } from '../types';
import { getDatabase, saveDatabase } from './db';
import { formatDate, calculateAge } from '../utils/formatters';

export interface SentEmailRecord {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  htmlContent: string;
  sentAt: string;
  status: 'Entregue' | 'Enviado';
  eventId: string;
  eventTitle: string;
  amount: string;
  registrationCode: string;
}

export function sendEventConfirmationEmail(params: {
  event: ChurchEvent;
  registration: EventRegistration;
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  customAnswers?: Record<string, any>;
}): SentEmailRecord {
  const { event, registration, participantName, participantEmail, participantPhone, customAnswers } = params;

  const isFree = event.isFree && !registration.includeShirt;
  const isPending = registration.paymentStatus === 'pending' || registration.paymentMethod === 'manual';
  const paymentStatusText = isFree
    ? 'Inscrição Gratuita Confirmada'
    : isPending
    ? 'Inscrição Pré-Registrada • Pagamento Pendente (Manual)'
    : 'Pagamento Confirmado com Sucesso';

  const calculatedTotal = registration.totalPaid !== undefined
    ? registration.totalPaid
    : (event.isFree ? 0 : (event.price || 0)) + (registration.includeShirt ? (registration.shirtPrice || event.shirtPrice || 0) : 0);
  const paymentAmountText = calculatedTotal === 0 ? 'Gratuito (R$ 0,00)' : `R$ ${calculatedTotal.toFixed(2)}`;

  const pendingNoticeHtml = isPending
    ? `
      <div style="background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 14px 18px; border-radius: 8px; margin: 18px 0; font-size: 13.5px; line-height: 1.5;">
        <strong style="color: #d97706; font-size: 14px;">⏳ Pagamento Pendente (Opção Manual):</strong><br/>
        Como você optou pelo <strong>Pagamento Manual / Presencial</strong>, seu status está <strong>PENDENTE</strong>. Nossa equipe da secretaria entrará em contato com você via WhatsApp (<strong>${participantPhone}</strong>) para orientar sobre o acerto do valor e validação final da sua vaga.<br/>
        <span style="font-size: 12px; color: #b45309; margin-top: 6px; display: inline-block;">Dúvidas? Fale direto com a secretaria no WhatsApp: <strong>(92) 98450-9989</strong></span>
      </div>
    `
    : '';

  // Custom Answers HTML rows
  let customAnswersHtml = '';
  if (customAnswers && Object.keys(customAnswers).length > 0 && event.customQuestions) {
    const rows = event.customQuestions
      .map((q) => {
        const ans = customAnswers[q.id];
        if (!ans) return '';
        let val = Array.isArray(ans) ? ans.join(', ') : String(ans);
        if (q.type === 'date') {
          const age = calculateAge(String(ans));
          val = age !== null ? `${formatDate(String(ans))} (${age} anos)` : formatDate(String(ans));
        }
        return `
          <tr>
            <td style="padding: 6px 12px; color: #64748b; font-size: 13px; border-bottom: 1px solid #f1f5f9;"><strong>${q.label}:</strong></td>
            <td style="padding: 6px 12px; color: #0f172a; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9;">${val}</td>
          </tr>
        `;
      })
      .filter(Boolean)
      .join('');

    if (rows) {
      customAnswersHtml = `
        <div style="margin-top: 18px;">
          <h4 style="font-size: 13px; color: #475569; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px;">Questionário do Evento</h4>
          <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px;">
            ${rows}
          </table>
        </div>
      `;
    }
  }

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
    `MACDP-EVT:${event.id}:${registration.id}:${participantName}`
  )}`;

  const subject = `✅ Confirmação de Inscrição & Pagamento: ${event.title} - MACDP`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Top Header -->
    <div style="background: linear-gradient(135deg, #0B1120 0%, #1E293B 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #F59E0B;">
      <span style="color: #F59E0B; font-size: 12px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; display: block; margin-bottom: 6px;">
        MINISTÉRIO APOSTÓLICO CAÇADORES DA PRESENÇA
      </span>
      <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 6px 0;">
        ${event.title}
      </h1>
      <span style="display: inline-block; background: rgba(245, 158, 11, 0.2); color: #FBBF24; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(245, 158, 11, 0.4);">
        ${paymentStatusText}
      </span>
    </div>

    <!-- Main Message -->
    <div style="padding: 24px;">
      ${pendingNoticeHtml}
      <p style="font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">
        Graça e Paz, <strong>${participantName}</strong>!
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
        É com grande alegria que confirmamos a sua vaga na <strong>${event.title}</strong>. Seu pagamento e sua credencial de acesso foram validados pelo sistema oficial do MACDP.
      </p>

      <!-- Receipt Box -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Status do Pagamento:</span>
          <span style="font-size: 13px; font-weight: 800; color: #10B981;">✓ ${isFree ? 'ISENTO (GRATUITO)' : 'APROVADO / PAGO'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 12px;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Valor Pago:</span>
          <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${paymentAmountText}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase;">Código da Credencial:</span>
          <span style="font-size: 13px; font-weight: 800; color: #d97706; font-family: monospace;">${registration.id}</span>
        </div>
      </div>

      <!-- Event Details Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 110px;"><strong>Data & Hora:</strong></td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${formatDate(event.date)} às ${event.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Local:</strong></td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${event.location}</td>
        </tr>
        ${event.speakerName ? `
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>Preletores:</strong></td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${event.speakerName}</td>
        </tr>
        ` : ''}
        ${registration.includeShirt ? `
        <tr>
          <td style="padding: 8px 0; color: #d97706;"><strong>Camisa Oficial:</strong></td>
          <td style="padding: 8px 0; color: #b45309; font-weight: bold;">Sim • Tamanho ${registration.shirtSize || 'M'} (+ R$ ${(registration.shirtPrice || event.shirtPrice || 0).toFixed(2)})</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #64748b;"><strong>WhatsApp:</strong></td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${participantPhone}</td>
        </tr>
      </table>

      ${customAnswersHtml}

      <!-- QR Code Ticket Section -->
      <div style="text-align: center; margin: 28px 0 16px 0; padding: 20px; background: #fdfaf4; border: 2px dashed #F59E0B; border-radius: 12px;">
        <span style="font-size: 12px; font-weight: 800; color: #b45309; text-transform: uppercase; display: block; margin-bottom: 12px;">
          Seu QR Code de Entrada na Portaria
        </span>
        <img src="${qrCodeUrl}" alt="QR Code" width="130" height="130" style="display: inline-block; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; padding: 6px;">
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">
          Apresente este QR Code pelo celular ou impresso na entrada do templo para credenciamento instantâneo.
        </p>
      </div>

      <!-- Attachment notice -->
      <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; font-size: 12px; color: #1e40af; display: flex; align-items: center; gap: 8px;">
        <span>📎 <strong>Anexo Digital:</strong> Seu comprovante em PDF oficial de credenciamento também está disponível para download.</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e293b;">
        Ministério Apostólico Caçadores da Presença (MACDP)
      </p>
      <p style="margin: 0 0 4px 0;">
        Rua Lagoa Grande, 382 - Conj. Canaranas - Cidade Nova - Manaus/AM
      </p>
      <p style="margin: 0;">
        WhatsApp Oficial: (92) 98450-9989 • <em>"Proibido a Entrada de Pessoas Perfeitas"</em>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const emailRecord: SentEmailRecord = {
    id: `email_${Date.now()}`,
    recipientEmail: participantEmail,
    recipientName: participantName,
    subject,
    htmlContent,
    sentAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    status: 'Entregue',
    eventId: event.id,
    eventTitle: event.title,
    amount: paymentAmountText,
    registrationCode: registration.id,
  };

  // Register in Teaching Message Logs for admin traceability
  try {
    const db = getDatabase();
    if (db.teachingLogs) {
      db.teachingLogs.unshift({
        id: emailRecord.id,
        targetClass: `Inscrição Evento: ${event.title}`,
        channel: 'email',
        subject,
        message: `Comprovante de confirmação e pagamento enviado para ${participantName} (${participantEmail}) com credencial ${registration.id}.`,
        sentAt: emailRecord.sentAt,
        recipientsCount: 1,
        status: 'enviado',
      });
      saveDatabase(db);
    }
  } catch (e) {
    console.error('Erro ao registrar log de e-mail:', e);
  }

  return emailRecord;
}
