import { DatabaseSchema, ChurchEvent, EventRegistration, Member, CellGroup, PrayerRequest, FinancialTransaction } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const STORE_KEY = 'main_church_db';
let isSyncing = false;
let lastSyncTimestamp = 0;

/**
 * Salva e sincroniza o banco completo no Supabase
 */
export async function pushDatabaseToSupabase(data: DatabaseSchema): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    isSyncing = true;
    lastSyncTimestamp = Date.now();

    // 1. Snapshot centralizado para consistência e carregamento rápido
    const { error: storeError } = await supabase
      .from('church_store')
      .upsert({ key: STORE_KEY, data, updated_at: new Date().toISOString() });

    if (storeError) {
      console.warn('Erro ao sincronizar snapshot no Supabase church_store:', storeError);
    }

    // 2. Sincroniza tabelas relacionais de alta prioridade (para visualização no Supabase Dashboard)
    // Sincroniza Eventos
    if (data.events && data.events.length > 0) {
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
      await supabase.from('events').upsert(formattedEvents);

      // Sincroniza Inscrições de cada evento
      const allRegistrations: any[] = [];
      data.events.forEach((evt) => {
        (evt.registrations || []).forEach((r) => {
          allRegistrations.push({
            id: r.id,
            event_id: evt.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            ticket_type: (r as any).ticketType || null,
            price_paid: (r as any).pricePaid || 0,
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
    }

    // Sincroniza Pedidos de Oração
    if (data.prayers && data.prayers.length > 0) {
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
      await supabase.from('prayers').upsert(formattedPrayers);
    }

    // Sincroniza Membros (CRM)
    if (data.members && data.members.length > 0) {
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
      await supabase.from('members').upsert(formattedMembers);
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
 * Busca o banco completo salvo no Supabase
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
      return data.data as DatabaseSchema;
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
          // Ignora eventos gerados por este próprio cliente recente
          if (isSyncing || Date.now() - lastSyncTimestamp < 1500) return;

          const newRow = payload.new as { key: string; data: DatabaseSchema };
          if (newRow && newRow.key === STORE_KEY && newRow.data) {
            onRemoteChange(newRow.data);
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
