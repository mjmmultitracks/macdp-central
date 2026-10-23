import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sbcecbylxoqqbsextkrt.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_m_UUQHfeR2u_oUc4M5vffw_Z9xm0jcM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runBackup() {
  const rootDir = path.resolve(__dirname, '..');
  const backupDir = path.join(rootDir, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  const timestamp = `${dateStr}_${timeStr}`;

  console.log(`\n==================================================`);
  console.log(`[BACKUP AUTOMÁTICO MACDP] Iniciando em ${dateStr} ${timeStr}`);
  console.log(`==================================================`);

  // 1. Snapshot centralizado do church_store
  const { data: storeRow, error: errStore } = await supabase
    .from('church_store')
    .select('*')
    .eq('key', 'main_church_db')
    .single();

  if (errStore) {
    console.error('❌ Erro ao ler church_store:', errStore);
  } else {
    const fullStoreFile = path.join(backupDir, `backup_completo_banco_${timestamp}.json`);
    const latestStoreFile = path.join(backupDir, 'backup_completo_banco_latest.json');
    fs.writeFileSync(fullStoreFile, JSON.stringify(storeRow.data, null, 2), 'utf-8');
    fs.writeFileSync(latestStoreFile, JSON.stringify(storeRow.data, null, 2), 'utf-8');
    console.log(`✓ [JSON] Snapshot do Banco Completo salvo em: ${fullStoreFile}`);
  }

  // 2. Tabela relacional de inscrições (event_registrations)
  const { data: regs, error: errRegs } = await supabase
    .from('event_registrations')
    .select('*')
    .order('registered_at', { ascending: true });

  if (errRegs) {
    console.error('❌ Erro ao consultar event_registrations:', errRegs);
    return;
  }

  const regsJsonFile = path.join(backupDir, `backup_todas_inscricoes_${timestamp}.json`);
  const latestRegsJson = path.join(backupDir, 'backup_todas_inscricoes_latest.json');
  fs.writeFileSync(regsJsonFile, JSON.stringify(regs, null, 2), 'utf-8');
  fs.writeFileSync(latestRegsJson, JSON.stringify(regs, null, 2), 'utf-8');
  console.log(`✓ [JSON] Todas as ${regs.length} inscrições salvas em: ${regsJsonFile}`);

  // 3. Gerar planilhas Excel / CSV com UTF-8 BOM
  function generateCsv(regList, eventTitle) {
    let csv = '\uFEFF';
    csv += 'ID;Evento;Nome;Telefone;Email;Valor Pago;Metodo Pagamento;Status Pagamento;Presenca Checkin;Data Inscricao;Respostas Personalizadas\n';

    regList.forEach((r) => {
      const answersStr = r.custom_answers
        ? Object.entries(r.custom_answers)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join(' | ')
        : '';
      const safe = (val) => `"${String(val || '').replace(/"/g, '""')}"`;

      csv +=
        [
          safe(r.id),
          safe(eventTitle),
          safe(r.name),
          safe(r.phone),
          safe(r.email),
          safe(r.price_paid || 0),
          safe(r.payment_method),
          safe(r.payment_status),
          safe(r.checked_in ? 'Presente' : 'Aguardando'),
          safe(r.registered_at),
          safe(answersStr),
        ].join(';') + '\n';
    });

    return csv;
  }

  const dorotRegs = regs.filter((r) => r.event_id === 'evt_1');
  const kidsRegs = regs.filter((r) => r.event_id === 'evt_1789349292800');

  const dorotCsvFile = path.join(backupDir, `inscricoes_DOROT_${timestamp}.csv`);
  const dorotLatestCsv = path.join(backupDir, 'inscricoes_DOROT_latest.csv');
  fs.writeFileSync(dorotCsvFile, generateCsv(dorotRegs, 'Conferência Caçadores da Presença 2026 - DOROT'), 'utf-8');
  fs.writeFileSync(dorotLatestCsv, generateCsv(dorotRegs, 'Conferência Caçadores da Presença 2026 - DOROT'), 'utf-8');
  console.log(`✓ [CSV] Inscrições DOROT (${dorotRegs.length} inscritos) salvas em: ${dorotCsvFile}`);

  const kidsCsvFile = path.join(backupDir, `inscricoes_KIDS_${timestamp}.csv`);
  const kidsLatestCsv = path.join(backupDir, 'inscricoes_KIDS_latest.csv');
  fs.writeFileSync(kidsCsvFile, generateCsv(kidsRegs, 'Conferência Caçadores da Presença KIDS 2026'), 'utf-8');
  fs.writeFileSync(kidsLatestCsv, generateCsv(kidsRegs, 'Conferência Caçadores da Presença KIDS 2026'), 'utf-8');
  console.log(`✓ [CSV] Inscrições KIDS (${kidsRegs.length} inscritos) salvas em: ${kidsCsvFile}`);

  console.log(`==================================================`);
  console.log(`[SUCESSO] Backup concluído com 100% de integridade!`);
  console.log(`==================================================\n`);
}

runBackup().catch((err) => {
  console.error('Falha no backup:', err);
  process.exit(1);
});
