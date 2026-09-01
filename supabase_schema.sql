-- ==========================================================
-- SCHEMA SUPABASE: PORTAL E PLATAFORMA MACDP CENTRAL
-- Ministério Apostólico Caçadores da Presença
-- ==========================================================

-- 1. TABELA DE EVENTOS
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  end_date TEXT,
  time TEXT NOT NULL,
  end_time TEXT,
  location TEXT NOT NULL,
  room_reserved TEXT,
  description TEXT,
  image_url TEXT,
  speaker_name TEXT,
  total_capacity INTEGER DEFAULT 200,
  registered_count INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE,
  price NUMERIC DEFAULT 0,
  pix_key TEXT,
  organizer_contact TEXT,
  detailed_schedule TEXT,
  custom_questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE INSCRIÇÕES DOS EVENTOS
CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  ticket_type TEXT,
  price_paid NUMERIC DEFAULT 0,
  payment_method TEXT DEFAULT 'free',
  payment_status TEXT DEFAULT 'free',
  payment_notes TEXT,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  custom_answers JSONB DEFAULT '{}'::jsonb
);

-- 3. TABELA DE MEMBROS E VISITANTES (CRM)
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'ativo',
  role_in_church TEXT DEFAULT 'Membro',
  birth_date TEXT,
  baptism_date TEXT,
  membership_date TEXT,
  marital_status TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  ministries TEXT[] DEFAULT ARRAY[]::TEXT[],
  cell_group_id TEXT,
  spiritual_gifts TEXT[] DEFAULT ARRAY[]::TEXT[],
  attendance_rate INTEGER DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE CÉLULAS
CREATE TABLE IF NOT EXISTS cells (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_phone TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  target_audience TEXT DEFAULT 'Mista',
  members_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE PEDIDOS DE ORAÇÃO
CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  requester_name TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  phone TEXT,
  email TEXT,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  request_pastoral_contact BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'novo',
  pastoral_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE TRANSAÇÕES FINANCEIRAS
CREATE TABLE IF NOT EXISTS financial_transactions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'entrada' ou 'saida'
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  member_or_vendor TEXT,
  receipt_number TEXT,
  status TEXT DEFAULT 'confirmado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA AUXILIAR PARA SINCRONIZAÇÃO COMPLETA (ESTRUTURA GERAL)
CREATE TABLE IF NOT EXISTS church_store (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- Permite leitura e cadastro público pelo site, e gestão no painel
-- ==========================================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_store ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para leitura e inserção
CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Insert Event Registrations" ON event_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Event Registrations" ON event_registrations FOR SELECT USING (true);
CREATE POLICY "Public Update Event Registrations" ON event_registrations FOR UPDATE USING (true);

CREATE POLICY "Public Read Cells" ON cells FOR SELECT USING (true);
CREATE POLICY "Public Insert Members Self Registration" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Members" ON members FOR SELECT USING (true);
CREATE POLICY "Public Update Members" ON members FOR UPDATE USING (true);

CREATE POLICY "Public Insert Prayers" ON prayers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Prayers" ON prayers FOR SELECT USING (true);
CREATE POLICY "Public Update Prayers" ON prayers FOR UPDATE USING (true);

CREATE POLICY "Public Manage Transactions" ON financial_transactions FOR ALL USING (true);
CREATE POLICY "Public Manage Church Store" ON church_store FOR ALL USING (true);
CREATE POLICY "Public Manage Events" ON events FOR ALL USING (true);
