import React, { useState } from 'react';
import { CellGroup, Member } from '../../types';
import { addMember } from '../../services/db';
import {
  UserCheck,
  CheckCircle2,
  Heart,
  Church,
  Users,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  X,
  Share2,
  Send,
} from 'lucide-react';

interface MemberSelfRegistrationProps {
  cells: CellGroup[];
  isOpen: boolean;
  onClose: () => void;
  onSuccessNotification?: (msg: string) => void;
}

export const MemberSelfRegistration: React.FC<MemberSelfRegistrationProps> = ({
  cells,
  isOpen,
  onClose,
  onSuccessNotification,
}) => {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [maritalStatus, setMaritalStatus] = useState<Member['maritalStatus']>('Solteiro(a)');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Manaus');
  const [isBaptized, setIsBaptized] = useState<'sim' | 'nao'>('sim');
  const [baptismDate, setBaptismDate] = useState('');
  const [cellGroupId, setCellGroupId] = useState('');
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [spiritualGifts, setSpiritualGifts] = useState('');
  const [howHeard, setHowHeard] = useState('Convite de Amigo / Familiar');
  const [notes, setNotes] = useState('');

  // Status
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdMemberName, setCreatedMemberName] = useState('');

  if (!isOpen) return null;

  const availableMinistries = [
    'Louvor & Adoração',
    'Caçadores Kids (Infantil)',
    'Comunicação & Mídia',
    'Recepção & Acolhimento',
    'Dança & Artes',
    'Intercessão & Oração',
    'Diaconia & Apoio',
    'Ensino Bíblico & Discipulado',
    'Células & Jovens',
    'Ação Social',
  ];

  const toggleMinistry = (min: string) => {
    if (selectedMinistries.includes(min)) {
      setSelectedMinistries(selectedMinistries.filter((m) => m !== min));
    } else {
      setSelectedMinistries([...selectedMinistries, min]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Por favor, preencha seu nome e telefone/WhatsApp.');
      return;
    }

    const newMemberData: Omit<Member, 'id'> = {
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@membro.macdp.com.br`,
      phone: phone.trim(),
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      status: 'ativo',
      roleInChurch: 'Membro',
      birthDate,
      baptismDate: isBaptized === 'sim' ? baptismDate : undefined,
      membershipDate: new Date().toISOString().split('T')[0],
      maritalStatus,
      address: {
        street: street.trim() || 'Rua Principal',
        neighborhood: neighborhood.trim() || 'Cidade Nova',
        city: city.trim() || 'Manaus',
        zip: '69090-000',
      },
      ministries: selectedMinistries,
      cellGroupId: cellGroupId || undefined,
      spiritualGifts: spiritualGifts ? spiritualGifts.split(',').map((s) => s.trim()) : [],
      attendanceRate: 100,
      notes: notes
        ? `[Auto-Cadastro pelo Link] Como conheceu: ${howHeard}. Mensagem: ${notes}`
        : `[Auto-Cadastro pelo Link] Como conheceu: ${howHeard}.`,
    };

    addMember(newMemberData);
    setCreatedMemberName(name);
    setIsSubmitted(true);
    if (onSuccessNotification) {
      onSuccessNotification(`Novo cadastro de membro recebido: ${name}!`);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
    setStreet('');
    setNeighborhood('');
    setNotes('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        overflowY: 'auto',
      }}
    >
      <div
        className="modal-content animate-modal-pop"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(245, 158, 11, 0.12)',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(11, 17, 32, 0.6) 100%)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  color: '#0B1120',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                }}
              >
                <Church size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  Ficha Oficial de Cadastro de Membro
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                  Ministério Apostólico Caçadores da Presença (MACDP)
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', marginTop: '0.35rem' }}>
              "Proibido a Entrada de Pessoas Perfeitas." Seja muito bem-vindo à família de Caçadores da Presença em Manaus!
            </p>
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

        {/* Content Body */}
        <div style={{ padding: '1.75rem', overflowY: 'auto', flex: 1 }}>
          {isSubmitted ? (
            /* Confirmation Success Screen */
            <div
              style={{
                textAlign: 'center',
                padding: '2.5rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
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
                <CheckCircle2 size={44} />
              </div>

              <div>
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-gold)',
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  🎉 Cadastro Concluído com Sucesso!
                </span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.75rem', color: 'var(--text-primary)' }}>
                  Glória a Deus, {createdMemberName}!
                </h4>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.98rem',
                    lineHeight: 1.7,
                    maxWidth: '520px',
                    margin: '0.75rem auto 0 auto',
                  }}
                >
                  Você agora está registrado oficialmente como membro do <strong>MACDP</strong>. Nossos pastores e
                  líderes já receberam suas informações e estarão orando e em contato com você pelo WhatsApp!
                </p>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  maxWidth: '500px',
                  width: '100%',
                  textAlign: 'left',
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                  <Sparkles size={16} />
                  <strong>Próximos Passos no MACDP:</strong>
                </div>
                <div>• Venha adorar conosco aos Domingos (18h) na Rua Lagoa Grande, 382 - Canaranas.</div>
                <div>• Participe de uma Célula próxima da sua casa para crescer em comunhão.</div>
                <div>• Dúvidas ou oração? Fale conosco no WhatsApp oficial: <strong>(92) 98450-9989</strong>.</div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href="https://api.whatsapp.com/send?phone=5592984509989&text=Ol%C3%A1%2C%20acabei%20de%20preencher%20meu%20cadastro%20de%20membro%20no%20MACDP!"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ gap: '0.45rem', background: '#25D366', borderColor: '#25D366' }}
                >
                  <Send size={16} />
                  <span>Falar com o MACDP no WhatsApp</span>
                </a>

                <button onClick={handleReset} className="btn btn-secondary">
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Step 1: Dados Pessoais */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.85rem',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <UserCheck size={18} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>1. Dados Pessoais</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Seu Nome Completo *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Ex: João da Silva Santos"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp / Celular com DDD *</label>
                    <input
                      type="tel"
                      required
                      className="form-input"
                      placeholder="92984509989"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="exemplo@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data de Nascimento *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estado Civil</label>
                    <select
                      className="form-select"
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                    >
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Endereço */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.85rem',
                    color: 'var(--accent-blue-light)',
                  }}
                >
                  <MapPin size={18} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>2. Seu Endereço em Manaus</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Rua e Número</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Rua Lagoa Grande, 382"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bairro</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Canaranas / Cidade Nova"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cidade / UF</label>
                    <input
                      type="text"
                      className="form-input"
                      value={`${city} / AM`}
                      disabled
                      style={{ opacity: 0.8 }}
                    />
                  </div>
                </div>
              </div>

              {/* Step 3: Vida Espiritual & Célula */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.85rem',
                    color: 'var(--accent-gold)',
                  }}
                >
                  <Compass size={18} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>3. Célula & Vida Espiritual</h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Já foi batizado(a) nas águas?</label>
                    <select
                      className="form-select"
                      value={isBaptized}
                      onChange={(e) => setIsBaptized(e.target.value as any)}
                    >
                      <option value="sim">Sim, já sou batizado(a)</option>
                      <option value="nao">Não, desejo me batizar</option>
                    </select>
                  </div>

                  {isBaptized === 'sim' ? (
                    <div className="form-group">
                      <label className="form-label">Ano / Data do Batismo (se souber)</label>
                      <input
                        type="date"
                        className="form-input"
                        value={baptismDate}
                        onChange={(e) => setBaptismDate(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">Interesse em Discipulado</label>
                      <input
                        type="text"
                        className="form-input"
                        disabled
                        value="Iremos te avisar sobre o próximo batismo!"
                        style={{ color: 'var(--accent-gold)' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Célula que Frequenta ou Deseja Entrar</label>
                    <select
                      className="form-select"
                      value={cellGroupId}
                      onChange={(e) => setCellGroupId(e.target.value)}
                    >
                      <option value="">Ainda não tenho célula (Quero indicação da liderança)</option>
                      {cells.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} - Líder: {c.leaderName} ({c.neighborhood})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Como conheceu o MACDP?</label>
                    <select
                      className="form-select"
                      value={howHeard}
                      onChange={(e) => setHowHeard(e.target.value)}
                    >
                      <option value="Convite de Amigo / Familiar">Convite de Amigo / Familiar</option>
                      <option value="Célula no Bairro">Célula no Bairro</option>
                      <option value="Instagram / Redes Sociais">Instagram / Redes Sociais</option>
                      <option value="Passando na frente da Igreja">Passando na frente da Igreja</option>
                      <option value="Eventos / Ação Social">Eventos / Ação Social</option>
                    </select>
                  </div>
                </div>

                {/* Ministries of Interest */}
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="form-label">Ministérios que você deseja servir ou tem afinidade:</label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.45rem',
                      background: 'var(--bg-tertiary)',
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {availableMinistries.map((min) => {
                      const isChecked = selectedMinistries.includes(min);
                      return (
                        <label
                          key={min}
                          onClick={() => toggleMinistry(min)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            color: isChecked ? 'var(--accent-gold)' : 'var(--text-secondary)',
                            fontWeight: isChecked ? 700 : 400,
                            padding: '0.25rem',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            style={{ accentColor: 'var(--accent-gold)' }}
                          />
                          <span>{min}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Dons, Talentos ou Habilidades (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Toco violão, canto, edição de vídeo, pedagogia infantil, enfermagem..."
                    value={spiritualGifts}
                    onChange={(e) => setSpiritualGifts(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="form-label">Mensagem para os Pastores / Pedido de Oração</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Deixe uma palavra, testemunho ou pedido para o nosso conselho pastoral orar por você..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1.25rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gap: '0.45rem', padding: '0.65rem 1.5rem', fontWeight: 800 }}
                >
                  <CheckCircle2 size={18} />
                  <span>Enviar Meu Cadastro de Membro</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
