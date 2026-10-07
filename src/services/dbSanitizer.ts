import { DatabaseSchema } from '../types';

/**
 * Higieniza o banco de dados removendo quaisquer dados fictícios,
 * mockups ou resquícios de testes em cache ou persistidos no Supabase.
 */
export function sanitizeDatabase(rawDb: DatabaseSchema): { sanitized: DatabaseSchema; hasChanged: boolean } {
  if (!rawDb || typeof rawDb !== 'object') {
    return { sanitized: rawDb, hasChanged: false };
  }

  let hasChanged = false;
  const db: DatabaseSchema = { ...rawDb };

  // 1. Escalas de Culto (schedules)
  if (!Array.isArray(db.schedules)) {
    db.schedules = [];
    hasChanged = true;
  } else if (db.schedules.some((s) => s.id && s.id.startsWith('sch_'))) {
    db.schedules = db.schedules.filter((s) => !s.id || !s.id.startsWith('sch_'));
    hasChanged = true;
  }

  // 2. Ministério Infantil (kidsChildren)
  if (!Array.isArray(db.kidsChildren)) {
    db.kidsChildren = [];
    hasChanged = true;
  } else if (db.kidsChildren.some((k) => k.id && k.id.startsWith('kid_'))) {
    db.kidsChildren = db.kidsChildren.filter((k) => !k.id || !k.id.startsWith('kid_'));
    hasChanged = true;
  }

  // 3. Lições Kids (kidsLessons)
  if (!Array.isArray(db.kidsLessons)) {
    db.kidsLessons = [];
    hasChanged = true;
  } else if (db.kidsLessons.some((l) => l.id && (l.id.startsWith('kl_') || l.id.startsWith('les_')))) {
    db.kidsLessons = db.kidsLessons.filter((l) => !l.id || (!l.id.startsWith('kl_') && !l.id.startsWith('les_')));
    hasChanged = true;
  }

  // 4. Patrimônio (patrimonyAssets)
  if (!Array.isArray(db.patrimonyAssets)) {
    db.patrimonyAssets = [];
    hasChanged = true;
  } else if (db.patrimonyAssets.some((a) => a.id && a.id.startsWith('ast_'))) {
    db.patrimonyAssets = db.patrimonyAssets.filter((a) => !a.id || !a.id.startsWith('ast_'));
    hasChanged = true;
  }

  // 5. Ensino - Turmas (teachingClasses)
  if (!Array.isArray(db.teachingClasses)) {
    db.teachingClasses = [];
    hasChanged = true;
  } else if (db.teachingClasses.some((c) => c.id && c.id.startsWith('tc_'))) {
    db.teachingClasses = db.teachingClasses.filter((c) => !c.id || !c.id.startsWith('tc_'));
    hasChanged = true;
  }

  // 6. Ensino - Materiais (teachingMaterials)
  if (!Array.isArray(db.teachingMaterials)) {
    db.teachingMaterials = [];
    hasChanged = true;
  } else if (db.teachingMaterials.some((m) => m.id && m.id.startsWith('mat_'))) {
    db.teachingMaterials = db.teachingMaterials.filter((m) => !m.id || !m.id.startsWith('mat_'));
    hasChanged = true;
  }

  // 7. Ensino - Logs (teachingLogs)
  if (!Array.isArray(db.teachingLogs)) {
    db.teachingLogs = [];
    hasChanged = true;
  } else if (db.teachingLogs.some((l) => l.id && l.id.startsWith('log_'))) {
    db.teachingLogs = db.teachingLogs.filter((l) => !l.id || !l.id.startsWith('log_'));
    hasChanged = true;
  }

  // 8. Contas Bancárias (bankAccounts)
  if (!Array.isArray(db.bankAccounts)) {
    db.bankAccounts = [];
    hasChanged = true;
  } else {
    const isMockAccount = (b: any) =>
      (['acc_1', 'acc_2', 'acc_3'].includes(b.id) &&
        (b.initialBalance === 12500 || b.initialBalance === 5800 || b.initialBalance === 850)) ||
      b.accountNumber === '12345-6' ||
      b.accountNumber === '9876543-2';

    if (db.bankAccounts.some(isMockAccount)) {
      db.bankAccounts = db.bankAccounts.filter((b) => !isMockAccount(b));
      hasChanged = true;
    }
  }

  // 9. CNPJ fictício
  if (db.churchSettings && db.churchSettings.cnpj === '34.567.890/0001-12') {
    db.churchSettings = { ...db.churchSettings, cnpj: '' };
    hasChanged = true;
  }

  // 10. Agendamentos Pastorais
  if (!Array.isArray(db.pastoralAppointments)) {
    db.pastoralAppointments = [];
    hasChanged = true;
  }

  // 11. Pedidos de Oração
  if (!Array.isArray(db.prayers)) {
    db.prayers = [];
    hasChanged = true;
  }

  // 12. Células (cells)
  if (!Array.isArray(db.cells)) {
    db.cells = [];
    hasChanged = true;
  } else {
    const isMockCell = (c: any) =>
      ['cell_1', 'cell_2', 'cell_3', 'cell_4', 'cell_5', 'cell_6'].includes(c.id) ||
      c.name === 'Célula Canaranas da Presença' ||
      c.name === 'Célula Conexão Jovem Cidade Nova' ||
      c.name === 'Célula Aliança de Casais Flores' ||
      c.name === 'Célula Família da Fé Ponta Negra' ||
      c.name === 'Célula Mulheres da Presença Adrianópolis' ||
      c.name === 'Célula Homens da Presença Aleixo';

    if (db.cells.some(isMockCell)) {
      db.cells = db.cells.filter((c) => !isMockCell(c));
      hasChanged = true;
    }
  }

  // 13. Eventos indevidos (expurgar apenas se for mockup residual com preco antigo de R$ 100)
  if (Array.isArray(db.events) && db.events.some((e) => e.title?.toLowerCase().includes('kids') && e.price === 100)) {
    db.events = db.events.filter((e) => !(e.title?.toLowerCase().includes('kids') && e.price === 100));
    hasChanged = true;
  }

  return { sanitized: db, hasChanged };
}
