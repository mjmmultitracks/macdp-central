import { DatabaseSchema, ChurchEvent, EventRegistration, Member, CellGroup, PrayerRequest, FinancialTransaction } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { sanitizeDatabase } from './dbSanitizer';

const STORE_KEY = 'main_church_db';
let isSyncing = false;
let lastSyncTimestamp = 0;

/**
 * Salva e sincroniza o banco completo no Supabase
 * Atualiza o snapshot central (church_store) e as tabelas relacionais do Supabase
 */
export async function pushDatabaseToSupabase(data: DatabaseSchema): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    isSyncing = true;
    lastSyncTimestamp = Date.now();

    // 1. Snapshot centralizado (Single Source of Truth de todas as entidades)
    const { error: storeError } = await supabase
      .from('church_store')
      .upsert({ key: STORE_KEY, data, updated_at: new Date().toISOString() });

    if (storeError) {
      console.warn('Erro ao sincronizar snapshot no Supabase church_store:', storeError);
    }

    // 2. Sincroniza Eventos e Inscrições nas tabelas relacionais
    if (data.events && Array.isArray(data.events)) {
      const activeEventIds = data.events.map((e) => e.id);
      const formattedEvents = data.events.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        end_date: e.endDate || null,
        time: e.time,
        end_time: e.endTime || null,
        location: e.location,
        room_reserved: e.roomReserved || null,
        description: e.description || null,
        image_url: e.imageUrl || null,
        speaker_name: e.speakerName || null,
        total_capacity: e.totalCapacity,
        registered_count: e.registeredCount,
        is_free: e.isFree,
        price: e.price || 0,
        pix_key: (e as any).pixKey || null,
        organizer_contact: (e as any).organizerContact || null,
        detailed_schedule: e.detailedSchedule || null,
        custom_questions: e.customQuestions || [],
      }));

      if (formattedEvents.length > 0) {
        await supabase.from('events').upsert(formattedEvents);
      }

      // Reconciliação: remove eventos órfãos que foram deletados no painel
      try {
        const { data: remoteEvents } = await supabase.from('events').select('id');
        if (remoteEvents) {
          const orphanEventIds = remoteEvents.map((e) => e.id).filter((id) => !activeEventIds.includes(id));
          if (orphanEventIds.length > 0) {
            await supabase.from('events').delete().in('id', orphanEventIds);
          }
        }
      } catch (err) {
        console.warn('Reconciliação de eventos no Supabase:', err);
      }

      // Sincroniza Inscrições de cada evento
      const allRegistrations: any[] = [];
      const activeRegIds: string[] = [];

      data.events.forEach((evt) => {
        (evt.registrations || []).forEach((r) => {
          activeRegIds.push(r.id);
          allRegistrations.push({
            id: r.id,
            event_id: evt.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            ticket_type: (r as any).ticketType || null,
            price_paid: (r as any).pricePaid || r.totalPaid || 0,
            payment_method: r.paymentMethod || 'free',
            payment_status: r.paymentStatus || 'free',
            payment_notes: r.paymentNotes || null,
            checked_in: Boolean(r.checkedIn),
            checked_in_at: (r as any).checkedInAt || null,
            registered_at: r.registeredAt || new Date().toISOString(),
            custom_answers: r.customAnswers || {},
          });
        });
      });

      if (allRegistrations.length > 0) {
        await supabase.from('event_registrations').upsert(allRegistrations);
      }

      // Reconciliação: remove inscrições órfãs que foram deletadas no painel
      try {
        const { data: remoteRegs } = await supabase.from('event_registrations').select('id');
        if (remoteRegs) {
          const orphanRegIds = remoteRegs.map((r) => r.id).filter((id) => !activeRegIds.includes(id));
          if (orphanRegIds.length > 0) {
            await supabase.from('event_registrations').delete().in('id', orphanRegIds);
          }
        }
      } catch (err) {
        console.warn('Reconciliação de inscrições no Supabase:', err);
      }
    }

    // 3. Sincroniza Pedidos de Oração
    if (data.prayers && Array.isArray(data.prayers)) {
      const activePrayerIds = data.prayers.map((p) => p.id);
      const formattedPrayers = data.prayers.map((p) => ({
        id: p.id,
        requester_name: p.requesterName,
        is_anonymous: Boolean(p.isAnonymous),
        is_private: Boolean(p.isPrivate),
        phone: p.phone || null,
        email: p.email || null,
        category: p.category,
        message: p.message,
        request_pastoral_contact: Boolean(p.requestPastoralContact),
        status: p.status,
        pastoral_notes: p.pastoralNotes || null,
        created_at: p.createdAt || new Date().toISOString(),
      }));

      if (formattedPrayers.length > 0) {
        await supabase.from('prayers').upsert(formattedPrayers);
      }

      // Reconciliação de orações deletadas
      try {
        const { data: remotePrayers } = await supabase.from('prayers').select('id');
        if (remotePrayers) {
          const orphanPrayerIds = remotePrayers.map((p) => p.id).filter((id) => !activePrayerIds.includes(id));
          if (orphanPrayerIds.length > 0) {
            await supabase.from('prayers').delete().in('id', orphanPrayerIds);
          }
        }
      } catch (err) {
        console.warn('Reconciliação de orações no Supabase:', err);
      }
    }

    // 4. Sincroniza Membros (CRM)
    if (data.members && Array.isArray(data.members)) {
      const activeMemberIds = data.members.map((m) => m.id);
      const formattedMembers = data.members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email || null,
        phone: m.phone,
        photo_url: m.photoUrl || null,
        status: m.status,
        role_in_church: m.roleInChurch,
        birth_date: m.birthDate || null,
        baptism_date: m.baptismDate || null,
        membership_date: m.membershipDate,
        marital_status: m.maritalStatus || null,
        address: m.address || {},
        ministries: m.ministries || [],
        cell_group_id: m.cellGroupId || null,
        spiritual_gifts: m.spiritualGifts || [],
        attendance_rate: m.attendanceRate || 100,
        notes: m.notes || null,
      }));

      if (formattedMembers.length > 0) {
        await supabase.from('members').upsert(formattedMembers);
      }

      // Reconciliação de membros deletados
      try {
        const { data: remoteMembers } = await supabase.from('members').select('id');
        if (remoteMembers) {
          const orphanMemberIds = remoteMembers.map((m) => m.id).filter((id) => !activeMemberIds.includes(id));
          if (orphanMemberIds.length > 0) {
            await supabase.from('members').delete().in('id', orphanMemberIds);
          }
        }
      } catch (err) {
        console.warn('Reconciliação de membros no Supabase:', err);
      }
    }

    // 5. Sincroniza Transações Financeiras
    if (data.transactions && Array.isArray(data.transactions)) {
      const activeTxIds = data.transactions.map((t) => t.id);
      const formattedTx = data.transactions.map((t) => ({
        id: t.id,
        type: t.type,
        category: t.category,
        description: t.description || '',
        amount: t.amount || 0,
        date: t.date || new Date().toISOString().split('T')[0],
        payment_method: t.paymentMethod || 'pix',
        member_or_vendor: t.memberOrVendor || null,
        receipt_number: t.receiptNumber || null,
        status: t.status || 'confirmado',
      }));

      if (formattedTx.length > 0) {
        await supabase.from('financial_transactions').upsert(formattedTx);
      }

      // Reconciliação de transações deletadas
      try {
        const { data: remoteTx } = await supabase.from('financial_transactions').select('id');
        if (remoteTx) {
          const orphanTxIds = remoteTx.map((t) => t.id).filter((id) => !activeTxIds.includes(id));
          if (orphanTxIds.length > 0) {
            await supabase.from('financial_transactions').delete().in('id', orphanTxIds);
          }
        }
      } catch (err) {
        console.warn('Reconciliação de transações no Supabase:', err);
      }
    }

    return true;
  } catch (err) {
    console.error('Erro ao salvar no Supabase:', err);
    return false;
  } finally {
    setTimeout(() => {
      isSyncing = false;
    }, 1000);
  }
}

/**
 * Busca o banco completo salvo no Supabase (Single Source of Truth)
 */
export async function pullDatabaseFromSupabase(): Promise<DatabaseSchema | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('church_store')
      .select('data, updated_at')
      .eq('key', STORE_KEY)
      .maybeSingle();

    if (error) {
      console.warn('Erro ao consultar Supabase church_store:', error);
      return null;
    }

    if (data && data.data) {
      const rawDb = data.data as DatabaseSchema;
      const { sanitized, hasChanged } = sanitizeDatabase(rawDb);

      if (hasChanged) {
        pushDatabaseToSupabase(sanitized).catch(() => {});
      }
      return sanitized;
    }

    return null;
  } catch (err) {
    console.error('Erro ao ler do Supabase:', err);
    return null;
  }
}

/**
 * Escuta atualizações em tempo real no Supabase
 */
export function subscribeToSupabaseRealtime(
  onRemoteChange: (updatedDb: DatabaseSchema) => void
): () => void {
  if (!supabase || !isSupabaseConfigured) return () => {};

  try {
    const channel = supabase
      .channel('church_store_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'church_store' },
        (payload) => {
          if (isSyncing || Date.now() - lastSyncTimestamp < 1500) return;

          const newRow = payload.new as { key: string; data: DatabaseSchema };
          if (newRow && newRow.key === STORE_KEY && newRow.data) {
            const { sanitized } = sanitizeDatabase(newRow.data);
            onRemoteChange(sanitized);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  } catch (err) {
    console.error('Erro ao assinar canal em tempo real do Supabase:', err);
    return () => {};
  }
}

/**
 * Remove uma inscrição de evento diretamente no Supabase
 */
export async function deleteEventRegistrationFromSupabase(regId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('event_registrations').delete().eq('id', regId);
    if (error) {
      console.warn('Erro ao deletar inscrição no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao deletar inscrição no Supabase:', err);
    return false;
  }
}

/**
 * Remove um evento e todas as suas inscrições no Supabase
 */
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    await supabase.from('event_registrations').delete().eq('event_id', eventId);
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) {
      console.warn('Erro ao deletar evento no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao deletar evento no Supabase:', err);
    return false;
  }
}

/**
 * Remove um membro no Supabase
 */
export async function deleteMemberFromSupabase(memberId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('members').delete().eq('id', memberId);
    if (error) {
      console.warn('Erro ao deletar membro no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao deletar membro no Supabase:', err);
    return false;
  }
}

/**
 * Remove um pedido de oração no Supabase
 */
export async function deletePrayerFromSupabase(prayerId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('prayers').delete().eq('id', prayerId);
    if (error) {
      console.warn('Erro ao deletar oração no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao deletar oração no Supabase:', err);
    return false;
  }
}

/**
 * Remove uma transação financeira no Supabase
 */
export async function deleteTransactionFromSupabase(transactionId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('financial_transactions').delete().eq('id', transactionId);
    if (error) {
      console.warn('Erro ao deletar transação no Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Erro ao deletar transação no Supabase:', err);
    return false;
  }
}
