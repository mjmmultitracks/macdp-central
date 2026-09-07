import React, { useState, useEffect, useRef } from 'react';
import { ChurchEvent, EventRegistration } from '../../types';
import { addEventRegistration, getChurchSettings } from '../../services/db';
import { generatePixCopiaECola } from '../../services/pixService';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Share2,
  Sparkles,
  Ticket,
  QrCode,
  ShieldCheck,
  Send,
  Download,
  FileText,
  Eye,
  Shirt,
  Copy,
  Check,
  CreditCard,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { formatCurrency, formatDate, calculateAge, formatEventDateRange } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { generateEventVoucherPDF } from '../../utils/pdfGenerator';
import { sendEventConfirmationEmail, SentEmailRecord } from '../../services/emailService';

interface EventRegistrationWizardProps {
  event: ChurchEvent;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (reg: EventRegistration) => void;
}

export const EventRegistrationWizard: React.FC<EventRegistrationWizardProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Personal Info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Step 2: Custom Answers & Camisa Oficial
  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [includeShirt, setIncludeShirt] = useState(false);
  const [shirtSize, setShirtSize] = useState('M');

  // Allowed Payment Methods & Mercado Pago Integration
  const churchSettings = getChurchSettings();
  const isMercadoPagoConfigured = !!(
    churchSettings.mercadoPago?.enabled &&
    churchSettings.mercadoPago?.accessToken?.trim()
  );
  const isMercadoPagoAvailable = isMercadoPagoConfigured && event.mercadoPagoEnabled !== false;

  const allowedMethods = event.allowedPaymentMethods && event.allowedPaymentMethods.length > 0
    ? event.allowedPaymentMethods
    : ['pix', 'manual'];

  const defaultOption = isMercadoPagoAvailable && allowedMethods.includes('pix')
    ? 'mp_pix'
    : allowedMethods.includes('pix')
    ? 'direct_pix'
    : 'manual';

  const [paymentOption, setPaymentOption] = useState<'mp_pix' | 'mp_card' | 'direct_pix' | 'manual'>(defaultOption);

  // PIX feedback states (Direct PIX)
  const [copiedPixCode, setCopiedPixCode] = useState(false);
  const [copiedPixKey, setCopiedPixKey] = useState(false);
  const [copiedMpPixCode, setCopiedMpPixCode] = useState(false);

  // Mercado Pago States
  const [mpPayment, setMpPayment] = useState<{
    paymentId?: number | string;
    status?: string;
    statusDetail?: string;
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
  } | null>(null);
  const [isCreatingMpPix, setIsCreatingMpPix] = useState(false);
  const [isCheckingMpStatus, setIsCheckingMpStatus] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);
  const [isMpApproved, setIsMpApproved] = useState(false);
  const [isCreatingCardCheckout, setIsCreatingCardCheckout] = useState(false);
  const [cardCheckoutOpened, setCardCheckoutOpened] = useState(false);
  const pollingIntervalRef = useRef<any>(null);

  // Step 4: Success Result
  const [confirmedRegistration, setConfirmedRegistration] = useState<EventRegistration | null>(null);
  const [sentEmail, setSentEmail] = useState<SentEmailRecord | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  if (!isOpen) return null;

  const questions = event.customQuestions || [];
  const hasCustomQuestions = questions.length > 0;

  const availableShirtSizes =
    event.shirtSizes && event.shirtSizes.length > 0
      ? event.shirtSizes
      : ['PP', 'P', 'M', 'G', 'GG', 'XGG', 'Infantil 8', 'Infantil 12'];

  const eventTicketCost = event.isFree ? 0 : (event.price || 0);
  const shirtCost = event.hasShirt && includeShirt && event.shirtPrice ? event.shirtPrice : 0;
  const totalAmount = eventTicketCost + shirtCost;

  // Resolve Direct PIX Settings
  const pixKey = event.pixKey || churchSettings.pix?.key || '92991279663';
  const pixReceiver = event.pixReceiver || churchSettings.pix?.receiver || churchSettings.name || 'Ministério Apostólico Caçadores da Presença';
  const pixBank = event.pixBank || churchSettings.pix?.bank || 'Banco Bradesco';
  const pixCity = churchSettings.address?.city || 'Manaus';

  // Dynamic Direct PIX Copia e Cola Code
  const pixCode = generatePixCopiaECola({
    key: pixKey,
    name: pixReceiver,
    city: pixCity,
    amount: totalAmount,
    description: `Inscricao ${event.title.substring(0, 20)}`,
    txid: `EVT${event.id.replace(/\D/g, '').slice(-4)}${Math.floor(Math.random() * 899 + 100)}`,
  });

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiedPixCode(true);
    setTimeout(() => setCopiedPixCode(false), 3000);
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPixKey(true);
    setTimeout(() => setCopiedPixKey(false), 3000);
  };

  const handleCopyMpPixCode = () => {
    if (mpPayment?.qrCode) {
      navigator.clipboard.writeText(mpPayment.qrCode);
      setCopiedMpPixCode(true);
      setTimeout(() => setCopiedMpPixCode(false), 3000);
    }
  };

  // Generate Mercado Pago PIX
  const createMercadoPagoPix = async () => {
    if (!isMercadoPagoAvailable || totalAmount <= 0) return;
    setIsCreatingMpPix(true);
    setMpError(null);
    try {
      const res = await fetch('/api/mercadopago-create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          title: event.title,
          name: name.trim() || 'Participante MACDP',
          email: email.trim(),
          phone: phone.trim(),
          eventId: event.id,
          paymentMethod: 'pix',
          customAccessToken: churchSettings.mercadoPago?.accessToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Não foi possível gerar a cobrança via Mercado Pago.');
      }

      setMpPayment({
        paymentId: data.paymentId,
        status: data.status,
        statusDetail: data.statusDetail,
        qrCode: data.qrCode,
        qrCodeBase64: data.qrCodeBase64,
        ticketUrl: data.ticketUrl,
      });
    } catch (err: any) {
      console.error('Erro ao gerar PIX Mercado Pago:', err);
      setMpError(err.message || 'Erro ao conectar com Mercado Pago.');
    } finally {
      setIsCreatingMpPix(false);
    }
  };

  // Generate Mercado Pago Card Checkout (Preference)
  const handleOpenCardCheckout = async () => {
    setIsCreatingCardCheckout(true);
    setMpError(null);
    try {
      const res = await fetch('/api/mercadopago-create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          title: event.title,
          name: name.trim() || 'Participante MACDP',
          email: email.trim(),
          phone: phone.trim(),
          eventId: event.id,
          paymentMethod: 'preference',
          customAccessToken: churchSettings.mercadoPago?.accessToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.initPoint) {
        throw new Error(data.error || 'Erro ao gerar checkout com cartão.');
      }

      setCardCheckoutOpened(true);
      window.open(data.initPoint, '_blank');
    } catch (err: any) {
      console.error('Erro ao abrir checkout de cartão:', err);
      setMpError(err.message || 'Erro ao abrir tela de pagamento com cartão.');
    } finally {
      setIsCreatingCardCheckout(false);
    }
  };

  // Trigger Mercado Pago PIX generation when landing on Step 3
  useEffect(() => {
    if (
      currentStep === 3 &&
      totalAmount > 0 &&
      isMercadoPagoAvailable &&
      paymentOption === 'mp_pix' &&
      !mpPayment &&
      !isCreatingMpPix
    ) {
      createMercadoPagoPix();
    }
  }, [currentStep, totalAmount, isMercadoPagoAvailable, paymentOption]);

  // Validation handlers
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const canProceedStep1 =
    name.trim().length >= 3 &&
    phone.trim().length >= 8 &&
    isValidEmail(email);

  const canProceedStep2 = () => {
    if (hasCustomQuestions) {
      for (const q of questions) {
        if (q.required) {
          const ans = customAnswers[q.id];
          if (!ans || (Array.isArray(ans) && ans.length === 0) || String(ans).trim() === '') {
            return false;
          }
        }
      }
    }
    if (event.hasShirt && includeShirt && !shirtSize) {
      return false;
    }
    return true;
  };

  const handleTextAnswerChange = (qId: string, val: string) => {
    setCustomAnswers((prev: Record<string, any>) => ({ ...prev, [qId]: val }));
  };

  const handleCheckboxToggle = (qId: string, opt: string) => {
    const currentList: string[] = Array.isArray(customAnswers[qId]) ? customAnswers[qId] : [];
    if (currentList.includes(opt)) {
      setCustomAnswers((prev: Record<string, any>) => ({ ...prev, [qId]: currentList.filter((item: string) => item !== opt) }));
    } else {
      setCustomAnswers((prev: Record<string, any>) => ({ ...prev, [qId]: [...currentList, opt] }));
    }
  };

  // Execute and persist registration
  const executeRegistrationSubmit = async ({
    method,
    status,
    notes,
    mpPaymentId,
    mpStatus,
    pixCodeUsed,
  }: {
    method: 'pix' | 'credit_card' | 'manual' | 'free';
    status: 'free' | 'pending' | 'confirmed';
    notes: string;
    mpPaymentId?: string;
    mpStatus?: string;
    pixCodeUsed?: string;
  }) => {
    const finalEmail = email.trim();
    const reg = addEventRegistration(event.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: finalEmail,
      paymentMethod: totalAmount === 0 ? 'free' : method,
      paymentStatus: totalAmount === 0 ? 'free' : status,
      paymentNotes: notes,
      customAnswers,
      includeShirt,
      shirtSize: includeShirt ? shirtSize : undefined,
      shirtPrice: includeShirt ? event.shirtPrice : undefined,
      totalPaid: totalAmount,
      pixCode: pixCodeUsed,
      mercadoPagoPaymentId: mpPaymentId,
      mercadoPagoStatus: mpStatus,
    });

    if (reg) {
      setConfirmedRegistration(reg);

      // Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#009EE3', '#F59E0B', '#10B981', '#ffffff'],
        });
      } catch (e) {
        console.log(e);
      }

      // 1. Transactional confirmation email
      const emailRecord = sendEventConfirmationEmail({
        event,
        registration: reg,
        participantName: name.trim(),
        participantEmail: finalEmail,
        participantPhone: phone.trim(),
        customAnswers,
      });
      setSentEmail(emailRecord);

      // 2. Automatically generate and download PDF voucher
      setIsDownloadingPdf(true);
      try {
        await generateEventVoucherPDF({
          event,
          registration: reg,
          participantName: name.trim(),
          participantPhone: phone.trim(),
          participantEmail: finalEmail,
          customAnswers,
        });
        setPdfDownloaded(true);
      } catch (err) {
        console.error('Erro ao gerar PDF automaticamente:', err);
      } finally {
        setIsDownloadingPdf(false);
      }

      setCurrentStep(4);
      onSuccess(reg);
    }
  };

  // Real-time status polling for Mercado Pago PIX
  const checkPaymentStatus = async (silent = true) => {
    if (!mpPayment?.paymentId || isMpApproved) return;
    if (!silent) setIsCheckingMpStatus(true);
    try {
      const tokenParam = churchSettings.mercadoPago?.accessToken
        ? `&token=${encodeURIComponent(churchSettings.mercadoPago.accessToken)}`
        : '';
      const res = await fetch(`/api/mercadopago-check-status?paymentId=${mpPayment.paymentId}${tokenParam}`);
      const data = await res.json();
      if (data.isApproved || data.status === 'approved') {
        setIsMpApproved(true);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        await executeRegistrationSubmit({
          method: 'pix',
          status: 'confirmed',
          notes: `Pago via PIX Mercado Pago (ID: ${data.paymentId}) • Aprovado instantaneamente`,
          mpPaymentId: String(data.paymentId),
          mpStatus: 'approved',
          pixCodeUsed: mpPayment.qrCode,
        });
      }
    } catch (e) {
      console.error('Erro ao consultar status:', e);
    } finally {
      if (!silent) setIsCheckingMpStatus(false);
    }
  };

  useEffect(() => {
    if (currentStep === 3 && mpPayment?.paymentId && !isMpApproved && paymentOption === 'mp_pix') {
      pollingIntervalRef.current = setInterval(() => {
        checkPaymentStatus(true);
      }, 3500);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };
    }
  }, [currentStep, mpPayment?.paymentId, isMpApproved, paymentOption]);

  const handleFinalSubmit = async () => {
    if (totalAmount === 0) {
      await executeRegistrationSubmit({
        method: 'free',
        status: 'free',
        notes: 'Inscrição Gratuita Confirmada',
      });
      return;
    }

    if (paymentOption === 'manual') {
      await executeRegistrationSubmit({
        method: 'manual',
        status: 'pending',
        notes: 'Pagamento manual presencial / a combinar com a secretaria',
      });
      return;
    }

    if (paymentOption === 'direct_pix') {
      await executeRegistrationSubmit({
        method: 'pix',
        status: 'confirmed',
        notes: `Pago via PIX Direto (Chave: ${pixKey})`,
        pixCodeUsed: pixCode,
      });
      return;
    }

    if (paymentOption === 'mp_card') {
      await executeRegistrationSubmit({
        method: 'credit_card',
        status: 'pending',
        notes: 'Pagamento via Cartão de Crédito no Mercado Pago (em processamento)',
        mpStatus: 'in_process',
      });
      return;
    }

    if (paymentOption === 'mp_pix') {
      if (mpPayment?.paymentId) {
        setIsCheckingMpStatus(true);
        try {
          const tokenParam = churchSettings.mercadoPago?.accessToken
            ? `&token=${encodeURIComponent(churchSettings.mercadoPago.accessToken)}`
            : '';
          const res = await fetch(`/api/mercadopago-check-status?paymentId=${mpPayment.paymentId}${tokenParam}`);
          const data = await res.json();
          if (data.isApproved || data.status === 'approved') {
            await executeRegistrationSubmit({
              method: 'pix',
              status: 'confirmed',
              notes: `Pago via PIX Mercado Pago (ID: ${data.paymentId}) • Aprovado instantaneamente`,
              mpPaymentId: String(data.paymentId),
              mpStatus: 'approved',
              pixCodeUsed: mpPayment.qrCode,
            });
            return;
          }
        } catch (err) {
          console.error('Check status error:', err);
        } finally {
          setIsCheckingMpStatus(false);
        }
      }

      await executeRegistrationSubmit({
        method: 'pix',
        status: 'confirmed',
        notes: `Pago via PIX Mercado Pago (ID: ${mpPayment?.paymentId || 'gerado'}) • Aguardando conciliação bancária`,
        mpPaymentId: mpPayment?.paymentId ? String(mpPayment.paymentId) : undefined,
        mpStatus: mpPayment?.status || 'pending',
        pixCodeUsed: mpPayment?.qrCode,
      });
    }
  };

  const whatsAppVoucherText = `Graça e Paz! Minha inscrição na *${event.title}* no MACDP foi confirmada com sucesso! 🏛️✨\n\n🎟️ *Comprovante de Inscrição:* ${confirmedRegistration?.id || ''}\n👤 *Participante:* ${name}\n📅 *Data:* ${formatEventDateRange(event.date, event.endDate)} às ${event.time}\n📍 *Local:* ${event.location}${includeShirt ? `\n👕 *Camisa Oficial:* Sim (Tamanho: ${shirtSize})` : ''}\n💰 *Valor Total:* ${totalAmount > 0 ? `R$ ${totalAmount.toFixed(2)}` : 'Gratuito'}${confirmedRegistration?.mercadoPagoPaymentId ? `\n⚡ *Mercado Pago ID:* ${confirmedRegistration.mercadoPagoPaymentId}` : ''}\n\n🔗 *Detalhes do Evento:* ${window.location.origin}/evento/${event.id}\n\nNos vemos lá na Presença de Deus!`;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(5, 8, 16, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 0.5rem',
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-content animate-modal-pop"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(245, 158, 11, 0.15)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: 'calc(100dvh - 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header with Title & Stepper */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(11, 17, 32, 0.7) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '0.2rem 0.65rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Inscrição Oficial • {event.category}
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginTop: '0.4rem', color: 'var(--text-primary)' }}>
                {event.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} color="var(--accent-gold)" />
                  <span>{formatEventDateRange(event.date, event.endDate)} às {event.time}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} color="var(--accent-blue-light)" />
                  <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.location}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '0.4rem',
                borderRadius: '50%',
                minWidth: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Fechar formulário"
            >
              <X size={16} />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {currentStep < 4 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: currentStep === 1 ? 800 : 600, color: currentStep >= 1 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  1. Seus Dados
                </span>
                <span style={{ fontWeight: currentStep === 2 ? 800 : 600, color: currentStep >= 2 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  2. Questionário do Evento
                </span>
                <span style={{ fontWeight: currentStep === 3 ? 800 : 600, color: currentStep >= 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  3. Confirmação
                </span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%',
                    background: 'linear-gradient(90deg, #F59E0B, #D97706)',
                    transition: 'width 0.35s ease',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Wizard Body Content */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {/* ==================== STEP 1: DADOS PESSOAIS ==================== */}
          {currentStep === 1 && (
            <div key="step-1" className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                <User size={18} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Etapa 1: Dados do Participante</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Informe seus dados para a emissão do comprovante de credenciamento e comunicação do evento.
              </p>

              <div className="form-group">
                <label className="form-label">Nome Completo *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="Ex: Matheus Albuquerque"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">WhatsApp com DDD *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="92984509989"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Você receberá o comprovante neste número.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>E-mail *</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                      Obrigatório
                    </span>
                  </label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="seuemail@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                    Obrigatório: você receberá o comprovante com QR Code e a confirmação de pagamento neste e-mail.
                  </span>
                  {email.trim().length > 0 && !isValidEmail(email) && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--status-error)', marginTop: '0.25rem', display: 'block', fontWeight: 600 }}>
                      Por favor, digite um e-mail válido (exemplo: nome@gmail.com).
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-primary"
                  style={{ gap: '0.45rem', opacity: canProceedStep1 ? 1 : 0.6 }}
                >
                  <span>Avançar para Perguntas</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 2: PERGUNTAS PERSONALIZADAS ==================== */}
          {currentStep === 2 && (
            <div key="step-2" className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                <HelpCircle size={18} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Etapa 2: Perguntas Específicas do Evento
                </h4>
              </div>

              {hasCustomQuestions ? (
                <>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    A liderança do MACDP preparou as seguintes perguntas personalizadas para a organização deste evento:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        style={{
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem 1.25rem',
                        }}
                      >
                        <label
                          className="form-label"
                          style={{
                            fontSize: '0.92rem',
                            fontWeight: 700,
                            marginBottom: '0.65rem',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {idx + 1}. {q.label} {q.required && <span style={{ color: 'var(--status-error)' }}>*</span>}
                        </label>

                        {/* Text input */}
                        {q.type === 'text' && (
                          <input
                            type="text"
                            className="form-input"
                            placeholder={q.placeholder || 'Digite sua resposta...'}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          />
                        )}

                        {/* Date input */}
                        {q.type === 'date' && (
                          <div>
                            <input
                              type="date"
                              className="form-input"
                              value={customAnswers[q.id] || ''}
                              onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                            />
                            {customAnswers[q.id] && (
                              <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--accent-gold)' }}>
                                {(() => {
                                  const age = calculateAge(customAnswers[q.id]);
                                  if (age !== null) {
                                    return (
                                      <span>
                                        🎂 Data: {formatDate(customAnswers[q.id])} • <strong>{age} anos de idade</strong>
                                      </span>
                                    );
                                  }
                                  return <span>Data: {formatDate(customAnswers[q.id])}</span>;
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Number input */}
                        {q.type === 'number' && (
                          <input
                            type="number"
                            className="form-input"
                            placeholder={q.placeholder || 'Ex: 1'}
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          />
                        )}

                        {/* Select Dropdown */}
                        {q.type === 'select' && (
                          <select
                            className="form-select"
                            value={customAnswers[q.id] || ''}
                            onChange={(e) => handleTextAnswerChange(q.id, e.target.value)}
                          >
                            <option value="">Selecione uma opção...</option>
                            {(q.options || []).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {/* Radio Options */}
                        {q.type === 'radio' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(q.options || []).map((opt) => {
                              const isSelected = customAnswers[q.id] === opt;
                              return (
                                <div
                                  key={opt}
                                  onClick={() => handleTextAnswerChange(q.id, opt)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.65rem',
                                    padding: '0.6rem 0.85rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                                    border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                                    color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    fontSize: '0.86rem',
                                    fontWeight: isSelected ? 700 : 400,
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={q.id}
                                    checked={isSelected}
                                    onChange={() => {}}
                                    style={{ accentColor: 'var(--accent-gold)' }}
                                  />
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Checkbox Options */}
                        {q.type === 'checkbox' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(q.options || []).map((opt) => {
                              const selectedList: string[] = Array.isArray(customAnswers[q.id])
                                ? customAnswers[q.id]
                                : [];
                              const isChecked = selectedList.includes(opt);
                              return (
                                <div
                                  key={opt}
                                  onClick={() => handleCheckboxToggle(q.id, opt)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.65rem',
                                    padding: '0.6rem 0.85rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    background: isChecked ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                                    border: `1px solid ${isChecked ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                                    color: isChecked ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                    fontSize: '0.86rem',
                                    fontWeight: isChecked ? 700 : 400,
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {}}
                                    style={{ accentColor: 'var(--accent-gold)' }}
                                  />
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : !event.hasShirt ? (
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Este evento não requer perguntas adicionais! Você já pode avançar para a confirmação final da vaga.
                  </p>
                </div>
              ) : null}

              {/* ==================== CARD DE VENDA DE CAMISA OFICIAL ==================== */}
              {event.hasShirt && event.shirtPrice && (
                <div
                  style={{
                    background: includeShirt ? 'rgba(245, 158, 11, 0.09)' : 'var(--bg-tertiary)',
                    border: `1.5px solid ${includeShirt ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem 1.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    transition: 'all 0.2s ease',
                    boxShadow: includeShirt ? '0 4px 20px rgba(245, 158, 11, 0.15)' : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'rgba(245, 158, 11, 0.18)',
                          color: 'var(--accent-gold)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(245, 158, 11, 0.35)',
                          flexShrink: 0,
                        }}
                      >
                        <Shirt size={24} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                            Camisa Oficial do Evento
                          </span>
                          <span
                            style={{
                              background: 'var(--accent-gold)',
                              color: '#0f172a',
                              fontWeight: 900,
                              fontSize: '0.78rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            + {formatCurrency(event.shirtPrice)}
                          </span>
                        </div>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          Adquira a camiseta comemorativa oficial e retire na recepção no dia do credenciamento!
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIncludeShirt(!includeShirt)}
                      className={`btn ${includeShirt ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '0.55rem 1.15rem',
                        fontSize: '0.86rem',
                        fontWeight: 800,
                        gap: '0.45rem',
                        borderRadius: '8px',
                      }}
                    >
                      {includeShirt ? (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Camisa Inclusa</span>
                        </>
                      ) : (
                        <>
                          <span>Quero Adicionar (+ {formatCurrency(event.shirtPrice)})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Seletor de Tamanhos quando a camisa for incluída */}
                  {includeShirt && (
                    <div
                      style={{
                        borderTop: '1px solid rgba(245, 158, 11, 0.25)',
                        paddingTop: '0.9rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Escolha o seu tamanho:</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 900 }}>({shirtSize})</span>
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {availableShirtSizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setShirtSize(sz)}
                            style={{
                              padding: '0.45rem 0.95rem',
                              borderRadius: '6px',
                              fontWeight: 800,
                              fontSize: '0.85rem',
                              border: shirtSize === sz ? '2px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                              background: shirtSize === sz ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                              color: shirtSize === sz ? '#0f172a' : 'var(--text-primary)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        ✓ O valor de {formatCurrency(event.shirtPrice)} será somado ao valor total a ser pago.
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-secondary"
                  style={{ gap: '0.45rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep2()}
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-primary"
                  style={{ gap: '0.45rem', opacity: canProceedStep2() ? 1 : 0.6 }}
                >
                  <span>Revisar Inscrição</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 3: REVISÃO & CONFIRMAÇÃO ==================== */}
          {currentStep === 3 && (
            <div key="step-3" className="animate-tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                <ShieldCheck size={18} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                  Etapa 3: Revisão & Confirmação da Inscrição
                </h4>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  fontSize: '0.88rem',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    Evento:
                  </span>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    {event.title}
                  </div>
                  <div style={{ color: 'var(--accent-gold)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    {formatEventDateRange(event.date, event.endDate)} às {event.time} • {event.location}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    Participante:
                  </span>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    WhatsApp: {phone} {email ? `• ${email}` : ''}
                  </div>
                </div>

                {hasCustomQuestions && Object.keys(customAnswers).length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', marginBottom: '0.35rem', display: 'block' }}>
                      Respostas do Questionário:
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {questions.map((q) => {
                        const ans = customAnswers[q.id];
                        if (!ans) return null;
                        let formatted = Array.isArray(ans) ? ans.join(', ') : String(ans);
                        if (q.type === 'date') {
                          const age = calculateAge(String(ans));
                          formatted = age !== null ? `${formatDate(String(ans))} (${age} anos)` : formatDate(String(ans));
                        }
                        return (
                          <div key={q.id} style={{ fontSize: '0.82rem' }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>{q.label}:</strong>{' '}
                            <span style={{ color: 'var(--accent-gold-light)', fontWeight: 600 }}>{formatted}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Detalhamento de Valores */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Ingresso / Vaga do Evento:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {event.isFree ? 'Gratuito (R$ 0,00)' : formatCurrency(event.price || 0)}
                    </span>
                  </div>

                  {event.hasShirt && includeShirt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Shirt size={15} /> Camisa Oficial (Tam: {shirtSize}):
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                        + {formatCurrency(event.shirtPrice || 0)}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
                      borderTop: '1px dashed var(--border-subtle)',
                      paddingTop: '0.65rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                      VALOR TOTAL A PAGAR:
                    </span>
                    <span
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 900,
                        color: totalAmount === 0 ? 'var(--status-success)' : 'var(--accent-gold)',
                      }}
                    >
                      {totalAmount === 0 ? 'Gratuito' : formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector quando houver valor a ser cobrado */}
                {totalAmount > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.65rem' }}>
                        Escolha a Forma de Pagamento (Total: {formatCurrency(totalAmount)}):
                      </label>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMercadoPagoAvailable ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.75rem',
                        }}
                      >
                        {/* Option 1: Mercado Pago PIX (se ativo) */}
                        {isMercadoPagoAvailable && (
                          <div
                            onClick={() => setPaymentOption('mp_pix')}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              border: `2px solid ${paymentOption === 'mp_pix' ? '#009ee3' : 'var(--border-subtle)'}`,
                              background: paymentOption === 'mp_pix' ? 'rgba(0, 158, 227, 0.12)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: paymentOption === 'mp_pix' ? '#009ee3' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                              <Sparkles size={16} />
                              <span>⚡ PIX Mercado Pago</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                              Baixa automática em até 5 segundos. Liberação imediata.
                            </p>
                          </div>
                        )}

                        {/* Option 2: Mercado Pago Cartão (se ativo) */}
                        {isMercadoPagoAvailable && (
                          <div
                            onClick={() => setPaymentOption('mp_card')}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              border: `2px solid ${paymentOption === 'mp_card' ? '#009ee3' : 'var(--border-subtle)'}`,
                              background: paymentOption === 'mp_card' ? 'rgba(0, 158, 227, 0.12)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: paymentOption === 'mp_card' ? '#009ee3' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                              <CreditCard size={16} />
                              <span>💳 Cartão de Crédito</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                              Até 12x no Mercado Pago. Visa, Master, Elo, etc.
                            </p>
                          </div>
                        )}

                        {/* Option 3: PIX Direto da Igreja (sempre disponível ou fallback) */}
                        {(!isMercadoPagoAvailable || paymentOption === 'direct_pix') && allowedMethods.includes('pix') && (
                          <div
                            onClick={() => setPaymentOption('direct_pix')}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              border: `2px solid ${paymentOption === 'direct_pix' ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                              background: paymentOption === 'direct_pix' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: paymentOption === 'direct_pix' ? 'var(--accent-gold)' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                              <QrCode size={16} />
                              <span>PIX Direto da Igreja</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                              QR Code com chave da igreja. Conciliação por extrato.
                            </p>
                          </div>
                        )}

                        {/* Option 4: Pagamento Manual (se permitido) */}
                        {allowedMethods.includes('manual') && (
                          <div
                            onClick={() => setPaymentOption('manual')}
                            style={{
                              padding: '0.85rem 1rem',
                              borderRadius: '8px',
                              border: `2px solid ${paymentOption === 'manual' ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                              background: paymentOption === 'manual' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-secondary)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: paymentOption === 'manual' ? 'var(--accent-gold)' : 'var(--text-primary)', fontSize: '0.88rem' }}>
                              <HelpCircle size={16} />
                              <span>Pagamento Manual</span>
                            </div>
                            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
                              Presencial com a secretaria. Inscrição ficará pendente.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ==================== DETALHES DE PAGAMENTO: MERCADO PAGO PIX ==================== */}
                    {paymentOption === 'mp_pix' && (
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid rgba(0, 158, 227, 0.45)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        {/* Header do Card MP PIX */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: 'rgba(0, 158, 227, 0.15)',
                                color: '#009ee3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Sparkles size={19} />
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                  PIX Mercado Pago Oficial
                                </span>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#009ee3', color: '#fff' }}>
                                  AUTOMÁTICO
                                </span>
                              </div>
                              <span style={{ fontSize: '0.74rem', color: 'var(--status-success)', display: 'block', fontWeight: 600 }}>
                                ✓ Reconhecimento e baixa instantânea em tempo real
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                              Total a Pagar
                            </span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#009ee3' }}>
                              {formatCurrency(totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Error Alert if any */}
                        {mpError && (
                          <div
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              padding: '0.75rem 1rem',
                              color: '#f87171',
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '0.5rem',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <AlertCircle size={18} />
                              <span>{mpError}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={createMercadoPagoPix}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.74rem' }}
                              >
                                Tentar Novamente
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentOption('direct_pix')}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.74rem' }}
                              >
                                Usar PIX Direto
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Loading State */}
                        {isCreatingMpPix && !mpPayment && (
                          <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <RefreshCw size={28} className="animate-spin" color="#009ee3" />
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              Gerando cobrança PIX no Mercado Pago...
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              Criando QR Code exclusivo com valor de {formatCurrency(totalAmount)}.
                            </span>
                          </div>
                        )}

                        {/* QR Code and Info */}
                        {mpPayment && (
                          <>
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '170px 1fr',
                                gap: '1.25rem',
                                alignItems: 'center',
                              }}
                            >
                              {/* QR Code Container */}
                              <div
                                style={{
                                  background: '#ffffff',
                                  padding: '0.65rem',
                                  borderRadius: '12px',
                                  textAlign: 'center',
                                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                                  border: '2px solid rgba(0, 158, 227, 0.5)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                }}
                              >
                                {mpPayment.qrCodeBase64 ? (
                                  <img
                                    src={`data:image/png;base64,${mpPayment.qrCodeBase64}`}
                                    alt="QR Code PIX Mercado Pago"
                                    style={{ width: '135px', height: '135px', display: 'block', borderRadius: '4px' }}
                                  />
                                ) : mpPayment.qrCode ? (
                                  <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(mpPayment.qrCode)}`}
                                    alt="QR Code PIX"
                                    style={{ width: '135px', height: '135px', display: 'block', borderRadius: '4px' }}
                                  />
                                ) : null}
                                <span style={{ fontSize: '0.68rem', color: '#009ee3', fontWeight: 800, marginTop: '0.4rem', textTransform: 'uppercase' }}>
                                  Pagar com o App do Banco
                                </span>
                              </div>

                              {/* Status Radar & Instruções */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
                                {/* Pulse Real-time indicator */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.65rem',
                                    background: isMpApproved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 158, 227, 0.1)',
                                    border: `1px solid ${isMpApproved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 158, 227, 0.3)'}`,
                                    borderRadius: '8px',
                                    padding: '0.75rem 0.9rem',
                                  }}
                                >
                                  <div style={{ position: 'relative', width: '12px', height: '12px', flexShrink: 0 }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: isMpApproved ? '#10b981' : '#009ee3' }} />
                                    {!isMpApproved && (
                                      <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', background: '#009ee3', opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                                    )}
                                  </div>
                                  <div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isMpApproved ? 'var(--status-success)' : 'var(--text-primary)', display: 'block' }}>
                                      {isMpApproved ? '✓ Pagamento Aprovado!' : 'Aguardando pagamento no seu banco...'}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                      {isMpApproved
                                        ? 'Sua vaga foi liberada. Concluindo inscrição...'
                                        : 'O sistema detecta seu pagamento automaticamente em até 5 segundos.'}
                                    </span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    onClick={() => checkPaymentStatus(false)}
                                    disabled={isCheckingMpStatus || isMpApproved}
                                    className="btn btn-secondary btn-sm"
                                    style={{ gap: '0.4rem', fontSize: '0.76rem', fontWeight: 700 }}
                                  >
                                    <RefreshCw size={13} className={isCheckingMpStatus ? 'animate-spin' : ''} />
                                    <span>{isCheckingMpStatus ? 'Consultando...' : 'Já Paguei / Verificar Agora'}</span>
                                  </button>

                                  {/* Fallback to direct PIX */}
                                  <button
                                    type="button"
                                    onClick={() => setPaymentOption('direct_pix')}
                                    className="btn btn-secondary btn-sm"
                                    style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}
                                  >
                                    PIX Direto da Igreja
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Copia e Cola Mercado Pago */}
                            {mpPayment.qrCode && (
                              <div
                                style={{
                                  background: 'var(--bg-tertiary)',
                                  border: '1px dashed rgba(0, 158, 227, 0.45)',
                                  borderRadius: '8px',
                                  padding: '0.85rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.5rem',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#009ee3', textTransform: 'uppercase' }}>
                                    Código PIX Copia e Cola (Mercado Pago):
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    Valor: {formatCurrency(totalAmount)}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    readOnly
                                    value={mpPayment.qrCode}
                                    style={{
                                      flex: 1,
                                      background: 'var(--bg-secondary)',
                                      border: '1px solid var(--border-subtle)',
                                      borderRadius: '6px',
                                      padding: '0.45rem 0.65rem',
                                      color: 'var(--text-secondary)',
                                      fontSize: '0.78rem',
                                      fontFamily: 'monospace',
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleCopyMpPixCode}
                                    className="btn btn-primary btn-sm"
                                    style={{
                                      padding: '0.45rem 0.95rem',
                                      fontSize: '0.78rem',
                                      fontWeight: 800,
                                      gap: '0.4rem',
                                      whiteSpace: 'nowrap',
                                      background: copiedMpPixCode ? 'var(--status-success)' : '#009ee3',
                                      borderColor: copiedMpPixCode ? 'var(--status-success)' : '#009ee3',
                                    }}
                                  >
                                    {copiedMpPixCode ? <Check size={16} /> : <Copy size={16} />}
                                    <span>{copiedMpPixCode ? 'Copiado!' : 'Copiar Código'}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Instruções do evento */}
                            {event.paymentInstructions && (
                              <div
                                style={{
                                  background: 'rgba(0, 158, 227, 0.08)',
                                  border: '1px solid rgba(0, 158, 227, 0.25)',
                                  borderRadius: '6px',
                                  padding: '0.65rem 0.85rem',
                                  fontSize: '0.78rem',
                                  color: 'var(--text-secondary)',
                                  lineHeight: 1.45,
                                }}
                              >
                                ℹ️ <strong>Orientações do Evento:</strong> {event.paymentInstructions}
                              </div>
                            )}

                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                              💡 <strong>Como pagar:</strong> Copie o código acima &gt; Abra seu app bancário &gt; <strong>PIX Copia e Cola</strong> &gt; Confirme <strong>{formatCurrency(totalAmount)}</strong>. O sistema confirmará sua inscrição instantaneamente.
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* ==================== DETALHES DE PAGAMENTO: CARTÃO DE CRÉDITO ==================== */}
                    {paymentOption === 'mp_card' && (
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid rgba(0, 158, 227, 0.45)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                background: 'rgba(0, 158, 227, 0.15)',
                                color: '#009ee3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <CreditCard size={19} />
                            </div>
                            <div>
                              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                Pagamento via Cartão de Crédito
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', display: 'block' }}>
                                Parcelamento em até 12x via Mercado Pago
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                              Total
                            </span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#009ee3' }}>
                              {formatCurrency(totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Card Brands Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 700 }}>Bandeiras aceitas:</span>
                          <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>Visa</span>
                          <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>Mastercard</span>
                          <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>Elo</span>
                          <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>Hipercard</span>
                          <span style={{ background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>Amex</span>
                        </div>

                        <div
                          style={{
                            background: 'rgba(0, 158, 227, 0.08)',
                            border: '1px solid rgba(0, 158, 227, 0.25)',
                            borderRadius: '8px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            🔒 Você será direcionado para o checkout oficial e protegido do <strong>Mercado Pago</strong>, onde poderá parcelar sua vaga com total segurança.
                          </div>

                          <button
                            type="button"
                            onClick={handleOpenCardCheckout}
                            disabled={isCreatingCardCheckout}
                            className="btn btn-primary"
                            style={{
                              background: '#009ee3',
                              borderColor: '#009ee3',
                              fontWeight: 800,
                              gap: '0.5rem',
                              justifyContent: 'center',
                              padding: '0.65rem 1.25rem',
                            }}
                          >
                            <CreditCard size={18} />
                            <span>{isCreatingCardCheckout ? 'Abrindo Checkout...' : 'Pagar com Cartão no Mercado Pago'}</span>
                            <ExternalLink size={15} />
                          </button>

                          {cardCheckoutOpened && (
                            <div
                              style={{
                                background: 'rgba(16, 185, 129, 0.12)',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                borderRadius: '6px',
                                padding: '0.65rem 0.85rem',
                                color: 'var(--status-success)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.45rem',
                              }}
                            >
                              <CheckCircle2 size={16} />
                              <span>Janela de pagamento aberta! Conclua os dados do cartão e clique em "Confirmar Minha Vaga" abaixo.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ==================== DETALHES DE PAGAMENTO: PIX DIRETO DA IGREJA ==================== */}
                    {paymentOption === 'direct_pix' && (
                      <div
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        {/* Header do Card PIX */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: 'var(--accent-gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <QrCode size={18} />
                            </div>
                            <div>
                              <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                                Pagamento via PIX Oficial da Igreja
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--status-success)', display: 'block', fontWeight: 600 }}>
                                ✓ QR Code Dinâmico com Valor Exato
                              </span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                              Total a Pagar
                            </span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent-gold)' }}>
                              {formatCurrency(totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* QR Code e Dados Bancários */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '170px 1fr',
                            gap: '1.25rem',
                            alignItems: 'center',
                          }}
                        >
                          {/* QR Code Container */}
                          <div
                            style={{
                              background: '#ffffff',
                              padding: '0.65rem',
                              borderRadius: '12px',
                              textAlign: 'center',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                              border: '2px solid rgba(245, 158, 11, 0.5)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=4&data=${encodeURIComponent(pixCode)}`}
                              alt="QR Code PIX"
                              style={{ width: '135px', height: '135px', display: 'block', borderRadius: '4px' }}
                            />
                            <span style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, marginTop: '0.4rem', textTransform: 'uppercase' }}>
                              Aponte a Câmera
                            </span>
                          </div>

                          {/* Dados da Chave e Favorecido */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block' }}>
                                Favorecido / Destinatário:
                              </span>
                              <strong style={{ color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                {pixReceiver}
                              </strong>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', display: 'block' }}>
                                {pixBank}
                              </span>
                            </div>

                            {/* Box da Chave PIX direta */}
                            <div>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>
                                Chave PIX:
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <code
                                  style={{
                                    background: 'var(--bg-tertiary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '6px',
                                    padding: '0.35rem 0.65rem',
                                    color: 'var(--accent-gold)',
                                    fontWeight: 700,
                                    fontSize: '0.84rem',
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                  }}
                                >
                                  {pixKey}
                                </code>
                                <button
                                  type="button"
                                  onClick={handleCopyPixKey}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '0.35rem' }}
                                  title="Copiar Chave PIX"
                                >
                                  {copiedPixKey ? <Check size={14} color="var(--status-success)" /> : <Copy size={14} />}
                                  <span>{copiedPixKey ? 'Copiada!' : 'Copiar'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bloco do PIX Copia e Cola */}
                        <div
                          style={{
                            background: 'var(--bg-tertiary)',
                            border: '1px dashed rgba(245, 158, 11, 0.45)',
                            borderRadius: '8px',
                            padding: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              Código PIX Copia e Cola:
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              Valor: {formatCurrency(totalAmount)}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                              type="text"
                              readOnly
                              value={pixCode}
                              style={{
                                flex: 1,
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '6px',
                                padding: '0.45rem 0.65rem',
                                color: 'var(--text-secondary)',
                                fontSize: '0.78rem',
                                fontFamily: 'monospace',
                              }}
                            />
                            <button
                              type="button"
                              onClick={handleCopyPixCode}
                              className="btn btn-primary btn-sm"
                              style={{
                                padding: '0.45rem 0.95rem',
                                fontSize: '0.78rem',
                                fontWeight: 800,
                                gap: '0.4rem',
                                whiteSpace: 'nowrap',
                                background: copiedPixCode ? 'var(--status-success)' : undefined,
                                borderColor: copiedPixCode ? 'var(--status-success)' : undefined,
                              }}
                            >
                              {copiedPixCode ? <Check size={16} /> : <Copy size={16} />}
                              <span>{copiedPixCode ? 'Código Copiado!' : 'Copiar Código PIX'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Instruções Adicionais configuradas no evento */}
                        {event.paymentInstructions && (
                          <div
                            style={{
                              background: 'rgba(245, 158, 11, 0.08)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '6px',
                              padding: '0.65rem 0.85rem',
                              fontSize: '0.78rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.45,
                            }}
                          >
                            ℹ️ <strong>Orientações do Evento:</strong> {event.paymentInstructions}
                          </div>
                        )}

                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                          💡 <strong>Como pagar:</strong> Abra o app do seu banco &gt; Escolha <strong>Área PIX</strong> &gt; Clique em <strong>PIX Copia e Cola</strong> ou <strong>Ler QR Code</strong> &gt; Confirme o valor de <strong>{formatCurrency(totalAmount)}</strong> &gt; Em seguida, clique no botão <strong>"Confirmar Minha Vaga"</strong> abaixo.
                        </div>
                      </div>
                    )}

                    {/* ==================== PAGAMENTO MANUAL ==================== */}
                    {paymentOption === 'manual' && (
                      <div
                        style={{
                          padding: '0.9rem 1.15rem',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          color: 'var(--accent-gold)',
                          lineHeight: 1.5,
                        }}
                      >
                        ⏳ <strong>Atenção ao Pagamento Manual:</strong> Ao optar pelo Pagamento Manual / Presencial, sua inscrição ficará registrada com status <strong>PENDENTE</strong>. Nossa equipe da secretaria entrará em contato com você via WhatsApp (<strong>{phone}</strong>) para orientar sobre o acerto do valor de <strong>{formatCurrency(totalAmount)}</strong> e a validação final da sua credencial de acesso.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-secondary"
                  style={{ gap: '0.45rem' }}
                >
                  <ArrowLeft size={16} />
                  <span>Voltar</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="btn btn-primary"
                  style={{ gap: '0.45rem', padding: '0.65rem 1.5rem', fontWeight: 900 }}
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {paymentOption === 'manual' && totalAmount > 0
                      ? 'Concluir Inscrição (Pagamento Manual)'
                      : paymentOption === 'mp_card'
                      ? 'Confirmar Inscrição com Cartão'
                      : isMpApproved
                      ? 'Concluir Inscrição (Aprovada)'
                      : 'Confirmar Minha Vaga'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== STEP 4: COMPROVANTE & SUCESSO ==================== */}
          {currentStep === 4 && (
            <div
              key="step-4"
              className="animate-tab-content"
              style={{
                textAlign: 'center',
                padding: '1.5rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              {/* Status Header based on Pending or Confirmed */}
              {confirmedRegistration?.paymentStatus === 'pending' || confirmedRegistration?.paymentMethod === 'manual' ? (
                <>
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '2px solid var(--accent-gold)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 30px rgba(245, 158, 11, 0.25)',
                    }}
                  >
                    <Clock size={40} />
                  </div>

                  <div>
                    <span
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: 'var(--accent-gold)',
                        padding: '0.3rem 0.85rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        border: '1px solid rgba(245, 158, 11, 0.4)',
                      }}
                    >
                      ⏳ Inscrição Registrada • Pagamento Pendente
                    </span>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.65rem', color: 'var(--text-primary)' }}>
                      Inscrição Registrada, {name}!
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '480px', margin: '0.4rem auto 0 auto', lineHeight: 1.5 }}>
                      Sua inscrição na <strong>{event.title}</strong> foi registrada no sistema. Como você escolheu <strong>Pagamento Manual / Presencial</strong>, seu status está <strong>PENDENTE</strong>. Nossa equipe da secretaria entrará em contato via WhatsApp (<strong>{phone}</strong>) para orientar sobre o acerto do valor e validar sua vaga.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid var(--status-success)',
                      color: 'var(--status-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <CheckCircle2 size={42} />
                  </div>

                  <div>
                    <span
                      style={{
                        background: confirmedRegistration?.mercadoPagoPaymentId
                          ? 'rgba(0, 158, 227, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                        color: confirmedRegistration?.mercadoPagoPaymentId
                          ? '#009ee3'
                          : 'var(--accent-gold)',
                        padding: '0.3rem 0.8rem',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        border: confirmedRegistration?.mercadoPagoPaymentId
                          ? '1px solid rgba(0, 158, 227, 0.4)'
                          : undefined,
                      }}
                    >
                      {confirmedRegistration?.mercadoPagoPaymentId
                        ? `⚡ Aprovado pelo Mercado Pago • ID: ${confirmedRegistration.mercadoPagoPaymentId}`
                        : confirmedRegistration?.paymentMethod === 'credit_card'
                        ? '💳 Cartão de Crédito • Mercado Pago'
                        : '🎉 Vaga Confirmada com Sucesso!'}
                    </span>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.65rem', color: 'var(--text-primary)' }}>
                      Glória a Deus, {name}!
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '480px', margin: '0.4rem auto 0 auto' }}>
                      Sua vaga na <strong>{event.title}</strong> está garantida! O comprovante em PDF oficial foi baixado e o e-mail de confirmação foi enviado.
                    </p>
                  </div>
                </>
              )}

              {/* Action Cards: PDF Download & Email Confirmation */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                  width: '100%',
                  maxWidth: '520px',
                }}
              >
                {/* PDF Card */}
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.88rem' }}>
                      <FileText size={16} />
                      <span>Comprovante em PDF</span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.75rem 0' }}>
                      {pdfDownloaded ? '✓ Arquivo PDF oficial baixado.' : 'PDF oficial para impressão e portaria.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isDownloadingPdf}
                    onClick={async () => {
                      if (!confirmedRegistration) return;
                      setIsDownloadingPdf(true);
                      await generateEventVoucherPDF({
                        event,
                        registration: confirmedRegistration,
                        participantName: name,
                        participantPhone: phone,
                        participantEmail: email || `${name.toLowerCase().replace(/\s+/g, '.')}@evento.macdp.com.br`,
                        customAnswers,
                      });
                      setIsDownloadingPdf(false);
                      setPdfDownloaded(true);
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '0.4rem', width: '100%', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 800 }}
                  >
                    <Download size={14} />
                    <span>{isDownloadingPdf ? 'Gerando...' : 'Baixar Novamente (PDF)'}</span>
                  </button>
                </div>

                {/* Email Confirmation Card */}
                <div
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--status-success)', fontWeight: 800, fontSize: '0.88rem' }}>
                      <Mail size={16} />
                      <span>E-mail & Pagamento</span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0.75rem 0' }}>
                      Recibo de pagamento enviado para <strong>{sentEmail?.recipientEmail || email}</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ gap: '0.4rem', width: '100%', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    <Eye size={14} />
                    <span>Visualizar E-mail</span>
                  </button>
                </div>
              </div>

              {/* Digital Voucher Ticket */}
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(245, 158, 11, 0.08) 100%)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  maxWidth: '520px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    padding: '0.4rem',
                    borderRadius: '8px',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=95x95&data=${encodeURIComponent(
                      `MACDP-EVT:${event.id}:${confirmedRegistration?.id}:${name}`
                    )}`}
                    alt="QR Code Check-in"
                    style={{ width: '85px', height: '85px', display: 'block' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.82rem' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Credencial Oficial de Acesso
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {confirmedRegistration?.id || 'EVT-CONFIRMADO'}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {name}
                  </div>
                  {confirmedRegistration?.includeShirt && (
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Shirt size={14} />
                      <span>Camisa Oficial: Tam {confirmedRegistration.shirtSize || 'M'}</span>
                    </div>
                  )}
                  {confirmedRegistration?.totalPaid !== undefined && confirmedRegistration.totalPaid > 0 && (
                    <div style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                      Total: {formatCurrency(confirmedRegistration.totalPaid)}{' '}
                      {confirmedRegistration.mercadoPagoPaymentId
                        ? '• ⚡ Pago via Mercado Pago'
                        : confirmedRegistration.paymentMethod === 'credit_card'
                        ? '• 💳 Cartão de Crédito'
                        : confirmedRegistration.paymentMethod === 'pix'
                        ? '• ⚡ Pago via PIX'
                        : '• ⏳ Pagamento Manual (Pendente)'}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Apresente este QR Code ou o PDF na portaria para entrada no templo.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsAppVoucherText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ gap: '0.45rem', background: '#25D366', borderColor: '#25D366' }}
                >
                  <Share2 size={16} />
                  <span>Compartilhar no WhatsApp</span>
                </a>
                <button onClick={onClose} className="btn btn-secondary">
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL DE PREVIEW DO E-MAIL ENVIADO */}
        {isEmailModalOpen && sentEmail && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10005,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                color: '#1e293b',
                borderRadius: 'var(--radius-xl)',
                width: '100%',
                maxWidth: '660px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Email Client Header */}
              <div
                style={{
                  background: '#0B1120',
                  color: '#ffffff',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid var(--accent-gold)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 800, textTransform: 'uppercase' }}>
                    E-mail Oficial Transacional • MACDP
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: '#fff' }}>
                    {sentEmail.subject}
                  </h4>
                </div>
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.35rem',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Email Envelope Metadata */}
              <div
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '0.85rem 1.25rem',
                  fontSize: '0.82rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div>
                  <strong style={{ color: '#64748b' }}>De:</strong>{' '}
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>Secretaria MACDP &lt;secretaria@macdp.com.br&gt;</span>
                </div>
                <div>
                  <strong style={{ color: '#64748b' }}>Para:</strong>{' '}
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{sentEmail.recipientName} &lt;{sentEmail.recipientEmail}&gt;</span>
                </div>
                <div>
                  <strong style={{ color: '#64748b' }}>Data:</strong>{' '}
                  <span style={{ color: '#0f172a' }}>{sentEmail.sentAt}</span>
                </div>
              </div>

              {/* Email Body HTML Preview */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f1f5f9' }}>
                <div
                  dangerouslySetInnerHTML={{ __html: sentEmail.htmlContent }}
                  style={{ borderRadius: '12px', overflow: 'hidden' }}
                />
              </div>

              {/* Email Client Footer */}
              <div
                style={{
                  background: '#ffffff',
                  borderTop: '1px solid #e2e8f0',
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.4rem 1rem' }}
                >
                  Fechar Visualização
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
